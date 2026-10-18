-- SQLite translation of the checked-in MySQL taxonomy and map_docs tables.
-- Keep source column names/IDs/relationships; media tables and binary data stay out.
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  pic TEXT,
  thumb TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  hide INTEGER NOT NULL DEFAULT 0 CHECK (hide IN (0, 1)),
  slug TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories (name);

CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  pic TEXT,
  thumb TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  hide INTEGER NOT NULL DEFAULT 0 CHECK (hide IN (0, 1)),
  slug TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_cities_name ON cities (name);

CREATE TABLE IF NOT EXISTS societies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  pic TEXT,
  thumb TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  hide INTEGER NOT NULL DEFAULT 0 CHECK (hide IN (0, 1)),
  slug TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_societies_name ON societies (name);

CREATE TABLE IF NOT EXISTS phases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  pic TEXT,
  thumb TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  hide INTEGER NOT NULL DEFAULT 0 CHECK (hide IN (0, 1)),
  slug TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_phases_name ON phases (name);

CREATE TABLE IF NOT EXISTS map_docs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  map_pic TEXT,
  map_thumb TEXT,
  pdf TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  hide INTEGER NOT NULL DEFAULT 0 CHECK (hide IN (0, 1)),
  city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
  society_id INTEGER REFERENCES societies(id) ON DELETE SET NULL,
  phase_id INTEGER REFERENCES phases(id) ON DELETE SET NULL,
  slug TEXT UNIQUE,
  embed_link TEXT
);

CREATE INDEX IF NOT EXISTS idx_map_docs_title ON map_docs (title);
CREATE INDEX IF NOT EXISTS idx_map_docs_updated_at ON map_docs (updated_at);
CREATE INDEX IF NOT EXISTS idx_map_docs_city_id ON map_docs (city_id);
CREATE INDEX IF NOT EXISTS idx_map_docs_society_id ON map_docs (society_id);
CREATE INDEX IF NOT EXISTS idx_map_docs_phase_id ON map_docs (phase_id);
