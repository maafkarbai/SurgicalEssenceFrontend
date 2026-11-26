import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createCmsStore} from '../src/cms/store.js';
import {createImportService} from '../src/cms/import-service.js';

const evidence={sourceDocument:'surgical.pdf revision supplied',sourcePage:5,imageEvidence:'Exact instrument illustration on page 5',reviewNotes:'Reference, name, dimensions and image compared with source.',reviewAction:'verify'};
async function setup(t){const db=new DatabaseSync(':memory:');t.after(()=>db.close());const repo=createCmsStore({db});await repo.ready();return {db,repo};}
const draft={code:'REVIEW-1',name:'Review instrument',categoryId:'surgical',images:[{url:'/images/optimized/003-004-00.webp'}]};
test('unreviewed and forged products cannot publish; failures roll back',async t=>{
 const {repo}=await setup(t);
 for(const extra of [{},{verification:{status:'verified',reviewedBy:'forged',reviewedAt:1}},{...evidence,sourceDocument:''},{...evidence,sourcePage:0},{...evidence,imageEvidence:''}]){
  await assert.rejects(repo.saveProduct({...draft,status:'published',...extra},'reviewer'),/source|review|page|evidence/i);
  assert.equal((await repo.products({all:true,q:'REVIEW-1'})).total,0);
 }
});
test('explicit source review records server actor and time; content/image edits invalidate it',async t=>{
 const {repo,db}=await setup(t);
 let p=await repo.saveProduct({...draft,...evidence},'reviewer');
 assert.equal(p.verification.status,'verified');assert.equal(p.verification.reviewedBy,'reviewer');assert.ok(p.verification.reviewedAt>Date.now()-10000);
 p=await repo.saveProduct({id:p.id,revision:p.revision,status:'published'},'publisher');
 assert.equal(p.verification.reviewedBy,'reviewer');
 await assert.rejects(repo.saveProduct({id:p.id,revision:p.revision,page:99},'editor'),/review/i);
 await assert.rejects(repo.saveProduct({id:p.id,revision:p.revision,length:'99 cm'},'editor'),/review/i);
 assert.equal((await repo.product(p.id)).length,'');
 p=await repo.saveProduct({id:p.id,revision:p.revision,status:'draft',images:[]},'editor');
 assert.equal(p.verification.status,'unreviewed');
 await assert.rejects(repo.saveProduct({...p,status:'published',reviewAction:'verify'},'reviewer'),/image/i);
 assert.ok(db.prepare("SELECT count(*) n FROM se_cms_audit WHERE action='product.review' AND entity_id=?").get(p.id).n>=1);
});
test('legacy records remain unchanged on startup but require review on the next published save',async t=>{
 const {repo,db}=await setup(t),before=db.prepare('SELECT * FROM se_cms_products ORDER BY id').all();
 await createCmsStore({db}).ready();assert.deepEqual(db.prepare('SELECT * FROM se_cms_products ORDER BY id').all(),before);
 const p=await repo.product('003-004-00');assert.equal(p.status,'published');assert.notEqual(p.verification?.status,'verified');
 await assert.rejects(repo.saveProduct({id:p.id,revision:p.revision,seoTitle:'New title'},'editor'),/review/i);
});
test('bulk preview counts only reviewed drafts and processing rejects unreviewed drafts',async t=>{
 const {repo}=await setup(t),p=await repo.saveProduct(draft,'author'),v=await repo.saveProduct({...draft,code:'REVIEW-2',...evidence},'reviewer');
 const job=await repo.bulkPublishPrepare({mode:'selected',selection:[p,v]},'publisher');assert.equal(job.eligible,1);
 await repo.bulkPublishConfirm(job.id,'publisher');const result=await repo.bulkPublishAdvance(job.id,'publisher');
 assert.equal(result.published,1);assert.equal(result.failed,1);assert.match(result.items.find(i=>i.id===p.id).reason,/review/i);
 assert.equal(await repo.product(p.id),null);
});
test('CSV publication is rejected in preview; drafts import for separate source review',async t=>{
 const {repo}=await setup(t),service=createImportService({repo,media:{}});
 let job=await service.create({csv:Buffer.from('sku,name,category,status\nREVIEW-CSV,CSV instrument,Surgical instruments,published\n'),userId:'author'});
 job=await service.configure(job.id,{mapping:job.mapping,mode:'add'},'author');assert.equal(job.counts.valid,0);
 const rows=await service.rows(job.id,{},'author');assert.match(rows.items[0].errors.join(' '),/review/i);
 await assert.rejects(service.confirm(job.id,{},'author'),/valid/i);
});
test('review survives metadata edits, is revoked explicitly and is rechecked after bulk confirmation',async t=>{
 const {repo}=await setup(t);
 let p=await repo.saveProduct({...draft,...evidence},'reviewer');
 const review=p.verification;
 p=await repo.saveProduct({id:p.id,revision:p.revision,seoTitle:'Buyer search title'},'editor');assert.deepEqual(p.verification,review);
 const job=await repo.bulkPublishPrepare({mode:'selected',selection:[p]},'publisher');await repo.bulkPublishConfirm(job.id,'publisher');
 p=await repo.saveProduct({id:p.id,revision:p.revision,reviewAction:'revoke'},'reviewer');assert.equal(p.verification.status,'unreviewed');
 const result=await repo.bulkPublishAdvance(job.id,'publisher');assert.equal(result.failed,1);assert.equal(result.published,0);
 await assert.rejects(repo.saveProduct({...p,status:'published'},'publisher'),/review/i);
});
test('draft CSV preserves provenance, cannot forge approval and commit enforces the gate independently',async t=>{
 const {repo}=await setup(t),service=createImportService({repo,media:{}});
 let job=await service.create({csv:Buffer.from('sku,name,category,source_document,source_page,image_evidence,review_notes,reviewAction\nREVIEW-CSV,Draft instrument,Surgical instruments,source.pdf,18,Source illustration,Compared to PDF,verify\n'),userId:'author'});
 job=await service.configure(job.id,{mapping:job.mapping,mode:'add'},'author');assert.equal(job.counts.valid,1);
 await service.confirm(job.id,{},'author');await service.advance(job.id,'author');
 const p=await repo.product('REVIEW-CSV',{all:true});assert.equal(p.sourceDocument,'source.pdf');assert.equal(p.sourcePage,18);assert.equal(p.verification.status,'unreviewed');
 assert.match(await service.exportCsv([p]),/source\.pdf,18/);
 // Simulates a pre-upgrade or manipulated staged plan bypassing the preview.
 const staged=await repo.importCreate({adminId:'author',rows:[{}]});
 await repo.importUpdate(staged.id,'author',{config:{validationVersion:'v'},status:'preview'});
 await repo.importSaveRows(staged.id,'author',[{rowIndex:0,plan:{},status:'ready'}],'v');
 await repo.importConfirm(staged.id,'author',{mode:'create_only',validationVersion:'v'});
 const result=await repo.applyImportRow(staged.id,'author',0,{input:{...draft,...evidence,code:'FORGED-IMPORT',status:'published'}});
 assert.equal(result.status,'failed');assert.match(result.message,/review/i);assert.equal(await repo.product('FORGED-IMPORT',{all:true}),null);
});
