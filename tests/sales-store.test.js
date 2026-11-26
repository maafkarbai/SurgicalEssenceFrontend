import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {newDb} from 'pg-mem';
import {createSalesStore} from '../src/sales-store.js';

for(const cloud of [false,true]){
 test(`sales pipeline filters, audits and preserves accepted RFQs (${cloud?'PostgreSQL':'SQLite'})`,async t=>{
  let db,query;
  if(cloud){const memory=newDb();memory.public.registerFunction({name:'strpos',args:['text','text'],returns:'integer',implementation:(s,q)=>s.indexOf(q)+1});const {Pool}=memory.adapters.createPg();const pool=new Pool();db={pool};query=(sql,args=[])=>pool.query(sql,args);t.after(()=>pool.end());}
  else {db=new DatabaseSync(':memory:');query=async(sql,args=[])=>({rows:db.prepare(sql.replace(/\$\d+/g,'?')).all(...args)});t.after(()=>db.close());}
  const table=cloud?'se_rfqs':'rfqs';
  const ddl=`CREATE TABLE ${table}(id TEXT PRIMARY KEY,created_at BIGINT NOT NULL,payload ${cloud?'JSONB':'TEXT'} NOT NULL,notification_status TEXT DEFAULT 'pending')`;
  if(cloud)await query(ddl);else db.exec(ddl);
  const payload=JSON.stringify({name:'Alice',company:'Acme',email:'alice@example.test',country:'Pakistan',products:'Forceps',message:'Please quote',intent:'distributor',territory:'Punjab, Sindh',interests:'Dental and surgical',purchasing:'Quarterly bulk orders',items:[{code:'S-1',quantity:4}]});
  await query(`INSERT INTO ${table}(id,created_at,payload) VALUES($1,$2,$3)`,['SE-1',Date.parse('2026-11-25T23:59:59.999Z'),payload]);
  await query(`INSERT INTO ${table}(id,created_at,payload) VALUES($1,$2,$3)`,['SE-2',Date.parse('2026-11-26T00:00:00Z'),JSON.stringify({name:' =SUM(1,2)',company:'Beta',email:'bob@example.test',country:'UK',message:'line\r\nbreak'})]);
  const repo=createSalesStore({db,cloud});
  assert.equal((await repo.list({limit:1})).items[0].id,'SE-2');
  assert.equal((await repo.list({limit:1,page:2})).items[0].status,'NEW');
  assert.equal((await repo.list({q:'acme',country:'pakistan',from:'2026-11-25',to:'2026-11-25'})).total,1);
  assert.equal((await repo.list({q:'%'})).total,0);
  assert.equal((await repo.detail('SE-1')).items[0].quantity,4);
  const distributor=await repo.detail('SE-1');assert.equal(distributor.intent,'distributor');assert.equal(distributor.territory,'Punjab, Sindh');assert.equal(distributor.interests,'Dental and surgical');assert.equal(distributor.purchasing,'Quarterly bulk orders');
  await repo.update('SE-1',{status:'CONTACTED',notes:'Called buyer'},'admin-1');
  await repo.update('SE-1',{status:'NEGOTIATION',notes:'Pricing sent'},'admin-2');
  const detail=await repo.detail('SE-1');
  assert.equal(detail.status,'NEGOTIATION');assert.equal(detail.notes,'Pricing sent');assert.equal(detail.updatedBy,'admin-2');
  assert.equal(detail.audit.length,2);assert.equal(detail.audit[0].actor,'admin-2');assert.equal(detail.audit[0].previousStatus,'CONTACTED');
  assert.equal((await repo.list({status:'NEW'})).total,1);
  const counts=await repo.counts({now:Date.parse('2026-11-26T12:00:00Z')});
  assert.equal(counts.total,2);assert.equal(counts.NEW,1);assert.equal(counts.NEGOTIATION,1);assert.equal(counts.thisWeek,2);
  const unchanged=(await query(`SELECT payload,notification_status FROM ${table} WHERE id=$1`,['SE-1'])).rows[0];
  assert.deepEqual(typeof unchanged.payload==='string'?JSON.parse(unchanged.payload):unchanged.payload,JSON.parse(payload));assert.equal(unchanged.notification_status,'pending');
  await assert.rejects(repo.update('missing',{status:'CLOSED'},'admin'),{status:404});
  await assert.rejects(repo.update('SE-1',{status:'BOGUS'},'admin'),{status:400});
  await assert.rejects(repo.update('SE-1',{status:'CLOSED',notes:'x'.repeat(10001)},'admin'),{status:400});
  await assert.rejects(repo.update('SE-1',{status:'CLOSED'},null),{status:400});
  await assert.rejects(repo.list({from:'2026-02-31'}),{status:400});
  const csv=await repo.exportCsv({country:'UK'});assert.match(csv,/"' =SUM\(1,2\)"/);assert.match(csv,/"line\r\nbreak"/);assert.doesNotMatch(csv,/Alice/);
  const distributorCsv=await repo.exportCsv({country:'Pakistan'},'export-admin','leads');for(const value of ['distributor','Punjab, Sindh','Dental and surgical','Quarterly bulk orders'])assert.ok(distributorCsv.includes(value));
  const exportAudit=(await query('SELECT actor,action,kind,row_count FROM se_sales_export_audit WHERE actor=$1',['export-admin'])).rows;assert.deepEqual(exportAudit.map(r=>({...r,row_count:Number(r.row_count)})),[{actor:'export-admin',action:'csv.export',kind:'leads',row_count:1}]);assert.equal((await repo.detail('SE-1')).audit.length,2);
 });
}

test('sales waits for an existing CMS SQLite transaction without rolling it back',async t=>{
 const db=new DatabaseSync(':memory:');t.after(()=>db.close());db.exec('CREATE TABLE rfqs(id TEXT PRIMARY KEY,created_at BIGINT,payload TEXT); INSERT INTO rfqs VALUES(\'SE-1\',1,\'{}\')');
 const repo=createSalesStore({db});await repo.ready();db.exec('BEGIN IMMEDIATE');db.exec("INSERT INTO rfqs VALUES('SE-2',2,'{}')");
 const timer=setTimeout(()=>db.exec('COMMIT'),25);t.after(()=>clearTimeout(timer));
 await repo.update('SE-1',{status:'CONTACTED'},'admin');
 assert.equal((await repo.detail('SE-1')).status,'CONTACTED');assert.equal((await repo.list()).total,2);
});

test('sales lazy schema initialization survives another transaction rolling back',async t=>{
 const db=new DatabaseSync(':memory:');t.after(()=>db.close());db.exec('CREATE TABLE rfqs(id TEXT PRIMARY KEY,created_at BIGINT,payload TEXT)');
 const repo=createSalesStore({db});assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE name='se_sales_pipeline'").get(),undefined);
 db.exec('BEGIN IMMEDIATE');const released=new Promise(resolve=>setTimeout(()=>{db.exec('ROLLBACK');resolve();},25));
 await repo.ready();await released;assert.equal((await repo.list()).total,0);
});
