CREATE TABLE IF NOT EXISTS se_cms_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS se_cms_categories (
 id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('draft','published','archived')),
 priority INTEGER NOT NULL DEFAULT 0, payload TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 1, created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS se_cms_products (
 id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
 category_id TEXT NOT NULL REFERENCES se_cms_categories(id),
 status TEXT NOT NULL CHECK(status IN ('draft','published','archived')),
 featured INTEGER NOT NULL DEFAULT 0, priority INTEGER NOT NULL DEFAULT 0,
 payload TEXT NOT NULL, search_text TEXT NOT NULL DEFAULT '', revision INTEGER NOT NULL DEFAULT 1,
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS se_cms_product_code_ci ON se_cms_products(lower(code));
CREATE INDEX IF NOT EXISTS se_cms_product_listing ON se_cms_products(status,category_id,priority);
CREATE TABLE IF NOT EXISTS se_cms_media (
 id TEXT PRIMARY KEY, url TEXT NOT NULL UNIQUE, payload TEXT NOT NULL, created_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS se_cms_product_images (
 id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES se_cms_products(id) ON DELETE CASCADE,
 media_id TEXT REFERENCES se_cms_media(id), url TEXT NOT NULL,
 small_url TEXT, medium_url TEXT, alt TEXT NOT NULL DEFAULT '', position INTEGER NOT NULL,
 UNIQUE(product_id,position)
);
CREATE INDEX IF NOT EXISTS se_cms_images_media ON se_cms_product_images(media_id);
CREATE TABLE IF NOT EXISTS se_cms_aliases (
 alias TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES se_cms_products(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS se_cms_redirects (
 slug TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES se_cms_products(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS se_cms_admins (
 id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS se_cms_sessions (
 token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES se_cms_admins(id) ON DELETE CASCADE,
 csrf_token TEXT NOT NULL, expires_at BIGINT NOT NULL, created_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS se_cms_session_expiry ON se_cms_sessions(expires_at);
CREATE TABLE IF NOT EXISTS se_cms_login_limits (
 key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, blocked_until BIGINT NOT NULL, window_start BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS se_cms_audit (
 id TEXT PRIMARY KEY, actor TEXT, action TEXT NOT NULL, entity_id TEXT,
 payload TEXT NOT NULL, created_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS se_cms_audit_created ON se_cms_audit(created_at);
CREATE TABLE IF NOT EXISTS se_cms_login_attempts (
 id TEXT PRIMARY KEY, key TEXT NOT NULL, success INTEGER NOT NULL, ip TEXT, created_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS se_cms_login_attempt_key ON se_cms_login_attempts(key,created_at);
CREATE TABLE IF NOT EXISTS se_cms_import_jobs (
 id TEXT PRIMARY KEY, admin_id TEXT NOT NULL, filename TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'staged', mode TEXT, config TEXT NOT NULL DEFAULT '{}', payload TEXT NOT NULL DEFAULT '{}',
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL, confirmed_at BIGINT, lease_until BIGINT, lease_owner TEXT
);
CREATE INDEX IF NOT EXISTS se_cms_import_owner ON se_cms_import_jobs(admin_id,created_at);
CREATE TABLE IF NOT EXISTS se_cms_import_rows (
 job_id TEXT NOT NULL REFERENCES se_cms_import_jobs(id) ON DELETE CASCADE, row_index INTEGER NOT NULL,
 source_row INTEGER NOT NULL, data TEXT NOT NULL, plan TEXT NOT NULL DEFAULT '{}', status TEXT NOT NULL DEFAULT 'pending', result TEXT NOT NULL DEFAULT '{}',
 PRIMARY KEY(job_id,row_index)
);
CREATE TABLE IF NOT EXISTS se_cms_import_chunks (
 job_id TEXT NOT NULL REFERENCES se_cms_import_jobs(id) ON DELETE CASCADE, upload_id TEXT NOT NULL, part_index INTEGER NOT NULL,
 data TEXT NOT NULL, byte_size INTEGER NOT NULL, total_parts INTEGER NOT NULL, kind TEXT NOT NULL, filename TEXT NOT NULL, created_at BIGINT NOT NULL,
 PRIMARY KEY(job_id,upload_id,part_index)
);
CREATE TABLE IF NOT EXISTS se_cms_import_media (
 job_id TEXT NOT NULL REFERENCES se_cms_import_jobs(id) ON DELETE CASCADE,
 hash TEXT NOT NULL, media_id TEXT NOT NULL REFERENCES se_cms_media(id),
 PRIMARY KEY(job_id,hash)
);
CREATE TABLE IF NOT EXISTS se_cms_publish_jobs (
 id TEXT PRIMARY KEY, admin_id TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('preview','running','complete','cancelled')),
 total INTEGER NOT NULL, eligible INTEGER NOT NULL, filters TEXT NOT NULL,
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS se_cms_publish_owner ON se_cms_publish_jobs(admin_id,created_at);
CREATE TABLE IF NOT EXISTS se_cms_publish_rows (
 job_id TEXT NOT NULL REFERENCES se_cms_publish_jobs(id) ON DELETE CASCADE,
 row_index INTEGER NOT NULL, product_id TEXT NOT NULL, revision INTEGER NOT NULL,
 code TEXT NOT NULL, name TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published','skipped','failed')),
 reason TEXT NOT NULL DEFAULT '', PRIMARY KEY(job_id,row_index), UNIQUE(job_id,product_id)
);
CREATE INDEX IF NOT EXISTS se_cms_publish_pending ON se_cms_publish_rows(job_id,status,row_index);
