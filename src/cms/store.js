import {randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {categories as seedCategories,products as seedProducts} from '../catalogue.js';
import {createBulkPublishStore} from './bulk-publish-store.js';
import {sourceReview,assertSourceReviewed} from './source-review.js';
import {databaseQueues as queues} from '../database-queue.js';

const schema=readFileSync(new URL('./schema.sql',import.meta.url),'utf8');
const states=new Set(['draft','published','archived']);
function fail(message,code='VALIDATION',status=400){const error=new Error(message);Object.assign(error,{code,status});throw error;}
const parse=value=>JSON.parse(value||'{}');
const timestamp=value=>typeof value==='string'?Date.parse(value):Number(value);
function field(value,name,max=20000){if(typeof value!=='string'||value.length>max)fail(`${name} must be text of at most ${max} characters.`);return value.trim();}
function slug(value){const result=field(value,'Slug',160).toLowerCase();if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result))fail('Use lowercase letters, numbers and single hyphens in the slug.');return result;}
const mediaPath=/^\/media\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-(original|800|400)\.webp$/;
function blobHost(){const host=process.env.BLOB_PUBLIC_HOST||'';return /^[a-z0-9][a-z0-9-]*\.public\.blob\.vercel-storage\.com$/.test(host)?host:null;}
function asset(value){
 if(!value)return '';const result=field(value,'Image URL',2048);
 if(/[\\\u0000-\u001f]/.test(result)||result.split('/').includes('..'))fail('Invalid image URL.');
 if(/^\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.(?:webp|png|jpe?g|avif|svg)$/.test(result)||mediaPath.test(result))return result;
 let url;try{url=new URL(result);}catch{fail('Use an uploaded image or an existing catalogue asset.');}
 if(url.protocol!=='https:'||url.hostname!==blobHost()||url.username||url.password||url.port||url.search||url.hash||!mediaPath.test(url.pathname))fail('Use an uploaded image from the configured media host.');
 return result;
}
function integer(value,name,{min=-100000,max=100000}={}){const result=Number(value);if(!Number.isSafeInteger(result)||result<min||result>max)fail(`${name} must be an integer between ${min} and ${max}.`);return result;}
function actorId(actor){return typeof actor==='string'?actor:actor?.id||actor?.email||null;}
function searchText(payload){
 const values=value=>Array.isArray(value)?value.flatMap(values):value&&typeof value==='object'?Object.values(value).flatMap(values):value==null?[]:[String(value)];
 return ['type','length','pattern','shortDescription','description','specifications','material','variations','notes'].flatMap(key=>values(payload[key])).join(' ').toLowerCase();
}

/** Local SQLite and PostgreSQL share an explicitly namespaced, additive schema. */
export function createCmsStore({db,cloud=false}){
 const pool=db?.pool;
 if(cloud&&!pool)throw new Error('The cloud CMS requires the PostgreSQL pool.');
 if(!pool&&!db?.prepare)throw new Error('The CMS requires a SQLite database or PostgreSQL pool.');
 if(!pool)db.exec('PRAGMA foreign_keys=ON');
 let initialized;
 const dialect=Boolean(pool);
 function adapter(client){return {
  async rows(sql,args=[]){if(dialect){let n=0;return (await client.query(sql.replace(/\?/g,()=>`$${++n}`),args)).rows;}return db.prepare(sql).all(...args);},
  async run(sql,args=[]){if(dialect){let n=0;return (await client.query(sql.replace(/\?/g,()=>`$${++n}`),args)).rowCount;}return Number(db.prepare(sql).run(...args).changes);},
  async exec(sql){if(dialect)await client.query(sql);else db.exec(sql);}
 };}
 function enqueue(fn){const key=pool||db,result=(queues.get(key)||Promise.resolve()).then(fn);queues.set(key,result.catch(()=>{}));return result;}
 async function transaction(fn){return enqueue(async()=>{
  const client=dialect?await pool.connect():db;const sql=adapter(client);
  try{await sql.exec(dialect?'BEGIN':'BEGIN IMMEDIATE');if(dialect)await sql.rows('SELECT pg_advisory_xact_lock(73501921)');const result=await fn(sql);await sql.exec('COMMIT');return result;}
  catch(error){try{await sql.exec('ROLLBACK');}catch{}if(error.code==='23505'||/UNIQUE constraint failed/.test(error.message))fail('A record with this SKU, slug, email or URL already exists.','CONFLICT',409);throw error;}
  finally{if(dialect)client.release();}
 });}
 async function read(fn){await ready();return enqueue(()=>fn(adapter(pool||db)));}
 async function audit(sql,action,id,actor,payload={}){await sql.run('INSERT INTO se_cms_audit(id,actor,action,entity_id,payload,created_at) VALUES(?,?,?,?,?,?)',[randomUUID(),actorId(actor),action,id,JSON.stringify(payload),Date.now()]);}
 async function ready(){
  if(!initialized)initialized=transaction(async sql=>{
   await sql.exec(schema);
   const columns=await sql.rows(dialect?"SELECT column_name AS name FROM information_schema.columns WHERE table_name='se_cms_products'":'PRAGMA table_info(se_cms_products)');
   if(!columns.some(column=>column.name==='search_text'))await sql.exec("ALTER TABLE se_cms_products ADD COLUMN search_text TEXT NOT NULL DEFAULT ''");
   if(!(await sql.rows('SELECT value FROM se_cms_meta WHERE key=?',['search_text_v1'])).length){
    for(const row of await sql.rows('SELECT id,payload FROM se_cms_products'))await sql.run('UPDATE se_cms_products SET search_text=? WHERE id=?',[searchText(parse(row.payload)),row.id]);
    await sql.run('INSERT INTO se_cms_meta(key,value) VALUES(?,?) ON CONFLICT DO NOTHING',['search_text_v1',String(Date.now())]);
   }
   if((await sql.rows('SELECT value FROM se_cms_meta WHERE key=?',['catalogue_seed_v1'])).length)return;
   const now=Date.now();
   for(let i=0;i<seedCategories.length;i++){
    const c=seedCategories[i];await sql.run('INSERT INTO se_cms_categories(id,slug,name,status,priority,payload,revision,created_at,updated_at) VALUES(?,?,?,?,?,?,1,?,?) ON CONFLICT DO NOTHING',[c.id,c.id,c.name,'published',i,JSON.stringify({...c,imageUrl:''}),now,now]);
   }
   for(let i=0;i<seedProducts.length;i++){
    const p=seedProducts[i],id=randomUUID();await sql.run('INSERT INTO se_cms_products(id,code,slug,name,category_id,status,featured,priority,payload,search_text,revision,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,1,?,?) ON CONFLICT DO NOTHING',[id,p.code,p.code,p.name,p.category,'published',[4,0,1].includes(i)?1:0,i,JSON.stringify({...p,sourcePage:p.page}),searchText(p),now,now]);
    const row=(await sql.rows('SELECT id FROM se_cms_products WHERE code=?',[p.code]))[0];
    if(row){await sql.run('INSERT INTO se_cms_aliases(alias,product_id) VALUES(?,?) ON CONFLICT DO NOTHING',[p.code.toLowerCase(),row.id]);await sql.run('INSERT INTO se_cms_product_images(id,product_id,media_id,url,small_url,medium_url,alt,position) VALUES(?,?,NULL,?,?,?,?,0) ON CONFLICT DO NOTHING',[randomUUID(),row.id,p.image,p.image,p.image,p.name]);}
   }
   await sql.run('INSERT INTO se_cms_meta(key,value) VALUES(?,?) ON CONFLICT DO NOTHING',['catalogue_seed_v1',String(now)]);
  }).catch(error=>{initialized=undefined;throw error;});
  return initialized;
 }
 function categoryObject(row){return {...parse(row.payload),id:row.id,slug:row.slug,name:row.name,status:row.status,priority:Number(row.priority),revision:Number(row.revision),createdAt:Number(row.created_at),updatedAt:Number(row.updated_at)};}
 async function hydrate(sql,rows){
  if(!rows.length)return [];
  const images=await sql.rows(`SELECT * FROM se_cms_product_images WHERE product_id IN (${rows.map(()=>'?').join(',')}) ORDER BY position,id`,rows.map(r=>r.id));
  const byProduct=new Map();for(const item of images){if(!byProduct.has(item.product_id))byProduct.set(item.product_id,[]);byProduct.get(item.product_id).push(item);}
  return rows.map(row=>{
   const payload=parse(row.payload),gallery=(byProduct.get(row.id)||[]).map(i=>({id:i.media_id||i.id,mediaId:i.media_id||null,url:i.url,smallUrl:i.small_url||i.url,mediumUrl:i.medium_url||i.url,alt:i.alt,position:Number(i.position)}));
   return {...payload,id:row.id,code:row.code,slug:row.slug,name:row.name,categoryId:row.category_id,category:row.category_slug,status:row.status,featured:Boolean(row.featured),priority:Number(row.priority),revision:Number(row.revision),createdAt:Number(row.created_at),updatedAt:Number(row.updated_at),images:gallery,image:gallery[0]?.url||payload.image||null};
  });
 }
 const selectProducts='SELECT p.*,c.slug AS category_slug FROM se_cms_products p JOIN se_cms_categories c ON c.id=p.category_id';
 function productFilter({all=false,q='',category='',status='',type='',featured=false}={}){
  const where=[],args=[];if(!all)where.push("p.status='published' AND c.status='published'");
  if(category){where.push('(c.slug=? OR c.id=?)');args.push(category,category);}
  if(status){if(!states.has(status))fail('Invalid status.');where.push('p.status=?');args.push(status);}
  if(featured)where.push('p.featured=1');
  if(type){where.push(dialect?"lower(p.payload::json->>'type')=?":"lower(json_extract(p.payload,'$.type'))=?");args.push(String(type).toLowerCase());}
  for(const term of String(q).toLowerCase().trim().split(/\s+/).filter(Boolean).slice(0,20)){where.push("(lower(p.name) LIKE ? ESCAPE '!' OR lower(p.code) LIKE ? ESCAPE '!' OR p.search_text LIKE ? ESCAPE '!')");const match=`%${term.replace(/[!%_]/g,'!$&')}%`;args.push(match,match,match);}
  const filter=where.length?` WHERE ${where.join(' AND ')}`:'';
  return {filter,args};
 }
 async function products({all=false,q='',category='',status='',page=1,limit=20,sort='catalogue',type='',featured=false,light=false}={}){return read(async sql=>{
  page=integer(page,'Page',{min:1,max:1000000});limit=integer(limit,'Limit',{min:1,max:10000});
  const {filter,args}=productFilter({all,q,category,status,type,featured});
  const total=Number((await sql.rows(`SELECT count(*) AS n FROM se_cms_products p JOIN se_cms_categories c ON c.id=p.category_id${filter}`,args))[0].n);
  const order=sort==='updated'?'p.updated_at DESC,p.id ASC':'p.featured DESC,p.priority ASC,p.name ASC,p.id ASC';
  const rows=await sql.rows(`${selectProducts}${filter} ORDER BY ${order} LIMIT ? OFFSET ?`,[...args,limit,(page-1)*limit]);
  return {items:light?rows.map(row=>({id:row.id,slug:row.slug,updatedAt:Number(row.updated_at)})):await hydrate(sql,rows),total,page,pages:Math.max(1,Math.ceil(total/limit))};
 });}
 async function catalogueSummary(){return read(async sql=>{const filter=" FROM se_cms_products p JOIN se_cms_categories c ON c.id=p.category_id WHERE p.status='published' AND c.status='published'";const counts=await sql.rows('SELECT c.slug,count(*) AS n'+filter+' GROUP BY c.slug');const expression=dialect?"p.payload::json->>'type'":"json_extract(p.payload,'$.type')";const types=await sql.rows('SELECT DISTINCT '+expression+' AS type'+filter);return {total:counts.reduce((n,row)=>n+Number(row.n),0),categoryCounts:Object.fromEntries(counts.map(row=>[row.slug,Number(row.n)])),types:types.map(row=>row.type).filter(Boolean).sort()};});}
 async function categories({all=false}={}){return read(async sql=>(await sql.rows(`SELECT * FROM se_cms_categories${all?'':" WHERE status='published'"} ORDER BY priority,name,id`)).map(categoryObject));}
 async function product(idOrSlug,{all=false}={}){return read(async sql=>{
  const key=String(idOrSlug),rows=await sql.rows(`${selectProducts} WHERE (p.id=? OR p.slug=? OR lower(p.code)=? OR p.id IN (SELECT product_id FROM se_cms_aliases WHERE alias=?))${all?'':" AND p.status='published' AND c.status='published'"} LIMIT 1`,[key,key,key.toLowerCase(),key.toLowerCase()]);return (await hydrate(sql,rows))[0]||null;
 });}
 async function redirect(oldSlug){return read(async sql=>{
  const row=(await sql.rows("SELECT p.slug FROM se_cms_redirects r JOIN se_cms_products p ON p.id=r.product_id JOIN se_cms_categories c ON c.id=p.category_id WHERE r.slug=? AND p.status='published' AND c.status='published'",[oldSlug]))[0];return row?.slug&&row.slug!==oldSlug?row.slug:null;
 });}
 async function saveProduct(input,actor){await ready();return transaction(sql=>saveProductInTransaction(sql,input,actor));}
 function assertPublicationCategory(category,status){
  if(!category||category.status==='archived')fail('Select an active category.');
  if(status==='published'&&category.status!=='published')fail('Publish the category before publishing this product.');
 }
 async function saveProductInTransaction(sql,input,actor,{allowReview=true}={}){
  const existing=input.id?(await sql.rows('SELECT * FROM se_cms_products WHERE id=?',[input.id]))[0]:null;
  if(input.id&&!existing)fail('Product not found.','NOT_FOUND',404);
  if(existing&&Number(input.revision)!==Number(existing.revision))fail('This product changed. Reload it before saving.','CONFLICT',409);
  const base=existing?{...parse(existing.payload),code:existing.code,slug:existing.slug,name:existing.name,status:existing.status,categoryId:existing.category_id,featured:Boolean(existing.featured),priority:existing.priority}:{status:'draft',featured:false,priority:0};
  const data={...base,...input};const id=existing?.id||randomUUID(),code=field(data.code,'SKU',100),name=field(data.name,'Name',200),urlSlug=slug(data.slug||code.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
  if(!code||!name)fail('SKU and name are required.');if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(code))fail('SKU must use letters, numbers, dots, underscores or hyphens without spaces.');if(!states.has(data.status))fail('Invalid publication status.');
  const categoryKey=input.categoryId||input.category||base.categoryId;
  const category=(await sql.rows('SELECT * FROM se_cms_categories WHERE id=? OR slug=?',[categoryKey||'',categoryKey||'']))[0];
  assertPublicationCategory(category,data.status);
  const occupied=(await sql.rows('SELECT product_id FROM se_cms_aliases WHERE alias=? UNION SELECT product_id FROM se_cms_redirects WHERE slug=?',[urlSlug,urlSlug])).some(r=>r.product_id!==id);
  if(occupied)fail('This slug is reserved by another product.','CONFLICT',409);
  const namespaceConflict=(await sql.rows('SELECT id FROM se_cms_products WHERE id!=? AND (lower(code)=? OR slug=?)',[id,urlSlug,code.toLowerCase()])).length;
  if(namespaceConflict)fail('The SKU or slug belongs to another product.','CONFLICT',409);
  if((await sql.rows('SELECT product_id FROM se_cms_redirects WHERE slug=?',[code.toLowerCase()])).some(r=>r.product_id!==id))fail('This SKU is reserved by another product.','CONFLICT',409);
  const aliasCode=(await sql.rows('SELECT product_id FROM se_cms_aliases WHERE alias=?',[code.toLowerCase()]))[0];if(aliasCode&&aliasCode.product_id!==id)fail('This SKU belongs to another product.','CONFLICT',409);
  const priority=integer(data.priority,'Priority'),featured=data.featured===true||data.featured===1||data.featured==='true';
  const payload={};for(const key of ['type','length','pattern','shortDescription','description','material','notes','seoTitle','metaDescription','alt'])payload[key]=field(data[key]??'',key,key==='description'?50000:key==='shortDescription'?1000:key==='seoTitle'?200:key==='metaDescription'?500:20000);
  for(const key of ['specifications','variations']){payload[key]=data[key]??'';if(JSON.stringify(payload[key]).length>50000)fail(`${key} is too long.`);}
  for(const key of ['page','sourcePage']){const value=data[key];payload[key]=value==null||value===''?null:integer(value,key,{min:1,max:10000});}
  for(const [key,max] of [['sourceDocument',1000],['imageEvidence',2000],['reviewNotes',4000]])payload[key]=field(data[key]??'',key,max);
  payload.image=Array.isArray(input.images)&&input.images.length===0?'':asset(data.image||'');const now=Date.now();
  if(existing){await sql.run('UPDATE se_cms_products SET code=?,slug=?,name=?,category_id=?,status=?,featured=?,priority=?,payload=?,search_text=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?',[code,urlSlug,name,category.id,data.status,featured?1:0,priority,JSON.stringify(payload),searchText(payload),now,id,existing.revision]);
   if(existing.slug!==urlSlug)await sql.run('INSERT INTO se_cms_redirects(slug,product_id) VALUES(?,?) ON CONFLICT(slug) DO UPDATE SET product_id=excluded.product_id',[existing.slug,id]);
  }else await sql.run('INSERT INTO se_cms_products(id,code,slug,name,category_id,status,featured,priority,payload,search_text,revision,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,1,?,?)',[id,code,urlSlug,name,category.id,data.status,featured?1:0,priority,JSON.stringify(payload),searchText(payload),now,now]);
  if(input.images!==undefined){
   if(!Array.isArray(input.images)||input.images.length>20)fail('Provide at most 20 product images.');
   await sql.run('DELETE FROM se_cms_product_images WHERE product_id=?',[id]);
   for(let position=0;position<input.images.length;position++){
    const item=input.images[position];if(!item||typeof item!=='object')fail('Invalid image.');
    const mediaKey=item.mediaId||item.id;let media=mediaKey?(await sql.rows('SELECT * FROM se_cms_media WHERE id=?',[mediaKey]))[0]:null;
    if(media)media=parse(media.payload);
    // Existing seeded images have an image-link ID rather than an uploaded media ID.
    if(mediaKey&&!media&&!item.url)fail('Image not found.');
    const url=asset(media?.url||item.url);if(!url)fail('Image URL required.');
    await sql.run('INSERT INTO se_cms_product_images(id,product_id,media_id,url,small_url,medium_url,alt,position) VALUES(?,?,?,?,?,?,?,?)',[randomUUID(),id,media?mediaKey:null,url,asset(media?.smallUrl||item.smallUrl||url),asset(media?.mediumUrl||item.mediumUrl||url),field(item.alt??media?.alt??name,'Image alt',1000),position]);
   }
  }
  const saved=(await hydrate(sql,await sql.rows(`${selectProducts} WHERE p.id=?`,[id])))[0];
  payload.verification=sourceReview(saved,existing?parse(existing.payload).verification:null,allowReview?(input.reviewAction||'keep'):'keep',actorId(actor));
  saved.verification=payload.verification;
  if(data.status==='published')assertSourceReviewed(saved);
  await sql.run('UPDATE se_cms_products SET payload=? WHERE id=?',[JSON.stringify(payload),id]);
  const explicitReview=allowReview&&['verify','revoke'].includes(input.reviewAction);
  const invalidated=existing&&parse(existing.payload).verification?.status==='verified'&&payload.verification.status!=='verified';
  if(explicitReview||invalidated)await audit(sql,'product.review',id,actor,{...payload.verification,action:explicitReview?input.reviewAction:'invalidated',sourceDocument:payload.sourceDocument,sourcePage:payload.sourcePage,imageEvidence:payload.imageEvidence,reviewNotes:payload.reviewNotes});
  await audit(sql,existing?'product.update':'product.create',id,actor,{code,slug:urlSlug,status:data.status,revision:existing?Number(existing.revision)+1:1});
  return saved;
 }
 async function archiveProduct(id,actor){await ready();return transaction(async sql=>{
  const row=(await sql.rows('SELECT id,status FROM se_cms_products WHERE id=?',[id]))[0];if(!row)fail('Product not found.','NOT_FOUND',404);
  await sql.run("UPDATE se_cms_products SET status='archived',revision=revision+1,updated_at=? WHERE id=?",[Date.now(),id]);await audit(sql,'product.archive',id,actor);return true;
 });}
 async function saveCategory(input,actor){await ready();return transaction(async sql=>{
  const existing=input.id?(await sql.rows('SELECT * FROM se_cms_categories WHERE id=?',[input.id]))[0]:null;
  if(input.id&&!existing)fail('Category not found.','NOT_FOUND',404);
  if(existing&&Number(input.revision)!==Number(existing.revision))fail('This category changed. Reload before saving.','CONFLICT',409);
  const data={...(existing?categoryObject(existing):{status:'draft',priority:0}),...input};const id=existing?.id||randomUUID(),urlSlug=slug(data.slug||data.name?.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')),name=field(data.name,'Name',200);
  if(!name)fail('Category name required.');if(!states.has(data.status))fail('Invalid category status.');
  if(existing&&data.status!=='published'&&existing.status==='published'&&(await sql.rows("SELECT id FROM se_cms_products WHERE category_id=? AND status='published' LIMIT 1",[id])).length)fail('Move or unpublish this category’s published products first.','CATEGORY_IN_USE',409);
  if(data.status==='archived'&&(await sql.rows("SELECT id FROM se_cms_products WHERE category_id=? AND status!='archived' LIMIT 1",[id])).length)fail('Move or archive this category’s products first.','CATEGORY_IN_USE',409);
  const payload={description:field(data.description||'','Description',20000),image:existing?parse(existing.payload).image||null:null,imageUrl:asset(data.imageUrl||''),pdf:field(data.pdf||'','Catalogue PDF',200),pages:data.pages?integer(data.pages,'Pages',{min:1,max:10000}):null};
  if(payload.pdf&&!/^[a-zA-Z0-9._-]+\.pdf$/i.test(payload.pdf))fail('Use a catalogue PDF filename.');const now=Date.now(),priority=integer(data.priority,'Priority');
  if(existing)await sql.run('UPDATE se_cms_categories SET slug=?,name=?,status=?,priority=?,payload=?,revision=revision+1,updated_at=? WHERE id=?',[urlSlug,name,data.status,priority,JSON.stringify(payload),now,id]);
  else await sql.run('INSERT INTO se_cms_categories(id,slug,name,status,priority,payload,revision,created_at,updated_at) VALUES(?,?,?,?,?,?,1,?,?)',[id,urlSlug,name,data.status,priority,JSON.stringify(payload),now,now]);
  await audit(sql,existing?'category.update':'category.create',id,actor,{slug:urlSlug,status:data.status});return categoryObject((await sql.rows('SELECT * FROM se_cms_categories WHERE id=?',[id]))[0]);
 });}
 async function archiveCategory(id,actor){await ready();return transaction(async sql=>{
  const row=(await sql.rows('SELECT id FROM se_cms_categories WHERE id=?',[id]))[0];if(!row)fail('Category not found.','NOT_FOUND',404);
  if((await sql.rows("SELECT id FROM se_cms_products WHERE category_id=? AND status!='archived' LIMIT 1",[id])).length)fail('Move or archive this category’s products first.','CATEGORY_IN_USE',409);
  await sql.run("UPDATE se_cms_categories SET status='archived',revision=revision+1,updated_at=? WHERE id=?",[Date.now(),id]);await audit(sql,'category.archive',id,actor);return true;
 });}
 async function media(){return read(async sql=>(await sql.rows('SELECT * FROM se_cms_media ORDER BY created_at DESC,id')).map(row=>({...parse(row.payload),id:row.id,createdAt:Number(row.created_at)})));}
 async function getMedia(id){return read(async sql=>{const row=(await sql.rows('SELECT * FROM se_cms_media WHERE id=?',[id]))[0];return row?{...parse(row.payload),id:row.id,createdAt:Number(row.created_at)}:null;});}
 async function saveMedia(input,actor){await ready();return transaction(async sql=>{
  const id=input.id||randomUUID(),existing=(await sql.rows('SELECT * FROM se_cms_media WHERE id=?',[id]))[0];
  const data={...input,id,url:asset(input.url),smallUrl:asset(input.smallUrl||input.url),mediumUrl:asset(input.mediumUrl||input.url),alt:field(input.alt||'','Image alt',1000)};
  if(cloud&&(!blobHost()||![data.url,data.smallUrl,data.mediumUrl].every(url=>url.startsWith(`https://${blobHost()}/media/`))))fail('Configure BLOB_PUBLIC_HOST before saving cloud media.','MEDIA_UNAVAILABLE',503);
  if(!data.url)fail('Image URL required.');if(JSON.stringify(data).length>20000)fail('Invalid media metadata.');
  await sql.run('INSERT INTO se_cms_media(id,url,payload,created_at) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET url=excluded.url,payload=excluded.payload',[id,data.url,JSON.stringify(data),Date.now()]);await audit(sql,existing?'media.update':'media.create',id,actor);return {...data,createdAt:Number(existing?.created_at||Date.now())};
 });}
 async function deleteMedia(id,actor){await ready();return transaction(async sql=>{
  const row=(await sql.rows('SELECT * FROM se_cms_media WHERE id=?',[id]))[0];if(!row)return false;
  const linked=(await sql.rows('SELECT id FROM se_cms_product_images WHERE media_id=? OR url=? LIMIT 1',[id,row.url])).length;
  const categoryLinked=(await sql.rows('SELECT payload FROM se_cms_categories')).some(c=>parse(c.payload).imageUrl===row.url);
  const legacyLinked=(await sql.rows('SELECT payload FROM se_cms_products')).some(p=>parse(p.payload).image===row.url);
  if(linked||categoryLinked||legacyLinked)fail('Remove this image from its products or categories first.','MEDIA_IN_USE',409);
  await sql.run('DELETE FROM se_cms_media WHERE id=?',[id]);await audit(sql,'media.delete',id,actor);return true;
 });}
 function adminObject(row){return row?{id:row.id,email:row.email,passwordHash:row.password_hash,createdAt:Number(row.created_at)}:null;}
 async function adminCount(){return read(async sql=>Number((await sql.rows('SELECT count(*) AS n FROM se_cms_admins'))[0].n));}
 async function adminByEmail(email){return read(async sql=>adminObject((await sql.rows('SELECT * FROM se_cms_admins WHERE email=?',[String(email).toLowerCase().trim()]))[0]));}
 async function adminById(id){return read(async sql=>adminObject((await sql.rows('SELECT * FROM se_cms_admins WHERE id=?',[id]))[0]));}
 async function createAdmin({email,passwordHash}){await ready();return transaction(async sql=>{
  email=field(email,'Email',254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail('Invalid email.');if(typeof passwordHash!=='string'||passwordHash.length<32)fail('A secure password hash is required.');
  const id=randomUUID(),now=Date.now();await sql.run('INSERT INTO se_cms_admins(id,email,password_hash,created_at,updated_at) VALUES(?,?,?,?,?)',[id,email,passwordHash,now,now]);await audit(sql,'admin.create',id,id);return {id,email,createdAt:now};
 });}
 async function updatePassword(id,passwordHash){await ready();return transaction(async sql=>{
  if(typeof passwordHash!=='string'||passwordHash.length<32)fail('A secure password hash is required.');const changed=await sql.run('UPDATE se_cms_admins SET password_hash=?,updated_at=? WHERE id=?',[passwordHash,Date.now(),id]);if(!changed)fail('Admin not found.','NOT_FOUND',404);
  await sql.run('DELETE FROM se_cms_sessions WHERE user_id=?',[id]);await audit(sql,'admin.password',id,id);return true;
 });}
 async function createSession(input){await ready();return transaction(async sql=>{
  const token=input.tokenHash||input.id,expires=timestamp(input.expiresAt);if(!/^[a-f0-9]{64}$/i.test(token||'')||!Number.isFinite(expires)||expires<=Date.now()||typeof input.csrfToken!=='string'||input.csrfToken.length<16)fail('Invalid session.');
  await sql.run('DELETE FROM se_cms_sessions WHERE expires_at<=?',[Date.now()]);await sql.run('INSERT INTO se_cms_sessions(token_hash,user_id,csrf_token,expires_at,created_at) VALUES(?,?,?,?,?)',[token,input.userId,input.csrfToken,expires,Date.now()]);return {userId:input.userId,csrfToken:input.csrfToken,expiresAt:expires};
 });}
 async function session(token){return read(async sql=>{const row=(await sql.rows('SELECT s.*,a.email FROM se_cms_sessions s JOIN se_cms_admins a ON a.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?',[token,Date.now()]))[0];return row?{userId:row.user_id,email:row.email,csrfToken:row.csrf_token,expiresAt:Number(row.expires_at)}:null;});}
 async function deleteSession(token){await ready();return transaction(sql=>sql.run('DELETE FROM se_cms_sessions WHERE token_hash=?',[token]));}
 async function deleteUserSessions(id){await ready();return transaction(sql=>sql.run('DELETE FROM se_cms_sessions WHERE user_id=?',[id]));}
 async function loginLimit(key){return read(async sql=>{const row=(await sql.rows('SELECT * FROM se_cms_login_limits WHERE key=?',[key]))[0];return !row||(Number(row.window_start)<Date.now()-900000&&Number(row.blocked_until)<=Date.now())?{attempts:0,blockedUntil:0}:{attempts:Number(row.attempts),blockedUntil:Number(row.blocked_until)};});}
 async function recordLoginFailure(key){await ready();return transaction(async sql=>{
  const now=Date.now(),row=(await sql.rows('SELECT * FROM se_cms_login_limits WHERE key=?',[key]))[0],fresh=!row||Number(row.window_start)<now-900000,attempts=fresh?1:Number(row.attempts)+1,blockedUntil=attempts>=5?now+900000:0;
  await sql.run('INSERT INTO se_cms_login_limits(key,attempts,blocked_until,window_start) VALUES(?,?,?,?) ON CONFLICT(key) DO UPDATE SET attempts=excluded.attempts,blocked_until=excluded.blocked_until,window_start=excluded.window_start',[key,attempts,blockedUntil,fresh?now:Number(row.window_start)]);return {attempts,blockedUntil};
 });}
 async function clearLoginFailures(key){await ready();return transaction(sql=>sql.run('DELETE FROM se_cms_login_limits WHERE key=?',[key]));}
 async function recordLoginAttempt({key,success,ip}){await ready();return transaction(async sql=>{
  const now=Date.now();await sql.run('DELETE FROM se_cms_login_attempts WHERE created_at<?',[now-30*86400000]);await sql.run('INSERT INTO se_cms_login_attempts(id,key,success,ip,created_at) VALUES(?,?,?,?,?)',[randomUUID(),key,success?1:0,ip||null,now]);return true;
 });}
 async function loginAttempts(key,since=Date.now()-900000){return read(async sql=>(await sql.rows('SELECT * FROM se_cms_login_attempts WHERE key=? AND created_at>=? ORDER BY created_at DESC LIMIT 1000',[key,timestamp(since)])).map(r=>({key:r.key,success:Boolean(r.success),ip:r.ip,createdAt:Number(r.created_at)})));}
 const terminalRows=new Set(['created','updated','skipped','failed']);
 const importModes=new Set(['create','create_only','skip_existing','update','update_existing','upsert','create_update']);
 function importRow(row){return {rowIndex:Number(row.row_index),sourceRow:Number(row.source_row),data:parse(row.data),plan:parse(row.plan),status:row.status,result:parse(row.result)};}
 async function ownedJob(sql,id,adminId){const row=(await sql.rows('SELECT * FROM se_cms_import_jobs WHERE id=? AND admin_id=?',[id,adminId]))[0];if(!row)fail('Import not found.','NOT_FOUND',404);return row;}
 async function jobObject(sql,row,{rows=true,offset=0,limit=10000}={}){return {id:row.id,adminId:row.admin_id,filename:row.filename,status:row.status,mode:row.mode,config:parse(row.config),payload:parse(row.payload),createdAt:Number(row.created_at),updatedAt:Number(row.updated_at),confirmedAt:row.confirmed_at==null?null:Number(row.confirmed_at),leaseUntil:row.lease_until==null?null:Number(row.lease_until),leaseOwner:row.lease_owner,...(rows?{rows:(await sql.rows('SELECT * FROM se_cms_import_rows WHERE job_id=? ORDER BY row_index LIMIT ? OFFSET ?',[row.id,integer(limit,'Limit',{min:1,max:10000}),integer(offset,'Offset',{min:0,max:10000})])).map(importRow)}:{})};}
 function editable(job){if(job.confirmed_at||!['staged','preview','draft'].includes(job.status))fail('This import can no longer be edited.','CONFLICT',409);}
 function running(job){if(!job.confirmed_at||!['confirmed','running'].includes(job.status))fail('Confirm this import before applying rows.','CONFLICT',409);}
 async function importCreate({adminId,filename,headers=[],rows=[],meta={}}){await ready();
  if(!adminId)fail('An import owner is required.');if(!Array.isArray(rows)||rows.length>10000)fail('Provide at most 10,000 rows.');
  if(Buffer.byteLength(JSON.stringify({headers,rows}))>8*1024*1024)fail('Parsed CSV exceeds the staging limit.');
  return transaction(async sql=>{const active=Number((await sql.rows("SELECT count(*) n FROM se_cms_import_jobs WHERE admin_id=? AND status IN ('staged','draft','preview','confirmed','running')",[adminId]))[0].n);const quota=Math.max(1,Math.min(100,Number(process.env.CMS_IMPORT_ACTIVE_LIMIT)||20));if(active>=quota)fail('Finish or cancel an existing import before starting another.','IMPORT_QUOTA',429);if(Buffer.byteLength(JSON.stringify({headers,meta}))>8*1024*1024)fail('Import metadata is too large.');const id=randomUUID(),now=Date.now();await sql.run('INSERT INTO se_cms_import_jobs(id,admin_id,filename,status,config,payload,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)',[id,adminId,field(filename||'import.csv','Filename',255),'staged','{}',JSON.stringify({...meta,headers}),now,now]);
   for(let offset=0;offset<rows.length;offset+=100){const batch=rows.slice(offset,offset+100);await sql.run(`INSERT INTO se_cms_import_rows(job_id,row_index,source_row,data) VALUES ${batch.map(()=>'(?,?,?,?)').join(',')}`,batch.flatMap((row,index)=>[id,offset+index,Number(row.sourceRow)||offset+index+2,JSON.stringify(row.data??row)]));}
   await audit(sql,'import.create',id,adminId,{filename,rows:rows.length});return jobObject(sql,await ownedJob(sql,id,adminId));});
 }
 async function importGet(id,adminId,options={}){return read(async sql=>{const row=(await sql.rows('SELECT * FROM se_cms_import_jobs WHERE id=? AND admin_id=?',[id,adminId]))[0];return row?jobObject(sql,row,options):null;});}
 async function importList(adminId,{page=1}={}){return read(async sql=>{page=integer(page,'Page',{min:1,max:1000000});const total=Number((await sql.rows('SELECT count(*) n FROM se_cms_import_jobs WHERE admin_id=?',[adminId]))[0].n);const items=[];for(const row of await sql.rows('SELECT * FROM se_cms_import_jobs WHERE admin_id=? ORDER BY created_at DESC,id DESC LIMIT 20 OFFSET ?',[adminId,(page-1)*20])){const item=await jobObject(sql,row,{rows:false});item.stats=await importCounts(sql,row.id);items.push(item);}return {items,total,page,pages:Math.max(1,Math.ceil(total/20))};});}
 async function importUpdate(id,adminId,patch){await ready();return transaction(async sql=>{const job=await ownedJob(sql,id,adminId);editable(job);if(patch.expectedValidationVersion!==undefined&&patch.expectedValidationVersion!==parse(job.config).validationVersion)fail('The preview changed.','CONFLICT',409);const status=patch.status??(patch.config?'staged':job.status);if(!['staged','draft','preview'].includes(status))fail('Invalid import status.');const config=patch.config??parse(job.config),payload=patch.payload??parse(job.payload);if(Buffer.byteLength(JSON.stringify({config,payload}))>8*1024*1024)fail('Import configuration is too large.');await sql.run('UPDATE se_cms_import_jobs SET config=?,payload=?,status=?,updated_at=? WHERE id=?',[JSON.stringify(config),JSON.stringify(payload),status,Date.now(),id]);return importSnapshot(sql,await ownedJob(sql,id,adminId));});}
 async function importSaveRows(id,adminId,rows,validationVersion){await ready();return transaction(async sql=>{
  const job=await ownedJob(sql,id,adminId);editable(job);if(validationVersion!==undefined&&parse(job.config).validationVersion!==validationVersion)fail('The preview changed.','CONFLICT',409);
  if(!Array.isArray(rows)||rows.length>10000)fail('Provide at most 10,000 import rows.');const seen=new Set();
  const updates=rows.map(row=>{const index=integer(row.rowIndex,'Row',{min:0,max:9999});if(seen.has(index))fail('Duplicate import row update.');seen.add(index);const status=row.status??null;if(status!==null&&!['pending','ready','invalid','skipped'].includes(status))fail('Invalid preview row status.');const plan=row.plan==null?null:JSON.stringify({...row.plan,...(validationVersion!==undefined?{validationVersion}:{})});const data=row.data==null?null:JSON.stringify(row.data);if(Buffer.byteLength(plan||'')>512*1024||Buffer.byteLength(data||'')>4*1024*1024)fail('Import row is too large.');return [index,data,plan,status,JSON.stringify(status==='skipped'?{status:'skipped',...(row.result??{})}:row.result??{})];});
  if(dialect){for(let offset=0;offset<updates.length;offset+=50){
   const batch=updates.slice(offset,offset+50),args=[];
   const assignments=['data','plan','status','result'].map((column,position)=>{
    const cases=batch.map(row=>{args.push(row[0],row[position+1]);return `WHEN CAST(? AS INTEGER) THEN ${column==='result'?'CAST(? AS TEXT)':`COALESCE(CAST(? AS TEXT),${column})`}`;}).join(' ');
    return `${column}=CASE row_index ${cases} ELSE ${column} END`;
   });
   args.push(id,...batch.map(row=>row[0]));
   const changed=await sql.run(`UPDATE se_cms_import_rows SET ${assignments.join(',')} WHERE job_id=? AND row_index IN (${batch.map(()=>'?').join(',')})`,args);
   if(changed!==batch.length)fail('Import row not found.','NOT_FOUND',404);
  }}
  else for(const [index,data,plan,status,result] of updates){const changed=await sql.run('UPDATE se_cms_import_rows SET data=COALESCE(?,data),plan=COALESCE(?,plan),status=COALESCE(?,status),result=? WHERE job_id=? AND row_index=?',[data,plan,status,result,id,index]);if(!changed)fail('Import row not found.','NOT_FOUND',404);}
  await sql.run('UPDATE se_cms_import_jobs SET updated_at=? WHERE id=?',[Date.now(),id]);return importSnapshot(sql,await ownedJob(sql,id,adminId));
 });}
 async function importConfirm(id,adminId,{mode,options={},validationVersion}={}){await ready();return transaction(async sql=>{const job=await ownedJob(sql,id,adminId);editable(job);if(job.status!=='preview')fail('Preview this import before confirming.','CONFLICT',409);if(!validationVersion||validationVersion!==parse(job.config).validationVersion)fail('The preview changed. Preview it again.','CONFLICT',409);const planVersion=dialect?"plan::json->>'validationVersion'":"json_extract(plan,'$.validationVersion')";if((await sql.rows(`SELECT row_index FROM se_cms_import_rows WHERE job_id=? AND COALESCE(${planVersion},'')!=? LIMIT 1`,[id,validationVersion])).length)fail('The row preview changed. Validate all rows again.','CONFLICT',409);mode=mode||parse(job.config).mode||'create_only';if(!importModes.has(mode))fail('Invalid import mode.');if(parse(job.config).mode&&mode!==parse(job.config).mode)fail('The import mode changed after preview.','CONFLICT',409);if(['update','update_existing','upsert','create_update'].includes(mode)&&options.backupConfirmed!==true)fail('Confirm a catalogue backup before updating products.');const config={...parse(job.config),mode,options,validationVersion};const now=Date.now();await sql.run("UPDATE se_cms_import_jobs SET status='confirmed',mode=?,config=?,confirmed_at=?,updated_at=? WHERE id=?",[mode,JSON.stringify(config),now,now,id]);await audit(sql,'import.confirm',id,adminId,{mode,validationVersion});return importSnapshot(sql,await ownedJob(sql,id,adminId));});}
 async function importCancel(id,adminId){await ready();return transaction(async sql=>{const job=await ownedJob(sql,id,adminId);if(['complete','completed_with_errors'].includes(job.status))fail('This import has finished.','CONFLICT',409);await sql.run("UPDATE se_cms_import_jobs SET status='cancelled',lease_owner=NULL,lease_until=NULL,updated_at=? WHERE id=?",[Date.now(),id]);await sql.run('DELETE FROM se_cms_import_chunks WHERE job_id=?',[id]);await audit(sql,'import.cancel',id,adminId);return importSnapshot(sql,await ownedJob(sql,id,adminId));});}
 async function importLease(id,adminId,token,ttl=30000){await ready();return transaction(async sql=>{const job=await ownedJob(sql,id,adminId);running(job);token=field(token,'Lease owner',200);if(!token)fail('Lease owner required.');const now=Date.now();if(job.lease_owner&&job.lease_owner!==token&&Number(job.lease_until)>now)return false;await sql.run("UPDATE se_cms_import_jobs SET lease_owner=?,lease_until=?,status='running',updated_at=? WHERE id=?",[token,now+integer(ttl,'Lease duration',{min:1000,max:120000}),now,id]);return true;});}
 async function importRelease(id,adminId,token){await ready();return transaction(async sql=>{await ownedJob(sql,id,adminId);return Boolean(await sql.run('UPDATE se_cms_import_jobs SET lease_owner=NULL,lease_until=NULL WHERE id=? AND lease_owner=?',[id,token]));});}
 function importStats(rows){const stats={total:rows.length,created:0,updated:0,skipped:0,failed:0,pending:0};for(const row of rows)stats[terminalRows.has(row.status)?row.status:'pending']++;return stats;}
 async function rowResult(sql,id,index,result){await sql.run('UPDATE se_cms_import_rows SET status=?,result=? WHERE job_id=? AND row_index=?',[result.status,JSON.stringify(result),id,index]);await sql.run('UPDATE se_cms_import_jobs SET updated_at=? WHERE id=?',[Date.now(),id]);return result;}
 async function recordImportResult(id,adminId,index,result){await ready();return transaction(async sql=>{running(await ownedJob(sql,id,adminId));const row=(await sql.rows('SELECT * FROM se_cms_import_rows WHERE job_id=? AND row_index=?',[id,index]))[0];if(!row)fail('Import row not found.','NOT_FOUND',404);if(terminalRows.has(row.status))return parse(row.result);if(!['failed','skipped'].includes(result.status))fail('Invalid row result.');return rowResult(sql,id,index,result);});}
 async function applyImportRow(id,adminId,index,{input,expectedRevision,categoryCreate}={},actor){await ready();try{return await transaction(async sql=>{
  const job=await ownedJob(sql,id,adminId);const row=(await sql.rows('SELECT * FROM se_cms_import_rows WHERE job_id=? AND row_index=?',[id,index]))[0];if(!row)fail('Import row not found.','NOT_FOUND',404);if(terminalRows.has(row.status))return parse(row.result);running(job);
  const existing=(await sql.rows('SELECT * FROM se_cms_products WHERE lower(code)=?',[String(input?.code||'').toLowerCase()]))[0];
  if(existing&&['create','create_only','skip_existing'].includes(job.mode))return rowResult(sql,id,index,{status:'skipped',reason:'SKU already exists.',productId:existing.id});
  if(!existing&&['update','update_existing'].includes(job.mode))return rowResult(sql,id,index,{status:'skipped',reason:'SKU does not exist.'});
  if(existing&&(expectedRevision==null||Number(expectedRevision)!==Number(existing.revision)||input.id&&input.id!==existing.id))fail('This product changed after preview. Preview the import again.','CONFLICT',409);
  if(!existing&&(expectedRevision!=null||input.id))fail('The previewed product no longer matches.','CONFLICT',409);
  const data={...input,...(existing?{id:existing.id,revision:Number(existing.revision)}:{})};
  if(categoryCreate){const name=field(categoryCreate.name,'Category name',200),normalized=name.toLowerCase().replace(/\s+/g,' ').trim();if(!normalized)fail('Category name required.');const categories=await sql.rows('SELECT * FROM se_cms_categories');let category=categories.find(c=>c.name.toLowerCase().replace(/\s+/g,' ').trim()===normalized);const categorySlug=slug(categoryCreate.slug||name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));category=category||categories.find(c=>c.slug===categorySlug);if(!category){const categoryId=randomUUID(),now=Date.now(),categoryStatus=categoryCreate.status||'draft';if(!['draft','published'].includes(categoryStatus))fail('Invalid import category status.');await sql.run('INSERT INTO se_cms_categories(id,slug,name,status,priority,payload,revision,created_at,updated_at) VALUES(?,?,?,?,?,?,1,?,?)',[categoryId,categorySlug,name,categoryStatus,0,'{}',now,now]);category={id:categoryId};await audit(sql,'category.create',categoryId,actor||adminId,{importJobId:id});}data.categoryId=category.id;}
  const product=await saveProductInTransaction(sql,data,actor||adminId,{allowReview:false});const result={status:existing?'updated':'created',productId:product.id,revision:product.revision,code:product.code};await rowResult(sql,id,index,result);await audit(sql,'import.row',id,actor||adminId,{rowIndex:index,...result});return result;
 });}catch(error){if(['NOT_FOUND'].includes(error.code))throw error;const job=await importGet(id,adminId);if(!job||!job.confirmedAt||!['confirmed','running'].includes(job.status))throw error;return recordImportResult(id,adminId,index,{status:'failed',code:error.code||'IMPORT_ROW_FAILED',message:error.status&&error.status<500?error.message:'The row could not be saved.'});}}
 async function importSnapshot(sql,job){return {...await jobObject(sql,job,{rows:false}),stats:await importCounts(sql,job.id)};}
 async function importCounts(sql,id){const counts=await sql.rows('SELECT status,count(*) AS n FROM se_cms_import_rows WHERE job_id=? GROUP BY status',[id]);const stats={total:0,created:0,updated:0,skipped:0,failed:0,pending:0};for(const row of counts){const n=Number(row.n);stats.total+=n;stats[terminalRows.has(row.status)?row.status:'pending']+=n;}return stats;}
 async function importProgress(id,adminId){return read(async sql=>{const job=await ownedJob(sql,id,adminId);return {...await jobObject(sql,job,{rows:false}),stats:await importCounts(sql,id)};});}
 async function importPendingRows(id,adminId,{limit=5}={}){return read(async sql=>{await ownedJob(sql,id,adminId);return (await sql.rows("SELECT * FROM se_cms_import_rows WHERE job_id=? AND status NOT IN ('created','updated','skipped','failed') ORDER BY row_index LIMIT ?",[id,integer(limit,'Limit',{min:1,max:100})])).map(importRow);});}
 async function importFinalize(id,adminId){await ready();return transaction(async sql=>{const job=await ownedJob(sql,id,adminId);if(['complete','completed_with_errors','cancelled'].includes(job.status)){await sql.run('DELETE FROM se_cms_import_chunks WHERE job_id=?',[id]);return importSnapshot(sql,job);}running(job);const stats=await importCounts(sql,id);if(stats.pending)return importSnapshot(sql,job);const status=stats.failed?'completed_with_errors':'complete';await sql.run('UPDATE se_cms_import_jobs SET status=?,lease_owner=NULL,lease_until=NULL,updated_at=? WHERE id=?',[status,Date.now(),id]);await sql.run('DELETE FROM se_cms_import_chunks WHERE job_id=?',[id]);await audit(sql,'import.finish',id,adminId,stats);return importSnapshot(sql,await ownedJob(sql,id,adminId));});}
 async function importMediaGet(id,adminId,hash){return read(async sql=>{await ownedJob(sql,id,adminId);const row=(await sql.rows('SELECT media_id FROM se_cms_import_media WHERE job_id=? AND hash=?',[id,hash]))[0];return row?{mediaId:row.media_id}:null;});}
 async function importMediaPut(id,adminId,hash,mediaId){await ready();return transaction(async sql=>{running(await ownedJob(sql,id,adminId));if(!/^[a-f0-9]{64}$/.test(hash))fail('Invalid image hash.');if(!(await sql.rows('SELECT id FROM se_cms_media WHERE id=?',[mediaId])).length)fail('Media not found.','NOT_FOUND',404);await sql.run('INSERT INTO se_cms_import_media(job_id,hash,media_id) VALUES(?,?,?) ON CONFLICT DO NOTHING',[id,hash,mediaId]);return {mediaId:(await sql.rows('SELECT media_id FROM se_cms_import_media WHERE job_id=? AND hash=?',[id,hash]))[0].media_id};});}
 async function importChunkPut(id,adminId,{uploadId,partIndex,totalParts,data,kind='zip',filename='archive.zip'}){await ready();return transaction(async sql=>{editable(await ownedJob(sql,id,adminId));uploadId=field(uploadId,'Upload ID',100);if(!uploadId)fail('Upload ID required.');partIndex=integer(partIndex,'Part index',{min:0,max:127});totalParts=integer(totalParts,'Total parts',{min:1,max:128});if(partIndex>=totalParts||typeof data!=='string'||data.length>699052||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(data))fail('Invalid upload chunk.');const bytes=Buffer.from(data,'base64').length;if(bytes>512*1024)fail('Chunk exceeds 512 KiB.');if(!['zip','csv'].includes(kind))fail('Invalid upload kind.');const parts=await sql.rows('SELECT * FROM se_cms_import_chunks WHERE job_id=? AND upload_id=?',[id,uploadId]);const replay=parts.find(p=>Number(p.part_index)===partIndex);if(replay&&replay.data!==data)fail('This chunk was already uploaded with different data.','CONFLICT',409);if(parts.some(p=>Number(p.total_parts)!==totalParts||p.kind!==kind||p.filename!==filename))fail('Upload metadata changed.','CONFLICT',409);const other=parts.filter(p=>Number(p.part_index)!==partIndex).reduce((n,p)=>n+Number(p.byte_size),0);const all=await sql.rows('SELECT byte_size,upload_id,part_index,kind FROM se_cms_import_chunks WHERE job_id=?',[id]);const total=all.filter(p=>!(p.upload_id===uploadId&&Number(p.part_index)===partIndex)&&p.kind===kind).reduce((n,p)=>n+Number(p.byte_size),0)+bytes;if(all.filter(p=>!(p.upload_id===uploadId&&Number(p.part_index)===partIndex)).reduce((n,p)=>n+Number(p.byte_size),0)+bytes>64*1024*1024||other+bytes>(kind==='csv'?4:64)*1024*1024||total>(kind==='csv'?4:64)*1024*1024)fail('Upload exceeds the size limit.');await sql.run('INSERT INTO se_cms_import_chunks(job_id,upload_id,part_index,data,byte_size,total_parts,kind,filename,created_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(job_id,upload_id,part_index) DO UPDATE SET data=excluded.data,byte_size=excluded.byte_size',[id,uploadId,partIndex,data,bytes,totalParts,kind,field(filename,'Filename',255),Date.now()]);return {uploadId,partIndex,totalParts,bytes};});}
 async function importChunkGet(id,adminId,uploadId){return read(async sql=>{await ownedJob(sql,id,adminId);return (await sql.rows('SELECT * FROM se_cms_import_chunks WHERE job_id=? AND upload_id=? ORDER BY part_index',[id,uploadId])).map(row=>({uploadId:row.upload_id,partIndex:Number(row.part_index),totalParts:Number(row.total_parts),data:row.data,bytes:Number(row.byte_size),kind:row.kind,filename:row.filename}));});}
 async function importChunkDelete(id,adminId,uploadId){await ready();return transaction(async sql=>{await ownedJob(sql,id,adminId);return sql.run('DELETE FROM se_cms_import_chunks WHERE job_id=? AND upload_id=?',[id,uploadId]);});}
 return {...createBulkPublishStore({read,ready,transaction,audit,productFilter,assertPublicationCategory,hydrate}),ready,products,catalogueSummary,categories,product,redirect,saveProduct,archiveProduct,saveCategory,archiveCategory,media,listMedia:media,getMedia,saveMedia,deleteMedia,adminCount,createAdmin,adminByEmail,findAdmin:adminByEmail,adminById,updatePassword,createSession,session,getSession:session,deleteSession,deleteUserSessions,loginLimit,recordLoginFailure,clearLoginFailures,recordLoginAttempt,loginAttempts,importCreate,importGet,importList,importUpdate,importSaveRows,importConfirm,importCancel,importLease,importRelease,applyImportRow,recordImportResult,importFinalize,importChunkPut,importChunkGet,importChunkDelete,importProgress,importPendingRows,importMediaGet,importMediaPut};
}
