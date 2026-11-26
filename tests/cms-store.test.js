import {reviewFixture} from './review-fixture.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openStore} from '../src/store.js';
import {createCmsStore} from '../src/cms/store.js';

test('CMS preserves migrated records, enforces revisions and media/category references, and rejects unsafe URLs',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'cms-store-'));let db=openStore(dir),repo=createCmsStore({db});
 try{
  await repo.ready();const p=await repo.product('003-004-00',{all:true});
  const update=await repo.saveProduct({...p,...reviewFixture,name:'Edited verified handle'},'test');
  const results=await Promise.allSettled([repo.saveProduct({...update,...reviewFixture,name:'First concurrent edit'},'test'),repo.saveProduct({...update,...reviewFixture,name:'Second concurrent edit'},'test')]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.status,409);
  await assert.rejects(repo.archiveCategory('surgical','test'),{code:'CATEGORY_IN_USE'});
  const fresh=await repo.saveProduct({name:'New specimen',code:'TEST_001.v2',categoryId:'surgical',status:'draft'},'test');assert.equal(fresh.slug,'test-001-v2');
  await assert.rejects(repo.saveProduct({...fresh,images:[{url:'javascript:alert(1)'}]},'test'));
  await assert.rejects(repo.saveProduct({...fresh,images:[{url:'https://evil.example/image.webp'}]},'test'));
  const cleared=await repo.saveProduct({...await repo.product(p.id,{all:true}),status:'draft',images:[]},'test');assert.equal(cleared.image,null);
  await repo.archiveProduct(fresh.id,'test');db.close();db=openStore(dir);repo=createCmsStore({db});await repo.ready();
  assert.equal(await repo.product(fresh.slug),null);assert.equal((await repo.products({all:true,limit:100})).total,9);
  assert.equal((await repo.product(p.id,{all:true})).name,'First concurrent edit');
  assert.ok(db.prepare('SELECT count(*) n FROM se_cms_audit').get().n>=4);
 }finally{db.close();rmSync(dir,{recursive:true,force:true});}
});
