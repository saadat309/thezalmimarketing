import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { taxonomySeedSql } from '../src/lib/taxonomy-repository.js'
import { syntheticTaxonomy } from '../src/lib/taxonomy-fixtures.js'

const database = new DatabaseSync(':memory:')
database.exec('PRAGMA foreign_keys = ON')
for (const migration of [
  '0001_staging_admin_storage.sql', '0002_staging_properties.sql', '0003_staging_directories.sql',
  '0004_schema_aligned_text_taxonomy.sql', '0005_schema_aligned_properties.sql',
  '0006_property_source_indexes.sql', '0009_schema_aligned_calculator.sql', '0012_calculator_fee_rule_active.sql', '0013_calculator_legacy_uniqueness.sql',
]) {
  if (migration === '0009_schema_aligned_calculator.sql') database.exec(taxonomySeedSql(syntheticTaxonomy))
  database.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), 'utf8'))
}

const tableColumns = (table) => new Set(database.prepare(`PRAGMA table_info(${table})`).all().map((column) => column.name))
const expected = {
  calculator_phases: ['id', 'city_id', 'society_id', 'name', 'sort_order', 'is_active', 'created_at', 'updated_at'],
  calculator_blocks: ['id', 'calculator_phase_id', 'name', 'sort_order', 'is_active', 'created_at', 'updated_at'],
  calculator_property_types: ['id', 'category', 'property_type', 'label', 'sort_order', 'is_active', 'created_at', 'updated_at'],
  calculator_rates: ['id', 'calculator_phase_id', 'calculator_block_id', 'calculator_property_type_id', 'dc_per_marla', 'dc_per_sqft', 'fbr_per_marla', 'fbr_per_sqft', 'is_active', 'created_at', 'updated_at'],
  calculator_transfer_fees: ['id', 'calculator_phase_id', 'calculator_block_id', 'category', 'reference_amount', 'reference_size', 'reference_unit', 'is_active', 'created_at', 'updated_at'],
  calculator_fees: ['id', 'fee_key', 'fee_name', 'amount', 'charge_unit', 'is_active', 'created_at', 'updated_at'],
  calculator_tax_rates: ['id', 'rate_key', 'rate_name', 'rate', 'rate_unit', 'is_active', 'created_at', 'updated_at'],
  calculator_fee_rules: ['id', 'fee_id', 'property_type', 'unit', 'min_area', 'max_area', 'fee_amount', 'is_active', 'created_at', 'updated_at'],
}
for (const [table, columns] of Object.entries(expected)) {
  const actual = tableColumns(table)
  for (const column of columns) assert.ok(actual.has(column), `${table}.${column} must match the source table`)
}

const cityId = database.prepare('SELECT id FROM cities ORDER BY id LIMIT 1').get().id
const societyId = database.prepare('SELECT id FROM societies ORDER BY id LIMIT 1').get().id
database.prepare(`INSERT INTO calculator_phases (id, city_id, society_id, name) VALUES (9001, ?, ?, 'Synthetic calculator phase')`).run(cityId, societyId)
database.prepare(`INSERT INTO calculator_blocks (id, calculator_phase_id, name) VALUES (9002, 9001, 'Synthetic calculator block')`).run()
database.prepare(`INSERT INTO calculator_property_types (id, category, property_type, label) VALUES (9003, 'Residential', 'Plot', 'Plot')`).run()
database.prepare(`INSERT INTO calculator_rates (id, calculator_phase_id, calculator_block_id, calculator_property_type_id, dc_per_marla, dc_per_sqft, fbr_per_marla, fbr_per_sqft) VALUES (9004, 9001, 9002, 9003, '123456789012345.67', '123456789012.3456', '99.90', '1.0001')`).run()
database.prepare(`INSERT INTO calculator_transfer_fees (id, calculator_phase_id, calculator_block_id, category, reference_amount, reference_size, reference_unit) VALUES (9005, 9001, 9002, 'Residential', '9876543210.99', '12.3400', 'marla')`).run()
database.prepare(`INSERT INTO calculator_fees (id, fee_key, fee_name, amount) VALUES (9006, 'synthetic-fee', 'Synthetic fee', '123456789012345.67')`).run()
database.prepare(`INSERT INTO calculator_tax_rates (id, rate_key, rate_name, rate) VALUES (9007, 'synthetic-rate', 'Synthetic rate', '12.3456')`).run()
database.prepare(`INSERT INTO calculator_fee_rules (id, fee_id, property_type, unit, min_area, max_area, fee_amount) VALUES (9008, 9006, 'Residential', 'marla', '0.10', NULL, '1234567890.12')`).run()
assert.equal(database.prepare('SELECT dc_per_marla FROM calculator_rates WHERE id = 9004').get().dc_per_marla, '123456789012345.67')
assert.equal(database.prepare('SELECT reference_amount FROM calculator_transfer_fees WHERE id = 9005').get().reference_amount, '9876543210.99')
assert.equal(database.prepare('SELECT amount FROM calculator_fees WHERE id = 9006').get().amount, '123456789012345.67')
assert.equal(database.prepare('SELECT rate FROM calculator_tax_rates WHERE id = 9007').get().rate, '12.3456')
assert.equal(database.prepare('SELECT fee_amount FROM calculator_fee_rules WHERE id = 9008').get().fee_amount, '1234567890.12')

database.prepare('DELETE FROM calculator_fees WHERE id = 9006').run()
assert.equal(database.prepare('SELECT COUNT(*) AS count FROM calculator_fee_rules WHERE fee_id = 9006').get().count, 0)
database.prepare('DELETE FROM calculator_phases WHERE id = 9001').run()
assert.equal(database.prepare('SELECT COUNT(*) AS count FROM calculator_blocks WHERE id = 9002').get().count, 0)
assert.equal(database.prepare('SELECT COUNT(*) AS count FROM calculator_rates WHERE id = 9004').get().count, 0)
assert.equal(database.prepare('SELECT COUNT(*) AS count FROM calculator_transfer_fees WHERE id = 9005').get().count, 0)

console.log('Synthetic Calculator source-schema and decimal-preservation checks passed.')
