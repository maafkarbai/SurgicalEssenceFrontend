# Product CMS implementation

The live site uses Express/EJS and small browser scripts. Eight product records and five categories are in src/catalogue.js; RFQs use SQLite locally and isolated PostgreSQL tables on Vercel. Existing product URLs use SKU reference numbers. There is no current admin authentication or persistent upload service.

Keep the public design and Express stack. Add normalized se_cms_* tables, seed existing records without replacing any real rows, and render public pages from published records. Preserve SKU identity, maintain slug redirects, and snapshot selected product data in RFQs. Add a session-authenticated admin area with server-side CSRF, scrypt password hashes, durable login limits, and a private CLI for first-admin setup. Implement image decoding/re-encoding with Sharp and durable local media or Vercel Blob storage. Production files must never use ephemeral disk.

## Backup before schema changes

No production database will be changed during implementation. Before enabling the CMS in production, take a provider snapshot and a pg_dump --format=custom backup of the current database; securely verify the dump using pg_restore --list. Back up existing uploaded objects separately. Locally, use SQLite's online backup API to create a dated private backup before running the migration/first-admin CLI. Keep backups outside public/ and outside Git. Do not log connection strings or password input.

The additive migration creates new tables only and seeds with conflict-safe inserts. Rollback: redeploy the previous Git commit; it still reads the original source catalogue and RFQ tables. Keep the new tables for recovery. Do not drop CMS tables or restore over a live database as an automatic rollback. If a migration fails, correct the failure and retry transactional migrations; restore into a separate database for inspection before an intentional recovery. Existing se_rfqs and any previous application tables must survive.

## Implementation sequence

1. Database adapter, transactional migrations, source-backed seed, unique constraints, history redirects, audit/session/login records and tests.
2. Password/session authentication, private bootstrap CLI, protected CRUD routes and usable admin templates.
3. Decoded/re-encoded persistent uploads, primary image/order/alt selection, safe removal and media tests.
4. Public catalogue/detail/home/sitemap/RFQ integration with published records and historical snapshots.
5. Server tests and complete browser workflows at desktop/mobile widths; refine accessibility/error paths; document actual results and deployment prerequisites.

The user supplied the desired interface and explicitly asked to implement. Routine implementation choices are resolved here without an additional design approval cycle. Production deployment requires a fresh approval for this CMS request. Do not push master because it automatically deploys on Vercel.
