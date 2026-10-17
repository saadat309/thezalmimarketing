import { syntheticFiles, syntheticMaps } from './directory-fixtures.js'
import { syntheticProperties } from './property-fixtures.js'

const DOMAIN_FIELDS = {
  properties: { title: 'text', category: 'text', city: 'text', price: 'integer', visible: 'boolean' },
  files: { title: 'text', city: 'text', fileType: 'text', visible: 'boolean' },
  maps: { title: 'text', city: 'text', visible: 'boolean' },
  cities: { name: 'text', slug: 'slug', active: 'boolean' },
  categories: { name: 'text', slug: 'slug', active: 'boolean' },
  societies: { name: 'text', slug: 'slug', city: 'text', active: 'boolean' },
  phases: { name: 'text', slug: 'slug', society: 'text', active: 'boolean' },
  queries: { name: 'text', topic: 'text', status: 'text', isRead: 'boolean' },
  'landing-page': { sectionName: 'text', title: 'text', order: 'number', active: 'boolean' },
  'calculator-phases': { name: 'text', active: 'boolean' },
  'calculator-blocks': { name: 'text', phase: 'text', active: 'boolean' },
  'calculator-property-types': { name: 'text', active: 'boolean' },
  'calculator-rates': { name: 'text', phase: 'text', block: 'text', propertyType: 'text', amount: 'number' },
  'calculator-transfer-fees': { name: 'text', phase: 'text', block: 'text', amount: 'number' },
  'calculator-fees': { name: 'text', amount: 'number' },
  'calculator-tax-rates': { name: 'text', rate: 'number' },
  'calculator-fee-rules': { name: 'text', fee: 'text', rule: 'text' },
}

const initial = {
  cities: [{ id: 'city-lahore', name: 'Lahore', slug: 'lahore', active: true }, { id: 'city-multan', name: 'Multan', slug: 'multan', active: true }],
  categories: [{ id: 'category-homes', name: 'Homes', slug: 'homes', active: true }],
  societies: [{ id: 'society-sample', name: 'Sample Garden Society', slug: 'sample-garden', city: 'Lahore', active: true }],
  phases: [{ id: 'phase-sample', name: 'Sample Phase One', slug: 'sample-phase-one', society: 'Sample Garden Society', active: true }],
  queries: [{ id: 'query-sample-1', name: 'Synthetic Visitor', topic: 'Property information', status: 'new', isRead: false }],
  'landing-page': [{ id: 'section-featured', sectionName: 'Featured Properties', title: 'Featured synthetic properties', order: 1, active: true }],
  'calculator-phases': [{ id: 'calc-phase-sample', name: 'Sample Phase', active: true }],
  'calculator-blocks': [{ id: 'calc-block-sample', name: 'Sample Block', phase: 'Sample Phase', active: true }],
  'calculator-property-types': [{ id: 'calc-type-house', name: 'House', active: true }],
  'calculator-rates': [{ id: 'calc-rate-sample', name: 'Sample residential rate', phase: 'Sample Phase', block: 'Sample Block', propertyType: 'House', amount: 1000 }],
  'calculator-transfer-fees': [{ id: 'calc-transfer-sample', name: 'Sample transfer fee', phase: 'Sample Phase', block: 'Sample Block', amount: 5000 }],
  'calculator-fees': [{ id: 'calc-fee-sample', name: 'Sample processing fee', amount: 2500 }],
  'calculator-tax-rates': [{ id: 'calc-tax-sample', name: 'Sample tax rate', rate: 1 }],
  'calculator-fee-rules': [{ id: 'calc-rule-sample', name: 'Sample fee rule', fee: 'Sample processing fee', rule: 'Synthetic example only' }],
}

const records = new Map(Object.entries(initial).map(([domain, items]) => [domain, items.map((item) => ({ ...item }))]))
const publicSources = { properties: syntheticProperties, files: syntheticFiles, maps: syntheticMaps }
let nextId = 1

function toSlug(value) {
  return value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'synthetic-record'
}

function sourceId(domain, item) {
  return domain === 'properties' ? String(item.id) : item.slug
}

function toAdminRecord(domain, item) {
  if (domain === 'properties') return { id: sourceId(domain, item), title: item.title, category: item.category?.name || '', city: item.location?.city?.name || '', price: Number(item.price) || 0, visible: item.public === true }
  if (domain === 'files') return { id: item.slug, title: item.title, city: item.cityName, fileType: item.fileType, visible: item.public === true }
  return { id: item.slug, title: item.title, city: item.cityName, visible: item.public === true }
}

function publicSourceList(domain) {
  const source = publicSources[domain]
  return domain === 'properties' ? source.filter((item) => item.fileOnly !== true).map((item) => toAdminRecord(domain, item)) : source.map((item) => toAdminRecord(domain, item))
}

function findPublicSource(domain, id) {
  const source = publicSources[domain]
  return source.find((item) => sourceId(domain, item) === String(id) && (domain !== 'properties' || item.fileOnly !== true)) || null
}

function applyPublicFields(domain, target, fields) {
  if (fields.title !== undefined) target.title = fields.title
  if (fields.visible !== undefined) target.public = fields.visible
  if (domain === 'properties') {
    if (fields.category !== undefined) target.category = { ...target.category, name: fields.category, slug: toSlug(fields.category) }
    if (fields.city !== undefined) target.location.city = { ...target.location.city, name: fields.city, slug: toSlug(fields.city) }
    if (fields.price !== undefined) target.price = String(fields.price)
  } else {
    if (fields.city !== undefined) {
      target.cityName = fields.city
      target.city = toSlug(fields.city)
    }
    if (domain === 'files' && fields.fileType !== undefined) target.fileType = fields.fileType
  }
  return toAdminRecord(domain, target)
}

function createPublicSource(domain, fields) {
  const source = publicSources[domain]
  const template = source[0]
  if (!template) return null
  const baseSlug = toSlug(fields.title)
  let slug = baseSlug
  let suffix = 2
  while (source.some((item) => item.slug === slug)) slug = `${baseSlug}-${suffix++}`
  const target = structuredClone(template)
  target.slug = slug
  target.title = fields.title
  target.public = fields.visible === true
  target.updatedAt = new Date().toISOString().slice(0, 10)
  if (domain === 'properties') {
    const numericIds = source.map((item) => Number(item.id)).filter(Number.isFinite)
    target.id = Math.max(0, ...numericIds) + 1
    target.fileOnly = false
    target.createdAt = new Date().toISOString()
    target.category = { ...target.category, name: fields.category || target.category.name, slug: toSlug(fields.category || target.category.name) }
    target.location.city = { ...target.location.city, name: fields.city || target.location.city.name, slug: toSlug(fields.city || target.location.city.name) }
    target.price = String(fields.price ?? 0)
  } else {
    target.cityName = fields.city || target.cityName
    target.city = toSlug(fields.city || target.cityName)
    if (domain === 'files') target.fileType = fields.fileType || target.fileType
  }
  source.push(target)
  return toAdminRecord(domain, target)
}

function updatePublicSource(domain, id, fields) {
  const target = findPublicSource(domain, id)
  return target ? applyPublicFields(domain, target, fields) : null
}

function removePublicSource(domain, id) {
  const source = publicSources[domain]
  const index = source.findIndex((item) => sourceId(domain, item) === String(id) && (domain !== 'properties' || item.fileOnly !== true))
  if (index < 0) return false
  source.splice(index, 1)
  return true
}

function json(request, body, status = 200, extraHeaders = {}) {
  const headers = new Headers({ 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders })
  const origin = request.headers.get('Origin')
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Credentials', 'true')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    headers.append('Vary', 'Origin')
  }
  return Response.json(body, { status, headers })
}

async function readBody(request) {
  const length = Number(request.headers.get('Content-Length') || 0)
  if (length > 12_000) return { error: 'too_large' }
  try {
    const text = await request.text()
    if (new TextEncoder().encode(text).byteLength > 12_000) return { error: 'too_large' }
    const value = JSON.parse(text)
    return value && typeof value === 'object' && !Array.isArray(value) ? { value } : { error: 'invalid_json' }
  } catch {
    return { error: 'invalid_json' }
  }
}

function validateFields(domain, input) {
  const schema = DOMAIN_FIELDS[domain]
  const result = {}
  const errors = {}
  for (const key of Object.keys(input)) {
    if (!Object.hasOwn(schema, key)) {
      errors[key] = 'Field is not editable.'
      continue
    }
    const type = schema[key]
    const value = input[key]
    if (type === 'boolean' && typeof value === 'boolean') result[key] = value
    else if (type === 'number' && typeof value === 'number' && Number.isFinite(value) && value >= 0) result[key] = value
    else if (type === 'integer' && typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) result[key] = value
    else if (type === 'slug' && typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) result[key] = value
    else if (type === 'text' && typeof value === 'string' && value.trim().length > 0 && value.length <= 300) result[key] = value.trim()
    else errors[key] = 'Value is invalid.'
  }
  if (!Object.keys(result).length && !Object.keys(errors).length) errors._ = 'Provide at least one editable field.'
  return { result, errors }
}

export function createMemoryAdminRepository() {
  return {
    list(domain) { return publicSources[domain] ? publicSourceList(domain) : (records.get(domain) || []).map((item) => ({ ...item })) },
    find(domain, id) { return publicSources[domain] ? (findPublicSource(domain, id) ? toAdminRecord(domain, findPublicSource(domain, id)) : null) : records.get(domain)?.find((item) => item.id === id) || null },
    insert(domain, fields) {
      if (publicSources[domain]) return createPublicSource(domain, fields)
      const item = { id: `${domain.replaceAll('-', '').slice(0, 8)}-sample-${nextId++}`, ...fields }
      records.get(domain).push(item)
      return { ...item }
    },
    update(domain, id, fields) {
      if (publicSources[domain]) return updatePublicSource(domain, id, fields)
      const list = records.get(domain) || []
      const index = list.findIndex((item) => item.id === id)
      if (index < 0) return null
      list[index] = { ...list[index], ...fields }
      return { ...list[index] }
    },
    remove(domain, id) {
      if (publicSources[domain]) return removePublicSource(domain, id)
      const list = records.get(domain) || []
      const index = list.findIndex((item) => item.id === id)
      if (index < 0) return false
      list.splice(index, 1)
      return true
    },
  }
}

export function createAdminDataApi(repository, auth) {
  return {
    async collection(request, domain) {
      if (domain === 'users') {
        if (request.method === 'OPTIONS') return auth.options(request)
        const guard = auth.requireAdmin(request)
        if (guard.response) return guard.response
        if (request.method !== 'GET') return json(request, { error: { code: 'read_only_resource' } }, 405)
        return json(request, {
          items: [
            { id: 'staging-admin-1', email: 'admin.one@staging.invalid', name: 'Staging Admin One', role: 'Admin', active: true },
            { id: 'staging-admin-2', email: 'admin.two@staging.invalid', name: 'Staging Admin Two', role: 'Admin', active: true },
          ],
          count: 2,
          readOnly: true,
        })
      }
      if (domain === 'profile') {
        if (request.method === 'OPTIONS') return auth.options(request)
        const guard = auth.requireAdmin(request)
        if (guard.response) return guard.response
        if (request.method !== 'GET') return json(request, { error: { code: 'read_only_resource' } }, 405)
        return json(request, { user: guard.user, readOnly: true })
      }
      if (!Object.hasOwn(DOMAIN_FIELDS, domain)) return json(request, { error: { code: 'unknown_domain' } }, 404)
      if (request.method === 'OPTIONS') return auth.options(request)
      const mutation = request.method !== 'GET' && request.method !== 'OPTIONS'
      const guard = auth.requireAdmin(request, { csrf: mutation })
      if (guard.response) return guard.response
      if (request.method === 'GET') {
        const items = repository.list(domain)
        return json(request, { items, count: items.length, fields: DOMAIN_FIELDS[domain] })
      }
      if (request.method !== 'POST') return json(request, { error: { code: 'method_not_allowed' } }, 405)
      const body = await readBody(request)
      if (body.error) return json(request, { error: { code: body.error } }, body.error === 'too_large' ? 413 : 400)
      const { result, errors } = validateFields(domain, body.value)
      if (Object.keys(errors).length) return json(request, { error: { code: 'invalid_fields', fields: errors } }, 400)
      return json(request, { item: repository.insert(domain, result) }, 201)
    },

    async item(request, domain, id) {
      if (domain === 'users' || domain === 'profile') {
        const guard = auth.requireAdmin(request, { csrf: request.method !== 'GET' })
        if (guard.response) return guard.response
        return json(request, { error: { code: 'read_only_resource' } }, 405)
      }
      if (!Object.hasOwn(DOMAIN_FIELDS, domain)) return json(request, { error: { code: 'unknown_domain' } }, 404)
      if (request.method === 'OPTIONS') return auth.options(request)
      const mutation = request.method === 'PUT' || request.method === 'PATCH' || request.method === 'DELETE'
      const guard = auth.requireAdmin(request, { csrf: mutation })
      if (guard.response) return guard.response
      if (request.method === 'GET') {
        const item = repository.find(domain, id)
        return item ? json(request, { item }) : json(request, { error: { code: 'not_found' } }, 404)
      }
      if (request.method === 'DELETE') {
        return repository.remove(domain, id) ? json(request, { ok: true }) : json(request, { error: { code: 'not_found' } }, 404)
      }
      if (!['PUT', 'PATCH'].includes(request.method)) return json(request, { error: { code: 'method_not_allowed' } }, 405)
      const body = await readBody(request)
      if (body.error) return json(request, { error: { code: body.error } }, body.error === 'too_large' ? 413 : 400)
      const { result, errors } = validateFields(domain, body.value)
      if (Object.keys(errors).length) return json(request, { error: { code: 'invalid_fields', fields: errors } }, 400)
      const item = repository.update(domain, id, result)
      return item ? json(request, { item }) : json(request, { error: { code: 'not_found' } }, 404)
    },
  }
}

export const ADMIN_DOMAINS = Object.freeze(Object.keys(DOMAIN_FIELDS))
export const ADMIN_DOMAIN_FIELDS = DOMAIN_FIELDS
