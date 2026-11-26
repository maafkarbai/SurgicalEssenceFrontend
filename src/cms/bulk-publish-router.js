import express from 'express';

export function createBulkPublishRouter({repo}){
 const router=express.Router();
 // The parent admin router enforces the session and CSRF for every mutation.
 router.use((req,res,next)=>{if(!req.admin)return res.sendStatus(401);res.set('Cache-Control','no-store');next();});
 router.post('/prepare',async(req,res)=>res.status(201).json(await repo.bulkPublishPrepare(req.body,req.admin.id)));
 router.get('/:id',async(req,res)=>{
  const page=req.query.page===undefined?1:Number(req.query.page);
  res.json(await repo.bulkPublishGet(req.params.id,req.admin.id,{page,issuesOnly:req.query.issues==='1'}));
 });
 for(const [path,method] of [['confirm','bulkPublishConfirm'],['advance','bulkPublishAdvance'],['cancel','bulkPublishCancel']]){
  router.post(`/:id/${path}`,async(req,res)=>res.json(await repo[method](req.params.id,req.admin.id)));
 }
 router.use((error,req,res,next)=>{
  if(res.headersSent)return next(error);
  const expected=error.status>=400&&error.status<500;
  if(!expected)console.error('Bulk publishing unavailable:',/^[A-Z0-9_]+$/.test(error.code||'')?error.code:'STORAGE_ERROR');
  res.status(expected?error.status:503).json({error:expected?error.message:'Publishing could not be completed. Reload the page to check progress and resume.'});
 });
 return router;
}
