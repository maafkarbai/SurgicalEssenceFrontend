import {reviewFixture} from './review-fixture.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createCmsStore} from '../src/cms/store.js';
import {newDb,DataType} from 'pg-mem';

async function fixture(t){
 const db=new DatabaseSync(':memory:');t.after(()=>db.close());
 const repo=createCmsStore({db});await repo.ready();
 const create=(code,extra={})=>repo.saveProduct({...reviewFixture,code,name:`Bulk ${code}`,categoryId:'beauty',status:'draft',description:'Keep the exact details',material:'Catalog material',variations:{sizes:['small','large']},images:[{url:'/images/optimized/003-004-00.webp',alt:'Keep the image'}],...extra},'author');
 return {db,repo,create};
}
async function finish(repo,id,actor='admin-a'){
 await repo.bulkPublishConfirm(id,actor);
 let job;do{job=await repo.bulkPublishAdvance(id,actor);}while(job.status!=='complete');return job;
}

test('publication requires explicit confirmation and preserves every non-status product field and gallery',async t=>{
 const {db,repo,create}=await fixture(t),p=await create('BULK-ONE');
 const before=db.prepare('SELECT * FROM se_cms_products WHERE id=?').get(p.id);
 const images=db.prepare('SELECT * FROM se_cms_product_images WHERE product_id=?').all(p.id);
 const job=await repo.bulkPublishPrepare({mode:'selected',selection:[{id:p.id,revision:p.revision}],filters:{status:'draft'}},'admin-a');
 assert.equal(job.total,1);assert.equal(job.eligible,1);assert.equal(job.status,'preview');
 assert.equal((await repo.product(p.id,{all:true})).status,'draft');
 await assert.rejects(repo.bulkPublishAdvance(job.id,'admin-a'),{status:409});
 const result=await finish(repo,job.id);assert.equal(result.published,1);assert.equal(result.failed,0);
 const after=db.prepare('SELECT * FROM se_cms_products WHERE id=?').get(p.id);
 for(const key of Object.keys(before))if(!['status','revision','updated_at'].includes(key))assert.deepEqual(after[key],before[key],key);
 assert.equal(after.status,'published');assert.equal(after.revision,before.revision+1);
 assert.deepEqual(db.prepare('SELECT * FROM se_cms_product_images WHERE product_id=?').all(p.id),images);
 assert.equal(db.prepare("SELECT count(*) n FROM se_cms_audit WHERE action='product.update' AND entity_id=?").get(p.id).n,1);
 await repo.bulkPublishConfirm(job.id,'admin-a');await repo.bulkPublishAdvance(job.id,'admin-a');
 assert.equal((await repo.product(p.id)).revision,after.revision);
});

test('all-filtered snapshots cross pages, exclude later matches, detect edits, and process bounded batches',async t=>{
 const {repo,create}=await fixture(t);const products=[];
 for(let i=0;i<53;i++)products.push(await create(`BULK-MATCH-${i}`));
 await create('BULK-OTHER');await create('BULK-MATCH-ELSEWHERE',{categoryId:'dental'});
 const filters={q:'BULK-MATCH',category:'beauty',status:'draft'};
 const job=await repo.bulkPublishPrepare({mode:'all',filters},'admin-a');assert.equal(job.total,53);
 const late=await create('BULK-MATCH-LATE');
 await repo.saveProduct({id:products[0].id,revision:products[0].revision,name:'Edited after snapshot'},'other');
 await repo.bulkPublishConfirm(job.id,'admin-a');
 const first=await repo.bulkPublishAdvance(job.id,'admin-a');assert.ok(first.processed<=20);assert.equal(first.status,'running');
 const result=await finish(repo,job.id);assert.equal(result.published,52);assert.equal(result.failed,1);assert.equal(result.processed,53);
 assert.equal((await repo.product(late.id,{all:true})).status,'draft');
 assert.equal((await repo.product(products[0].id,{all:true})).name,'Edited after snapshot');
 const failures=await repo.bulkPublishGet(job.id,'admin-a',{page:1,issuesOnly:true});
 assert.match(failures.items[0].reason,/changed/i);
});

test('already published and archived products are skipped and category failures do not change categories',async t=>{
 const {repo,create}=await fixture(t);
 const category=await repo.saveCategory({name:'Private range',slug:'private-range',status:'draft'},'author');
 const draft=await create('BULK-BLOCKED',{categoryId:category.id}),published=await create('BULK-PUBLISHED',{status:'published'}),archived=await create('BULK-ARCHIVED',{status:'archived'});
 const job=await repo.bulkPublishPrepare({mode:'selected',selection:[draft,published,archived].map(p=>({id:p.id,revision:p.revision}))},'admin-a');
 assert.equal(job.eligible,0);
 const result=await finish(repo,job.id);assert.equal(result.published,0);assert.equal(result.skipped,2);assert.equal(result.failed,1);
 assert.equal((await repo.categories({all:true})).find(c=>c.id===category.id).status,'draft');
 assert.equal((await repo.product(draft.id,{all:true})).status,'draft');
});

test('ownership, stale page selection, repeated concurrent requests, missing products, and invalid inputs are enforced',async t=>{
 const {db,repo,create}=await fixture(t),p=await create('BULK-SECURE');
 const job=await repo.bulkPublishPrepare({mode:'selected',selection:[{id:p.id,revision:p.revision}]},'admin-a');
 for(const method of ['bulkPublishGet','bulkPublishConfirm','bulkPublishAdvance'])await assert.rejects(repo[method](job.id,'admin-b'),{status:404});
 await assert.rejects(repo.bulkPublishPrepare({mode:'all',filters:{}},''),{status:401});
 await assert.rejects(repo.bulkPublishPrepare({mode:'selected',selection:[]},'admin-a'),{status:400});
 await assert.rejects(repo.bulkPublishPrepare({mode:'selected',selection:[{id:p.id,revision:p.revision},{id:p.id,revision:p.revision}]},'admin-a'),{status:400});
 await assert.rejects(repo.bulkPublishPrepare({mode:'all',filters:{status:'unknown'}},'admin-a'),{status:400});
 await assert.rejects(repo.bulkPublishPrepare({mode:'all',filters:{q:[]}},'admin-a'),{status:400});
 await repo.bulkPublishConfirm(job.id,'admin-a');
 const replays=await Promise.all([repo.bulkPublishAdvance(job.id,'admin-a'),repo.bulkPublishAdvance(job.id,'admin-a')]);
 assert.equal(replays.at(-1).published,1);assert.equal((await repo.product(p.id)).revision,p.revision+1);
 const stale=await repo.bulkPublishPrepare({mode:'selected',selection:[{id:p.id,revision:p.revision}]},'admin-a');
 assert.equal((await finish(repo,stale.id)).skipped,1);
 const missing=await create('BULK-MISSING');const gone=await repo.bulkPublishPrepare({mode:'selected',selection:[{id:missing.id,revision:missing.revision}]},'admin-a');
 db.prepare('DELETE FROM se_cms_products WHERE id=?').run(missing.id);
 assert.equal((await finish(repo,gone.id)).failed,1);
});

test('category changes after confirmation are rechecked and snapshots survive a new store instance',async t=>{
 const {db,repo,create}=await fixture(t),p=await create('BULK-CATEGORY');
 const job=await repo.bulkPublishPrepare({mode:'all',filters:{q:'BULK-CATEGORY'}},'admin-a');
 await repo.bulkPublishConfirm(job.id,'admin-a');
 const category=(await repo.categories({all:true})).find(c=>c.id==='beauty');await repo.saveCategory({...category,status:'draft'},'other');
 const reopened=createCmsStore({db});await reopened.ready();
 const result=await reopened.bulkPublishAdvance(job.id,'admin-a');assert.equal(result.failed,1);assert.match(result.items[0].reason,/category/i);
 assert.equal((await repo.product(p.id,{all:true})).status,'draft');
});

test('explicit selections cannot publish a product outside the submitted filters',async t=>{
 const {repo,create}=await fixture(t),p=await create('BULK-FILTER-ONLY');
 const job=await repo.bulkPublishPrepare({mode:'selected',selection:[{id:p.id,revision:p.revision}],filters:{category:'dental'}},'admin-a');
 const result=await finish(repo,job.id);assert.equal(result.failed,1);assert.equal(result.published,0);
 assert.equal((await repo.product(p.id,{all:true})).status,'draft');
});

test('unfinished jobs are discoverable only by their owner; expired previews and cancelled jobs cannot run',async t=>{
 const {db,repo,create}=await fixture(t);await create('BULK-RESUMABLE');
 const job=await repo.bulkPublishPrepare({mode:'all',filters:{q:'BULK-RESUMABLE'}},'admin-a');
 assert.deepEqual(await repo.bulkPublishList('admin-a'),[]);
 db.prepare('UPDATE se_cms_publish_jobs SET created_at=? WHERE id=?').run(Date.now()-31*60000,job.id);
 await assert.rejects(repo.bulkPublishConfirm(job.id,'admin-a'),{status:409});
 await repo.bulkPublishCancel(job.id,'admin-a');await assert.rejects(repo.bulkPublishConfirm(job.id,'admin-a'),{status:409});
 const next=await repo.bulkPublishPrepare({mode:'all',filters:{q:'BULK-RESUMABLE'}},'admin-a');await repo.bulkPublishConfirm(next.id,'admin-a');
 assert.equal((await repo.bulkPublishList('admin-a'))[0].id,next.id);assert.deepEqual(await repo.bulkPublishList('admin-b'),[]);
 await finish(repo,next.id);assert.deepEqual(await repo.bulkPublishList('admin-a'),[]);
});

test('1000 matching drafts publish in bounded batches with exact counts and paginated results',async t=>{
 const {db,repo}=await fixture(t);for(let i=0;i<1000;i++)await repo.saveProduct({...reviewFixture,code:'SCALE-'+i,name:'Scale product '+i,categoryId:'beauty'},'test');
 const job=await repo.bulkPublishPrepare({mode:'all',filters:{q:'SCALE-'}},'admin-a');assert.equal(job.total,1000);
 await repo.bulkPublishConfirm(job.id,'admin-a');let before=0,result;
 do{result=await repo.bulkPublishAdvance(job.id,'admin-a');assert.ok(result.processed-before<=20);before=result.processed;}while(result.status!=='complete');
 assert.equal(result.published,1000);assert.equal(result.pages,20);
 const last=await repo.bulkPublishGet(job.id,'admin-a',{page:20});assert.equal(last.items.length,50);
 assert.equal((await repo.catalogueSummary()).categoryCounts.beauty,1000);
});

test('bulk publishing works through the PostgreSQL adapter with the same snapshots and outcomes',async()=>{
 const memory=newDb();memory.public.registerFunction({name:'pg_advisory_xact_lock',args:[DataType.integer],returns:DataType.integer,implementation:()=>1});
 const {Pool}=memory.adapters.createPg(),pool=new Pool(),repo=createCmsStore({db:{pool},cloud:true});
 try{
  await repo.ready();const p=await repo.saveProduct({...reviewFixture,code:'PG-BULK',name:'Postgres bulk',categoryId:'beauty'},'test');
  // pg-mem does not implement LIKE ... ESCAPE; filter parity is exercised on
  // SQLite above, while this checks the shared adapter's actual write queries.
  const job=await repo.bulkPublishPrepare({mode:'all',filters:{category:'beauty',status:'draft'}},'admin');
  const result=await finish(repo,job.id,'admin');assert.equal(result.published,1);assert.equal((await repo.product(p.id)).revision,2);
 }finally{await pool.end();}
});
