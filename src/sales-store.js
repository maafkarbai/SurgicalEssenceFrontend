import {randomUUID} from 'node:crypto';

export const salesStatuses=Object.freeze(['NEW','CONTACTED','NEGOTIATION','CLOSED']);
function fail(message,status=400){throw Object.assign(new Error(message),{status});}
function text(value,max=200){if(typeof value!=='string'||value.length>max)fail(`Enter text of at most ${max} characters.`);return value.trim();}
function date(value){if(!value)return null;if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))fail('Use a valid date.');const n=Date.parse(`${value}T00:00:00Z`);if(!Number.isFinite(n)||new Date(n).toISOString().slice(0,10)!==value)fail('Use a valid date.');return n;}
function integer(value,min,max){const n=Number(value);if(!Number.isSafeInteger(n)||n<min||n>max)fail('Invalid page or page size.');return n;}
const parse=value=>typeof value==='string'?JSON.parse(value):value||{};
const cell=value=>{let s=String(value??'');if(/^[\s\u0000-\u001f]*[=+@-]|^[\t\r\n]/u.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};

/** Accepted RFQs remain immutable. Only namespaced pipeline and audit tables are written. */
export function createSalesStore({db,cloud=false}){
 const pool=db?.pool;if(cloud&&!pool)throw new Error('Sales requires the PostgreSQL pool.');
 if(!pool&&!db?.prepare)throw new Error('Sales requires an existing RFQ database.');
 const table=pool?'se_rfqs':'rfqs';let initialized;let writes=Promise.resolve();
 function adapter(client=pool){return {
  async rows(sql,args=[]){if(pool){let i=0;return (await client.query(sql.replace(/\?/g,()=>`$${++i}`),args)).rows;}return db.prepare(sql).all(...args);},
  async run(sql,args=[]){if(pool){let i=0;return client.query(sql.replace(/\?/g,()=>`$${++i}`),args);}return db.prepare(sql).run(...args);}
 };}
 const schema=`CREATE TABLE IF NOT EXISTS se_sales_pipeline(rfq_id TEXT PRIMARY KEY,status TEXT NOT NULL CHECK(status IN ('NEW','CONTACTED','NEGOTIATION','CLOSED')),notes TEXT NOT NULL DEFAULT '',updated_at BIGINT NOT NULL,updated_by TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS se_sales_audit(id TEXT PRIMARY KEY,rfq_id TEXT NOT NULL,previous_status TEXT NOT NULL,status TEXT NOT NULL,notes TEXT NOT NULL,actor TEXT NOT NULL,created_at BIGINT NOT NULL);
 CREATE INDEX IF NOT EXISTS se_sales_audit_rfq ON se_sales_audit(rfq_id,created_at);
 CREATE TABLE IF NOT EXISTS se_sales_export_audit(id TEXT PRIMARY KEY,actor TEXT NOT NULL,action TEXT NOT NULL,kind TEXT NOT NULL,filters TEXT NOT NULL,row_count BIGINT NOT NULL,created_at BIGINT NOT NULL);`;
 async function initializeSqlite(work=()=>db.exec(schema)){const deadline=Date.now()+5000;for(;;){try{db.exec('BEGIN IMMEDIATE');break;}catch(e){if(!/within a transaction|database is locked/.test(e.message)||Date.now()>=deadline)throw e;await new Promise(resolve=>setTimeout(resolve,10));}}try{work();db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}}
 function ready(){if(!initialized)initialized=(async()=>{await db.ready?.();if(pool)await pool.query(schema);else await initializeSqlite();})().catch(e=>{initialized=undefined;throw e;});return initialized;}
 const select=`SELECT r.id,r.created_at,r.payload,p.status,p.notes,p.updated_at,p.updated_by FROM ${table} r LEFT JOIN se_sales_pipeline p ON p.rfq_id=r.id`;
 function normalize(row){const p=parse(row.payload);return {id:row.id,createdAt:Number(row.created_at),name:p.name||'',company:p.company||p.organization||'',email:p.email||'',country:p.country||'',phone:p.phone||'',buyerType:p.buyerType||'',intent:p.intent||'quote',territory:p.territory||'',interests:p.interests||'',purchasing:p.purchasing||'',products:p.products||'',quantities:p.quantities||'',oem:p.oem||'',message:p.message||'',items:Array.isArray(p.items)?p.items:[],status:row.status||'NEW',notes:row.notes||'',updatedAt:row.updated_at==null?null:Number(row.updated_at),updatedBy:row.updated_by||null};}
 function filter(input={}){
  const q=text(input.q??''),country=text(input.country??'',100),status=text(input.status??'',30),from=date(input.from),to=date(input.to);
  if(status&&!salesStatuses.includes(status))fail('Invalid pipeline status.');if(from!==null&&to!==null&&from>to)fail('Start date must precede end date.');
  const where=[],args=[];
  if(status){where.push("COALESCE(p.status,'NEW')=?");args.push(status);}
  if(country){where.push(pool?"lower(r.payload->>'country')=?":"lower(json_extract(r.payload,'$.country'))=?");args.push(country.toLowerCase());}
  if(from!==null){where.push('r.created_at>=?');args.push(from);}if(to!==null){where.push('r.created_at<?');args.push(to+86400000);}
  if(q){const fields=['lower(CAST(r.payload AS TEXT))','lower(r.id)',"lower(COALESCE(p.notes,''))"];where.push('('+fields.map(f=>`${pool?'strpos':'instr'}(${f},?)>0`).join(' OR ')+')');args.push(q.toLowerCase(),q.toLowerCase(),q.toLowerCase());}
  return {where:where.length?' WHERE '+where.join(' AND '):'',args};
 }
 async function list(input={}){await ready();const limit=integer(input.limit??25,1,100),requested=integer(input.page??1,1,1000000),{where,args}=filter(input),sql=adapter();
  const total=Number((await sql.rows(`SELECT count(*) AS n FROM ${table} r LEFT JOIN se_sales_pipeline p ON p.rfq_id=r.id${where}`,args))[0].n),pages=Math.max(1,Math.ceil(total/limit)),page=Math.min(requested,pages);
  return {items:(await sql.rows(`${select}${where} ORDER BY r.created_at DESC,r.id ASC LIMIT ? OFFSET ?`,[...args,limit,(page-1)*limit])).map(normalize),total,pages,page,limit};
 }
 async function detail(id){await ready();const sql=adapter(),rows=await sql.rows(`${select} WHERE r.id=?`,[id]);if(!rows.length)return null;
  const audit=(await sql.rows('SELECT * FROM se_sales_audit WHERE rfq_id=? ORDER BY created_at DESC,id DESC',[id])).map(r=>({id:r.id,actor:r.actor,previousStatus:r.previous_status,status:r.status,notes:r.notes,createdAt:Number(r.created_at)}));return {...normalize(rows[0]),audit};
 }
 async function update(id,input,actor){const status=text(input.status??'',30);if(!salesStatuses.includes(status))fail('Invalid pipeline status.');const notes=input.notes===undefined?undefined:text(input.notes,10000),by=text(typeof actor==='string'?actor:actor?.id||'',200);if(!by)fail('Administrator required.');await ready();
  // SQLite's whole transaction runs synchronously so it cannot overlap the CMS transaction.
  if(!pool){const deadline=Date.now()+5000;for(;;){try{db.exec('BEGIN IMMEDIATE');break;}catch(e){if(!/within a transaction|database is locked/.test(e.message)||Date.now()>=deadline)throw e;await new Promise(resolve=>setTimeout(resolve,10));}}try{const row=db.prepare(`${select} WHERE r.id=?`).get(id);if(!row)fail('Enquiry not found.',404);const now=Math.max(Date.now(),Number(row.updated_at||0)+1),savedNotes=notes??row.notes??'';
   db.prepare('INSERT INTO se_sales_pipeline(rfq_id,status,notes,updated_at,updated_by) VALUES(?,?,?,?,?) ON CONFLICT(rfq_id) DO UPDATE SET status=excluded.status,notes=excluded.notes,updated_at=excluded.updated_at,updated_by=excluded.updated_by').run(id,status,savedNotes,now,by);
   db.prepare('INSERT INTO se_sales_audit(id,rfq_id,previous_status,status,notes,actor,created_at) VALUES(?,?,?,?,?,?,?)').run(randomUUID(),id,row.status||'NEW',status,savedNotes,by,now);db.exec('COMMIT');
  }catch(e){db.exec('ROLLBACK');throw e;}}
  else{const work=writes.then(async()=>{const client=await pool.connect(),sql=adapter(client);try{await client.query('BEGIN');const rows=await sql.rows(`SELECT id FROM ${table} WHERE id=? FOR UPDATE`,[id]);if(!rows.length)fail('Enquiry not found.',404);const prior=(await sql.rows('SELECT * FROM se_sales_pipeline WHERE rfq_id=?',[id]))[0],now=Math.max(Date.now(),Number(prior?.updated_at||0)+1),savedNotes=notes??prior?.notes??'';
    await sql.run('INSERT INTO se_sales_pipeline(rfq_id,status,notes,updated_at,updated_by) VALUES(?,?,?,?,?) ON CONFLICT(rfq_id) DO UPDATE SET status=excluded.status,notes=excluded.notes,updated_at=excluded.updated_at,updated_by=excluded.updated_by',[id,status,savedNotes,now,by]);
    await sql.run('INSERT INTO se_sales_audit(id,rfq_id,previous_status,status,notes,actor,created_at) VALUES(?,?,?,?,?,?,?)',[randomUUID(),id,prior?.status||'NEW',status,savedNotes,by,now]);await client.query('COMMIT');
   }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}});writes=work.catch(()=>{});await work;}
  return detail(id);
 }
 async function counts({now=Date.now()}={}){await ready();const sql=adapter(),groups=await sql.rows(`SELECT COALESCE(p.status,'NEW') AS status,count(*) AS n FROM ${table} r LEFT JOIN se_sales_pipeline p ON p.rfq_id=r.id GROUP BY COALESCE(p.status,'NEW')`),result={total:0,thisWeek:0,NEW:0,CONTACTED:0,NEGOTIATION:0,CLOSED:0};for(const r of groups){result[r.status]=Number(r.n);result.total+=Number(r.n);}const start=new Date(now);start.setUTCHours(0,0,0,0);start.setUTCDate(start.getUTCDate()-6);result.thisWeek=Number((await sql.rows(`SELECT count(*) AS n FROM ${table} WHERE created_at>=? AND created_at<=?`,[start.getTime(),now]))[0].n);return result;}
 async function exportCsv(input={},actor='system',kind='enquiries'){
  const by=text(typeof actor==='string'?actor:actor?.id||'',200);if(!by)fail('Export actor required.');if(!['enquiries','quotes','leads'].includes(kind))fail('Invalid export kind.');
  await ready();const {where,args}=filter(input),rows=await adapter().rows(`${select}${where} ORDER BY r.created_at DESC,r.id ASC`,args);
  const csv=[['Reference','Name','Company','Email','Phone','Country','Buyer type','Enquiry intent','Distribution territory','Instrument interests','Purchasing requirements','Products','Quantities','OEM','Message','Items','Status','Notes','Received at','Updated by','Updated at'].map(cell).join(','),...rows.map(row=>{const r=normalize(row);return [r.id,r.name,r.company,r.email,r.phone,r.country,r.buyerType,r.intent,r.territory,r.interests,r.purchasing,r.products,r.quantities,r.oem,r.message,JSON.stringify(r.items),r.status,r.notes,new Date(r.createdAt).toISOString(),r.updatedBy,r.updatedAt?new Date(r.updatedAt).toISOString():''].map(cell).join(',');})].join('\r\n');
  const auditSql='INSERT INTO se_sales_export_audit(id,actor,action,kind,filters,row_count,created_at) VALUES(?,?,?,?,?,?,?)',auditArgs=[randomUUID(),by,'csv.export',kind,JSON.stringify(Object.fromEntries(['q','status','country','from','to'].map(key=>[key,input[key]||'']))),rows.length,Date.now()];
  if(pool)await adapter().run(auditSql,auditArgs);else await initializeSqlite(()=>db.prepare(auditSql).run(...auditArgs));
  return csv;
 }
 return {ready,list,detail,update,counts,exportCsv};
}
