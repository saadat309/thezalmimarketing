CREATE TABLE IF NOT EXISTS landing_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  collection_type TEXT NOT NULL,
  visibility INTEGER NOT NULL DEFAULT 1 CHECK (visibility IN (0, 1)),
  video_input_method TEXT CHECK (video_input_method IN ('upload', 'embed') OR video_input_method IS NULL),
  video_path TEXT,
  video_embed_link TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  media_path TEXT,
  media_type TEXT,
  delay_ms INTEGER DEFAULT 5000
);

CREATE INDEX IF NOT EXISTS landing_sections_visibility_idx ON landing_sections (visibility, id);

CREATE TABLE IF NOT EXISTS landing_section_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  item_order INTEGER DEFAULT 0,
  UNIQUE (section_id, item_id),
  FOREIGN KEY (section_id) REFERENCES landing_sections (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS landing_section_items_order_idx ON landing_section_items (section_id, item_order);

INSERT OR IGNORE INTO landing_sections
  (id, slug, title, subtitle, collection_type, visibility, video_input_method, video_embed_link, version, delay_ms)
VALUES
  (1, 'landing-popup', 'Special Offer', 'Discover our latest synthetic listings.', 'popup', 0, NULL, NULL, 1, 5000),
  (2, 'video-section', 'Featured Video', 'Watch our latest property showcase.', 'video', 1, 'embed', NULL, 1, 5000),
  (3, 'featured-properties', 'Featured Properties', 'Discover our hand-picked selection of properties.', 'properties', 1, NULL, NULL, 1, 5000),
  (4, 'property-categories', 'Property Categories', 'Explore properties by type.', 'categories', 1, NULL, NULL, 1, 5000),
  (5, 'location-maps', 'Location Maps', 'Find properties in prime locations.', 'maps', 1, NULL, NULL, 1, 5000),
  (6, 'available-files', 'Available Files', 'Explore available property files.', 'files', 0, NULL, NULL, 1, 5000);

INSERT OR IGNORE INTO landing_section_items (section_id, item_id, item_order) VALUES (3, 1, 0), (4, 1, 0);
