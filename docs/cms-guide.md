# Surgical Essence product CMS

The CMS extends the current Express/EJS site. The public design, eight source-backed products, five categories, catalogue PDFs and SKU URLs are retained. Published products now come from relational CMS tables. The implementation has not been deployed to production or run against the production database.

## Source review before publication

In the product editor, enter **Source document / revision**, **Source PDF page**, **Image evidence / source match** and **Source review notes**. Compare the actual SKU/name/dimensions/specifications and ordered images against that evidence. Attach a matching image, choose **Record source review for this save**, then save as draft or published. The server records your administrator ID, timestamp and content fingerprint; source review is not regulatory certification.

Unreviewed products cannot be saved as published or bulk-published. Changes to technical/descriptive content, category, catalogue/source page, evidence or image order/URLs/alt text require review again. Save changes as draft to clear approval, or explicitly review the changed content during the save. SEO-only changes preserve a matching review. **Revoke source review** clears approval; a published product must be saved as draft when revoking. Review events use the existing private audit log.

Existing published records remain visible and are labelled unreviewed in the dashboard until actually reviewed. Their next published save requires review. No automatic verification or unpublication is performed. Keep source files and image rights available privately for checking; entering a filename is a human attestation, not independent validation of the document contents.

## Local setup

Use Node 22.14–24 and npm. Install dependencies with `npm ci`. Copy `.env.example` to `.env` if necessary and keep it private. `DATA_DIR` is a private writable directory, outside `public/` and outside any web server document root.

```powershell
npm ci
node --env-file-if-exists=.env scripts/cms.js migrate
node --env-file-if-exists=.env scripts/cms.js create-admin your-email@example.com
npm start
```

Open `/admin/` and log in. The private setup command prompts for a hidden password of 12–256 characters. There is no registration or web bootstrap endpoint, no default login and no committed credentials. It automatically backs up an existing local database and media before migrations/account changes. For unattended private setup, `--password-file ABSOLUTE_PRIVATE_FILE` reads a password from a restricted file; remove that file securely afterwards. Do not put passwords in shell arguments, Git or screenshots.

The existing preview process must be restarted to load CMS changes. An alternate local port can be used with `PORT` and matching `SITE_URL`. Local setup does not need Blob or PostgreSQL.

## Schema and data safety

The transactional, additive schema is `src/cms/schema.sql`. New namespaced tables hold products, categories, gallery relationships, media, admin users, sessions, URL history, login attempts and audit records. Existing RFQ and previous-application tables are untouched. Unique case-insensitive SKU and slug constraints, foreign keys, indexes, publication states and optimistic revisions protect catalogue integrity. Technical free-text fields are stored as structured payloads attached to relational product entities; no technical values are invented.

The first migration seeds the supplied eight products and five ranges once. Repeated migrations preserve edits, archives and existing records. An archive never deletes historical enquiries or their product snapshots. Category archiving requires moving/archiving its active products first.

## Vercel production setup — requires approval before execution

Do not push this CMS to the repository's auto-deploying `master` branch until approved. Test a separate staging database and Blob store first; a preview must not share the production database for write tests.

1. Take a verified provider database snapshot and a PostgreSQL custom-format dump (`pg_dump --format=custom`). Use private environment configuration, never put the database password on a command line. Run `pg_restore --list` against the dump; test restoration into a separate database. Back up existing media objects separately.
2. Retain `DATABASE_URL`/`DIRECT_URL` for the current PostgreSQL database. Use a direct connection for private migration commands if a transaction pooler is unsuitable. New CMS table migrations acquire an advisory lock and run atomically. No public schema migration or administrator-creation endpoint exists.
3. Create/connect a **public Vercel Blob store** for published product imagery. Configure `BLOB_READ_WRITE_TOKEN` as a private secret and `BLOB_PUBLIC_HOST` as its exact host (e.g. `your-store.public.blob.vercel-storage.com`, without protocol). Only this host is accepted by the CMS and CSP. Blob images are public assets; do not upload confidential or patient information. A draft product page remains authenticated even though its image URL is publicly addressable if known.
4. Configure a stable independent random `CSRF_SECRET` (at least 32 characters) privately, `NODE_ENV=production`, the canonical HTTPS `SITE_URL`, and `TRUST_PROXY_HOPS=1` for the Vercel proxy. Existing code can derive the secret from database credentials, but an independent secret avoids logging everyone out when credentials rotate. Cookies are HTTP-only, Secure in production, and SameSite Strict. Admin pages reject non-HTTPS requests in production.
5. From a trusted private terminal with the staging/production environment loaded, set `CMS_BACKUP_CONFIRMED=yes` only after verifying the corresponding backup. Execute:

```powershell
node --env-file-if-exists=.env scripts/cms.js migrate --postgres
node --env-file-if-exists=.env scripts/cms.js create-admin your-email@example.com --postgres
```

6. Deploy the approved commit to the existing Vercel project using the repository configuration. The `api/index.js` function bundles EJS views and the CMS SQL file. Public uploads use Blob rather than `/tmp` or the deployment filesystem. No files or RFQs are stored on ephemeral Vercel disk.
7. Verify login, protected draft preview, image uploads, publication, URL redirects, public search and a quotation with a real newly published product. Verify that gallery assets remain accessible after a separate redeployment. Verify the approved domain, production SMTP/outbox handling and database backups independently.

The local CLI for RFQs still reads SQLite; cloud RFQs remain in `se_rfqs` and can be reviewed through the provider's private console. Email-alert setup remains a separate deployment requirement; the CMS does not claim to activate it.

## Add and publish a product

1. Log in at `/admin/`, select **Products → Add product**.
2. Enter the name, unique SKU/reference and category. Optional technical fields can stay blank. Plain-text descriptions/specifications are escaped when displayed; HTML input is not executed.
3. Select JPEG, PNG or WebP images. The browser previews and uploads selected images one at a time. Each image is limited to 4 MiB for Vercel's total request limit. The server verifies image content, decodes it, rejects unsafe/oversized/animated inputs and re-encodes WebP variants without source metadata.
4. Add alt text, use **Make primary**, **Move up/down**, **Replace image** or **Remove**. Save to commit gallery changes. Removed images remain in the Media Library until explicitly deleted so they can be reused. A legacy catalogue image can also be removed; removing all images shows an honest public placeholder.
5. Save as **draft**, then use **Preview draft**. This requires an authenticated admin session and carries noindex/no-store headers.
6. Set status to **published** and save. The record appears in public browsing/search, its category and sitemap. **Featured product** and display priority control the existing homepage featured section; they are functional options. The current hero also respects published products.
7. Change a product slug if necessary; its previous URL redirects to the new one. Existing catalogue SKU aliases continue resolving. Edit or unpublish later from the same editor. Unsaved form changes trigger a browser navigation warning. Concurrent edits return a conflict instead of silently overwriting another editor.
8. Buyers can add the product by its actual SKU. The server rechecks publication and stores its ID, name, SKU, dimensions and material in the RFQ. Subsequent archive/edit operations do not rewrite that snapshot.

## Categories and media

**Categories** lets you create/rename a range, edit its slug/description, set ordering, attach an optional image URL copied from the Media Library, and archive through confirmation. Product relationships use stable category IDs, so category slug edits do not orphan products. Categories containing nonarchived products cannot be archived accidentally.

**Media Library** lists real persistent uploads. Delete requires confirmation. Images referenced by products or categories (including archived records) are protected. Original source assets under `public/images/` are preserved and cannot be deleted through the upload API. Local derivatives live under `DATA_DIR/media`, with UUID filenames and nonexecutable WebP contents. Keep that directory owner-writable only (Linux directory0700/file0600 where applicable; restrict Windows ACLs). HTTP serving permits only the defined filename pattern and image Content-Type.

Failed upload batches roll back files/objects and media records where possible. Storage-provider failures can leave an orphan. Review the private dry-run tool before deletion:

```powershell
node --env-file-if-exists=.env scripts/cms-media-cleanup.js
# For configured Blob storage:
node --env-file-if-exists=.env scripts/cms-media-cleanup.js --postgres
```

It considers only recognized, unreferenced generated objects older than24 hours. After reviewing and backing up, add `--delete` to remove candidates. Stop administrative writes during cleanup to avoid a race with a newly attached image. Never run this command via HTTP.

## Backup, restore and rollback

Local backup: `node --env-file-if-exists=.env scripts/cms.js backup` creates a consistent SQLite `VACUUM INTO` snapshot plus a copy of media in a dated `DATA_DIR/backups` folder. Protect and encrypt backups and keep an off-machine copy. For restore, stop the server; restore the selected database to `DATA_DIR/requests.sqlite` and matching media to `DATA_DIR/media`; remove stale WAL/SHM files only after shutdown and verification. Start against the restored copy and run the read-only checks before reopening access.

Cloud backup: use provider snapshots plus pg_dump, and separately copy Blob assets with paths preserved. Restore into a **separate database/store** first, verify counts, sessions, gallery links, product URLs and RFQs, and only then intentionally change environment configuration. Restore the Blob host/token consistently or rewrite object URLs through a reviewed migration. Keep old backups restricted because they include buyer details and password hashes.

Failed migration: transactions roll back and can be retried after the cause is corrected. Redeploy the previous Git commit for application rollback; it continues using the original source catalogue/RFQ tables. Retain CMS tables for recovery rather than dropping them. Rolling back code does not remove CMS-created products or media; they remain recoverable when the CMS is re-enabled.

Lost password: run `scripts/cms.js reset-admin EMAIL` in a trusted private terminal, adding `--postgres` for cloud. The command prompts securely and invalidates all sessions for that administrator. Normal password changes are available in **Settings**. Logout also revokes the server session.

## Hosting and verification limits

This remains a Node application. cPanel requires Node hosting, a private writable data directory, HTTPS/proxy configuration and restart supervision; PHP-only cPanel cannot execute it. No framework migration has been introduced.

Tests use temporary SQLite databases, a PostgreSQL emulator where supported, and fake Blob clients for provider-failure checks. They do not prove real production permissions, remote PostgreSQL advisory-lock behavior or actual Blob availability after deployment. Those checks belong to approved staging/production deployment. No administrator password or live database secret is included in tests or this guide.
