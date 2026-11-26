# Incremental development decisions

## BI-P0-001 — Shared supplier contact profile, 25 November 2026

Intent: prevent conflicting buyer contact information without changing the established application or publishing unverified legal claims. The user's continuation specification authorizes selecting and implementing the smallest actionable improvement; no redesign or deployment is included.

Approach selected: reuse Express application locals and existing escaped EJS fields. `src/business-info.js` is the immutable server-side source for sourced trading name, email, telephone and address. It contains no credentials, certifications, invented legalName, capacity or commercial promises. Existing metadata descriptions use the same location. Early catalogue errors read the profile before CMS readiness and explicitly escape HTML.

Alternatives: database-managed settings would require a new editable administrative workflow and validation for a small stable record; environment variables would scatter a structured address across hosting configuration and risk partial overrides. Neither is necessary. Continue to use the existing environment for SMTP sender/recipient credentials: those are operational notification settings, not automatically the public sales contact.

Constraints: preserve design, canonical routes, product data, RFQ acceptance, privacy wording and deployment configuration. Centralizing existing information does not verify its truth; owner confirmation remains required. Trading-name references in editorial copy and logo assets retain the established brand.

Plan executed: inspect existing claims/docs/history and current database read-only; write failing rendered-page/failure-path tests; add shared profile and replace duplicated contact/location fields; run focused/full tests, syntax and browser checks; update status, gap matrix and content register.

Next design boundary: product evidence verification must be shared across CMS edit, import and bulk publishing. Source files currently hold richer provenance than the product importer. Do not silently infer verified status from `published`, automatically unpublish current owner records, or import more extracted rows as verified. Preserve records and provide explicit evidence review before subsequent publication work.


## BI-P0-002 — Source evidence before publication, 25 November 2026

Continue the tracker-designated next task in the existing workspace under the user's explicit implementation instruction. Reuse product JSON payloads and current authenticated editor; introduce no table, framework, service or separate verification dashboard.

Selected design: source metadata and server-issued review `{status, reviewedBy, reviewedAt, fingerprint}` live in the existing product payload. A canonical fingerprint covers SKU/name/category, technical and descriptive content, catalogue/source pages, evidence notes and image order/URLs/alt text. Slug, SEO metadata, feature flag and display priority are outside the source review scope. Review/revoke/invalidation events and evidence snapshots use the existing audit table. Source review means an administrator compared the content and image against the source; it is neither independent certification nor regulatory approval.

Alternatives: requiring only a checkbox would leave stale approval after specification/image changes; a separate review database/dashboard would duplicate existing revision, access-control and audit mechanisms. Payload metadata plus one shared fingerprint rule is the smallest complete change. No stored legacy row is rewritten or automatically trusted. Existing published visibility is retained to preserve owner changes; the next published save is gated, even for an old record. Archive and draft saves remain available.

All manual published saves and import commits validate inside the existing transaction; failed reviews roll back product/gallery/category/audit writes. Bulk previews count reviewed drafts only, then bounded execution rechecks review and revision/category state. Import previews surface errors early; the authoritative commit check also protects pre-upgrade jobs. CSV can carry provenance, but cannot approve review. A published reviewed record may receive unchanged source content/SEO edits via import; source-changing or unreviewed imports must explicitly target draft, then be reviewed separately.

Plan executed: baseline backups and read-only business-record hashes; failing source-review tests; shared rule and editor/import integration; adapt existing synthetic publication fixtures to explicit review; server and browser regressions, production-mode startup/template rendering, record-preservation check; document operator steps and remaining business evidence.


## BI-P0-003 — Cloud RFQ outbox infrastructure, 25 November 2026

Continue the next tracker item using existing PostgreSQL, Express and Nodemailer. Source review and all other completed work remain untouched. The selected approach is a durable sidecar outbox table plus an authenticated bounded HTTP worker. Alternatives were inline SMTP during public acceptance (couples buyer success to mail/network failures), a cloud setInterval worker (does not survive serverless suspension), or a new queue/mail provider (unnecessary external service). Existing SQLite notification behaviour is retained.

New RFQs and outbox entries commit atomically. Bounded legacy discovery queues pending pre-upgrade records only at worker invocation. Conditional claims check both lease expiry and current pending status; token/expiry fences protect completion. One message per invocation, two-minute lease, SMTP deadline/socket cancellation and capped exponential retry protect recoverability. Acknowledgement and RFQ sent status commit atomically. At-least-once semantics are explicit; stable Message-ID is not treated as guaranteed deduplication.

The worker is mounted before catalogue middleware and accepts only secret-authenticated GET/POST requests. It uses deployment-only sender/recipient and no request-body content. Failure logs omit SMTP details and credentials. Enabling requires an explicit environment flag, a private bearer secret and approved SMTP settings. No active cron entry is inserted into existing deployment configuration: the current plan/frequency and live backlog approval are unknown. A concrete native Vercel cron fragment and activation/monitoring instructions are supplied for the final authorized deployment step. New Vercel Schedules APIs were not introduced.

An independent review found that Nodemailer's non-pooled close does not abort its active connection. The cloud-specific transport now retains a socket through the documented getSocket option and destroys it at deadline, leaving TLS negotiation/certificate validation to Nodemailer. A real stalled-loopback regression failed before this fix and passed after it. The existing local worker shares SMTP configuration without adopting the cloud lease protocol.

Tests use pg-mem and a real loopback SMTP sink plus controlled failure transports. Database MVCC/provider latency and real TLS/provider/inbox delivery remain staging acceptance items. SMTP is bounded separately from the existing function's overall 30-second budget; interrupted DB work is recovered through leases.


## BI-P2-001a — Repeatable source-evidence preparation, 25 November 2026

Continue the tracker-designated independent catalogue task while live mail activation and authentic manufacturing evidence remain business-blocked. Reuse the existing extraction outputs, CSV/parser/ZIP helpers, CMS source fields and authenticated import workflow. No new extractor, framework, database or upload endpoint is introduced.

Selected design: a local command reads the fixed extraction-package files, checks/join evidence in memory under the existing size limits, and writes a fresh review package only after validation. Alternatives were manual spreadsheet joins (not repeatable and prone to losing references/conflicts) or a parallel web importer (duplicates current preview/confirmation/authentication). A deterministic CLI producing ordinary current-format draft CSVs is the smallest complete bridge.

Exact original fields, including leading-zero references and unknown blank materials, remain intact. Source document/page and unreviewed notes/image evidence come from matching sidecar records; full raw data and all review flags stay in JSON. Conflict, duplicate, missing/ambiguous image/source/page, source-text-reference and field-limit problems withhold the whole row. Page-wide flags conservatively affect every product on that source page; SKU flags are applied across catalogues. No confidence score or inferred approval replaces human source comparison.

Files split per category and at importer limits; an unchanged input snapshot yields matching output hashes. Reports use spreadsheet-safe CSV. Import CSV deliberately preserves exact source text and must be inspected through the existing CMS parser/preview rather than enabling spreadsheet formulas. Output is a fresh exclusive directory outside the source package, with a completion report written last. Partial writes are never automatically deleted or mistaken for completed output. No network fetch or database connection occurs in preparation.

Generated evidence package and isolated tests make the change reviewable without changing any of the 257 real published products. Actual import remains the existing authenticated, explicit preview/confirmation process. The source-review gate remains authoritative for publication; no output includes a review action or server approval.

Final review refinements: resolve physical source/output parents and exact parent-segment boundaries so symlinks/junctions and dot-prefixed children cannot place output inside the source package. Withhold all effective slug collisions before splitting, matching the current importer's SKU-to-slug rule. Explicitly quote standalone CR/LF characters in import/report cells so parsers that recognize all standard line endings preserve record boundaries. Original data values remain unchanged.
