CREATE TABLE IF NOT EXISTS staging_properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  is_public INTEGER NOT NULL CHECK (is_public IN (0, 1)),
  file_only INTEGER NOT NULL DEFAULT 0 CHECK (file_only IN (0, 1)),
  created_at TEXT NOT NULL,
  title TEXT NOT NULL,
  property_type TEXT NOT NULL,
  purchase_type TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  city_slug TEXT NOT NULL,
  society_slug TEXT NOT NULL DEFAULT '',
  phase_slug TEXT NOT NULL DEFAULT '',
  area_value REAL NOT NULL DEFAULT 0,
  area_unit TEXT NOT NULL,
  beds INTEGER NOT NULL DEFAULT 0,
  baths INTEGER NOT NULL DEFAULT 0,
  label_slugs_json TEXT NOT NULL DEFAULT '[]',
  search_text TEXT NOT NULL DEFAULT '',
  property_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS staging_properties_public_created_idx
  ON staging_properties (is_public, file_only, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS staging_properties_public_category_idx
  ON staging_properties (is_public, file_only, category_slug, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS staging_properties_public_city_idx
  ON staging_properties (is_public, file_only, city_slug, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS staging_properties_public_society_idx
  ON staging_properties (is_public, file_only, society_slug, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS staging_properties_public_phase_idx
  ON staging_properties (is_public, file_only, phase_slug, created_at DESC, id DESC);
