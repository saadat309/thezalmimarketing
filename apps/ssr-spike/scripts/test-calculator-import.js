import assert from 'node:assert/strict'
import { createAdminAuth } from '../src/lib/admin-auth.js'
import { createAdminDataApi, createMemoryAdminRepository } from '../src/lib/admin-data.js'
import { syntheticCalculatorConfig } from '../src/lib/calculator-fixtures.js'
import { parseCsv, prepareCalculatorCsvImport, readBoundedCsvForm } from '../src/lib/calculator-import.js'

const environment = {
  STAGING_LOCAL_AUTH: 'enabled',
  STAGING_ADMIN_1_PASSWORD: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
  STAGING_ADMIN_2_PASSWORD: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
}
const auth = createAdminAuth(environment)
const api = createAdminDataApi(createMemoryAdminRepository(), auth)
const origin = 'http://127.0.0.1:4187'
const base = 'http://127.0.0.1:4175/api/v1/admin'
const login = await auth.login(new Request(`${base}/auth/login`, {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin.one@staging.invalid', password: environment.STAGING_ADMIN_1_PASSWORD }),
}))
const cookie = login.headers.get('Set-Cookie').split(';')[0]
const { csrfToken } = await login.json()
const readHeaders = { Origin: origin, Cookie: cookie }
const writeHeaders = { ...readHeaders, 'X-CSRF-Token': csrfToken }

const csvWithQuotedCell = parseCsv('City,Note\r\nLahore,"Phase, North"\r\n')
assert.equal(csvWithQuotedCell.rows[0].note, 'Phase, North')
assert.equal(parseCsv('City,Name\nLahore,"broken').error, 'malformed_csv')
assert.equal(prepareCalculatorCsvImport('calculator-rates', 'A,B\n').error, 'empty')
assert.equal(prepareCalculatorCsvImport('calculator-rates', `A,B\n${'x,y\n'.repeat(501)}`).error, 'too_many_rows')

const template = await api.item(new Request(`${base}/calculator-rates/template`, { headers: { ...readHeaders, Accept: 'text/csv' } }), 'calculator-rates', 'template')
assert.equal(template.status, 200)
assert.match(template.headers.get('content-type'), /text\/csv/)
assert.equal(template.headers.get('access-control-allow-origin'), origin)
assert.match(await template.text(), /DHA Lahore \(Synthetic\)/)
assert.equal((await api.item(new Request(`${base}/calculator-fees/template`, { headers: readHeaders }), 'calculator-fees', 'template')).status, 404)

async function importFile(domain, content, name = 'sample.csv', validateOnly = false, headers = writeHeaders) {
  const form = new FormData()
  form.append('file', new File([content], name, { type: 'text/csv' }))
  form.append('validate_only', validateOnly ? '1' : '0')
  return api.item(new Request(`${base}/${domain}/import`, { method: 'POST', headers, body: form }), domain, 'import')
}

const rateCsv = [
  'City,Society,Phase,Block,Category,Property Type,Unit,DC Rate,FBR Rate,Active',
  'Lahore,DHA Lahore (Synthetic),Imported Phase,Imported Block,Residential,Plot,Per Marla,500,600,1',
  'Lahore,DHA Lahore (Synthetic),Imported Phase,Imported Block,Residential,Plot,Per Marla,500,600,1',
].join('\n')
const validatedRates = await importFile('calculator-rates', rateCsv, 'rates.csv', true)
assert.equal(validatedRates.status, 200)
const rateSummary = await validatedRates.json()
assert.deepEqual(Object.keys(rateSummary).sort(), ['details', 'duplicate_rows', 'invalid_rows', 'total_rows', 'valid_rows'])
assert.deepEqual([rateSummary.total_rows, rateSummary.valid_rows, rateSummary.invalid_rows, rateSummary.duplicate_rows], [2, 1, 1, 1])
const rateImport = await importFile('calculator-rates', rateCsv, 'rates.csv')
assert.equal(rateImport.status, 200)
const rateImportResult = await rateImport.json()
assert.equal(rateImportResult.inserted, 1)
assert.equal(rateImportResult.created_phases, 1)
assert.equal(rateImportResult.created_blocks, 1)
const createdPhase = syntheticCalculatorConfig.calculator_phases.find((item) => item.name === 'Imported Phase')
const createdBlock = syntheticCalculatorConfig.calculator_blocks.find((item) => item.name === 'Imported Block')
assert.ok(createdPhase && createdBlock)
assert.equal(syntheticCalculatorConfig.calculator_rates.find((item) => item.calculator_block_id === createdBlock.id).dc_per_marla, 500)
const repeatedRateImport = await importFile('calculator-rates', rateCsv.split('\n').slice(0, 2).join('\n'), 'rates.csv')
assert.equal((await repeatedRateImport.json()).updated, 1)

const transferCsv = 'City,Society,Phase,Block,Category,Reference Size,Reference Unit,Reference Transfer Fee,Active\nLahore,DHA Lahore (Synthetic),Sample Phase,,Residential,5,Marla,42000,1\nLahore,DHA Lahore (Synthetic),Sample Phase,Missing Block,Commercial,5,Marla,95000,1'
const validatedTransfers = await importFile('calculator-transfer-fees', transferCsv, 'transfer.csv', true)
assert.equal(validatedTransfers.status, 200)
const transferSummary = await validatedTransfers.json()
assert.deepEqual([transferSummary.total_rows, transferSummary.valid_rows, transferSummary.invalid_rows], [2, 1, 1])
assert.match(transferSummary.details[1].errors.join(' '), /Block 'Missing Block' does not exist/)
const transferImport = await importFile('calculator-transfer-fees', transferCsv, 'transfer.csv')
assert.equal(transferImport.status, 200)
assert.equal((await transferImport.json()).updated, 1)
assert.equal(syntheticCalculatorConfig.calculator_transfer_fees.find((item) => item.id === 'transfer-demo-residential').reference_amount, 42000)

assert.equal((await importFile('calculator-rates', rateCsv, 'sample.txt', true)).status, 400)
assert.equal((await importFile('calculator-rates', rateCsv, 'sample.csv', true, { ...readHeaders })).status, 403)
const tooLargeRequest = new Request(`${base}/calculator-rates/import`, {
  method: 'POST', headers: { ...writeHeaders, 'Content-Type': 'multipart/form-data; boundary=csv-limit', 'Content-Length': '530000' }, body: '--csv-limit--\r\n',
})
const tooLarge = await api.item(tooLargeRequest, 'calculator-rates', 'import')
assert.equal(tooLarge.status, 413)
const streamedOversize = await readBoundedCsvForm(new Request(`${base}/calculator-rates/import`, {
  method: 'POST', headers: { 'Content-Type': 'multipart/form-data; boundary=csv-limit' }, body: new Uint8Array(530_000),
}))
assert.equal(streamedOversize.error, 'too_large')
const allInvalid = await importFile('calculator-rates', 'City,Society,Phase,Category,Property Type,Unit,DC Rate,FBR Rate\nUnknown,Unknown,Phase,Nope,Unknown,Marla,1,1', 'bad.csv')
assert.equal(allInvalid.status, 400)

console.log('Synthetic calculator CSV import checks passed.')
