import {test} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../src/app.js';

const dir = mkdtempSync(join(tmpdir(), 'se-test-'));
const {app, db} = createApp({dataDir: dir, siteUrl: 'http://localhost:3000', rateLimit: 50});
const buyer = {name:'Jane Buyer',company:'Medical Supply',email:'buyer@example.com',country:'Germany',buyerType:'Distributor',products:'003-004-00',quantities:'100',oem:'None',message:'Please confirm lead time.',website:''};
async function form(agent) { const r = await agent.get('/request-quote'); return r.text.match(/name="_csrf" value="([^"]+)"/)[1]; }
test('all core pages render semantic HTML and unique titles', async()=>{
 const titles=[];
 for (const path of ['/', '/products','/products/003-004-00','/oem-private-label','/quality','/about','/request-quote','/quote-list','/privacy']) {
  const r=await request(app).get(path); assert.equal(r.status,200,path); assert.equal((r.text.match(/<h1[ >]/g)||[]).length,1,path); assert.match(r.text,/rel="canonical"/); titles.push(r.text.match(/<title>(.*?)<\/title>/)[1]);
 } assert.equal(new Set(titles).size,titles.length);
});
test('search and categories return accurate results, invalid detail is 404',async()=>{
 const r=await request(app).get('/products?q=003-004-00'); assert.match(r.text,/<strong>1<\/strong> instrument found/); assert.match(r.text,/Scalpel handle No. 4/);
 assert.match((await request(app).get('/products?category=dental')).text,/No online records/);
 assert.equal((await request(app).get('/products/unknown')).status,404);
 assert.match((await request(app).get('/products?q=%3Cscript%3E')).text,/&lt;script&gt;/);
});
test('sitemap, robots, legacy redirects and security headers',async()=>{
 assert.match((await request(app).get('/sitemap.xml')).text,/products\/003-004-00/);
 assert.match((await request(app).get('/robots.txt')).text,/Sitemap:/);
 assert.equal((await request(app).get('/contact')).status,301);
 assert.equal((await request(app).get('/distributor')).headers.location,'/request-quote');
 assert.equal((await request(app).get('/products?cat=dental')).headers.location,'/products?category=dental');
 assert.match((await request(app).get('/')).headers['content-security-policy'],/default-src 'self'/);
});
test('CSRF and invalid data never create requests',async()=>{
 assert.equal((await request(app).post('/request-quote').send(buyer)).status,403);
 const agent=request.agent(app); const csrf=await form(agent);
 const r=await agent.post('/request-quote').type('form').send({...buyer,_csrf:csrf,email:'bad',name:''});
 assert.equal(r.status,422); assert.match(r.text,/Enter your full name/); assert.equal(db.prepare('select count(*) n from rfqs').get().n,0);
});
test('accepted RFQ persists once, replay returns same reference, unsafe items fail',async()=>{
 const agent=request.agent(app); const csrf=await form(agent);
 const payload={...buyer,_csrf:csrf,requestId:'8a85fb31-5038-4986-b9c3-b95481a1584e',items:JSON.stringify([{code:'003-004-00',quantity:100}])};
 const r=await agent.post('/request-quote').set('Accept','application/json').send(payload);
 assert.equal(r.status,201); assert.ok(r.body.reference);
 const repeat=await agent.post('/request-quote').set('Accept','application/json').send(payload); assert.equal(repeat.body.reference,r.body.reference);
 assert.equal(db.prepare('select count(*) n from rfqs').get().n,1);
 const invalid=await agent.post('/request-quote').send({...payload,requestId:'59247d8e-17aa-4650-b42c-da524ce8663e',items:'[{"code":"made-up","quantity":-1}]'}); assert.equal(invalid.status,422);
});
test('honeypot, cross-origin and excessive payload are rejected',async()=>{
 const agent=request.agent(app), csrf=await form(agent);
 assert.equal((await agent.post('/request-quote').send({...buyer,_csrf:csrf,website:'spam'})).status,422);
 assert.equal((await agent.post('/request-quote').set('Origin','https://evil.example').send({...buyer,_csrf:csrf})).status,403);
 assert.equal((await agent.post('/request-quote').send({...buyer,message:'x'.repeat(40000)})).status,413);
});
test('database unavailable returns failure, never a success',async()=>{
 const agent=request.agent(app),csrf=await form(agent); db.close();
 const r=await agent.post('/request-quote').set('Accept','application/json').send({...buyer,_csrf:csrf,requestId:'3b5c11c2-55aa-4986-acaa-39f43e4eab05'});
 assert.equal(r.status,503); assert.equal(r.body.ok,false); rmSync(dir,{recursive:true,force:true});
});
