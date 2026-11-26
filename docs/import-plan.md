# Bulk product import plan — 3 November 2026

Extend the current authenticated Express/EJS CMS. Keep its relational catalogue, stable product identifiers, slug redirects, media decoder/derivatives, public templates and RFQ snapshots. No external CMS or background worker is needed.

## Data flow

Upload a UTF-8 CSV to a private persisted import job. Map columns and category names, choose add/update/upsert mode, and validate before changing catalogue records. Optional blanks preserve existing values by default. Image replacement and clearing optional fields require explicit choices. Preview intended field changes and all errors using the original CSV row numbers. Confirmation freezes the validated plan. Each process request commits a bounded set of individually atomic product/result transactions, with a durable lease and per-row idempotency. Refresh/retry resumes from committed rows. Cancellation before confirmation changes no products; stopping a started import preserves its recorded completed rows.

ZIP archives are uploaded in small authenticated/CSRF-protected chunks so the workflow respects Vercel request limits. Staged CSV/archive bytes are private database records, never public files. ZIP traversal, symlink/encryption/unsupported entries and decompression limits are validated. Matching uses exact paths or unambiguous filenames, never arbitrary external URLs. Imported images use the existing content validation, metadata stripping and persistent image storage.

## Safety and operations

Use additive namespaced tables and prepared queries. Preserve all existing product and category records. Review a verified database/media backup before allowing update/upsert confirmation. Do not provide an automatic destructive rollback: imported records may later be edited or referenced in RFQs. Import history identifies created/updated records and their result revisions for audited recovery. Safe recovery is resume/retry or restore to a separate database for review, followed by explicit corrective changes.

No production schema change or deployment is authorised for this implementation. Work locally on the CMS branch; do not push the auto-deploying production branch. Use separate staging storage for deployment acceptance testing.

## Verification

Exercise 10, 500 and 1,000-row imports; UTF-8/BOM/quoted multiline fields; column ambiguity and missing fields; duplicate CSV/database SKUs; all modes and empty preservation; ZIP images and additional images; unsafe/missing/ambiguous images; category mapping/create/skip; cancellation and interrupted/replayed processing; auth/CSRF/limits; formula-safe reports; public draft/published/search/sitemap/RFQ paths. Run existing CMS/public tests and browser checks. Real cloud storage permissions and post-deployment persistence remain staging checks.
