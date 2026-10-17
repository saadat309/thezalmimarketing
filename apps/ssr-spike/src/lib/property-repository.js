const TAXONOMY_PATHS = {
  category: (property) => property.category?.slug,
  city: (property) => property.location?.city?.slug,
  society: (property) => property.location?.society?.slug,
  phase: (property) => property.location?.phase?.slug,
}

function isPublic(property) {
  return property.public === true && property.fileOnly !== true
}

function matches(property, filters) {
  const equalities = [
    ['category', property.category.slug],
    ['city', property.location.city.slug],
    ['society', property.location.society?.slug],
    ['phase', property.location.phase?.slug],
    ['property_type', property.propertyType],
    ['purchase_type', property.purchaseType],
    ['area_unit', property.area.unit],
    ['label', property.labels.map((label) => label.slug).join(',')],
  ]
  for (const [key, value] of equalities) {
    if (filters[key] !== undefined && !String(value ?? '').split(',').includes(filters[key])) return false
  }
  if (filters.min_beds !== undefined && property.beds < Number(filters.min_beds)) return false
  if (filters.min_baths !== undefined && property.baths < Number(filters.min_baths)) return false
  if (filters.min_area !== undefined && Number(property.area.value) < Number(filters.min_area)) return false
  if (filters.query !== undefined) {
    const searchable = [property.title, property.shortDescription, property.location.address,
      property.location.city.name, property.category.name, property.location.society?.name,
      property.location.phase?.name, ...property.labels.map((label) => label.name)]
      .filter(Boolean).join(' ').toLowerCase()
    if (!searchable.includes(filters.query.toLowerCase())) return false
  }
  return true
}

function encodeCursor(property) {
  const data = JSON.stringify({ createdAt: property.createdAt, slug: property.slug })
  return btoa(data).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function decodeCursor(value, properties) {
  try {
    const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
    const data = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')))
    if (typeof data.createdAt !== 'string' || typeof data.slug !== 'string') return null
    const anchor = properties.find((property) => property.slug === data.slug)
    if (!anchor || anchor.createdAt !== data.createdAt) return null
    return anchor
  } catch {
    return null
  }
}

/**
 * Synthetic-only repository adapter. A future D1 adapter can implement the same
 * methods without changing HTTP validation, public projection, sanitization, or ETags.
 */
export function createMemoryPropertyRepository(source) {
  return {
    async hasPublicTaxonomySlug(name, slug) {
      const getSlug = TAXONOMY_PATHS[name]
      return Boolean(getSlug && source.some((property) => isPublic(property) && getSlug(property) === slug))
    },

    async listPublicProperties({ filters, limit, cursor }) {
      let properties = source.filter(isPublic)
        .filter((property) => matches(property, filters))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id)
      if (cursor) {
        const anchor = decodeCursor(cursor, properties)
        if (!anchor) return { invalidCursor: true, items: [], hasMore: false }
        properties = properties.slice(properties.indexOf(anchor) + 1)
      }
      const items = properties.slice(0, limit)
      const hasMore = properties.length > limit
      return {
        items,
        hasMore,
        nextCursor: hasMore ? encodeCursor(items.at(-1)) : null,
      }
    },

    async findPublicPropertyBySlug(slug) {
      return source.find((property) => property.slug === slug && isPublic(property)) ?? null
    },
  }
}
