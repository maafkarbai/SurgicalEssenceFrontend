import express from 'express';
import multer from 'multer';
import { createImportService, IMPORT_LIMITS } from './import-service.js';

export function createImportRouter({ service, repo, media, secret } = {}) {
  const imports = service || createImportService({ repo, media, secret });
  const router = express.Router();
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: IMPORT_LIMITS.csvBytes, files: 1, fields: 2 } });
  const actor = req => req.admin?.id;
  const render = (res, data) => res.render('admin/import', { user: res.locals.user, csrf: res.locals.csrf, error: '', message: '', ...data });
  // Authentication and CSRF are provided by the protected parent admin router.
  router.use((req, res, next) => { if (!req.admin) return res.sendStatus(401); res.set('Cache-Control', 'no-store'); next(); });
  router.get('/', async (req, res) => render(res, { jobId: '', jobs: await imports.list(actor(req), { page: Math.max(1, Math.floor(Number(req.query.page) || 1)) }) }));
  router.get('/template.csv', async (req, res) => res.type('csv').attachment('products-import-template.csv').send(await imports.template()));
  router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Choose a CSV file.' });
    const job = await imports.create({ csv: req.file.buffer, filename: req.file.originalname, userId: actor(req) });
    res.status(201).json(job);
  });
  router.get('/:id/state', async (req, res) => res.json({ ...await imports.get(req.params.id, actor(req)), categories: repo?.categories ? await repo.categories({ all: true }) : [] }));
  router.get('/:id/rows', async (req, res) => res.json(await imports.rows(req.params.id, { q: String(req.query.q || '').slice(0, 200), page: Math.max(1, Math.floor(Number(req.query.page) || 1)), limit: 25 }, actor(req))));
  router.get('/:id/report.csv', async (req, res) => res.type('csv').attachment('products-import-report.csv').send(await imports.report(req.params.id, { errorsOnly: req.query.errors === '1' }, actor(req))));
  router.post('/:id/configure', async (req, res) => res.json(await imports.configure(req.params.id, req.body, actor(req))));
  router.post('/:id/chunks', express.raw({ type: 'application/octet-stream', limit: '512kb' }), async (req, res) => {
    if (!Buffer.isBuffer(req.body)) return res.status(400).json({ error: 'Choose an image ZIP file.' });
    res.json(await imports.uploadChunk(req.params.id, { index: Number(req.query.index), total: Number(req.query.total), filename: String(req.query.filename || 'images.zip'), data: req.body }, actor(req)));
  });
  for (const action of ['validate', 'advance', 'cancel']) router.post(`/:id/${action}`, async (req, res) => res.json(await imports[action](req.params.id, actor(req))));
  router.post('/:id/confirm', async (req, res) => res.json(await imports.confirm(req.params.id, { backupAcknowledged: req.body.backupAcknowledged === true }, actor(req))));
  router.get('/:id', async (req, res) => { await imports.get(req.params.id, actor(req)); render(res, { jobId: req.params.id, jobs: [] }); });
  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const expected = error.status >= 400 && error.status < 500;
    const limited = error.code === 'LIMIT_FILE_SIZE';
    if (!expected && !limited) console.error('Import request failed:', /^[A-Z0-9_]+$/.test(error.code || '') ? error.code : 'IMPORT_UNAVAILABLE');
    res.status(limited ? 413 : expected ? error.status : 503).json({ error: limited ? 'CSV files must be no larger than 4 MiB.' : expected ? error.message : 'Import could not be completed. Refresh history and retry.' });
  });
  return router;
}
