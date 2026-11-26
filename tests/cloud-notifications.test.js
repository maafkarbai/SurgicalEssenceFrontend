import {test} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {newDb,DataType} from 'pg-mem';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import net from 'node:net';
import tls from 'node:tls';
import nodemailer from 'nodemailer';
import {createApp} from '../src/app.js';
import {createPostgresStore} from '../src/postgres-store.js';
import {createCloudNotificationHandler,createCloudNotificationTransport} from '../src/cloud-notifications.js';
import express from 'express';

const secret='synthetic-cron-secret-with-at-least-32-characters';
const env={CRON_SECRET:secret,RFQ_NOTIFICATIONS_ENABLED:'true',SMTP_HOST:'synthetic.example',RFQ_FROM:'sender@example.com',RFQ_TO:'sales@example.com'};
const buyer={name:'Synthetic Buyer',company:'Test Ltd',email:'buyer@example.com',country:'UK',buyerType:'Distributor',products:'003-004-00',items:[]};
async function fixture(t,extra={}){
 const memory=newDb();memory.public.registerFunction({name:'pg_advisory_xact_lock',args:[DataType.integer],returns:DataType.integer,implementation:()=>1});
 const {Pool}=memory.adapters.createPg(),pool=new Pool(),store=createPostgresStore('',{pool,skipAdvisoryLocks:true});
 const dir=mkdtempSync(join(tmpdir(),'se-cloud-notify-'));
 const {app,cms}=createApp({dataDir:dir,store,notificationEnv:env,...extra});
 // Worker must not depend on catalogue/CMS availability.
 const ready=cms.ready;cms.ready=async()=>{throw new Error('Synthetic catalogue unavailable');};
 t.after(async()=>{await store.close();rmSync(dir,{recursive:true,force:true});});return {app,store,pool,restoreCatalogue:()=>{cms.ready=ready;}};
}
const call=(app,method='get')=>request(app)[method]('/internal/rfq-notifications').set('Authorization','Bearer '+secret);
test('worker rejects missing/wrong authentication and unsupported methods before accessing storage',async t=>{
 const {app,pool}=await fixture(t);
 for(const auth of ['', 'Bearer wrong'])assert.equal((await request(app).get('/internal/rfq-notifications').set('Authorization',auth)).status,401);
 assert.equal((await call(app,'head')).status,405);assert.equal((await call(app,'put')).status,405);
 assert.equal((await pool.query("SELECT table_name FROM information_schema.tables WHERE table_name='se_rfq_outbox'")).rows.length,0);
});
test('disabled/missing mail configuration fails closed with no claim and no credential disclosure',async t=>{
 const {app}=await fixture(t,{notificationEnv:{...env,RFQ_NOTIFICATIONS_ENABLED:'false',SMTP_PASS:'do-not-disclose'}});
 const response=await call(app);assert.equal(response.status,503);assert.doesNotMatch(response.text,/do-not-disclose|SMTP_PASS/);assert.equal(response.headers['cache-control'],'no-store');
});
test('one invocation delivers one pending RFQ through real SMTP and never re-sends acknowledged mail',async t=>{
 const messages=[],sockets=new Set();
 const server=net.createServer(socket=>{
  sockets.add(socket);socket.on('close',()=>sockets.delete(socket));socket.write('220 localhost test SMTP\r\n');let buffer='',data=false,body='';
  socket.on('data',chunk=>{buffer+=chunk.toString();let end;while((end=buffer.indexOf('\r\n'))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+2);
   if(data){if(line==='.'){messages.push(body);body='';data=false;socket.write('250 accepted\r\n');}else body+=line+'\r\n';}
   else if(/^EHLO|^HELO/.test(line))socket.write('250 localhost\r\n');
   else if(line==='DATA'){data=true;socket.write('354 send data\r\n');}
   else if(line==='QUIT')socket.end('221 bye\r\n');else socket.write('250 ok\r\n');
  }});
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(async()=>{for(const s of sockets)s.destroy();await new Promise(r=>server.close(r));});
 const transportFactory=()=>nodemailer.createTransport({host:'127.0.0.1',port:server.address().port,secure:false,ignoreTLS:true});
 const {app,store,pool,restoreCatalogue}=await fixture(t,{notificationTransportFactory:transportFactory});
 restoreCatalogue();
 const agent=request.agent(app),form=await agent.get('/request-quote');assert.equal(form.status,200);
 const csrf=form.text.match(/name="_csrf" value="([^"]+)"/)[1];
 const accepted=await agent.post('/request-quote').set('Accept','application/json').send({...buyer,_csrf:csrf});assert.equal(accepted.status,201);
 const first=accepted.body;await store.save({...buyer,requestId:'smtp-2',company:'Second Ltd'});
 const sent=await call(app);assert.equal(sent.status,200);assert.equal(sent.body.sent,1);assert.equal(messages.length,1);assert.match(messages[0],/Reply-To: buyer@example.com/);assert.match(messages[0],/To: sales@example.com/);assert.match(messages[0],new RegExp(first.reference));
 assert.equal((await pool.query("SELECT id FROM se_rfqs WHERE notification_status='pending'")).rows.length,1);
 assert.equal((await call(app,'post')).body.sent,1);assert.equal((await call(app)).body.sent,0);assert.equal(messages.length,2);
 assert.doesNotMatch(sent.text,/buyer@example.com|Synthetic Buyer|token|lease/i);assert.equal(sent.headers['cache-control'],'no-store');
});
test('SMTP failure, rejection and deadline leave durable retry state and preserve accepted RFQs',async t=>{
 for(const mode of ['failure','rejection','timeout']){
  const {store,pool}=await fixture(t);const saved=await store.save({...buyer,requestId:mode});
  const app=express();app.all('/internal/rfq-notifications',createCloudNotificationHandler({store,env,sendTimeoutMs:15,transportFactory:()=>({close(){},sendMail:async()=>{
   if(mode==='failure')throw new Error('private SMTP password=do-not-disclose');
   if(mode==='timeout')return new Promise(()=>{});
   return {accepted:[],rejected:['sales@example.com']};
  }})}));
  const response=await call(app);assert.equal(response.status,200);assert.equal(response.body.retry,1);assert.equal(response.body.sent,0);assert.doesNotMatch(response.text,/do-not-disclose/);
  const row=(await pool.query('SELECT * FROM se_rfq_outbox WHERE rfq_id=$1',[saved.reference])).rows[0];
  assert.equal(row.last_error_code,{failure:'SMTP_UNAVAILABLE',rejection:'SMTP_REJECTED',timeout:'SMTP_TIMEOUT'}[mode]);assert.equal(row.lease_token,null);assert.ok(Number(row.next_attempt_at)>Date.now());
  assert.equal((await pool.query('SELECT notification_status FROM se_rfqs')).rows[0].notification_status,'pending');assert.equal(await store.claimNotification(),null);
 }
});
test('missing secret, invalid stored buyer address and storage failures fail safely',async t=>{
 const {app}=await fixture(t,{notificationEnv:{...env,CRON_SECRET:''}});assert.equal((await call(app)).status,503);
 const badStore={claimNotification:async()=>{throw new Error('postgres://private:password@host');},finishNotification:async()=>true};
 const service=express();service.all('/internal/rfq-notifications',createCloudNotificationHandler({store:badStore,env}));
 const failed=await call(service);assert.equal(failed.status,503);assert.doesNotMatch(failed.text,/password|postgres/);
 const {app:invalid,store,pool}=await fixture(t);
 await store.save({...buyer,email:'invalid\r\nBcc: victim@example.com'});
 const response=await call(invalid);assert.equal(response.body.retry,1);assert.equal((await pool.query('SELECT last_error_code FROM se_rfq_outbox')).rows[0].last_error_code,'INVALID_PAYLOAD');
});
test('worker deadline closes the active SMTP socket before scheduling a retry',async t=>{
 let socket,closed=false;
 const server=net.createServer(s=>{socket=s;s.on('close',()=>{closed=true;});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(async()=>{socket?.destroy();await new Promise(r=>server.close(r));});
 const {store}=await fixture(t);await store.save(buyer);
 const localEnv={...env,SMTP_HOST:'127.0.0.1',SMTP_PORT:String(server.address().port)};
 const app=express();app.all('/internal/rfq-notifications',createCloudNotificationHandler({store,env:localEnv,sendTimeoutMs:100}));
 const response=await call(app);assert.equal(response.body.retry,1);
 await new Promise(r=>setTimeout(r,100));assert.equal(closed,true,'timed-out send must not remain live');
});
test('cloud transport negotiates SMTPS with certificate verification and rejects an untrusted certificate',async t=>{
 const cert=readFileSync(new URL('./fixtures/synthetic-smtp-cert.pem',import.meta.url)),key=readFileSync(new URL('./fixtures/synthetic-smtp-key.pem',import.meta.url));
 let delivered=0;const sockets=new Set();
 const server=tls.createServer({cert,key},s=>{
  sockets.add(s);s.on('close',()=>sockets.delete(s));s.write('220 localhost TLS SMTP\r\n');let buffer='',data=false;
  s.on('data',chunk=>{buffer+=chunk.toString();let end;while((end=buffer.indexOf('\r\n'))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+2);
   if(data){if(line==='.'){delivered++;data=false;s.write('250 accepted\r\n');}}
   else if(/^EHLO|^HELO/.test(line))s.write('250 localhost\r\n');else if(line==='DATA'){data=true;s.write('354 send data\r\n');}else if(line==='QUIT')s.end('221 bye\r\n');else s.write('250 ok\r\n');
  }});
 });
 server.on('tlsClientError',()=>{});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(async()=>{for(const s of sockets)s.destroy();await new Promise(r=>server.close(r));});
 const config={...env,SMTP_HOST:'127.0.0.1',SMTP_PORT:String(server.address().port),SMTP_SECURE:'true'};
 const trusted=createCloudNotificationTransport(config,{tls:{ca:cert}});
 try{const result=await trusted.sendMail({from:env.RFQ_FROM,to:env.RFQ_TO,text:'Synthetic TLS verification'});assert.equal(result.accepted.length,1);assert.equal(delivered,1);}finally{trusted.close();}
 const untrusted=createCloudNotificationTransport(config);
 try{await assert.rejects(untrusted.sendMail({from:env.RFQ_FROM,to:env.RFQ_TO,text:'Must not send'}));assert.equal(delivered,1);}finally{untrusted.close();}
});
