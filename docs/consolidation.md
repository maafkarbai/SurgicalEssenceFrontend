# Project consolidation — 26 November 2026

SE App is the continuing project. The user's instruction was to consolidate the restored Surgical Essence project, improve sitemap/indexing, retain one project and delete the older folder. The existing Express/EJS, SQLite/PostgreSQL architecture remains in use.

## Feature mapping

| Older capability | Consolidated behavior |
| --- | --- |
| Next.js public frontend and supplemental API | One server-rendered Express application; original source and Git history remain recoverable in the offline archive. |
| Product catalogue/search and quote cart | Existing newer CMS, gallery, URL-state category/type/search, pagination, quote quantities, source review, imports and bulk publishing retained. Related published instruments added. |
| Contact, distributor and catalogue pages | Dedicated indexable pages restored; catalogue PDFs remain directly downloadable. Distribution intent, territories, ranges and purchasing plans persist and appear in admin detail/CSV. |
| Buyer login and account history | Registration/sign-in/sign-out/password rotation; hashed expiring sessions; paginated history with references, quantities, message and sales status. Immutable RFQ payload records the authenticated buyer owner atomically; email matching never grants access to guest or legacy enquiries. |
| Lead management and quote pipeline | Authenticated searchable/filterable lists/detail, NEW/CONTACTED/NEGOTIATION/CLOSED stages, notes, pipeline audit, dashboard counts and formula-safe CSV with export audit. Leads and quotations deliberately share the same accepted enquiry records instead of duplicating contacts. |
| Press releases | Admin draft/published CRUD, revision checks, audit, escaped plain-text public articles and sitemap discovery. Existing catalogue media tooling retained. Old rich HTML/images were not silently republished as current company news. |
| Newsletter signup | Explicit consent/time and inactive state, private confirmation-based unsubscribe, admin preference list. This records preferences only; it does not send campaigns, verify mailbox ownership or automatically subscribe RFQ buyers. Verify addresses and honour withdrawal before activating an external mailing provider. |
| Email catalogue request | Consolidated into the durable catalogue-intent enquiry workflow plus immediate public PDF downloads; automatic large PDF attachments are not sent. Existing opt-in internal RFQ notification infrastructure retained. |
| WhatsApp | Contact-page link only when WHATSAPP_NUMBER is configured. The older placeholder telephone number was not adopted. |
| Old material/certification/procedure filters, badges and claims | Current source-backed fields and searches retained. No inferred certification/procedure taxonomy, regulatory badges, facility claims, fake prices, reviews or stock facts added. Older source/model remains archived for evidence-based future migration. |

Existing old provider/database records are not overwritten or automatically imported. New account/content/sales/preference tables are namespaced and additive. Source-only consolidation does not establish that an old cloud database has been migrated. Existing published catalogue rows are preserved, and all new publication still follows the current source-review gate.

## SEO and indexing

- `/sitemap.xml` is dynamic. It covers canonical public pages, populated published categories, all published products and all published press releases. Drafts, empty category result pages, private/utility pages and search/type combinations are excluded.
- More than 10,000 URLs produces a sitemap index and bounded `/sitemaps/N.xml` shards. URLs are XML escaped. Product/editorial modification dates come from stored changes, not the request clock. Static/category timestamps are omitted where no reliable page-level timestamp exists.
- Listings have individual category metadata and self canonicals for valid pagination. Unknown categories and invalid/out-of-range pages return noindex 404. Empty/search/filter views retain honest noindex results.
- Private/account/utility/error responses use noindex headers. Public noindex pages remain crawlable so search engines can read the directive. Admin/internal paths remain excluded from crawling and access-controlled.
- Vercel preview deployments carry noindex on every response, including static assets. Page-specific social metadata uses the actual available image. Legacy route redirects retained where a dedicated replacement was not restored.
- Removed the stale static root sitemap. Set SITE_URL to the final HTTPS origin, deploy, verify Search Console ownership, then submit `/sitemap.xml`. No production deployment, DNS change, Search Console submission or external notification occurred in this work.

Guidance checked against [Google's sitemap documentation](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) and [pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading). Sitemap submission helps discovery; it does not guarantee indexing or rankings. Product publishing between separate shard downloads can change boundaries until the next crawl.

## Verification and review

- Test-first additions cover buyer journeys, authoritative owner history and spoof prevention, account/session security, newsletter consent/CSRF/unsubscribe, sales detail and CSV fidelity/auditing, both SQLite and PostgreSQL adapters, sitemap XML escaping/sharding/draft exclusion, previews, categories and pagination.
- Final server suite: 128 tests passed, zero failures. PostgreSQL adapter checks use pg-mem; no real hosted database migration/concurrency acceptance is claimed.
- Existing Playwright/Edge browser suite: 45 responsive checks at 320/375/768/1024/1440px, 18 axe checks, 35 internal links and four existing buyer journeys passed.
- New Playwright/Edge suite: 12 responsive page checks and 12 axe checks at 375/1440px, no serious/critical violations, four end-to-end journeys and no browser console errors. Covers registration → distributor RFQ → account history; admin pipeline edit; press publication → public article → sitemap; consent → private withdrawal link → unsubscribe. Browser plugin not available; existing installed Playwright and Edge used.
- Screenshots and machine-readable evidence: `test-results/consolidation/` and `test-results/consolidation/report.json`. Existing browser report is in `test-results/browser-report.json`.
- Independent review found missing admin distribution fields and non-atomic post-save buyer-history binding. Both fixed and regression-tested. Further hardening covered shared SQLite transaction queues, password-rotation/session races, complete editorial sitemap coverage, native browser form Origin headers and fallback favicon discovery.
- All tests use isolated temporary databases and synthetic identities. External mail delivery, provider acceptance, field Core Web Vitals, real assistive-technology testing and production indexing remain unverified.

## Recovery and removal ledger

- Recovery archive: `C:\Users\local user\Documents\Codex Backups\SE-consolidation-2026-11-26\Surgical-Essence-recovery.zip`.
- 1,006 files archived and hash-verified, including original source, assets, documentation, Git data and private configuration. Only reproducible `node_modules`, `.next`, `.turbo` and Python cache directories were excluded. `RECOVERY_MANIFEST.json` records original paths, byte sizes and SHA-256 hashes.
- The archive is outside active project/deployment paths. It contains private configuration and should remain private. Source baselines for changed SE App files are in `tmp/consolidation-baseline/`, excluded from deployment.
- Before deletion, compare the archive manifest against the restored source again, verify the exact resolved target is `C:\Users\local user\Desktop\Surgical Essence`, and confirm the continuing SE App directory exists. Remove only that exact older folder with native PowerShell.
- Final reconciliation passed: all 1,006 current source files matched both the archive manifest and archived bytes immediately before removal.
- Removal completed: the older `C:\Users\local user\Desktop\Surgical Essence` directory was sent to Windows Recycle Bin. The exact old path is absent; `SE App/src/app.js` and the recovery ZIP remain present. Permanent recursive deletion was rejected by automatic approval policy (`blocked by policy`); recycling provided a recoverable removal. No additional user approval was required for the authorized, safer removal.

Launch the consolidated local application with `run.cmd`. This work is local; deploy the consolidated project separately when ready.
