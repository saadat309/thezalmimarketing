-- ============================================
-- MySQL Schema
-- ============================================

-- Core entity tables (reordered to avoid forward references)

-- 1. medias table (no dependencies)
CREATE TABLE medias (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  video VARCHAR(1024),
  version INT UNSIGNED NOT NULL DEFAULT 1,            -- optimistic lock
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  hide BOOLEAN NOT NULL DEFAULT FALSE,
);

-- 2. images table (depends on medias)
CREATE TABLE images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  media_id BIGINT UNSIGNED NOT NULL,
  path VARCHAR(1024) NOT NULL,
  thumb_path VARCHAR(1024) DEFAULT NULL,
  alt VARCHAR(255),
  caption VARCHAR(512),
  position INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  hide BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (media_id) REFERENCES medias(id) ON DELETE CASCADE
);

-- 3. detail_descriptions (no dependencies)
CREATE TABLE detail_descriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  heading VARCHAR(255) NOT NULL,
  text LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  hide BOOLEAN NOT NULL DEFAULT FALSE,
);

-- 4. map_docs (no dependencies)
CREATE TABLE map_docs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  map_pic VARCHAR(1024),
  map_thumb VARCHAR(1024),
  pdf VARCHAR(1024),
  embed_link TEXT,  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT idx_map_docs_fulltext (title, description),
  hide BOOLEAN NOT NULL DEFAULT FALSE,
);

-- 5. categories (no dependencies)
CREATE TABLE categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pic VARCHAR(1024),
  thumb VARCHAR(1024),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT idx_categories_fulltext (name),
  hide BOOLEAN NOT NULL DEFAULT FALSE,
);

-- 6. labels (no dependencies)
CREATE TABLE labels (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  is_badge BOOLEAN NOT NULL DEFAULT FALSE,
  is_filter BOOLEAN NOT NULL DEFAULT TRUE,
  badge_variant ENUM('default','secondary','destructive','outline','sale','rent','featured','new','hot','discounted'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT idx_labels_fulltext (name),
  hide BOOLEAN NOT NULL DEFAULT FALSE,
);

-- 7. cities (depends on map_docs)
CREATE TABLE cities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pic VARCHAR(1024),
  thumb VARCHAR(1024),
  map_id BIGINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (map_id) REFERENCES map_docs(id) ON DELETE SET NULL,
  FULLTEXT idx_cities_fulltext (name),
  hide BOOLEAN NOT NULL DEFAULT FALSE,
);

-- 8. societies (depends on map_docs)
CREATE TABLE societies (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pic VARCHAR(1024),
  thumb VARCHAR(1024),
  map_id BIGINT UNSIGNED,
  description TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (map_id) REFERENCES map_docs(id) ON DELETE SET NULL,
  FULLTEXT idx_societies_fulltext (name, description),
  hide BOOLEAN NOT NULL DEFAULT FALSE,
);

-- 9. phases (depends on map_docs)
CREATE TABLE phases (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pic VARCHAR(1024),
  thumb VARCHAR(1024),
  map_id BIGINT UNSIGNED,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (map_id) REFERENCES map_docs(id) ON DELETE SET NULL,
  FULLTEXT idx_phases_fulltext (name, description),
  hide BOOLEAN NOT NULL DEFAULT FALSE,
);

-- 10. properties (depends on medias, categories, cities, societies, phases)
CREATE TABLE properties (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  property_type ENUM('Residential','Commercial') NOT NULL DEFAULT 'Residential',
  is_file BOOLEAN DEFAULT FALSE,
  file_type ENUM('Allocation', 'Affidavit') NOT NULL DEFAULT 'Affidavit',
  purchase_type ENUM('sale','installment','rent') NOT NULL DEFAULT 'sale',
  is_furnished BOOLEAN NOT NULL DEFAULT TRUE,
  short_desc TEXT,
  address TEXT,
  features JSON,
  beds INT DEFAULT 0,
  baths INT DEFAULT 0,
  area BIGINT DEFAULT 0,
  unit ENUM('sqft','marla','kanal','hectare','acre','yard'),
  price_amount BIGINT DEFAULT 0,
  is_discounted BOOLEAN NOT NULL DEFAULT FALSE,
  price_original_amount BIGINT DEFAULT 0,
  price_period_unit ENUM('day','week','month','year') DEFAULT 'month',
  price_period_value INT DEFAULT 1,
  installment_advance_amount BIGINT DEFAULT 0,
  installment_total_period_text VARCHAR(255),
  installment_amount BIGINT DEFAULT 0,
  installment_display_mode ENUM('advance','installment') DEFAULT 'installment',
  media_id BIGINT UNSIGNED,
  category_id BIGINT UNSIGNED,
  city_id BIGINT UNSIGNED,
  society_id BIGINT UNSIGNED,
  phase_id BIGINT UNSIGNED,
  embed_link TEXT,
  hide BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (media_id) REFERENCES medias(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE SET NULL,
  FOREIGN KEY (phase_id) REFERENCES phases(id) ON DELETE SET NULL,
  FULLTEXT idx_properties_fulltext (title, short_desc),
  CONSTRAINT chk_beds CHECK (beds >= 0),
  CONSTRAINT chk_baths CHECK (baths >= 0),
  CONSTRAINT chk_area CHECK (area >= 0),
  CONSTRAINT chk_price CHECK (price_amount >= 0)
);

-- ============================================
-- Junction/Relationship Tables
-- ============================================

CREATE TABLE property_related_properties (
  property_id BIGINT UNSIGNED NOT NULL,
  related_property_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(property_id, related_property_id),
  FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY(related_property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE property_labels (
  property_id BIGINT UNSIGNED NOT NULL,
  label_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(property_id, label_id),
  FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY(label_id) REFERENCES labels(id) ON DELETE CASCADE
);

CREATE TABLE category_labels (
  category_id BIGINT UNSIGNED NOT NULL,
  label_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(category_id, label_id),
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY(label_id) REFERENCES labels(id) ON DELETE CASCADE
);

CREATE TABLE category_societies (
  category_id BIGINT UNSIGNED NOT NULL,
  society_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(category_id, society_id),
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE category_phases (
  category_id BIGINT UNSIGNED NOT NULL,
  phase_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(category_id, phase_id),
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY(phase_id) REFERENCES phases(id) ON DELETE CASCADE
);

CREATE TABLE category_cities (
  category_id BIGINT UNSIGNED NOT NULL,
  city_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(category_id, city_id),
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE CASCADE
);

CREATE TABLE society_labels (
  society_id BIGINT UNSIGNED NOT NULL,
  label_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(society_id, label_id),
  FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY(label_id) REFERENCES labels(id) ON DELETE CASCADE
);

CREATE TABLE phase_labels (
  phase_id BIGINT UNSIGNED NOT NULL,
  label_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(phase_id, label_id),
  FOREIGN KEY(phase_id) REFERENCES phases(id) ON DELETE CASCADE,
  FOREIGN KEY(label_id) REFERENCES labels(id) ON DELETE CASCADE
);

CREATE TABLE city_labels (
  city_id BIGINT UNSIGNED NOT NULL,
  label_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(city_id, label_id),
  FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE CASCADE,
  FOREIGN KEY(label_id) REFERENCES labels(id) ON DELETE CASCADE
);

CREATE TABLE city_societies (
  city_id BIGINT UNSIGNED NOT NULL,
  society_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(city_id, society_id),
  FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE CASCADE,
  FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE city_phases (
  city_id BIGINT UNSIGNED NOT NULL,
  phase_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(city_id, phase_id),
  FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE CASCADE,
  FOREIGN KEY(phase_id) REFERENCES phases(id) ON DELETE CASCADE
);

CREATE TABLE property_detail_descriptions (
  property_id BIGINT UNSIGNED NOT NULL,
  detail_description_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(property_id, detail_description_id),
  FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY(detail_description_id) REFERENCES detail_descriptions(id) ON DELETE CASCADE
);

CREATE TABLE map_doc_detail_descriptions (
  map_doc_id BIGINT UNSIGNED NOT NULL,
  detail_description_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(map_doc_id, detail_description_id),
  FOREIGN KEY(map_doc_id) REFERENCES map_docs(id) ON DELETE CASCADE,
  FOREIGN KEY(detail_description_id) REFERENCES detail_descriptions(id) ON DELETE CASCADE
);

CREATE TABLE society_detail_descriptions (
  society_id BIGINT UNSIGNED NOT NULL,
  detail_description_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(society_id, detail_description_id),
  FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY(detail_description_id) REFERENCES detail_descriptions(id) ON DELETE CASCADE
);

CREATE TABLE phase_detail_descriptions (
  phase_id BIGINT UNSIGNED NOT NULL,
  detail_description_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(phase_id, detail_description_id),
  FOREIGN KEY(phase_id) REFERENCES phases(id) ON DELETE CASCADE,
  FOREIGN KEY(detail_description_id) REFERENCES detail_descriptions(id) ON DELETE CASCADE
);

-- ============================================
-- Search Index Table
-- ============================================

CREATE TABLE search_indices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(32) NOT NULL,
  entity_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(512),
  body LONGTEXT,
  url VARCHAR(1024),
  score_boost FLOAT DEFAULT 1.0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_entity (entity_type, entity_id),
  FULLTEXT KEY idx_search (title, body)
);

-- ============================================
-- INDEXES (Optimized)
-- ============================================

-- properties filter/sort indexes (FK indexes removed as they're auto-created)
CREATE INDEX idx_properties_title ON properties(title);
CREATE INDEX idx_properties_price ON properties(price_amount);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_purchase ON properties(purchase_type);
CREATE INDEX idx_properties_created_at ON properties(created_at);
CREATE INDEX idx_properties_updated_at ON properties(updated_at);
CREATE INDEX idx_properties_is_furnished ON properties(is_furnished);
CREATE INDEX idx_properties_area ON properties(area);
CREATE INDEX idx_properties_unit ON properties(unit);

-- Composite indexes for common query patterns
CREATE INDEX idx_properties_active ON properties(deleted, hide);
CREATE INDEX idx_properties_type_city ON properties(property_type, city_id);
CREATE INDEX idx_properties_purchase_price ON properties(purchase_type, price_amount);
CREATE INDEX idx_properties_type_purchase ON properties(property_type, purchase_type);

-- map_docs filter/sort indexes
CREATE INDEX idx_map_docs_title ON map_docs(title);
CREATE INDEX idx_map_docs_created_at ON map_docs(created_at);
CREATE INDEX idx_map_docs_updated_at ON map_docs(updated_at);

-- cities filter/sort indexes
CREATE INDEX idx_cities_name ON cities(name);
CREATE INDEX idx_cities_created_at ON cities(created_at);
CREATE INDEX idx_cities_updated_at ON cities(updated_at);

-- categories filter/sort indexes
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_created_at ON categories(created_at);
CREATE INDEX idx_categories_updated_at ON categories(updated_at);

-- phases filter/sort indexes
CREATE INDEX idx_phases_name ON phases(name);
CREATE INDEX idx_phases_created_at ON phases(created_at);
CREATE INDEX idx_phases_updated_at ON phases(updated_at);

-- societies filter/sort indexes
CREATE INDEX idx_societies_name ON societies(name);
CREATE INDEX idx_societies_created_at ON societies(created_at);
CREATE INDEX idx_societies_updated_at ON societies(updated_at);

-- labels filter/sort indexes
CREATE INDEX idx_labels_name ON labels(name);
CREATE INDEX idx_labels_created_at ON labels(created_at);
CREATE INDEX idx_labels_updated_at ON labels(updated_at);

-- images position index for ordering
CREATE INDEX idx_images_media_id_position ON images(media_id, position);

-- Junction table reverse-lookups
CREATE INDEX idx_property_labels_label_id ON property_labels(label_id);
CREATE INDEX idx_property_detail_descriptions_detail_id ON property_detail_descriptions(detail_description_id);
CREATE INDEX idx_category_labels_label_id ON category_labels(label_id);
CREATE INDEX idx_phase_labels_label_id ON phase_labels(label_id);
CREATE INDEX idx_city_labels_label_id ON city_labels(label_id);
CREATE INDEX idx_society_labels_label_id ON society_labels(label_id);

-- search_indices table indexes
CREATE INDEX idx_search_indices_entity_type ON search_indices(entity_type);
CREATE INDEX idx_search_indices_updated_at ON search_indices(updated_at);

-- ============================================
-- Admin/User Management Tables
-- ============================================

-- 1) roles
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
);

INSERT INTO roles (name) VALUES
  ('admin'), ('ceo');

-- 2) users (staff/admin accounts)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(191) DEFAULT NULL,
  role_id INT NOT NULL,
  status ENUM('active','inActive','Blocked') DEFAULT 'inActive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  INDEX idx_users_role (role_id),
  INDEX idx_users_is_active (is_active),
  INDEX idx_users_is_blocked (is_blocked)
);

-- 3) invites
CREATE TABLE invites (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  token_hash CHAR(64) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  issued_by INT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(512) DEFAULT NULL,
  is_used TINYINT(1) DEFAULT 0,
  used_by_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  used_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (used_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_invites_email (email),
  INDEX idx_invites_expires_at (expires_at),
  INDEX idx_invites_is_used (is_used)
);

-- 4) refresh_tokens
CREATE TABLE refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL,
  user_agent VARCHAR(512) DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  is_revoked TINYINT(1) DEFAULT 0,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_tokens_user_id (user_id),
  INDEX idx_refresh_tokens_expires_at (expires_at),
  INDEX idx_refresh_tokens_is_revoked (is_revoked)
);

-- 5) password_resets
CREATE TABLE password_resets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  used_at TIMESTAMP NULL DEFAULT NULL,
  used_by_ip VARCHAR(45) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_password_resets_user_id (user_id),
  INDEX idx_password_resets_expires_at (expires_at),
  INDEX idx_password_resets_used_at (used_at)
);

-- 6) failed_logins
CREATE TABLE failed_logins (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  email VARCHAR(255) NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(512) DEFAULT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_failed_logins_user_id (user_id),
  INDEX idx_failed_logins_email (email),
  INDEX idx_failed_logins_attempted_at (attempted_at)
);

-- 7) queries (MOVED TO END - depends on properties and users)
CREATE TABLE queries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  property_id BIGINT UNSIGNED NULL,
  name VARCHAR(191) NOT NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(255) NULL,
  message TEXT NOT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(512) DEFAULT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_queries_property_id (property_id),
  INDEX idx_queries_email (email),
  INDEX idx_queries_phone (phone),
  INDEX idx_queries_created_at (created_at),
  INDEX idx_queries_is_read (is_read),
  INDEX idx_queries_is_read_created (is_read, created_at)
);


CREATE TABLE landing_sections (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255),
  subtitle TEXT,
  collection_type ENUM('properties','categories','maps','phases') NOT NULL,
  visibility TINYINT(1) NOT NULL DEFAULT 1,
  layout_style ENUM('grid','slider') DEFAULT 'grid',
  version INT UNSIGNED NOT NULL DEFAULT 1,            -- optimistic lock
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE landing_section_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  section_id BIGINT UNSIGNED NOT NULL,
  item_id BIGINT UNSIGNED NOT NULL,  
  item_order INT DEFAULT 0,
  UNIQUE KEY uq_section_item (section_id, item_id),
  FOREIGN KEY (section_id) REFERENCES landing_sections(id) ON DELETE CASCADE,
  INDEX idx_lsi_section_order (section_id, item_order)
);



-- ============================================
-- END OF SCHEMA
-- ============================================