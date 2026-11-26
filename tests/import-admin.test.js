import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { resolve } from 'node:path';
import { createImportRouter } from '../src/cms/import-router.js';

function fixture() {
  const calls = [];
  const job = { id: 'job-1', filename: '<img src=x onerror=alert(1)>.csv', status: 'mapping', headers: ['SKU','Name'], mapping: { sku:'SKU' }, counts: {total:1}, sampleRecords:[['A1','Scissors']] };
  const service = { list: async () => [job], template: async () => 'sku,name\r\n', get: async () => job, create: async input => { calls.push(['create', input]); return job; }, rows: async () => ({items:[],page:1,pages:1,total:0}), report: async () => 'row,status\r\n2,created\r\n' };
  for (const action of ['configure','uploadChunk','validate','confirm','advance','cancel']) service[action] = async (...args) => { calls.push([action, ...args]); return job; };
  const app = express(); app.set('view engine','ejs'); app.set('views',resolve('views')); app.use(express.json());
  app.use('/admin/products/import', (req,res,next) => { if (req.get('x-admin') !== 'yes') return res.sendStatus(401); req.admin = {id:'admin-1'}; res.locals.user = req.admin; res.locals.csrf = 'token'; if (req.method === 'POST' && req.get('x-csrf-token') !== 'token') return res.sendStatus(403); next(); }, createImportRouter({service}));
  return {app, calls, service};
}
const admin = req => req.set('x-admin','yes');
const post = (app,path) => admin(request(app).post('/admin/products/import'+path)).set('x-csrf-token','token');
test('import wizard is protected and escapes untrusted history names', async () => {
  const {app}=fixture();
  assert.equal((await request(app).get('/admin/products/import')).status,401);
  assert.equal((await admin(request(app).post('/admin/products/import/job-1/advance')).send({})).status,403);
  const page=await admin(request(app).get('/admin/products/import')); assert.equal(page.status,200,page.text); assert.match(page.text,/&lt;img/); assert.doesNotMatch(page.text,/<img src=x/); assert.match(page.text,/Map and validate/);
  const details=await admin(request(app).get('/admin/products/import/job-1')); assert.equal(details.status,200,details.text); assert.match(details.text,/data-job-id="job-1"/);
});
test('CSV multipart upload and ZIP chunk use actor and enforce byte limits', async () => {
  const {app,calls}=fixture();
  let result=await post(app,'/upload').attach('file',Buffer.from('sku,name\nA1,Scissors'),'products.csv'); assert.equal(result.status,201,result.text); assert.equal(calls[0][1].userId,'admin-1'); assert.equal(calls[0][1].csv.toString(),'sku,name\nA1,Scissors');
  result=await post(app,'/upload').attach('file',Buffer.alloc(4*1024*1024+1),'products.csv'); assert.equal(result.status,413);
  result=await post(app,'/job-1/chunks?index=0&total=1&filename=images.zip').set('Content-Type','application/octet-stream').send(Buffer.from('zip')); assert.equal(result.status,200,result.text); const chunk=calls.find(c=>c[0]==='uploadChunk'); assert.equal(chunk[1],'job-1'); assert.equal(chunk[2].data.toString(),'zip'); assert.equal(chunk[3],'admin-1');
  result=await post(app,'/job-1/chunks?index=0&total=1').set('Content-Type','application/octet-stream').send(Buffer.alloc(512*1024+1)); assert.equal(result.status,413);
});
test('explicit mutation routes and downloadable report preserve service contract', async () => {
 const {app,calls}=fixture();
 for(const action of ['validate','advance','cancel']) assert.equal((await post(app,`/job-1/${action}`).send({})).status,200);
 assert.equal((await post(app,'/job-1/confirm').send({backupAcknowledged:true})).status,200);
 assert.deepEqual(calls.find(c=>c[0]==='confirm').slice(1),['job-1',{backupAcknowledged:true},'admin-1']);
 const report=await admin(request(app).get('/admin/products/import/job-1/report.csv')); assert.equal(report.status,200); assert.match(report.headers['content-disposition'],/attachment/); assert.match(report.headers['content-type'],/csv/);
});



test('unexpected storage errors do not expose SQL, paths or secrets', async () => {
 const {app,service}=fixture(); service.get=async()=>{throw new Error('SQL failed C:/private/passwords token=secret');};
 const result=await admin(request(app).get('/admin/products/import/job-1/state')); assert.equal(result.status,503);assert.match(result.body.error,/Refresh history and retry/);assert.doesNotMatch(result.text,/SQL|private|token=secret/);
});
