import {reviewFixture} from './review-fixture.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { createCmsStore } from '../src/cms/store.js';
import { createAdminRouter } from '../src/cms/admin.js';
import { hashPassword, verifyPassword } from '../src/cms/auth.js';

async function fixture(t) {
  const db = new DatabaseSync(':memory:'); t.after(()=>db.close());
  const repo = await createCmsStore({db}); await repo.ready();
  await repo.createAdmin({email:'admin@example.com',passwordHash:await hashPassword('secure-test-password')});
  const app = express(); app.set('view engine','ejs'); app.set('views',resolve('views'));
  app.use('/admin',createAdminRouter({repo,secret:'test-secret-that-is-longer-than-thirty-two-characters'}));
  return {app,repo,agent:request.agent(app)};
}
async function login(agent, password='secure-test-password') {
  const page=await agent.get('/admin/login'); const csrf=page.text.match(/name="_csrf" value="([^"]+)"/)[1];
  return agent.post('/admin/login').type('form').send({_csrf:csrf,email:'admin@example.com',password});
}
const csrfFrom = page=>page.text.match(/name="csrf-token" content="([^"]+)"/)[1];
test('password hashing verifies safely and rejects malformed hashes',async()=>{
 const hash=await hashPassword('secure-test-password'); assert.ok(await verifyPassword('secure-test-password',hash)); assert.equal(await verifyPassword('wrong',hash),false); assert.equal(await verifyPassword('x','bad'),false);
});
test('admin routes require authentication; login CSRF, session cookies, logout and rate limits work',async t=>{
 const {app,agent}=await fixture(t);
 for(const path of ['/admin/','/admin/products','/admin/media','/admin/preview/unknown','/admin/settings']) assert.equal((await request(app).get(path)).status,303);
 assert.equal((await agent.post('/admin/login').type('form').send({email:'admin@example.com',password:'secure-test-password'})).status,403);
 const result=await login(agent); assert.equal(result.status,303,result.text); assert.match(result.headers['set-cookie'].join(';'),/HttpOnly/); assert.match(result.headers['set-cookie'].join(';'),/SameSite=Strict/);
 const dashboard=await agent.get('/admin/'); assert.equal(dashboard.status,200,dashboard.text); assert.match(dashboard.headers['cache-control'],/no-store/); assert.match(dashboard.headers['x-robots-tag'],/noindex/);
 assert.equal((await agent.post('/admin/logout')).status,403);
 assert.equal((await agent.post('/admin/logout').type('form').send({_csrf:csrfFrom(dashboard)})).status,303);
 assert.equal((await agent.get('/admin/')).status,303);
 for(let i=0;i<5;i++) assert.equal((await login(agent,'bad')).status,401);
 assert.equal((await login(agent)).status,429);
});
test('admin product and category forms create, edit, reject duplicates, preserve errors and archive',async t=>{
 const {agent,repo}=await fixture(t); await login(agent);
 const page=await agent.get('/admin/products/new'); assert.equal(page.status,200,page.text); const csrf=csrfFrom(page);
 const categories=await repo.categories({all:true});
 let result=await agent.post('/admin/products/save').type('form').send({_csrf:csrf,name:'CMS test instrument',code:'CMS-TEST-1',categoryId:categories[0].id,status:'draft',images:'[]',description:'Verified details'});
 assert.equal(result.status,303,result.text); const p=(await repo.products({all:true,q:'CMS-TEST-1'})).items[0]; assert.equal(p.status,'draft');
 result=await agent.get(result.headers.location); assert.equal(result.status,200,result.text); assert.match(result.text,/CMS test instrument/);
 result=await agent.post('/admin/products/save').type('form').send({_csrf:csrf,name:'Duplicate test',code:'CMS-TEST-1',categoryId:categories[0].id,status:'draft',images:'[]'}); assert.equal(result.status,409,result.text); assert.match(result.text,/Duplicate test/);
 result=await agent.post('/admin/products/save').type('form').send({_csrf:csrf,id:p.id,revision:p.revision,name:p.name,code:p.code,categoryId:p.categoryId,status:'published',...reviewFixture,images:JSON.stringify(reviewFixture.images)}); assert.equal(result.status,303,result.text); assert.equal((await repo.product(p.id)).status,'published');
 result=await agent.get(`/admin/products/${p.id}/archive`); assert.equal(result.status,200,result.text);
 result=await agent.post(`/admin/products/${p.id}/archive`).type('form').send({_csrf:csrf}); assert.equal(result.status,303); assert.equal(await repo.product(p.id),null);
 result=await agent.post('/admin/categories/save').type('form').send({_csrf:csrf,name:'CMS test category',slug:'cms-test-category',priority:2}); assert.equal(result.status,303,result.text);
 const category=(await repo.categories({all:true})).find(c=>c.slug==='cms-test-category'); result=await agent.get(`/admin/categories/${category.id}/edit`); assert.equal(result.status,200,result.text);
 result=await agent.post(`/admin/categories/${category.id}/archive`).type('form').send({_csrf:csrf}); assert.equal(result.status,303,result.text);
});
test('password changes validate current credentials and revoke every existing session',async t=>{
 const {app,agent}=await fixture(t); const second=request.agent(app); await login(agent); await login(second);
 const page=await agent.get('/admin/settings'); const csrf=csrfFrom(page);
 let result=await agent.post('/admin/settings').type('form').send({_csrf:csrf,email:'admin@example.com',currentPassword:'wrong',password:'new-secure-password',confirmPassword:'new-secure-password'}); assert.equal(result.status,400); assert.match(result.text,/Current email or password is incorrect/);
 result=await agent.post('/admin/settings').type('form').send({_csrf:csrf,email:'admin@example.com',currentPassword:'secure-test-password',password:'new-secure-password',confirmPassword:'new-secure-password'}); assert.equal(result.status,303,result.text);
 assert.equal((await second.get('/admin/')).status,303); assert.equal((await agent.get('/admin/')).status,303); assert.equal((await login(agent,'new-secure-password')).status,303);
});
