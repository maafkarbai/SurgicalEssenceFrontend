import {test} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../src/app.js';

const body={name:'Test Buyer',company:'Supply Ltd',email:'test@example.com',country:'UK',buyerType:'Distributor',products:'003-004-00'};
async function token(agent){const r=await agent.get('/request-quote');return r.text.match(/name="_csrf" value="([^"]+)"/)[1];}
test('durable storage and duplicate protection survive restart',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'se-persist-'));let instance=createApp({dataDir:dir});
 let agent=request.agent(instance.app),csrf=await token(agent);
 const a=await agent.post('/request-quote').set('Accept','application/json').send({...body,_csrf:csrf});assert.equal(a.status,201);instance.db.close();
 instance=createApp({dataDir:dir});agent=request.agent(instance.app);csrf=await token(agent);
 const b=await agent.post('/request-quote').set('Accept','application/json').send({...body,_csrf:csrf});assert.equal(b.status,200);assert.equal(a.body.reference,b.body.reference);assert.equal(instance.db.prepare('select count(*) n from rfqs').get().n,1);
 instance.db.close();rmSync(dir,{recursive:true,force:true});
});
test('per-IP burst limit rejects excess submissions',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'se-limit-'));const {app,db}=createApp({dataDir:dir,rateLimit:2});const agent=request.agent(app),csrf=await token(agent);
 for(let i=0;i<2;i++)assert.notEqual((await agent.post('/request-quote').send({...body,_csrf:csrf})).status,429);
 assert.equal((await agent.post('/request-quote').send({...body,_csrf:csrf})).status,429);db.close();rmSync(dir,{recursive:true,force:true});
});
test('changed payload cannot reuse a submitted request ID; malformed values reject cleanly',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'se-invalid-'));const {app,db}=createApp({dataDir:dir,rateLimit:100});const agent=request.agent(app),csrf=await token(agent),requestId='530887ef-44b4-4079-815d-4d91b581cc3d';
 assert.equal((await agent.post('/request-quote').set('Accept','application/json').send({...body,_csrf:csrf,requestId})).status,201);
 assert.equal((await agent.post('/request-quote').set('Accept','application/json').send({...body,_csrf:csrf,requestId,company:'Different Co'})).status,409);
 for(const items of ['not json','{}','[{"code":"003-004-00","quantity":1},{"code":"003-004-00","quantity":2}]','[{"code":"003-004-00","quantity":1.5}]'])assert.equal((await agent.post('/request-quote').send({...body,_csrf:csrf,items})).status,422);
 const injected=await agent.post('/request-quote').type('form').send({...body,_csrf:csrf,email:'bad',company:'<img src=x onerror=alert(1)>'});assert.equal(injected.status,422);assert.ok(!injected.text.includes('<img src=x onerror=alert(1)>'));
 assert.equal(db.prepare('select count(*) n from rfqs').get().n,1);db.close();rmSync(dir,{recursive:true,force:true});
});
test('CSRF tampering and missing cookie reject valid-looking submissions',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'se-csrf-'));const {app,db}=createApp({dataDir:dir});const agent=request.agent(app),csrf=await token(agent);
 assert.equal((await request(app).post('/request-quote').send({...body,_csrf:csrf})).status,403);
 assert.equal((await agent.post('/request-quote').send({...body,_csrf:csrf+'x'})).status,403);
 assert.equal(db.prepare('select count(*) n from rfqs').get().n,0);db.close();rmSync(dir,{recursive:true,force:true});
});
