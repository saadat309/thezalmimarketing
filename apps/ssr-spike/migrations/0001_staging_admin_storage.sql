CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  csrf_token TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx
  ON admin_sessions (expires_at);

CREATE INDEX IF NOT EXISTS admin_sessions_created_idx
  ON admin_sessions (created_at, token_hash);

CREATE TABLE IF NOT EXISTS admin_login_failures (
  email_hash TEXT PRIMARY KEY,
  failure_count INTEGER NOT NULL CHECK (failure_count > 0),
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_profiles (
  user_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL
);
