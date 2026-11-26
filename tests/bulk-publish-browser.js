import {reviewFixture} from './review-fixture.js';
// Browser plugin not available: use the repository's existing Playwright/msedge setup.
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../src/app.js';
import {hashPassword} from '../src/cms/auth.js';

const dir=mkdtempSync(join(tmpdir(),'se-bulk-browser-'));
const {app,db,cms:repo}=createApp({dataDir:dir,siteUrl:'http://127.0.0.1:3114'});
await repo.ready();await repo.createAdmin({email:'bulk-browser@example.com',passwordHash:await hashPassword('bulk-browser-password')});
const draftCategory=await repo.saveCategory({name:'Unpublished category',slug:'unpublished-bulk',status:'draft'},'test');
const create=(code,extra={})=>repo.saveProduct({...reviewFixture,code,name:`Bulk browser ${code}`,categoryId:'beauty',status:'draft',description:'Original details',images:[{url:'/images/optimized/003-004-00.webp',alt:'Reference image'}],...extra},'test');
for(let i=0;i<53;i++)await create(`BULK-UI-${String(i).padStart(3,'0')}`);
const blocked=await create('BLOCKED',{categoryId:draftCategory.id});
const stale=await create('STALE');
const server=app.listen(3114,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));const base='http://127.0.0.1:3114';
const list=(query='')=>page.goto(base+'/admin/products'+query);
const count=()=>page.locator('#bulk-selected-count');
async function publish(){await page.getByRole('button',{name:'Publish selected',exact:true}).click();await page.locator('#bulk-confirm-dialog[open]').waitFor();await page.getByRole('button',{name:'Confirm bulk publish',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#bulk-job-status')?.textContent==='Complete');}
async function audit(width){
 await page.setViewportSize({width,height:1000});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow at ${width}`);
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 assert.deepEqual(result.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],`Accessibility at ${width}`);
}
try{
 await page.goto(base+'/admin/login');await page.getByLabel('Email',{exact:true}).fill('bulk-browser@example.com');await page.getByLabel('Password',{exact:true}).fill('bulk-browser-password');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL(base+'/admin/');
 await list('?q=BULK-UI&category=beauty&status=draft');assert.match(await page.title(),/Products/);
 assert.equal(await page.locator('[data-product-select]').count(),25);assert.equal(await page.getByRole('button',{name:'Publish selected',exact:true}).isDisabled(),true);
 await page.locator('[data-product-select]').first().check();assert.equal(await count().textContent(),'1 selected');assert.equal(await page.locator('#select-page').evaluate(e=>e.indeterminate),true);
 await page.locator('#select-page').check();assert.equal(await count().textContent(),'25 selected');
 await page.getByRole('button',{name:'Select all 53 products matching these filters',exact:true}).click();assert.equal(await count().textContent(),'53 selected across all pages');
 await page.getByRole('button',{name:'Clear selection',exact:true}).click();assert.equal(await count().textContent(),'0 selected');
 // Verify filter changes clear selection before submitting the filter form.
 await page.locator('[data-product-select]').first().check();await page.locator('select[name=status]').selectOption('published');assert.equal(await count().textContent(),'0 selected');
 await list('?q=BULK-UI&category=beauty&status=draft');await page.locator('[data-product-select]').first().check();
 await audit(1440);await page.screenshot({path:join(dir,'bulk-selection-desktop.png'),fullPage:true});await audit(375);await page.screenshot({path:join(dir,'bulk-selection-mobile.png'),fullPage:true});await page.setViewportSize({width:1440,height:1000});
 const chosen=await page.locator('[data-product-select]').first().getAttribute('data-product-id');const before=await repo.product(chosen,{all:true});
 await page.getByRole('button',{name:'Publish selected',exact:true}).click();await page.locator('#bulk-confirm-dialog[open]').waitFor();assert.equal((await repo.product(chosen,{all:true})).status,'draft');
 await audit(1440);await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal((await repo.product(chosen,{all:true})).status,'draft');
 await publish();assert.match(await page.locator('#bulk-job-summary').textContent(),/1 published/);
 const after=await repo.product(chosen);assert.equal(after.description,before.description);assert.deepEqual(after.images,before.images);
 assert.equal(await page.locator('.toolbar > p').textContent(),'52 products');
 assert.equal(await page.locator(`[data-product-id="${chosen}"]`).count(),0);
 await page.getByRole('link',{name:'Refresh products',exact:true}).click();assert.match(page.url(),/category=beauty/);assert.equal(await count().textContent(),'0 selected');
 // Freeze all matching rows, then create a late match. It must stay a draft.
 await page.locator('#select-page').check();await page.getByRole('button',{name:'Select all 52 products matching these filters',exact:true}).click();await page.getByRole('button',{name:'Publish selected',exact:true}).click();await page.locator('#bulk-confirm-dialog[open]').waitFor();
 const late=await create('BULK-UI-LATE');
 await page.getByRole('button',{name:'Confirm bulk publish',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#bulk-job-status')?.textContent==='Complete');
 assert.match(await page.locator('#bulk-job-summary').textContent(),/52 published/);assert.equal((await repo.product(late.id,{all:true})).status,'draft');
 await page.reload();await page.locator('#bulk-job-status').filter({hasText:'Complete'}).waitFor();
 assert.equal((await repo.products({q:'BULK-UI',category:'beauty',limit:100})).total,53);
 for(const path of ['/products?q=BULK-UI','/products?category=beauty','/products/'+before.slug,'/sitemap.xml']){const response=await page.request.get(base+path);assert.equal(response.status(),200);assert.match(await response.text(),/bulk-ui-/i);}
 // Category restriction and a concurrent edit both appear as failures.
 await list('?q=BLOCKED');await page.locator('[data-product-select]').first().check();await publish();assert.match(await page.locator('#bulk-job-summary').textContent(),/1 failed/);assert.match(await page.locator('#bulk-results').textContent(),/category/i);assert.equal((await repo.product(blocked.id,{all:true})).status,'draft');
 await list('?q=STALE');await page.locator('[data-product-select]').first().check();await page.getByRole('button',{name:'Publish selected',exact:true}).click();await page.locator('#bulk-confirm-dialog[open]').waitFor();await repo.saveProduct({id:stale.id,revision:stale.revision,name:'Changed concurrently'},'other');await page.getByRole('button',{name:'Confirm bulk publish',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#bulk-job-status')?.textContent==='Complete');assert.match(await page.locator('#bulk-results').textContent(),/changed after selection/i);
 await audit(375);await page.screenshot({path:join(dir,'bulk-results-mobile.png'),fullPage:true});assert.deepEqual(errors,[]);
 // A confirmation committed on the server but its response was lost. The job
 // must remain discoverable, and pausing/reloading must not start more batches.
 for(let i=0;i<45;i++)await create(`RECOVER-${String(i).padStart(3,'0')}`);
 await page.setViewportSize({width:1440,height:1000});await list('?q=RECOVER&status=draft');await page.locator('#select-page').check();await page.getByRole('button',{name:'Select all 45 products matching these filters',exact:true}).click();
 await page.getByRole('button',{name:'Publish selected',exact:true}).click();await page.locator('#bulk-confirm-dialog[open]').waitFor();
 await page.route('**/bulk-publish/*/confirm',async route=>{await route.fetch();await route.abort('failed');});
 await page.getByRole('button',{name:'Confirm bulk publish',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#bulk-job-status')?.textContent==='Paused');
 assert.match(page.url(),/publishJob=/);assert.equal((await repo.products({all:true,q:'RECOVER',status:'draft'})).total,45);
 await page.unroute('**/bulk-publish/*/confirm');
 await list('?q=RECOVER&status=draft');await page.getByRole('link',{name:/Resume publishing job \(45 selected products/}).click();await page.waitForFunction(()=>document.querySelector('#bulk-job-status')?.textContent==='Paused');
 let release,started;
 const entered=new Promise(resolve=>{started=resolve;});const gate=new Promise(resolve=>{release=resolve;});
 await page.route('**/bulk-publish/*/advance',async route=>{const response=await route.fetch();started();await gate;await route.fulfill({response});});
 await page.getByRole('button',{name:'Resume publishing',exact:true}).click();await entered;
 await page.getByRole('button',{name:'Pause after this batch',exact:true}).click();release();
 await page.waitForFunction(()=>document.querySelector('#bulk-job-status')?.textContent==='Paused');assert.match(await page.locator('#bulk-job-summary').textContent(),/20 of 45 processed/);
 await page.unroute('**/bulk-publish/*/advance');
 await page.getByRole('link',{name:'Refresh products',exact:true}).click();assert.match(page.url(),/publishJob=/);await page.waitForFunction(()=>document.querySelector('#bulk-job-status')?.textContent==='Paused');
 assert.equal((await repo.products({all:true,q:'RECOVER',status:'draft'})).total,25);
 await page.getByRole('button',{name:'Resume publishing',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#bulk-job-status')?.textContent==='Complete');
 assert.match(await page.locator('#bulk-job-summary').textContent(),/45 published/);assert.equal(await page.locator('.toolbar > p').textContent(),'0 products');
 assert.equal(await page.locator('#bulk-active-jobs').isVisible(),false);
 // Restoring a preview still requires an explicit confirmation.
 const previewResponse=await page.request.post(base+'/admin/products/bulk-publish/prepare',{headers:{'x-csrf-token':await page.locator('meta[name=csrf-token]').getAttribute('content')},data:{mode:'all',filters:{q:'STALE'}}});const previewJob=await previewResponse.json();
 await list('?q=STALE&publishJob='+previewJob.id);await page.locator('#bulk-confirm-dialog[open]').waitFor();assert.equal((await repo.product(stale.id,{all:true})).status,'draft');
 await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.waitForURL(url=>!url.searchParams.has('publishJob'));assert.deepEqual(errors,[]);
 // Retain screenshots outside the repo while cleaning the test database.
 const {copyFileSync,mkdirSync}=await import('node:fs');const evidence=join(process.env.TEMP||tmpdir(),'se-bulk-publish-evidence');mkdirSync(evidence,{recursive:true});for(const name of ['bulk-selection-desktop.png','bulk-selection-mobile.png','bulk-results-mobile.png'])copyFileSync(join(dir,name),join(evidence,name));
 console.log('Browser QA passed: row/page/all-filtered selection, confirmation/cancel, late match exclusion, persistence, public surfaces, category/stale failures, lost-confirm response recovery, pause/refresh/resume, preview restoration, desktop/mobile accessibility. Screenshots:',evidence);
}finally{await browser.close();await new Promise(r=>server.close(r));db.close();rmSync(dir,{recursive:true,force:true});}
