import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath} from 'node:url';
import {createSalesStore} from '../src/sales-store.js';
import {createSalesRouter} from '../src/sales-router.js';

test('sales admin pages escape RFQ data, filter exports and update with an authenticated actor',async t=>{
 const db=new DatabaseSync(':memory:');t.after(()=>db.close());db.exec('CREATE TABLE rfqs(id TEXT PRIMARY KEY,created_at BIGINT,payload TEXT)');
 db.prepare('INSERT INTO rfqs VALUES(?,?,?)').run('SE-1',Date.now(),JSON.stringify({name:'<script>alert(1)</script>',company:'Acme',country:'Pakistan',intent:'distributor',territory:'Punjab <region>',interests:'Dental & surgical',purchasing:'Quarterly > 100',items:[{code:'Q-1',quantity:2}]}));
 const repo=createSalesStore({db});const app=express();app.set('view engine','ejs');app.set('views',fileURLToPath(new URL('../views',import.meta.url)));app.use(express.urlencoded({extended:false}));
 app.use('/admin',(req,res,next)=>{res.locals.user={id:'admin-test',email:'admin@example.test'};res.locals.csrf='test-token';next();},createSalesRouter({repo}));
 const list=await request(app).get('/admin/quotes');assert.equal(list.status,200);assert.match(list.text,/&lt;script&gt;/);assert.doesNotMatch(list.text,/<script>alert/);assert.equal(list.headers['cache-control'],'no-store');
 const leads=await request(app).get('/admin/leads?country=Unknown');assert.equal(leads.status,200);assert.match(leads.text,/No enquiries/);
 const detail=await request(app).get('/admin/quotes/SE-1');assert.equal(detail.status,200);assert.match(detail.text,/Q-1/);assert.match(detail.text,/test-token/);
 for(const escaped of ['distributor','Punjab &lt;region&gt;','Dental &amp; surgical','Quarterly &gt; 100'])assert.ok(detail.text.includes(escaped));
 assert.equal((await request(app).get('/admin/quotes/missing')).status,404);
 const save=await request(app).post('/admin/quotes/SE-1').type('form').send({status:'CONTACTED',notes:'Spoke to buyer',_csrf:'test-token'});assert.equal(save.status,303);assert.equal((await repo.detail('SE-1')).updatedBy,'admin-test');
 assert.equal((await request(app).post('/admin/quotes/SE-1').type('form').send({status:'invalid'})).status,400);
 const csv=await request(app).get('/admin/leads/export?country=Pakistan');assert.equal(csv.status,200);assert.match(csv.headers['content-type'],/text\/csv/);assert.match(csv.text,/Acme/);
 for(const value of ['distributor','Punjab <region>','Dental & surgical','Quarterly > 100'])assert.ok(csv.text.includes(value));assert.equal(db.prepare('SELECT actor FROM se_sales_export_audit').get().actor,'admin-test');
 const stats=await request(app).get('/admin/sales/stats');assert.equal(stats.body.total,1);assert.equal(stats.body.CONTACTED,1);
});

test('sales router refuses to operate when mounted outside admin authentication',async()=>{
 const app=express();app.use(createSalesRouter({repo:{}}));assert.equal((await request(app).get('/quotes')).status,401);
});
