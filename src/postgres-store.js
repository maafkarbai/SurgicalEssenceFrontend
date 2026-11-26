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
    CREATE TABLE IF NOT EXISTS se_rfq_outbox(
     rfq_id TEXT PRIMARY KEY REFERENCES se_rfqs(id) ON DELETE CASCADE,
     attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at BIGINT NOT NULL DEFAULT 0,
     lease_token TEXT, lease_until BIGINT, last_error_code TEXT, sent_at BIGINT
    );
    CREATE INDEX IF NOT EXISTS se_rfq_outbox_due ON se_rfq_outbox(next_attempt_at,lease_until);
    CREATE TABLE IF NOT EXISTS se_rate_limits(ip_hash TEXT PRIMARY KEY,count INTEGER NOT NULL,expires BIGINT NOT NULL);`);
    await client.query('COMMIT');
   }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  })().catch(e=>{ready=undefined;throw e;});
  return ready;
 }
 return {
  pool,
  ready:ensure,
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
    await client.query('INSERT INTO se_rfq_outbox(rfq_id) VALUES($1)',[id]);
    await client.query('COMMIT');return {reference:id,duplicate:false};
   }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  },
  async claimNotification(now=Date.now()){
   await ensure();
   // Discover pre-upgrade pending enquiries in bounded groups. Sent rows are excluded.
   await pool.query(`INSERT INTO se_rfq_outbox(rfq_id) SELECT r.id FROM se_rfqs r LEFT JOIN se_rfq_outbox o ON o.rfq_id=r.id
    WHERE r.notification_status='pending' AND o.rfq_id IS NULL
    ORDER BY r.created_at,r.id LIMIT 100 ON CONFLICT DO NOTHING`);
   const due=await pool.query(`SELECT o.rfq_id FROM se_rfq_outbox o JOIN se_rfqs r ON r.id=o.rfq_id
    WHERE r.notification_status='pending' AND o.sent_at IS NULL AND o.next_attempt_at<=$1 AND (o.lease_until IS NULL OR o.lease_until<=$1)
    ORDER BY o.next_attempt_at,r.created_at,r.id LIMIT 1`,[now]);
   if(!due.rows.length)return null;
   const token=randomUUID(),reference=due.rows[0].rfq_id;
   // Conditional UPDATE is the claim authority, including when two instances selected the same row.
   const claimed=await pool.query(`UPDATE se_rfq_outbox SET lease_token=$1,lease_until=$2,attempts=attempts+1
    WHERE rfq_id=$3 AND sent_at IS NULL AND next_attempt_at<=$4 AND (lease_until IS NULL OR lease_until<=$4)
    AND rfq_id IN (SELECT id FROM se_rfqs WHERE notification_status='pending') RETURNING attempts`,[token,now+120000,reference,now]);
   if(!claimed.rows.length)return null;
   const row=(await pool.query('SELECT payload FROM se_rfqs WHERE id=$1',[reference])).rows[0];
   return row?{reference,token,attempts:Number(claimed.rows[0].attempts),payload:row.payload}:null;
  },
  async finishNotification(reference,token,result,now=Date.now()){
   if(!['sent','SMTP_UNAVAILABLE','SMTP_TIMEOUT','SMTP_REJECTED','INVALID_PAYLOAD'].includes(result))throw new Error('Invalid notification outcome.');
   await ensure();const client=await pool.connect();
   try{
    await client.query('BEGIN');
    // Token and unexpired lease fence late completions from an interrupted/older worker.
    const row=await client.query('SELECT attempts FROM se_rfq_outbox WHERE rfq_id=$1 AND lease_token=$2 AND lease_until>$3',[reference,token,now]);
    if(!row.rows.length){await client.query('COMMIT');return false;}
    const delay=Math.min(21600000,60000*2**Math.min(Number(row.rows[0].attempts)-1,10));
    const changed=await client.query(`UPDATE se_rfq_outbox SET lease_token=NULL,lease_until=NULL,next_attempt_at=$1,last_error_code=$2,sent_at=$3
     WHERE rfq_id=$4 AND lease_token=$5 AND lease_until>$6 RETURNING rfq_id`,[result==='sent'?0:now+delay,result==='sent'?null:result,result==='sent'?now:null,reference,token,now]);
    if(changed.rows.length&&result==='sent')await client.query("UPDATE se_rfqs SET notification_status='sent' WHERE id=$1",[reference]);
    await client.query('COMMIT');return Boolean(changed.rows.length);
   }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  },
  close:()=>pool.end()
 };
}
