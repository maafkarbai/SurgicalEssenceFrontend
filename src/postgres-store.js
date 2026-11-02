import pg from 'pg';
import {randomUUID,createHash} from 'node:crypto';

// Separate tables preserve the previous application's database records.
export function createPostgresStore(connectionString, options={}) {
 const pool=options.pool||new pg.Pool({connectionString,max:3,connectionTimeoutMillis:10000,idleTimeoutMillis:10000});
 let ready;
 async function ensure(){
  if(!ready)ready=(async()=>{
   const client=await pool.connect();
   try {
    await client.query('BEGIN');
    if(!options.skipAdvisoryLocks)await client.query('SELECT pg_advisory_xact_lock(73501920)');
    await client.query(`CREATE TABLE IF NOT EXISTS se_rfqs(id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, fingerprint TEXT NOT NULL, created_at BIGINT NOT NULL, payload JSONB NOT NULL, notification_status TEXT NOT NULL DEFAULT 'pending');
    CREATE INDEX IF NOT EXISTS se_rfq_fingerprint ON se_rfqs(fingerprint,created_at);
    CREATE TABLE IF NOT EXISTS se_rate_limits(ip_hash TEXT PRIMARY KEY,count INTEGER NOT NULL,expires BIGINT NOT NULL);`);
    await client.query('COMMIT');
   }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  })().catch(e=>{ready=undefined;throw e;});
  return ready;
 }
 return {
  async limit(ip){
   await ensure();
   await pool.query('DELETE FROM se_rate_limits WHERE expires < $1',[Date.now()]);
   const result=await pool.query('INSERT INTO se_rate_limits(ip_hash,count,expires) VALUES($1,1,$2) ON CONFLICT(ip_hash) DO UPDATE SET count=se_rate_limits.count+1 RETURNING count',[ip,Date.now()+3600000]);
   return result.rows[0].count;
  },
  async save(data){
   await ensure();
   const {requestId,website,...payload}=data;
   const fingerprint=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
   const client=await pool.connect();
   try{
    await client.query('BEGIN');
    // Serialize matching payloads/request IDs across concurrent function instances.
    if(!options.skipAdvisoryLocks)for(const key of [fingerprint,requestId||fingerprint].sort())await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[key]);
    const prior=await client.query('SELECT id,fingerprint FROM se_rfqs WHERE request_key=$1 OR (fingerprint=$2 AND created_at>$3) LIMIT 1',[requestId||'',fingerprint,Date.now()-900000]);
    if(prior.rows.length){
     if(prior.rows[0].fingerprint!==fingerprint){const e=new Error('idempotency_conflict');e.code='CONFLICT';throw e;}
     await client.query('COMMIT');return {reference:prior.rows[0].id,duplicate:true};
    }
    const id=`SE-${randomUUID().replaceAll('-','').slice(0,24).toUpperCase()}`;
    await client.query('INSERT INTO se_rfqs(id,request_key,fingerprint,created_at,payload) VALUES($1,$2,$3,$4,$5)',[id,requestId||randomUUID(),fingerprint,Date.now(),JSON.stringify(payload)]);
    await client.query('COMMIT');return {reference:id,duplicate:false};
   }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  },
  close:()=>pool.end()
 };
}
