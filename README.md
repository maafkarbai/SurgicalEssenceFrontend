# Surgical Essence

A working, server-rendered B2B instrument catalogue and quotation site. Built from the supplied asset-only workspace using Express, EJS, browser JavaScript and SQLite. No frontend compilation step or external database service is required.

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

Without SMTP settings, submissions still persist, and must be reviewed with the private CLI. **Real SMTP delivery was not tested because no credentials were supplied.** The queue uses at-least-once delivery: an interruption between sending and marking sent can produce a duplicate internal email, carrying the same request reference.

## Deployment

No production deployment has been performed or authorised.

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

- `src/catalogue.js`: product data and categories. Add only source-backed records and matching illustrations; keep the source-page link.
- `views/`: shared shell and page templates; `views/partials/`: shared product and CTA components.
- `public/styles.css`: tokens, shared visual rules and responsive layouts.
- `public/app.js`: navigation, browser-local quote list, form enhancement and feedback.
- `src/rfq.js`, `src/store.js`, `src/notifications.js`: validation, durable records and internal email alerts.
- `src/app.js`: routes, request security, SEO and rendering.
- Original supplied images/PDFs are retained. Optimized assets are separate; no generated imagery is presented as an actual instrument or facility.

Research, architecture, content provenance and intent mapping are in [docs/design-and-plan.md](docs/design-and-plan.md).
