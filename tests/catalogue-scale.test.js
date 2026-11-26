import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import request from 'supertest';
import {createApp} from '../src/app.js';

test('1000 catalogue records use bounded page hydration and constant query count',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'se-catalogue-scale-'));
 const {app,db,cms}=createApp({dataDir:dir});
 try{
  await cms.ready();
  const seed=await cms.product('003-004-00');
  const insert=db.prepare(`INSERT INTO se_cms_products(id,code,slug,name,category_id,status,featured,priority,payload,search_text,revision,created_at,updated_at) VALUES(?,?,?,?,?,'published',0,100,?,?,1,?,?)`);
  db.exec('BEGIN');
  for(let i=0;i<1000;i++){const code=`SCALE-${String(i).padStart(4,'0')}`;insert.run(code,code,code.toLowerCase(),`Scale test instrument ${i}`,seed.categoryId,JSON.stringify({type:'Scale test'}),'scale test',Date.now(),Date.now());}
  db.exec('COMMIT');
  const original=db.prepare.bind(db);let queries=0;
  db.prepare=(...args)=>{queries++;return original(...args);};
  let response=await request(app).get('/products');
  assert.equal(response.status,200);assert.equal((response.text.match(/class="product-card"/g)||[]).length,24);assert.match(response.text,/<strong>1008<\/strong> instruments found/);assert.ok(queries<15,`Expected constant query count; got ${queries}`);
  queries=0;response=await request(app).get('/products?page=2');assert.equal(response.status,200);assert.equal((response.text.match(/class="product-card"/g)||[]).length,24);assert.ok(queries<15);
  response=await request(app).get('/products?type=Scale%20test');assert.match(response.text,/<strong>1000<\/strong> instruments found/);
  assert.match((await request(app).get('/sitemap.xml')).text,/scale-0999/);
 }finally{db.close();rmSync(dir,{recursive:true,force:true});}
});
