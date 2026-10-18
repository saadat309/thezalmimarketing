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

function fromD1Row(row) {
  const property = JSON.parse(row.property_json)
  property.id = Number(row.id)
  return property
}

function searchText(property) {
  return [property.title, property.shortDescription, property.location?.address,
    property.location?.city?.name, property.category?.name, property.location?.society?.name,
    property.location?.phase?.name, ...(property.labels || []).map((label) => label.name)]
    .filter(Boolean).join(' ').toLowerCase()
}

function propertyColumns(property) {
  const location = property.location || {}
  const category = property.category || {}
  return [
    property.slug,
    property.public === true ? 1 : 0,
    property.fileOnly === true ? 1 : 0,
    property.createdAt || new Date().toISOString(),
    property.title || '',
    property.propertyType || 'Residential',
    property.purchaseType || 'sale',
    category.slug || '',
    location.city?.slug || '',
    location.society?.slug || '',
    location.phase?.slug || '',
    Number(property.area?.value) || 0,
    property.area?.unit || 'sqft',
    Number(property.beds) || 0,
    Number(property.baths) || 0,
    JSON.stringify((property.labels || []).map((label) => label.slug)),
    searchText(property),
    JSON.stringify(Object.fromEntries(Object.entries(property).filter(([key]) => key !== 'id'))),
  ]
}

const COLUMN_BY_FILTER = {
  category: 'category_slug', city: 'city_slug', society: 'society_slug', phase: 'phase_slug',
  property_type: 'property_type', purchase_type: 'purchase_type', area_unit: 'area_unit',
}

function filterSql(filters) {
  const clauses = ['is_public = 1', 'file_only = 0']
  const values = []
  for (const [filter, column] of Object.entries(COLUMN_BY_FILTER)) {
    if (filters[filter] !== undefined) {
      clauses.push(`${column} = ?`)
      values.push(filters[filter])
    }
  }
  for (const [filter, column] of [['min_beds', 'beds'], ['min_baths', 'baths'], ['min_area', 'area_value']]) {
    if (filters[filter] !== undefined) {
      clauses.push(`${column} >= ?`)
      values.push(Number(filters[filter]))
    }
  }
  if (filters.label !== undefined) {
    clauses.push('EXISTS (SELECT 1 FROM json_each(staging_properties.label_slugs_json) WHERE json_each.value = ?)')
    values.push(filters.label)
  }
  if (filters.query !== undefined) {
    const escaped = filters.query.toLowerCase().replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')
    clauses.push("search_text LIKE ? ESCAPE '\\'")
    values.push(`%${escaped}%`)
  }
  return { sql: clauses.join(' AND '), values }
}

function cursorData(cursor) {
  try {
    const base64 = cursor.replaceAll('-', '+').replaceAll('_', '/')
    const data = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')))
    return typeof data.createdAt === 'string' && typeof data.slug === 'string' ? data : null
  } catch {
    return null
  }
}

function encodeD1Cursor(property) {
  const data = JSON.stringify({ createdAt: property.createdAt, slug: property.slug })
  return btoa(data).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

/**
 * Local/Cloudflare D1 adapter for the synthetic property domain. Filter values
 * are bound parameters; JSON remains the source of truth for API projection.
 */
export function createD1PropertyRepository(database) {
  if (!database) throw new Error('The local staging D1 binding is required.')

  async function getRowById(id, { publicOnly = false, adminOnly = false } = {}) {
    const numericId = Number(id)
    if (!Number.isSafeInteger(numericId) || numericId < 1) return null
    const visibility = publicOnly ? ' AND is_public = 1 AND file_only = 0' : adminOnly ? ' AND file_only = 0' : ''
    const row = await database.prepare(`SELECT id, property_json FROM staging_properties WHERE id = ?${visibility} LIMIT 1`).bind(numericId).first()
    return row ? fromD1Row(row) : null
  }

  return {
    async hasPublicTaxonomySlug(name, slug) {
      const column = { category: 'category_slug', city: 'city_slug', society: 'society_slug', phase: 'phase_slug' }[name]
      if (!column) return false
      const row = await database.prepare(`SELECT 1 AS found FROM staging_properties WHERE is_public = 1 AND file_only = 0 AND ${column} = ? LIMIT 1`).bind(slug).first()
      return Boolean(row)
    },

    async listPublicProperties({ filters, limit, cursor }) {
      const where = filterSql(filters)
      let anchor = null
      if (cursor) {
        const data = cursorData(cursor)
        if (!data) return { invalidCursor: true, items: [], hasMore: false }
        const row = await database.prepare(`SELECT id, slug, created_at AS createdAt FROM staging_properties WHERE ${where.sql} AND slug = ? AND created_at = ? LIMIT 1`)
          .bind(...where.values, data.slug, data.createdAt).first()
        if (!row) return { invalidCursor: true, items: [], hasMore: false }
        anchor = row
      }

      const clauses = [where.sql]
      const values = [...where.values]
      if (anchor) {
        clauses.push('(created_at < ? OR (created_at = ? AND id < ?))')
        values.push(anchor.createdAt, anchor.createdAt, Number(anchor.id))
      }
      const result = await database.prepare(`
        SELECT id, property_json FROM staging_properties
        WHERE ${clauses.join(' AND ')}
        ORDER BY created_at DESC, id DESC
        LIMIT ?
      `).bind(...values, limit + 1).all()
      const rows = result.results || []
      const hasMore = rows.length > limit
      const items = rows.slice(0, limit).map(fromD1Row)
      return { items, hasMore, nextCursor: hasMore ? encodeD1Cursor(items.at(-1)) : null }
    },

    async findPublicPropertyBySlug(slug) {
      const row = await database.prepare(`
        SELECT id, property_json FROM staging_properties
        WHERE slug = ? AND is_public = 1 AND file_only = 0 LIMIT 1
      `).bind(slug).first()
      return row ? fromD1Row(row) : null
    },

    async listAllProperties() {
      const result = await database.prepare('SELECT id, property_json FROM staging_properties ORDER BY id ASC').all()
      return (result.results || []).map(fromD1Row)
    },

    async findPropertyById(id) {
      return getRowById(id, { adminOnly: true })
    },

    async insertPropertyRecord(property) {
      const columns = propertyColumns(property)
      const explicitId = Number.isSafeInteger(Number(property.id)) && Number(property.id) > 0
      const names = explicitId ? 'id, slug, is_public, file_only, created_at, title, property_type, purchase_type, category_slug, city_slug, society_slug, phase_slug, area_value, area_unit, beds, baths, label_slugs_json, search_text, property_json'
        : 'slug, is_public, file_only, created_at, title, property_type, purchase_type, category_slug, city_slug, society_slug, phase_slug, area_value, area_unit, beds, baths, label_slugs_json, search_text, property_json'
      const placeholders = Array(explicitId ? 19 : 18).fill('?').join(', ')
      const values = explicitId ? [Number(property.id), ...columns] : columns
      const result = await database.prepare(`INSERT INTO staging_properties (${names}) VALUES (${placeholders})`).bind(...values).run()
      const id = explicitId ? Number(property.id) : Number(result.meta?.last_row_id)
      if (Number.isSafeInteger(id) && id > 0) return getRowById(id)
      const row = await database.prepare('SELECT id, property_json FROM staging_properties WHERE slug = ? LIMIT 1').bind(property.slug).first()
      return row ? fromD1Row(row) : null
    },

    async updatePropertyRecord(id, property) {
      const numericId = Number(id)
      if (!Number.isSafeInteger(numericId) || numericId < 1) return null
      const columns = propertyColumns({ ...property, id: undefined })
      const result = await database.prepare(`
        UPDATE staging_properties SET
          slug = ?, is_public = ?, file_only = ?, created_at = ?, title = ?, property_type = ?,
          purchase_type = ?, category_slug = ?, city_slug = ?, society_slug = ?, phase_slug = ?,
          area_value = ?, area_unit = ?, beds = ?, baths = ?, label_slugs_json = ?, search_text = ?, property_json = ?
        WHERE id = ? AND file_only = 0
      `).bind(...columns, numericId).run()
      if (result.meta?.changes === 0) return null
      return getRowById(id)
    },

    async deletePropertyRecord(id) {
      const numericId = Number(id)
      if (!Number.isSafeInteger(numericId) || numericId < 1) return false
      const result = await database.prepare('DELETE FROM staging_properties WHERE id = ? AND file_only = 0').bind(numericId).run()
      return Number(result.meta?.changes || 0) > 0
    },

    async removeLabelFromProperties(slug) {
      await database.prepare(`
        UPDATE staging_properties
        SET label_slugs_json = COALESCE((
              SELECT json_group_array(value) FROM json_each(staging_properties.label_slugs_json) WHERE value <> ?
            ), '[]'),
            property_json = json_set(property_json, '$.labels', json(COALESCE((
              SELECT json_group_array(json(value))
              FROM json_each(staging_properties.property_json, '$.labels')
              WHERE json_extract(value, '$.slug') <> ?
            ), '[]')))
        WHERE EXISTS (SELECT 1 FROM json_each(staging_properties.label_slugs_json) WHERE value = ?)
      `).bind(slug, slug, slug).run()
    },
  }
}

export function propertySeedSql(properties) {
  return properties.map((property) => {
    const values = propertyColumns(property).map((value) => `'${String(value).replaceAll("'", "''")}'`)
    return `INSERT OR IGNORE INTO staging_properties (id, slug, is_public, file_only, created_at, title, property_type, purchase_type, category_slug, city_slug, society_slug, phase_slug, area_value, area_unit, beds, baths, label_slugs_json, search_text, property_json) VALUES (${Number(property.id)}, ${values.join(', ')});`
  }).join('\n')
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
