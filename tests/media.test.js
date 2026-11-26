import {test} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import sharp from 'sharp';
import {mkdtemp, readdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createMediaService} from '../src/cms/media.js';

async function fixture(t, options={}) {
  const dataDir = await mkdtemp(join(tmpdir(), 'se-media-'));
  t.after(()=>rm(dataDir,{recursive:true,force:true}));
  const records = new Map();
  const repo = {listMedia:()=>[...records.values()],getMedia:id=>records.get(id),saveMedia:r=>(records.set(r.id,r),r),deleteMedia:id=>records.delete(id),...options.repo};
  const media = createMediaService({dataDir,repo,cloud:false,...options});
  const app = express();
  app.use('/media',media.router);
  app.post('/upload',...media.upload);
  app.delete('/media-record/:id',media.remove);
  app.use((err,req,res,next)=>res.status(err.status || 500).json({error:'Unable to save image.'}));
  return {app,media,records,dataDir};
}
const image = (width=1200,height=600,format='png')=>sharp({create:{width,height,channels:3,background:'#778899'}})[format]().toBuffer();

test('image upload persists UUID-named sanitized variants and serves only safe image filenames',async t=>{
  const {app,records,media} = await fixture(t);
  const source = await sharp(await image()).withMetadata({exif:{IFD0:{Copyright:'sensitive metadata'}}}).png().toBuffer();
  const result = await request(app).post('/upload').attach('images',source,{filename:'photo.png',contentType:'image/png'});
  assert.equal(result.status,201,result.text);
  const [record] = result.body.images;
  assert.equal(records.size,1);
  assert.equal(record.width,1200); assert.equal(record.height,600);
  assert.match(record.url,/^\/media\/[0-9a-f-]{36}-original\.webp$/);
  assert.equal((await readdir(media.mediaDir)).length,3);
  for (const [url,width] of [[record.url,1200],[record.mediumUrl,800],[record.smallUrl,400]]) {
    const response = await request(app).get(url);
    assert.equal(response.status,200); assert.match(response.headers['content-type'],/^image\/webp/);
    const meta = await sharp(response.body).metadata();
    assert.equal(meta.width,width); assert.equal(meta.height,width/2);
    assert.equal(meta.exif,undefined);
  }
  for (const path of ['/media/.env','/media/script.js','/media/not-a-uuid-original.webp','/media/%2e%2e%2fpackage.json']) assert.equal((await request(app).get(path)).status,404,path);
});

test('JPEG and WebP decode and small sources are never enlarged',async t=>{
  const {app} = await fixture(t);
  for (const format of ['jpeg','webp']) {
    const r = await request(app).post('/upload').attach('images',await image(20,10,format),{filename:`photo.${format}`,contentType:`image/${format}`});
    assert.equal(r.status,201,r.text); assert.equal(r.body.images[0].width,20);
  }
});

test('spoofed types, SVG, trailing payloads, invalid images and enormous dimensions are rejected',async t=>{
  const {app,records} = await fixture(t);
  const png = await image();
  const cases = [
    [Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),'fake.png','image/png'],
    [png,'fake.jpg','image/jpeg'],
    [png,'photo.png','image/webp'],
    [Buffer.concat([png,Buffer.from('<script>alert(1)</script>')]),'polyglot.png','image/png'],
    [Buffer.concat([await image(10,10,'jpeg'),Buffer.from('<script>bad</script>')]),'polyglot.jpeg','image/jpeg'],
    [await image(10001,1),'huge.png','image/png'],
    [Buffer.alloc(5*1024*1024+1),'big.png','image/png'],
  ];
  for (const [buffer,filename,contentType] of cases) {
    const r = await request(app).post('/upload').attach('images',buffer,{filename,contentType});
    assert.ok([400,413].includes(r.status),`${filename}: ${r.status} ${r.text}`);
  }
  assert.equal(records.size,0);
});

test('batch validation is atomic and repository errors clean written variants',async t=>{
  const {app,media,records} = await fixture(t);
  const r = await request(app).post('/upload').attach('images',await image(),{filename:'good.png',contentType:'image/png'}).attach('images',Buffer.from('bad'),{filename:'bad.png',contentType:'image/png'});
  assert.equal(r.status,400); assert.equal(records.size,0);
  assert.deepEqual(await readdir(media.mediaDir).catch(()=>[]),[]);
  const failed = await fixture(t,{repo:{saveMedia:()=>{throw new Error('database unavailable');}}});
  assert.equal((await request(failed.app).post('/upload').attach('images',await image(),{filename:'good.png',contentType:'image/png'})).status,500);
  assert.deepEqual(await readdir(failed.media.mediaDir),[]);
});

test('five image count limit, referenced image protection and deletion cleanup',async t=>{
  const {app,records,media} = await fixture(t);
  const png = await image(10,10);
  let batch = request(app).post('/upload');
  for(let i=0;i<6;i++) batch = batch.attach('images',png,{filename:`${i}.png`,contentType:'image/png'});
  assert.equal((await batch).status,400); assert.equal(records.size,0);
  const r = await request(app).post('/upload').attach('images',png,{filename:'good.png',contentType:'image/png'});
  const record = r.body.images[0];
  assert.equal((await request(app).delete(`/media-record/${record.id}`)).status,200);
  assert.equal(records.size,0); assert.deepEqual(await readdir(media.mediaDir),[]);
  const blocked = await fixture(t,{repo:{getMedia:()=>record,deleteMedia:()=>{throw Object.assign(new Error('in use'),{code:'MEDIA_IN_USE'});}}});
  assert.equal((await request(blocked.app).delete(`/media-record/${record.id}`)).status,409);
});

test('Vercel storage missing token returns honest 503 without local writes; blob partial failures roll back',async t=>{
  const missing = await fixture(t,{cloud:true,blobToken:''});
  assert.equal((await request(missing.app).post('/upload')).status,503);
  assert.deepEqual(await readdir(missing.media.mediaDir).catch(()=>[]),[]);
  const removed=[]; let count=0;
  const cloud = await fixture(t,{cloud:true,blobToken:'test-token',blobClient:{put:async name=>{if(++count===2) throw new Error('storage down');return {url:`https://example.public.blob.vercel-storage.com/${name}`};},del:async url=>removed.push(url)}});
  assert.equal((await request(cloud.app).post('/upload').attach('images',await image(),{filename:'good.png',contentType:'image/png'})).status,500);
  assert.equal(removed.length,1); assert.equal(cloud.records.size,0);
  assert.deepEqual(await readdir(cloud.media.mediaDir).catch(()=>[]),[]);
});

test('cloud requires an exact configured Blob host and enforces 4 MiB single-image requests',async t=>{
  for (const blobHost of ['', 'https://example.public.blob.vercel-storage.com', 'evil.example']) {
    const f = await fixture(t,{cloud:true,blobToken:'test-token',blobHost});
    assert.equal((await request(f.app).post('/upload')).status,503);
  }
  const objects=[]; const host='example.public.blob.vercel-storage.com';
  const f=await fixture(t,{cloud:true,blobToken:'test-token',blobHost:host,blobClient:{put:async name=>({url:`https://${host}/${name}`}),del:async url=>objects.push(url)}});
  assert.deepEqual(f.media.limits,{maxFiles:1,fileBytes:4*1024*1024});
  const png=await image(10,10);
  assert.equal((await request(f.app).post('/upload').attach('images',png,{filename:'a.png',contentType:'image/png'}).attach('images',png,{filename:'b.png',contentType:'image/png'})).status,400);
  assert.equal((await request(f.app).post('/upload').attach('images',Buffer.alloc(4*1024*1024+1),{filename:'big.png',contentType:'image/png'})).status,413);
  assert.equal((await request(f.app).post('/upload').attach('images',png,{filename:'a.png',contentType:'image/png'})).status,201);
  const mismatch=await fixture(t,{cloud:true,blobToken:'test-token',blobHost:host,blobClient:{put:async name=>({url:`https://wrong.public.blob.vercel-storage.com/${name}`}),del:async url=>objects.push(url)}});
  assert.equal((await request(mismatch.app).post('/upload').attach('images',png,{filename:'a.png',contentType:'image/png'})).status,503);
  assert.equal(objects.length,1);
});
