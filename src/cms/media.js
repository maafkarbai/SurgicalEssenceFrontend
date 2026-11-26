import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import {randomUUID, createHash} from 'node:crypto';
import {mkdir, writeFile, unlink} from 'node:fs/promises';
import {join, resolve} from 'node:path';

const FILE_LIMIT = 5 * 1024 * 1024;
const REQUEST_LIMIT = 25 * 1024 * 1024 + 64 * 1024;
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const SAFE_FILE = new RegExp(`^${UUID}-(original|800|400)\\.webp$`);
const SAFE_ID = new RegExp(`^${UUID}$`);
const sizes = [['original', 1600], ['800', 800], ['400', 400]];
const invalid = (message, status = 400) => Object.assign(new Error(message), {status});

// Reject appended payloads as well as signatures that disagree with the decoder.
function completeContainer(buffer, format) {
  if (format === 'jpeg') {
    if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return false;
    let offset = 2;
    let scan = false;
    while (offset < buffer.length) {
      if (scan) {
        if (buffer[offset++] !== 0xff) continue;
        while (buffer[offset] === 0xff) offset++;
        const marker = buffer[offset++];
        if (marker === 0 || (marker >= 0xd0 && marker <= 0xd7)) continue;
        offset -= 2;
        scan = false;
      }
      if (buffer[offset++] !== 0xff) return false;
      while (buffer[offset] === 0xff) offset++;
      const marker = buffer[offset++];
      if (marker === 0xd9) return offset === buffer.length;
      if (marker === 0xd8 || marker === 0 || marker === undefined || offset + 2 > buffer.length) return false;
      const length = buffer.readUInt16BE(offset);
      if (length < 2 || offset + length > buffer.length) return false;
      offset += length;
      if (marker === 0xda) scan = true;
    }
    return false;
  }
  if (format === 'webp') return buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' && buffer.readUInt32LE(4) + 8 === buffer.length;
  if (format === 'png') {
    if (!buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return false;
    let offset = 8;
    while (offset + 12 <= buffer.length) {
      const length = buffer.readUInt32BE(offset);
      const type = buffer.toString('ascii', offset + 4, offset + 8);
      offset += length + 12;
      if (offset > buffer.length) return false;
      if (type === 'IEND') return length === 0 && offset === buffer.length;
    }
  }
  return false;
}

export async function optimizeImage(file) {
  if (!file.buffer?.length || file.buffer.length > FILE_LIMIT) throw invalid('Images must be at most 5 MB.', 413);
  const ext = /\.([a-z]+)$/i.exec(file.originalname || '')?.[1]?.toLowerCase();
  const declared = {'image/jpeg':'jpeg', 'image/png':'png', 'image/webp':'webp'}[file.mimetype];
  if (!declared || !['jpg','jpeg','png','webp'].includes(ext)) throw invalid('Only JPEG, PNG and WebP images are accepted.');
  try {
    const input = sharp(file.buffer, {failOn: 'warning', limitInputPixels: 40_000_000, animated: false});
    const meta = await input.metadata();
    const expected = ext === 'jpg' ? 'jpeg' : ext;
    if (meta.format !== declared || meta.format !== expected || !completeContainer(file.buffer, meta.format)) throw invalid('Image content does not match its file type.');
    if (!meta.width || !meta.height || meta.width > 10000 || meta.height > 10000 || meta.width * meta.height > 40_000_000 || (meta.pages || 1) !== 1) throw invalid('Image dimensions are too large or the image is animated.');
    // A fresh re-encode strips EXIF, ICC, XMP and original embedded payloads.
    const variants = [];
    for (const [name, width] of sizes) {
      const {data, info} = await input.clone().rotate().resize({width, height: width, fit: 'inside', withoutEnlargement: true}).webp({quality: 85}).toBuffer({resolveWithObject:true});
      variants.push({name, data, width:info.width, height:info.height});
    }
    return variants;
  } catch (error) {
    if (error.status) throw error;
    throw invalid('The image could not be decoded safely. Use a valid JPEG, PNG or WebP image.');
  }
}

export function createMediaService({repo, dataDir, cloud = Boolean(process.env.VERCEL), blobToken = process.env.BLOB_READ_WRITE_TOKEN, blobHost = process.env.BLOB_PUBLIC_HOST, blobClient} = {}) {
  const mediaDir = resolve(dataDir || 'data', 'media');
  const limits = Object.freeze({fileBytes:cloud ? 4 * 1024 * 1024 : FILE_LIMIT, maxFiles:cloud ? 1 : 5});
  const requestLimit = cloud ? limits.fileBytes + 64 * 1024 : REQUEST_LIMIT;
  const configuredHost = typeof blobHost === 'string' && /^[a-z0-9][a-z0-9-]*\.public\.blob\.vercel-storage\.com$/.test(blobHost) ? blobHost : null;
  const router = express.Router();
  router.get('/:filename', (req, res, next) => {
    if (cloud || !SAFE_FILE.test(req.params.filename)) return res.sendStatus(404);
    res.set({'Content-Type':'image/webp', 'X-Content-Type-Options':'nosniff', 'Cache-Control':'public, max-age=31536000, immutable', 'Content-Security-Policy':"default-src 'none'; sandbox"});
    res.sendFile(req.params.filename, {root:mediaDir, dotfiles:'deny'}, error => {
      if (!error) return;
      if (error.code === 'ENOENT' || error.status === 404) res.sendStatus(404);
      else next(error);
    });
  });
  const parse = multer({storage:multer.memoryStorage(), limits:{fileSize:limits.fileBytes, files:limits.maxFiles, fields:5, fieldSize:1024, parts:limits.maxFiles + 5, headerPairs:50}}).array('images', limits.maxFiles);
  async function client() { return blobClient || import('@vercel/blob'); }
  async function discard(record) {
    if (cloud) {
      const blob = await client();
      await blob.del([record.url, record.mediumUrl, record.smallUrl], {token:blobToken});
    } else if (SAFE_ID.test(record.storageKey || '')) {
      await Promise.all(sizes.map(([size]) => unlink(join(mediaDir, `${record.storageKey}-${size}.webp`)).catch(error => { if (error.code !== 'ENOENT') throw error; })));
    }
  }
  const ready = (req, res, next) => {
    if (cloud && (!blobToken || (!configuredHost && !blobClient))) return res.status(503).json({error:'Media storage is not configured. Set BLOB_READ_WRITE_TOKEN and BLOB_PUBLIC_HOST for persistent uploads.'});
    if (Number(req.headers['content-length'] || 0) > requestLimit) return res.status(413).json({error:'Upload request is too large.'});
    let received = 0;
    let exceeded = false;
    const countBytes = chunk => {
      received += chunk.length;
      if (received > requestLimit && !exceeded) {
        exceeded = true;
        req.unpipe();
        req.resume();
        if (!res.headersSent) res.status(413).json({error:'Upload request is too large.'});
      }
    };
    req.on('data', countBytes);
    req.once('end', () => req.off('data', countBytes));
    parse(req, res, error => {
      req.off('data', countBytes);
      if (exceeded) return;
      if (error) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({error:error.code === 'LIMIT_FILE_SIZE' ? `Images must be at most ${cloud ? 4 : 5} MiB.` : `Upload up to ${limits.maxFiles} JPEG, PNG or WebP image${limits.maxFiles === 1 ? '' : 's'} per request using the images field.`});
      next();
    });
  };
  async function persistPrepared(variants, actor, id = randomUUID(), contentHash) {
    const written = [];
    const record = {id, storageKey:id, alt:'', mime:'image/webp', width:variants[0].width, height:variants[0].height, bytes:variants.reduce((n,v)=>n+v.data.length,0),...(contentHash?{contentHash}:{})};
    try {
      if (cloud && (!blobToken || (!configuredHost && !blobClient))) throw invalid('Media storage is not configured.',503);
      if (!cloud) await mkdir(mediaDir, {recursive:true});
      const urls = {};
      for (const variant of variants) {
        const filename = `${id}-${variant.name}.webp`;
        let url;
        if (cloud) ({url} = await (await client()).put(`media/${filename}`,variant.data,{access:'public',addRandomSuffix:false,contentType:'image/webp',token:blobToken}));
        else { await writeFile(join(mediaDir,filename),variant.data,{flag:'wx'}); url=`/media/${filename}`; }
        written.push({url,filename}); urls[variant.name]=url;
        if (cloud && configuredHost && new URL(url).hostname!==configuredHost) throw invalid('The configured image host does not match the Blob store.',503);
      }
      Object.assign(record,{url:urls.original,mediumUrl:urls['800'],smallUrl:urls['400']});
      return await repo.saveMedia(record,actor) || record;
    } catch(error) {
      await Promise.allSettled(written.map(async object=>cloud?(await client()).del(object.url,{token:blobToken}):unlink(join(mediaDir,object.filename))));
      throw error;
    }
  }
  // A stable import storage ID makes retries after an interrupted request idempotent.
  async function persistImage(file,actor) {
    if (file.buffer?.length > limits.fileBytes) throw invalid('Image exceeds the upload limit.',413);
    const id=file.importStorageId;
    if (id && !SAFE_ID.test(id)) throw invalid('Invalid import image identifier.');
    if (id) { const existing=await repo.getMedia(id); if (existing) return existing; }
    const contentHash=createHash('sha256').update(file.buffer).digest('hex');if(file.importContentHash&&file.importContentHash!==contentHash)throw invalid('Image content hash changed.');
    return persistPrepared(await optimizeImage(file),actor,id,contentHash);
  }
  async function discardImage(id,actor) {
    const record=await repo.getMedia(id);
    if (!record) return;
    await repo.deleteMedia(id,actor);
    try { await discard(record); } catch(error) { await repo.saveMedia(record,'media-delete-retry'); throw error; }
  }
  const handleUpload = async (req,res,next) => {
    const saved=[];
    try {
      if (!req.files?.length) throw invalid('Choose at least one image.');
      const prepared=[];
      for (const file of req.files) prepared.push({variants:await optimizeImage(file),contentHash:createHash('sha256').update(file.buffer).digest('hex')});
      for (const item of prepared) saved.push(await persistPrepared(item.variants,req.adminSession?.userId || req.admin?.id || 'admin',undefined,item.contentHash));
      res.status(201).json({images:saved});
    } catch(error) {
      await Promise.allSettled(saved.map(record=>discardImage(record.id,'upload-rollback')));
      if(error.status) return res.status(error.status).json({error:error.message});
      next(error);
    }
  };
  const remove = async (req, res, next) => {
    try {
      const record = await repo.getMedia(req.params.id);
      if (!record) return res.status(404).json({error:'Image not found.'});
      if (cloud && (!blobToken || (!configuredHost && !blobClient))) return res.status(503).json({error:'Media storage is not configured.'});
      await repo.deleteMedia(record.id, req.adminSession?.userId || req.admin?.id || 'admin');
      try {
        await discard(record);
      } catch (error) {
        // Retain a trackable record so an interrupted object-store deletion can
        // be retried from the library instead of silently orphaning objects.
        await repo.saveMedia(record, 'media-delete-retry');
        throw error;
      }
      res.json({ok:true});
    } catch (error) {
      if (error.code === 'MEDIA_IN_USE' || error.status === 409) return res.status(409).json({error:'This image is in use. Remove it from products and categories first.'});
      next(error);
    }
  };
  return {persistImage, discardImage, router, upload:[ready, handleUpload], remove, list:()=>repo.listMedia(), mediaDir, limits};
}
