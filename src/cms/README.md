# CMS persistence and migration

`createCmsStore({db, cloud})` is a synchronous factory. Every repository method is asynchronous. `ready()` applies `schema.sql` and seeds the supplied catalogue in an atomic transaction; repeated calls preserve existing edits and archived records. No existing RFQ table is changed. All new tables use the `se_cms_` prefix. PostgreSQL is accessed through the `pool` exposed by `createPostgresStore`; SQLite uses the existing `DatabaseSync` connection with foreign keys enabled.

Back up the database before first deployment. Apply and validate this additive migration in staging before directing production traffic to the new application. No command in this implementation connects to or migrates a remote database during development. PostgreSQL schema and CMS writes acquire advisory transaction lock `73501921`; SQLite uses `BEGIN IMMEDIATE`. Migration failure rolls back and allows a subsequent retry. The initial seed contains five published categories and eight published products, preserving SKU, catalogue page, category assets and original image paths. The seed marker prevents accidental restoration of records after editorial changes.

The versioned `search_text_v1` migration adds/backfills a derived product search column when upgrading an existing CMS schema. It indexes textual values rather than JSON field names and is updated atomically with every product save.

## Repository

- `products({all=false,q='',category='',status='',page=1,limit=20,sort='catalogue'})` returns `{items,total,page,pages}`. `all` includes drafts and archives. Public listings also require a published category. Category accepts its ID or slug. Limit is 1–10000. Search treats wildcard characters literally. `sort:'updated'` orders newest edits first for the dashboard.
- `categories({all=false})` returns categories ordered by priority and name.
- `product(idOrSlug,{all=false})` resolves ID, current slug, current SKU, and the permanent original catalogue SKU aliases. `redirect(oldSlug)` returns the current slug only for a publicly visible product. Callers should check redirects before rendering old URLs.
- `saveProduct(input,actor)` and `saveCategory(input,actor)` return the saved record. Omit `id` to create; include `id` and the current numeric `revision` to edit. Stale saves throw `CONFLICT`/409. New records default to draft. Category input requires name/slug/status; product input requires code/name/categoryId (or category slug). Edits preserve omitted rich fields. Slugs, SKUs and old product slugs are protected from collisions.
- Product fields include `code,slug,name,type,length,pattern,page,sourcePage,categoryId,category,shortDescription,description,specifications,material,variations,notes,seoTitle,metaDescription,alt,featured,priority,status`. Records also expose `id,revision,createdAt,updatedAt,images,image`. Timestamps are epoch milliseconds. `image` resolves to the first gallery image, then the legacy image.
- Product `images` is an ordered array of `{id:mediaId,alt}` or `{mediaId,alt}`. Legacy URL records may use `{url,smallUrl,mediumUrl,alt}`. Omission preserves gallery links; `[]` removes them and clears the legacy fallback. Output includes `id,mediaId,url,smallUrl,mediumUrl,alt,position`. URLs accept only safe existing `/images/` files, generated `/media/UUID-(original|800|400).webp` files, or those generated media paths on the exact configured `BLOB_PUBLIC_HOST`. Cloud media requires that host to be configured.
- `archiveProduct(id,actor)` and `archiveCategory(id,actor)` archive without deleting. Categories cannot be archived while they contain any unarchived product, including drafts. Published categories cannot become drafts while containing published products.
- `listMedia()` (alias `media()`), `getMedia(id)`, `saveMedia(record,actor)`, `deleteMedia(id,actor)`. Media preserves `{id,url,smallUrl,mediumUrl,width,height,mime,bytes,storageKey,alt}`. Deletion returns true/false and throws `MEDIA_IN_USE`/409 while referenced by any product or category, including archived records.

## Authentication persistence

`adminCount()`, `createAdmin({email,passwordHash})`, `adminByEmail(email)` (alias `findAdmin`), `adminById(id)`, and `updatePassword(id,passwordHash)` persist admin accounts. Hashing/verification belongs in the authentication module. Password updates invalidate every existing session atomically.

`createSession({tokenHash,userId,csrfToken,expiresAt})` stores a SHA-256 token digest, never the bearer cookie. `id` is accepted as an alias of `tokenHash`. Expiry input accepts epoch milliseconds or ISO dates. `session(tokenHash)` (alias `getSession`) returns `{userId,email,csrfToken,expiresAt}` or null for absent/expired sessions. `deleteSession(tokenHash)` and `deleteUserSessions(userId)` revoke sessions.

`loginLimit(key)`, `recordLoginFailure(key)`, and `clearLoginFailures(key)` implement a durable five-failure lockout for fifteen minutes. Authentication code should apply both account and IP-derived keys. `recordLoginAttempt({key,success,ip})` records an audit entry; `loginAttempts(key,since)` reads up to 1000 entries, newest first. Login audit retention is thirty days. The authentication layer should supply hashed IPs and keys rather than unnecessary personal data.

Entity mutations record actor, action, ID and relevant metadata in `se_cms_audit`. `actor` accepts an ID string or `{id,email}`. Expected repository errors carry `code` and HTTP `status`: `VALIDATION`/400, `NOT_FOUND`/404, `CONFLICT`/409, `CATEGORY_IN_USE`/409, `MEDIA_IN_USE`/409.


## Product source review

The existing product payload now preserves `sourceDocument`, `sourcePage`, `imageEvidence`, `reviewNotes` and server-issued `verification`. Missing verification means unreviewed; `ready()` does not backfill or change legacy rows. `saveProduct` accepts `reviewAction: 'keep' | 'verify' | 'revoke'` (default keep). Only authenticated manual editor actions may grant review; import commits always force keep. Incoming `verification` values are ignored. A verified save requires source evidence, a positive source page, image evidence, review notes and at least one gallery image; reviewer/time/fingerprint are generated server-side. Any published save requires a currently matching review or the entire transaction rolls back.

`source-review.js` is shared by ordinary saves, CSV preview and bulk eligibility/execution. It fingerprints source-backed content and gallery identity/order/alt text. Technical/source/image changes invalidate review; SEO/slug/priority/featured changes alone preserve it. `product.review` audit events retain evidence and record verification/revocation/invalidation. See the CMS guide for operator steps. This is a source-content attestation, not certification of a medical device.
