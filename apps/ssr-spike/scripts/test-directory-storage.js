import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { createAdminAuth } from '../src/lib/admin-auth.js'
import { createAdminDataApi, createMemoryAdminRepository } from '../src/lib/admin-data.js'
import { createMemoryAdminStorage } from '../src/lib/admin-storage.js'
import { createDirectoryApi } from '../src/lib/directory-api.js'
import { createD1DirectoryRepository, directorySeedSql } from '../src/lib/directory-repository.js'
import { createD1TaxonomyRepository, taxonomySeedSql } from '../src/lib/taxonomy-repository.js'
import { createD1LandingRepository } from '../src/lib/landing-repository.js'
import { createD1QueryRepository, syntheticQuerySeedSql } from '../src/lib/query-repository.js'
import { syntheticFiles } from '../src/lib/directory-fixtures.js'
import { syntheticTaxonomy } from '../src/lib/taxonomy-fixtures.js'

class LocalD1Statement {
  constructor(database, sql, values = []) { this.database = database; this.sql = sql; this.values = values }
  bind(...values) { return new LocalD1Statement(this.database, this.sql, values) }
  async run() {
    const result = this.database.prepare(this.sql).run(...this.values)
    return { success: true, meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } }
  }
  async first() { return this.database.prepare(this.sql).get(...this.values) ?? null }
  async all() { return { results: this.database.prepare(this.sql).all(...this.values) } }
}

class LocalD1Database {
  constructor() { this.sqlite = new DatabaseSync(':memory:') }
  prepare(sql) { return new LocalD1Statement(this.sqlite, sql) }
  async batch(statements) {
    this.sqlite.exec('BEGIN')
    try {
      const results = []
      for (const statement of statements) results.push(await statement.run())
      this.sqlite.exec('COMMIT')
      return results
    } catch (error) {
      this.sqlite.exec('ROLLBACK')
      throw error
    }
  }
}

const database = new LocalD1Database()
for (const migration of ['0001_staging_admin_storage.sql', '0002_staging_properties.sql', '0003_staging_directories.sql', '0004_schema_aligned_text_taxonomy.sql', '0005_schema_aligned_properties.sql', '0006_property_source_indexes.sql']) {
  database.sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), 'utf8'))
}
database.sqlite.exec('PRAGMA foreign_keys = ON')
database.sqlite.exec(taxonomySeedSql(syntheticTaxonomy))
database.sqlite.exec(directorySeedSql(syntheticFiles.map((record) => ({ kind: 'files', record }))))
database.sqlite.exec(readFileSync(new URL('../migrations/0008_backfill_files_to_properties.sql', import.meta.url), 'utf8'))
database.sqlite.exec(readFileSync(new URL('../migrations/0010_schema_aligned_landing_sections.sql', import.meta.url), 'utf8'))
database.sqlite.exec(readFileSync(new URL('../migrations/0011_schema_aligned_queries.sql', import.meta.url), 'utf8'))
database.sqlite.exec(syntheticQuerySeedSql)
const cityColumns = new Set(database.sqlite.prepare('PRAGMA table_info(cities)').all().map((column) => column.name))
for (const column of ['id', 'name', 'pic', 'thumb', 'created_at', 'updated_at', 'hide', 'slug']) assert.ok(cityColumns.has(column))
database.sqlite.prepare('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)').run(41, 'Imported Synthetic Category', 'imported-synthetic-category')
assert.equal(database.sqlite.prepare('SELECT id FROM categories WHERE slug = ?').get('imported-synthetic-category').id, 41)

const directoryRepository = createD1DirectoryRepository(database)
const mapsApi = createDirectoryApi(directoryRepository, 'maps')
const filesApi = createDirectoryApi(directoryRepository, 'files')
const request = (url, options = {}) => new Request(url.startsWith('http') ? url : `https://stage.invalid${url}`, options)

let response = await mapsApi.list(request('/api/v1/maps/?city=multan'))
assert.equal(response.status, 200)
let mapPayload = await response.json()
assert.deepEqual(mapPayload.items.map((item) => item.slug), ['dha-multan-sector-map'])
assert.ok(mapPayload.filters.cities.some((item) => item.slug === 'lahore' && item.name === 'Lahore'))
response = await mapsApi.list(request('/api/v1/maps/?query=phase%206'))
assert.equal(response.status, 200)
assert.deepEqual((await response.json()).items.map((item) => item.slug), ['dha-lahore-phase-6-master-plan'])
response = await filesApi.list(request('/api/v1/files/?file_type=Affidavit'))
assert.equal(response.status, 200)
const affidavit = (await response.json()).items
assert.deepEqual(affidavit.map((item) => item.slug), ['bahria-town-lahore-affidavit-file'])
assert.equal(affidavit[0].price.currency, 'PKR')
assert.equal(JSON.stringify(affidavit).includes('record_json'), false)
assert.equal(JSON.stringify(affidavit).includes('sourceId'), false)
assert.equal(JSON.stringify(affidavit).includes('public'), false)
assert.equal(database.sqlite.prepare('SELECT COUNT(*) AS count FROM staging_directories WHERE kind = \'files\'').get().count, syntheticFiles.length)
assert.equal(database.sqlite.prepare('SELECT COUNT(*) AS count FROM properties WHERE is_file = 1').get().count, syntheticFiles.length)
assert.equal(database.sqlite.prepare('SELECT COUNT(*) AS count FROM properties WHERE is_file = 1 AND slug IN (SELECT json_extract(record_json, \'$.slug\') FROM staging_directories WHERE kind = \'files\')').get().count, syntheticFiles.length)
assert.ok(new Set(database.sqlite.prepare('PRAGMA table_info(properties)').all().map((column) => column.name)).has('is_file'))

const environment = {
  STAGING_LOCAL_AUTH: 'enabled',
  STAGING_ADMIN_1_PASSWORD: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
  STAGING_ADMIN_2_PASSWORD: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
}
const auth = createAdminAuth(environment, createMemoryAdminStorage())
const taxonomyRepository = createD1TaxonomyRepository(database)
const landingRepository = createD1LandingRepository(database)
const queryRepository = createD1QueryRepository(database)
const api = createAdminDataApi(createMemoryAdminRepository(), auth, createMemoryAdminStorage(), null, directoryRepository, taxonomyRepository, landingRepository, queryRepository)
const base = 'http://127.0.0.1:4175/api/v1/admin'
const origin = 'http://127.0.0.1:4182'
assert.equal((await api.collection(request(`${base}/maps`), 'maps')).status, 401)
const login = await auth.login(request(`${base}/auth/login`, {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin.one@staging.invalid', password: environment.STAGING_ADMIN_1_PASSWORD }),
}))
assert.equal(login.status, 200)
const loginBody = await login.json()
const cookie = login.headers.get('Set-Cookie').split(';')[0]
const writeHeaders = { Origin: origin, Cookie: cookie, 'X-CSRF-Token': loginBody.csrfToken, 'Content-Type': 'application/json' }

const landingResponse = await api.collection(request(`${base}/landing-page`, { headers: { Origin: origin, Cookie: cookie } }), 'landing-page')
assert.equal(landingResponse.status, 200)
const landingPayload = await landingResponse.json()
assert.deepEqual(landingPayload.items.map((section) => section.id), ['1', '2', '3', '4', '5', '6'])
assert.equal(landingPayload.items[2].sectionName, 'Featured Properties')
assert.deepEqual(landingPayload.items[2].selectedItems, ['1'])
assert.deepEqual(landingPayload.items[3].selectedItems, ['1'])
const adminMaps = await api.collection(request(`${base}/maps`, { headers: { Origin: origin, Cookie: cookie } }), 'maps')
const adminFiles = await api.collection(request(`${base}/files`, { headers: { Origin: origin, Cookie: cookie } }), 'files')
const adminMapItems = (await adminMaps.json()).items
const adminFileItems = (await adminFiles.json()).items
assert.ok(adminMapItems.every((item) => Number.isSafeInteger(item.source_id)))
assert.ok(adminFileItems.every((item) => Number.isSafeInteger(item.source_id)))
const fixedLandingFields = { title: 'Synthetic Featured Homes', subtitle: 'Fresh synthetic copy.', active: false, selectedItems: ['57', '1'], mediaUrl: '', delayMs: 7500 }
const updatedLanding = await api.item(request(`${base}/landing-page/3`, { method: 'PATCH', headers: writeHeaders, body: JSON.stringify(fixedLandingFields) }), 'landing-page', '3')
assert.equal(updatedLanding.status, 200)
const landingRecord = (await updatedLanding.json()).item
assert.equal(landingRecord.order, 3)
assert.equal(landingRecord.title, 'Synthetic Featured Homes')
assert.equal(landingRecord.active, false)
assert.deepEqual(landingRecord.selectedItems, ['57', '1'])
assert.equal(database.sqlite.prepare('SELECT COUNT(*) AS count FROM landing_section_items WHERE section_id = 3').get().count, 2)
assert.equal(database.sqlite.prepare('SELECT title FROM landing_sections WHERE id = 3').get().title, 'Synthetic Featured Homes')
assert.equal((await landingRepository.listPublic()).some((section) => section.slug === 'featured-properties'), false)
const reorderedLanding = await api.item(request(`${base}/landing-page/3`, { method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ selectedItems: ['1', '57'] }) }), 'landing-page', '3')
assert.deepEqual((await reorderedLanding.json()).item.selectedItems, ['1', '57'])
assert.deepEqual(await landingRepository.find('3').then((item) => item.selectedItems), ['1', '57'])
const mapSelection = await api.item(request(`${base}/landing-page/5`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ selectedItems: [String(adminMapItems[0].source_id)] }),
}), 'landing-page', '5')
assert.equal(mapSelection.status, 200)
assert.deepEqual((await mapSelection.json()).item.selectedItems, [String(adminMapItems[0].source_id)])
const fileSelection = await api.item(request(`${base}/landing-page/6`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ selectedItems: [String(adminFileItems[0].source_id)] }),
}), 'landing-page', '6')
assert.equal(fileSelection.status, 200)
assert.deepEqual((await fileSelection.json()).item.selectedItems, [String(adminFileItems[0].source_id)])
assert.equal((await landingRepository.listPublic()).some((section) => section.slug === 'available-files'), false)

const queriesBefore = await api.collection(request(`${base}/queries`, { headers: { Origin: origin, Cookie: cookie } }), 'queries')
assert.equal(queriesBefore.status, 200)
assert.equal((await queriesBefore.json()).count, 2)
assert.equal(database.sqlite.prepare('SELECT COUNT(*) AS count FROM queries WHERE ip_address IS NOT NULL OR user_agent IS NOT NULL OR processed_by IS NOT NULL').get().count, 0)
const createdQueryResponse = await api.collection(request(`${base}/queries`, { method: 'POST', headers: writeHeaders, body: JSON.stringify({ name: 'Synthetic API Visitor', email: 'api@example.invalid', phone: '+92 300 0000002', message: 'Synthetic-only staging record.', is_read: false }) }), 'queries')
assert.equal(createdQueryResponse.status, 201)
const createdQuery = (await createdQueryResponse.json()).item
assert.ok(/^\d+$/.test(createdQuery.id))
assert.equal(database.sqlite.prepare('SELECT ip_address FROM queries WHERE id = ?').get(Number(createdQuery.id)).ip_address, null)
const readQuery = await api.item(request(`${base}/queries/${createdQuery.id}`, { method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ is_read: true }) }), 'queries', createdQuery.id)
assert.equal((await readQuery.json()).item.is_read, true)
assert.equal((await createD1QueryRepository(database).find(createdQuery.id)).is_read, true)
assert.equal((await api.item(request(`${base}/queries/${createdQuery.id}`, { method: 'DELETE', headers: writeHeaders }), 'queries', createdQuery.id)).status, 200)
assert.equal(await queryRepository.find(createdQuery.id), null)
const rejectedLandingStructure = await api.item(request(`${base}/landing-page/3`, { method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ order: 1 }) }), 'landing-page', '3')
assert.equal(rejectedLandingStructure.status, 400)
const rejectedLandingCreate = await api.collection(request(`${base}/landing-page`, { method: 'POST', headers: writeHeaders, body: '{}' }), 'landing-page')
assert.equal(rejectedLandingCreate.status, 405)
const rejectedNonNumericSelection = await api.item(request(`${base}/landing-page/3`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ selectedItems: ['not-a-source-id'] }),
}), 'landing-page', '3')
assert.equal(rejectedNonNumericSelection.status, 400)

const cityCollection = await api.collection(request(`${base}/cities`, { headers: { Origin: origin, Cookie: cookie } }), 'cities')
assert.equal(cityCollection.status, 200)
const cityPayload = await cityCollection.json()
assert.equal(cityPayload.items.length, 3)
assert.equal(cityPayload.items[0].id, 1)
assert.ok(cityPayload.items[0].map_ids.includes('dha-lahore-phase-6-master-plan'))
assert.equal(database.sqlite.prepare('SELECT slug FROM cities WHERE id = ?').get(1).slug, 'lahore')
assert.equal(cityPayload.options.map_ids.length, 4)
const cityCreateConflict = await api.collection(request(`${base}/cities`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ name: 'Another Lahore', map_ids: ['dha-lahore-phase-6-master-plan'] }),
}), 'cities')
assert.equal(cityCreateConflict.status, 400)
const newCityResponse = await api.collection(request(`${base}/cities`, {
  method: 'POST', headers: writeHeaders, body: JSON.stringify({ name: 'Synthetic New City', map_ids: [] }),
}), 'cities')
assert.equal(newCityResponse.status, 201)
const newCity = (await newCityResponse.json()).item
assert.equal(newCity.id, 4)
const unassignFromLahore = await api.item(request(`${base}/cities/1`, {
  method: 'PATCH', headers: writeHeaders,
  body: JSON.stringify({ name: 'Lahore', map_ids: cityPayload.items[0].map_ids.filter((slug) => slug !== 'dha-lahore-phase-6-master-plan') }),
}), 'cities', '1')
assert.equal(unassignFromLahore.status, 200)
const assignMap = await api.item(request(`${base}/cities/${newCity.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ name: newCity.name, map_ids: ['dha-lahore-phase-6-master-plan'] }),
}), 'cities', String(newCity.id))
assert.equal(assignMap.status, 200)
assert.equal((await directoryRepository.find('maps', 'dha-lahore-phase-6-master-plan')).city, 'synthetic-new-city')
assert.equal((await api.item(request(`${base}/cities/${newCity.id}`, { method: 'DELETE', headers: writeHeaders }), 'cities', String(newCity.id))).status, 200)
assert.equal((await directoryRepository.find('maps', 'dha-lahore-phase-6-master-plan')).city, '')

const mapInput = { title: 'D1 Synthetic Admin Map', city_id: 'lahore', society_id: 'dha-lahore', phase_id: 'phase-6', description: 'Stored in local D1', embed_link: '', hide: false }
const createMap = await api.collection(request(`${base}/maps`, { method: 'POST', headers: writeHeaders, body: JSON.stringify(mapInput) }), 'maps')
assert.equal(createMap.status, 201)
const map = (await createMap.json()).item
assert.equal(map.id, 'd1-synthetic-admin-map')
assert.equal((await directoryRepository.find('maps', map.id)).description, 'Stored in local D1')
assert.ok((await (await mapsApi.list(request('/api/v1/maps/'))).json()).items.some((item) => item.slug === map.id))

const patchMap = await api.item(request(`${base}/maps/${map.id}`, { method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ city_id: '', hide: true }) }), 'maps', map.id)
assert.equal(patchMap.status, 200)
assert.equal((await directoryRepository.find('maps', map.id)).cityName, '')
assert.ok(!(await (await mapsApi.list(request('/api/v1/maps/'))).json()).items.some((item) => item.slug === map.id))

const fileInput = {
  title: 'D1 Synthetic Admin File', short_desc: 'Synthetic listing', address: 'Sample Road', property_type: 'Residential',
  file_type: 'Allocation', purchase_type: 'installment', area: 5, unit: 'marla', price_amount: 8500000,
  is_discounted: true, price_original_amount: 9000000, price_period_unit: 'month', price_period_value: 1,
  installment_amount: 100000, installment_total_period_text: '3 years', installment_advance_amount: 2000000,
  installment_display_mode: 'installment', city_id: 'lahore', society_id: 'dha-lahore', phase_id: 'phase-7',
  embed_link: '', labels: ['featured'], hide: false,
}
const createFile = await api.collection(request(`${base}/files`, { method: 'POST', headers: writeHeaders, body: JSON.stringify(fileInput) }), 'files')
assert.equal(createFile.status, 201)
const file = (await createFile.json()).item
assert.equal((await directoryRepository.find('files', file.id)).price.amount, '8500000')
assert.ok((await (await filesApi.list(request('/api/v1/files/'))).json()).items.some((item) => item.slug === file.id))
const fileUpdate = await api.item(request(`${base}/files/${file.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ title: 'D1 Updated File', hide: true, price_amount: 8600000 }),
}), 'files', file.id)
assert.equal(fileUpdate.status, 200)
const persistedFileId = (await directoryRepository.find('files', file.id)).sourceId
const persistedFile = database.sqlite.prepare('SELECT title, is_file, hide, price_amount FROM properties WHERE id = ?').get(persistedFileId)
assert.deepEqual({ ...persistedFile }, { title: 'D1 Updated File', is_file: 1, hide: 1, price_amount: 8600000 })
assert.ok(!(await (await filesApi.list(request('/api/v1/files/'))).json()).items.some((item) => item.slug === file.id))
assert.equal((await api.item(request(`${base}/files/${file.id}`, { method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ hide: false }) }), 'files', file.id)).status, 200)
const fileRead = await api.item(request(`${base}/files/${file.id}`, { headers: { Origin: origin, Cookie: cookie } }), 'files', file.id)
assert.equal((await fileRead.json()).item.id, file.id)

const deleteLabel = await api.item(request(`${base}/labels/featured`, { method: 'DELETE', headers: writeHeaders }), 'labels', 'featured')
assert.equal(deleteLabel.status, 200)
assert.deepEqual((await directoryRepository.find('files', file.id)).adminForm.labels, [])

const reloadedRepository = createD1DirectoryRepository(database)
const reloadedFilesApi = createDirectoryApi(reloadedRepository, 'files')
assert.ok((await (await reloadedFilesApi.list(request('/api/v1/files/?query=d1%20updated'))).json()).items.some((item) => item.slug === file.id))
assert.equal((await api.item(request(`${base}/files/${map.id}`, { method: 'DELETE', headers: writeHeaders }), 'files', map.id)).status, 404)
assert.equal((await api.item(request(`${base}/files/${file.id}`, { method: 'DELETE', headers: writeHeaders }), 'files', file.id)).status, 200)
assert.equal(await reloadedRepository.find('files', file.id), null)
assert.equal(await reloadedRepository.delete('maps', 'unknown-map'), false)

database.sqlite.close()
console.log('Synthetic local D1 Maps/Files storage and CRUD checks passed.')
