-- The complete checked-in source schema and legacy API include this column.
ALTER TABLE calculator_fee_rules
  ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1));
CREATE INDEX IF NOT EXISTS idx_calculator_fee_rules_active ON calculator_fee_rules (is_active);
