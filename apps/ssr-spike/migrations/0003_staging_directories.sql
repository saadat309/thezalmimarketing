CREATE TABLE IF NOT EXISTS staging_directories (
  kind TEXT NOT NULL CHECK (kind IN ('maps', 'files')),
  slug TEXT NOT NULL,
  is_public INTEGER NOT NULL CHECK (is_public IN (0, 1)),
  city_slug TEXT NOT NULL DEFAULT '',
  society_slug TEXT NOT NULL DEFAULT '',
  phase_slug TEXT NOT NULL DEFAULT '',
  file_type TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  search_text TEXT NOT NULL DEFAULT '',
  record_json TEXT NOT NULL,
  PRIMARY KEY (kind, slug)
);

CREATE INDEX IF NOT EXISTS staging_directories_public_city_idx
  ON staging_directories (kind, is_public, city_slug, updated_at DESC);

CREATE INDEX IF NOT EXISTS staging_directories_public_society_idx
  ON staging_directories (kind, is_public, society_slug, updated_at DESC);

CREATE INDEX IF NOT EXISTS staging_directories_public_phase_idx
  ON staging_directories (kind, is_public, phase_slug, updated_at DESC);

CREATE INDEX IF NOT EXISTS staging_directories_public_file_type_idx
  ON staging_directories (kind, is_public, file_type, updated_at DESC);
