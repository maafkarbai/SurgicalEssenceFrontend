# CMS verification — 2 November 2026

Executed locally with Node22.14, SQLite and Microsoft Edge through Playwright. No live database migration, real Blob upload, production account creation or production deployment was performed.

- `npm test`: **26 passing** server/security tests, including the original RFQ tests, admin authentication/CSRF/lockouts/logout/password-session revocation, CRUD/conflicts, first-admin CLI and backup/recovery, draft/public publishing integration, slug redirects, RFQ product snapshots after archive, concurrent revision conflicts and seed preservation, unsafe URL rejection, MIME/content/file/dimension limits, derivative persistence, upload rollback, referenced-media protection and fake-Blob failure paths.
- `node tests/admin-browser.js`: **passed** login, two actual image uploads over HTTP, image ordering/primary selection, alt persistence, draft public404, authenticated public-template preview, publish public200, and **12 desktop/mobile route checks at375/1440px** with zero axe violations or horizontal overflow.
- `npm run test:browser`: **45 public page/width checks** at320/375/768/1024/1440px, **18 axe scans with zero detected violations**, original product search/filter/list/quantity/removal journey, RFQ acceptance, JavaScript-disabled form submission,29 unique internal links and no browser errors in tested flows.
- `npm run check` and explicit syntax checks for CMS/store/media/admin/maintenance scripts: passed.
- `npm audit --omit=dev`: **zero known vulnerabilities** after updating the transitive Vercel CLI-config Zod dependency through an override.
- `scripts/cms.js migrate`: private local database/media backup created first; local migration completed successfully. `scripts/cms-media-cleanup.js`: local dry run completed.
- Reviewed desktop/mobile admin editor screenshots and public layouts. Screenshots are in ignored `test-results/` and contain synthetic data only.

Independent reviews identified and corrected SKU/client-validation mismatch, blank-slug normalization, stale legacy images reappearing after removing the gallery, broad external media URLs, cloud upload body limits, and concurrent login throttling. Cloud uploads are now serial requests under the Vercel body limit, and media URLs/CSP use the exact configured Blob store host.

PostgreSQL CMS schema/list/edit/redirect/auth were additionally exercised through a PostgreSQL emulator during implementation. Emulation does not verify real advisory locks, external permissions, provider outages or production concurrency. Production-like staging with a separate database and Blob store is still required before approval to launch. The Blob persistence code is implemented and tested with fake clients; real post-deployment asset persistence cannot be claimed without deploying and testing the configured store.

The persistent preview launch was blocked by automatic approval review with only “blocked by policy.” Test servers ran successfully; an existing running preview must be restarted manually to load CMS code. No production change was made to work around that rejection.
