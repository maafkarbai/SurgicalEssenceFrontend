import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import sharp from 'sharp';
import {createApp} from '../src/app.js';
import {hashPassword} from '../src/cms/auth.js';
const dir=mkdtempSync(join(tmpdir(),'se-admin-browser-'));
const {app,db,cms}=createApp({dataDir:dir,siteUrl:'http://127.0.0.1:3102'});
await cms.ready(); await cms.createAdmin({email:'admin@example.com',passwordHash:await hashPassword('secure-browser-password')});
const server=app.listen(3102,'127.0.0.1');
const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
const context=await browser.newContext({viewport:{width:1440,height:1000}}); const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:3102';
try {
 await page.goto(base+'/admin/'); await page.getByLabel('Email',{exact:true}).fill('admin@example.com'); await page.getByLabel('Password',{exact:true}).fill('secure-browser-password'); await page.getByRole('button',{name:'Sign in',exact:true}).click(); await page.waitForURL(base+'/admin/');
 await page.getByRole('link',{name:'Add product',exact:true}).click(); await page.getByLabel('Product name',{exact:true}).fill('Browser test instrument'); await page.getByLabel('SKU / reference number').fill('BROWSER-CMS-1'); await page.locator('select[name=categoryId]').selectOption({index:1}); await page.getByLabel('Full description',{exact:true}).fill('Verified browser workflow details.');
 const png=await sharp({create:{width:900,height:400,channels:3,background:'#ddeeff'}}).png().toBuffer();
 await page.locator('[data-image-upload]').setInputFiles([{name:'instrument.png',mimeType:'image/png',buffer:png},{name:'instrument-two.png',mimeType:'image/png',buffer:png}]);
 await page.locator('.image-row').nth(1).waitFor(); await page.locator('.image-row').nth(1).getByRole('button',{name:'Make primary'}).click(); await page.locator('.image-row').first().getByLabel('Alt text').fill('Instrument primary view');
 await page.getByRole('button',{name:'Save product',exact:true}).click(); await page.waitForURL(/\/edit\?saved=1$/); assert.equal(await page.locator('.image-row').count(),2); assert.equal(await page.locator('.image-row').first().getByLabel('Alt text').inputValue(),'Instrument primary view');
 const product=(await cms.products({all:true,q:'BROWSER-CMS-1'})).items[0]; assert.equal(product.status,'draft'); assert.equal((await page.request.get(base+'/products/'+product.slug)).status(),404);
 const preview=await page.context().newPage(); await preview.goto(base+'/admin/preview/'+product.id); assert.equal(await preview.locator('h1').textContent(),'Browser test instrument'); await preview.close();
 await page.locator('select[name=status]').selectOption('published');
 const blocked=await Promise.all([page.waitForResponse(r=>r.url().endsWith('/admin/products/save')&&r.request().method()==='POST'),page.getByRole('button',{name:'Save product',exact:true}).click()]);
 assert.equal(blocked[0].status(),400);assert.equal((await cms.product(product.id,{all:true})).status,'draft');assert.ok(await page.getByText('Review the product source evidence before publishing.',{exact:false}).isVisible());
 await page.getByLabel('Source document / revision',{exact:true}).fill('Synthetic browser catalogue'); await page.getByLabel('Source PDF page',{exact:true}).fill('5'); await page.getByLabel('Image evidence / source match',{exact:true}).fill('Synthetic image reviewed'); await page.getByLabel('Source review notes',{exact:true}).fill('Compared reference, name, dimensions and images for test.'); await page.getByLabel('Source review action',{exact:true}).selectOption('verify');
 await page.locator('select[name=status]').selectOption('published'); await Promise.all([page.waitForResponse(r=>r.url().endsWith('/admin/products/save')&&r.request().method()==='POST'),page.getByRole('button',{name:'Save product',exact:true}).click()]); assert.equal((await page.request.get(base+'/products/'+product.slug)).status(),200);
 await page.getByLabel('Size / dimensions',{exact:true}).fill('99 cm');
 const changed=await Promise.all([page.waitForResponse(r=>r.url().endsWith('/admin/products/save')&&r.request().method()==='POST'),page.getByRole('button',{name:'Save product',exact:true}).click()]);
 assert.equal(changed[0].status(),400);assert.equal((await cms.product(product.id)).length,'');
 await page.locator('select[name=status]').selectOption('draft');await page.getByRole('button',{name:'Save product',exact:true}).click();await page.waitForURL(/\/edit\?saved=1$/);assert.equal((await cms.product(product.id,{all:true})).verification.status,'unreviewed');
 await page.getByLabel('Source review action',{exact:true}).selectOption('verify');await page.locator('select[name=status]').selectOption('published');await page.getByRole('button',{name:'Save product',exact:true}).click();await page.waitForURL(/\/edit\?saved=1$/);assert.equal((await cms.product(product.id)).verification.status,'verified');
 mkdirSync('test-results',{recursive:true});
 for(const width of [375,1440]) { await page.setViewportSize({width,height:1000}); for(const route of ['/admin/','/admin/products','/admin/products/'+product.id+'/edit','/admin/categories','/admin/media','/admin/settings']) { await page.goto(base+route); const overflow=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth&&getComputedStyle(e).position!=='absolute').map(e=>`${e.tagName}.${e.className}:${e.getBoundingClientRect().right}`).slice(0,10)); assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} overflow at ${width}: ${overflow.join(', ')}`); const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze(); assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],`${route} accessibility at ${width}`); } await page.goto(base+'/admin/products/'+product.id+'/edit'); await page.screenshot({path:`test-results/admin-editor-${width}.png`,fullPage:true}); }
 assert.deepEqual(errors,[]); console.log('Admin browser flow passed: login, two uploads, primary image ordering, alt persistence, draft preview, blocked unreviewed publication, source review, edit invalidation and re-review, publish, 12 desktop/mobile route/accessibility checks.');
} finally { await browser.close(); await new Promise(r=>server.close(r)); db.close(); rmSync(dir,{recursive:true,force:true}); }
