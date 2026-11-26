// Browser plugin not available; use the repository's installed Playwright/Edge.
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../src/app.js';
import {hashPassword} from '../src/cms/auth.js';

const dir=mkdtempSync(join(tmpdir(),'se-consolidation-browser-')),base='http://127.0.0.1:3106';
const {app,db,cms}=createApp({dataDir:dir,siteUrl:base,rateLimit:100});
await cms.ready();await cms.createAdmin({email:'admin@example.com',passwordHash:await hashPassword('browser admin password')});
const server=app.listen(3106,'127.0.0.1'),browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
const context=await browser.newContext(),page=await context.newPage(),errors=[],report={responsive:[],accessibility:[],journeys:[],consoleErrors:errors};
page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text()+' '+JSON.stringify(m.location()));});
mkdirSync('test-results/consolidation',{recursive:true});
try{
 for(const width of [375,1440]){
  await page.setViewportSize({width,height:950});
  for(const path of ['/contact','/catalog','/distributor','/account/register','/press-releases','/newsletter']){
   const response=await page.goto(base+path);assert.equal(response.status(),200,path);assert.ok((await page.title()).includes('Surgical Essence'));assert.ok(await page.locator('h1').innerText());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width} ${path} overflow`);
   const axe=await new AxeBuilder({page}).analyze();const violations=axe.violations.filter(v=>['serious','critical'].includes(v.impact));assert.deepEqual(violations.map(v=>v.id),[],`${path} accessibility`);report.responsive.push({width,path});report.accessibility.push({width,path,serious:violations.length});
   if(path==='/distributor'||path==='/account/register')await page.screenshot({path:`test-results/consolidation/${path.split('/').pop()}-${width}.png`,fullPage:true});
  }
 }
 await page.goto(base+'/account/register');await page.getByLabel('Full name').fill('Browser Buyer');await page.getByLabel('Email',{exact:true}).fill('browser@example.com');await page.getByLabel('Password',{exact:true}).fill('browser buyer password');await page.getByRole('button',{name:'Create account',exact:true}).click();await page.waitForURL(base+'/account');assert.match(await page.locator('main').innerText(),/Browser Buyer/);
 await page.goto(base+'/request-quote?intent=distributor');await page.getByLabel('Full name').fill('Browser Buyer');await page.getByLabel('Company name').fill('Browser Supply');await page.getByLabel('Business email').fill('browser@example.com');await page.getByLabel('Country',{exact:false}).first().fill('Germany');await page.getByLabel('Proposed countries').fill('Germany and Austria');await page.getByLabel('Estimated purchasing volume').fill('Quarterly');await page.getByRole('button',{name:'Send quotation request'}).click();await page.getByRole('heading',{name:'Your enquiry has been received.'}).waitFor();const reference=(await page.locator('main').innerText()).match(/SE-[A-F0-9]+/)[0];await page.goto(base+'/account');assert.match(await page.locator('main').innerText(),new RegExp(reference));report.journeys.push('Register → distributor enquiry → persisted confirmation → private account history');
 const adminContext=await browser.newContext(),admin=await adminContext.newPage();await admin.goto(base+'/admin/login');await admin.getByLabel('Email').fill('admin@example.com');await admin.getByLabel('Password').fill('browser admin password');await admin.getByRole('button',{name:/sign in/i}).click();await admin.waitForURL(base+'/admin/');await admin.goto(base+'/admin/quotes/'+reference);await admin.getByLabel('Status',{exact:false}).selectOption('CONTACTED');await admin.getByLabel('notes',{exact:false}).fill('Browser verification note');await admin.getByRole('button',{name:/save|update/i}).click();assert.match(await admin.locator('main').innerText(),/Pipeline updated/);report.journeys.push('Admin login → enquiry detail → audited pipeline update');
 await admin.goto(base+'/admin/press-releases');await admin.getByLabel('Title',{exact:true}).fill('Verified browser update');await admin.getByLabel('Slug').fill('browser-update');await admin.getByLabel('Content',{exact:true}).fill('Synthetic test update for browser verification.');await admin.getByLabel('Status',{exact:false}).selectOption('published');await admin.getByRole('button',{name:'Save release'}).click();await admin.waitForURL(base+'/admin/press-releases');await page.goto(base+'/press-releases/browser-update');assert.equal(await page.locator('h1').innerText(),'Verified browser update');const sitemap=await page.request.get(base+'/sitemap.xml');assert.match(await sitemap.text(),/press-releases\/browser-update/);report.journeys.push('Admin publishes press release → public detail → sitemap');
 await page.goto(base+'/newsletter');await page.getByLabel('Business email').fill('updates@example.com');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Save preference'}).click();await page.getByRole('link',{name:'Manage subscription'}).click();await page.getByRole('button',{name:'Unsubscribe',exact:true}).click();assert.match(await page.locator('main').innerText(),/subscription is inactive/);report.journeys.push('Explicit newsletter preference → private link → confirmed unsubscribe');
 assert.deepEqual(errors,[]);report.passed=true;writeFileSync('test-results/consolidation/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}catch(error){console.error('Browser failure at '+page.url());console.error((await page.locator('main').innerText()).slice(0,1800));throw error;}finally{await browser.close();await new Promise(resolve=>server.close(resolve));db.close();rmSync(dir,{recursive:true,force:true});}
