import {test} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../src/app.js';

// A contact correction must reach pages, structured data and failure paths together.
const corrected={name:'Surgical Essence',email:'procurement@example.com',phone:'+92 300 123 4567',phoneHref:'+923001234567',address:{street:'Suite 10',city:'Test City',region:'Test Region',country:'Pakistan',postalCode:'54321'}};
function setup(t,options={}){
 const dir=mkdtempSync(join(tmpdir(),'se-business-'));
 const result=createApp({dataDir:dir,siteUrl:'http://localhost:3000',...options});
 result.app.locals.business=corrected;
 t.after(()=>{result.db.close();rmSync(dir,{recursive:true,force:true});});
 return result;
}
test('one contact correction reaches public contact links, location and Organization data',async t=>{
 const {app}=setup(t);
 for(const path of ['/','/products','/products/003-004-00','/oem-private-label','/quality','/about','/request-quote','/quote-list','/privacy','/missing']){
  const r=await request(app).get(path);
  assert.equal(r.status,path==='/missing'?404:200,path);
  const contactMarkup=r.text.replace(/<svg\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/svg>/g,'');
  assert.match(r.text,/href="mailto:procurement@example.com"/,path);
  assert.match(contactMarkup,/itemprop="email" href="mailto:procurement@example.com">procurement@example.com/,path);
  assert.match(contactMarkup,/href="tel:\+923001234567">\+92 300 123 4567/,path);
  assert.match(r.text,/Suite 10, Test City<br> Test Region, Pakistan 54321/,path);
  assert.doesNotMatch(r.text,/info@surgicalessence\.com|923036029756|Industrial Estate|51310|Sialkot/,path);
 }
});
test('rate-limit and RFQ storage failures use the same corrected contact',async t=>{
 const {app,db}=setup(t,{rateLimit:1});
 const agent=request.agent(app);
 const form=await agent.get('/request-quote');
 const csrf=form.text.match(/name="_csrf" value="([^"]+)"/)[1];
 db.limit=async()=>{throw new Error('synthetic storage outage');};
 const failed=await agent.post('/request-quote').set('Accept','application/json').send({_csrf:csrf});
 assert.equal(failed.status,503);
 assert.match(failed.body.message,/email procurement@example.com/);
 const limited=await agent.post('/request-quote').send({});
 assert.equal(limited.status,429);
 assert.match(limited.text,/email procurement@example.com/);
});
test('catalogue startup failure keeps the central contact available and escapes it',async t=>{
 const {app,cms}=setup(t);
 app.locals.business={...corrected,email:'support@example.com<script>alert(1)</script>'};
 cms.ready=async()=>{throw new Error('synthetic catalogue outage');};
 const failed=await request(app).get('/products');
 assert.equal(failed.status,503);
 assert.match(failed.text,/support@example.com&lt;script&gt;/);
 assert.doesNotMatch(failed.text,/<script>/);
});
