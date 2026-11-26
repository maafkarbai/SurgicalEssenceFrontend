import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,mkdirSync,rmSync,readdirSync,symlinkSync,existsSync,unlinkSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {stringify} from 'csv-stringify/sync';
import {parse} from 'csv-parse/sync';
import sharp from 'sharp';
import {DatabaseSync} from 'node:sqlite';
import {createCmsStore} from '../src/cms/store.js';
import {createImportService} from '../src/cms/import-service.js';
import {createMediaService} from '../src/cms/media.js';

function zip(entries){let offset=0;const locals=[],directory=[];for(const [name,b] of entries){const n=Buffer.from(name);let crc=0xffffffff;for(const byte of b){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}crc=(crc^0xffffffff)>>>0;const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt32LE(crc,14);h.writeUInt32LE(b.length,18);h.writeUInt32LE(b.length,22);h.writeUInt16LE(n.length,26);locals.push(h,n,b);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt32LE(crc,16);c.writeUInt32LE(b.length,20);c.writeUInt32LE(b.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);directory.push(c,n);offset+=h.length+n.length+b.length;}const d=Buffer.concat(directory),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(d.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...locals,d,end]);}
const product={sku:'STAGE-001',name:'Synthetic handle',category:'Surgical instruments',material:'',size:'13.0 cm',image_filename:'handle.jpg',status:'published'};
const source={sku:'STAGE-001',catalog:'surgical.pdf',pdf_page:'5',source_url:'https://example.com/surgical.pdf#page=5',image_filename:'handle.jpg',image_type:'catalog product panel',image_source:'surgical.pdf, PDF page 5',extraction:'PDF text',review_notes:'Compare the dimensions.',source_text:'STAGE-001 13.0 cm',crop_box:'10,20,100,200'};
const coverage={catalog:'surgical.pdf',pdf_page:'5',detected_records:'1',page_text_characters:'20'};
async function fixture(t,{products=[product],sources=[source],reviews=[],pages=[coverage],images}={}){
 const dir=mkdtempSync(join(tmpdir(),'se-staging-')),input=join(dir,'input'),output=join(dir,'prepared');mkdirSync(input);
 t.after(()=>rmSync(dir,{recursive:true,force:true}));
 const csv=(name,rows,columns)=>writeFileSync(join(input,name),'\ufeff'+stringify(rows,{header:true,columns:columns||Object.keys(rows[0])}));
 csv('all-products-import.csv',products);csv('product-sources.csv',sources);csv('review-needed.csv',reviews,['catalog','pdf_page','sku','reason','source_text']);csv('page-coverage.csv',pages);
 const image=await sharp({create:{width:10,height:10,channels:3,background:'white'}}).jpeg().toBuffer();writeFileSync(join(input,'all-products-images.zip'),zip(images||[['handle.jpg',image]]));
 const run=(dest=output,extra=[])=>spawnSync(process.execPath,[resolve('scripts/prepare-catalogue.js'),'--source-dir',input,'--output-dir',dest,...extra],{encoding:'utf8'});
 return {input,output,run};
}
const imported=(dir)=>{const files=readdirSync(join(dir,'imports'));return files.flatMap(f=>parse(readFileSync(join(dir,'imports',f)),{bom:true,columns:true}));};
test('staging joins source evidence, preserves original facts/leading zeroes and emits only unapproved drafts',async t=>{
 const {run,output}=await fixture(t,{products:[{...product,sku:'003-000-01'}],sources:[{...source,sku:'003-000-01',source_text:'003-000-01 13.0 cm'}]});
 const result=run();assert.equal(result.status,0,result.stderr);
 const rows=imported(output);assert.equal(rows.length,1);assert.equal(rows[0].sku,'003-000-01');assert.equal(rows[0].name,'Synthetic handle');assert.equal(rows[0].size,'13.0 cm');assert.equal(rows[0].material,'');assert.equal(rows[0].status,'draft');assert.equal(rows[0].source_document,'surgical.pdf');assert.equal(rows[0].source_page,'5');assert.match(rows[0].review_notes,/UNREVIEWED/);assert.match(rows[0].review_notes,/003-000-01 13.0 cm/);assert.match(rows[0].image_evidence,/10,20,100,200/);assert.equal(rows[0].verification,undefined);
 const evidence=JSON.parse(readFileSync(join(output,'provenance.json')));assert.equal(evidence.records[0].product.status,'published');assert.equal(evidence.records[0].sources[0].source_text,'003-000-01 13.0 cm');
});
test('SKU conflicts, page-level flags, missing/duplicate sources and mismatched image references are withheld',async t=>{
 for(const variant of [
  {reviews:[{catalog:'surgical.pdf',pdf_page:'5',sku:'stage-001',reason:'OCR disagreement'}]},
  {reviews:[{catalog:'surgical.pdf',pdf_page:'5',sku:'',reason:'Unreadable code'}]},
  {sources:[{...source,sku:'OTHER'}]},
  {sources:[source,source]},
  {sources:[{...source,image_filename:'different.jpg'}]},
  {sources:[{...source,pdf_page:'9999'}]},
  {sources:[{...source,source_text:'OTHER-001 13.0 cm'}]},
  {products:[{...product,slug:'Invalid slug'}]},
  {products:[product,{...product,sku:'stage-001'}]},
 ]){
  const {run,output}=await fixture(t,variant),result=run();assert.equal(result.status,0,result.stderr);assert.equal(imported(output).length,0);
  const report=JSON.parse(readFileSync(join(output,'report.json')));assert.equal(report.counts.withheld,variant.products?.length||1);assert.ok(report.issues[0].reasons.length);assert.equal(report.counts.drafts,0);
  assert.equal(parse(readFileSync(join(output,'withheld.csv')),{bom:true,columns:true,record_delimiter:['\r\n','\n','\r']}).length,report.counts.withheld);
 }
});
test('prepared package passes the existing image/import workflow and remains private until explicit source review',async t=>{
 const {run,input,output}=await fixture(t);assert.equal(run().status,0);
 const db=new DatabaseSync(':memory:');t.after(()=>db.close());
 const repo=createCmsStore({db}),media=createMediaService({repo,dataDir:join(output,'test-media')}),service=createImportService({repo,media});
 let job=await service.create({csv:readFileSync(join(output,'imports',readdirSync(join(output,'imports'))[0])),userId:'test'});
 await service.uploadChunk(job.id,{index:0,total:1,data:readFileSync(join(input,'all-products-images.zip')),filename:'all-products-images.zip'},'test');
 job=await service.configure(job.id,{mapping:job.mapping,mode:'add'},'test');job=await service.validate(job.id,'test');assert.equal(job.counts.invalid,0);
 await service.confirm(job.id,{},'test');job=await service.advance(job.id,'test');assert.equal(job.counts.created,1);
 const p=await repo.product('STAGE-001',{all:true});assert.equal(p.sourceDocument,'surgical.pdf');assert.equal(p.sourcePage,5);assert.equal(p.verification.status,'unreviewed');assert.equal(p.images.length,1);assert.equal(p.length,'13.0 cm');
 assert.equal(await repo.product('STAGE-001'),null);assert.equal((await repo.products({q:'STAGE-001'})).total,0);
 await assert.rejects(repo.saveProduct({...p,status:'published'},'test'),/review/i);
 const bulk=await repo.bulkPublishPrepare({mode:'selected',selection:[p]},'test');assert.equal(bulk.eligible,0);
});
test('deterministic reruns preserve original inputs and all generated import files respect upload limits',async t=>{
 const long='x'.repeat(20000),products=Array.from({length:220},(_,i)=>({...product,sku:`STAGE-${i}`,description:long})),sources=products.map(p=>({...source,sku:p.sku,source_text:p.sku+' 13.0 cm '+ 'e'.repeat(1000)}));
 const {run,input,output}=await fixture(t,{products,sources});const before=readFileSync(join(input,'all-products-import.csv'));
 // Original file must also be under the existing 4 MiB bound.
 writeFileSync(join(input,'all-products-import.csv'),'\ufeff'+stringify(products.map(p=>({...p,description:'x'.repeat(18500)})),{header:true}));
 const original=readFileSync(join(input,'all-products-import.csv'));assert.equal(run().status,0);
 const second=join(output,'..','second');assert.equal(run(second).status,0);
 assert.deepEqual(readFileSync(join(output,'report.json')),readFileSync(join(second,'report.json')));assert.deepEqual(readFileSync(join(input,'all-products-import.csv')),original);
 const report=JSON.parse(readFileSync(join(output,'report.json')));assert.ok(report.imports.length>=2);for(const file of report.imports){assert.ok(file.bytes<=4*1024*1024);assert.ok(file.rows<=10000);}assert.equal(imported(output).length,220);assert.ok(before.length>original.length);
});
test('malformed inputs fail without output, existing output is never overwritten and dry check writes nothing',async t=>{
 const {run,input,output}=await fixture(t);
 assert.equal(run(output,['--check']).status,0);assert.throws(()=>readFileSync(join(output,'report.json')));
 assert.equal(run().status,0);const original=readFileSync(join(output,'report.json'));assert.notEqual(run().status,0);assert.deepEqual(readFileSync(join(output,'report.json')),original);
 writeFileSync(join(input,'product-sources.csv'),Buffer.from([0xff,0xfe]));const invalid=join(input,'invalid-output');assert.notEqual(run(invalid).status,0);assert.throws(()=>readFileSync(join(invalid,'report.json')));
});
test('output isolation rejects dot-prefixed children and linked parents inside the source package',async t=>{
 const {run,input}=await fixture(t);
 const child=join(input,'..staging');assert.notEqual(run(child).status,0);assert.equal(existsSync(child),false);
 const link=join(input,'..','source-alias');symlinkSync(input,link,process.platform==='win32'?'junction':'dir');
 try{const linkedOutput=join(link,'prepared');assert.notEqual(run(linkedOutput).status,0);assert.equal(existsSync(join(input,'prepared')),false);}finally{unlinkSync(link);}
});
test('all effective URL collisions are withheld across explicit and generated slugs',async t=>{
 for(const slugs of [['',''],['same-url','same-url'],['a-b','']]){
  const products=[{...product,sku:'A.B',slug:slugs[0]},{...product,sku:'A_B',slug:slugs[1]}],sources=products.map(p=>({...source,sku:p.sku,source_text:p.sku+' 13.0 cm'}));
  const {run,output}=await fixture(t,{products,sources});assert.equal(run().status,0);assert.equal(imported(output).length,0);
  const report=JSON.parse(readFileSync(join(output,'report.json')));assert.equal(report.counts.withheld,2);assert.ok(report.issues.every(i=>i.reasons.some(r=>/slug|URL/i.test(r))));
 }
});
test('CSV quotes standalone line breaks so independent parsers preserve record boundaries',async t=>{
 const {run,output}=await fixture(t,{products:[{...product,description:'First line\nSecond line\rThird line'}],sources:[{...source,image_source:'https://example.com/image.webp',crop_box:''}]});
 assert.equal(run().status,0);
 const file=join(output,'imports',readdirSync(join(output,'imports'))[0]);
 const rows=parse(readFileSync(file),{bom:true,columns:true,record_delimiter:['\r\n','\n','\r']});assert.equal(rows.length,1);assert.equal(rows[0].description,'First line\nSecond line\rThird line');assert.match(rows[0].image_evidence,/https:\/\/example.com/);
});
