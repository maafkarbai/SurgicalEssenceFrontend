import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import express from 'express';
import request from 'supertest';
import {createNewsletterStore,createNewsletterRouter} from '../src/newsletter.js';

test('newsletter requires CSRF and explicit consent, stores no duplicates and supports private unsubscribe',async t=>{
 const db=new DatabaseSync(':memory:');t.after(()=>db.close());const repo=createNewsletterStore({db});const app=express();app.use(express.urlencoded({extended:false}));app.use(createNewsletterRouter({repo,secret:'newsletter-test-secret-at-least-32-characters',siteUrl:'http://localhost:3000'}));const agent=request.agent(app);
 assert.equal((await agent.post('/newsletter').type('form').send({email:'buyer@example.com',consent:'yes'})).status,403);
 let page=await agent.get('/newsletter');assert.equal(page.headers['referrer-policy'],'same-origin','native same-origin forms must retain their Origin while external links receive no referrer');let csrf=page.text.match(/name="_csrf" value="([^"]+)"/)[1];
 assert.equal((await agent.post('/newsletter').type('form').send({_csrf:csrf,email:'buyer@example.com'})).status,422);
 const result=await agent.post('/newsletter').type('form').send({_csrf:csrf,email:'buyer@example.com',consent:'yes'});assert.equal(result.status,200,result.text);assert.match(result.text,/preference has been saved/);assert.doesNotMatch(result.text,/email has been sent/);
 const link=result.text.match(/href="(\/newsletter\/unsubscribe\?token=[^"]+)"/)[1];assert.equal((await repo.list()).length,1);assert.equal((await repo.list())[0].active,true);
 assert.equal((await agent.get(link)).status,200);assert.equal((await repo.list())[0].active,true,'GET does not unsubscribe');
 page=await agent.get(link);csrf=page.text.match(/name="_csrf" value="([^"]+)"/)[1];const token=new URL('http://localhost'+link).searchParams.get('token');
 assert.equal((await agent.post('/newsletter/unsubscribe').type('form').send({_csrf:csrf,token})).status,200);assert.equal((await repo.list())[0].active,false);
 assert.equal((await agent.post('/newsletter/unsubscribe').type('form').send({_csrf:csrf,token:'bad'})).status,400);
});
test('newsletter rejects foreign origins and does not reveal stored addresses',async t=>{
 const db=new DatabaseSync(':memory:');t.after(()=>db.close());const repo=createNewsletterStore({db});const app=express();app.use(express.urlencoded({extended:false}));app.use(createNewsletterRouter({repo,secret:'newsletter-test-secret-at-least-32-characters',siteUrl:'http://localhost:3000'}));const agent=request.agent(app);const page=await agent.get('/newsletter');const csrf=page.text.match(/name="_csrf" value="([^"]+)"/)[1];assert.equal((await agent.post('/newsletter').set('Origin','https://foreign.example').type('form').send({_csrf:csrf,email:'buyer@example.com',consent:'yes'})).status,403);assert.equal((await repo.list()).length,0);
});
