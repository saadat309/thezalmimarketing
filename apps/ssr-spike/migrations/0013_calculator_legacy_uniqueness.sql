-- Mirror the legacy PHP duplicate checks for nullable scopes and case-insensitive keys.
CREATE UNIQUE INDEX IF NOT EXISTS uq_calculator_phases_scope_ci
  ON calculator_phases (city_id, society_id, lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS uq_calculator_blocks_phase_name_ci
  ON calculator_blocks (calculator_phase_id, lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS uq_calculator_rates_global_scope
  ON calculator_rates (calculator_phase_id, calculator_property_type_id)
  WHERE calculator_block_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_calculator_rates_block_scope
  ON calculator_rates (calculator_phase_id, calculator_block_id, calculator_property_type_id)
  WHERE calculator_block_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_calculator_transfer_fees_global_scope
  ON calculator_transfer_fees (calculator_phase_id, lower(category))
  WHERE calculator_block_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_calculator_transfer_fees_block_scope
  ON calculator_transfer_fees (calculator_phase_id, calculator_block_id, lower(category))
  WHERE calculator_block_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_calculator_fee_key_ci ON calculator_fees (lower(fee_key));
CREATE UNIQUE INDEX IF NOT EXISTS uq_calculator_tax_rate_key_ci ON calculator_tax_rates (lower(rate_key));
