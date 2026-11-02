import express from 'express';
import helmet from 'helmet';
import {rateLimit} from 'express-rate-limit';
import {randomBytes,randomUUID,createHmac,timingSafeEqual,createHash} from 'node:crypto';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {categories,products,searchProducts} from './catalogue.js';
import {buyerTypes,validateRfq} from './rfq.js';
import {openStore,saveRfq} from './store.js';
import {createPostgresStore} from './postgres-store.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const routes={
 '/':['Home','Wholesale Surgical Instruments | Surgical Essence','Surgical instrument sourcing for distributors, importers and private-label buyers. Explore catalogues and request a business quotation from Sialkot, Pakistan.'],
 '/products':['Instruments','Surgical Instrument Catalogue | Surgical Essence','Search instrument names and reference numbers. Review sourced specifications, explore five catalogues and build your quotation list.'],
 '/oem-private-label':['OEM & private label','OEM & Private-label Enquiries | Surgical Essence','Discuss surgical instrument branding, packaging and sourcing requirements. Submit your product references, quantities and destination market.'],
 '/quality':['Quality & documentation','Quality & Documentation | Surgical Essence','Request instrument specifications and applicable quality documentation for your destination market before confirming your sourcing requirements.'],
 '/about':['About us','About Surgical Essence | Surgical Instrument Supplier','Meet Surgical Essence, a surgical instrument business in Sialkot, Pakistan, serving professional distributors, importers and procurement teams.'],
 '/request-quote':['Request a quote','Request a Surgical Instrument Quote | Surgical Essence','Send your instrument list, estimated quantities and sourcing requirements. Request a business quotation without creating an account.'],
 '/quote-list':['Your quote list','Your Instrument Quote List | Surgical Essence','Review your selected instruments and estimated quantities before submitting your quotation request.'],
 '/privacy':['Privacy','Enquiry Privacy Notice | Surgical Essence','How Surgical Essence handles contact information, quotation requirements and local quote-list storage.']
};
export function createApp(options={}) {
 const app=express(),siteUrl=(options.siteUrl||process.env.SITE_URL||(process.env.VERCEL_PROJECT_PRODUCTION_URL?'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL:'http://localhost:3000')).replace(/\/$/,'');
 const production=process.env.NODE_ENV==='production';
 if(production&&!siteUrl.startsWith('https://'))throw new Error('Production SITE_URL must use HTTPS.');
 const dataDir=resolve(options.dataDir||process.env.DATA_DIR||join(root,'data'));
 const cloud=Boolean(process.env.VERCEL)&&!options.dataDir;
 const databaseUrl=/^postgres(ql)?:/.test(process.env.DATABASE_URL||'')?process.env.DATABASE_URL:process.env.DIRECT_URL;
 const db=options.store||(cloud?createPostgresStore(databaseUrl):openStore(dataDir)),secretFile=join(dataDir,'csrf.secret');
 let secret;
 if(cloud){
  if(!process.env.CSRF_SECRET&&!databaseUrl)throw new Error('Configure DATABASE_URL and CSRF_SECRET for Vercel.');
  secret=process.env.CSRF_SECRET||createHash('sha256').update('se-csrf:'+databaseUrl).digest('hex');
 }else{
  if(!existsSync(secretFile))writeFileSync(secretFile,randomBytes(32).toString('hex'),{mode:0o600,flag:'wx'});
  secret=readFileSync(secretFile,'utf8');
 }
 app.disable('x-powered-by');app.set('trust proxy',Number(process.env.TRUST_PROXY_HOPS||0));
 app.set('view engine','ejs');app.set('views',join(root,'views'));
 app.use(helmet({referrerPolicy:{policy:'strict-origin-when-cross-origin'},contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'"],imgSrc:["'self'",'data:'],fontSrc:["'self'"],formAction:["'self'"],upgradeInsecureRequests:production?[]:null}},strictTransportSecurity:production?undefined:false}));
 app.use(express.static(join(root,'public'),{maxAge:production?'1d':0,index:false,dotfiles:'deny'}));
 app.use(express.urlencoded({extended:false,limit:'32kb'}));app.use(express.json({limit:'32kb'}));
 const sign=t=>createHmac('sha256',secret).update(t).digest('hex');
 function validToken(token){if(typeof token!=='string')return false;const parts=token.split('.');if(parts.length!==3||!/^\d+$/.test(parts[0])||Date.now()-Number(parts[0])>86400000||Number(parts[0])>Date.now()||!/^[a-f0-9]{64}$/.test(parts[2]))return false;return timingSafeEqual(Buffer.from(sign(parts.slice(0,2).join('.'))),Buffer.from(parts[2]));}
 app.use((req,res,next)=>{
  const cookie=req.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith('se_csrf='))?.slice(8);
  req.csrfCookie=cookie;
  if(req.path==='/request-quote') {
   const raw=`${Date.now()}.${randomBytes(24).toString('hex')}`;
   res.locals.csrf=validToken(cookie)?cookie:`${raw}.${sign(raw)}`;
   if(req.method==='GET')res.cookie('se_csrf',res.locals.csrf,{httpOnly:true,sameSite:'strict',secure:production,maxAge:86400000,path:'/'});
   res.set('Cache-Control','no-store');
  }
  Object.assign(res.locals,{path:req.path,categories,products,buyerTypes,siteUrl,errors:{},values:{},requestId:randomUUID(),csrf:res.locals.csrf||'',noindex:false});next();
 });
 function render(req,res,view,extra={},status=200){
  const meta=routes[req.path]||['Page not found','Page Not Found | Surgical Essence','The requested page could not be found. Browse instruments or contact Surgical Essence.'];
  res.status(status).render('layout',{view,title:meta[1],description:meta[2],label:meta[0],canonical:siteUrl+req.path,...extra});
 }
 app.get('/',(req,res)=>render(req,res,'home'));
 app.get('/products',(req,res)=>{
  if(typeof req.query.cat==='string'&&categories.some(c=>c.id===req.query.cat))return res.redirect(301,'/products?category='+encodeURIComponent(req.query.cat));
  const q=typeof req.query.q==='string'?req.query.q.slice(0,160):'',category=typeof req.query.category==='string'?req.query.category:'',type=typeof req.query.type==='string'?req.query.type:'';
  render(req,res,'products',{q,category,type,results:searchProducts(q,category,type),noindex:Boolean(q||type),canonical:siteUrl+'/products'});
 });
 app.get('/products/:code',(req,res)=>{
  const product=products.find(p=>p.code===req.params.code);
  if(!product)return render(req,res,'not-found',{noindex:true},404);
  render(req,res,'product',{product,label:product.name,title:`${product.name} ${product.code} | Surgical Essence`,description:`Review ${product.name}, reference ${product.code}, ${product.length}. View the source catalogue and add this instrument to a quotation request.`});
 });
 for(const [path,view] of [['/oem-private-label','oem'],['/quality','quality'],['/about','about'],['/quote-list','quote-list'],['/privacy','privacy']])app.get(path,(req,res)=>render(req,res,view,{noindex:path==='/quote-list'}));
 app.get('/request-quote',(req,res)=>render(req,res,'rfq',{noindex:true,values:{oem:req.query.intent==='oem'?'Please discuss private-label requirements.':'',products:req.query.intent==='documentation'?'Quality documentation enquiry':req.query.intent==='catalogue'?'Catalogue enquiry':''}}));
 // Memory burst limiter plus durable hourly limit. IP is HMAC-hashed, not logged.
 const limiter=rateLimit({windowMs:60000,limit:options.rateLimit||10,standardHeaders:'draft-8',legacyHeaders:false,handler:(req,res)=>render(req,res,'message',{heading:'Please wait a moment',message:'Too many requests were received. Please try again in a minute or email info@surgicalessence.com.',noindex:true},429)});
 app.post('/request-quote',limiter,async(req,res)=>{
  const json=req.get('Accept')?.includes('application/json');
  const fail=(status,message,errors={})=>json?res.status(status).json({ok:false,message,errors}):render(req,res,'rfq',{errors:{...errors,...(Object.keys(errors).length?{}:{form:message})},values:req.body||{},requestId:typeof req.body?.requestId==='string'?req.body.requestId:randomUUID(),noindex:true},status);
  const body=req.body||{};
  const origins=[new URL(siteUrl).origin,...(process.env.VERCEL_URL?['https://'+process.env.VERCEL_URL]:[])];
  if(!validToken(req.csrfCookie)||body._csrf!==req.csrfCookie||(req.get('Origin')&&!origins.includes(req.get('Origin'))))return fail(403,'Your form session expired. Reload this page and try again.');
  try {
   const ip=createHmac('sha256',secret).update(req.ip||'unknown').digest('hex');
   let count;
   if(db.limit)count=await db.limit(ip);
   else{
   db.prepare('DELETE FROM rate_limits WHERE expires < ?').run(Date.now());
   db.prepare('INSERT INTO rate_limits(ip_hash,count,expires) VALUES(?,1,?) ON CONFLICT(ip_hash) DO UPDATE SET count=count+1').run(ip,Date.now()+3600000);
   count=db.prepare('SELECT count FROM rate_limits WHERE ip_hash=?').get(ip).count;
   }
   if(count>(options.rateLimit||20))return fail(429,'Hourly enquiry limit reached. Please try again later or email our team.');
   const result=validateRfq(body);
   if(result.errors)return fail(422,'Please review the highlighted fields.',result.errors);
   const saved=db.save?await db.save(result.data):saveRfq(db,result.data);
   if(json)return res.status(saved.duplicate?200:201).json({ok:true,...saved});
   return render(req,res,'success',{reference:saved.reference,noindex:true},saved.duplicate?200:201);
  } catch(e){
   if(e.code==='CONFLICT')return fail(409,'This request was already submitted with different details. Reload the form to start a new enquiry.');
   console.error(JSON.stringify({event:'rfq_storage_failed'}));return fail(503,'Your request could not be saved. Please try again or email info@surgicalessence.com.');
  }
 });
 const redirects={'/contact':'/request-quote','/catalog':'/products','/catalogue':'/products','/quality-control':'/quality','/certifications':'/quality','/distributor':'/request-quote','/distributors':'/oem-private-label','/privacy-policy':'/privacy','/sitemap':'/sitemap.xml'};
 for(const [old,target] of Object.entries(redirects))app.get(old,(req,res)=>res.redirect(301,target));
 app.get('/robots.txt',(req,res)=>res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /quote-list\nDisallow: /request-quote\nSitemap: ${siteUrl}/sitemap.xml\n`));
 app.get('/sitemap.xml',(req,res)=>res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...Object.keys(routes).filter(p=>!['/quote-list','/request-quote'].includes(p)),...products.map(p=>'/products/'+p.code)].map(p=>`<url><loc>${siteUrl}${p}</loc></url>`).join('')}</urlset>`));
 app.use((req,res)=>render(req,res,'not-found',{noindex:true},404));
 app.use((err,req,res,next)=>{
  const tooLarge=err.type==='entity.too.large';
  console.error(JSON.stringify({event:tooLarge?'payload_limit':'request_error'}));
  if(req.get('Accept')?.includes('application/json'))return res.status(tooLarge?413:500).json({ok:false,message:'Unable to process this request.'});
  // Body-parser errors occur before locals are assigned.
  res.status(tooLarge?413:500).type('html').send(`<html lang="en"><title>Request could not be processed</title><h1>${tooLarge?'Request too large':'Request could not be processed'}</h1><p>Please shorten your message and try again.</p><a href="/request-quote">Return to the enquiry form</a></html>`);
 });
 return {app,db};
}
