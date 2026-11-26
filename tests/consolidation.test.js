import {test} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../src/app.js';
import {hashPassword} from '../src/cms/auth.js';

function fixture(t){const dir=mkdtempSync(join(tmpdir(),'se-consolidation-'));const result=createApp({dataDir:dir,siteUrl:'http://localhost:3000',rateLimit:100});t.after(()=>{result.db.close();rmSync(dir,{recursive:true,force:true});});return result;}
test('restored buyer journeys have useful indexable pages and honest contact links',async t=>{
 const {app}=fixture(t);
 for(const [path,heading] of [['/contact','Contact'],['/catalog','catalogues'],['/distributor','Distribution']]){
  const response=await request(app).get(path);assert.equal(response.status,200);assert.match(response.text,new RegExp(heading,'i'));assert.match(response.text,new RegExp('rel="canonical" href="http://localhost:3000'+path+'"'));assert.doesNotMatch(response.text,/name="robots" content="noindex/);
 }
 assert.match((await request(app).get('/contact')).text,/tel:\+923036029756/);
 assert.match((await request(app).get('/catalog')).text,/\/documents\/surgical.pdf/);
 assert.match((await request(app).get('/distributor')).text,/intent=distributor/);
 assert.equal((await request(app).get('/favicon.ico')).headers.location,'/favicon.svg');
});
test('distributor requirements survive validation and persistence without changing existing RFQ semantics',async t=>{
 const {app,db}=fixture(t),agent=request.agent(app);
 const page=await agent.get('/request-quote?intent=distributor');assert.match(page.text,/name="territory"/);assert.match(page.text,/<option selected>Distributor/);
 const csrf=page.text.match(/name="_csrf" value="([^"]+)"/)[1];
 const response=await agent.post('/request-quote').set('Accept','application/json').send({_csrf:csrf,name:'Buyer Name',company:'Supply Company',email:'buyer@example.com',country:'Germany',buyerType:'Distributor',products:'Scalpel handles',territory:'Germany and Austria',purchasing:'Quarterly orders',interests:'Surgical instruments',intent:'distributor'});
 assert.equal(response.status,201,response.text);const payload=JSON.parse(db.prepare('SELECT payload FROM rfqs WHERE id=?').get(response.body.reference).payload);assert.equal(payload.territory,'Germany and Austria');assert.equal(payload.purchasing,'Quarterly orders');assert.equal(payload.intent,'distributor');
});
test('related products are public, distinct and linked on details',async t=>{
 const {app}=fixture(t);const response=await request(app).get('/products/003-004-00');assert.equal(response.status,200);assert.match(response.text,/Related instruments/);const section=response.text.split('Related instruments')[1];assert.ok(section);assert.doesNotMatch(section.split('</section>')[0],/data-add="003-004-00"/);
});
test('real app binds owner inside accepted payload and exposes complete admin features only after authentication',async t=>{
 const {app,db,cms}=fixture(t),buyer=request.agent(app),guest=request.agent(app),admin=request.agent(app);
 const getToken=page=>page.text.match(/name="_csrf" value="([^"]+)"/)[1];
 let page=await buyer.get('/account/register');let result=await buyer.post('/account/register').type('form').send({_csrf:getToken(page),name:'Account Buyer',email:'owner@example.com',password:'account buyer password'});assert.equal(result.status,303,result.text);
 page=await buyer.get('/request-quote');const payload={_csrf:getToken(page),name:'Account Buyer',company:'Supply Company',email:'owner@example.com',country:'Germany',buyerType:'Distributor',products:'Handles',items:[],message:'Confirm sourcing'};
 result=await buyer.post('/request-quote').set('Accept','application/json').send(payload);assert.equal(result.status,201,result.text);const reference=result.body.reference;const saved=JSON.parse(db.prepare('SELECT payload FROM rfqs WHERE id=?').get(reference).payload);assert.ok(saved.buyerAccountId);assert.match((await buyer.get('/account')).text,new RegExp(reference));
 page=await guest.get('/request-quote');result=await guest.post('/request-quote').set('Accept','application/json').send({...payload,_csrf:getToken(page),buyerAccountId:saved.buyerAccountId,products:'Guest attempt'});assert.equal(result.status,201);assert.equal(JSON.parse(db.prepare('SELECT payload FROM rfqs WHERE id=?').get(result.body.reference).payload).buyerAccountId,undefined,'guest cannot inject owner field');assert.doesNotMatch((await buyer.get('/account')).text,/Guest attempt/);
 for(const path of ['/admin/quotes','/admin/leads','/admin/quotes/export','/admin/press-releases','/admin/subscribers'])assert.equal((await guest.get(path)).status,303,path);
 await cms.createAdmin({email:'admin@example.com',passwordHash:await hashPassword('admin integration password')});page=await admin.get('/admin/login');result=await admin.post('/admin/login').type('form').send({_csrf:getToken(page),email:'admin@example.com',password:'admin integration password'});assert.equal(result.status,303);
 for(const path of ['/admin/','/admin/quotes','/admin/leads','/admin/press-releases','/admin/subscribers']){const response=await admin.get(path);assert.equal(response.status,200,response.text);assert.match(response.headers['cache-control'],/no-store/);}
 const dashboard=await admin.get('/admin/');const csrf=dashboard.text.match(/name="csrf-token" content="([^"]+)"/)[1];assert.equal((await admin.post('/admin/quotes/'+reference).type('form').send({status:'CONTACTED'})).status,403);result=await admin.post('/admin/quotes/'+reference).type('form').send({_csrf:csrf,status:'CONTACTED',notes:'Private admin note'});assert.equal(result.status,303,result.text);
 const account=await buyer.get('/account');assert.doesNotMatch(account.text,/Private admin note/);assert.equal(JSON.parse(db.prepare('SELECT payload FROM rfqs WHERE id=?').get(reference).payload).buyerAccountId,saved.buyerAccountId);
 result=await admin.post('/admin/press-releases/save').type('form').send({_csrf:csrf,title:'Test company update',slug:'test-update',content:'Published update',status:'published'});assert.equal(result.status,303,result.text);assert.equal((await guest.get('/press-releases/test-update')).status,200);assert.match((await guest.get('/sitemap.xml')).text,/press-releases\/test-update/);
});
