import { execFileSync } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { syntheticCalculatorConfig as c } from '../src/lib/calculator-fixtures.js'
import { syntheticTaxonomy } from '../src/lib/taxonomy-fixtures.js'

const app = fileURLToPath(new URL('../', import.meta.url))
const cli = fileURLToPath(import.meta.resolve('wrangler'))
const sqlFile = new URL('../.wrangler/generated-calculator-seed.sql', import.meta.url)
const q = (x) => x == null ? 'NULL' : `'${String(x).replaceAll("'", "''")}'`
const phaseId = 9301
const cityId = syntheticTaxonomy.cities.find((x) => x.name === 'Lahore')?.id
const societyId = syntheticTaxonomy.societies.find((x) => x.name === 'DHA Lahore')?.id
if (!cityId || !societyId) throw new Error('Synthetic Lahore taxonomy fixture is unavailable.')
const statements = [`INSERT OR IGNORE INTO calculator_phases (id,city_id,society_id,name,sort_order,is_active) VALUES (${phaseId},${cityId},${societyId},'Sample Phase',0,1);`]
const blocks = new Map(c.calculator_blocks.map((x, i) => [x.id, 9310 + i]))
const types = new Map(c.calculator_property_types.map((x, i) => [x.id, 9320 + i]))
const fees = new Map(c.calculator_fees.map((x, i) => [x.id, 9400 + i]))
for (const [old, id] of blocks) { const x = c.calculator_blocks.find((a) => a.id === old); statements.push(`INSERT OR IGNORE INTO calculator_blocks (id,calculator_phase_id,name,sort_order,is_active) VALUES (${id},${phaseId},${q(x.name)},${x.sort_order},1);`) }
for (const [old, id] of types) { const x = c.calculator_property_types.find((a) => a.id === old); statements.push(`INSERT OR IGNORE INTO calculator_property_types (id,category,property_type,label,sort_order,is_active) VALUES (${id},${q(x.category)},${q(x.property_type)},${q(x.label)},${x.sort_order},1);`) }
for (const [old, id] of fees) { const x = c.calculator_fees.find((a) => a.id === old); statements.push(`INSERT OR IGNORE INTO calculator_fees (id,fee_key,fee_name,amount,charge_unit,is_active) VALUES (${id},${q(x.fee_key)},${q(x.fee_name)},${q(x.amount)},${q(x.charge_unit)},1);`) }
c.calculator_rates.forEach((x, i) => {
  const sqft = Number(x.dc_per_sqft) !== 0 || Number(x.fbr_per_sqft) !== 0
  statements.push(`INSERT OR IGNORE INTO calculator_rates (id,calculator_phase_id,calculator_block_id,calculator_property_type_id,dc_per_marla,dc_per_sqft,fbr_per_marla,fbr_per_sqft,is_active) VALUES (${9500+i},${phaseId},${blocks.get(x.calculator_block_id) ?? 'NULL'},${types.get(x.calculator_property_type_id)},${q(sqft ? null : x.dc_per_marla)},${q(sqft ? x.dc_per_sqft : null)},${q(sqft ? null : x.fbr_per_marla)},${q(sqft ? x.fbr_per_sqft : null)},1);`)
})
c.calculator_transfer_fees.forEach((x, i) => statements.push(`INSERT OR IGNORE INTO calculator_transfer_fees (id,calculator_phase_id,calculator_block_id,category,reference_amount,reference_size,reference_unit,is_active) VALUES (${9600+i},${phaseId},${blocks.get(x.calculator_block_id) ?? 'NULL'},${q(x.category)},${q(x.reference_amount)},${q(x.reference_size)},${q(x.reference_unit)},1);`))
c.calculator_tax_rates.forEach((x, i) => statements.push(`INSERT OR IGNORE INTO calculator_tax_rates (id,rate_key,rate_name,rate,rate_unit,is_active) VALUES (${9700+i},${q(x.rate_key)},${q(x.rate_name)},${q(x.rate)},'percent',1);`))
c.calculator_fee_rules.forEach((x, i) => statements.push(`INSERT OR IGNORE INTO calculator_fee_rules (id,fee_id,property_type,unit,min_area,max_area,fee_amount,is_active) VALUES (${9800+i},${fees.get(x.fee_id)},${q(x.property_type)},${q(x.unit)},${q(x.min_area)},${q(x.max_area)},${q(x.fee_amount)},1);`))
await mkdir(new URL('../.wrangler/', import.meta.url), { recursive: true })
await writeFile(sqlFile, statements.join('\n'), 'utf8')
try { execFileSync(process.execPath, [cli,'d1','execute','zalmi-staging-local','--local','--file',fileURLToPath(sqlFile)], { cwd:app, env:{...process.env,XDG_CONFIG_HOME:fileURLToPath(new URL('../.wrangler-local-config/', import.meta.url))}, stdio:['ignore','ignore','inherit'] }) }
finally { await rm(sqlFile,{force:true}) }
console.log('Seeded deterministic fictional Calculator values into local D1 only.')
