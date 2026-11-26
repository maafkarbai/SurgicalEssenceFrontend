import express from 'express';
import {salesStatuses} from './sales-store.js';

/** Mount inside the existing authenticated and CSRF-protected /admin router. */
export function createSalesRouter({repo}){
 const router=express.Router();
 router.use((req,res,next)=>{res.set({'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});if(!res.locals.user?.id)return res.status(401).send('Administrator sign-in required.');next();});
 const filters=req=>({q:String(req.query.q||'').slice(0,200),status:String(req.query.status||''),country:String(req.query.country||'').slice(0,100),from:String(req.query.from||''),to:String(req.query.to||''),page:Math.min(1000000,Math.max(1,Number.parseInt(req.query.page,10)||1)),limit:25});
 const render=(res,view,data)=>res.render(`admin/sales-${view}`,{user:null,csrf:'',error:'',message:'',...res.locals,statuses:salesStatuses,...data});
 for(const kind of ['quotes','leads']){
  router.get(`/${kind}/export`,async(req,res)=>{const csv=await repo.exportCsv(filters(req),res.locals.user.id,kind);res.type('text/csv').attachment(`${kind}-${new Date().toISOString().slice(0,10)}.csv`).send(csv);});
  router.get(`/${kind}`,async(req,res)=>{const current=filters(req),[result,counts]=await Promise.all([repo.list(current),repo.counts()]);render(res,'list',{kind,filters:current,result,counts});});
  router.get(`/${kind}/:id`,async(req,res)=>{const enquiry=await repo.detail(req.params.id);if(!enquiry)return res.status(404).send('Enquiry not found.');render(res,'detail',{kind,enquiry,message:req.query.saved?'Pipeline updated.':''});});
  router.post(`/${kind}/:id`,async(req,res)=>{await repo.update(req.params.id,req.body||{},res.locals.user.id);res.redirect(303,`/admin/${kind}/${encodeURIComponent(req.params.id)}?saved=1`);});
 }
 router.get('/sales/stats',async(req,res)=>res.json(await repo.counts()));
 router.use((error,req,res,next)=>{if(res.headersSent)return next(error);res.status(error.status||500).send(error.status&&error.status<500?error.message:'The enquiries could not be loaded. Please try again.');});
 return router;
}
