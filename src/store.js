import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,chmodSync} from 'node:fs';
import {join} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';

export function openStore(dataDir) {
 mkdirSync(dataDir,{recursive:true,mode:0o700});
 const path=join(dataDir,'requests.sqlite');
 const db=new DatabaseSync(path);
 try {chmodSync(path,0o600);} catch { /* Windows ACLs are managed by the host. */ }
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS rfqs (id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, fingerprint TEXT NOT NULL, created_at INTEGER NOT NULL, payload TEXT NOT NULL, notification_status TEXT NOT NULL DEFAULT 'pending');
 CREATE INDEX IF NOT EXISTS rfq_fingerprint ON rfqs(fingerprint,created_at);
 CREATE TABLE IF NOT EXISTS rate_limits (ip_hash TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);`);
 return db;
}
export function saveRfq(db,data) {
 const {requestId,website,...payload}=data;
 const fingerprint=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
 // Synchronous transaction is atomic for concurrent requests and process restarts.
 db.exec('BEGIN IMMEDIATE');
 try {
  const prior=db.prepare('SELECT id, fingerprint FROM rfqs WHERE request_key = ? OR (fingerprint = ? AND created_at > ?) LIMIT 1').get(requestId||'',fingerprint,Date.now()-15*60*1000);
  if(prior) { if(prior.fingerprint!==fingerprint) {const e=new Error('idempotency_conflict');e.code='CONFLICT';throw e;} db.exec('COMMIT');return {reference:prior.id,duplicate:true}; }
  const id=`SE-${randomUUID().replaceAll('-','').slice(0,24).toUpperCase()}`;
  db.prepare('INSERT INTO rfqs(id,request_key,fingerprint,created_at,payload) VALUES(?,?,?,?,?)').run(id,requestId||randomUUID(),fingerprint,Date.now(),JSON.stringify(payload));
  db.exec('COMMIT'); return {reference:id,duplicate:false};
 } catch(e) {db.exec('ROLLBACK');throw e;}
}
