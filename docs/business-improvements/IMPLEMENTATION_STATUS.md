# Business improvement status — 25 November 2026

This is an incremental continuation. Read this alongside the original design, CMS/import/bulk-publishing plans and test reports; those completed implementations remain in place. The requirement-by-requirement gap analysis is in [BUSINESS_REQUIREMENTS.md](BUSINESS_REQUIREMENTS.md).

## Recovered state

- Express 5/EJS, browser JavaScript, SQLite locally and PostgreSQL on Vercel. Existing CMS, media handling, CSV/ZIP importer and resumable bulk publishing are implemented. No new stack or service is needed for this step.
- The workspace root is not a Git checkout. `.repo-publish` is a separate clean publishing checkout; history includes `0193d52` (Windows launcher), `2a4d1f2` (CSV/ZIP import), `448b8c7` (CMS), and earlier RFQ/Vercel work. `.repo-sync` reports a broken branch. Do not treat either nested copy as newer than the working application or overwrite it. No AGENTS.md was found in the searched project files.
- Read-only inspection of the actual local database found **257 products, all published**, in five categories. This supersedes the old bulk-publishing report's 248 drafts / 9 published. No real product, category, enquiry or publication job was changed in this step.
- The extraction package contains 5,188 draft CSV rows and source/review sidecars, with 1,005 flagged occurrences. Its README records preparation, not the current database state. Bulk-publishing changes at the root postdate the latest publishing-checkout commit.
- RFQ storage, references, duplicates, CSRF and rate limiting exist. The cloud email worker is now implemented and opt-in; live activation/provider acceptance remain blocked. The SQLite notification worker stays disabled on Vercel. SMTP credentials alone do not enable cloud delivery.
- Claims were already restricted on public pages. Legal identity, certificates, manufacturing evidence, commercial terms and retention approval remain business blockers. Legacy PDF claims remain a launch-review issue.

## Current checklist

| ID | Objective / priority | Status | Existing implementation / changed files | Dependencies / acceptance / validation / blockers |
| --- | --- | --- | --- | --- |
| BI-P0-001 | Prevent inconsistent contact and supplier identity / P0 | COMPLETE (technical scope) | New `src/business-info.js`; existing `src/app.js`; `views/{layout,about,home,rfq,privacy}.ejs`; new `tests/business-info.test.js`; README and verification/tracking docs | Reuse sourced details; one change reaches links, location copy, metadata, Organization data and failure messages. Escaped rendering. Three regression tests, full suite and public browser checks recorded in TEST_RESULTS.md. Legal-entity verification is separately blocked. |
| BI-P0-002 | Require source verification before product publication / P0 credibility + catalogue accuracy | COMPLETE (technical scope) | Shared `src/cms/source-review.js`; existing CMS store, import utilities/service, bulk store, product/list templates; source-review tests and updated existing publication fixtures/browser flows | Explicit evidence review records server actor/time and content fingerprint; all published saves, imports and bulk jobs enforce the rule. Content/image/source-link changes invalidate review. Existing rows are unchanged and never automatically verified. 75 server tests and browser/production checks recorded in TEST_RESULTS.md. Actual 257-product source review remains an owner task. |
| BI-P0-003 | Deliver stored enquiries reliably on cloud / P0 | PARTIALLY IMPLEMENTED | Technical infrastructure COMPLETE: new `src/cloud-notifications.js`, existing PostgreSQL/app/SMTP integration, `tests/cloud-{outbox,notifications}.test.js`, synthetic TLS fixtures, cloud setup guide and inactive cron example | Atomic enqueue, bounded bearer-authenticated worker, leases, retries, SMTP cancellation and acknowledgement tested. Approved provider/sender/recipient, backlog review, scheduler cadence and real PostgreSQL/provider staging acceptance still block live activation. No deployment or active cron configured. |
| BI-P2-001 | Expand catalogue without inventing specifications / P2 | PARTIALLY IMPLEMENTED | Existing extraction scripts, package, CMS importer and 257 local published products | Staging/provenance integration is complete (BI-P2-001a). 4,935 unreviewed draft candidates and 253 withheld rows prepared without real imports. Owner source/image review and resolution of flagged rows precede catalogue publication. |
| BI-P2-001a | Join extraction provenance and withhold conflicts before draft import / P2 | COMPLETE | New `src/catalogue-staging.js`, `scripts/prepare-catalogue.js`, `tests/catalogue-staging.test.js`, staging guide and generated `output/catalogue-staging-2026-11-25` package | Deterministic read-only preparation; preserves original facts/leading zeros, adds bounded unreviewed evidence, withholds flagged/ambiguous rows, splits CSVs within current importer limits; no approval/import/publication. Validation in TEST_RESULTS.md. |
| BI-P1-001 | Establish manufacturing credibility / P1 | BLOCKED BY BUSINESS INFORMATION | About/quality pages already avoid unsupported manufacturing claims | Owner-supplied facility identity, process scope, authentic photos/rights and evidence needed before capability claims. |
| BI-P3-001 | Bulk buyer RFQs / P3 | PARTIALLY IMPLEMENTED | Quote quantities and multi-item RFQ exist; CSV/ZIP importer is administrator catalogue tooling | Buyer CSV/Excel validation/preview/template and secure PDF attachment handling are missing. Reuse RFQ acceptance; do not expose admin importer. |
| BI-P4-001 | Qualify distributor and OEM leads / P4 | PARTIALLY IMPLEMENTED | B2B positioning, OEM page, buyer type/country/quantity/branding RFQ fields | Dedicated distributor journey, territory/category requirements and structured OEM qualification are missing. Commercial terms require approval. |
| BI-P4-002 | Supplier pack, samples and audits / P4 | PARTIALLY IMPLEMENTED | Documentation intent and free-text sample enquiries exist | Documents, expiry/scope evidence, approved sample process and audit availability required. Dedicated workflow infrastructure remains possible independently. |
| BI-P5-001 | Commercial lead management / P5 | PARTIALLY IMPLEMENTED | Durable RFQ payload, buyer categorisation, reference, deduplication and private review CLI | CRM/pipeline/reporting, attribution, sample/quote stages, distributor intelligence and suppression missing. Choose business process before external integration. |
| BI-P6-001 | Production assurance / P6 | PARTIALLY IMPLEMENTED | SEO, security, automated responsiveness/accessibility tests and optimized imagery exist | Staging/provider/real SMTP checks, approved retention, Search Console and field performance remain; see requirement matrix. No production deployment authorized. |

## Completed step BI-P0-001

Existing functionality: contact details and Organization microdata already appeared throughout the public shell, About, RFQ and privacy pages. Failure paths also provided an email fallback.

Identified gap: each copy was maintained separately. A correction could leave procurement contacts, privacy contact and machine-readable supplier details inconsistent.

Implementation: one immutable, server-owned business profile supplies the sourced trading name/contact/location. Existing templates and fallback messages consume it; layout, navigation, routes, styling, catalogue and RFQ behaviour are retained. Early catalogue failure rendering explicitly escapes the contact value. No legal registration name or certification was invented.

Business impact: makes supplier contact corrections consistent across the buyer journey and reduces the chance of enquiries being directed to stale details.

Validation: see [TEST_RESULTS.md](TEST_RESULTS.md). Missing business evidence and next task: see BI-P0-002 and [content verification](../content-verification.md).


## Completed step BI-P0-002 — source review gate

Existing functionality: administrator product editing, CSV/ZIP preview/import and resumable bulk publication already existed, with revision/category restrictions. They did not establish source accuracy.

Identified gap: an unreviewed record could be published by any of those paths. Source provenance was largely outside the CMS in extraction sidecars.

Implementation: added bounded source document/revision, source PDF page, image-match evidence and review notes to the existing payload/editor and optional CSV mapping/export. Only an explicit authenticated editor review records verification, using server actor/time and a canonical SHA-256 fingerprint of source-backed content and ordered image URLs/alt text. Regulatory certification is never implied. Editing reviewed content invalidates review; save as draft or explicitly review the changed content. SEO-only edits can preserve review. Manual and import commits reject unreviewed published saves transactionally. Bulk preview eligibility and execution recheck the same rule. CSV cannot grant approval, including old/manipulated staged plans. Existing published records remain visible; their next published save requires review. No schema migration, startup backfill, real data write or automatic owner-data unpublication was performed.

Files: `src/cms/{source-review,store,bulk-publish-store,import-service,import-utils}.js`, `views/admin/{product,products}.ejs`, `tests/source-review.test.js`, synthetic `tests/review-fixture.js`, existing store/public/admin/import/bulk publication tests and admin/bulk browser fixtures. Updated README, content/CMS/import/bulk guides, CMS persistence documentation, requirement matrix, decisions and test report. Existing backups are in `tmp/source-review-baseline` because the workspace root has no Git history.

Business impact: unreviewed catalogue additions and modified technical claims cannot silently enter new publication workflows. Source evidence travels with draft imports into a reviewable product record.

Validation: see TEST_RESULTS.md. No actual accuracy/certification was asserted for existing records. Owner verification of source matches and images is still required.

Next implementation: **BI-P0-003 cloud enquiry outbox/delivery infrastructure**. Existing SMTP sender/recipient and worker scheduling/provider acceptance remain dependencies for real delivery testing. Catalogue expansion follows owner source review; manufacturing evidence remains business-blocked.


## Implemented step BI-P0-003 — cloud notification infrastructure

Existing functionality: the RFQ route saved accepted enquiries durably in PostgreSQL. A long-running SQLite notification worker existed, but was disabled on Vercel; cloud notification status stayed pending without a consumer.

Identified gap: no authenticated cloud consumer, durable claims/retries or recovery after serverless interruption.

Implementation: new namespaced sidecar outbox is inserted atomically with RFQ acceptance. Pre-upgrade pending entries are discovered in bounded batches on worker invocation. `/internal/rfq-notifications` checks a private bearer secret, explicit enable flag and mail configuration before claiming one enquiry. Fresh lease tokens, expiry and completed-row fencing prevent stale completions/claims. Errors reschedule with capped backoff; acknowledged SMTP acceptance updates RFQ and outbox together. Sender/recipient come only from server configuration; buyer success remains storage-only. Real socket cancellation enforces SMTP deadline. Existing local worker timeouts/loop and public architecture remain in place.

Files: `src/{postgres-store,notifications,app}.js`, new `src/cloud-notifications.js`, `tests/cloud-outbox.test.js`, `tests/cloud-notifications.test.js`, explicitly synthetic `tests/fixtures/synthetic-smtp-{cert,key}.pem`, `docs/cloud-notifications.md`, inactive `docs/cloud-notifications-cron.example.json`, README and current tracking/decision/test documents. No dependency or active deployment configuration was changed. Baselines are in `tmp/cloud-outbox-baseline`.

Business impact: prepares stored cloud enquiries for recoverable internal email notification without coupling buyer acceptance to SMTP availability. Logs/HTTP responses exclude credentials and buyer payloads.

Validation: final results in TEST_RESULTS.md. Tests include actual form-to-PostgreSQL-to-loopback-SMTP delivery, verified SMTPS trust/rejection, failed/timeout sends, socket cancellation, retries and stale-worker fences. Existing local product/image/category/enquiry hashes remain unchanged. No external email, live DB migration or production deployment occurred.

Blockers: approved SMTP sender/recipient/provider settings; owner review of legacy pending enquiries; plan-supported scheduler cadence; real PostgreSQL concurrency and provider/inbox staging acceptance. Technical infrastructure is complete; the business objective remains PARTIALLY IMPLEMENTED until those activation checks pass. The concrete native schedule example is inactive to preserve the current deployment settings and avoid assuming plan limits.

Next priority: complete BI-P0-003 staging/activation once the required business settings and authorization exist. Next independent development task: BI-P2-001 extraction-sidecar provenance/validation integration for staged catalogue expansion; never publish unreviewed products. Manufacturing evidence remains business-blocked.


## Completed step BI-P2-001a — extraction provenance staging

Priority decision: BI-P0-003 infrastructure is complete but live activation still needs approved settings/provider/schedule acceptance; manufacturing evidence remains business-blocked. The next independent task identified in the previous report was extraction-sidecar integration. No repeat audit, framework change or page redesign was needed.

Existing functionality: five catalogue PDFs had already been extracted into 5,188 draft CSV rows, image ZIPs and separate source/review/coverage files. The current CMS already supports source evidence fields, authenticated import preview/confirmation and publication review.

Gap: raw extraction CSVs omitted the sidecar evidence and did not automatically exclude conflicts recorded elsewhere in the package.

Implementation: a reusable bounded preparation command joins exact product references to source document/page, extraction text/notes and image provenance; retains raw originals and the complete review register; validates archive references, source association/category/page, field bounds and exact references; withholds all SKU/page flags and ambiguous/missing evidence; emits only draft import files, split within existing upload limits. Source notes are labelled unreviewed; page/panel images are not represented as verified photos. Input/output and image-content hashes identify the evidence snapshot. Original CSV/ZIP data files and business records are unchanged.

Actual package: `output/catalogue-staging-2026-11-25` contains 4,935 draft candidates in five CSV files, with 253 withheld rows from 5,188 original records. All 1,005 review flags and full raw evidence are retained. Original conflicting rows were not silently corrected or truncated, and no product was imported or approved.

Files: new `src/catalogue-staging.js`, `scripts/prepare-catalogue.js`, `tests/catalogue-staging.test.js`, `docs/catalogue-staging.md`, generated staging CSV/report/provenance/README artifacts; corrected CR/LF quoting in existing `src/cms/import-utils.js`; README, original package README and business status/decision/test/requirement documents updated. No application route/template, dependency, database schema or deployment configuration changed.

Business impact: source evidence reaches the existing procurement catalogue review workflow without manually joining spreadsheets or accidentally staging known conflicts as clean products.

Acceptance: CLI dry-run and real package preparation; deterministic reruns and size splitting; existing importer/image pipeline using synthetic output; drafts remain private and cannot publish without source review; full server, syntax and production/browser verification recorded in TEST_RESULTS.md.

Blockers/next task: actual instrument/specification/photo verification, image rights and resolution of 253 withheld records remain source/business review work. Cloud activation is still the highest pending external acceptance task. With catalogue staging now implemented, the next independent software improvement is BI-P3-001 buyer bulk requirements CSV intake/validation, reusing the existing RFQ workflow. Native Excel/PDF support requires its own complete validation/storage design; do not expose the private catalogue importer to buyers.
