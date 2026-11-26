import express from 'express';
import { createImportRouter } from './import-router.js';
import { createBulkPublishRouter } from './bulk-publish-router.js';
import {createSalesRouter} from '../sales-router.js';
import {createPressAdminRouter} from '../engagement-router.js';
import {createNewsletterAdminRouter} from '../newsletter.js';
import { randomToken, tokenHash, equal, hashPassword, verifyPassword, signedToken, validSignedToken } from './auth.js';

export function createAdminRouter({ repo, secret, production = false, media, previewProduct, salesRepo, engagement, newsletter, siteUrl='http://localhost:3000' }) {
  if (!secret || secret.length < 32) throw new Error('CMS session secret must contain at least 32 characters.');
  const router = express.Router();
  const cookieOptions = { httpOnly: true, sameSite: 'strict', secure: production, path: '/admin', maxAge: 8 * 3600000 };
  const cookies = req => Object.fromEntries((req.headers.cookie || '').split(';').map(v => v.trim().split('=' )).filter(v => v.length === 2));
  const render = (res, view, data = {}) => res.render(`admin/${view}`, { user: null, csrf: '', error: '', errors: {}, message: '', ...res.locals, ...data });
  const fail = (res, error) => res.status(error.status || 400).send('The operation could not be completed. Please return and try again.');
  router.use((req, res, next) => { res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }); if (production && !req.secure) return res.status(400).send('HTTPS is required.'); next(); });
  router.use(express.urlencoded({ extended: false, limit: '1mb' }), express.json({ limit: '1mb' }));
  router.get('/login', (req, res) => { const csrf = signedToken(secret); res.cookie('se_admin_login', csrf, { ...cookieOptions, maxAge: 3600000 }); render(res, 'login', { csrf }); });
  router.post('/login', async (req, res) => {
    const csrf = cookies(req).se_admin_login;
    if (!validSignedToken(csrf, secret) || !equal(csrf, req.body._csrf)) return res.status(403).send('Your form expired. Please reload the login page.');
    const email = String(req.body.email || '').trim().toLowerCase().slice(0, 254);
    const ip = req.ip || 'unknown';
    const key = tokenHash(`${ip}:${email}`), ipKey = tokenHash(`ip:${ip}`);
    const limits = await Promise.all([repo.loginLimit(key), repo.loginLimit(ipKey)]);
    if (limits.some(limit => Number(limit?.blockedUntil) > Date.now())) return res.status(429).render('admin/login', { csrf, email, error: 'Too many login attempts. Try again in 15 minutes.' });
    // Reserve attempts atomically before the expensive password check, including concurrent requests.
    const reserved = [await repo.recordLoginFailure(key), await repo.recordLoginFailure(ipKey)];
    if (reserved.some(limit => Number(limit?.attempts) > 5)) return res.status(429).render('admin/login', { csrf, email, error: 'Too many login attempts. Try again in 15 minutes.' });
    const admin = await repo.findAdmin(email);
    const ok = await verifyPassword(req.body.password, admin?.passwordHash || admin?.password_hash || `scrypt$16384$${'0'.repeat(32)}$${'0'.repeat(128)}`);
    await repo.recordLoginAttempt({ key, success: Boolean(admin && ok), ip: tokenHash(ip) });
    if (ok) { await repo.clearLoginFailures(key); await repo.clearLoginFailures(ipKey); }
    if (!admin || !ok) return res.status(401).render('admin/login', { csrf, email, error: 'Email or password is incorrect.' });
    const token = randomToken();
    await repo.createSession({ id: tokenHash(token), userId: admin.id, csrfToken: randomToken(), expiresAt: new Date(Date.now() + cookieOptions.maxAge).toISOString() });
    res.clearCookie('se_admin_login', cookieOptions); res.cookie('se_admin_session', token, cookieOptions); res.redirect(303, '/admin/');
  });
  router.use(async (req, res, next) => {
    const raw = cookies(req).se_admin_session;
    const session = raw && await repo.getSession(tokenHash(raw));
    if (!session || new Date(session.expiresAt || session.expires_at).getTime() <= Date.now()) return res.redirect(303, '/admin/login');
    req.adminSession = session; req.sessionHash = tokenHash(raw);
    res.locals.user = { id: session.userId || session.user_id, email: session.email || 'Administrator' };
    req.admin = res.locals.user;
    res.locals.csrf = session.csrfToken || session.csrf_token;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !equal(res.locals.csrf, req.get('x-csrf-token') || req.body?._csrf)) return res.status(403).send('Your form expired. Reload the page and try again.');
    next();
  });
  router.use('/products/import', createImportRouter({ repo, media, secret }));
  if(salesRepo)router.use(createSalesRouter({repo:salesRepo}));
  if(engagement)router.use('/press-releases',createPressAdminRouter({repo:engagement,siteUrl}));
  if(newsletter)router.use(createNewsletterAdminRouter({repo:newsletter}));
  router.use('/products/bulk-publish', createBulkPublishRouter({repo}));
  router.post('/logout', async (req, res) => { await repo.deleteSession(req.sessionHash); res.clearCookie('se_admin_session', cookieOptions); res.redirect(303, '/admin/login'); });
  router.get('/', async (req, res) => {
    const [all, published, drafts, categories] = await Promise.all([repo.products({ all: true, sort: 'updated', limit: 8 }), repo.products({ all: true, status: 'published', limit: 1 }), repo.products({ all: true, status: 'draft', limit: 1 }), repo.categories({ all: true })]);
    const sales=salesRepo?await salesRepo.counts():null;
    render(res, 'dashboard', { all, published, drafts, categories, sales });
  });
  router.get('/products', async (req, res) => {
    const filters={q:String(req.query.q||'').slice(0,160),category:String(req.query.category||'').slice(0,160),status:String(req.query.status||''),page:Math.min(1000000,Math.max(1,Number.parseInt(req.query.page,10)||1)),limit:25,all:true};
    let result=await repo.products(filters);
    if(result.page>result.pages){filters.page=result.pages;result=await repo.products(filters);}
    render(res,'products',{filters,result,categories:await repo.categories({all:true}),publishJobs:await repo.bulkPublishList(res.locals.user.id),message:req.query.saved?'Product saved.':req.query.archived?'Product archived.':''});
  });
  const editor = async (req, res, product = {}, error = '', errors = {}) => render(res, 'product', { product, categories: await repo.categories({ all: true }), error, errors, message: req.query.saved ? 'Product saved.' : '' });
  router.get('/products/new', (req, res) => editor(req, res, { status: 'draft', images: [] }));
  router.get('/products/:id/edit', async (req, res) => { const p = await repo.product(req.params.id, { all: true }); if (!p) return res.sendStatus(404); await editor(req, res, p); });
  router.post('/products/save', async (req, res) => {
    let input = { ...req.body, featured: req.body.featured === 'on' };
    try { input.images = JSON.parse(req.body.images || '[]'); const saved = await repo.saveProduct(input, res.locals.user.id); res.redirect(303, `/admin/products/${saved.id}/edit?saved=1`); }
    catch (error) { res.status(error.status || 400); await editor(req, res, input, error.message, error.errors || {}); }
  });
  router.get('/preview/:id', async (req, res) => { const p = await repo.product(req.params.id, { all: true }); if (!p) return res.sendStatus(404); if (previewProduct) return previewProduct(req, res, p); render(res, 'preview', { product: p }); });
  router.get('/products/:id/archive', async (req, res) => { const item = await repo.product(req.params.id, { all: true }); if (!item) return res.sendStatus(404); render(res, 'confirm', { item, kind: 'products' }); });
  router.post('/products/:id/archive', async (req, res) => { await repo.archiveProduct(req.params.id, res.locals.user.id); res.redirect(303, '/admin/products?archived=1'); });
  router.get('/categories', async (req, res) => render(res, 'categories', { categories: await repo.categories({ all: true }), category: {} }));
  router.get('/categories/:id/edit', async (req, res) => { const categories = await repo.categories({ all: true }); const category = categories.find(c => c.id === req.params.id); if (!category) return res.sendStatus(404); render(res, 'categories', { categories, category }); });
  router.post('/categories/save', async (req, res) => { try { await repo.saveCategory(req.body, res.locals.user.id); res.redirect(303, '/admin/categories'); } catch (error) { res.status(error.status || 400); render(res, 'categories', { categories: await repo.categories({ all: true }), category: req.body, error: error.message }); } });
  router.get('/categories/:id/archive', async (req, res) => { const item = (await repo.categories({ all: true })).find(c => c.id === req.params.id); if (!item) return res.sendStatus(404); render(res, 'confirm', { item, kind: 'categories' }); });
  router.post('/categories/:id/archive', async (req, res) => { try { await repo.archiveCategory(req.params.id, res.locals.user.id); res.redirect(303, '/admin/categories'); } catch (error) { res.status(error.status || 400); render(res, 'categories', { categories: await repo.categories({ all: true }), category: {}, error: error.message }); } });
  router.get('/settings', (req, res) => render(res, 'settings'));
  router.post('/settings', async (req, res) => {
    try { const admin = await repo.findAdmin(req.body.email); if (!admin || admin.id !== res.locals.user.id || !await verifyPassword(req.body.currentPassword, admin.passwordHash || admin.password_hash)) throw new Error('Current email or password is incorrect.'); if (req.body.password !== req.body.confirmPassword) throw new Error('New passwords do not match.'); await repo.updatePassword(admin.id, await hashPassword(req.body.password)); if (repo.deleteUserSessions) await repo.deleteUserSessions(admin.id); else await repo.deleteSession(req.sessionHash); res.clearCookie('se_admin_session', cookieOptions); res.redirect(303, '/admin/login'); }
    catch (error) { res.status(400); render(res, 'settings', { error: error.message }); }
  });
  router.get('/media/list', async (req, res) => res.json({ images: media?.list ? await media.list() : [] }));
  router.get('/media', async (req, res) => render(res, 'media', { images: media?.list ? await media.list() : [] }));
  if (media?.upload) router.post('/media/upload', ...media.upload);
  if (media?.remove) router.post('/media/:id/delete', media.remove);
  router.use((error, req, res, next) => { console.error('Admin operation failed:', error.message); if (res.headersSent) return next(error); fail(res, error); });
  return router;
}
