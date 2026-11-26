import {randomUUID} from 'node:crypto';
import {isSourceReviewed,assertSourceReviewed} from './source-review.js';

const MAX_PRODUCTS=10000, BATCH_SIZE=20, PREVIEW_AGE=30*60*1000;
function reject(message,status=400){throw Object.assign(new Error(message),{status});}
function owner(actor){if(typeof actor!=='string'||!actor)reject('Administrator authentication is required.',401);return actor;}
function number(value,label,max){if(!Number.isSafeInteger(value)||value<1||value>max)reject(`Invalid ${label}.`);return value;}
function filtersFrom(input={}){
 if(!input||typeof input!=='object'||Array.isArray(input))reject('Invalid filters.');
 const result={};for(const [key,max] of [['q',160],['category',160],['status',20]]){
  const value=input[key]??'';if(typeof value!=='string'||value.length>max)reject(`Invalid ${key} filter.`);result[key]=value.trim();
 }
 if(result.status&&!['draft','published','archived'].includes(result.status))reject('Invalid status filter.');return result;
}

// Uses the parent store's transaction queue and SQL adapter for both databases.
export function createBulkPublishStore({read,ready,transaction,audit,productFilter,assertPublicationCategory,hydrate}){
 async function owned(sql,id,actor){
  owner(actor);if(typeof id!=='string'||id.length>100)reject('Publish job not found.',404);
  const job=(await sql.rows('SELECT * FROM se_cms_publish_jobs WHERE id=? AND admin_id=?',[id,actor]))[0];
  if(!job)reject('Publish job not found.',404);return job;
 }
 async function present(sql,job,{page=1,issuesOnly=false}={}){
  page=number(page,'result page',10000);
  const grouped=await sql.rows('SELECT status,count(*) AS n FROM se_cms_publish_rows WHERE job_id=? GROUP BY status',[job.id]);
  const counts={published:0,skipped:0,failed:0,pending:0};for(const row of grouped)counts[row.status]=Number(row.n);
  const resultTotal=issuesOnly?counts.failed+counts.skipped:Number(job.total),pages=Math.max(1,Math.ceil(resultTotal/50));page=Math.min(page,pages);
  const items=await sql.rows(`SELECT product_id,code,name,status,reason FROM se_cms_publish_rows WHERE job_id=?${issuesOnly?" AND status IN ('failed','skipped')":''} ORDER BY row_index LIMIT 50 OFFSET ?`,[job.id,(page-1)*50]);
  return {id:job.id,status:job.status,total:Number(job.total),eligible:Number(job.eligible),filters:JSON.parse(job.filters),...counts,processed:counts.published+counts.skipped+counts.failed,items:items.map(r=>({id:r.product_id,sku:r.code,name:r.name,status:r.status,reason:r.reason})),page,pages,resultTotal};
 }
 async function bulkPublishPrepare(input,actor){
  owner(actor);if(!input||!['selected','all'].includes(input.mode))reject('Choose selected products or all matching products.');
  const filters=filtersFrom(input.filters);let selection;
  if(input.mode==='selected'){
   if(!Array.isArray(input.selection)||!input.selection.length||input.selection.length>MAX_PRODUCTS)reject(`Select 1–${MAX_PRODUCTS.toLocaleString('en-US')} products.`);
   const seen=new Set();selection=input.selection.map(item=>{
    if(!item||typeof item.id!=='string'||!item.id||item.id.length>100||seen.has(item.id))reject('Invalid or duplicate product selection.');
    seen.add(item.id);return {id:item.id,revision:number(item.revision,'product revision',2147483647)};
   });
  }
  await ready();return transaction(async sql=>{
   const now=Date.now();const active=Number((await sql.rows("SELECT count(*) n FROM se_cms_publish_jobs WHERE admin_id=? AND (status='running' OR (status='preview' AND created_at>?))",[actor,now-PREVIEW_AGE]))[0].n);
   if(active>=20)reject('Finish or cancel an existing publishing job first.',409);
   const {filter,args}=productFilter({...filters,all:true});
   const selected=selection?`${filter?' AND':' WHERE'} p.id IN (${selection.map(()=>'?').join(',')})`:'';
   const matches=await sql.rows(`SELECT p.*,c.slug AS category_slug,c.status AS category_status FROM se_cms_products p JOIN se_cms_categories c ON c.id=p.category_id${filter}${selected} ORDER BY p.id LIMIT ${MAX_PRODUCTS+1}`,[...args,...(selection?.map(p=>p.id)||[])]);
   if(matches.length>MAX_PRODUCTS)reject('Select at most 10,000 products per job. Narrow the filters and try again.');
   const byId=new Map(matches.map(p=>[p.id,p]));
   const rows=selection?selection.map(s=>({...byId.get(s.id),id:s.id,revision:s.revision})):matches;
   if(!rows.length)reject('No products match these filters.');
   const reviewed=new Set((await hydrate(sql,matches)).filter(isSourceReviewed).map(p=>p.id));
   const eligible=rows.filter(p=>reviewed.has(p.id)&&p.status==='draft'&&p.category_status==='published'&&Number(p.revision)===Number(byId.get(p.id)?.revision)).length;
   const id=randomUUID();await sql.run("INSERT INTO se_cms_publish_jobs(id,admin_id,status,total,eligible,filters,created_at,updated_at) VALUES(?,?,'preview',?,?,?,?,?)",[id,actor,rows.length,eligible,JSON.stringify(filters),now,now]);
   for(let offset=0;offset<rows.length;offset+=100){
    const batch=rows.slice(offset,offset+100),values=batch.map(()=>'(?,?,?,?,?,?,?,?)').join(',');
    await sql.run(`INSERT INTO se_cms_publish_rows(job_id,row_index,product_id,revision,code,name,status,reason) VALUES ${values}`,batch.flatMap((p,i)=>[id,offset+i,p.id,Number(p.revision),p.code||'',p.name||'Unavailable product',byId.has(p.id)?'pending':'failed',byId.has(p.id)?'':'Product did not match the filters when selected.']));
   }
   await audit(sql,'product.publish.preview',id,actor,{total:rows.length,eligible,mode:input.mode});
   return present(sql,await owned(sql,id,actor));
  });
 }
 async function bulkPublishGet(id,actor,options){return read(async sql=>present(sql,await owned(sql,id,actor),options));}
 async function bulkPublishList(actor){owner(actor);return read(async sql=>(await sql.rows("SELECT id,total,created_at FROM se_cms_publish_jobs WHERE admin_id=? AND status='running' ORDER BY created_at DESC LIMIT 20",[actor])).map(row=>({id:row.id,total:Number(row.total),createdAt:Number(row.created_at)})));}
 async function bulkPublishConfirm(id,actor){await ready();return transaction(async sql=>{
  const job=await owned(sql,id,actor);
  if(job.status==='cancelled')reject('This publishing job was cancelled.',409);
  if(job.status==='preview'){
   if(Number(job.created_at)<Date.now()-PREVIEW_AGE)reject('This preview expired. Select the products again.',409);
   await sql.run("UPDATE se_cms_publish_jobs SET status='running',updated_at=? WHERE id=?",[Date.now(),id]);
   await audit(sql,'product.publish.confirm',id,actor,{total:Number(job.total),eligible:Number(job.eligible)});job.status='running';
  }
  return present(sql,job);
 });}
 async function bulkPublishCancel(id,actor){await ready();return transaction(async sql=>{
  const job=await owned(sql,id,actor);if(job.status==='running')reject('This job has already been confirmed. Pause it instead.',409);
  if(job.status==='preview'){await sql.run("UPDATE se_cms_publish_jobs SET status='cancelled',updated_at=? WHERE id=?",[Date.now(),id]);job.status='cancelled';}
  return present(sql,job);
 });}
 async function bulkPublishAdvance(id,actor){await ready();return transaction(async sql=>{
  const job=await owned(sql,id,actor);if(job.status==='complete')return present(sql,job);
  if(job.status!=='running')reject('Confirm this publishing job before processing it.',409);
  const rows=await sql.rows("SELECT * FROM se_cms_publish_rows WHERE job_id=? AND status='pending' ORDER BY row_index LIMIT ?",[id,BATCH_SIZE]);
  for(const row of rows){
   const p=(await sql.rows('SELECT p.*,c.status AS category_status FROM se_cms_products p JOIN se_cms_categories c ON c.id=p.category_id WHERE p.id=?',[row.product_id]))[0];
   let status='published',reason='';
   if(!p){status='failed';reason='Product no longer exists or no longer matched the filters when selected.';}
   else if(p.status!=='draft'){status='skipped';reason=p.status==='published'?'Already published.':'Archived products are not published.';}
   else if(Number(p.revision)!==Number(row.revision)){status='failed';reason='Product changed after selection. Review it and select it again.';}
   else {
    try{assertPublicationCategory({status:p.category_status},'published');assertSourceReviewed((await hydrate(sql,[p]))[0]);}
    catch(error){if(error.code!=='VALIDATION')throw error;status='failed';reason=error.message;}
    if(status==='published'){
     const changed=await sql.run("UPDATE se_cms_products SET status='published',revision=revision+1,updated_at=? WHERE id=? AND revision=? AND status='draft'",[Date.now(),p.id,row.revision]);
     if(changed!==1){status='failed';reason='Product changed during publishing. Review it and select it again.';}
     else await audit(sql,'product.update',p.id,actor,{code:p.code,slug:p.slug,status:'published',revision:Number(p.revision)+1,bulkPublishJobId:id});
    }
   }
   await sql.run('UPDATE se_cms_publish_rows SET status=?,reason=? WHERE job_id=? AND row_index=?',[status,reason,id,row.row_index]);
  }
  const pending=Number((await sql.rows("SELECT count(*) n FROM se_cms_publish_rows WHERE job_id=? AND status='pending'",[id]))[0].n);
  job.status=pending?'running':'complete';await sql.run('UPDATE se_cms_publish_jobs SET status=?,updated_at=? WHERE id=?',[job.status,Date.now(),id]);
  if(!pending)await audit(sql,'product.publish.finish',id,actor,{total:Number(job.total)});
  return present(sql,job);
 });}
 return {bulkPublishPrepare,bulkPublishGet,bulkPublishList,bulkPublishConfirm,bulkPublishAdvance,bulkPublishCancel};
}
