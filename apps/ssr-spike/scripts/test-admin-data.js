import assert from 'node:assert/strict'
import { createAdminAuth } from '../src/lib/admin-auth.js'
import { createAdminDataApi, createMemoryAdminRepository } from '../src/lib/admin-data.js'
import { createDirectoryApi, createMemoryDirectoryRepository } from '../src/lib/directory-api.js'
import { syntheticFiles, syntheticMaps } from '../src/lib/directory-fixtures.js'
import { createPropertyApi } from '../src/lib/property-api.js'
import { syntheticProperties } from '../src/lib/property-fixtures.js'
import { createMemoryPropertyRepository } from '../src/lib/property-repository.js'

const environment = {
  STAGING_LOCAL_AUTH: 'enabled',
  STAGING_ADMIN_1_PASSWORD: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
  STAGING_ADMIN_2_PASSWORD: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
}
const auth = createAdminAuth(environment)
const api = createAdminDataApi(createMemoryAdminRepository(), auth)
const propertyApi = createPropertyApi(createMemoryPropertyRepository(syntheticProperties))
const directoryRepository = createMemoryDirectoryRepository({ maps: syntheticMaps, files: syntheticFiles })
const mapsApi = createDirectoryApi(directoryRepository, 'maps')
const filesApi = createDirectoryApi(directoryRepository, 'files')
const origin = 'http://127.0.0.1:4182'
const base = 'http://127.0.0.1:4175/api/v1/admin'
const response = await auth.login(new Request(`${base}/auth/login`, {
  method: 'POST',
  headers: { Origin: origin, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin.one@staging.invalid', password: environment.STAGING_ADMIN_1_PASSWORD }),
}))
const cookie = response.headers.get('Set-Cookie').split(';')[0]
const { csrfToken } = await response.json()
const readHeaders = { Origin: origin, Cookie: cookie }
const writeHeaders = { ...readHeaders, 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }
const preflight = auth.options(new Request(`${base}/properties`, {
  method: 'OPTIONS',
  headers: { Origin: origin, 'Access-Control-Request-Method': 'DELETE', 'Access-Control-Request-Headers': 'content-type,x-csrf-token' },
}))
assert.equal(preflight.status, 204)
assert.match(preflight.headers.get('Access-Control-Allow-Methods'), /DELETE/)

assert.equal((await api.collection(new Request(`${base}/properties`), 'properties')).status, 401)
assert.equal((await api.collection(new Request(`${base}/properties`, { headers: readHeaders }), 'properties')).status, 200)
const users = await api.collection(new Request(`${base}/users`, { headers: readHeaders }), 'users')
assert.equal(users.status, 200)
const userList = await users.json()
assert.equal(userList.count, 2)
assert.ok(userList.items.every((user) => user.role === 'Admin'))
assert.equal((await api.collection(new Request(`${base}/users`, { method: 'POST', headers: writeHeaders, body: '{}' }), 'users')).status, 405)
const profile = await api.collection(new Request(`${base}/profile`, { headers: readHeaders }), 'profile')
assert.equal((await profile.json()).user.email, 'admin.one@staging.invalid')
const queryCollection = await api.collection(new Request(`${base}/queries`, { headers: readHeaders }), 'queries')
assert.equal(queryCollection.status, 200)
const queryData = await queryCollection.json()
assert.equal(queryData.count, 2)
assert.ok(queryData.items.every((item) => typeof item.is_read === 'boolean' && item.email.endsWith('.invalid')))
const sampleQuery = queryData.items.find((item) => !item.is_read)
const readQuery = await api.item(new Request(`${base}/queries/${sampleQuery.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ is_read: true }),
}), 'queries', sampleQuery.id)
assert.equal(readQuery.status, 200)
assert.equal((await readQuery.json()).item.is_read, true)
const newQuery = await api.collection(new Request(`${base}/queries`, {
  method: 'POST', headers: writeHeaders, body: JSON.stringify({ name: 'Synthetic Test', email: '', phone: '', property_id: '', property_title: '', message: 'A synthetic query message.', created_at: '2026-10-18 12:00:00', is_read: false }),
}), 'queries')
assert.equal(newQuery.status, 201)
assert.equal((await newQuery.json()).item.email, '')
const landingCollection = await api.collection(new Request(`${base}/landing-page`, { headers: readHeaders }), 'landing-page')
assert.equal(landingCollection.status, 200)
const landingData = await landingCollection.json()
assert.equal(landingData.count, 6)
const featuredSection = landingData.items.find((item) => item.id === 'section-featured')
const landingUpdate = await api.item(new Request(`${base}/landing-page/${featuredSection.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ title: 'Synthetic Home Picks', order: 1, selectedItems: ['101'], active: true }),
}), 'landing-page', featuredSection.id)
assert.equal(landingUpdate.status, 200)
assert.deepEqual((await landingUpdate.json()).item.selectedItems, ['101'])
const invalidLandingItems = await api.item(new Request(`${base}/landing-page/${featuredSection.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ selectedItems: ['101', '101'] }),
}), 'landing-page', featuredSection.id)
assert.equal(invalidLandingItems.status, 400)
const created = await api.collection(new Request(`${base}/properties`, {
  method: 'POST', headers: writeHeaders, body: JSON.stringify({
    title: 'Synthetic test record', shortDescription: 'Staging form test', address: 'Sample Road', propertyType: 'Residential',
    purchaseType: 'sale', category: 'Houses', city: 'Lahore', price: 12000000, area: 10, areaUnit: 'marla', beds: 3,
    baths: 2, isFurnished: true, isDiscounted: false, description: '<p>Synthetic description</p>', visible: true,
  }),
}), 'properties')
assert.equal(created.status, 201)
const createdItem = (await created.json()).item
assert.equal(createdItem.title, 'Synthetic test record')
assert.ok(createdItem.id)
const createdProperty = syntheticProperties.find((item) => String(item.id) === createdItem.id)
assert.ok(createdProperty)
assert.equal(createdProperty.location.address, 'Sample Road')
assert.equal(createdProperty.area.value, '10')
assert.equal(createdProperty.shortDescription, 'Staging form test')
assert.equal(createdProperty.beds, 3)
const createdListing = await propertyApi.list(new Request('https://test.invalid/api/v1/properties'))
assert.ok((await createdListing.json()).items.some((item) => item.slug === createdProperty.slug))

const updated = await api.item(new Request(`${base}/properties/${createdItem.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ title: 'Publicly Updated Synthetic Test', visible: true }),
}), 'properties', createdItem.id)
assert.equal(updated.status, 200)
const updatedListing = await propertyApi.list(new Request('https://test.invalid/api/v1/properties'))
const updatedPublicRecord = (await updatedListing.json()).items.find((item) => item.slug === createdProperty.slug)
assert.equal(updatedPublicRecord.title, 'Publicly Updated Synthetic Test')

const rejectedField = await api.collection(new Request(`${base}/properties`, {
  method: 'POST', headers: writeHeaders, body: JSON.stringify({ title: 'Unsafe', internalStorageKey: 'should-not-pass' }),
}), 'properties')
assert.equal(rejectedField.status, 400)

const noCsrf = await api.item(new Request(`${base}/properties/${createdItem.id}`, {
  method: 'DELETE', headers: readHeaders,
}), 'properties', createdItem.id)
assert.equal(noCsrf.status, 403)
const deleted = await api.item(new Request(`${base}/properties/${createdItem.id}`, {
  method: 'DELETE', headers: writeHeaders,
}), 'properties', createdItem.id)
assert.equal(deleted.status, 200)
const afterDelete = await propertyApi.list(new Request('https://test.invalid/api/v1/properties'))
assert.ok(!(await afterDelete.json()).items.some((item) => item.slug === createdProperty.slug))

const newMap = (await api.collection(new Request(`${base}/maps`, {
  method: 'POST', headers: writeHeaders, body: JSON.stringify({ title: 'Synthetic Admin Map', city: 'Lahore', society: 'Sample Society', phase: 'Phase One', description: 'Sample map notes', visible: true }),
}), 'maps')).json()
const map = (await newMap).item
assert.equal(syntheticMaps.find((item) => item.slug === map.id).description, 'Sample map notes')
assert.ok((await (await mapsApi.list(new Request('https://test.invalid/api/v1/maps'))).json()).items.some((item) => item.slug === map.id))

const newFileResponse = await api.collection(new Request(`${base}/files`, {
  method: 'POST', headers: writeHeaders, body: JSON.stringify({ title: 'Synthetic Admin File', city: 'Lahore', society: 'Sample Society', phase: 'Phase One', fileType: 'Allocation', area: 5, areaUnit: 'marla', price: 8500000, visible: true }),
}), 'files')
const file = (await newFileResponse.json()).item
const fileFixture = syntheticFiles.find((item) => item.slug === file.id)
assert.equal(fileFixture.area.value, '5')
assert.equal(fileFixture.price.amount, '8500000')
assert.ok((await (await filesApi.list(new Request('https://test.invalid/api/v1/files'))).json()).items.some((item) => item.slug === file.id))

console.log('Synthetic admin API checks passed.')
