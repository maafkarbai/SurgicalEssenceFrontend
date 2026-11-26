import {reviewFixture} from './review-fixture.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import request from 'supertest';
import {createApp} from '../src/app.js';
import {tokenHash} from '../src/cms/auth.js';

async function fixture(t){
 const dir=mkdtempSync(join(tmpdir(),'se-bulk-admin-'));
 const {app,db,cms:repo}=createApp({dataDir:dir,siteUrl:'http://localhost:3000'});
 t.after(()=>{db.close();rmSync(dir,{recursive:true,force:true});});await repo.ready();
 const admin=await repo.createAdmin({email:'bulk-test@example.com',passwordHash:'fixture-password-hash-that-is-long-enough'});
 await repo.createSession({id:tokenHash('bulk-session-token'),userId:admin.id,csrfToken:'bulk-test-csrf-token-with-at-least-32-characters',expiresAt:Date.now()+3600000});
 const auth=req=>req.set('Cookie','se_admin_session=bulk-session-token');
 const post=path=>auth(request(app).post('/admin/products/bulk-publish'+path)).set('x-csrf-token','bulk-test-csrf-token-with-at-least-32-characters');
 return {app,db,repo,auth,post};
}

test('bulk publishing uses real admin authentication and CSRF, and only changes products after confirmation',async t=>{
 const {app,repo,auth,post}=await fixture(t);
 assert.equal((await request(app).post('/admin/products/bulk-publish/prepare').send({})).status,303);
 assert.equal((await auth(request(app).post('/admin/products/bulk-publish/prepare')).send({})).status,403);
 const p=await repo.saveProduct({...reviewFixture,code:'BULK-ROUTE',name:'Bulk <script> text',categoryId:'beauty'},'test');
 const page=await auth(request(app).get('/admin/products?status=draft'));
 assert.equal(page.status,200);assert.match(page.text,/data-product-select/);assert.match(page.text,/bulk-publish.js/);assert.match(page.text,/Bulk &lt;script&gt; text/);
 const prepare=await post('/prepare').send({mode:'selected',selection:[{id:p.id,revision:p.revision}],filters:{status:'draft'}});
 assert.equal(prepare.status,201,prepare.text);assert.equal((await repo.product(p.id,{all:true})).status,'draft');
 const id=prepare.body.id;assert.equal((await post(`/${id}/advance`).send({})).status,409);
 assert.equal((await post(`/${id}/confirm`).send({})).status,200);
 const result=await post(`/${id}/advance`).send({});assert.equal(result.status,200,result.text);assert.equal(result.body.published,1);
 for(const url of ['/products?q=BULK-ROUTE','/products?category=beauty','/products/'+p.slug,'/sitemap.xml']){
  const response=await request(app).get(url);assert.equal(response.status,200,response.text);assert.ok(response.text.includes(p.slug)||response.text.includes(p.code),url);
 }
 assert.equal((await repo.catalogueSummary()).categoryCounts.beauty,1);
 const clamped=await auth(request(app).get('/admin/products?status=draft&page=999'));
 assert.equal(clamped.status,200);assert.match(clamped.text,/Page 1 of 1/);assert.match(clamped.text,/0 products/);
});

test('publication JSON routes validate requests, protect job ownership, and sanitize unexpected errors',async t=>{
 const {app,repo,auth,post}=await fixture(t);
 const p=await repo.saveProduct({code:'BULK-OWNER',name:'Owner test',categoryId:'beauty'},'test');
 const other=await repo.bulkPublishPrepare({mode:'all',filters:{q:p.code}},'different-admin');
 assert.equal((await auth(request(app).get(`/admin/products/bulk-publish/${other.id}`))).status,404);
 assert.equal((await post('/prepare').send({mode:'all',filters:{q:['bad']}})).status,400);
 const initial=repo.bulkPublishPrepare;repo.bulkPublishPrepare=async()=>{throw new Error('SQL failed C:/private token=secret');};
 const failed=await post('/prepare').send({mode:'all',filters:{}});assert.equal(failed.status,503);assert.doesNotMatch(failed.text,/SQL|private|secret/);
 repo.bulkPublishPrepare=initial;
 const prepared=await post('/prepare').send({mode:'all',filters:{q:p.code}});
 assert.equal((await post(`/${prepared.body.id}/cancel`).send({})).body.status,'cancelled');
 assert.equal((await post(`/${prepared.body.id}/confirm`).send({})).status,409);
});
