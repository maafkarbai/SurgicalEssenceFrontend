# Bulk import verification — 3 November 2026

The importer was exercised locally with temporary databases and synthetic product data. No remote database was migrated and nothing was deployed.

## Executed results

- **54 automated server/security/integration tests passed** across the existing application and new import feature.
- Real-store imports of **10, 500, and 1,000 rows** passed validation, explicit confirmation, bounded processing, final counts and replay checks. In the local synthetic 1,000-row run, processing completed in roughly 1.6 seconds; this is not a cloud or photographic workload performance guarantee.
- Missing optional/required fields, strict UTF-8/BOM, quoted commas/newlines, original CSV row numbers, malformed CSV, column ambiguity, duplicate CSV/database SKUs and safe formula-prefixed CSV output were tested.
- All three modes, empty-value preservation, selective clearing, stable identities/URLs, stale revisions, category matching/create/skip, cancelled jobs and per-owner access were tested.
- ZIP image processing passed for UTF-8/spaced filenames, primary/additional images, existing media IDs, content-hash reuse and private raw-chunk cleanup. Invalid images, ambiguous/missing names, traversal/absolute paths, nested archives, encrypted/symlink entries, bomb metadata, oversized CSV and excessive row counts were rejected.
- Interrupted/replayed processing, expiring/contended leases, repeated chunk uploads, active-job quotas, expected preview versions and cancelled pending commits were tested. A regression test proves an old validator cannot replace a new mapping or confirm mismatched plans. Temporary storage errors leave pending work resumable.
- Published imported records appeared in catalogue/search/sitemap and accepted RFQs with the correct product snapshot. Draft imports returned 404 publicly.
- A 1,000-record catalogue fixture rendered 24 products per page, correct counts/type filters and **fewer than 15 SQL statements per page**. Gallery hydration is batched, not queried once per instrument. CSV staging and PostgreSQL preview writes are also batched rather than one network round trip per source row.
- The PostgreSQL emulator passed the additive job schema, staging, confirmation, atomic row commit, result and finalization checks. It does not test real advisory locks or provider latency. A bulk update was changed to parameterized CASE expressions after the emulator could not execute the original UPDATE FROM alias form.
- `node tests/import-browser.js` passed the real upload → mapping → diff → confirmation → persisted product → report link → reload workflow. Desktop 1440px and mobile 375px screenshots were inspected. Both widths passed axe scans after making the horizontally scrollable sample table keyboard-focusable.
- Existing CMS browser flow passed two image uploads, primary ordering/alt text, draft preview and publication, plus 12 admin desktop/mobile accessibility checks.
- Existing public browser suite passed 45 responsive checks at 320/375/768/1024/1440px, 18 axe scans, 29 internal links, original quote-list/RFQ journeys and a JavaScript-disabled enquiry.
- Syntax checks and `npm audit --omit=dev` passed; the dependency audit reported zero known vulnerabilities.

## Not claimed as tested

Real production PostgreSQL permissions/concurrency, actual Blob provider persistence across redeployment, real cloud function timeouts, a 500-photo cloud upload, assistive-technology user testing and a complete manual WCAG audit remain staging/deployment checks. Browser screenshots contain only synthetic records. No automatic destructive rollback is provided.

## Reproduce

```powershell
npm test
npm run check
node tests/import-browser.js
node tests/admin-browser.js
npm run test:browser
npm audit --omit=dev
```

See [bulk import usage and limits](bulk-import-guide.md) and [CMS setup/backup procedures](cms-guide.md).
