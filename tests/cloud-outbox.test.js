import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newDb} from 'pg-mem';
import {createPostgresStore} from '../src/postgres-store.js';

const payload={requestId:'outbox-test',name:'Synthetic Buyer',company:'Test Ltd',email:'buyer@example.com',country:'UK',buyerType:'Distributor',products:'003-004-00',items:[]};
async function fixture(t){const memory=newDb(),{Pool}=memory.adapters.createPg(),pool=new Pool();t.after(()=>pool.end());const store=createPostgresStore('',{pool,skipAdvisoryLocks:true});return {store,pool};}
test('saved RFQs queue once; leased notifications fence other workers and acknowledgement is durable',async t=>{
 const {store,pool}=await fixture(t);const saved=await store.save(payload);await store.save(payload);
 assert.equal(typeof store.claimNotification,'function');
 const claim=await store.claimNotification(1000000);assert.equal(claim.reference,saved.reference);assert.equal(claim.payload.email,'buyer@example.com');assert.equal(claim.attempts,1);
 assert.equal(await store.claimNotification(1000001),null);
 assert.equal(await store.finishNotification(claim.reference,'wrong','sent',1000002),false);
 assert.equal(await store.finishNotification(claim.reference,claim.token,'sent',1000002),true);
 assert.equal((await pool.query('SELECT notification_status FROM se_rfqs')).rows[0].notification_status,'sent');
 assert.equal(await store.claimNotification(2000000),null);
});
test('lease expiry recovers interrupted work and retries back off without losing the enquiry',async t=>{
 const {store,pool}=await fixture(t);await store.save(payload);assert.equal(typeof store.claimNotification,'function');
 const first=await store.claimNotification(1000000),second=await store.claimNotification(1120001);
 assert.notEqual(second.token,first.token);assert.equal(second.attempts,2);
 assert.equal(await store.finishNotification(first.reference,first.token,'sent',1120002),false);
 assert.equal(await store.finishNotification(second.reference,second.token,'SMTP_UNAVAILABLE',1120003),true);
 assert.equal(await store.claimNotification(1120004),null);
 const retry=await store.claimNotification(1720004);assert.equal(retry.reference,first.reference);assert.equal(retry.attempts,3);
 assert.equal((await pool.query('SELECT notification_status FROM se_rfqs')).rows[0].notification_status,'pending');
});
test('legacy pending RFQs are discovered but previously sent enquiries are never queued',async t=>{
 const {store,pool}=await fixture(t);const saved=await store.save(payload);assert.equal(typeof store.claimNotification,'function');
 await pool.query('DELETE FROM se_rfq_outbox');
 await store.save({...payload,requestId:'sent',company:'Previously sent'});
 await pool.query('UPDATE se_rfqs SET notification_status=$1 WHERE id!=$2',['sent',saved.reference]);
 const claim=await store.claimNotification(1000000);assert.equal(claim.reference,saved.reference);
 await store.finishNotification(claim.reference,claim.token,'sent',1000001);assert.equal(await store.claimNotification(2000000),null);
});
test('a stale candidate cannot be claimed after another worker has acknowledged it',async t=>{
 const {store,pool}=await fixture(t);await store.save(payload);let raced=false;
 const query=pool.query.bind(pool);pool.query=async(sql,args)=>{
  const result=await query(sql,args);
  if(sql.startsWith('SELECT o.rfq_id')&&!raced){raced=true;const claim=await store.claimNotification(1000000);await store.finishNotification(claim.reference,claim.token,'sent',1000001);}
  return result;
 };
 assert.equal(await store.claimNotification(1000000),null);
});
test('completed outbox row itself fences a stale pending-status view',async t=>{
 const {store,pool}=await fixture(t);await store.save(payload);
 const claim=await store.claimNotification(1000000);await store.finishNotification(claim.reference,claim.token,'sent',1000001);
 // Model a stale RFQ status snapshot; the updated outbox row must still block the claim.
 await pool.query("UPDATE se_rfqs SET notification_status='pending'");
 assert.equal(await store.claimNotification(2000000),null);
});
