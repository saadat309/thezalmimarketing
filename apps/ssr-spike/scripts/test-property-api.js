import assert from 'node:assert/strict'
import { createPropertyApi } from '../src/lib/property-api.js'
import { syntheticProperties } from '../src/lib/property-fixtures.js'
import { createMemoryPropertyRepository } from '../src/lib/property-repository.js'

const properties = structuredClone(syntheticProperties)
const api = createPropertyApi(createMemoryPropertyRepository(properties))
const request = (query = '', headers = {}) => new Request(`https://test.invalid/api/v1/properties/${query}`, { headers })

const firstResponse = await api.list(request())
assert.equal(firstResponse.status, 200)
assert.equal(firstResponse.headers.get('cache-control'), 'no-cache, must-revalidate')
const firstPage = await firstResponse.json()
assert.equal(firstPage.items.length, 20)
assert.equal(firstPage.page.hasMore, true)
assert.equal(firstPage.items.some((item) => item.slug === 'hidden-home' || item.slug === 'sample-file'), false)
assert.equal(JSON.stringify(firstPage).includes('synthetic-private-key'), false)
assert.equal(JSON.stringify(firstPage).includes('"id"'), false)

const repeated = await api.list(request('', { 'If-None-Match': firstResponse.headers.get('etag') }))
assert.equal(repeated.status, 304)
assert.equal(await repeated.text(), '')

const secondResponse = await api.list(request(`?cursor=${encodeURIComponent(firstPage.page.nextCursor)}`))
const secondPage = await secondResponse.json()
assert.equal(secondPage.items.some((item) => firstPage.items.some((first) => first.slug === item.slug)), false)

const maxPage = await (await api.list(request('?limit=50'))).json()
assert.equal(maxPage.items.length, 50)
assert.equal((await api.list(request('?limit=51'))).status, 400)
assert.equal((await api.list(request('?min_area=100'))).status, 400)
const filtered = await (await api.list(request('?category=houses&city=sample-city&purchase_type=sale&min_beds=3&min_baths=2&min_area=1000&area_unit=sqft'))).json()
assert.ok(filtered.items.length > 0)
assert.equal((await api.list(request('?category=does-not-exist'))).status, 400)
assert.equal((await api.list(request('?purchase_type=unknown'))).status, 400)
assert.equal((await api.detail(request(), '1')).status, 404)

const changedProperty = properties.find((item) => item.slug === 'sample-residence')
const before = await api.list(request())
const beforePage = await before.clone().json()
const changedListedProperty = properties.find((item) => item.slug === beforePage.items[0].slug)
changedListedProperty.title = 'Updated Synthetic Residence'
const after = await api.list(request('', { 'If-None-Match': before.headers.get('etag') }))
assert.notEqual(before.headers.get('etag'), after.headers.get('etag'))
assert.match(JSON.stringify(await after.json()), /Updated Synthetic Residence/)
changedProperty.public = false
assert.equal((await api.detail(request(), changedProperty.slug)).status, 404)

console.log('Synthetic property API acceptance checks passed.')
