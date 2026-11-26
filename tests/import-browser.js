import AxeBuilder from '@axe-core/playwright';
// Browser plugin not available; use the repository's Playwright/msedge setup.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import express from 'express';
import {resolve} from 'node:path';
import {mkdirSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createCmsStore} from '../src/cms/store.js';
import {createImportRouter} from '../src/cms/import-router.js';
const db=new DatabaseSync(':memory:'),repo=await createCmsStore({db});await repo.ready();const admin=await repo.createAdmin({email:'browser@example.com',passwordHash:'test-fixture-hash-that-is-more-than-32-characters'});const category=(await repo.categories({all:true}))[0];
const app=express(); app.set('view engine','ejs');app.set('views',resolve('views'));app.use(express.static(resolve('public')));app.use(express.json());
app.use('/admin/products/import',(req,res,next)=>{req.admin=admin;res.locals.user=admin;res.locals.csrf='browser-token';next();},createImportRouter({repo,media:{}}));
const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 const base=`http://127.0.0.1:${server.address().port}/admin/products/import`;
 await page.goto(base);assert.match(await page.title(),/Import products/);
 await page.locator('#csv-form input[type=file]').setInputFiles({name:'instruments.csv',mimeType:'text/csv',buffer:Buffer.from(`Product Code,Product Name,Category,material\nUI-BROWSER-101,Scissors,${category.name},Stainless steel`)});await page.getByRole('button',{name:'Upload and map columns'}).click();
 await page.waitForURL(url=>url.pathname!==new URL(base).pathname);await page.locator('#mapping-panel').waitFor({state:'visible'});assert.equal(await page.locator('select[name=map_sku]').inputValue(),'Product Code');assert.match(await page.locator('#sample-records').textContent(),/Scissors/);
 await page.getByRole('button',{name:'Save mapping and validate'}).click();await page.locator('#confirm-panel').waitFor({state:'visible'});await page.waitForFunction(()=>document.getElementById('import-rows').textContent.includes('Stainless steel'));
 await page.getByRole('checkbox',{name:'I have downloaded a database backup'}).check();await page.getByRole('button',{name:'Confirm and import valid rows'}).click();await page.waitForFunction(()=>document.getElementById('job-status').textContent==='completed');
 const created=(await repo.products({all:true,q:'UI-BROWSER-101'})).items[0];assert.equal(created.material,'Stainless steel');assert.equal(created.status,'draft');assert.equal(await page.getByRole('link',{name:'Edit product'}).getAttribute('href'),`/admin/products/${created.id}/edit`);
 await page.reload();await page.waitForFunction(()=>document.getElementById('job-status').textContent==='completed');assert.match(await page.locator('#progress-detail').textContent(),/1 of 1/);
 for(const width of [375,1440]){await page.setViewportSize({width,height:900});const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],`Import accessibility at ${width}px`);}
 mkdirSync('test-results',{recursive:true});await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'test-results/import-desktop.png',fullPage:true});
 await page.setViewportSize({width:375,height:900});await page.screenshot({path:'test-results/import-mobile.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);console.log('Real import service browser flow upload → mapping → diff → confirmation → persisted product → report link → reload passed; desktop/mobile screenshots captured.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));db.close();}
