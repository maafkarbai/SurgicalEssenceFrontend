import express from 'express';
import ejs from 'ejs';
import {rateLimit} from 'express-rate-limit';
import {randomToken,tokenHash,signedToken,validSignedToken,equal} from './cms/auth.js';
import {withDatabase} from './database-queue.js';

export function createNewsletterStore({db}){
 const cloud=Boolean(db.pool);let initialized;
 const query=async(sql,args=[])=>cloud?(await db.pool.query(sql.replace(/\?/g,(()=>{let i=0;return ()=>`$${++i}`;})()),args)).rows:withDatabase(db,()=>db.prepare(sql).all(...args));
 const run=async(sql,args=[])=>cloud?db.pool.query(sql.replace(/\?/g,(()=>{let i=0;return ()=>`$${++i}`;})()),args):withDatabase(db,()=>db.prepare(sql).run(...args));
 async function ready(){if(!initialized)initialized=run('CREATE TABLE IF NOT EXISTS se_newsletter (email TEXT PRIMARY KEY, active INTEGER NOT NULL, consent_at BIGINT NOT NULL, token_hash TEXT NOT NULL, updated_at BIGINT NOT NULL)').catch(error=>{initialized=undefined;throw error;});return initialized;}
 return {
  ready,
  async subscribe(email){await ready();const token=randomToken(),now=Date.now();await run('INSERT INTO se_newsletter(email,active,consent_at,token_hash,updated_at) VALUES(?,1,?,?,?) ON CONFLICT(email) DO UPDATE SET active=1,consent_at=excluded.consent_at,token_hash=excluded.token_hash,updated_at=excluded.updated_at',[email,now,tokenHash(token),now]);return token;},
  async unsubscribe(token){await ready();if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))return false;const hash=tokenHash(token);if(!(await query('SELECT email FROM se_newsletter WHERE token_hash=?',[hash])).length)return false;await run('UPDATE se_newsletter SET active=0,updated_at=? WHERE token_hash=?',[Date.now(),hash]);return true;},
  async list(){await ready();return (await query('SELECT email,active,consent_at,updated_at FROM se_newsletter ORDER BY consent_at DESC LIMIT 10000')).map(row=>({...row,active:Boolean(Number(row.active))}));}
 };
}
const escape=ejs.escapeXML;
function page(res,title,body,status=200){return res.status(status).type('html').send(`<!doctype html><html lang="en"><head><meta name="color-scheme" content="light"><meta name="theme-color" content="#ffffff"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>${escape(title)} | Surgical Essence</title><link rel="stylesheet" href="/styles.css"></head><body><main id="main" class="container prose section"><a href="/">Surgical Essence</a><h1>${escape(title)}</h1>${body}<p><a href="/privacy">Privacy notice</a> · <a href="/products">Browse instruments</a></p></main></body></html>`);}
export function createNewsletterRouter({repo,secret,siteUrl,production=false}){
 if(typeof secret!=='string'||secret.length<32)throw new Error('Newsletter requires a session secret.');
 const router=express.Router(),cookieOptions={httpOnly:true,sameSite:'strict',secure:production,path:'/newsletter',maxAge:3600000};
 // Keep native same-origin form Origin headers usable; external sites still
 // receive no referrer, including private unsubscribe tokens.
 router.use('/newsletter',(req,res,next)=>{res.set({'Cache-Control':'no-store','X-Robots-Tag':'noindex, follow','Referrer-Policy':'same-origin'});next();});
 function issue(res){const csrf=signedToken(secret);res.cookie('se_newsletter_csrf',csrf,cookieOptions);return csrf;}
 function csrfValid(req){const csrf=(req.headers.cookie||'').split(';').map(c=>c.trim()).find(c=>c.startsWith('se_newsletter_csrf='))?.slice('se_newsletter_csrf='.length);return validSignedToken(csrf,secret)&&equal(csrf,req.body?._csrf)&&(!req.get('Origin')||req.get('Origin')===new URL(siteUrl).origin);}
 const limiter=rateLimit({windowMs:3600000,limit:12,standardHeaders:'draft-8',legacyHeaders:false});
 router.get('/newsletter',(req,res)=>{const csrf=issue(res);return page(res,'Instrument updates',`<p>Save your preference to receive product and catalogue updates. You can withdraw it at any time. Saving a preference does not confirm that an email has been sent.</p><form method="post" action="/newsletter"><input type="hidden" name="_csrf" value="${escape(csrf)}"><p><label for="subscriber-email">Business email</label><br><input id="subscriber-email" name="email" type="email" required maxlength="254" autocomplete="email"></p><p><label><input type="checkbox" name="consent" value="yes" required> I would like to receive product and catalogue updates by email.</label></p><button class="button" type="submit">Save preference</button></form>`);});
 router.post('/newsletter',limiter,async(req,res)=>{
  if(!csrfValid(req))return page(res,'Please reload the form','<p>Your form session expired. <a href="/newsletter">Try again</a>.</p>',403);
  const email=typeof req.body.email==='string'?req.body.email.trim().toLowerCase():'';
  if(req.body.consent!=='yes'||email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email))return page(res,'Review your preference','<p>Enter a valid email and explicitly select the consent checkbox. <a href="/newsletter">Return to the form</a>.</p>',422);
  const token=await repo.subscribe(email);return page(res,'Preference saved',`<p>Your preference has been saved. Email updates depend on the business activating its mailing service.</p><p>Keep this private link to withdraw your preference: <a href="/newsletter/unsubscribe?token=${token}">Manage subscription</a>.</p>`);
 });
 router.get('/newsletter/unsubscribe',(req,res)=>{const token=typeof req.query.token==='string'?req.query.token:'';if(!/^[A-Za-z0-9_-]{43}$/.test(token))return page(res,'Invalid preference link','<p>Use your private subscription link or contact our team.</p>',400);const csrf=issue(res);return page(res,'Withdraw your preference',`<p>Confirm that you no longer want to receive updates. Opening this page does not change your preference.</p><form method="post" action="/newsletter/unsubscribe"><input type="hidden" name="_csrf" value="${escape(csrf)}"><input type="hidden" name="token" value="${escape(token)}"><button class="button" type="submit">Unsubscribe</button></form>`);});
 router.post('/newsletter/unsubscribe',limiter,async(req,res)=>{if(!csrfValid(req))return page(res,'Please reload the form','<p>Your form session expired.</p>',403);if(!await repo.unsubscribe(req.body.token))return page(res,'Invalid preference link','<p>Use your private subscription link or contact our team.</p>',400);return page(res,'Preference withdrawn','<p>Your subscription is inactive. No further updates should be sent to this subscription.</p>');});
 return router;
}

export function createNewsletterAdminRouter({repo}){
 const router=express.Router();
 router.get('/subscribers',async(req,res)=>res.render('admin/subscribers',{...res.locals,error:'',message:'',subscribers:await repo.list()}));
 return router;
}
