-- Source-shaped Query content. IP/user-agent are retained as nullable source columns,
-- but the synthetic staging repository deliberately never writes them.
CREATE TABLE IF NOT EXISTS queries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  message TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  is_read INTEGER DEFAULT 0 CHECK (is_read IS NULL OR is_read IN (0, 1)),
  processed_by INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_queries_property_id ON queries (property_id);
CREATE INDEX IF NOT EXISTS idx_queries_email ON queries (email);
CREATE INDEX IF NOT EXISTS idx_queries_phone ON queries (phone);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries (created_at);
CREATE INDEX IF NOT EXISTS idx_queries_is_read ON queries (is_read);
CREATE INDEX IF NOT EXISTS idx_queries_is_read_created ON queries (is_read, created_at);
