import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openStore} from '../src/store.js';
import {createCmsStore} from '../src/cms/store.js';
import {newDb,DataType} from 'pg-mem';

async function fixture(run){const dir=mkdtempSync(join(tmpdir(),'cms-import-')),db=openStore(dir),repo=createCmsStore({db});try{await repo.ready();await run(repo,db);}finally{db.close();rmSync(dir,{recursive:true,force:true});}}
async function preview(repo,rows,mode='create_only'){const job=await repo.importCreate({adminId:'owner',filename:'test.csv',headers:['sku','name'],rows});await repo.importUpdate(job.id,'owner',{config:{validationVersion:'test-v1'},status:'preview'});await repo.importSaveRows(job.id,'owner',rows.map((_,rowIndex)=>({rowIndex,plan:{},status:'ready'})),'test-v1');return repo.importConfirm(job.id,'owner',{mode,validationVersion:'test-v1',options:{backupConfirmed:true}});}
const input={code:'IMPORT-001',name:'Import specimen',categoryId:'surgical',status:'draft'};

test('import staging is additive, private and inert; confirmation binds preview version',()=>fixture(async(repo,db)=>{
 const before=(await repo.products({all:true})).total;const job=await repo.importCreate({adminId:'owner',filename:'private.csv',rows:[input]});
 assert.equal((await repo.products({all:true})).total,before);assert.equal(await repo.importGet(job.id,'other'),null);await assert.rejects(repo.importUpdate(job.id,'other',{}),{code:'NOT_FOUND'});
 await assert.rejects(repo.applyImportRow(job.id,'owner',0,{input}),{code:'CONFLICT'});
 await repo.importUpdate(job.id,'owner',{config:{validationVersion:'v1'},status:'preview'});
 await assert.rejects(repo.importConfirm(job.id,'owner',{validationVersion:'v0'}),{code:'CONFLICT'});
 await assert.rejects(repo.importConfirm(job.id,'owner',{mode:'upsert',validationVersion:'v1'}));
 assert.equal(db.prepare('SELECT count(*) n FROM se_cms_import_rows WHERE job_id=?').get(job.id).n,1);
}));

test('import commits and row results are atomic, idempotent and survive reopen',()=>fixture(async(repo,db)=>{
 const job=await preview(repo,[input]);assert.equal(await repo.importLease(job.id,'owner','first'),true);assert.equal(await repo.importLease(job.id,'owner','second'),false);assert.equal(await repo.importRelease(job.id,'owner','second'),false);
 const [first,replay]=await Promise.all([repo.applyImportRow(job.id,'owner',0,{input}),repo.applyImportRow(job.id,'owner',0,{input})]);assert.deepEqual(first,replay);assert.equal(first.status,'created');assert.equal((await repo.product(first.productId,{all:true})).revision,1);
 assert.equal((await repo.importFinalize(job.id,'owner')).status,'complete');assert.deepEqual(await repo.applyImportRow(job.id,'owner',0,{input}),first);
 const reopened=createCmsStore({db});assert.equal((await reopened.importGet(job.id,'owner')).rows[0].result.productId,first.productId);
}));

test('stale revisions and failed images rollback product/category and leave durable safe failure',()=>fixture(async(repo)=>{
 const p=await repo.product('003-004-00',{all:true}),job=await preview(repo,[p],'upsert');await repo.saveProduct({...p,status:'draft',name:'Newer edit'},'owner');
 const stale=await repo.applyImportRow(job.id,'owner',0,{input:{...p,name:'Stale overwrite'},expectedRevision:p.revision});assert.equal(stale.status,'failed');assert.equal(stale.code,'CONFLICT');assert.equal((await repo.product(p.id,{all:true})).name,'Newer edit');assert.equal((await repo.importFinalize(job.id,'owner')).status,'completed_with_errors');
 const bad=await preview(repo,[input]);const result=await repo.applyImportRow(bad.id,'owner',0,{input:{...input,images:[{url:'javascript:bad'}]},categoryCreate:{name:'Temporary category'}});assert.equal(result.status,'failed');assert.equal(await repo.product(input.code,{all:true}),null);assert.equal((await repo.categories({all:true})).some(c=>c.name==='Temporary category'),false);
}));

test('cancel prevents pending commits and owner isolation applies to chunks and leases',()=>fixture(async(repo)=>{
 const job=await preview(repo,[input]);await repo.importCancel(job.id,'owner');await assert.rejects(repo.applyImportRow(job.id,'owner',0,{input}),{code:'CONFLICT'});assert.equal(await repo.product(input.code,{all:true}),null);await assert.rejects(repo.importLease(job.id,'other','x'),{code:'NOT_FOUND'});
 const staged=await repo.importCreate({adminId:'owner',filename:'zip.csv'}),part={uploadId:'zip',partIndex:0,totalParts:2,data:Buffer.from('test').toString('base64'),kind:'zip',filename:'test.zip'};
 await repo.importChunkPut(staged.id,'owner',part);await repo.importChunkPut(staged.id,'owner',part);assert.equal((await repo.importChunkGet(staged.id,'owner','zip')).length,1);
 await assert.rejects(repo.importChunkPut(staged.id,'owner',{...part,data:Buffer.from('changed').toString('base64')}),{code:'CONFLICT'});
 await assert.rejects(repo.importChunkGet(staged.id,'other','zip'),{code:'NOT_FOUND'});await assert.rejects(repo.importChunkPut(staged.id,'owner',{...part,partIndex:1,data:Buffer.alloc(512*1024+1).toString('base64')}));await assert.rejects(repo.importChunkPut(staged.id,'owner',{...part,totalParts:129}));
 assert.equal(await repo.importChunkDelete(staged.id,'owner','zip'),1);
}));

test('commit rechecks create mode and categories normalize whitespace and case',()=>fixture(async(repo)=>{
 const job=await preview(repo,[input]);await repo.saveProduct(input,'owner');assert.equal((await repo.applyImportRow(job.id,'owner',0,{input})).status,'skipped');
 const second=await preview(repo,[{...input,code:'IMPORT-002'}]);const category=await repo.saveCategory({name:'Special Tools',slug:'special-tools',status:'draft'},'owner');const result=await repo.applyImportRow(second.id,'owner',0,{input:{...input,code:'IMPORT-002'},categoryCreate:{name:'  SPECIAL   tools  '}});assert.equal((await repo.product(result.productId,{all:true})).categoryId,category.id);assert.equal((await repo.importProgress(second.id,'owner')).stats.created,1);assert.equal((await repo.importPendingRows(second.id,'owner')).length,0);
}));

test('additive import schema and atomic apply use the PostgreSQL adapter',async()=>{
 const memory=newDb();memory.public.registerFunction({name:'pg_advisory_xact_lock',args:[DataType.integer],returns:DataType.integer,implementation:()=>1});
 const {Pool}=memory.adapters.createPg(),pool=new Pool(),repo=createCmsStore({db:{pool},cloud:true});
 try{await repo.ready();const job=await preview(repo,[input]);const result=await repo.applyImportRow(job.id,'owner',0,{input});assert.equal(result.status,'created');assert.equal((await repo.importProgress(job.id,'owner')).stats.created,1);assert.equal((await repo.importFinalize(job.id,'owner')).status,'complete');}finally{await pool.end();}
});

test('active import quota bounds staging and terminal cleanup removes raw archives',()=>fixture(async(repo,db)=>{
 const jobs=[];for(let i=0;i<20;i++)jobs.push(await repo.importCreate({adminId:'owner',filename:`job-${i}.csv`,rows:[input]}));
 await assert.rejects(repo.importCreate({adminId:'owner',filename:'overflow.csv'}),{code:'IMPORT_QUOTA'});
 const job=jobs[0];await repo.importChunkPut(job.id,'owner',{uploadId:'images',partIndex:0,totalParts:1,data:Buffer.from('archive').toString('base64')});await repo.importCancel(job.id,'owner');assert.equal(db.prepare('SELECT count(*) n FROM se_cms_import_chunks WHERE job_id=?').get(job.id).n,0);await repo.importCreate({adminId:'owner',filename:'replacement.csv'});
 const finish=jobs[1];await repo.importChunkPut(finish.id,'owner',{uploadId:'images',partIndex:0,totalParts:1,data:Buffer.from('archive').toString('base64')});await repo.importUpdate(finish.id,'owner',{config:{validationVersion:'v'},status:'preview'});await repo.importSaveRows(finish.id,'owner',[{rowIndex:0,plan:{},status:'ready'}],'v');await repo.importConfirm(finish.id,'owner',{validationVersion:'v'});await repo.applyImportRow(finish.id,'owner',0,{input});await repo.importFinalize(finish.id,'owner');await repo.importFinalize(finish.id,'owner');assert.equal(db.prepare('SELECT count(*) n FROM se_cms_import_chunks WHERE job_id=?').get(finish.id).n,0);assert.equal((await repo.importGet(finish.id,'owner')).rows.length,1);
}));


test('stale validators cannot replace a newer mapping or confirm mismatched row plans',()=>fixture(async repo=>{
 const job=await repo.importCreate({adminId:'owner',filename:'race.csv',rows:[input]});
 await repo.importUpdate(job.id,'owner',{config:{validationVersion:'A'},payload:{stage:'validating'},status:'staged'});
 await repo.importSaveRows(job.id,'owner',[{rowIndex:0,plan:{},status:'ready'}],'A');
 await repo.importUpdate(job.id,'owner',{config:{validationVersion:'B'},payload:{stage:'configuring'},status:'staged'});
 await assert.rejects(repo.importUpdate(job.id,'owner',{payload:{stage:'preview'},status:'preview',expectedValidationVersion:'A'}),{code:'CONFLICT'});
 await repo.importUpdate(job.id,'owner',{payload:{stage:'preview'},status:'preview',expectedValidationVersion:'B'});
 await assert.rejects(repo.importConfirm(job.id,'owner',{validationVersion:'B'}),{code:'CONFLICT'});
 await repo.importSaveRows(job.id,'owner',[{rowIndex:0,plan:{},status:'ready'}],'B');
 assert.ok((await repo.importConfirm(job.id,'owner',{validationVersion:'B'})).confirmedAt);
}));
