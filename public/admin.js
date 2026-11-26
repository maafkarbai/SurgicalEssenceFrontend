(() => {
  'use strict';
  const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
  let dirty = false;
  document.querySelectorAll('[data-dirty-form]').forEach(form => {
    form.addEventListener('input', () => { dirty = true; });
    form.addEventListener('change', () => { dirty = true; });
    form.addEventListener('submit', () => { dirty = false; });
  });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
  const hidden = document.querySelector('[data-images]');
  let images = [];
  try { images = JSON.parse(hidden?.value || '[]'); } catch { /* Server displays validation errors. */ }
  const element = (tag, text, className) => { const el = document.createElement(tag); if (text) el.textContent = text; if (className) el.className = className; return el; };
  const button = (text, action) => { const b = element('button', text, 'secondary'); b.type = 'button'; b.addEventListener('click', action); return b; };
  function drawImages() {
    const container = document.querySelector('[data-image-editor]');
    if (!container || !hidden) return;
    hidden.value = JSON.stringify(images.map((m, index) => ({ ...m, position: index })));
    container.replaceChildren();
    images.forEach((m, index) => {
      const row = element('div', '', 'image-row');
      const image = element('img'); image.src = m.smallUrl || m.url; image.alt = m.alt || ''; row.append(image);
      const info = element('div'); info.append(element('strong', index === 0 ? 'Primary image' : `Image ${index + 1}`));
      const label = element('label', 'Alt text'); const input = element('input'); input.value = m.alt || ''; input.maxLength = 300;
      input.addEventListener('input', () => { images[index].alt = input.value; hidden.value = JSON.stringify(images); dirty = true; }); label.append(input); info.append(label);
      const controls = element('div', '', 'image-controls');
      controls.append(button('Make primary', () => { images.unshift(images.splice(index, 1)[0]); dirty = true; drawImages(); }));
      if(index > 0) controls.append(button('Move up', () => { [images[index-1], images[index]] = [images[index], images[index-1]]; dirty = true; drawImages(); }));
      if(index < images.length-1) controls.append(button('Move down', () => { [images[index+1], images[index]] = [images[index], images[index+1]]; dirty = true; drawImages(); }));
      controls.append(button('Remove', () => { images.splice(index, 1); dirty = true; drawImages(); }));
      const replaceLabel = element('label', 'Replace image'); const replace = element('input'); replace.type = 'file'; replace.accept = 'image/jpeg,image/png,image/webp';
      replace.addEventListener('change', async () => { const uploaded = await upload(replace.files); if (uploaded.length) { images[index] = { ...uploaded[0], alt: images[index].alt || '' }; dirty = true; drawImages(); } }); replaceLabel.append(replace); info.append(controls, replaceLabel); row.append(info); container.append(row);
    });
  }
  async function upload(files) {
    const status = document.querySelector('[data-upload-status]');
    if (!files?.length) return [];
    if (files.length > 5) { status.textContent = 'Upload up to five images at a time.'; return []; }
    status.textContent = 'Uploading images…';
    const previews = [];
    if (hidden) for (const file of files) { const preview = element('img', '', 'upload-preview'); preview.src = URL.createObjectURL(file); preview.alt = 'Selected image preview'; status.append(preview); previews.push(preview); }
    try {
      const uploaded = [];
      for (const file of files) {
        if (file.size > 4 * 1024 * 1024) throw new Error('Each image must be smaller than 4 MB.');
        const body = new FormData(); body.append('images', file);
        const response = await fetch('/admin/media/upload', { method: 'POST', headers: { 'x-csrf-token': csrf }, body });
        const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Upload failed. Please try again.');
        uploaded.push(...(data.images || []));
      }
      status.textContent = 'Images uploaded. Save the product to attach them.'; return uploaded;
    } catch(error) { status.textContent = error.message; return []; }
    finally { previews.forEach(p => URL.revokeObjectURL(p.src)); }
  }
  document.querySelector('[data-image-upload]')?.addEventListener('change', async event => { const added = await upload(event.target.files); images.push(...added); if(added.length) dirty = true; drawImages(); event.target.value = ''; });
  document.querySelector('[data-library-upload]')?.addEventListener('change', async event => { const added = await upload(event.target.files); if(added.length) location.reload(); });
  document.querySelector('[data-open-library]')?.addEventListener('click', async () => {
    const target = document.querySelector('[data-library-picker]'); target.textContent = 'Loading images…';
    try { const response = await fetch('/admin/media/list'); const data = await response.json(); target.replaceChildren();
      for (const m of data.images) { const b = button('Add image', () => { if (!images.some(i => i.id === m.id)) { images.push(m); dirty = true; drawImages(); } }); const image = element('img'); image.src = m.smallUrl || m.url; image.alt = m.alt || 'Library image'; b.prepend(image); target.append(b); }
      if(!data.images.length) target.textContent = 'No uploaded images available.';
    } catch { target.textContent = 'Could not load images. Please try again.'; }
  });
  document.querySelectorAll('[data-delete-media]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Permanently delete this unused image? This cannot be undone.')) return;
    try { const response = await fetch(`/admin/media/${encodeURIComponent(b.dataset.deleteMedia)}/delete`, { method: 'POST', headers: { 'x-csrf-token': csrf } }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Image could not be deleted.'); b.closest('article').remove(); }
    catch(error) { const status = document.querySelector('[data-upload-status]'); status.textContent = error.message; }
  }));
  drawImages();
})();
