import assert from 'node:assert/strict'
import { syntheticFiles, syntheticMaps } from '../src/lib/directory-fixtures.js'
import { createDirectoryApi, createMemoryDirectoryRepository } from '../src/lib/directory-api.js'

const repository = createMemoryDirectoryRepository({ maps: structuredClone(syntheticMaps), files: structuredClone(syntheticFiles) })
const maps = createDirectoryApi(repository, 'maps')
const files = createDirectoryApi(repository, 'files')

let response = await maps.list(new Request('https://test.invalid/api/v1/maps/'))
assert.equal(response.status, 200)
let body = await response.json()
assert.equal(body.items.length, 3)
assert.ok(body.items.every((item) => !Object.hasOwn(item, 'public')))
assert.equal(body.items[0].slug, 'dha-lahore-phase-6-master-plan')

response = await maps.list(new Request('https://test.invalid/api/v1/maps/?city=multan'))
body = await response.json()
assert.deepEqual(body.items.map((item) => item.slug), ['dha-multan-sector-map'])

response = await files.list(new Request('https://test.invalid/api/v1/files/?file_type=Affidavit'))
body = await response.json()
assert.deepEqual(body.items.map((item) => item.slug), ['bahria-town-lahore-affidavit-file'])
assert.equal(body.items[0].price.currency, 'PKR')

response = await files.list(new Request('https://test.invalid/api/v1/files/?bad_filter=x'))
assert.equal(response.status, 400)

response = await maps.list(new Request('https://test.invalid/api/v1/maps/', { method: 'POST' }))
assert.equal(response.status, 405)

console.log('Synthetic directory API checks passed.')
