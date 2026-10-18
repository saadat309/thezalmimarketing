-- SQLite/D1 translation of the eight calculator tables in the checked-in
-- MySQL schemas. DECIMAL source values use TEXT storage to preserve exact
-- decimal strings during import/export instead of SQLite floating-point casts.
CREATE TABLE IF NOT EXISTS calculator_phases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city_id INTEGER NOT NULL REFERENCES cities(id),
  society_id INTEGER NOT NULL REFERENCES societies(id),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (city_id, society_id, name)
);
CREATE INDEX IF NOT EXISTS idx_calculator_phases_city ON calculator_phases (city_id);
CREATE INDEX IF NOT EXISTS idx_calculator_phases_society ON calculator_phases (society_id);
CREATE INDEX IF NOT EXISTS idx_calculator_phases_active ON calculator_phases (is_active);

CREATE TABLE IF NOT EXISTS calculator_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  calculator_phase_id INTEGER NOT NULL REFERENCES calculator_phases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (calculator_phase_id, name)
);
CREATE INDEX IF NOT EXISTS idx_calculator_blocks_phase ON calculator_blocks (calculator_phase_id);
CREATE INDEX IF NOT EXISTS idx_calculator_blocks_active ON calculator_blocks (is_active);

CREATE TABLE IF NOT EXISTS calculator_property_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  property_type TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (category, property_type)
);
CREATE INDEX IF NOT EXISTS idx_calculator_property_types_active ON calculator_property_types (is_active);

CREATE TABLE IF NOT EXISTS calculator_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  calculator_phase_id INTEGER NOT NULL REFERENCES calculator_phases(id) ON DELETE CASCADE,
  calculator_block_id INTEGER REFERENCES calculator_blocks(id) ON DELETE CASCADE,
  calculator_property_type_id INTEGER NOT NULL REFERENCES calculator_property_types(id),
  dc_per_marla TEXT,
  dc_per_sqft TEXT,
  fbr_per_marla TEXT,
  fbr_per_sqft TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (calculator_phase_id, calculator_block_id, calculator_property_type_id)
);
CREATE INDEX IF NOT EXISTS idx_calculator_rates_phase ON calculator_rates (calculator_phase_id);
CREATE INDEX IF NOT EXISTS idx_calculator_rates_block ON calculator_rates (calculator_block_id);
CREATE INDEX IF NOT EXISTS idx_calculator_rates_property_type ON calculator_rates (calculator_property_type_id);
CREATE INDEX IF NOT EXISTS idx_calculator_rates_active ON calculator_rates (is_active);

CREATE TABLE IF NOT EXISTS calculator_transfer_fees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  calculator_phase_id INTEGER NOT NULL REFERENCES calculator_phases(id) ON DELETE CASCADE,
  calculator_block_id INTEGER REFERENCES calculator_blocks(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  reference_amount TEXT NOT NULL,
  reference_size TEXT NOT NULL,
  reference_unit TEXT NOT NULL CHECK (reference_unit IN ('marla', 'sqft')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (calculator_phase_id, calculator_block_id, category)
);
CREATE INDEX IF NOT EXISTS idx_calculator_transfer_fees_phase ON calculator_transfer_fees (calculator_phase_id);
CREATE INDEX IF NOT EXISTS idx_calculator_transfer_fees_block ON calculator_transfer_fees (calculator_block_id);
CREATE INDEX IF NOT EXISTS idx_calculator_transfer_fees_category ON calculator_transfer_fees (category);
CREATE INDEX IF NOT EXISTS idx_calculator_transfer_fees_active ON calculator_transfer_fees (is_active);

CREATE TABLE IF NOT EXISTS calculator_fees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fee_key TEXT NOT NULL UNIQUE,
  fee_name TEXT NOT NULL,
  amount TEXT NOT NULL,
  charge_unit TEXT NOT NULL DEFAULT 'transaction' CHECK (charge_unit IN ('transaction', 'property', 'owner')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_calculator_fees_active ON calculator_fees (is_active);

CREATE TABLE IF NOT EXISTS calculator_tax_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rate_key TEXT NOT NULL UNIQUE,
  rate_name TEXT NOT NULL,
  rate TEXT NOT NULL,
  rate_unit TEXT NOT NULL DEFAULT 'percent' CHECK (rate_unit = 'percent'),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_calculator_tax_rates_active ON calculator_tax_rates (is_active);

CREATE TABLE IF NOT EXISTS calculator_fee_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fee_id INTEGER NOT NULL REFERENCES calculator_fees(id) ON DELETE CASCADE,
  property_type TEXT NOT NULL CHECK (property_type IN ('Residential', 'Commercial')),
  unit TEXT NOT NULL CHECK (unit IN ('marla', 'kanal')),
  min_area TEXT NOT NULL DEFAULT '0.00',
  max_area TEXT,
  fee_amount TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_calculator_fee_rules_fee_id ON calculator_fee_rules (fee_id);
