import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import express from 'express';
import {createSeo} from '../src/seo.js';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../src/app.js';

const dir=mkdtempSync(join(tmpdir(),'se-seo-'));
const {app,db,cms}=createApp({dataDir:dir,siteUrl:'https://example.com'});
after(()=>{db.close();rmSync(dir,{recursive:true,force:true});});

test('published category listings have distinct metadata and invalid listings cannot be indexed',async()=>{
 const category=await request(app).get('/products?category=surgical');
 assert.match(category.text,/<title>Surgical instruments/);
 assert.match(category.text,/<meta name="description" content="Browse Surgical instruments/);
 const page=await request(app).get('/products?page=1');
 assert.match(page.text,/rel="canonical" href="https:\/\/example.com\/products"/);
 for(const path of ['/products?category=missing','/products?page=99999','/products?page=2x','/products?page=0','/products?page=1&page=2','/products?category=surgical&category=dental']){
  const response=await request(app).get(path);
  assert.equal(response.status,404,path);
  assert.match(response.headers['x-robots-tag'],/noindex/,path);
 }
 const search=await request(app).get('/products?q=scalpel');
 assert.match(search.headers['x-robots-tag'],/noindex/);
 const duplicate=await request(app).get('/products?category=surgical&tracking=1');
 assert.match(duplicate.text,/rel="canonical" href="https:\/\/example.com\/products\?category=surgical"/);
});

test('empty published categories remain accessible with self canonical and noindex',async()=>{
 const response=await request(app).get('/products?category=dental');
 assert.equal(response.status,200);
 assert.match(response.headers['x-robots-tag'],/noindex/);
 assert.match(response.text,/<meta name="robots" content="noindex, follow">/);
 assert.match(response.text,/rel="canonical" href="https:\/\/example.com\/products\?category=dental"/);
 const sitemap=await request(app).get('/sitemap.xml');
 assert.doesNotMatch(sitemap.text,/<loc>[^<]*category=dental/);
 assert.match(sitemap.text,/<loc>https:\/\/example.com\/products\?category=surgical<\/loc>/);
});

test('private guards prevent indexing when route casing differs',async()=>{
 const isolated=express(),seo=createSeo({cms,siteUrl:'https://example.com',publicPaths:[]});
 isolated.use(seo.middleware);
 isolated.get(['/account','/quote-list'],(req,res)=>res.redirect('/'));
 for(const path of ['/ACCOUNT','/QUOTE-LIST']){
  const response=await request(isolated).get(path);
  assert.equal(response.status,302);
  assert.match(response.headers['x-robots-tag'],/noindex/);
 }
});

test('robots lets crawlers see public noindex directives and error responses are noindex',async()=>{
 const robots=await request(app).get('/robots.txt');
 assert.doesNotMatch(robots.text,/Disallow: \/(?:request-quote|quote-list)/);
 for(const path of ['/request-quote','/quote-list','/not-a-page'])assert.match((await request(app).get(path)).headers['x-robots-tag'],/noindex/);
});

test('private account and subscription paths prevent indexing even when they redirect',async()=>{
 for(const path of ['/my-account','/account/login','/newsletter'])assert.match((await request(app).get(path)).headers['x-robots-tag'],/noindex/);
});

test('social metadata describes the actual page image',async()=>{
 const response=await request(app).get('/products/003-004-00');
 assert.match(response.text,/<meta name="twitter:card" content="summary_large_image">/);
 assert.match(response.text,/<meta property="og:image:alt" content="Scalpel handle No. 4">/);
});

test('preview environment suppresses indexing on every response',async()=>{
 const previewDir=mkdtempSync(join(tmpdir(),'se-preview-'));
 const prior=process.env.VERCEL_ENV;process.env.VERCEL_ENV='preview';
 let preview;
 try{preview=createApp({dataDir:previewDir,siteUrl:'https://example.com'});}finally{if(prior===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=prior;}
 try{
  const response=await request(preview.app).get('/');
  assert.match(response.headers['x-robots-tag'],/noindex/);
  assert.match(response.text,/<meta name="robots" content="noindex, follow">/);
  assert.match((await request(preview.app).get('/sitemap.xml')).headers['x-robots-tag'],/noindex/);
 }finally{preview.db.close();rmSync(previewDir,{recursive:true,force:true});}
});

test('sitemap covers canonical published categories and products with actual modification dates',async()=>{
 await cms.ready();
 db.prepare("UPDATE se_cms_categories SET slug='surgical-tools',updated_at=1704067200000 WHERE id='surgical'").run();
 db.prepare("UPDATE se_cms_products SET updated_at=1704153600000 WHERE code='003-004-00'").run();
 db.prepare("UPDATE se_cms_products SET status='draft' WHERE code='003-004-01'").run();
 db.prepare("UPDATE se_cms_categories SET slug='beauty&care',status='published' WHERE id='beauty'").run();
 db.prepare("UPDATE se_cms_categories SET status='draft' WHERE id='dental'").run();
 const response=await request(app).get('/sitemap.xml');
 assert.doesNotMatch(response.text,/<loc>https:\/\/example.com\/products\?category=beauty%26care<\/loc>/);
 assert.doesNotMatch(response.text,/<loc>[^<]*category=dental/);
 assert.match(response.text,/<loc>https:\/\/example.com\/products\?category=surgical-tools<\/loc>/);
 assert.match(response.text,/<loc>https:\/\/example.com\/products\/003-004-00<\/loc><lastmod>2024-01-02T00:00:00.000Z<\/lastmod>/);
 assert.doesNotMatch(response.text,/<loc>[^<]*(?:request-quote|quote-list|admin|003-004-01)/);
});

test('large catalogues use bounded sitemap shards and reject unknown shards',async()=>{
 await cms.ready();
 const insert=db.prepare("INSERT INTO se_cms_products(id,code,slug,name,category_id,status,featured,priority,payload,search_text,revision,created_at,updated_at) VALUES(?,?,?,'Test instrument','surgical','published',0,0,'{}','test',1,1704067200000,1704067200000)");
 db.exec('BEGIN');
 try{for(let i=0;i<10001;i++)insert.run('seo-'+i,'SEO-'+i,'seo-'+i);db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');throw error;}
 const root=await request(app).get('/sitemap.xml');
 assert.match(root.text,/<sitemapindex /);
 const locations=[...root.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>new URL(match[1]).pathname);
 assert.equal(locations.length,2);
 const seen=new Set();
 for(const location of locations){
  const response=await request(app).get(location);assert.equal(response.status,200);
  const urls=[...response.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
  assert.ok(urls.length<=10000);
  for(const url of urls){assert.ok(!seen.has(url),url);seen.add(url);}
 }
 const page=await request(app).get('/products?page=2');
 assert.equal(page.status,200);
 assert.match(page.text,/rel="canonical" href="https:\/\/example.com\/products\?page=2"/);
 assert.match(page.text,/<title>Surgical Instrument Catalogue \| Page 2/);
 assert.ok(seen.has('https://example.com/products/seo-10000'));
 assert.ok(seen.has('https://example.com/products?category=surgical-tools'));
 assert.equal((await request(app).get('/sitemaps/999.xml')).status,404);
});


test('sitemap escapes XML and omits private paths from configured and dynamic entries',async()=>{
 const isolated=express();
 const seo=createSeo({cms,siteUrl:'https://example.com/brand&co',publicPaths:['/','/quote-list','/account/login','/ACCOUNT/settings'],extraEntries:async()=>[{path:'/press-releases/update',updatedAt:1704067200000},{path:'/newsletter'},{path:'/press-releases/draft',status:'draft'}]});
 isolated.get('/sitemap.xml',seo.sitemap);isolated.get('/sitemaps/:number.xml',seo.shard);
 const index=await request(isolated).get('/sitemap.xml');
 assert.match(index.text,/<loc>https:\/\/example.com\/brand&amp;co\/sitemaps\/1.xml<\/loc>/);
 const first=await request(isolated).get('/sitemaps/1.xml');
 assert.match(first.text,/<loc>https:\/\/example.com\/brand&amp;co\/press-releases\/update<\/loc><lastmod>2024-01-01T00:00:00.000Z<\/lastmod>/);
 assert.doesNotMatch(first.text,/<loc>[^<]*(?:[Aa][Cc][Cc][Oo][Uu][Nn][Tt]|quote-list|newsletter|press-releases\/draft)/);
});
