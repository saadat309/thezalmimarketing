import assert from 'node:assert/strict'
import { createAdminAuth } from '../src/lib/admin-auth.js'
import { createMemoryAdminStorage } from '../src/lib/admin-storage.js'
import { createAdminDataApi, createMemoryAdminRepository } from '../src/lib/admin-data.js'
import { createDirectoryApi, createMemoryDirectoryRepository } from '../src/lib/directory-api.js'
import { syntheticFiles, syntheticMaps } from '../src/lib/directory-fixtures.js'
import { createPropertyApi } from '../src/lib/property-api.js'
import { syntheticProperties } from '../src/lib/property-fixtures.js'
import { createMemoryPropertyRepository } from '../src/lib/property-repository.js'
import { syntheticCalculatorConfig } from '../src/lib/calculator-fixtures.js'

const environment = {
  STAGING_LOCAL_AUTH: 'enabled',
  STAGING_ADMIN_1_PASSWORD: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
  STAGING_ADMIN_2_PASSWORD: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
}
const storage = createMemoryAdminStorage()
const auth = createAdminAuth(environment, storage)
const api = createAdminDataApi(createMemoryAdminRepository(), auth, storage)
const propertyApi = createPropertyApi(createMemoryPropertyRepository(syntheticProperties))
const directoryRepository = createMemoryDirectoryRepository({ maps: syntheticMaps, files: syntheticFiles })
const mapsApi = createDirectoryApi(directoryRepository, 'maps')
const filesApi = createDirectoryApi(directoryRepository, 'files')
const calculatorConfigApi = async () => (await import('../src/lib/calculator-api.js')).handleCalculatorConfig(new Request('https://test.invalid/api/v1/calculator/config')).json()
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
const profileData = await profile.json()
assert.equal(profileData.user.email, 'admin.one@staging.invalid')
assert.equal(profileData.user.role_name, 'Admin')
assert.ok(profileData.readOnlyFields.includes('email'))
const profileNoCsrf = await api.collection(new Request(`${base}/profile`, {
  method: 'PATCH', headers: readHeaders, body: JSON.stringify({ name: 'Rejected Profile', bio: '' }),
}), 'profile')
assert.equal(profileNoCsrf.status, 403)
const savedProfile = await api.collection(new Request(`${base}/profile`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ name: 'Synthetic Admin One', bio: 'A synthetic profile biography.' }),
}), 'profile')
assert.equal(savedProfile.status, 200)
assert.equal((await savedProfile.json()).user.name, 'Synthetic Admin One')
const profileAfterSave = await api.collection(new Request(`${base}/profile`, { headers: readHeaders }), 'profile')
assert.equal((await profileAfterSave.json()).user.bio, 'A synthetic profile biography.')
const apiAfterRestart = createAdminDataApi(createMemoryAdminRepository(), createAdminAuth(environment, storage), storage)
const profileAfterRestart = await apiAfterRestart.collection(new Request(`${base}/profile`, { headers: readHeaders }), 'profile')
const persistedProfile = await profileAfterRestart.json()
assert.equal(persistedProfile.user.name, 'Synthetic Admin One')
assert.equal(persistedProfile.user.bio, 'A synthetic profile biography.')
const profileEmailTamper = await api.collection(new Request(`${base}/profile`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ name: 'Synthetic Admin One', bio: '', email: 'new@example.invalid' }),
}), 'profile')
assert.equal(profileEmailTamper.status, 400)
assert.equal((await api.collection(new Request(`${base}/profile`, { method: 'POST', headers: writeHeaders, body: '{}' }), 'profile')).status, 405)
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
const propertySchema = await api.collection(new Request(`${base}/properties`, { headers: readHeaders }), 'properties')
const propertyPayload = await propertySchema.json()
assert.deepEqual(Object.keys(propertyPayload.fields), ['title', 'short_desc', 'address', 'property_type', 'purchase_type', 'is_furnished', 'beds', 'baths', 'area', 'unit', 'features', 'price_amount', 'is_discounted', 'price_original_amount', 'price_period_unit', 'price_period_value', 'installment_advance_amount', 'installment_total_period_text', 'installment_amount', 'installment_display_mode', 'vat_amount', 'category_id', 'city_id', 'society_id', 'phase_id', 'related_products', 'labels', 'detailed_description_content', 'embed_link', 'hide', 'template'])
assert.ok(propertyPayload.options.category_id.some((option) => option.value === 'houses'))
const created = await api.collection(new Request(`${base}/properties`, {
  method: 'POST', headers: writeHeaders, body: JSON.stringify({
    title: 'Synthetic test record', short_desc: 'Staging form test', address: 'Sample Road', property_type: 'Residential',
    purchase_type: 'sale', is_furnished: true, category_id: 'houses', city_id: 'sample-city', society_id: 'sample-society', phase_id: 'phase-one',
    price_amount: 12000000, is_discounted: false, price_original_amount: null, price_period_unit: 'month', price_period_value: 1,
    installment_advance_amount: null, installment_total_period_text: '', installment_amount: null, installment_display_mode: 'installment',
    vat_amount: 0, area: 10, unit: 'marla', beds: 3, baths: 2, features: 'Synthetic feature', labels: ['featured'],
    related_products: ['sample-residence'], detailed_description_content: '<p>Synthetic description</p>', embed_link: '', template: 'default', hide: false,
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
assert.equal(createdProperty.adminForm.features, 'Synthetic feature')
assert.equal(createdProperty.public, true)
assert.deepEqual(createdProperty.labels, [{ slug: 'featured', name: 'Featured' }])
const reorderedLabels = await api.item(new Request(`${base}/properties/${createdItem.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ labels: ['new-listing', 'featured'] }),
}), 'properties', createdItem.id)
assert.equal(reorderedLabels.status, 200)
assert.deepEqual(createdProperty.labels.map((label) => label.slug), ['new-listing', 'featured'])
const createdListing = await propertyApi.list(new Request('https://test.invalid/api/v1/properties'))
const createdPublicItem = (await createdListing.json()).items.find((item) => item.slug === createdProperty.slug)
assert.ok(createdPublicItem)
assert.deepEqual(createdPublicItem.labels.map((label) => label.slug), ['new-listing', 'featured'])
assert.equal(Object.hasOwn(createdPublicItem, 'adminForm'), false)
assert.equal(Object.hasOwn(createdPublicItem, 'categoryId'), false)
assert.equal(Object.hasOwn(createdPublicItem, 'embed_link'), false)

const updated = await api.item(new Request(`${base}/properties/${createdItem.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ title: 'Publicly Updated Synthetic Test', hide: false }),
}), 'properties', createdItem.id)
assert.equal(updated.status, 200)
const updatedListing = await propertyApi.list(new Request('https://test.invalid/api/v1/properties'))
const updatedPublicRecord = (await updatedListing.json()).items.find((item) => item.slug === createdProperty.slug)
assert.equal(updatedPublicRecord.title, 'Publicly Updated Synthetic Test')
const invalidDiscount = await api.item(new Request(`${base}/properties/${createdItem.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ is_discounted: true, price_original_amount: null }),
}), 'properties', createdItem.id)
assert.equal(invalidDiscount.status, 400)
const hiddenUpdate = await api.item(new Request(`${base}/properties/${createdItem.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ hide: true }),
}), 'properties', createdItem.id)
assert.equal(hiddenUpdate.status, 200)
assert.equal(createdProperty.public, false)
const hiddenListing = await propertyApi.list(new Request('https://test.invalid/api/v1/properties'))
assert.ok(!(await hiddenListing.json()).items.some((item) => item.slug === createdProperty.slug))
const visibleAgain = await api.item(new Request(`${base}/properties/${createdItem.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ hide: false }),
}), 'properties', createdItem.id)
assert.equal(visibleAgain.status, 200)

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
  method: 'POST', headers: writeHeaders, body: JSON.stringify({ title: 'Synthetic Admin Map', city_id: 'lahore', society_id: 'dha-lahore', phase_id: 'phase-6', description: 'Sample map notes', embed_link: '', hide: false }),
}), 'maps')).json()
const map = (await newMap).item
assert.equal(syntheticMaps.find((item) => item.slug === map.id).description, 'Sample map notes')
assert.equal(syntheticMaps.find((item) => item.slug === map.id).public, true)
assert.ok((await (await mapsApi.list(new Request('https://test.invalid/api/v1/maps'))).json()).items.some((item) => item.slug === map.id))
const clearMapRelation = await api.item(new Request(`${base}/maps/${map.id}`, { method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ city_id: '' }) }), 'maps', map.id)
assert.equal(clearMapRelation.status, 200)
assert.equal(syntheticMaps.find((item) => item.slug === map.id).cityName, '')

const newFileResponse = await api.collection(new Request(`${base}/files`, {
  method: 'POST', headers: writeHeaders, body: JSON.stringify({
    title: 'Synthetic Admin File', short_desc: 'Synthetic file listing', address: 'Sample file address', property_type: 'Residential', file_type: 'Allocation', purchase_type: 'installment',
    area: 5, unit: 'marla', price_amount: 8500000, is_discounted: true, price_original_amount: 9000000, price_period_unit: 'month', price_period_value: 1,
    installment_amount: 100000, installment_total_period_text: '3 years', installment_advance_amount: 2000000, installment_display_mode: 'installment',
    city_id: 'lahore', society_id: 'dha-lahore', phase_id: 'phase-7', embed_link: '', labels: ['featured'], hide: false,
  }),
}), 'files')
assert.equal(newFileResponse.status, 201)
const file = (await newFileResponse.json()).item
const fileFixture = syntheticFiles.find((item) => item.slug === file.id)
assert.equal(fileFixture.area.value, '5')
assert.equal(fileFixture.price.amount, '8500000')
assert.equal(fileFixture.fileType, 'Allocation')
assert.equal(fileFixture.shortDescription, 'Synthetic file listing')
assert.ok((await (await filesApi.list(new Request('https://test.invalid/api/v1/files'))).json()).items.some((item) => item.slug === file.id))
const hiddenFile = await api.item(new Request(`${base}/files/${file.id}`, { method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ hide: true }) }), 'files', file.id)
assert.equal(hiddenFile.status, 200)
assert.ok(!(await (await filesApi.list(new Request('https://test.invalid/api/v1/files'))).json()).items.some((item) => item.slug === file.id))

const rateCollectionResponse = await api.collection(new Request(`${base}/calculator-rates`, { headers: readHeaders }), 'calculator-rates')
assert.equal(rateCollectionResponse.status, 200)
const rateCollection = await rateCollectionResponse.json()
assert.equal(rateCollection.count, 5)
assert.equal(new Set(rateCollection.items.map((item) => item.id)).size, 5)
assert.equal(rateCollection.options.calculator_phase_id[0].label, 'Lahore > DHA Lahore (Synthetic) > Sample Phase')
assert.deepEqual(rateCollection.columns.slice(0, 5), ['id', 'city_name', 'society_name', 'calculator_phase_name', 'calculator_block_name'])
const duplicateRate = await api.collection(new Request(`${base}/calculator-rates`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ calculator_phase_id: 'phase-demo', calculator_block_id: '', calculator_property_type_id: 'type-res-plot', unit: 'marla', dc_rate: 430000, fbr_rate: 445000, is_active: true }),
}), 'calculator-rates')
assert.equal(duplicateRate.status, 400)
const newRateResponse = await api.collection(new Request(`${base}/calculator-rates`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ calculator_phase_id: 'phase-demo', calculator_block_id: 'block-demo-b', calculator_property_type_id: 'type-res-plot', unit: 'sqft', dc_rate: 910, fbr_rate: 990, is_active: true }),
}), 'calculator-rates')
assert.equal(newRateResponse.status, 201)
const newRate = (await newRateResponse.json()).item
assert.equal(newRate.unit, 'sqft')
let liveConfig = await calculatorConfigApi()
let publicRate = liveConfig.calculator_rates.find((item) => item.id === newRate.id)
assert.equal(publicRate.dc_per_sqft, 910)
assert.equal(publicRate.fbr_per_sqft, 990)
const updateRateResponse = await api.item(new Request(`${base}/calculator-rates/${newRate.id}`, {
  method: 'PATCH', headers: writeHeaders,
  body: JSON.stringify({ calculator_phase_id: 'phase-demo', calculator_block_id: 'block-demo-b', calculator_property_type_id: 'type-res-plot', unit: 'sqft', dc_rate: 920, fbr_rate: 1000, is_active: false }),
}), 'calculator-rates', newRate.id)
assert.equal(updateRateResponse.status, 200)
liveConfig = await calculatorConfigApi()
publicRate = liveConfig.calculator_rates.find((item) => item.id === newRate.id)
assert.equal(publicRate.dc_per_sqft, 920)
assert.equal(publicRate.is_active, false)
const invalidRate = await api.collection(new Request(`${base}/calculator-rates`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ calculator_phase_id: 'missing-phase', calculator_block_id: '', calculator_property_type_id: 'type-res-plot', unit: 'sqft', dc_rate: -1, fbr_rate: 1000, is_active: true }),
}), 'calculator-rates')
assert.equal(invalidRate.status, 400)
const deleteRateResponse = await api.item(new Request(`${base}/calculator-rates/${newRate.id}`, {
  method: 'DELETE', headers: writeHeaders,
}), 'calculator-rates', newRate.id)
assert.equal(deleteRateResponse.status, 200)
assert.ok(!(await calculatorConfigApi()).calculator_rates.some((item) => item.id === newRate.id))

const transferFeeCollectionResponse = await api.collection(new Request(`${base}/calculator-transfer-fees`, { headers: readHeaders }), 'calculator-transfer-fees')
assert.equal(transferFeeCollectionResponse.status, 200)
const transferFeeCollection = await transferFeeCollectionResponse.json()
assert.equal(transferFeeCollection.count, 3)
const residentialFee = transferFeeCollection.items.find((item) => item.category === 'Residential')
assert.equal(residentialFee.base_transfer_fee, 31500)
assert.equal(residentialFee.per_marla_rate, 6300)
assert.equal(residentialFee.per_sqft_rate, 28)
assert.ok(transferFeeCollection.options.category.some((item) => item.value === 'Sector Shop'))
const duplicateTransferFee = await api.collection(new Request(`${base}/calculator-transfer-fees`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ calculator_phase_id: 'phase-demo', calculator_block_id: '', category: 'Residential', reference_amount: 110500, reference_size: 5, reference_unit: 'marla', is_active: true }),
}), 'calculator-transfer-fees')
assert.equal(duplicateTransferFee.status, 400)
const invalidTransferFee = await api.collection(new Request(`${base}/calculator-transfer-fees`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ calculator_phase_id: 'phase-demo', calculator_block_id: 'block-demo-b', category: 'Unknown', reference_amount: 10500, reference_size: 0, reference_unit: 'hectare', is_active: true }),
}), 'calculator-transfer-fees')
assert.equal(invalidTransferFee.status, 400)
const newTransferFeeResponse = await api.collection(new Request(`${base}/calculator-transfer-fees`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ calculator_phase_id: 'phase-demo', calculator_block_id: 'block-demo-b', category: 'Residential', reference_amount: 110500, reference_size: 5, reference_unit: 'sqft', is_active: true }),
}), 'calculator-transfer-fees')
assert.equal(newTransferFeeResponse.status, 201)
const newTransferFee = (await newTransferFeeResponse.json()).item
assert.equal(newTransferFee.base_transfer_fee, 100000)
assert.equal(newTransferFee.per_marla_rate, 4500000)
assert.equal(newTransferFee.per_sqft_rate, 20000)
const duplicateTransferUpdate = await api.item(new Request(`${base}/calculator-transfer-fees/${newTransferFee.id}`, {
  method: 'PATCH', headers: writeHeaders,
  body: JSON.stringify({ calculator_phase_id: 'phase-demo', calculator_block_id: '', category: 'Residential', reference_amount: 121000, reference_size: 2000, reference_unit: 'sqft', is_active: true }),
}), 'calculator-transfer-fees', newTransferFee.id)
assert.equal(duplicateTransferUpdate.status, 400)
const updateTransferFeeResponse = await api.item(new Request(`${base}/calculator-transfer-fees/${newTransferFee.id}`, {
  method: 'PATCH', headers: writeHeaders,
  body: JSON.stringify({ calculator_phase_id: 'phase-demo', calculator_block_id: 'block-demo-b', category: 'Residential', reference_amount: 121000, reference_size: 2000, reference_unit: 'sqft', is_active: false }),
}), 'calculator-transfer-fees', newTransferFee.id)
assert.equal(updateTransferFeeResponse.status, 200)
assert.equal((await updateTransferFeeResponse.json()).item.per_sqft_rate, 55.25)
assert.equal((await calculatorConfigApi()).calculator_transfer_fees.find((item) => item.id === newTransferFee.id).is_active, false)
const deleteTransferFeeResponse = await api.item(new Request(`${base}/calculator-transfer-fees/${newTransferFee.id}`, {
  method: 'DELETE', headers: writeHeaders,
}), 'calculator-transfer-fees', newTransferFee.id)
assert.equal(deleteTransferFeeResponse.status, 200)
assert.ok(!(await calculatorConfigApi()).calculator_transfer_fees.some((item) => item.id === newTransferFee.id))

const calculatorFeesResponse = await api.collection(new Request(`${base}/calculator-fees`, { headers: readHeaders }), 'calculator-fees')
assert.equal(calculatorFeesResponse.status, 200)
const calculatorFees = await calculatorFeesResponse.json()
assert.equal(calculatorFees.count, 15)
const bianaFee = calculatorFees.items.find((item) => item.fee_key === 'biana')
assert.equal(bianaFee.fee_name, 'Biana')
assert.equal(bianaFee.charge_unit, 'transaction')
assert.equal(calculatorFees.options.charge_unit.length, 3)
const newCalculatorFeeResponse = await api.collection(new Request(`${base}/calculator-fees`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ fee_key: 'staging_sample_fee', fee_name: 'Staging Sample Fee', amount: 125.5, charge_unit: 'owner', is_active: true }),
}), 'calculator-fees')
assert.equal(newCalculatorFeeResponse.status, 201)
const newCalculatorFee = (await newCalculatorFeeResponse.json()).item
assert.equal((await calculatorConfigApi()).calculator_fees.find((item) => item.fee_key === newCalculatorFee.fee_key).amount, 125.5)
const duplicateCalculatorFeeResponse = await api.collection(new Request(`${base}/calculator-fees`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ fee_key: 'biana', fee_name: 'Duplicate', amount: 1, charge_unit: 'transaction', is_active: true }),
}), 'calculator-fees')
assert.equal(duplicateCalculatorFeeResponse.status, 400)
const updateCalculatorFeeResponse = await api.item(new Request(`${base}/calculator-fees/${bianaFee.id}`, {
  method: 'PATCH', headers: writeHeaders,
  body: JSON.stringify({ fee_name: 'Synthetic Biana', amount: 4100, is_active: false }),
}), 'calculator-fees', bianaFee.id)
assert.equal(updateCalculatorFeeResponse.status, 200)
const updatedBiana = (await calculatorConfigApi()).calculator_fees.find((item) => item.fee_key === 'biana')
assert.equal(updatedBiana.amount, 4100)
assert.equal(updatedBiana.is_active, false)
const forbiddenFeeKeyUpdate = await api.item(new Request(`${base}/calculator-fees/${bianaFee.id}`, {
  method: 'PATCH', headers: writeHeaders,
  body: JSON.stringify({ fee_key: 'renamed_biana' }),
}), 'calculator-fees', bianaFee.id)
assert.equal(forbiddenFeeKeyUpdate.status, 400)
const forbiddenFeeDelete = await api.item(new Request(`${base}/calculator-fees/${newCalculatorFee.id}`, {
  method: 'DELETE', headers: writeHeaders,
}), 'calculator-fees', newCalculatorFee.id)
assert.equal(forbiddenFeeDelete.status, 405)

const taxRatesResponse = await api.collection(new Request(`${base}/calculator-tax-rates`, { headers: readHeaders }), 'calculator-tax-rates')
assert.equal(taxRatesResponse.status, 200)
const taxRates = await taxRatesResponse.json()
assert.equal(taxRates.count, 4)
assert.ok(taxRates.items.every((item) => item.rate_unit === 'percent' && Number.isFinite(item.rate)))
assert.equal(taxRates.options.rate_unit[0].value, 'percent')
const newTaxRateResponse = await api.collection(new Request(`${base}/calculator-tax-rates`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ rate_key: 'staging_sample_tax', rate_name: 'Staging Sample Tax', rate: 4.25, rate_unit: 'percent', is_active: true }),
}), 'calculator-tax-rates')
assert.equal(newTaxRateResponse.status, 201)
const newTaxRate = (await newTaxRateResponse.json()).item
assert.equal((await calculatorConfigApi()).calculator_tax_rates.find((item) => item.rate_key === newTaxRate.rate_key).rate, 4.25)
const duplicateTaxRateResponse = await api.collection(new Request(`${base}/calculator-tax-rates`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ rate_key: 'seller_236c_filer', rate_name: 'Duplicate', rate: 3, rate_unit: 'percent', is_active: true }),
}), 'calculator-tax-rates')
assert.equal(duplicateTaxRateResponse.status, 400)
const filerTaxRate = taxRates.items.find((item) => item.rate_key === 'seller_236c_filer')
const updateTaxRateResponse = await api.item(new Request(`${base}/calculator-tax-rates/${filerTaxRate.id}`, {
  method: 'PATCH', headers: writeHeaders,
  body: JSON.stringify({ rate_name: 'Synthetic Seller 236C - Filer', rate: 3.5, is_active: false }),
}), 'calculator-tax-rates', filerTaxRate.id)
assert.equal(updateTaxRateResponse.status, 200)
const updatedTax = (await calculatorConfigApi()).calculator_tax_rates.find((item) => item.rate_key === 'seller_236c_filer')
assert.equal(updatedTax.rate, 3.5)
assert.equal(updatedTax.is_active, false)
const forbiddenTaxKeyUpdate = await api.item(new Request(`${base}/calculator-tax-rates/${filerTaxRate.id}`, {
  method: 'PATCH', headers: writeHeaders,
  body: JSON.stringify({ rate_key: 'renamed_seller_tax' }),
}), 'calculator-tax-rates', filerTaxRate.id)
assert.equal(forbiddenTaxKeyUpdate.status, 400)
const forbiddenTaxDelete = await api.item(new Request(`${base}/calculator-tax-rates/${newTaxRate.id}`, {
  method: 'DELETE', headers: writeHeaders,
}), 'calculator-tax-rates', newTaxRate.id)
assert.equal(forbiddenTaxDelete.status, 405)

const feeRulesResponse = await api.collection(new Request(`${base}/calculator-fee-rules`, { headers: readHeaders }), 'calculator-fee-rules')
assert.equal(feeRulesResponse.status, 200)
const feeRules = await feeRulesResponse.json()
assert.equal(feeRules.count, 5)
assert.equal(feeRules.options.fee_id.length, 16)
assert.equal(feeRules.items[0].fee_key, 'membership_fee_residential')
assert.equal(feeRules.items[0].fee_name, 'Membership Fee - Residential')
assert.equal(feeRules.items[0].max_area, 10)
const newFeeRuleResponse = await api.collection(new Request(`${base}/calculator-fee-rules`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ fee_id: 'fee-demo-membership_fee_residential', property_type: 'Residential', unit: 'kanal', min_area: 0, max_area: null, fee_amount: 225000, is_active: true }),
}), 'calculator-fee-rules')
assert.equal(newFeeRuleResponse.status, 201)
const newFeeRule = (await newFeeRuleResponse.json()).item
assert.equal(newFeeRule.fee_key, 'membership_fee_residential')
assert.equal((await calculatorConfigApi()).calculator_fee_rules.find((item) => item.id === newFeeRule.id).unit, 'kanal')
const invalidFeeRangeResponse = await api.collection(new Request(`${base}/calculator-fee-rules`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ fee_id: 'fee-demo-membership_fee_residential', property_type: 'Residential', unit: 'marla', min_area: 10, max_area: 10, fee_amount: 1, is_active: true }),
}), 'calculator-fee-rules')
assert.equal(invalidFeeRangeResponse.status, 400)
const invalidFeeRelationResponse = await api.collection(new Request(`${base}/calculator-fee-rules`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ fee_id: 'unknown-fee', property_type: 'Residential', unit: 'marla', min_area: 0, max_area: null, fee_amount: 1, is_active: true }),
}), 'calculator-fee-rules')
assert.equal(invalidFeeRelationResponse.status, 400)
const residentialRule = feeRules.items[0]
const updateFeeRuleResponse = await api.item(new Request(`${base}/calculator-fee-rules/${residentialRule.id}`, {
  method: 'PATCH', headers: writeHeaders,
  body: JSON.stringify({ fee_id: residentialRule.fee_id, property_type: residentialRule.property_type, unit: residentialRule.unit, min_area: 0, max_area: 10, fee_amount: 82000, is_active: false }),
}), 'calculator-fee-rules', residentialRule.id)
assert.equal(updateFeeRuleResponse.status, 200)
assert.equal((await calculatorConfigApi()).calculator_fee_rules.find((item) => item.id === residentialRule.id).fee_amount, 82000)
const deleteFeeRuleResponse = await api.item(new Request(`${base}/calculator-fee-rules/${newFeeRule.id}`, {
  method: 'DELETE', headers: writeHeaders,
}), 'calculator-fee-rules', newFeeRule.id)
assert.equal(deleteFeeRuleResponse.status, 200)
assert.ok(!(await calculatorConfigApi()).calculator_fee_rules.some((item) => item.id === newFeeRule.id))

const taxonomyMapId = 'dha-lahore-phase-6-master-plan'
const cityCollection = await api.collection(new Request(`${base}/cities`, { headers: readHeaders }), 'cities')
const cities = await cityCollection.json()
assert.deepEqual(Object.keys(cities.fields), ['name', 'map_ids'])
assert.equal(cities.options.map_ids.length, 5)
const newCityResponse = await api.collection(new Request(`${base}/cities`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ name: 'Synthetic Test City', map_ids: [taxonomyMapId] }),
}), 'cities')
assert.equal(newCityResponse.status, 201)
const newCity = (await newCityResponse.json()).item
assert.deepEqual(newCity.map_ids, [taxonomyMapId])
const duplicateCityMapResponse = await api.collection(new Request(`${base}/cities`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ name: 'Another Synthetic City', map_ids: [taxonomyMapId] }),
}), 'cities')
assert.equal(duplicateCityMapResponse.status, 400)
const updatedCityResponse = await api.item(new Request(`${base}/cities/${newCity.id}`, {
  method: 'PATCH', headers: writeHeaders,
  body: JSON.stringify({ name: 'Updated Synthetic City', map_ids: ['bahria-town-lahore-sector-map'] }),
}), 'cities', newCity.id)
assert.equal(updatedCityResponse.status, 200)
assert.equal((await updatedCityResponse.json()).item.name, 'Updated Synthetic City')
const deleteCityResponse = await api.item(new Request(`${base}/cities/${newCity.id}`, { method: 'DELETE', headers: writeHeaders }), 'cities', newCity.id)
assert.equal(deleteCityResponse.status, 200)

for (const [domain, name] of [['societies', 'Synthetic Test Society'], ['phases', 'Synthetic Test Phase']]) {
  const list = await api.collection(new Request(`${base}/${domain}`, { headers: readHeaders }), domain)
  assert.equal((await list.json()).options.map_ids.length, 5)
  const created = await api.collection(new Request(`${base}/${domain}`, {
    method: 'POST', headers: writeHeaders,
    body: JSON.stringify({ name, map_ids: [taxonomyMapId] }),
  }), domain)
  assert.equal(created.status, 201)
  const item = (await created.json()).item
  assert.deepEqual(item.map_ids, [taxonomyMapId])
  const removed = await api.item(new Request(`${base}/${domain}/${item.id}`, { method: 'DELETE', headers: writeHeaders }), domain, item.id)
  assert.equal(removed.status, 200)
}

const categoryListResponse = await api.collection(new Request(`${base}/categories`, { headers: readHeaders }), 'categories')
const categories = await categoryListResponse.json()
assert.deepEqual(Object.keys(categories.fields), ['name'])
assert.ok(categories.columns.includes('pic'))
assert.equal(categories.items[0].pic, '')
const newCategoryResponse = await api.collection(new Request(`${base}/categories`, {
  method: 'POST', headers: writeHeaders, body: JSON.stringify({ name: 'Synthetic Test Category' }),
}), 'categories')
assert.equal(newCategoryResponse.status, 201)
const newCategory = (await newCategoryResponse.json()).item
assert.equal(newCategory.pic, '')
const updateCategoryResponse = await api.item(new Request(`${base}/categories/${newCategory.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ name: 'Updated Synthetic Test Category' }),
}), 'categories', newCategory.id)
assert.equal(updateCategoryResponse.status, 200)
assert.equal((await updateCategoryResponse.json()).item.pic, '')
assert.equal((await api.item(new Request(`${base}/categories/${newCategory.id}`, { method: 'DELETE', headers: writeHeaders }), 'categories', newCategory.id)).status, 200)

const phaseListResponse = await api.collection(new Request(`${base}/calculator-phases`, { headers: readHeaders }), 'calculator-phases')
const phaseList = await phaseListResponse.json()
assert.deepEqual(Object.keys(phaseList.fields), ['city_id', 'society_id', 'name', 'sort_order', 'is_active'])
assert.equal(phaseList.items[0].city_name, 'Lahore')
assert.equal(phaseList.options.city_id[0].value, 'city-lahore')
const newCalculatorPhaseResponse = await api.collection(new Request(`${base}/calculator-phases`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ city_id: 'city-lahore', society_id: 'society-demo', name: 'Synthetic Test Phase', sort_order: 3, is_active: true }),
}), 'calculator-phases')
assert.equal(newCalculatorPhaseResponse.status, 201)
const newCalculatorPhase = (await newCalculatorPhaseResponse.json()).item
assert.equal(newCalculatorPhase.society_name, 'DHA Lahore (Synthetic)')
assert.equal((await api.collection(new Request(`${base}/calculator-phases`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ city_id: 'city-lahore', society_id: 'society-demo', name: 'Synthetic Test Phase', sort_order: 0, is_active: true }),
}), 'calculator-phases')).status, 400)
assert.equal((await api.item(new Request(`${base}/calculator-phases/${newCalculatorPhase.id}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ name: 'Sample Phase' }),
}), 'calculator-phases', newCalculatorPhase.id)).status, 400)
const updateCalculatorPhaseResponse = await api.item(new Request(`${base}/calculator-phases/${newCalculatorPhase.id}`, {
  method: 'PATCH', headers: writeHeaders,
  body: JSON.stringify({ city_id: 'city-lahore', society_id: 'society-demo', name: 'Synthetic Test Phase Updated', sort_order: 4, is_active: false }),
}), 'calculator-phases', newCalculatorPhase.id)
assert.equal(updateCalculatorPhaseResponse.status, 200)
assert.equal((await updateCalculatorPhaseResponse.json()).item.is_active, false)

const blockList = await (await api.collection(new Request(`${base}/calculator-blocks`, { headers: readHeaders }), 'calculator-blocks')).json()
assert.deepEqual(Object.keys(blockList.fields), ['calculator_phase_id', 'name', 'sort_order', 'is_active'])
assert.match(blockList.options.calculator_phase_id[0].label, /Lahore > DHA Lahore \(Synthetic\) > Sample Phase/)
const newCalculatorBlockResponse = await api.collection(new Request(`${base}/calculator-blocks`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ calculator_phase_id: newCalculatorPhase.id, name: 'Synthetic Test Block', sort_order: 2, is_active: true }),
}), 'calculator-blocks')
assert.equal(newCalculatorBlockResponse.status, 201)
const newCalculatorBlock = (await newCalculatorBlockResponse.json()).item
assert.equal(newCalculatorBlock.calculator_phase_name, 'Synthetic Test Phase Updated')
assert.equal((await api.collection(new Request(`${base}/calculator-blocks`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ calculator_phase_id: newCalculatorPhase.id, name: 'Synthetic Test Block', sort_order: 0, is_active: true }),
}), 'calculator-blocks')).status, 400)
const cascadeRateResponse = await api.collection(new Request(`${base}/calculator-rates`, {
  method: 'POST', headers: writeHeaders,
  body: JSON.stringify({ calculator_phase_id: newCalculatorPhase.id, calculator_block_id: newCalculatorBlock.id, calculator_property_type_id: 'type-res-plot', unit: 'marla', dc_rate: 1, fbr_rate: 1, is_active: true }),
}), 'calculator-rates')
assert.equal(cascadeRateResponse.status, 201)
const cascadeRate = (await cascadeRateResponse.json()).item
assert.equal((await api.item(new Request(`${base}/calculator-phases/${newCalculatorPhase.id}`, { method: 'DELETE', headers: writeHeaders }), 'calculator-phases', newCalculatorPhase.id)).status, 200)
assert.ok(!syntheticCalculatorConfig.calculator_blocks.some((item) => item.id === newCalculatorBlock.id))
assert.ok(!syntheticCalculatorConfig.calculator_rates.some((item) => item.id === cascadeRate.id))

const propertyTypeList = await (await api.collection(new Request(`${base}/calculator-property-types`, { headers: readHeaders }), 'calculator-property-types')).json()
assert.deepEqual(Object.keys(propertyTypeList.fields), ['category', 'property_type', 'label', 'sort_order', 'is_active'])
const fixedType = propertyTypeList.items[0]
assert.equal((await api.collection(new Request(`${base}/calculator-property-types`, { method: 'POST', headers: writeHeaders, body: JSON.stringify({ label: 'Not Allowed' }) }), 'calculator-property-types')).status, 405)
assert.equal((await api.item(new Request(`${base}/calculator-property-types/${fixedType.id}`, { method: 'DELETE', headers: writeHeaders }), 'calculator-property-types', fixedType.id)).status, 405)
assert.equal((await api.item(new Request(`${base}/calculator-property-types/${fixedType.id}`, { method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ category: 'Changed' }) }), 'calculator-property-types', fixedType.id)).status, 400)
const updateTypeResponse = await api.item(new Request(`${base}/calculator-property-types/${fixedType.id}`, {
  method: 'PATCH', headers: writeHeaders,
  body: JSON.stringify({ label: 'Synthetic Plot Label', sort_order: fixedType.sort_order + 1, is_active: false }),
}), 'calculator-property-types', fixedType.id)
assert.equal(updateTypeResponse.status, 200)
assert.equal((await updateTypeResponse.json()).item.label, 'Synthetic Plot Label')
assert.equal((await (await api.collection(new Request(`${base}/calculator-property-types`, { headers: readHeaders }), 'calculator-property-types')).json()).items[0].is_active, false)

assert.equal((await api.collection(new Request(`${base}/labels`), 'labels')).status, 401)
const labelListResponse = await api.collection(new Request(`${base}/labels`, { headers: readHeaders }), 'labels')
assert.equal(labelListResponse.status, 200)
assert.ok((await labelListResponse.json()).items.some((label) => label.slug === 'featured'))
assert.equal((await api.collection(new Request(`${base}/labels`, {
  method: 'POST', headers: { ...readHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'No CSRF' }),
}), 'labels')).status, 403)
const newLabelResponse = await api.collection(new Request(`${base}/labels`, {
  method: 'POST', headers: writeHeaders, body: JSON.stringify({ name: 'Synthetic Priority' }),
}), 'labels')
assert.equal(newLabelResponse.status, 201)
const newLabel = (await newLabelResponse.json()).item
assert.equal(newLabel.slug, 'synthetic-priority')
assert.equal(newLabel.is_badge, true)
assert.equal((await api.collection(new Request(`${base}/labels`, {
  method: 'POST', headers: writeHeaders, body: JSON.stringify({ name: 'Synthetic Priority' }),
}), 'labels')).status, 400)
syntheticProperties[0].labels.push({ slug: newLabel.slug, name: newLabel.name })
syntheticFiles[0].adminForm = { ...(syntheticFiles[0].adminForm || {}), labels: [newLabel.slug] }
const badgeToggleResponse = await api.item(new Request(`${base}/labels/${newLabel.slug}`, {
  method: 'PATCH', headers: writeHeaders, body: JSON.stringify({ is_badge: false }),
}), 'labels', newLabel.slug)
assert.equal(badgeToggleResponse.status, 200)
assert.equal((await badgeToggleResponse.json()).item.is_badge, false)
const publicWithLabel = await (await propertyApi.list(new Request('https://test.invalid/api/v1/properties'))).json()
const publicLabel = publicWithLabel.items[0].labels.find((label) => label.slug === newLabel.slug)
assert.deepEqual(publicLabel, { slug: newLabel.slug, name: newLabel.name, isBadge: false })
assert.deepEqual(Object.keys(publicLabel).sort(), ['isBadge', 'name', 'slug'])
const propertiesWithUpdatedOptions = await (await api.collection(new Request(`${base}/properties`, { headers: readHeaders }), 'properties')).json()
assert.equal(propertiesWithUpdatedOptions.options.labels.find((option) => option.value === newLabel.slug).isBadge, false)
assert.equal((await api.item(new Request(`${base}/labels/${newLabel.slug}`, { method: 'DELETE', headers: writeHeaders }), 'labels', newLabel.slug)).status, 200)
assert.ok(syntheticProperties.every((property) => !property.labels.some((label) => label.slug === newLabel.slug)))
assert.ok(!syntheticFiles[0].adminForm.labels.includes(newLabel.slug))
assert.equal((await api.item(new Request(`${base}/labels/${newLabel.slug}`, { headers: readHeaders }), 'labels', newLabel.slug)).status, 404)

console.log('Synthetic admin API checks passed.')
