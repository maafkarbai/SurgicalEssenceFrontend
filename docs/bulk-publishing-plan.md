# Bulk publishing implementation

The user-provided specification is the design and authorization for implementation. Work in the existing local workspace (it is not a Git checkout); leave deployments and real product statuses unchanged.

## Design

Add row and page checkboxes, an explicit all-filtered-results selection, and a selection toolbar on Products. Use the existing search/category/status filters. A server-created preview freezes product IDs and revisions before the administrator confirms. Store jobs and per-product outcomes durably, scoped to the authenticated administrator. Process at most 20 products per request inside the existing transaction mechanism, with revisions checked again and publication restricted to drafts in published categories. A narrow status update preserves product payloads and galleries byte-for-byte. Share the category publication rule with ordinary editing, and emit the existing product.update audit convention plus job lifecycle events.

The confirmation dialog shows selected and eligible counts. The browser submits confirmation explicitly and advances bounded batches with visible counts and failure reasons. Interrupted jobs can be resumed from the products page after reload. Results are paginated, and Refresh products preserves filters and clamps the last page. No new dependencies or public endpoints.

Alternatives considered: a single bulk update would not safely report per-product failures or handle large selections; reusing CSV import would burden this interaction with unrelated mapping and image controls. Dedicated small publication jobs fit the requested workflow.

## Tasks and verification

1. Add failing isolated store tests for snapshots, filter parity, preservation, skipped states, category rules, stale revisions, ownership, replay, and bounded batches.
2. Implement publication job schema/store operations and share the publication validation rule. Run the focused tests.
3. Add protected JSON routes and accessible table/toolbar/dialog/progress UI. Test authentication, CSRF, response sanitization, pagination and no mutation before confirmation.
4. Exercise real login, selection, confirmation, batches, result reporting, refresh, and public listing/search/category/sitemap behavior against temporary data in Playwright. Check desktop/mobile layout and accessibility.
5. Run the existing suite, review the final changes, document usage, and verify the actual local product statuses were not changed. No deployment.

## Decisions

- Selection resets on filter changes or table navigation; a running job survives reload via an owner-checked job URL parameter.
- Limit a job to 10,000 products, consistent with existing CSV import limits; explain the limit and request narrower filters if exceeded.
- All matching means all products matching the filters at preview creation, across pages; new matches after that are never added to the job.
- Use the existing Playwright/msedge setup because the Browser plugin is absent.

## Execution record

- Isolated store/admin tests were first run failing against the missing interfaces and then passed after implementation.
- Added owner-scoped unfinished-job discovery after review identified that paused-job navigation could otherwise lose its recovery link. Confirm URLs are persisted before submission to recover a lost response.
- The browser flow exercises real authentication, selection, cancellation/confirmation, late additions, stale edits, category restrictions, automatic refresh, dropped confirmation responses, pause/navigation/resume, and restored previews.
- The 1,000-product SQLite batch test and pg-mem adapter test pass. pg-mem cannot parse the existing `LIKE ... ESCAPE` syntax, so search/filter parity is checked on SQLite and the PostgreSQL test uses category/status filters.
- No Git checkout exists at the workspace root; originals of changed existing files were saved privately in `tmp/bulk-publish-baseline` for review. No branch, commit, push, or deployment is performed.
- Final verification: all 65 server tests pass; syntax checks pass; the new bulk browser flow and the existing admin browser regression flow pass. Viewports 1440px and 375px passed the bulk-flow accessibility checks. Review found no outstanding actionable issues after recovery fixes.
- Restarted the existing local launcher on port 3000 after a consistent SQLite backup and the launcher's normal database/media backup. The additive migration is installed. Hash comparison verified all 257 existing product rows and all image associations remained unchanged (248 drafts, 9 published); zero real publication jobs were created.
