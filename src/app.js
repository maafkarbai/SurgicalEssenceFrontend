import express from 'express';
import ejs from 'ejs';
import {businessInfo} from './business-info.js';
import {createSeo,listingMetadata} from './seo.js';
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
import {createCloudNotificationHandler} from './cloud-notifications.js';
import {createCmsStore} from './cms/store.js';
import {createAdminRouter} from './cms/admin.js';
import {createMediaService} from './cms/media.js';
import {createEngagementStore} from './engagement-store.js';
import {createEngagementRouter} from './engagement-router.js';
import {createSalesStore} from './sales-store.js';
import {createNewsletterStore,createNewsletterRouter} from './newsletter.js';
import {withDatabase} from './database-queue.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const routes={
 '/contact':['Contact','Contact Surgical Essence | Business Enquiries','Contact Surgical Essence about surgical instrument sourcing, product references, documentation and business quotations.'],
 '/catalog':['Catalogues','Surgical Instrument PDF Catalogues | Surgical Essence','Browse surgical, dental, ophthalmic, beauty and single-use instrument PDF catalogues. Send references to discuss sourcing and documentation.'],
 '/distributor':['Distribution','Surgical Instrument Distribution Enquiries | Surgical Essence','Discuss surgical instrument sourcing for your distribution business. Share your territories, instrument ranges and purchasing requirements.'],
 '/press-releases':['Press releases','News & Press Releases | Surgical Essence','Read published news and updates from Surgical Essence.'],
 '/':['Home','Wholesale Surgical Instruments | Surgical Essence',business=>`Surgical instrument sourcing for distributors, importers and private-label buyers. Explore catalogues and request a business quotation from ${business.address.city}, ${business.address.country}.`],
 '/products':['Instruments','Surgical Instrument Catalogue | Surgical Essence','Search instrument names and reference numbers. Review sourced specifications, explore five catalogues and build your quotation list.'],
 '/oem-private-label':['OEM & private label','OEM & Private-label Enquiries | Surgical Essence','Discuss surgical instrument branding, packaging and sourcing requirements. Submit your product references, quantities and destination market.'],
 '/quality':['Quality & documentation','Quality & Documentation | Surgical Essence','Request instrument specifications and applicable quality documentation for your destination market before confirming your sourcing requirements.'],
 '/about':['About us','About Surgical Essence | Surgical Instrument Supplier',business=>`Meet Surgical Essence, a surgical instrument business in ${business.address.city}, ${business.address.country}, serving professional distributors, importers and procurement teams.`],
 '/request-quote':['Request a quote','Request a Surgical Instrument Quote | Surgical Essence','Send your instrument list, estimated quantities and sourcing requirements. Request a business quotation without creating an account.'],
 '/quote-list':['Your quote list','Your Instrument Quote List | Surgical Essence','Review your selected instruments and estimated quantities before submitting your quotation request.'],
 '/privacy':['Privacy','Enquiry Privacy Notice | Surgical Essence','How Surgical Essence handles contact information, quotation requirements and local quote-list storage.']
};
export function createApp(options={}) {
 const app=express(),siteUrl=(options.siteUrl||process.env.SITE_URL||(process.env.VERCEL_PROJECT_PRODUCTION_URL?'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL:'http://localhost:3000')).replace(/\/$/,'');
 app.locals.business=businessInfo;
 const whatsappNumber=String(options.whatsappNumber||process.env.WHATSAPP_NUMBER||'').replace(/[+\s()-]/g,'');
 app.locals.whatsappUrl=/^[1-9]\d{7,14}$/.test(whatsappNumber)?`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello, I would like to discuss surgical instrument sourcing.')}`:null;
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
 const cms=createCmsStore({db,cloud});
 const engagement=createEngagementStore({db,acceptedQuotes:true}),salesRepo=createSalesStore({db,cloud}),newsletter=createNewsletterStore({db});
 const media=createMediaService({repo:cms,dataDir,cloud});
 const seo=createSeo({cms,siteUrl,publicPaths:Object.keys(routes),extraEntries:async()=> (await engagement.pressSitemap()).map(item=>({path:'/press-releases/'+encodeURIComponent(item.slug),updatedAt:item.updatedAt,status:'published'}))});
 app.use(seo.middleware);
 app.disable('x-powered-by');app.set('trust proxy',Number(process.env.TRUST_PROXY_HOPS||0));
 app.set('view engine','ejs');app.set('views',join(root,'views'));
 app.use(helmet({referrerPolicy:{policy:'strict-origin-when-cross-origin'},contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'"],imgSrc:["'self'",'data:','blob:',...(/^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(process.env.BLOB_PUBLIC_HOST||'')?['https://'+process.env.BLOB_PUBLIC_HOST]:[])],fontSrc:["'self'"],formAction:["'self'"],upgradeInsecureRequests:production?[]:null}},strictTransportSecurity:production?undefined:false}));
 // Scheduled worker runs before catalogue readiness/body parsing; it accepts no buyer-supplied payload.
 app.all('/internal/rfq-notifications',createCloudNotificationHandler({store:db,env:options.notificationEnv||process.env,transportFactory:options.notificationTransportFactory}));
 app.use(express.static(join(root,'public'),{maxAge:production?'1d':0,index:false,dotfiles:'deny'}));
 app.use('/media',media.router);
 app.use((req,res,next)=>req.path.startsWith('/admin')?next():express.urlencoded({extended:false,limit:'32kb'})(req,res,next));
 app.use((req,res,next)=>req.path.startsWith('/admin')?next():express.json({limit:'32kb'})(req,res,next));
 const sign=t=>createHmac('sha256',secret).update(t).digest('hex');
 function validToken(token){if(typeof token!=='string')return false;const parts=token.split('.');if(parts.length!==3||!/^\d+$/.test(parts[0])||Date.now()-Number(parts[0])>86400000||Number(parts[0])>Date.now()||!/^[a-f0-9]{64}$/.test(parts[2]))return false;return timingSafeEqual(Buffer.from(sign(parts.slice(0,2).join('.'))),Buffer.from(parts[2]));}
 app.use(async(req,res,next)=>{
  if(req.path.startsWith('/admin'))res.set({'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});
  try {
   await cms.ready();
   res.locals.products=[];res.locals.categories=[];
   if(req.path==='/' || req.path==='/products'||req.path==='/catalog')res.locals.categories=await cms.categories();
   if(req.path==='/'){
    const featured=await cms.products({featured:true,limit:3});
    res.locals.products=featured.items.length?featured.items:(await cms.products({limit:1})).items;
   }
   next();
  }catch(error){console.error(JSON.stringify({event:'catalogue_startup_failed',code:/^[A-Z0-9_]{1,40}$/.test(error?.code||'')?error.code:'UNAVAILABLE',reason:/tenant or user not found/i.test(error?.message||'')?'TENANT_NOT_FOUND':/circuit breaker/i.test(error?.message||'')?'CONNECTION_REJECTED':/password authentication failed/i.test(error?.message||'')?'AUTHENTICATION_FAILED':'DATABASE_UNAVAILABLE'}));if(req.get('Accept')?.includes('application/json'))return res.status(503).json({ok:false,message:'Catalogue temporarily unavailable. Please try again shortly.'});res.status(503).type('html').send(`<h1>Catalogue temporarily unavailable</h1><p>Please try again shortly or contact ${ejs.escapeXML(app.locals.business.email)}.</p>`);}
 });
 app.use((req,res,next)=>{
  const cookie=req.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith('se_csrf='))?.slice(8);
  req.csrfCookie=cookie;
  if(req.path==='/request-quote') {
   const raw=`${Date.now()}.${randomBytes(24).toString('hex')}`;
   res.locals.csrf=validToken(cookie)?cookie:`${raw}.${sign(raw)}`;
   if(req.method==='GET')res.cookie('se_csrf',res.locals.csrf,{httpOnly:true,sameSite:'strict',secure:production,maxAge:86400000,path:'/'});
   res.set('Cache-Control','no-store');
  }
  Object.assign(res.locals,{path:req.path,buyerTypes,siteUrl,errors:{},values:{},requestId:randomUUID(),csrf:res.locals.csrf||'',noindex:false});next();
 });
 function render(req,res,view,extra={},status=200){
  const meta=routes[req.path]||['Page not found','Page Not Found | Surgical Essence','The requested page could not be found. Browse instruments or contact Surgical Essence.'];
  const noindex=Boolean(seo.preview||extra.noindex||status>=400);
  if(noindex)res.set('X-Robots-Tag','noindex, follow');
  res.status(status).render('layout',{view,title:meta[1],description:typeof meta[2]==='function'?meta[2](app.locals.business):meta[2],label:meta[0],canonical:siteUrl+req.path,...extra,noindex});
 }
 app.use('/admin',createAdminRouter({repo:cms,secret,production,siteUrl,media,engagement,salesRepo,newsletter,previewProduct:(req,res,product)=>render(req,res,'product',{product,label:product.name,title:'Preview: '+product.name,description:product.shortDescription||product.name,noindex:true})}));
 app.use(createEngagementRouter({repo:engagement,secret,production,siteUrl,render}));
 app.use(createNewsletterRouter({repo:newsletter,secret,production,siteUrl}));
 app.get('/my-account',(req,res)=>res.redirect(301,'/account'));
 app.get('/',(req,res)=>render(req,res,'home'));
 app.get('/products',async(req,res)=>{
  if(typeof req.query.cat==='string'&&res.locals.categories.some(c=>c.id===req.query.cat))return res.redirect(301,'/products?category='+encodeURIComponent(req.query.cat));
  const q=typeof req.query.q==='string'?req.query.q.slice(0,160):'',category=typeof req.query.category==='string'?req.query.category.slice(0,160):'',type=typeof req.query.type==='string'?req.query.type.slice(0,200):'';
  const selectedCategory=res.locals.categories.find(c=>c.slug===category||c.id===category);
  const rawPage=req.query.page;
  const invalidFilters=['q','category','type'].some(key=>req.query[key]!==undefined&&typeof req.query[key]!=='string');
  const invalidPage=rawPage!==undefined&&(typeof rawPage!=='string'||!/^[1-9]\d*$/.test(rawPage)||Number(rawPage)>1000000);
  if(invalidFilters||invalidPage||(category&&!selectedCategory))return render(req,res,'not-found',{noindex:true},404);
  const page=rawPage===undefined?1:Number(rawPage);
  const [result,summary]=await Promise.all([cms.products({q,category,type,page,limit:24}),cms.catalogueSummary()]);
  if(page>result.pages)return render(req,res,'not-found',{noindex:true},404);
  render(req,res,'products',{q,category,type,result,summary,results:result.items,...listingMetadata({siteUrl,category,q,type,page,result,selectedCategory})});
 });
 app.get('/products/:code',async(req,res)=>{
  const product=await cms.product(req.params.code);
  if(!product){const target=await cms.redirect(req.params.code);if(target)return res.redirect(301,'/products/'+encodeURIComponent(target));}
  if(product&&product.slug!==req.params.code)return res.redirect(301,'/products/'+encodeURIComponent(product.slug));
  if(!product)return render(req,res,'not-found',{noindex:true},404);
  const related=(await cms.products({category:product.category,limit:4})).items.filter(p=>p.id!==product.id).slice(0,3);
  render(req,res,'product',{product,related,label:product.name,title:product.seoTitle||`${product.name} ${product.code} | Surgical Essence`,description:product.metaDescription||product.shortDescription||`Review ${product.name}, reference ${product.code}. Add this instrument to a quotation request.`});
 });
 for(const [path,view] of [['/oem-private-label','oem'],['/quality','quality'],['/about','about'],['/quote-list','quote-list'],['/privacy','privacy']])app.get(path,(req,res)=>render(req,res,view,{noindex:path==='/quote-list'}));
 for(const [path,view] of [['/contact','contact'],['/catalog','catalog'],['/distributor','distributor']])app.get(path,(req,res)=>render(req,res,view));
 app.get('/request-quote',(req,res)=>{
  const intent=['distributor','catalogue','documentation','oem','contact'].includes(req.query.intent)?req.query.intent:'quote';
  render(req,res,'rfq',{noindex:true,values:{intent,buyerType:intent==='distributor'?'Distributor':'',oem:intent==='oem'?'Please discuss private-label requirements.':'',products:intent==='documentation'?'Quality documentation enquiry':intent==='catalogue'?'Catalogue assistance and email request':intent==='distributor'?'Distribution sourcing enquiry':intent==='contact'?'Business enquiry':''}});
 });
 // Memory burst limiter plus durable hourly limit. IP is HMAC-hashed, not logged.
 const limiter=rateLimit({windowMs:60000,limit:options.rateLimit||10,standardHeaders:'draft-8',legacyHeaders:false,handler:(req,res)=>render(req,res,'message',{heading:'Please wait a moment',message:`Too many requests were received. Please try again in a minute or email ${app.locals.business.email}.`,noindex:true},429)});
 app.post('/request-quote',limiter,async(req,res)=>{
  const json=req.get('Accept')?.includes('application/json');
  const fail=(status,message,errors={})=>json?res.status(status).json({ok:false,message,errors}):render(req,res,'rfq',{errors:{...errors,...(Object.keys(errors).length?{}:{form:message})},values:req.body||{},requestId:typeof req.body?.requestId==='string'?req.body.requestId:randomUUID(),noindex:true},status);
  const body=req.body||{};
  const origins=[new URL(siteUrl).origin,...[process.env.VERCEL_URL,process.env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).map(host=>'https://'+host)];
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
   for(const item of result.data.items){
    const product=await cms.product(item.code);
    if(!product)return fail(422,'Please review the quote list.',{items:'An instrument is no longer published. Remove it from your list or describe it in your message.'});
    Object.assign(item,{productId:product.id,name:product.name,slug:product.slug,length:product.length,material:product.material||''});
   }
   if(req.buyer)result.data.buyerAccountId=req.buyer.id;
   const saved=db.save?await db.save(result.data):await withDatabase(db,()=>saveRfq(db,result.data));
   if(json)return res.status(saved.duplicate?200:201).json({ok:true,...saved});
   return render(req,res,'success',{reference:saved.reference,noindex:true},saved.duplicate?200:201);
  } catch(e){
   if(e.code==='CONFLICT')return fail(409,'This request was already submitted with different details. Reload the form to start a new enquiry.');
   console.error(JSON.stringify({event:'rfq_storage_failed',code:typeof e.code==='string'?e.code:'unknown'}));return fail(503,`Your request could not be saved. Please try again or email ${app.locals.business.email}.`);
  }
 });
 const redirects={'/favicon.ico':'/favicon.svg','/catalogue':'/catalog','/quality-control':'/quality','/certifications':'/quality','/distributors':'/distributor','/privacy-policy':'/privacy','/sitemap':'/sitemap.xml'};
 for(const [old,target] of Object.entries(redirects))app.get(old,(req,res)=>res.redirect(301,target));
 app.get('/robots.txt',seo.robots);
 app.get('/sitemap.xml',seo.sitemap);
 app.get('/sitemaps/:number.xml',seo.shard);
 app.use((req,res)=>render(req,res,'not-found',{noindex:true},404));
 app.use((err,req,res,next)=>{
  const tooLarge=err.type==='entity.too.large';
  console.error(JSON.stringify({event:tooLarge?'payload_limit':'request_error'}));
  if(req.get('Accept')?.includes('application/json'))return res.status(tooLarge?413:500).json({ok:false,message:'Unable to process this request.'});
  // Body-parser errors occur before locals are assigned.
  res.status(tooLarge?413:500).type('html').send(`<html lang="en"><title>Request could not be processed</title><h1>${tooLarge?'Request too large':'Request could not be processed'}</h1><p>Please shorten your message and try again.</p><a href="/request-quote">Return to the enquiry form</a></html>`);
 });
 return {app,db,cms,engagement,salesRepo,newsletter};
}
