(() => {
  'use strict';
  const root = document.getElementById('import-app');
  if (!root) return;
  const base = '/admin/products/import';
  const csrf = document.querySelector('meta[name="csrf-token"]').content;
  const fields = ['sku','name','category','short_description','description','material','size','variations','image_filename','additional_images','seo_title','meta_description','slug','status','featured'];
  const $ = id => document.getElementById(id);
  const text = (tag, value, className) => { const el = document.createElement(tag); el.textContent = value == null ? '' : String(value); if (className) el.className = className; return el; };
  let jobId = root.dataset.jobId, job, page = 1, pages = 1, query = '', working = false, paused = false;
  function notice(message, error = false) { const node = $('import-notice'); node.hidden = !message; node.classList.toggle('error', error); node.textContent = message; }
  async function api(path, body, raw = false) {
    const options = body === undefined ? {} : { method: 'POST', headers: { 'x-csrf-token': csrf }, body };
    if (body !== undefined && !(body instanceof FormData)) { options.headers['Content-Type'] = raw ? 'application/octet-stream' : 'application/json'; if (!raw) options.body = JSON.stringify(body); }
    const response = await fetch(base + path, options);
    if (response.redirected) throw new Error('Your session expired. Reload this page to sign in.');
    let result; try { result = await response.json(); } catch { throw new Error('The request failed. Reload the page and try again.'); }
    if (!response.ok) throw new Error(result.error || 'The request failed. Please retry.');
    return result;
  }
  async function guard(task) { if (working) return; working = true; notice(''); try { await task(); } catch (error) { notice(error.message, true); } finally { working = false; } }
  function renderMapping() {
    const node = $('mapping-fields'); node.replaceChildren();
    fields.forEach(field => {
      const label = text('label', field.replaceAll('_', ' ') + (['sku','name','category'].includes(field) ? ' (required)' : ''));
      const select = document.createElement('select'); select.name = 'map_' + field;
      const none = text('option', 'Do not import'); none.value = ''; select.append(none);
      job.headers.forEach((header, index) => { const option = text('option', header); option.value = header; option.selected = job.mapping?.[field] === header || job.mapping?.[field] === index; select.append(option); });
      label.append(select); if (job.ambiguities?.[field]?.length) label.append(text('small', 'Several columns match. Choose one explicitly.')); const group = document.createElement('div'); group.append(label); if (!['sku','name','category','status'].includes(field)) { const clear = text('label', 'Clear this field when blank', 'check'); const box = document.createElement('input'); box.type = 'checkbox'; box.name = 'clear_' + field; box.checked = (job.config?.clearEmpty || []).includes(field); clear.prepend(box); group.append(clear); } node.append(group);
    });
    const form = $('mapping-form'); form.elements.mode.value = ({create_only:'add',update_existing:'update'})[job.config?.mode] || job.config?.mode || 'add'; form.elements.unknownCategories.value = job.config?.unknownCategories || ''; form.elements.replaceImages.checked = Boolean(job.config?.replaceImages);
    const categoryBox = $('category-mappings'); categoryBox.replaceChildren();
    if (job.unresolvedCategories?.length) categoryBox.append(text('h3', 'Map unknown categories'));
    job.unresolvedCategories?.forEach(category => {
      const name = typeof category === 'string' ? category : category.name || category.value;
      const label = text('label', name); const select = document.createElement('select'); select.dataset.category = name;
      for (const [value, title] of [['','Choose how to handle this category'],['skip','Skip rows in this category'],['create','Create this category'],...(job.categories || []).map(c => [c.id,c.name])]) { const option = text('option', title); option.value = value; select.append(option); }
      select.value = job.config?.categoryMappings?.[name] || ''; label.append(select); categoryBox.append(label);
    });
  }
  function renderSamples() {
    const rows = job.sampleRecords || job.sample || [];
    $('sample-panel').hidden = !rows.length;
    const table = document.createElement('table'), head = document.createElement('thead'), tr = document.createElement('tr');
    job.headers.forEach(h => tr.append(text('th', h))); head.append(tr); table.append(head);
    const body = document.createElement('tbody'); rows.slice(0,3).forEach(record => { const row = document.createElement('tr'); job.headers.forEach((h, i) => row.append(text('td', Array.isArray(record) ? record[i] : record[h]))); body.append(row); }); table.append(body); $('sample-records').replaceChildren(table);
  }
  function renderJob() {
    $('upload-panel').hidden = true; $('job-panel').hidden = false;
    $('job-title').textContent = job.filename || 'Product import'; $('job-status').textContent = job.status;
    $('report-link').href = `${base}/${encodeURIComponent(jobId)}/report.csv`; $('errors-link').href = `${base}/${encodeURIComponent(jobId)}/report.csv?errors=1`;
    const stats = $('import-stats'); stats.replaceChildren();
    for (const key of ['total','valid','invalid','duplicates','existing','new','missingImages','categoryIssues','created','updated','skipped','failed']) { const item = text('span', ({missingImages:'missing images',categoryIssues:'category issues'})[key] || key); item.prepend(text('strong', job.counts?.[key] || 0)); stats.append(item); }
    const validating = job.status === 'validating', running = job.status === 'running';
    const done = Number(validating ? job.validationCursor : job.cursor ?? ['created','updated','skipped','failed'].reduce((n, key) => n + (Number(job.counts?.[key]) || 0), 0)) || 0, total = Number(validating ? job.validationTotal : job.counts?.total) || 0;
    $('import-progress').max = Math.max(total, 1); $('import-progress').value = Math.min(done, total);
    $('progress-detail').textContent = `${done} of ${total} ${validating ? 'images validated' : 'rows processed'}. ${running && paused ? 'Paused. Resume when ready.' : ''}`;
    $('mapping-panel').hidden = !['mapping','configuring','preview','validating'].includes(job.status); $('confirm-panel').hidden = job.status !== 'preview';
    $('review-panel').hidden = ['mapping','configuring'].includes(job.status); $('validate-button').hidden = !validating; $('resume-button').hidden = !running; $('pause-button').hidden = !running; $('cancel-button').hidden = !['mapping','configuring','validating','preview'].includes(job.status);
    $('review-description').textContent = ['completed','completed_with_errors','cancelled'].includes(job.status) ? 'Saved results for this import. Download the report to review each row.' : 'Review changes, warnings and errors. No products change until you confirm.';
    renderMapping(); renderSamples();
  }
  const printable = value => typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
  async function loadRows() {
    if (job.status === 'mapping') return;
    const result = await api(`/${encodeURIComponent(jobId)}/rows?q=${encodeURIComponent(query)}&page=${page}`);
    const rows = Array.isArray(result) ? result : result.items || result.rows || []; pages = result.pages || Math.max(1, Math.ceil((result.total || rows.length) / 25));
    const body = $('import-rows'); body.replaceChildren();
    rows.forEach(row => {
      const tr = document.createElement('tr'); tr.append(text('td', row.row ?? row.rowNumber));
      const product = text('td', row.sku || '—'); product.append(text('div', row.name || ''));
      const id = row.productId || row.result?.productId || row.result?.id; if (id) { const link = text('a', 'Edit product'); link.href = `/admin/products/${encodeURIComponent(id)}/edit`; product.append(link); }
      tr.append(product, text('td', row.result?.status || (['created','updated','skipped','failed'].includes(row.status) ? row.status : '') || (typeof row.result === 'string' ? row.result : '') || row.action || '—'));
      const changes = Object.entries(row.changes || {}).map(([field, value]) => `${field}: ${value && typeof value === 'object' && ('before' in value || 'after' in value) ? `${printable(value.before)} → ${printable(value.after)}` : printable(value)}`).join('\n'); tr.append(text('td', changes || '—', 'import-change'));
      const messages = document.createElement('td'); (row.errors || []).forEach(e => messages.append(text('div', printable(e), 'import-error'))); (row.warnings || []).forEach(e => messages.append(text('div', printable(e), 'import-warning'))); if (row.result?.message || row.result?.reason) messages.append(text('div', row.result.message || row.result.reason)); tr.append(messages); body.append(tr);
    });
    if (!rows.length) { const tr = document.createElement('tr'), td = text('td', 'No matching rows.'); td.colSpan = 5; tr.append(td); body.append(tr); }
    $('rows-page').textContent = `Page ${page} of ${pages}`; $('rows-prev').disabled = page <= 1; $('rows-next').disabled = page >= pages;
  }
  async function refresh() { job = await api(`/${encodeURIComponent(jobId)}/state`); renderJob(); await loadRows(); }
  async function run(action) {
    paused = false;
    while (!paused) {
      job = await api(`/${encodeURIComponent(jobId)}/${action}`, {}); renderJob();
      if (action === 'validate' ? job.status !== 'validating' : job.status !== 'running') break;
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    await refresh();
  }
  $('csv-form').addEventListener('submit', event => { event.preventDefault(); guard(async () => { job = await api('/upload', new FormData(event.target)); location.assign(`${base}/${encodeURIComponent(job.id)}`); }); });
  $('mapping-form').addEventListener('submit', event => { event.preventDefault(); guard(async () => {
    const form = event.target, mapping = Object.create(null), categoryMappings = Object.create(null);
    fields.forEach(field => { if (form.elements['map_' + field].value) mapping[field] = form.elements['map_' + field].value; });
    form.querySelectorAll('[data-category]').forEach(select => { if (select.value) categoryMappings[select.dataset.category] = select.value; });
    await api(`/${encodeURIComponent(jobId)}/configure`, { mapping, mode: form.elements.mode.value, clearEmpty: fields.filter(field => form.elements['clear_' + field]?.checked), replaceImages: form.elements.replaceImages.checked, unknownCategories: form.elements.unknownCategories.value, categoryMappings }); await run('validate');
  }); });
  $('zip-form').addEventListener('submit', event => { event.preventDefault(); guard(async () => {
    const file = event.target.elements.file.files[0]; if (!file) return;
    if (file.size > 64 * 1024 * 1024 || file.size === 0) throw new Error('Choose a ZIP between 1 byte and 64 MiB.');
    const size = 512 * 1024, total = Math.ceil(file.size / size);
    for (let index = 0; index < total; index++) { await api(`/${encodeURIComponent(jobId)}/chunks?index=${index}&total=${total}&filename=${encodeURIComponent(file.name)}`, file.slice(index * size, (index + 1) * size), true); $('zip-progress').textContent = `Image ZIP uploaded: ${Math.round((index + 1) / total * 100)}%`; }
    await refresh(); notice('Image ZIP uploaded. Save mapping and validate to check image references.');
  }); });
  $('confirm-form').addEventListener('submit', event => { event.preventDefault(); guard(async () => { await api(`/${encodeURIComponent(jobId)}/confirm`, { backupAcknowledged: event.target.elements.backupAcknowledged.checked }); await run('advance'); }); });
  $('validate-button').addEventListener('click', () => guard(() => run('validate')));
  $('resume-button').addEventListener('click', () => guard(() => run('advance')));
  $('pause-button').addEventListener('click', () => { paused = true; notice('Pausing after the current batch. Your progress is saved.'); });
  $('cancel-button').addEventListener('click', () => guard(async () => { await api(`/${encodeURIComponent(jobId)}/cancel`, {}); await refresh(); notice('Import cancelled. No product writes were started.'); }));
  $('row-search').addEventListener('submit', event => { event.preventDefault(); query = event.target.elements.q.value; page = 1; guard(loadRows); });
  $('rows-prev').addEventListener('click', () => { if (page > 1) { page--; guard(loadRows); } }); $('rows-next').addEventListener('click', () => { if (page < pages) { page++; guard(loadRows); } });
  if (jobId) guard(refresh);
})();
