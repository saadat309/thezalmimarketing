import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { createAdminAuth } from '../src/lib/admin-auth.js'
import { createAdminDataApi, createMemoryAdminRepository } from '../src/lib/admin-data.js'
import { createMemoryAdminStorage } from '../src/lib/admin-storage.js'
import { createPropertyApi } from '../src/lib/property-api.js'
import { syntheticProperties } from '../src/lib/property-fixtures.js'
import { createD1PropertyRepository } from '../src/lib/property-repository.js'

class LocalD1Statement {
  constructor(database, sql, values = []) {
    this.database = database
    this.sql = sql
    this.values = values
  }

  bind(...values) {
    return new LocalD1Statement(this.database, this.sql, values)
  }

  async run() {
    const result = this.database.prepare(this.sql).run(...this.values)
    return { success: true, meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } }
  }

  async first() {
    return this.database.prepare(this.sql).get(...this.values) ?? null
  }

  async all() {
    return { results: this.database.prepare(this.sql).all(...this.values) }
  }
}

class LocalD1Database {
  constructor() {
    this.sqlite = new DatabaseSync(':memory:')
  }

  prepare(sql) {
    return new LocalD1Statement(this.sqlite, sql)
  }
}

const database = new LocalD1Database()
for (const migration of ['0001_staging_admin_storage.sql', '0002_staging_properties.sql']) {
  database.sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), 'utf8'))
}

const propertyRepository = createD1PropertyRepository(database)
for (const property of syntheticProperties) await propertyRepository.insertPropertyRecord(property)
const propertyApi = createPropertyApi(propertyRepository)
const request = (url, headers = {}) => new Request(`https://stage.invalid${url}`, { headers })

const firstResponse = await propertyApi.list(request('/api/v1/properties'))
assert.equal(firstResponse.status, 200)
const firstPage = await firstResponse.json()
assert.equal(firstPage.items.length, 20)
assert.equal(firstPage.page.hasMore, true)
assert.ok(firstPage.items.every((item) => !['hidden-home', 'sample-file'].includes(item.slug)))
assert.equal(JSON.stringify(firstPage).includes('synthetic-private-key'), false)
assert.equal(JSON.stringify(firstPage).includes('"id"'), false)
const unchanged = await propertyApi.list(request('/api/v1/properties', { 'If-None-Match': firstResponse.headers.get('etag') }))
assert.equal(unchanged.status, 304)
const secondPage = await (await propertyApi.list(request(`/api/v1/properties?cursor=${encodeURIComponent(firstPage.page.nextCursor)}`))).json()
assert.ok(!secondPage.items.some((item) => firstPage.items.some((first) => first.slug === item.slug)))
const filtered = await (await propertyApi.list(request('/api/v1/properties?category=houses&city=sample-city&min_area=1000&area_unit=sqft&label=featured&query=synthetic'))).json()
assert.ok(filtered.items.length > 0)
assert.equal((await propertyApi.list(request('/api/v1/properties?cursor=bad'))).status, 400)
assert.equal((await propertyApi.detail(request('/api/v1/properties'), 'hidden-home')).status, 404)

const environment = {
  STAGING_LOCAL_AUTH: 'enabled',
  STAGING_ADMIN_1_PASSWORD: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
  STAGING_ADMIN_2_PASSWORD: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
}
const auth = createAdminAuth(environment, createMemoryAdminStorage())
const base = 'http://127.0.0.1:4175/api/v1/admin'
const origin = 'http://127.0.0.1:4182'
const login = await auth.login(new Request(`${base}/auth/login`, {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin.one@staging.invalid', password: environment.STAGING_ADMIN_1_PASSWORD }),
}))
assert.equal(login.status, 200)
const cookie = login.headers.get('Set-Cookie').split(';')[0]
const loginBody = await login.json()
const api = createAdminDataApi(createMemoryAdminRepository(), auth, createMemoryAdminStorage(), propertyRepository)
const writeHeaders = { Origin: origin, Cookie: cookie, 'X-CSRF-Token': loginBody.csrfToken, 'Content-Type': 'application/json' }
const newProperty = await api.collection(new Request(`${base}/properties`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({
    title: 'D1 Created Home', short_desc: 'Created through the synthetic admin API', address: 'Sample Road',
    property_type: 'Residential', purchase_type: 'sale', category_id: 'houses', city_id: 'sample-city',
    society_id: 'sample-society', phase_id: 'phase-one', price_amount: 12000000, is_discounted: false,
    price_original_amount: null, price_period_unit: 'month', price_period_value: 1, area: 10, unit: 'marla',
    beds: 3, baths: 2, features: 'Synthetic feature', labels: ['featured'], related_products: ['sample-residence'],
    detailed_description_content: '<p>Synthetic detail</p>', embed_link: '', template: 'default', hide: true,
  }),
}), 'properties')
assert.equal(newProperty.status, 201)
const created = (await newProperty.json()).item
assert.ok(created.id)
assert.equal((await propertyApi.detail(request('/api/v1/properties'), created.title.toLowerCase().replaceAll(' ', '-'))).status, 404)

const publish = await api.item(new Request(`${base}/properties/${created.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ hide: false }),
}), 'properties', created.id)
assert.equal(publish.status, 200)
await publish.json()
const publishedRecord = await propertyRepository.findPropertyById(created.id)
const publishedList = await propertyApi.list(request('/api/v1/properties'))
assert.ok((await publishedList.clone().json()).items.some((item) => item.slug === publishedRecord.slug))
const beforeUpdateEtag = publishedList.headers.get('etag')
const update = await api.item(new Request(`${base}/properties/${created.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ title: 'D1 Updated Home' }),
}), 'properties', created.id)
assert.equal(update.status, 200)
const updated = await propertyApi.list(request('/api/v1/properties'))
assert.notEqual(updated.headers.get('etag'), beforeUpdateEtag)
assert.ok((await updated.json()).items.some((item) => item.slug === publishedRecord.slug && item.title === 'D1 Updated Home'))

const createdLabelResponse = await api.collection(new Request(`${base}/labels`, {
  method: 'POST', headers: writeHeaders, body: JSON.stringify({ name: 'D1 Storage Check' }),
}), 'labels')
assert.equal(createdLabelResponse.status, 201)
const createdLabel = (await createdLabelResponse.json()).item
const propertyLabelUpdate = await api.item(new Request(`${base}/properties/${created.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ labels: [createdLabel.slug] }),
}), 'properties', created.id)
assert.equal(propertyLabelUpdate.status, 200)
const labeledProperty = await propertyRepository.findPropertyById(created.id)
assert.deepEqual(labeledProperty.labels.map((label) => label.slug), [createdLabel.slug])
assert.ok((await (await propertyApi.list(request('/api/v1/properties'))).json()).items
  .some((item) => item.slug === publishedRecord.slug && item.labels.some((label) => label.slug === createdLabel.slug)))
const deletedLabel = await api.item(new Request(`${base}/labels/${createdLabel.slug}`, {
  method: 'DELETE', headers: writeHeaders,
}), 'labels', createdLabel.slug)
assert.equal(deletedLabel.status, 200)
assert.deepEqual((await propertyRepository.findPropertyById(created.id)).labels, [])

const reloadedRepository = createD1PropertyRepository(database)
const reloadedPropertyApi = createPropertyApi(reloadedRepository)
const afterReinit = await reloadedPropertyApi.list(request('/api/v1/properties'))
assert.ok((await afterReinit.json()).items.some((item) => item.slug === publishedRecord.slug && item.title === 'D1 Updated Home'))
assert.equal((await reloadedPropertyApi.detail(request('/api/v1/properties'), 'hidden-home')).status, 404)

const hide = await api.item(new Request(`${base}/properties/${created.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ hide: true }),
}), 'properties', created.id)
assert.equal(hide.status, 200)
assert.ok(!(await (await reloadedPropertyApi.list(request('/api/v1/properties'))).json()).items.some((item) => item.slug === publishedRecord.slug))
const remove = await api.item(new Request(`${base}/properties/${created.id}`, {
  method: 'DELETE', headers: writeHeaders,
}), 'properties', created.id)
assert.equal(remove.status, 200)
assert.equal((await api.item(new Request(`${base}/properties/${created.id}`, { headers: { Origin: origin, Cookie: cookie } }), 'properties', created.id)).status, 404)

database.sqlite.close()
console.log('Synthetic local D1 property storage and CRUD checks passed.')
