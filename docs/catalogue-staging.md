# Preparing catalogue drafts with source evidence

Use this command to connect the existing extraction package to the current CMS import format. It does not re-extract PDFs, infer specifications, connect to a database, grant source review, import records or publish products.

```powershell
node scripts/prepare-catalogue.js --source-dir output/catalog-bulk-import --check
node scripts/prepare-catalogue.js --source-dir output/catalog-bulk-import --output-dir output/catalogue-staging-2026-11-25
```

Choose a **new output directory** with an existing parent, outside the original package. Existing directories and files are never overwritten. `--check` runs parsing, archive checks and the join without creating output. Unknown/incomplete arguments and malformed files fail. A write failure can leave a partial directory; `report.json` is written last and marks successful completion. Use a fresh destination after correcting a failed write, rather than reusing or deleting owner files automatically.

## Inputs and outputs

Inputs are the existing `all-products-import.csv`, `product-sources.csv`, `review-needed.csv`, `page-coverage.csv` and `all-products-images.zip`. They are read-only. CSV parsing enforces UTF-8, headers, record sizes and the current import limits. The existing ZIP scanner enforces entry paths/types, encryption/symlink rules, counts, compression and size bounds. Archive entries receive content hashes; this stage checks source/image association and archive integrity, while the existing importer still performs actual image decoding/optimization. It does not establish that a crop depicts the correct instrument.

The output contains:

- `imports/<category>-<part>.csv`: current 19-column CMS format, UTF-8/BOM. Every product is `draft`; no approval, reviewer or review action is imported. Files split at the existing 4 MiB/row limit.
- `withheld.csv`: spreadsheet-safe issue report with original product row/reference and all withholding reasons. Do not upload it as product data.
- `provenance.json`: exact original product rows, matching source rows, source text/method/URL/crop notes, associated flags, image hashes, the full review register/page coverage and orphan source rows. Published input status is preserved here as evidence, even though output status is always draft.
- `report.json`: counts, issues, generated CSV byte lengths/hashes and hashes of all five input files. Deterministic reruns with unchanged inputs produce matching outputs. A hash establishes the snapshot used, not the correctness of extracted facts.
- `README.md`: package-specific operating instructions.

Product references retain leading zeroes. Names, dimensions, material fields, descriptions and original image references are copied without technical inference. Source document/page, unreviewed image evidence and extraction review notes are added from the sidecar. Source notes/text are never silently truncated: evidence that exceeds the CMS bound is withheld and retained in full in JSON. Existing populated provenance that disagrees with the sidecar is also withheld.

Import CSV files preserve exact text and are intended for the **CMS parser/preview**. Do not enable spreadsheet formula execution when inspecting original/import data; use `withheld.csv` for spreadsheet review and the CMS for import previews. The pipeline records source URLs as text and never follows them. It does not verify current live URLs, PDF revisions, rights, certification or product accuracy; compare the appropriate source document during review.

## What is withheld

All duplicate SKU occurrences; colliding explicit or SKU-generated URL slugs; missing/ambiguous source rows; unknown catalogue, category mismatch or out-of-range page; missing/duplicate/zero-record page coverage; missing extraction method/source text or exact reference in that text; missing/mismatched/unsafe/ambiguous images; additional images without individual evidence; invalid SKU/slug/featured values; oversized fields; SKU-specific review flags (case-insensitive); and page-wide flags with no SKU. A SKU flag is applied conservatively across catalogues. A page-wide flag blocks all products on that source page. Malformed review flag locations/reasons fail the run so conflicts cannot silently disappear.

Rows without explicit conflicts remain **unreviewed draft candidates**. Full-page/multiple-instrument images remain labelled as such in their evidence; they are not promoted to verified product photographs. A human must confirm names, dimensions and image association, including any caution in the extraction notes.

## Continue through the existing CMS

1. Read `report.json` and the complete evidence. Resolve withheld references against the original PDFs; do not remove flags merely to pass validation.
2. Upload only a generated CSV from `imports/` through **Products → Import Products**. Choose **Add New** to preserve existing records. The existing 257 owner records are not modified by preparation. Use an update mode only when intentional and after reviewing the CMS diff/backup requirements.
3. Upload the unchanged original `all-products-images.zip`; image filenames in the prepared CSVs still refer to that archive. Do not upload the report/provenance JSON as products.
4. Review mapping, category selection, image validation and preview, then explicitly confirm using the existing authenticated wizard.
5. Imported records stay private drafts. Compare source evidence and product images in the existing editor, correct any errors, and explicitly record source review before ordinary or bulk publication. Neither this command nor CSV can approve a product.

## 25 November 2026 run

The generated package at `output/catalogue-staging-2026-11-25` contains **4,935 draft candidates** and **253 withheld rows** from **5,188 products/source records**, retaining all **1,005 review flags**. There are five bounded import files: surgical 3,406; beauty 232; dental 855; ophthalmic 288; single-use 154. No orphan source rows were found. Reasons overlap: 243 rows have matched review flags and 83 lack an exact reference in source text. These totals describe preparation only; no actual catalogue import/publication occurred.
