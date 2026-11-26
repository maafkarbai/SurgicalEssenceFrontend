import {randomUUID} from 'node:crypto';
import {hashPassword,verifyPassword} from './cms/auth.js';
import {withDatabase} from './database-queue.js';

const schema=`CREATE TABLE IF NOT EXISTS se_eng_buyers(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password_hash TEXT NOT NULL,created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS se_eng_sessions(hash TEXT PRIMARY KEY,buyer_id TEXT NOT NULL REFERENCES se_eng_buyers(id),csrf TEXT NOT NULL,expires_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS se_eng_quotes(reference TEXT PRIMARY KEY,buyer_id TEXT NOT NULL REFERENCES se_eng_buyers(id),summary TEXT NOT NULL,created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS se_eng_attempts(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS se_eng_press(id TEXT PRIMARY KEY,slug TEXT UNIQUE NOT NULL,title TEXT NOT NULL,content TEXT NOT NULL,status TEXT NOT NULL,revision INTEGER NOT NULL,created_at BIGINT NOT NULL,updated_at BIGINT NOT NULL,published_at BIGINT);
CREATE TABLE IF NOT EXISTS se_eng_audit(id TEXT PRIMARY KEY,actor TEXT NOT NULL,action TEXT NOT NULL,entity_id TEXT NOT NULL,created_at BIGINT NOT NULL);`;
function fail(message,status=400){throw Object.assign(new Error(message),{status});}
function text(value,label,max=200){if(typeof value!=='string'||!value.trim()||value.length>max)fail(`${label} is required (maximum ${max} characters).`,422);return value.trim();}
function email(value){const result=text(value,'Email',254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result))fail('Enter a valid email address.',422);return result;}
const pressObject=row=>row?{id:row.id,slug:row.slug,title:row.title,content:row.content,status:row.status,revision:Number(row.revision),createdAt:Number(row.created_at),updatedAt:Number(row.updated_at),publishedAt:row.published_at==null?null:Number(row.published_at)}:null;

/** Additive buyer and editorial tables; compatible with the existing SQLite or PostgreSQL pool. */
export function createEngagementStore({db,acceptedQuotes=false}){
 const pool=db?.pool;if(!pool&&!db?.prepare)throw new Error('Engagement requires a database.');let initialized;
 function adapter(client){return {async rows(sql,args=[]){if(pool){let n=0;return (await client.query(sql.replace(/\?/g,()=>`$${++n}`),args)).rows;}return db.prepare(sql).all(...args);},async run(sql,args=[]){if(pool){let n=0;return (await client.query(sql.replace(/\?/g,()=>`$${++n}`),args)).rowCount;}return Number(db.prepare(sql).run(...args).changes);},async exec(sql){return pool?client.query(sql):db.exec(sql);}};}
 async function rows(sql,args=[]){return pool?adapter(pool).rows(sql,args):withDatabase(db,()=>adapter(db).rows(sql,args));}
 async function run(sql,args=[]){return pool?adapter(pool).run(sql,args):withDatabase(db,()=>adapter(db).run(sql,args));}
 async function transaction(fn){const execute=async()=>{const client=pool?await pool.connect():db,sql=adapter(client);try{await sql.exec(pool?'BEGIN':'BEGIN IMMEDIATE');const result=await fn(sql);await sql.exec('COMMIT');return result;}catch(error){try{await sql.exec('ROLLBACK');}catch{}throw error;}finally{if(pool)client.release();}};return pool?execute():withDatabase(db,execute);}
 async function ready(){if(!initialized)initialized=Promise.resolve().then(()=>pool?pool.query(schema):withDatabase(db,()=>db.exec(schema))).catch(error=>{initialized=undefined;throw error;});return initialized;}
 async function findBuyer(value){await ready();return (await rows('SELECT * FROM se_eng_buyers WHERE email=?',[email(value)]))[0]||null;}
 async function registerBuyer(input){const address=email(input.email),name=text(input.name,'Name',150),hash=await hashPassword(input.password);await ready();const id=randomUUID();try{await run('INSERT INTO se_eng_buyers(id,email,name,password_hash,created_at) VALUES(?,?,?,?,?)',[id,address,name,hash,Date.now()]);}catch(error){if(error.code==='23505'||/UNIQUE constraint/.test(error.message))fail('Unable to create this account. Try signing in or use another email.',409);throw error;}return {id,email:address,name,passwordHash:hash};}
 async function authenticate(address,password){let buyer;try{buyer=await findBuyer(address);}catch(error){if(error.status!==422)throw error;}const valid=await verifyPassword(password,buyer?.password_hash||`scrypt$16384$${'0'.repeat(32)}$${'0'.repeat(128)}`);return buyer&&valid?{id:buyer.id,email:buyer.email,name:buyer.name,passwordHash:buyer.password_hash}:null;}
 async function createSession({hash,buyerId,csrf,expiresAt,expectedPasswordHash}){await ready();return transaction(async sql=>{const buyer=(await sql.rows('SELECT password_hash FROM se_eng_buyers WHERE id=?'+(pool?' FOR UPDATE':''),[buyerId]))[0];if(!expectedPasswordHash||!buyer||buyer.password_hash!==expectedPasswordHash)fail('Your account password changed. Sign in again.',401);await sql.run('DELETE FROM se_eng_sessions WHERE expires_at<=?',[Date.now()]);await sql.run('INSERT INTO se_eng_sessions(hash,buyer_id,csrf,expires_at) VALUES(?,?,?,?)',[hash,buyerId,csrf,expiresAt]);});}
 async function session(hash){await ready();const row=(await rows('SELECT s.*,b.name,b.email FROM se_eng_sessions s JOIN se_eng_buyers b ON b.id=s.buyer_id WHERE s.hash=? AND s.expires_at>?',[hash,Date.now()]))[0];return row?{hash:row.hash,buyerId:row.buyer_id,name:row.name,email:row.email,csrf:row.csrf,expiresAt:Number(row.expires_at)}:null;}
 async function deleteSession(hash){await ready();await run('DELETE FROM se_eng_sessions WHERE hash=?',[hash]);}
 async function changePassword(buyerId,currentPassword,password){await ready();const buyer=(await rows('SELECT * FROM se_eng_buyers WHERE id=?',[buyerId]))[0];if(!buyer||!await verifyPassword(currentPassword,buyer.password_hash))fail('Current password is incorrect.',401);const hash=await hashPassword(password);await transaction(async sql=>{if(!await sql.run('UPDATE se_eng_buyers SET password_hash=? WHERE id=? AND password_hash=?',[hash,buyerId,buyer.password_hash]))fail('Your account password changed. Sign in again.',401);await sql.run('DELETE FROM se_eng_sessions WHERE buyer_id=?',[buyerId]);});}
 async function consumeAttempt(key){await ready();const now=Date.now();await run('INSERT INTO se_eng_attempts(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN se_eng_attempts.expires_at<=? THEN 1 ELSE se_eng_attempts.count+1 END,expires_at=CASE WHEN se_eng_attempts.expires_at<=? THEN ? ELSE se_eng_attempts.expires_at END',[key,now+900000,now,now,now+900000]);return Number((await rows('SELECT count FROM se_eng_attempts WHERE key=?',[key]))[0].count)<=10;}
 // Call only for a newly persisted RFQ submitted during this authenticated session, never by email match or for a duplicate response.
 async function bindQuote({buyerId,reference,summary=''}){await ready();if(!(await rows('SELECT id FROM se_eng_buyers WHERE id=?',[buyerId])).length)fail('Buyer not found.',404);await run('INSERT INTO se_eng_quotes(reference,buyer_id,summary,created_at) VALUES(?,?,?,?) ON CONFLICT(reference) DO NOTHING',[text(reference,'Reference',100),buyerId,String(summary).slice(0,2000),Date.now()]);}
 async function quoteHistory(buyerId,{page=1,limit=20}={}){
  await ready();
  if(!Number.isSafeInteger(page)||page<1||page>1000000||!Number.isSafeInteger(limit)||limit<1||limit>50)fail('Invalid history page or limit.',422);
  if(acceptedQuotes)await db.ready?.();
  const table=acceptedQuotes?(pool?'se_rfqs':'rfqs'):'se_eng_quotes';
  const owner=acceptedQuotes?(pool?"r.payload->>'buyerAccountId'":"json_extract(r.payload,'$.buyerAccountId')"):'r.buyer_id';
  const total=Number((await rows(`SELECT count(*) AS n FROM ${table} r WHERE ${owner}=?`,[buyerId]))[0].n),pages=Math.max(1,Math.ceil(total/limit));
  page=Math.min(page,pages);
  let records;
  if(acceptedQuotes){
   // Pipeline notes and internal actor details never leave the admin area. The optional sidecar can be absent on a new deployment.
   const pipeline=(await rows(pool?"SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name=?":"SELECT name FROM sqlite_master WHERE type='table' AND name=?",['se_sales_pipeline'])).length>0;
   records=await rows(`SELECT r.id AS reference,r.payload,r.created_at${pipeline?',p.status':''} FROM ${table} r${pipeline?' LEFT JOIN se_sales_pipeline p ON p.rfq_id=r.id':''} WHERE ${owner}=? ORDER BY r.created_at DESC,r.id DESC LIMIT ? OFFSET ?`,[buyerId,limit,(page-1)*limit]);
  }else records=await rows('SELECT r.reference,r.summary,r.created_at FROM se_eng_quotes r WHERE r.buyer_id=? ORDER BY r.created_at DESC,r.reference DESC LIMIT ? OFFSET ?',[buyerId,limit,(page-1)*limit]);
  const items=records.map(row=>{
   const payload=typeof row.payload==='string'?JSON.parse(row.payload):row.payload||{};
   return {reference:row.reference,createdAt:Number(row.created_at),status:['NEW','CONTACTED','NEGOTIATION','CLOSED'].includes(row.status)?row.status:'NEW',summary:String(acceptedQuotes?payload.products||'':row.summary||''),message:String(payload.message||''),items:Array.isArray(payload.items)?payload.items.map(item=>({code:String(item.code||''),quantity:Number(item.quantity)})):[]};
  });
  return {items,total,page,pages,limit};
 }
 async function pressList({all=false}={}){await ready();return (await rows(`SELECT * FROM se_eng_press${all?'':" WHERE status='published'"} ORDER BY updated_at DESC,id LIMIT 500`)).map(pressObject);}
 async function pressSitemap(){await ready();return (await rows("SELECT slug,updated_at FROM se_eng_press WHERE status='published' ORDER BY slug")).map(row=>({slug:row.slug,updatedAt:Number(row.updated_at)}));}
 async function press(id,{all=false}={}){await ready();return pressObject((await rows(`SELECT * FROM se_eng_press WHERE (id=? OR slug=?)${all?'':" AND status='published'"} LIMIT 1`,[id,id]))[0]);}
 async function audit(actor,action,id){await run('INSERT INTO se_eng_audit(id,actor,action,entity_id,created_at) VALUES(?,?,?,?,?)',[randomUUID(),text(actor,'Administrator',254),action,id,Date.now()]);}
 async function savePress(input,actor){await ready();text(actor,'Administrator',254);const existing=input.id?await press(input.id,{all:true}):null;if(input.id&&!existing)fail('Press release not found.',404);if(existing&&Number(input.revision)!==existing.revision)fail('This press release changed. Reload before saving.',409);const title=text(input.title,'Title',200),content=text(input.content,'Content',50000),slug=text(input.slug,'Slug',160);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))fail('Use lowercase letters, numbers and single hyphens in the slug.',422);const status=input.status||'draft';if(!['draft','published'].includes(status))fail('Invalid publication status.',422);const id=existing?.id||randomUUID(),now=Date.now(),published=existing?.publishedAt||(status==='published'?now:null);try{if(existing){const count=await run('UPDATE se_eng_press SET title=?,slug=?,content=?,status=?,revision=revision+1,updated_at=?,published_at=? WHERE id=? AND revision=?',[title,slug,content,status,now,published,id,existing.revision]);if(!count)fail('This press release changed. Reload before saving.',409);}else await run('INSERT INTO se_eng_press(id,title,slug,content,status,revision,created_at,updated_at,published_at) VALUES(?,?,?,?,?,1,?,?,?)',[id,title,slug,content,status,now,now,published]);}catch(error){if(error.code==='23505'||/UNIQUE constraint/.test(error.message))fail('This slug is already in use.',409);throw error;}await audit(actor,existing?'press.update':'press.create',id);return press(id,{all:true});}
 async function deletePress(id,revision,actor){await ready();text(actor,'Administrator',254);if(!await run('DELETE FROM se_eng_press WHERE id=? AND revision=?',[id,Number(revision)]))fail('This press release changed or was removed. Reload the list.',409);await audit(actor,'press.delete',id);}
 return {ready,registerBuyer,findBuyer,authenticate,createSession,session,deleteSession,changePassword,consumeAttempt,bindQuote,quoteHistory,pressList,pressSitemap,press,savePress,deletePress};
}
