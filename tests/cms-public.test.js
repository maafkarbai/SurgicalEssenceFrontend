import {reviewFixture} from './review-fixture.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../src/app.js';

test('CMS publication, slug history, category search and quote snapshots preserve the public journey',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'se-cms-public-'));
 const {app,db,cms}=createApp({dataDir:dir,siteUrl:'http://localhost:3000'});
 try{
  await cms.ready();
  assert.equal((await cms.products({all:true,limit:100})).total,8);
  const product=await cms.saveProduct({name:'Test instrument',code:'CMS-TEST-001',slug:'test-instrument',categoryId:'surgical',shortDescription:'Verified test description',status:'draft'},'test');
  assert.equal((await request(app).get('/products/test-instrument')).status,404);
  assert.ok(!(await request(app).get('/sitemap.xml')).text.includes('test-instrument'));
  const published=await cms.saveProduct({...product,...reviewFixture,status:'published'},'test');
  assert.equal((await request(app).get('/products/test-instrument')).status,200);
  assert.match((await request(app).get('/products?q=CMS-TEST-001')).text,/Test instrument/);
  assert.match((await request(app).get('/sitemap.xml')).text,/test-instrument/);
  const agent=request.agent(app),form=await agent.get('/request-quote'),csrf=form.text.match(/name="_csrf" value="([^"]+)"/)[1];
  const result=await agent.post('/request-quote').set('Accept','application/json').send({_csrf:csrf,name:'QA Buyer',company:'Test Ltd',email:'qa@example.com',country:'UK',buyerType:'Distributor',items:JSON.stringify([{code:published.code,quantity:25}])});
  assert.equal(result.status,201);
  const payload=JSON.parse(db.prepare('SELECT payload FROM rfqs WHERE id=?').get(result.body.reference).payload);
  assert.equal(payload.items[0].name,'Test instrument');assert.equal(payload.items[0].productId,published.id);
  const renamed=await cms.saveProduct({...published,slug:'new-test-instrument'},'test');
  assert.equal((await request(app).get('/products/test-instrument')).status,301);
  assert.equal((await request(app).get('/products/new-test-instrument')).status,200);
  await cms.archiveProduct(renamed.id,'test');
  assert.equal((await request(app).get('/products/new-test-instrument')).status,404);
  assert.equal(JSON.parse(db.prepare('SELECT payload FROM rfqs WHERE id=?').get(result.body.reference).payload).items[0].name,'Test instrument');
  assert.equal((await request(app).get('/products/003-004-00')).status,200);
 }finally{db.close();rmSync(dir,{recursive:true,force:true});}
});
