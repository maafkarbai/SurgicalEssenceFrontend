import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newDb} from 'pg-mem';
import {createPostgresStore} from '../src/postgres-store.js';
test('PostgreSQL adapter stores RFQs, deduplicates, rejects changed request IDs and increments durable limits',async()=>{
 const memory=newDb(),{Pool}=memory.adapters.createPg(),pool=new Pool();
 const store=createPostgresStore('',{pool,skipAdvisoryLocks:true});
 const body={requestId:'a',name:'Deployment QA',company:'Test Ltd',email:'qa@example.com',country:'UK',buyerType:'Distributor',products:'003-004-00',quantities:'100',oem:'',message:'',website:'',items:[]};
 const first=await store.save(body);assert.equal(first.duplicate,false);assert.match(first.reference,/^SE-[A-F0-9]{24}$/);
 assert.deepEqual(await store.save(body),{reference:first.reference,duplicate:true});
 await assert.rejects(store.save({...body,company:'Changed'}),{code:'CONFLICT'});
 assert.equal(await store.limit('test-ip'),1);assert.equal(await store.limit('test-ip'),2);
 const records=await pool.query('SELECT * FROM se_rfqs');assert.equal(records.rows.length,1);assert.equal(records.rows[0].payload.company,'Test Ltd');
 await store.close();
});
