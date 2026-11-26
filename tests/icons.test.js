import {test} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../src/app.js';

test('the approved SVG icon pack is served locally and buyer controls retain descriptive text',async t=>{
 const dir=mkdtempSync(join(tmpdir(),'se-icons-')), {app,db}=createApp({dataDir:dir});t.after(()=>{db.close();rmSync(dir,{recursive:true,force:true});});
 const sprite=await request(app).get('/icons/se-icons.svg');assert.equal(sprite.status,200);assert.match(sprite.headers['content-type'],/image\/svg\+xml/);const xml=Buffer.isBuffer(sprite.body)?sprite.body.toString():sprite.text;assert.equal((xml.match(/<symbol\b/g)||[]).length,24);assert.doesNotMatch(xml,/<script|<foreignObject|https?:\/\/(?!www.w3.org)/i);
 for(const path of ['/','/products','/catalog','/contact','/distributor','/request-quote','/quote-list','/account/login']){
  const page=await request(app).get(path);assert.equal(page.status,200,path);assert.match(page.text,/class="se-icon[^\"]*"[^>]*aria-hidden="true"[^>]*focusable="false"/);assert.match(page.text,/se-icons.svg\?v=[a-f0-9]+#se-/);
 }
 const home=await request(app).get('/');for(const name of ['surgical','dental','ophthalmic','beauty','single-use'])assert.match(home.text,new RegExp('#se-'+name));
 const catalogue=await request(app).get('/products');assert.match(catalogue.text,/Search<\/button>|Search\s*<svg/);assert.match(catalogue.text,/aria-label="Add [^"]+ to quote list"/);assert.match(catalogue.text,/#se-quote-list/);
});
