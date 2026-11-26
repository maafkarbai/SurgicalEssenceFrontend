# Publish multiple products

Open **Admin > Products**, apply search/category/status filters, and select products with the row checkboxes. The header checkbox selects or clears the current page. After selecting the page, use **Select all N products matching these filters** to include matching products on every page. Changing a filter or navigating pages resets selection.

Choose **Publish selected**. The confirmation shows the selected count and the number of eligible source-reviewed drafts. Nothing is published until **Confirm bulk publish** is clicked. Selection is frozen before confirmation: products added afterward are excluded, and edits made after selection produce a conflict instead of being overwritten.

Publishing processes up to 20 selected products per request. The progress panel shows actual published, skipped and failed counts. Already-published and archived products are skipped. Unreviewed drafts fail with a source-review reason; review them in the existing product editor before retrying. Draft products whose categories are unpublished fail with a reason; publish the category separately before retrying. Product details and gallery records are preserved. After completion, the table, totals and pagination refresh with the same filters. The result list supports pagination and a skipped/failed-only filter.

Use **Pause after this batch** to stop between batches. Reloading a confirmed job shows its saved progress and requires **Resume publishing** to continue. If you navigate away, the Products page lists your **Unfinished publishing jobs**. These links are private to the administrator who started the job. A lost confirmation response can be recovered without publishing a product twice. An unconfirmed preview expires after 30 minutes.

Each job supports up to 10,000 products. Narrow the filters for larger selections. At most 20 running/recent-preview jobs per administrator are allowed. Publishing is supported only through authenticated, CSRF-protected admin requests. There is no public bulk-update endpoint or background publisher. Categories are never automatically published by this feature.

## Implementation and local verification

The additive `se_cms_publish_jobs` and `se_cms_publish_rows` tables persist immutable product IDs/revisions and per-product outcomes. Existing SQLite/PostgreSQL transaction serialization and conditional revision updates make committed batches replay-safe. Publication shares the ordinary editor's source-review and category rules and writes `product.update` audit entries with the publication job ID. Product payloads, search text, image associations, aliases and slugs are unchanged.

Run server/store checks with `npm test` and syntax checks with `npm run check`. Run the isolated browser flow with `node tests/bulk-publish-browser.js` and the existing admin regression flow with `node tests/admin-browser.js`. These tests use temporary databases and synthetic products, not the local catalog. Browser tests use the existing Playwright/msedge setup; desktop and mobile screenshots are saved outside the repository under the system temporary directory.

Coverage includes individual/page/all-filtered selection, confirmation/cancel, frozen selection, stale edits, category restrictions, owner isolation, CSRF, exact data preservation, interrupted-confirm recovery, pause/navigation/resume, automatic refresh, result paging, public catalog/search/category/sitemap visibility and desktop/mobile accessibility. A 1,000-product isolated test verifies bounded batches and exact counts. The PostgreSQL adapter is checked with pg-mem; real hosted PostgreSQL/deployment behavior is not claimed as tested.

No deployment or publication of existing local products is part of installation/testing. Restart the local server to load the new routes and additive schema. The standard local launcher backs up the existing database/media before applying a changed schema.
