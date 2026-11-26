# Bulk product imports

The importer extends the existing CMS at **Admin → Products → Import Products**, `/admin/products/import`. It uses the same private sessions, CSRF checks, catalogue model, image processor and persistent storage. The implementation is local; no production database migration or deployment has been performed for this change.

## Setup

Install dependencies with `npm ci`, then follow [CMS setup](cms-guide.md) for a private first-admin account and local server. The existing additive migration now creates `se_cms_import_jobs`, `se_cms_import_rows`, `se_cms_import_chunks` and the import/media association table. It preserves existing catalogue and enquiry tables. Take the documented database and media backup before enabling the new migration in staging or production.

Local images remain in `DATA_DIR/media`. Vercel images require the existing `BLOB_READ_WRITE_TOKEN` and exact `BLOB_PUBLIC_HOST`; ephemeral filesystem storage is never used in the cloud. CSV and ZIP staging is private database data rather than public media objects. No Redis, background worker or always-running process is required. The browser requests bounded batches, and each row's catalogue changes and result commit together.

No import route is publicly accessible. There is no automatic production deployment or unauthenticated CSV endpoint. Do not push the auto-deploying production branch without approval.

## Source review requirement (25 November 2026)

New catalogue products must import as drafts and receive explicit source review in the existing product editor before publication. CSV cannot create verification; a `published` row without an existing matching server-recorded review produces a preview error and is also rejected at commit. For an existing published product whose source content needs updating, explicitly import it as `draft`, then review and publish. Review-preserving updates to already-reviewed products can keep published status if source content and images remain unchanged.

Optional provenance columns are `source_document` (1000 characters), `source_page` (integer 1-10000), `image_evidence` (2000 characters) and `review_notes` (4000 characters). They map, preview, persist and export with product data. Earlier 15-column CSV files remain compatible; the current template/export includes these four optional fields. Approval, reviewer and time cannot be supplied through CSV. Carry relevant evidence from `product-sources.csv` into these columns after examining flagged records; importing a provenance note does not approve its accuracy.

This requirement supersedes earlier instructions permitting immediate publication of new CSV products. Existing preview/confirmation, backup and image-validation controls still apply.

## Prepare a CSV

Download **CSV template** from the import screen. The sample records are explicitly fictional drafts; replace them with verified business data. Save from Excel as **CSV UTF-8**. BOM is supported. Standard double-quoted fields may contain commas and line breaks; embedded double quotes must be doubled.

Required fields are `sku`, `name`, and `category`. Optional fields are `short_description`, `description`, `material`, `size`, `variations`, `image_filename`, `additional_images`, `seo_title`, `meta_description`, `slug`, `status`, and `featured`. Technical fields are never fabricated. New products default to draft when status is omitted; `published` is accepted only for an existing review that still matches the unchanged source content. Featured accepts `true/false`, `yes/no`, or `1/0`.

The SKU is the stable business identifier and supports letters, digits, dots, underscores and hyphens. It is case-insensitively unique. Slugs use lowercase letters/numbers separated by hyphens; omitted new slugs are derived from the SKU. Existing slugs remain unchanged unless explicitly supplied or reset using a clear-when-blank selection. Changing one uses the CMS's existing301 redirects.

## Run the wizard

1. **Upload CSV.** This creates a private staging job only. It changes no products, categories or library images.
2. **Map columns.** Common supplier headings are detected automatically, including Product Name, Item Name, Product Code, Item Number, Reference No, Product Category, Details and Image. When several columns match the same field, choose one explicitly. Ignore unrelated columns. Review the first three records.
3. **Choose a mode.** Add New skips existing SKUs; Update Existing skips new SKUs; Add and Update handles both. Duplicate SKUs inside the CSV are errors on every occurrence.
4. **Choose blank/image behavior.** Empty optional fields preserve existing values. Select an individual **Clear this field when blank** checkbox only when clearing is intended. Existing images remain unless **Replace existing images** is enabled. A blank image field does not clear a gallery without both replacement and an explicit image-clear choice.
5. **Map categories.** Names match ignoring case and extra whitespace. Unknown categories can map to an existing category, be explicitly created, or have their rows skipped. Category creation and any required publication appear in the preview. Similar names with colliding URL slugs produce errors rather than duplicate categories.
6. **Optionally upload an image ZIP.** See image references below. Then select **Map and validate**. Real image decoding proceeds in small resumable validation requests. A count of validated images is displayed; products have not changed.
7. **Review the preview.** Search and page through original CSV row numbers, SKUs, names, intended before/after changes, warnings and errors. Counts show new/existing/invalid/duplicate products, missing-image issues and category issues. Download the validation report when corrections are needed. Remap/revalidate, cancel, or start a corrected CSV job. Cancelling before confirmation changes no catalogue records.
8. **Confirm and import valid rows.** Update modes require acknowledging a verified database/catalogue and media backup. Only the current validated plan can be confirmed. Invalid rows remain failed in the final report; explicitly skipped categories/SKUs remain skipped. No existing record is overwritten without this preview and confirmation.
9. **Process/resume.** Each request processes up to five rows, or one row requiring new image work, with a time budget. Pause between batches if needed. Refreshing or reopening history requires an explicit Resume. Results are genuine committed counts, not a simulated timer.
10. **Review results.** Published products appear immediately in the existing catalogue, search, category counts and sitemap. Drafts stay private. New products support RFQs and preserve their ID/SKU/detail snapshot in enquiries. Result links open the affected CMS product.

## Image references

**CSV + ZIP:** Set `image_filename` to an exact relative ZIP path or an unambiguous basename, e.g. `images/SE-1001.jpg` or `SE-1001.jpg`. Spaces and UTF-8 names are supported. Separate additional filenames with a pipe: `side view.jpg|tip detail.webp`. The primary image is first. Multiple files with the same basename are ambiguous unless the CSV supplies an exact path. Matching is exact and case-sensitive.

**Existing Media Library:** Use `id:UUID` from the library's **CSV import reference** field, or the exact generated filename visible in its URL. Referencing a known library image does not upload another copy. Imported image content hashes also reuse already-stored identical content from earlier imports. Identical files within one import and interrupted retries use deterministic storage IDs. Two simultaneous first-time imports of the same bytes can independently upload a copy; the system favors safe ownership/cleanup over deleting another job's files.

Only JPEG, PNG and WebP content is accepted. Actual decoding, dimensions, single-frame validation, stripping metadata and WebP variants use the existing media service. ZIPs cannot contain executable files, nested archives, encrypted/symlink entries or traversal paths. No arbitrary image URLs are fetched; this feature has no remote download/SSRF surface.

Choose image sizes suitable for catalogue display. Highly compressed files/ZIPs exceeding the limits below are rejected even if the image file could otherwise decode. Invalid archives cannot overwrite staged chunks: cancel and start a new job with a corrected ZIP.

## Supported limits

| Limit | Default / ceiling |
|---|---|
| CSV upload |4 MiB |
| Data rows per job |10,000 |
| CSV columns |64 |
| Characters in a CSV cell |50,000, subject to field-specific CMS bounds |
| Compressed ZIP |64 MiB |
| ZIP upload chunk |512 KiB per authenticated request |
| ZIP entries |5,000 |
| Expanded ZIP total |256 MiB |
| Individual ZIP image |4 MiB, plus existing image dimension limits |
| Compression ratio |100:1, with a small-entry allowance |
| Active jobs per administrator |20 |

`CMS_IMPORT_MAX_ROWS`, `CMS_IMPORT_MAX_CSV_BYTES`, and `CMS_IMPORT_MAX_ZIP_BYTES` can lower the defaults; hard ceilings cannot be raised through these variables. `CMS_IMPORT_ACTIVE_LIMIT` adjusts the active-job quota within1–100. Split larger source catalogues/archives into separate jobs. The successful1,000-row test is a local synthetic-data result, not a promise that1,000 full-resolution photographs fit in one64 MiB ZIP or complete within one cloud request.

## Recovery, retention and backups

Committed rows and result status are persisted atomically. Repeating a process/confirmation request cannot create another copy of already-completed rows. SKU uniqueness, a job lease and expected product revisions prevent duplicates and stale-preview overwrites. If a product changes after preview, its row fails safely and identifies the conflict rather than replacing the newer edit.

After a network interruption, reload the saved history job and Resume. If the previous function timed out while holding its lease, allow up to two minutes for the lease to expire. Temporary image-storage errors/time-budget limits leave the affected row pending so it can resume; already-stored deterministic derivatives are reused. Permanently invalid or conflicted rows remain failed: download the report and submit a corrected new CSV. A cancelled started job retains its previously committed rows; it is not a rollback.

Cancelling or completing a job removes raw ZIP chunks. History keeps private source row values, mappings, diffs, administrator ID and result/product IDs for audit and review. Cancel abandoned staged jobs to free quota/storage. Apply the business's approved database backup/retention policy to this history. Unlinked derivative cleanup uses the existing private dry-run media-cleanup tool; take a backup and stop administrative writes before deleting orphan candidates.

There is deliberately no “delete everything from this import” rollback button. Products may have been edited later or used in enquiries. For recovery, inspect result/product IDs and recorded revisions, restore a backup into a separate database/media store, and prepare reviewed corrective edits. Never restore a database over live enquiries or delete imported products automatically.

## Scale and deployment checks

Public catalogue browsing now uses SQL filters and24-product pagination. Counts and types use grouped queries; visible gallery images load in one batch. A1,000-product test checks that a page does not issue1,000 database queries. Sitemap queries read lightweight records rather than all image galleries.

Before approving deployment, test with a separate staging PostgreSQL database and Blob store, verify database/media backups, confirm persistent job resume across redeployment and inspect real cloud timeouts/limits. Existing migrations are additive; rolling back application code keeps the import audit/data for recovery. See [CMS backup and restore](cms-guide.md) and [import test results](import-testing.md). Real production migration, remote Blob behavior and production throughput are not claimed as tested locally.
