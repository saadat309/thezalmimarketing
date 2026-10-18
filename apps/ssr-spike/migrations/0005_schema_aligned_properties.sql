-- SQLite/D1 translation of source text content for properties.
-- The legacy media tables and binary assets are intentionally not migrated.
CREATE TABLE IF NOT EXISTS detail_descriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  hide INTEGER NOT NULL DEFAULT 0 CHECK (hide IN (0, 1))
);

CREATE TABLE IF NOT EXISTS labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  is_badge INTEGER NOT NULL DEFAULT 0 CHECK (is_badge IN (0, 1)),
  is_filter INTEGER NOT NULL DEFAULT 1 CHECK (is_filter IN (0, 1)),
  badge_variant TEXT CHECK (badge_variant IN ('default', 'secondary', 'destructive', 'outline', 'sale', 'rent', 'featured', 'new', 'hot', 'discounted')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  hide INTEGER NOT NULL DEFAULT 0 CHECK (hide IN (0, 1)),
  slug TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_labels_name ON labels (name);

CREATE TABLE IF NOT EXISTS properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'Residential' CHECK (property_type IN ('Residential', 'Commercial')),
  is_file INTEGER DEFAULT 0 CHECK (is_file IS NULL OR is_file IN (0, 1)),
  file_type TEXT NOT NULL DEFAULT 'Affidavit' CHECK (file_type IN ('Allocation', 'Affidavit')),
  purchase_type TEXT NOT NULL DEFAULT 'sale' CHECK (purchase_type IN ('sale', 'installment', 'rent')),
  is_furnished INTEGER NOT NULL DEFAULT 1 CHECK (is_furnished IN (0, 1)),
  short_desc TEXT,
  address TEXT,
  features TEXT,
  beds INTEGER DEFAULT 0 CHECK (beds IS NULL OR beds >= 0),
  baths INTEGER DEFAULT 0 CHECK (baths IS NULL OR baths >= 0),
  area INTEGER DEFAULT 0 CHECK (area IS NULL OR area >= 0),
  unit TEXT CHECK (unit IS NULL OR unit IN ('sqft', 'marla', 'kanal', 'hectare', 'acre', 'yard')),
  price_amount INTEGER DEFAULT 0 CHECK (price_amount IS NULL OR price_amount >= 0),
  is_discounted INTEGER NOT NULL DEFAULT 0 CHECK (is_discounted IN (0, 1)),
  price_original_amount INTEGER DEFAULT 0,
  price_period_unit TEXT DEFAULT 'month' CHECK (price_period_unit IS NULL OR price_period_unit IN ('day', 'week', 'month', 'year')),
  price_period_value INTEGER DEFAULT 1,
  installment_advance_amount INTEGER DEFAULT 0,
  installment_total_period_text TEXT,
  installment_amount INTEGER DEFAULT 0,
  installment_display_mode TEXT DEFAULT 'installment' CHECK (installment_display_mode IS NULL OR installment_display_mode IN ('advance', 'installment')),
  media_id INTEGER,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
  society_id INTEGER REFERENCES societies(id) ON DELETE SET NULL,
  phase_id INTEGER REFERENCES phases(id) ON DELETE SET NULL,
  embed_link TEXT,
  hide INTEGER NOT NULL DEFAULT 0 CHECK (hide IN (0, 1)),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  detail_description_id INTEGER REFERENCES detail_descriptions(id) ON DELETE SET NULL,
  slug TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_properties_title ON properties (title);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties (price_amount);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties (property_type);
CREATE INDEX IF NOT EXISTS idx_properties_purchase ON properties (purchase_type);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties (created_at);
CREATE INDEX IF NOT EXISTS idx_properties_updated_at ON properties (updated_at);
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties (hide);
CREATE INDEX IF NOT EXISTS idx_properties_type_city ON properties (property_type, city_id);
CREATE INDEX IF NOT EXISTS idx_properties_purchase_price ON properties (purchase_type, price_amount);
CREATE INDEX IF NOT EXISTS idx_properties_detail_description ON properties (detail_description_id);

CREATE TABLE IF NOT EXISTS property_labels (
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  label_id INTEGER NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (property_id, label_id)
);
CREATE INDEX IF NOT EXISTS idx_pl_property_position ON property_labels (property_id, position);

CREATE TABLE IF NOT EXISTS property_related_properties (
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  related_property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (property_id, related_property_id),
  CHECK (property_id != related_property_id)
);
CREATE INDEX IF NOT EXISTS idx_prp_property_position ON property_related_properties (property_id, position);
