import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import sharp from 'sharp';
import {openStore} from '../src/store.js';
import {createCmsStore} from '../src/cms/store.js';
import {createMediaService} from '../src/cms/media.js';
import {createImportService} from '../src/cms/import-service.js';
import {parseImportCsv,safeCsv,scanZip} from '../src/cms/import-utils.js';
async function fixture(run){const dir=mkdtempSync(join(tmpdir(),'import-service-')),db=openStore(dir),repo=createCmsStore({db}),media=createMediaService({repo,dataDir:dir}),service=createImportService({repo,media});try{await repo.ready();await run(service,repo,media,db);}finally{db.close();rmSync(dir,{recursive:true,force:true});}}
const csv=(count,extra='')=>Buffer.from('sku,name,category'+(extra?',description':'')+'\r\n'+Array.from({length:count},(_,i)=>`IMP-${i},Demonstration ${i},Surgical Instruments${extra?','+extra:''}`).join('\r\n'));
async function prepared(s,buffer,config={}){const job=await s.create({csv:buffer,filename:'test.csv',userId:'owner'});return s.configure(job.id,{mapping:job.mapping,mode:'add',...config},'owner');}
async function finish(s,id){await s.confirm(id,{backupAcknowledged:true},'owner');let job;do{job=await s.advance(id,'owner');}while(job.status==='running');return job;}
function zip(entries){let offset=0;const local=[],central=[];for(const [name,bytes] of entries){const n=Buffer.from(name),b=Buffer.from(bytes);let crc=0xffffffff;for(const byte of b){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}crc=(crc^0xffffffff)>>>0;const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt32LE(crc,14);h.writeUInt32LE(b.length,18);h.writeUInt32LE(b.length,22);h.writeUInt16LE(n.length,26);local.push(h,n,b);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt32LE(crc,16);c.writeUInt32LE(b.length,20);c.writeUInt32LE(b.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);central.push(c,n);offset+=h.length+n.length+b.length;}const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...local,directory,end]);}

test('CSV strict UTF8, BOM, quoted linebreaks, original row numbers and safe exports',()=>{const result=parseImportCsv(Buffer.from('\ufeffsku,name,category,description\r\nA,One,Tools,"first, line\r\nsecond"\r\nB,Two,Tools,plain\r\n'));assert.equal(result.rows[0].row,2);assert.equal(result.rows[1].row,4);assert.match(result.rows[0].values[3],/first, line\r\nsecond/);assert.throws(()=>parseImportCsv(Buffer.from([0xff,0xfe])));assert.throws(()=>parseImportCsv(Buffer.from('sku,name\nA,"oops')));assert.throws(()=>parseImportCsv(Buffer.from('sku,name\nA,One,extra')));assert.match(safeCsv([['=HYPERLINK("x")','  +calc','@SUM(A1)']]),/'=HYPERLINK/);});
for(const count of [10,500,1000])test(`real store import ${count} rows is preview-inert, bounded and repeat-safe`,()=>fixture(async(s,repo)=>{const before=(await repo.products({all:true})).total;const job=await prepared(s,csv(count));assert.equal(job.counts.invalid,0,JSON.stringify(job.preview[0]));assert.equal(job.counts.new,count);assert.equal((await repo.products({all:true})).total,before);await s.confirm(job.id,{},'owner');let first=await s.advance(job.id,'owner');assert.equal(first.counts.created,Math.min(5,count));let resumed=createImportService({repo,media:{}});let done;do{done=await resumed.advance(job.id,'owner');}while(done.status==='running');assert.equal(done.counts.created,count);assert.equal(done.status,'completed');assert.equal((await s.advance(job.id,'owner')).counts.created,count);assert.equal((await repo.products({all:true})).total,before+count);assert.equal(await repo.product('IMP-0'),null);}));
test('duplicate SKUs, ambiguous mapping and unresolved categories stay visible',()=>fixture(async(s)=>{let job=await prepared(s,Buffer.from('sku,name,category\nDUP,One,Unknown\ndup,Two,Unknown'));assert.equal(job.counts.duplicates,2);assert.equal(job.counts.invalid,2);assert.deepEqual(job.unresolvedCategories,['Unknown']);await assert.rejects(s.confirm(job.id,{},'owner'));job=await s.create({csv:Buffer.from('sku,Product Code,name,category\nA,B,One,Surgical Instruments'),userId:'owner'});assert.deepEqual(job.ambiguities.sku,['sku','Product Code']);assert.equal(job.mapping.sku,undefined);await assert.rejects(s.configure(job.id,{mapping:{sku:'sku',name:'sku',category:'category'}},'owner'));}));
test('updates preserve blanks, IDs, URLs, images and metadata unless individual clear is selected',()=>fixture(async(s,repo)=>{const existing=await repo.product('003-004-00',{all:true});await repo.saveProduct({...existing,status:'draft',description:'Verified description',seoTitle:'Existing SEO'},'owner');const buffer=Buffer.from(`sku,name,category,description,seo_title\n${existing.code},Updated name,Surgical Instruments,,`);let job=await prepared(s,buffer,{mode:'update'});assert.equal(job.preview[0].changes.description,undefined);const done=await finish(s,job.id);assert.equal(done.counts.updated,1);const updated=await repo.product(existing.id,{all:true});assert.equal(updated.description,'Verified description');assert.equal(updated.seoTitle,'Existing SEO');assert.equal(updated.slug,existing.slug);assert.deepEqual(updated.images.map(i=>i.url),existing.images.map(i=>i.url));job=await prepared(s,buffer,{mode:'update',clearEmpty:['description']});await finish(s,job.id);assert.equal((await repo.product(existing.id,{all:true})).description,'');assert.equal((await repo.product(existing.id,{all:true})).seoTitle,'Existing SEO');}));
test('cancel, owner isolation, stale preview revisions and add/update modes',()=>fixture(async(s,repo)=>{let job=await prepared(s,csv(10));await assert.rejects(s.get(job.id,'intruder'),{status:404});await s.cancel(job.id,'owner');await assert.rejects(s.confirm(job.id,{},'owner'));assert.equal(await repo.product('IMP-0',{all:true}),null);job=await prepared(s,csv(1),{mode:'update'});assert.equal(job.preview[0].action,'skip');const existing=await repo.product('003-004-00',{all:true});await repo.saveProduct({...existing,status:'draft'},'owner');const current=await repo.product(existing.id,{all:true});job=await prepared(s,Buffer.from(`sku,name,category\n${existing.code},Older edit,Surgical Instruments`),{mode:'update'});await repo.saveProduct({...current,name:'Newer edit'},'owner');const done=await finish(s,job.id);assert.equal(done.counts.failed,1);assert.equal((await repo.product(existing.id,{all:true})).name,'Newer edit');}));
test('ZIP validates bytes before confirmation, uses UTF8 names, dedupes reused photos and supports multiple images',()=>fixture(async(s,repo,media)=>{const image=await sharp({create:{width:20,height:10,channels:3,background:'white'}}).png().toBuffer();const bytes=zip([['images/photo one.png',image],['images/صورة.png',image]]);let job=await s.create({csv:Buffer.from('sku,name,category,image_filename,additional_images\nZIP-1,One,Surgical Instruments,photo one.png,صورة.png\nZIP-2,Two,Surgical Instruments,photo one.png,'),userId:'owner'});await s.uploadChunk(job.id,{index:0,total:1,data:bytes,filename:'images.zip'},'owner');job=await s.configure(job.id,{mapping:job.mapping},'owner');assert.equal(job.status,'validating');assert.equal((await repo.listMedia()).length,0);job=await s.validate(job.id,'owner');assert.equal(job.status,'preview');assert.equal(job.counts.invalid,0);const done=await finish(s,job.id);assert.equal(done.counts.created,2);assert.equal((await repo.listMedia()).length,1);assert.equal((await repo.product('ZIP-1',{all:true})).images.length,2);assert.equal((await repo.importChunkGet(job.id,'owner','images')).length,0);}));
test('malicious ZIP paths, nested archives, ambiguous basenames and invalid images are rejected',()=>fixture(async(s)=>{for(const name of ['../escape.png','/absolute.png','nested.zip','C:/escape.png'])await assert.rejects(scanZip(zip([[name,'unsafe']])));let job=await s.create({csv:Buffer.from('sku,name,category,image_filename\nBAD,Example,Surgical Instruments,bad.png'),userId:'owner'});await s.uploadChunk(job.id,{index:0,total:1,data:zip([['bad.png','not an image']]),filename:'images.zip'},'owner');job=await s.configure(job.id,{mapping:job.mapping},'owner');job=await s.validate(job.id,'owner');assert.equal(job.counts.invalid,1);assert.match(job.preview[0].errors.join(' '),/decoded safely/);job=await s.create({csv:Buffer.from('sku,name,category,image_filename\nBAD,Example,Surgical Instruments,same.png'),userId:'owner'});await s.uploadChunk(job.id,{index:0,total:1,data:zip([['a/same.png','a'],['b/same.png','b']]),filename:'images.zip'},'owner');job=await s.configure(job.id,{mapping:job.mapping},'owner');assert.match(job.preview[0].errors.join(' '),/Ambiguous image/);}));
test('explicit category creation is previewed and imports drafts for review',()=>fixture(async(s,repo)=>{const buffer=Buffer.from('sku,name,category,status\nNEWCAT,Verified name,New tools,draft');let job=await prepared(s,buffer,{categoryMappings:{'New tools':'create'}});assert.equal(job.counts.invalid,0);assert.match(job.preview[0].changes.category.after,/draft/);await finish(s,job.id);const product=await repo.product('NEWCAT',{all:true});assert.ok(product);assert.equal((await repo.categories({all:true})).find(c=>c.id===product.categoryId).status,'draft');}));


test('invalid rows remain failed in a partial import and existing photo hashes reuse media across jobs',()=>fixture(async(s,repo)=>{
 let job=await prepared(s,Buffer.from('sku,name,category\nGOOD,One,Surgical Instruments\nBAD,,Surgical Instruments'));
 let done=await finish(s,job.id);assert.equal(done.counts.created,1);assert.equal(done.counts.failed,1);assert.equal(done.status,'completed_with_errors');
 const image=await sharp({create:{width:24,height:12,channels:3,background:'white'}}).png().toBuffer();
 for(const code of ['PHOTO-A','PHOTO-B']){
  job=await s.create({csv:Buffer.from('sku,name,category,image_filename\n'+code+',Photo example,Surgical Instruments,photo.png'),userId:'owner'});
  await s.uploadChunk(job.id,{index:0,total:1,data:zip([['photo.png',image]]),filename:'images.zip'},'owner');
  job=await s.configure(job.id,{mapping:job.mapping},'owner');await s.validate(job.id,'owner');done=await finish(s,job.id);assert.equal(done.counts.created,1);
 }
 assert.equal((await repo.listMedia()).length,1);
}));


test('ZIP bomb metadata, symlink/encrypted entries, CSV byte limits and row limits are rejected',async()=>{
 for(const kind of ['bomb','symlink','encrypted']){
  const bytes=zip([['photo.png','x']]);const central=bytes.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]));
  if(kind==='bomb')bytes.writeUInt32LE(4*1024*1024+1,central+24);
  if(kind==='symlink')bytes.writeUInt32LE(0xa1ff0000,central+38);
  if(kind==='encrypted')bytes.writeUInt16LE(0x801,central+8);
  await assert.rejects(scanZip(bytes));
 }
 assert.throws(()=>parseImportCsv(Buffer.alloc(4*1024*1024+1)));
 assert.throws(()=>parseImportCsv(csv(10001)));
});

test('existing media IDs attach without upload and missing image references stay invalid',()=>fixture(async(s,repo,media)=>{
 const bytes=await sharp({create:{width:16,height:8,channels:3,background:'white'}}).png().toBuffer();
 const record=await media.persistImage({buffer:bytes,originalname:'original.png',mimetype:'image/png'},'owner');
 let job=await prepared(s,Buffer.from('sku,name,category,image_filename\nEXISTING-PHOTO,Example,Surgical Instruments,id:'+record.id));
 assert.equal(job.counts.invalid,0);await finish(s,job.id);assert.equal((await repo.listMedia()).length,1);assert.equal((await repo.product('EXISTING-PHOTO',{all:true})).images[0].mediaId,record.id);
 job=await prepared(s,Buffer.from('sku,name,category,image_filename\nMISSING-PHOTO,Example,Surgical Instruments,missing.png'));
 assert.equal(job.counts.invalid,1);assert.equal(job.counts.missingImages,1);
}));


test('temporary image-storage failures keep rows pending for a safe resume',()=>fixture(async(s,repo,media)=>{
 const image=await sharp({create:{width:20,height:10,channels:3,background:'white'}}).png().toBuffer();
 let job=await s.create({csv:Buffer.from('sku,name,category,image_filename\nRETRY-PHOTO,Example,Surgical Instruments,photo.png'),userId:'owner'});
 await s.uploadChunk(job.id,{index:0,total:1,data:zip([['photo.png',image]]),filename:'images.zip'},'owner');
 job=await s.configure(job.id,{mapping:job.mapping},'owner');await s.validate(job.id,'owner');await s.confirm(job.id,{},'owner');
 const persist=media.persistImage;media.persistImage=async()=>{throw Object.assign(new Error('Temporary storage outage'),{status:503});};
 await assert.rejects(s.advance(job.id,'owner'),{status:503});assert.equal((await s.get(job.id,'owner')).counts.failed,0);
 media.persistImage=persist;job=await s.advance(job.id,'owner');assert.equal(job.counts.created,1);assert.equal(job.status,'completed');
}));
