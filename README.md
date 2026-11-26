# Surgical Essence

The website and admin interface use a light-only theme, including under a device dark-mode preference. White and pale surfaces retain the Surgical Essence blue accents; the footer, quality section and admin sidebar are also light.

## Custom website icons

The approved [Surgical Essence Figma icon set](https://www.figma.com/design/ifwHZvsxlWSsmLhMyWYGND?node-id=2-115) is integrated into navigation, category links, quotations, documentation/downloads and contact actions. Original SVG sources are in `assets/icons/`; run `npm run icons:build` after editing them to regenerate the 6.7 kB public sprite and versioned EJS partials. Icons inherit the surrounding colour, stay hidden from assistive technology and retain text labels. See [icon integration and validation](docs/icon-sync.md).

## Consolidated project — 26 November 2026

This is the continuing application. The older Next.js/Express project has been preserved in a verified offline recovery archive outside this workspace. See [consolidation, feature mapping and validation](docs/consolidation.md).

Added buyer accounts with private, paginated quotation history (`/account`), enquiry and sales pipeline administration (`/admin/quotes`, `/admin/leads`), audited CSV exports, press release publishing, subscriber preferences, dedicated `/contact`, `/catalog` and `/distributor` pages, structured distribution requirements and related instruments. Existing CMS/source review/import/bulk publishing remain authoritative. New tables are additive and created when used; existing legacy database tables are not overwritten or automatically migrated.

The sitemap is generated at `/sitemap.xml` from the configured `SITE_URL`, published products, populated categories and published press releases. Large inventories use `/sitemaps/N.xml` files. There is no static root sitemap to maintain. Preview deployments, account/private/utility pages, internal searches and empty category results are excluded from indexing. Set `SITE_URL` to the final public HTTPS origin before deploying; submit `/sitemap.xml` in the verified Search Console property after deployment. Local changes do not guarantee search indexing.

Email updates require explicit saved preferences; this release does not activate a mailing campaign. Catalogue email assistance uses the existing durable enquiry workflow. `WHATSAPP_NUMBER` enables an optional contact link only when a real number is configured. Launch locally with `run.cmd`.

A working, server-rendered B2B instrument catalogue and quotation site. Built from the supplied asset-only workspace using Express, EJS, browser JavaScript and SQLite. No frontend compilation step or external database service is required.

## Business improvement continuation

See [current status and next priorities](docs/business-improvements/IMPLEMENTATION_STATUS.md), the [requirement gap analysis](docs/business-improvements/BUSINESS_REQUIREMENTS.md), and [validation results](docs/business-improvements/TEST_RESULTS.md). Shared public contact/location details are maintained in `src/business-info.js`; changing those details does not verify legal identity or certification. Older progress counts below describe their original implementation stage; the continuation report records the current local catalogue state.

## Product management CMS

The private catalogue dashboard is implemented at `/admin/`. See [CMS setup and operations](docs/cms-guide.md) for secure first-admin creation, migration, uploads, backups, password recovery and publishing. The CMS changes are prepared locally and require approval before production deployment.

Run `node --env-file-if-exists=.env scripts/cms.js create-admin your-email@example.com` in a trusted terminal to choose your own password. There are no default credentials. For Vercel uploads, configure persistent Blob storage with both `BLOB_READ_WRITE_TOKEN` and the exact `BLOB_PUBLIC_HOST`.

## Product source review

All new publication workflows require source review in the existing product editor. Enter source document/page, image-match evidence and review notes, then explicitly record a review. Technical/image/source-link edits require review again. CSV can carry provenance but cannot grant approval. Existing product records are retained without being automatically verified. See [CMS source-review steps](docs/cms-guide.md#source-review-before-publication).

## Bulk product import

The existing PDF-extraction sidecars can now be joined into draft-only import files with `node scripts/prepare-catalogue.js --source-dir output/catalog-bulk-import --check` or a fresh `--output-dir`. The command withholds conflicts, preserves provenance and original data, and changes no database records. See [catalogue staging and source review](docs/catalogue-staging.md).

The Products page also supports selecting individual rows, the current page, or all filtered results and publishing eligible drafts together. It includes confirmation, progress, failure reasons and resumable jobs. See [bulk publishing](docs/bulk-publishing-guide.md).

The CMS now includes **Products → Import Products** with CSV mapping, ZIP/library images, preview/diffs, add/update modes, resumable batches and private history/reports. See [bulk import setup and usage](docs/bulk-import-guide.md) and [verification results](docs/import-testing.md). Imports require an authenticated administrator and explicit confirmation; uploading or previewing does not change catalogue records. This change remains local pending deployment approval.

## Vercel deployment

The repository now includes a Vercel Node API entry point (`api/index.js`) and routing configuration. The linked project is `surgicalessencefrontend` under `abdullafarooqs-projects`; use framework **Other**, Node **24.x**, install `npm ci`, and no build/output override. Static assets are served from `public/`, and EJS templates are explicitly bundled.

On Vercel, the backend uses the existing PostgreSQL connection in `DATABASE_URL` (or `DIRECT_URL` when the former is not a PostgreSQL URL). It creates the namespaced `se_rfqs`, `se_rate_limits` and `se_rfq_outbox` tables and their indexes; it does not alter the previous application tables. No local SQLite file is used in the cloud. `SITE_URL` is the public deployment origin, `TRUST_PROXY_HOPS=1` applies to the Vercel edge proxy, and an optional `CSRF_SECRET` can override the database-credential-derived server secret.

Review cloud enquiries through the database provider’s private SQL console: `SELECT id, created_at, payload, notification_status FROM se_rfqs ORDER BY created_at DESC;`. Restrict access because payloads contain buyer contact details. The local CLI below reads SQLite only.

The long-running SQLite SMTP worker is disabled on Vercel. The cloud outbox worker is now implemented at `/internal/rfq-notifications`, protected by `CRON_SECRET` and disabled unless `RFQ_NOTIFICATIONS_ENABLED=true`. Configure approved SMTP sender/recipient settings and scheduler activation separately; SMTP credentials alone do not enable it. See [cloud notification setup, retries and staging acceptance](docs/cloud-notifications.md). No live email delivery is claimed.

The deployment instructions below describe the alternative long-running Node/SQLite hosting path.

## Windows launcher

Double-click `run.cmd` to install missing dependencies, back up/migrate the local database when its schema changes, and start the app on the first available port from 3000–3010. The console prints website/admin URLs; keep it open and press Ctrl+C to stop. Local mode uses this folder’s `data/` and disables SMTP notifications. Production environment files are not changed.

Use `run.cmd --port 3002` to choose a port or `run.cmd --check` to validate startup without starting a server or migrating. Create your first admin using the private setup command documented above.

## Run locally

Requires Node.js **22.14 or newer** (tested with 22.14.0) and npm. Node 22 currently prints an experimental warning for its built-in SQLite API.

```powershell
npm ci
Copy-Item .env.example .env
npm start
```

Open http://localhost:3000. `npm run dev` restarts the server on source edits. Requests are saved in `data/requests.sqlite`, outside the public directory. This directory and `.env` are ignored by Git. Do not put either under `public/`.

## What is implemented

- Home, searchable/filterable catalogue, eight technical product details, OEM enquiry, quality documentation, about, RFQ, quote-list, privacy and 404 pages.
- Supplied SVG branding; local Inter font with licence; responsive WebP catalogue illustrations and category assets.
- Five existing PDF catalogues retained. They are large legacy files (approximately 16–59 MiB); product pages link directly to relevant source pages. Existing PDF claims are not treated as proof of current certification.
- Name/reference search, surgical category and type filters, accurate counts, useful empty states, browser-local quote list with quantities and removal.
- Accessible, progressively enhanced RFQ with real SQLite acceptance. It works without JavaScript for manually entered requirements. No account or retail checkout.
- Server validation, signed double-submit CSRF, same-origin checks, body and field bounds, honeypot, per-IP burst and durable hourly limits, idempotency and 15-minute duplicate-content suppression.
- A durable SMTP notification queue when configured. The public success message confirms storage, not email delivery. Notification failures retain the enquiry and are retried every 30 seconds.
- Unique metadata, canonical URLs, visible breadcrumbs, Product/Organization/Breadcrumb microdata, sitemap, robots, legacy route redirects, security headers and error states.
- Optional uploads are deliberately not enabled: this implementation has no secure attachment-storage service. Buyers can ask how to provide a file.

## Review accepted enquiries

Run on the trusted application host:

```powershell
node --env-file-if-exists=.env scripts/requests.js list
node --env-file-if-exists=.env scripts/requests.js show SE-XXXXXXXX
```

The list shows references, timestamps and notification status only. `show` prints personal enquiry data: use a private terminal. The data is not exposed through an HTTP admin endpoint. Delete a specific record only when intended:

```powershell
node --env-file-if-exists=.env scripts/requests.js delete SE-XXXXXXXX --confirm
```

Deletion from the database does not remove email copies or backups. Set an approved business retention policy and coordinate deletion across those systems.

## Email configuration

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `RFQ_FROM`, and `RFQ_TO` in the host environment. Port 587 requires STARTTLS; port 465 should use `SMTP_SECURE=true`. Use a verified sender/domain and appropriate SPF/DKIM/DMARC settings. Secrets never go to the browser.

Without SMTP settings, submissions still persist, and must be reviewed with the private CLI. **External SMTP/inbox delivery was not tested because approved provider credentials were not supplied.** The cloud continuation tests delivery through a real loopback SMTP connection with synthetic data. The queue uses at-least-once delivery: an interruption between sending and marking sent can produce a duplicate internal email, carrying the same request reference.

## Deployment

For deployment on a long-running Node host (the Vercel path is documented above):

1. Use a maintained Node runtime supporting `node:sqlite`, a long-running application process and persistent local disk. This is not a PHP app and is not suitable for an ephemeral serverless filesystem. For cPanel, the host must support Node applications; otherwise choose a Node-capable host.
2. Run `npm ci --omit=dev`; there is no build step. Use `server.js` as the entry point and set the host's `PORT`.
3. Set `NODE_ENV=production`, `SITE_URL=https://surgicalessence.com`, and `DATA_DIR` to a persistent, private absolute directory. The application refuses a non-HTTPS production URL.
4. Set `TRUST_PROXY_HOPS` to the exact number of trusted reverse proxies (0 by default). Restrict direct access to the app port when trusting a proxy. Do not blindly trust all forwarding headers.
5. Use HTTPS, restart supervision, private filesystem permissions (owner-only on Linux; restricted Windows ACLs), disk encryption and an encrypted backup policy. SQLite is not itself encrypted. Use one application instance/notification worker; horizontal multi-instance delivery is not implemented.
6. Back up the database using SQLite's backup API or stop the process before copying the SQLite database and associated WAL files. Include the private `csrf.secret` only in secured backups. Test recovery.
7. Configure and test SMTP or assign a person to review stored enquiries daily. Monitor disk usage and the structured `rfq_storage_failed`, `rfq_notification_failed`, and `outbox_unavailable` events. Logs omit enquiry bodies and emails.
8. Confirm business claims, catalogue revision/rights, contact details, OEM scope and privacy retention. See [docs/content-verification.md](docs/content-verification.md).
9. Re-run functional/browser checks against staging. Measure Core Web Vitals with real hosting and traffic; no field performance scores are claimed.
10. Review the old site's full URL inventory before DNS cutover. Known observed routes are redirected, but the complete historic URL inventory was unavailable. Serve the application at the origin root and avoid caching RFQ responses.

## Tests

```powershell
npm test
npm run check
npm run test:browser
npm audit --omit=dev
```

Browser tests use installed Microsoft Edge by default, create an isolated test server on port 3101, and store only synthetic submissions in a temporary database which is removed afterwards. For another installed Playwright-supported channel set `BROWSER_CHANNEL` (e.g. `chrome`). Screenshots and JSON results are in `test-results/`. See [docs/testing.md](docs/testing.md) for executed results and limitations.

## Maintain

- `src/catalogue.js`: initial seed only. Manage products/categories through `/admin/` after migration. Keep verified source-page links for catalogue-derived records.
- `views/`: shared shell and page templates; `views/partials/`: shared product and CTA components.
- `public/styles.css`: tokens, shared visual rules and responsive layouts.
- `public/app.js`: navigation, browser-local quote list, form enhancement and feedback.
- `src/rfq.js`, `src/store.js`, `src/notifications.js`: validation, durable records and internal email alerts.
- `src/app.js`: routes, request security, SEO and rendering.
- Original supplied images/PDFs are retained. Optimized assets are separate; no generated imagery is presented as an actual instrument or facility.

Research, architecture, content provenance and intent mapping are in [docs/design-and-plan.md](docs/design-and-plan.md).
