import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../src/app.js';

const dir=mkdtempSync(join(tmpdir(),'se-browser-'));
const {app,db}=createApp({dataDir:dir,siteUrl:'http://127.0.0.1:3101',rateLimit:100});
const server=app.listen(3101,'127.0.0.1');
const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
const context=await browser.newContext();
const page=await context.newPage();
const base='http://127.0.0.1:3101',errors=[],issues=[],report={widths:[320,375,768,1024,1440],responsiveChecks:0,accessibility:[],journeys:[],brokenLinks:[],consoleErrors:errors};
const routes=['/','/products','/products/003-004-00','/oem-private-label','/quality','/about','/request-quote','/quote-list','/privacy'];
mkdirSync('test-results',{recursive:true});
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try {
 for(const width of report.widths){
  await page.setViewportSize({width,height:900});
  for(const path of routes){
   await page.goto(base+path);await page.evaluate(()=>document.fonts.ready);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   if(overflow)issues.push(`Horizontal overflow: ${width} ${path}`);
   assert.equal(await page.locator('h1').count(),1,`${path} h1`);report.responsiveChecks++;
   if([375,1440].includes(width)){
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    report.accessibility.push({width,path,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    if(axe.violations.length)issues.push(`Accessibility: ${width} ${path}: ${axe.violations.map(v=>v.id).join(', ')}`);
   }
   if([375,1440].includes(width)&&['/','/products','/request-quote','/products/003-004-00'].includes(path)){
    await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,20));}scrollTo(0,0);});
    await page.screenshot({path:`test-results/${path==='/'?'home':path.replaceAll('/','-').slice(1)}-${width}.png`,fullPage:true});
   }
  }
  console.log(`Responsive and applicable axe checks complete: ${width}px`);
 }
 await page.setViewportSize({width:375,height:850});await page.goto(base);
 await page.getByRole('button',{name:'Menu'}).click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
 await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
 await page.keyboard.press('Tab');report.journeys.push('Mobile menu opens and Escape restores focus');
 await page.goto(base+'/products');await page.getByLabel('Search by instrument or reference').fill('003-004-00');await page.getByRole('button',{name:'Search',exact:true}).click();assert.equal(await page.locator('.product-card').count(),1);
 await page.getByRole('button',{name:'Add Scalpel handle No. 4, 003-004-00 to quote list'}).click();await page.reload();assert.equal(await page.locator('[data-quote-count]').textContent(),'1');
 await page.goto(base+'/products?category=dental');assert.ok(await page.getByRole('heading',{name:'No online records in this range yet.'}).isVisible());
 await page.goto(base+'/products?type=Scissors');assert.equal(await page.locator('.product-card').count(),4);
 await page.locator('[data-add]').first().click();
 await page.goto(base+'/quote-list');assert.equal(await page.locator('.quote-row').count(),2);
 await page.getByRole('spinbutton').first().fill('75');await page.getByRole('spinbutton').first().blur();
 await page.getByRole('button',{name:/Remove Grazil/}).click();assert.equal(await page.locator('.quote-row').count(),1);
 await page.reload();assert.equal(await page.getByRole('spinbutton').inputValue(),'75');report.journeys.push('Search, category, type filter, add, reload, quantity edit and removal');
 await page.getByRole('link',{name:'Continue to quotation'}).click();await page.getByRole('button',{name:'Send quotation request'}).click();assert.ok(await page.locator('#form-errors').isVisible());
 await page.getByLabel('Full name *',{exact:true}).fill('Browser QA Buyer');await page.getByLabel('Company name *',{exact:true}).fill('Test Instruments Ltd');await page.getByLabel('Business email *',{exact:true}).fill('qa@example.com');await page.getByLabel('Country *',{exact:true}).fill('Germany');await page.getByLabel('Buyer type *').selectOption('Distributor');
 await page.getByText('OEM or private-label requirements',{exact:false}).click();await page.getByLabel('Branding, marking or packaging needs').fill('Please discuss sample marking.');
 await page.getByRole('button',{name:'Send quotation request'}).click();await page.getByRole('heading',{name:'Your enquiry has been received.'}).waitFor();assert.equal(db.prepare('select count(*) n from rfqs').get().n,1);assert.match(db.prepare('select payload from rfqs').get().payload,/"quantity":75/);assert.equal(await page.locator('[data-quote-count]').textContent(),'0');
 report.journeys.push('Inline validation, OEM expansion, RFQ accepted to database, success reference and list clear');
 const nojs=await browser.newContext({javaScriptEnabled:false});const npage=await nojs.newPage();await npage.goto(base+'/request-quote');await npage.locator('#name').fill('No JS Buyer');await npage.locator('#company').fill('Example Ltd');await npage.locator('#email').fill('nojs@example.com');await npage.locator('#country').fill('Canada');await npage.locator('#buyerType').selectOption('Importer / wholesaler');await npage.locator('#products').fill('Scalpel handles');await npage.getByRole('button',{name:'Send quotation request'}).click();await npage.getByRole('heading',{name:'Your enquiry has been received.'}).waitFor();await nojs.close();report.journeys.push('Server-rendered enquiry succeeds with JavaScript disabled');
 // All internal links from core pages resolve, including PDF files and product records.
 const hrefs=new Set();for(const path of routes){await page.goto(base+path);for(const href of await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))))if(href.startsWith('/')&&!href.startsWith('//'))hrefs.add(href.split('#')[0]);}
 for(const href of hrefs){const r=await context.request.head(base+href);if(r.status()>=400)report.brokenLinks.push({href,status:r.status()});}
 report.internalLinksChecked=hrefs.size;
 await page.goto(base+'/products');await page.locator('img').evaluateAll(nodes=>nodes.forEach(n=>{n.loading='eager';}));await page.waitForLoadState('networkidle');
 const brokenImages=await page.locator('img').evaluateAll(nodes=>nodes.filter(n=>!n.complete||n.naturalWidth===0).map(n=>n.src));assert.deepEqual(brokenImages,[]);
 assert.deepEqual(report.brokenLinks,[]);assert.deepEqual(errors,[]);assert.deepEqual(issues,[]);
 report.passed=true;console.log(JSON.stringify({responsiveChecks:report.responsiveChecks,axeChecks:report.accessibility.length,journeys:report.journeys,internalLinks:hrefs.size},null,2));
} finally {writeFileSync('test-results/browser-report.json',JSON.stringify({...report,issues},null,2));await browser.close();await new Promise(r=>server.close(r));db.close();rmSync(dir,{recursive:true,force:true});}
