const CACHE_CONTROL = 'no-cache, must-revalidate'
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50
const ALLOWED_QUERY = new Set([
  'query', 'category', 'city', 'society', 'phase', 'property_type',
  'purchase_type', 'min_beds', 'min_baths', 'min_area', 'area_unit',
  'label', 'limit', 'cursor',
])

function responseHeaders(etag) {
  return {
    'Cache-Control': CACHE_CONTROL,
    ETag: etag,
    'Content-Type': 'application/json; charset=utf-8',
  }
}

function jsonError(status, code, fields = {}) {
  return Response.json(
    { error: { code, fields } },
    { status, headers: { 'Cache-Control': 'no-store' } },
  )
}

const ALLOWED_DESCRIPTION_TAGS = new Set(['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'a'])
const DROP_DESCRIPTION_CONTENT = 'script,style,iframe,object,embed,svg,math,form,template'

async function sanitizeDescription(input) {
  if (typeof input !== 'string' || input.length > 20_000) {
    throw new Error('Description is missing or exceeds the synthetic safety limit.')
  }
  const marker = crypto.randomUUID()
  const start = `ZALMI_START_${marker}`
  const end = `ZALMI_END_${marker}`
  const html = `${start}${input}${end}`
  const safeHtml = await new HTMLRewriter()
    .on(DROP_DESCRIPTION_CONTENT, { element(element) { element.remove() } })
    .on('*', {
      element(element) {
        if (!ALLOWED_DESCRIPTION_TAGS.has(element.tagName.toLowerCase())) {
          element.removeAndKeepContent()
          return
        }
        const attributes = [...element.attributes]
        for (const [name, value] of attributes) {
          if (element.tagName.toLowerCase() !== 'a' || name.toLowerCase() !== 'href') {
            element.removeAttribute(name)
            continue
          }
          try {
            const base = 'https://migration.local.invalid'
            const parsed = new URL(value, base)
            const absoluteHttps = /^https:\/\//i.test(value) && parsed.protocol === 'https:'
            const safeRelative = parsed.origin === base && !value.startsWith('//')
            if (!absoluteHttps && !safeRelative) element.removeAttribute(name)
          } catch {
            element.removeAttribute(name)
          }
        }
      },
    })
    .transform(new Response(html))
    .text()
  const startIndex = safeHtml.indexOf(start)
  const endIndex = safeHtml.indexOf(end, startIndex + start.length)
  if (startIndex < 0 || endIndex < 0) throw new Error('Description sanitizer failed.')
  return safeHtml.slice(startIndex + start.length, endIndex)
}

async function publicProperty(property, detail = false) {
  const images = property.images
    .filter((image) => image.public && !image.hidden)
    .sort((a, b) => a.position - b.position)
    .map(({ url, alt }) => ({ url, alt }))
  const thumbnailImage = images.find((image) => image.url === property.thumbnailUrl)
    ?? images[0]

  const result = {
    slug: property.slug,
    title: property.title,
    propertyType: property.propertyType,
    purchaseType: property.purchaseType,
    location: property.location,
    price: { amount: property.price, currency: 'PKR' },
    area: property.area,
    beds: property.beds,
    baths: property.baths,
    category: property.category,
    labels: property.labels,
    media: {
      thumbnail: thumbnailImage ?? null,
      images,
      video: detail && property.public && property.video?.public
        ? { url: property.video.url, title: property.video.title }
        : null,
    },
  }

  if (detail) {
    result.shortDescription = property.shortDescription
    result.descriptionHtml = await sanitizeDescription(property.descriptionHtml)
  }

  return result
}

async function etagFor(body) {
  const bytes = new TextEncoder().encode(body)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const encoded = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
  return `W/"${encoded}"`
}

async function jsonWithValidation(request, body, status = 200) {
  const serialized = JSON.stringify(body)
  const etag = await etagFor(serialized)
  const headers = responseHeaders(etag)
  if (request.headers.get('If-None-Match')?.split(',').map((item) => item.trim()).includes(etag)) {
    return new Response(null, { status: 304, headers })
  }
  return new Response(serialized, { status, headers })
}

function readFilters(url) {
  const params = url.searchParams
  const fields = {}
  for (const key of params.keys()) {
    if (!ALLOWED_QUERY.has(key)) fields[key] = 'Unsupported filter.'
    if (params.getAll(key).length > 1) fields[key] = 'Must be provided once.'
  }
  const rawLimit = params.get('limit')
  const limit = rawLimit === null ? DEFAULT_LIMIT : Number(rawLimit)
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    fields.limit = `Must be an integer from 1 to ${MAX_LIMIT}.`
  }
  for (const key of ['min_beds', 'min_baths', 'min_area']) {
    if (params.has(key) && (!/^\d+(\.\d+)?$/.test(params.get(key)) || Number(params.get(key)) < 0)) {
      fields[key] = 'Must be a non-negative number.'
    }
  }
  for (const key of ['category', 'city', 'society', 'phase']) {
    if (params.has(key) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(params.get(key))) {
      fields[key] = 'Must be a valid taxonomy slug.'
    }
  }
  if (params.has('property_type') && !['Residential', 'Commercial'].includes(params.get('property_type'))) {
    fields.property_type = 'Unsupported property type.'
  }
  if (params.has('purchase_type') && !['sale', 'rent', 'installment'].includes(params.get('purchase_type'))) {
    fields.purchase_type = 'Unsupported purchase type.'
  }
  if (params.has('area_unit') && !['sqft', 'marla', 'kanal', 'hectare', 'acre', 'yard'].includes(params.get('area_unit'))) {
    fields.area_unit = 'Unsupported area unit.'
  }
  if (params.has('min_area') !== params.has('area_unit')) {
    fields.area_unit = 'min_area and area_unit must be provided together.'
  }
  return { fields, filters: params, limit }
}

export function createPropertyApi(repository) {
  return {
    async list(request) {
      const url = new URL(request.url)
      const { fields, filters, limit } = readFilters(url)
      if (Object.keys(fields).length) return jsonError(400, 'invalid_query', fields)

      try {
        for (const key of ['category', 'city', 'society', 'phase']) {
          const slug = filters.get(key)
          if (slug && !await repository.hasPublicTaxonomySlug(key, slug)) {
            fields[key] = 'Unknown taxonomy slug.'
          }
        }
        if (Object.keys(fields).length) return jsonError(400, 'invalid_query', fields)
        const result = await repository.listPublicProperties({
          filters: Object.fromEntries(filters),
          limit,
          cursor: filters.get('cursor') ?? undefined,
        })
        if (result.invalidCursor) {
          return jsonError(400, 'invalid_cursor', { cursor: 'Invalid continuation token.' })
        }
        const body = {
          items: await Promise.all(result.items.map((property) => publicProperty(property))),
          page: {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
          },
        }
        return await jsonWithValidation(request, body)
      } catch {
        return jsonError(500, 'content_unavailable')
      }
    },

    async detail(request, slug) {
      const property = await repository.findPublicPropertyBySlug(slug)
      if (!property) return jsonError(404, 'not_found')
      try {
        return await jsonWithValidation(request, await publicProperty(property, true))
      } catch {
        return jsonError(500, 'content_unavailable')
      }
    },
  }
}

export { CACHE_CONTROL, DEFAULT_LIMIT, MAX_LIMIT }
