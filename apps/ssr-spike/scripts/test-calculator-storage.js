import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { syntheticTaxonomy } from '../src/lib/taxonomy-fixtures.js'
import { taxonomySeedSql } from '../src/lib/taxonomy-repository.js'
import { createD1CalculatorRepository } from '../src/lib/calculator-repository.js'
import { prepareCalculatorCsvImport } from '../src/lib/calculator-import.js'
import { handleCalculatorConfig } from '../src/lib/calculator-api.js'
import { createCalculatorAdminApi } from '../src/lib/calculator-admin-api.js'

class LocalStatement {
  constructor(db, sql) { this.db=db; this.sql=sql; this.values=[] }
  bind(...values) { this.values=values; return this }
  all() { return { results:this.db.prepare(this.sql).all(...this.values) } }
  first() { return this.db.prepare(this.sql).get(...this.values) || null }
  run() { const result=this.db.prepare(this.sql).run(...this.values); return {meta:{changes:Number(result.changes),last_row_id:Number(result.lastInsertRowid)}} }
}
class LocalD1 {
  constructor(db) { this.db=db }
  prepare(sql) { return new LocalStatement(this.db,sql) }
  batch(statements) {
    this.db.exec('BEGIN')
    try { const results=statements.map((statement)=>statement.run()); this.db.exec('COMMIT'); return results }
    catch(error) { this.db.exec('ROLLBACK'); throw error }
  }
}

const sqlite=new DatabaseSync(':memory:')
sqlite.exec('PRAGMA foreign_keys=ON')
for (const name of ['0001_staging_admin_storage.sql','0002_staging_properties.sql','0003_staging_directories.sql','0004_schema_aligned_text_taxonomy.sql','0005_schema_aligned_properties.sql','0006_property_source_indexes.sql','0007_backfill_transitional_properties.sql','0008_backfill_files_to_properties.sql','0009_schema_aligned_calculator.sql','0010_schema_aligned_landing_sections.sql','0011_schema_aligned_queries.sql','0012_calculator_fee_rule_active.sql','0013_calculator_legacy_uniqueness.sql']) sqlite.exec(readFileSync(new URL(`../migrations/${name}`,import.meta.url),'utf8'))
sqlite.exec(taxonomySeedSql(syntheticTaxonomy))
const db=new LocalD1(sqlite), repo=createD1CalculatorRepository(db)
const auth={options:()=>new Response(null,{status:204}),requireAdmin:async()=>({})}
const admin=createCalculatorAdminApi(auth,repo)
const city=syntheticTaxonomy.cities.find((x)=>x.name==='Lahore'), society=syntheticTaxonomy.societies.find((x)=>x.name==='DHA Lahore')
sqlite.prepare('INSERT INTO calculator_phases (id,city_id,society_id,name) VALUES (9001,?,?,?)').run(city.id,society.id,'Sample Phase')
sqlite.prepare("INSERT INTO calculator_property_types (id,category,property_type,label) VALUES (9002,'Residential','Plot','Plot')").run()
sqlite.prepare("INSERT INTO calculator_fees (id,fee_key,fee_name,amount) VALUES (9003,'membership','Membership','150000.00')").run()
assert.equal(sqlite.prepare('SELECT is_active FROM calculator_fee_rules LIMIT 1').get(),undefined)
const activeDefault=await repo.insert('calculator-fee-rules',{fee_id:'9003',property_type:'Residential',unit:'marla',min_area:'0.00',max_area:null,fee_amount:'75000.00'})
assert.equal(activeDefault.is_active,true)
assert.equal(sqlite.prepare('SELECT fee_amount FROM calculator_fee_rules WHERE id=?').get(Number(activeDefault.id)).fee_amount,'75000.00')
const type=await repo.insert('calculator-property-types',{category:'Commercial',property_type:'Shop',label:'Shop',sort_order:1,is_active:true})
assert.ok(type.id)
const feeCreate=await admin(new Request('https://staging.invalid/api/v1/admin/calculator-fees',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fee_key:'synthetic_admin_fee',fee_name:'Synthetic Admin Fee',amount:1234.56,charge_unit:'transaction',is_active:true})}),'calculator-fees')
assert.equal(feeCreate.status,201)
const createdFee=(await feeCreate.json()).item
const feeUpdate=await admin(new Request('https://staging.invalid/api/v1/admin/calculator-fees/'+createdFee.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fee_name:'Updated Synthetic Fee',amount:2345.67,is_active:false})}),'calculator-fees',createdFee.id)
assert.equal(feeUpdate.status,200)
assert.equal((await feeUpdate.json()).item.fee_name,'Updated Synthetic Fee')
assert.equal((await admin(new Request('https://staging.invalid/api/v1/admin/calculator-fees/'+createdFee.id,{method:'DELETE'}),'calculator-fees',createdFee.id)).status,405)
const rate=await repo.insert('calculator-rates',{calculator_phase_id:'9001',calculator_block_id:null,calculator_property_type_id:'9002',dc_per_marla:'123456.75',dc_per_sqft:null,fbr_per_marla:'125000.00',fbr_per_sqft:null,is_active:true})
await assert.rejects(()=>repo.insert('calculator-rates',{calculator_phase_id:'9001',calculator_block_id:null,calculator_property_type_id:'9002',dc_per_marla:'3',dc_per_sqft:null,fbr_per_marla:'4',fbr_per_sqft:null,is_active:true}))
assert.equal(sqlite.prepare('SELECT dc_per_marla FROM calculator_rates WHERE id=?').get(Number(rate.id)).dc_per_marla,'123456.75')
assert.equal((await repo.find('calculator-rates',rate.id)).dc_per_marla,123456.75)
const preview=prepareCalculatorCsvImport('calculator-rates','City,Society,Phase,Block,Category,Property Type,Unit,DC Rate,FBR Rate,Active\nLahore,DHA Lahore,Import Phase,,Residential,Plot,Per Marla,123456789.12,130000.34,1',await repo.loadConfig())
assert.equal(preview.summary.valid_rows,1)
const excessRatePrecision=prepareCalculatorCsvImport('calculator-rates','City,Society,Phase,Block,Category,Property Type,Unit,DC Rate,FBR Rate,Active\nLahore,DHA Lahore,Import Phase,,Residential,Plot,Per Marla,1.234,2,1',await repo.loadConfig())
assert.equal(excessRatePrecision.summary.invalid_rows,1)
const imported=await repo.applyImport('calculator-rates',preview.validRows,await repo.loadConfig())
assert.equal(imported.inserted,1)
assert.equal(imported.created_phases,1)
assert.equal(sqlite.prepare("SELECT dc_per_marla FROM calculator_rates r JOIN calculator_phases p ON p.id=r.calculator_phase_id WHERE p.name='Import Phase'").get().dc_per_marla,'123456789.12')
async function uploadCsv(validateOnly) {
  const form=new FormData()
  form.append('file',new File(['City,Society,Phase,Block,Category,Property Type,Unit,DC Rate,FBR Rate,Active\nLahore,DHA Lahore,API Import Phase,API Import Block,Residential,Plot,Per Marla,222222.22,233333.33,1'],'calculator_rates.csv',{type:'text/csv'}))
  form.append('validate_only',validateOnly?'1':'0')
  return admin(new Request('https://staging.invalid/api/v1/admin/calculator-rates/import',{method:'POST',body:form}),'calculator-rates','import')
}
const importPreview=await uploadCsv(true)
assert.equal(importPreview.status,200)
assert.equal((await importPreview.json()).valid_rows,1)
const importApply=await uploadCsv(false)
assert.equal(importApply.status,200)
assert.equal((await importApply.json()).created_phases,1)
assert.equal(sqlite.prepare("SELECT dc_per_marla FROM calculator_rates r JOIN calculator_phases p ON p.id=r.calculator_phase_id WHERE p.name='API Import Phase'").get().dc_per_marla,'222222.22')
const before=sqlite.prepare('SELECT COUNT(*) n FROM calculator_rates').get().n
// A failing statement proves the D1 batch adapter rolls back a whole import.
assert.throws(()=>db.batch([db.prepare("INSERT INTO calculator_fees (fee_key,fee_name,amount) VALUES ('temporary','Temporary','1.00')"),db.prepare("INSERT INTO calculator_fees (fee_key,fee_name,amount) VALUES ('membership','Duplicate','1.00')")]))
assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM calculator_fees WHERE fee_key='temporary'").get().n,0)
assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM calculator_rates').get().n,before)

const publicResponse=await handleCalculatorConfig(new Request('https://staging.invalid/api/v1/calculator/config'),repo)
const publicConfig=await publicResponse.json()
assert.ok(publicConfig.calculator_rates.some((x)=>x.dc_per_marla===123456.75))
assert.ok(publicConfig.calculator_fee_rules.every((x)=>x.is_active))
await repo.update('calculator-fees','9003',{is_active:false})
const hidden=await (await handleCalculatorConfig(new Request('https://staging.invalid/api/v1/calculator/config'),repo)).json()
assert.equal(hidden.calculator_fee_rules.length,1,'legacy public config filters Fee Rules by their own active flag, not parent fee state')
assert.equal(await repo.remove('calculator-phases','9001'),true)
assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM calculator_rates WHERE calculator_phase_id=9001').get().n,0)
console.log('Calculator D1 CRUD, source decimals, import preview/apply atomicity, cascades, and Fee Rule active behavior passed.')
