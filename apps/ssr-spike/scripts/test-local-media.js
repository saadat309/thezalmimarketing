import assert from 'node:assert/strict'
import { createLocalMediaStorage, validateMedia, localMediaLimits } from '../src/lib/local-media-storage.js'

const storage = createLocalMediaStorage()
const image = new File([new Uint8Array([1, 2, 3])], 'sample image!.png', { type: 'image/png' })
const uploaded = await storage.put({ ownerType: 'property', ownerId: '1', kind: 'image', file: image })
assert.ok(uploaded.item.id)
assert.equal(uploaded.item.filename, 'sample-image-.png')
assert.equal(uploaded.item.contentType, 'image/png')
assert.equal(storage.list('property', '1').length, 1)
assert.equal(storage.hasBytes(uploaded.item.id), true)

assert.equal(validateMedia({ ownerType: 'property', ownerId: '1', kind: 'image', file: new File(['x'], 'x.svg', { type: 'image/svg+xml' }) }).error, 'Unsupported image media type.')
assert.equal(validateMedia({ ownerType: 'property', ownerId: '1', kind: 'pdf', file: new File(['x'], 'x.pdf', { type: 'application/pdf' }) }).ok, true)
assert.equal(validateMedia({ ownerType: 'invalid', ownerId: '1', kind: 'image', file: image }).error, 'A valid local media owner is required.')
assert.equal(validateMedia({ ownerType: 'property', ownerId: '1', kind: 'image', file: new File([], 'empty.png', { type: 'image/png' }) }).error, 'The selected media file is empty.')
assert.equal(localMediaLimits.video, 500 * 1024 * 1024)
assert.equal(storage.remove(uploaded.item.id), true)
assert.equal(storage.list('property', '1').length, 0)
assert.equal(storage.hasBytes(uploaded.item.id), false)

console.log('Local synthetic media validation and lifecycle checks passed.')
