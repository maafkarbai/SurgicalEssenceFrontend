import express from 'express';
import {rateLimit} from 'express-rate-limit';
import {randomToken,tokenHash,equal,signedToken,validSignedToken} from './cms/auth.js';

const cookieName='se_buyer_session';
const cookies=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(part=>part.trim().split('=')).filter(parts=>parts.length===2));
function sameOrigin(req,siteUrl){const origin=req.get('Origin');return req.get('Sec-Fetch-Site')!=='cross-site'&&(!origin||origin===new URL(siteUrl).origin);}
export function buyerSessionMiddleware({repo}){return async(req,res,next)=>{try{const raw=cookies(req)[cookieName];const session=raw&&/^[A-Za-z0-9_-]{43}$/.test(raw)?await repo.session(tokenHash(raw)):null;req.buyerSession=session||null;req.buyer=session?{id:session.buyerId,name:session.name,email:session.email}:null;res.locals.buyer=req.buyer;next();}catch(error){next(error);}};}

/** Mount at root after global body parsing and render locals, before the 404 handler. */
export function createEngagementRouter({repo,secret,production=false,siteUrl,render}){
 if(typeof secret!=='string'||secret.length<32)throw new Error('Buyer forms require a secret of at least 32 characters.');
 const router=express.Router(),options={httpOnly:true,sameSite:'strict',secure:production,path:'/',maxAge:7*86400000};
 function page(req,res,view,data={},status=200){const defaults={error:'',csrf:'',label:'Buyer account',title:'Buyer Account | Surgical Essence',description:'Manage your Surgical Essence buyer account and quotation history.',canonical:siteUrl+req.path,noindex:true,...data};if(render)return render(req,res,`engagement/${view}`,defaults,status);return res.status(status).render(`engagement/${view}`,{...res.locals,...defaults});}
 router.use(['/account','/press-releases'],(req,res,next)=>{if(req.baseUrl.toLowerCase()==='/account')res.set({'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});if(production&&!req.secure)return res.status(400).send('HTTPS is required.');next();});
 router.use(buyerSessionMiddleware({repo}));
 router.use('/account',express.urlencoded({extended:false,limit:'32kb'}));
 const burst=rateLimit({windowMs:900000,limit:30,standardHeaders:'draft-8',legacyHeaders:false,message:'Too many account attempts. Try again in 15 minutes.'});
 function loginForm(req,res,mode,error='',status=200){const token=signedToken(secret);res.cookie('se_buyer_form',token,{...options,maxAge:3600000});return page(req,res,'auth',{mode,csrf:token,error,label:mode==='register'?'Create a buyer account':'Buyer sign in'},status);}
 function formValid(req){const token=cookies(req).se_buyer_form;return sameOrigin(req,siteUrl)&&validSignedToken(token,secret)&&equal(token,req.body?._csrf);}
 async function reserve(req){return repo.consumeAttempt(tokenHash(`buyer-auth:${req.ip||'unknown'}`));}
 async function signIn(req,res,buyer){if(req.buyerSession)await repo.deleteSession(req.buyerSession.hash);const token=randomToken();await repo.createSession({hash:tokenHash(token),buyerId:buyer.id,csrf:randomToken(),expiresAt:Date.now()+options.maxAge,expectedPasswordHash:buyer.passwordHash});res.clearCookie('se_buyer_form',options);res.cookie(cookieName,token,options);return res.redirect(303,'/account');}
 router.get('/account/register',(req,res)=>loginForm(req,res,'register'));
 router.get('/account/login',(req,res)=>loginForm(req,res,'login'));
 router.post('/account/register',burst,async(req,res)=>{if(!formValid(req))return res.status(403).send('Your form expired. Reload the page and try again.');if(!await reserve(req))return loginForm(req,res,'register','Too many attempts. Try again in 15 minutes.',429);try{const buyer=await repo.registerBuyer(req.body||{});return signIn(req,res,buyer);}catch(error){if(!error.status&&error.message!=='Use a password between 12 and 256 characters.')throw error;return loginForm(req,res,'register',error.message,error.status||422);}});
 router.post('/account/login',burst,async(req,res)=>{if(!formValid(req))return res.status(403).send('Your form expired. Reload the page and try again.');if(!await reserve(req))return loginForm(req,res,'login','Too many attempts. Try again in 15 minutes.',429);const buyer=await repo.authenticate(req.body?.email,req.body?.password);if(!buyer)return loginForm(req,res,'login','Email or password is incorrect.',401);return signIn(req,res,buyer);});
 router.use('/account',(req,res,next)=>{if(!req.buyerSession)return res.redirect(303,'/account/login');if(!['GET','HEAD','OPTIONS'].includes(req.method)&&(!sameOrigin(req,siteUrl)||!equal(req.buyerSession.csrf,req.body?._csrf)))return res.status(403).send('Your form expired. Reload the page and try again.');next();});
 router.get(['/account','/account/history'],async(req,res)=>page(req,res,'account',{buyer:req.buyer,csrf:req.buyerSession.csrf,history:await repo.quoteHistory(req.buyer.id,{page:Math.max(1,Math.min(1000000,Number.parseInt(req.query.page,10)||1))})}));
 router.post('/account/logout',async(req,res)=>{await repo.deleteSession(req.buyerSession.hash);res.clearCookie(cookieName,options);return res.redirect(303,'/account/login');});
 router.post('/account/password',burst,async(req,res)=>{if(!await reserve(req))return res.status(429).send('Too many attempts. Try again in 15 minutes.');try{await repo.changePassword(req.buyer.id,req.body.currentPassword,req.body.password);res.clearCookie(cookieName,options);return res.redirect(303,'/account/login');}catch(error){if(!error.status&&error.message!=='Use a password between 12 and 256 characters.')throw error;return page(req,res,'account',{buyer:req.buyer,csrf:req.buyerSession.csrf,history:await repo.quoteHistory(req.buyer.id),error:error.message},error.status||422);}});
 router.get('/press-releases',async(req,res)=>page(req,res,'press-list',{items:await repo.pressList(),label:'Press releases',title:'Press Releases | Surgical Essence',description:'Read published updates from Surgical Essence.',noindex:false}));
 router.get('/press-releases/:slug',async(req,res)=>{const item=await repo.press(req.params.slug);if(!item)return res.status(404).send('Press release not found.');if(item.slug!==req.params.slug)return res.redirect(301,'/press-releases/'+encodeURIComponent(item.slug));return page(req,res,'press',{item,label:item.title,title:item.title+' | Surgical Essence',description:item.content.slice(0,160),noindex:false});});
 return router;
}

/** Mount INSIDE createAdminRouter, after its authentication middleware. */
export function createPressAdminRouter({repo,siteUrl}){
 const router=express.Router();
 router.use((req,res,next)=>{res.set({'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});if(!req.admin?.id)return res.sendStatus(401);if(!['GET','HEAD','OPTIONS'].includes(req.method)&&(!sameOrigin(req,siteUrl)||!equal(res.locals.csrf,req.body?._csrf)))return res.status(403).send('Your form expired. Reload the page and try again.');next();});
 const render=(res,data={})=>res.render('engagement/press-admin',{csrf:res.locals.csrf,error:'',item:{},...data});
 router.get('/',async(req,res)=>render(res,{items:await repo.pressList({all:true})}));
 router.get('/:id/edit',async(req,res)=>{const item=await repo.press(req.params.id,{all:true});if(!item)return res.sendStatus(404);render(res,{items:await repo.pressList({all:true}),item});});
 router.post('/save',async(req,res)=>{try{await repo.savePress(req.body,req.admin.id);res.redirect(303,'/admin/press-releases');}catch(error){if(!error.status)throw error;res.status(error.status);render(res,{items:await repo.pressList({all:true}),item:req.body,error:error.message});}});
 router.post('/:id/delete',async(req,res)=>{await repo.deletePress(req.params.id,req.body.revision,req.admin.id);res.redirect(303,'/admin/press-releases');});
 return router;
}
