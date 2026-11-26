import {reviewFixture} from './review-fixture.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import request from 'supertest';
import {createApp} from '../src/app.js';
import {createImportService} from '../src/cms/import-service.js';
import {createMediaService} from '../src/cms/media.js';

test('source-reviewed imported drafts appear in catalogue/search/sitemap and work in RFQs while drafts stay private',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'se-import-public-'));
 const {app,db,cms}=createApp({dataDir:dir,siteUrl:'http://localhost:3000'});
 try{
  const service=createImportService({repo:cms,media:createMediaService({repo:cms,dataDir:dir})});
  let job=await service.create({csv:Buffer.from('sku,name,category,status,material\nBULK-ONE,Verified test instrument,Surgical instruments,draft,Test material\nBULK-DRAFT,Private draft,Surgical instruments,draft,\n'),filename:'public-flow.csv',userId:'test'});
  const id=job.id;job=await service.configure(id,{mapping:job.mapping,mode:'add'},'test');
  assert.equal((await request(app).get('/products/bulk-one')).status,404);
  await service.confirm(id,{},'test');job=await service.advance(id,'test');assert.equal(job.status,'completed');
  const imported=await cms.product('BULK-ONE',{all:true});
  await cms.saveProduct({...imported,...reviewFixture,status:'published'},'reviewer');
  assert.equal((await request(app).get('/products/bulk-one')).status,200);
  assert.equal((await request(app).get('/products/bulk-draft')).status,404);
  assert.match((await request(app).get('/products?q=BULK-ONE')).text,/Verified test instrument/);
  const sitemap=(await request(app).get('/sitemap.xml')).text;assert.match(sitemap,/bulk-one/);assert.ok(!sitemap.includes('bulk-draft'));
  const agent=request.agent(app),form=await agent.get('/request-quote'),csrf=form.text.match(/name="_csrf" value="([^"]+)"/)[1];
  const response=await agent.post('/request-quote').set('Accept','application/json').send({_csrf:csrf,name:'QA Buyer',company:'Test Supply',email:'qa@example.com',country:'UK',buyerType:'Distributor',items:JSON.stringify([{code:'BULK-ONE',quantity:100}])});
  assert.equal(response.status,201);const payload=JSON.parse(db.prepare('SELECT payload FROM rfqs WHERE id=?').get(response.body.reference).payload);assert.equal(payload.items[0].name,'Verified test instrument');assert.equal(payload.items[0].material,'Test material');
 }finally{db.close();rmSync(dir,{recursive:true,force:true});}
});
