const TAXONOMY_TABLES = Object.freeze({
  category: 'categories', city: 'cities', society: 'societies', phase: 'phases',
})

const PROPERTY_SELECT = `
  SELECT p.*, d.text AS description_text, d.hide AS description_hide,
    c.slug AS category_slug, c.name AS category_name,
    ci.slug AS city_slug, ci.name AS city_name,
    s.slug AS society_slug, s.name AS society_name,
    ph.slug AS phase_slug, ph.name AS phase_name,
    COALESCE((SELECT json_group_array(json_object('slug', l.slug, 'name', l.name, 'is_badge', l.is_badge))
      FROM property_labels pl JOIN labels l ON l.id = pl.label_id
      WHERE pl.property_id = p.id AND l.hide = 0 ORDER BY pl.position, l.id), '[]') AS labels_json,
    COALESCE((SELECT json_group_array(json_object('slug', rp.slug, 'title', rp.title))
      FROM property_related_properties rel JOIN properties rp ON rp.id = rel.related_property_id
      WHERE rel.property_id = p.id ORDER BY rel.position, rp.id), '[]') AS related_json
  FROM properties p
  LEFT JOIN detail_descriptions d ON d.id = p.detail_description_id
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN cities ci ON ci.id = p.city_id
  LEFT JOIN societies s ON s.id = p.society_id
  LEFT JOIN phases ph ON ph.id = p.phase_id
`

function parseJson(value, fallback = []) {
  try { return JSON.parse(value || JSON.stringify(fallback)) } catch { return fallback }
}

function fromD1Row(row) {
  const amount = row.price_amount === null ? '' : String(row.price_amount ?? 0)
  const labels = parseJson(row.labels_json).map((label) => ({ slug: label.slug, name: label.name }))
  const related = parseJson(row.related_json).map((item) => item.slug).filter(Boolean)
  const property = {
    id: Number(row.id),
    slug: row.slug || '',
    title: row.title,
    propertyType: row.property_type,
    fileType: row.file_type,
    purchaseType: row.purchase_type,
    fileOnly: row.is_file === 1,
    isFurnished: row.is_furnished === 1,
    shortDescription: row.short_desc || '',
    location: {
      address: row.address || '',
      city: row.city_slug ? { slug: row.city_slug, name: row.city_name } : null,
      society: row.society_slug ? { slug: row.society_slug, name: row.society_name } : null,
      phase: row.phase_slug ? { slug: row.phase_slug, name: row.phase_name } : null,
    },
    category: row.category_slug ? { slug: row.category_slug, name: row.category_name } : null,
    area: { value: String(row.area ?? 0), unit: row.unit || '' },
    price: amount,
    beds: Number(row.beds) || 0,
    baths: Number(row.baths) || 0,
    labels,
    images: [],
    thumbnailUrl: null,
    video: null,
    descriptionHtml: row.description_text || '',
    descriptionHidden: row.description_hide === 1,
    public: row.hide === 0,
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
    adminForm: {
      property_type: row.property_type,
      purchase_type: row.purchase_type,
      is_furnished: row.is_furnished === 1,
      features: row.features || '',
      is_discounted: row.is_discounted === 1,
      price_original_amount: row.price_original_amount ?? '',
      price_period_unit: row.price_period_unit || 'month',
      price_period_value: row.price_period_value ?? 1,
      installment_advance_amount: row.installment_advance_amount ?? '',
      installment_total_period_text: row.installment_total_period_text || '',
      installment_amount: row.installment_amount ?? '',
      installment_display_mode: row.installment_display_mode || 'installment',
      category_id: row.category_slug || '',
      city_id: row.city_slug || '',
      society_id: row.society_slug || '',
      phase_id: row.phase_slug || '',
      related_products: related,
      labels: labels.map((label) => label.slug),
      detailed_description_content: row.description_text || '',
      embed_link: row.embed_link || '',
      template: 'default',
    },
  }
  return property
}

function clausesFor(filters, isFile = false) {
  const clauses = ['p.hide = 0', `COALESCE(p.is_file, 0) = ${isFile ? 1 : 0}`, 'p.slug IS NOT NULL']
  const values = []
  for (const [filter, column] of Object.entries({
    category: 'c.slug', city: 'ci.slug', society: 's.slug', phase: 'ph.slug',
    property_type: 'p.property_type', purchase_type: 'p.purchase_type', area_unit: 'p.unit',
  })) {
    if (filters[filter] !== undefined) { clauses.push(`${column} = ?`); values.push(filters[filter]) }
  }
  for (const [filter, column] of [['min_beds', 'p.beds'], ['min_baths', 'p.baths'], ['min_area', 'p.area']]) {
    if (filters[filter] !== undefined) { clauses.push(`${column} >= ?`); values.push(Number(filters[filter])) }
  }
  if (filters.label !== undefined) {
    clauses.push('EXISTS (SELECT 1 FROM property_labels pl JOIN labels l ON l.id = pl.label_id WHERE pl.property_id = p.id AND l.slug = ? AND l.hide = 0 AND l.is_filter = 1)')
    values.push(filters.label)
  }
  if (isFile && filters.file_type !== undefined) { clauses.push('p.file_type = ?'); values.push(filters.file_type) }
  if (filters.query !== undefined) {
    const escaped = filters.query.toLowerCase().replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')
    clauses.push(`(lower(p.title) LIKE ? ESCAPE '\\' OR lower(coalesce(p.short_desc, '')) LIKE ? ESCAPE '\\'
      OR lower(coalesce(p.address, '')) LIKE ? ESCAPE '\\' OR lower(coalesce(p.features, '')) LIKE ? ESCAPE '\\'
      OR EXISTS (SELECT 1 FROM property_labels pl JOIN labels l ON l.id = pl.label_id
        WHERE pl.property_id = p.id AND lower(l.name) LIKE ? ESCAPE '\\'))`)
    values.push(...Array(5).fill(`%${escaped}%`))
  }
  return { sql: clauses.join(' AND '), values }
}

function cursorData(cursor) {
  try {
    const base64 = cursor.replaceAll('-', '+').replaceAll('_', '/')
    const data = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')))
    return typeof data.createdAt === 'string' && typeof data.id === 'number' ? data : null
  } catch { return null }
}

function encodeCursor(property) {
  return btoa(JSON.stringify({ createdAt: property.createdAt, id: property.id }))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function numberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isSafeInteger(number) ? number : null
}

function dateValue(value) { return value || new Date().toISOString() }

export function createD1PropertyRepository(database) {
  if (!database) throw new Error('The local staging D1 binding is required.')

  async function taxonomyId(domain, slug) {
    const table = TAXONOMY_TABLES[domain]
    if (!table || !slug) return null
    const row = await database.prepare(`SELECT id FROM ${table} WHERE slug = ? LIMIT 1`).bind(slug).first()
    return row?.id ?? null
  }

  async function resolveTaxonomies(property) {
    const [category, city, society, phase] = await Promise.all([
      taxonomyId('category', property.category?.slug),
      taxonomyId('city', property.location?.city?.slug),
      taxonomyId('society', property.location?.society?.slug),
      taxonomyId('phase', property.location?.phase?.slug),
    ])
    return [category, city, society, phase]
  }

  async function selectById(id, isFile = false) {
    const numericId = Number(id)
    if (!Number.isSafeInteger(numericId) || numericId < 1) return null
    const row = await database.prepare(`${PROPERTY_SELECT} WHERE p.id = ? AND COALESCE(p.is_file, 0) = ? LIMIT 1`).bind(numericId, isFile ? 1 : 0).first()
    return row ? fromD1Row(row) : null
  }

  async function replaceRelations(propertyId, property) {
    const statements = [
      database.prepare('DELETE FROM property_labels WHERE property_id = ?').bind(propertyId),
      database.prepare('DELETE FROM property_related_properties WHERE property_id = ?').bind(propertyId),
    ]
    for (const [position, slug] of [...new Set((property.labels || []).map((label) => typeof label === 'string' ? label : label.slug))].entries()) {
      statements.push(database.prepare(`INSERT OR IGNORE INTO property_labels (property_id, label_id, position)
        SELECT ?, id, ? FROM labels WHERE slug = ?`).bind(propertyId, position, slug))
    }
    for (const [position, slug] of [...new Set(property.adminForm?.related_products || [])].entries()) {
      statements.push(database.prepare(`INSERT OR IGNORE INTO property_related_properties (property_id, related_property_id, position)
        SELECT ?, id, ? FROM properties WHERE slug = ? AND id != ?`).bind(propertyId, position, slug, propertyId))
    }
    await database.batch(statements)
  }

  async function detailDescriptionId(property, existing = null) {
    if (typeof property.descriptionHtml !== 'string') return existing?.detail_description_id ?? null
    if (existing?.detail_description_id) {
      await database.prepare(`UPDATE detail_descriptions SET text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .bind(property.descriptionHtml, existing.detail_description_id).run()
      return existing.detail_description_id
    }
    const result = await database.prepare(`INSERT INTO detail_descriptions (text) VALUES (?)`).bind(property.descriptionHtml).run()
    return Number(result.meta?.last_row_id) || null
  }

  function sourceValues(property, refs, descriptionId) {
    const form = property.adminForm || {}
    return [
      property.title || '', form.property_type || property.propertyType || 'Residential', property.fileOnly ? 1 : 0,
      form.file_type || 'Affidavit', form.purchase_type || property.purchaseType || 'sale',
      (form.is_furnished ?? property.isFurnished ?? true) === true ? 1 : 0,
      property.shortDescription || '', property.location?.address || '', form.features || '',
      numberOrNull(property.beds) ?? 0, numberOrNull(property.baths) ?? 0,
      numberOrNull(property.area?.value) ?? 0, property.area?.unit || null,
      numberOrNull(property.price) ?? 0, (form.is_discounted ?? property.isDiscounted) ? 1 : 0,
      numberOrNull(form.price_original_amount) ?? 0, form.price_period_unit || 'month',
      numberOrNull(form.price_period_value) ?? 1, numberOrNull(form.installment_advance_amount) ?? 0,
      form.installment_total_period_text || null, numberOrNull(form.installment_amount) ?? 0,
      form.installment_display_mode || 'installment', null, ...refs,
      form.embed_link || '', property.public === true ? 0 : 1, dateValue(property.createdAt),
      dateValue(property.updatedAt), descriptionId, property.slug || null,
    ]
  }

  async function save(property, id, create, isFile = false) {
    const prior = create ? null : await database.prepare('SELECT id, detail_description_id FROM properties WHERE id = ? AND COALESCE(is_file, 0) = ?').bind(Number(id), isFile ? 1 : 0).first()
    if (!create && !prior) return null
    if (isFile) property.fileOnly = true
    const [refs, descriptionId] = await Promise.all([resolveTaxonomies(property), detailDescriptionId(property, prior)])
    const values = sourceValues(property, refs, descriptionId)
    const columns = `title, property_type, is_file, file_type, purchase_type, is_furnished, short_desc, address, features,
      beds, baths, area, unit, price_amount, is_discounted, price_original_amount, price_period_unit, price_period_value,
      installment_advance_amount, installment_total_period_text, installment_amount, installment_display_mode, media_id,
      category_id, city_id, society_id, phase_id, embed_link, hide, created_at, updated_at, detail_description_id, slug`
    let propertyId = Number(id)
    if (create) {
      const explicitId = Number.isSafeInteger(Number(property.id)) && Number(property.id) > 0
      const names = explicitId ? `id, ${columns}` : columns
      const result = await database.prepare(`INSERT INTO properties (${names}) VALUES (${Array(explicitId ? 34 : 33).fill('?').join(', ')})`)
        .bind(...(explicitId ? [Number(property.id), ...values] : values)).run()
      propertyId = explicitId ? Number(property.id) : Number(result.meta?.last_row_id)
    } else {
      const assignments = columns.split(',').map((column) => `${column.trim()} = ?`).join(', ')
      const result = await database.prepare(`UPDATE properties SET ${assignments} WHERE id = ? AND COALESCE(is_file, 0) = ?`)
        .bind(...values, propertyId, isFile ? 1 : 0).run()
      if (!Number(result.meta?.changes || 0)) return null
    }
    await replaceRelations(propertyId, property)
    return selectById(propertyId, isFile)
  }

  return {
    async hasPublicTaxonomySlug(name, slug) {
      const table = TAXONOMY_TABLES[name]
      if (!table) return false
      return Boolean(await database.prepare(`SELECT 1 AS found FROM ${table} WHERE slug = ? AND hide = 0 LIMIT 1`).bind(slug).first())
    },

    async listPublicProperties({ filters, limit, cursor }) {
      const where = clausesFor(filters, false)
      let anchor = null
      if (cursor) {
        const data = cursorData(cursor)
        if (!data) return { invalidCursor: true, items: [], hasMore: false }
        anchor = await database.prepare(`SELECT p.id, p.created_at FROM properties p
          LEFT JOIN categories c ON c.id = p.category_id LEFT JOIN cities ci ON ci.id = p.city_id
          LEFT JOIN societies s ON s.id = p.society_id LEFT JOIN phases ph ON ph.id = p.phase_id
          WHERE ${where.sql} AND p.id = ? AND p.created_at = ? LIMIT 1`)
          .bind(...where.values, data.id, data.createdAt).first()
        if (!anchor) return { invalidCursor: true, items: [], hasMore: false }
      }
      const clauses = [where.sql]
      const values = [...where.values]
      if (anchor) { clauses.push('(p.created_at < ? OR (p.created_at = ? AND p.id < ?))'); values.push(anchor.created_at, anchor.created_at, Number(anchor.id)) }
      const result = await database.prepare(`${PROPERTY_SELECT} WHERE ${clauses.join(' AND ')} ORDER BY p.created_at DESC, p.id DESC LIMIT ?`)
        .bind(...values, limit + 1).all()
      const rows = result.results || []
      const hasMore = rows.length > limit
      const items = rows.slice(0, limit).map(fromD1Row)
      return { items, hasMore, nextCursor: hasMore ? encodeCursor(items.at(-1)) : null }
    },

    async findPublicPropertyBySlug(slug) {
      const row = await database.prepare(`${PROPERTY_SELECT} WHERE p.slug = ? AND p.hide = 0 AND COALESCE(p.is_file, 0) = 0 LIMIT 1`).bind(slug).first()
      return row ? fromD1Row(row) : null
    },

    async listAllProperties() {
      const result = await database.prepare(`${PROPERTY_SELECT} ORDER BY p.id ASC`).all()
      return (result.results || []).map(fromD1Row)
    },

    async findPropertyById(id) {
      return selectById(id, false)
    },

    async listPublicFiles({ query = '', city = null, society = null, phase = null, fileType = null }) {
      const filters = Object.fromEntries(Object.entries({ city, society, phase, file_type: fileType, query })
        .filter(([, value]) => value !== null && value !== undefined && value !== ''))
      const where = clausesFor(filters, true)
      const result = await database.prepare(`${PROPERTY_SELECT} WHERE ${where.sql} ORDER BY p.updated_at DESC, p.id ASC`).bind(...where.values).all()
      const rows = (result.results || []).map(fromD1Row)
      const allResult = await database.prepare(`${PROPERTY_SELECT} WHERE p.hide = 0 AND COALESCE(p.is_file, 0) = 1 AND p.slug IS NOT NULL ORDER BY p.updated_at DESC, p.id ASC`).all()
      const all = (allResult.results || []).map(fromD1Row)
      return { all: all.map(fileRecord), items: rows.map(fileRecord) }
    },

    async listAllFiles() {
      const result = await database.prepare(`${PROPERTY_SELECT} WHERE COALESCE(p.is_file, 0) = 1 ORDER BY p.id ASC`).all()
      return (result.results || []).map(fromD1Row).map(fileRecord)
    },

    async findFileBySlug(slug) {
      const row = await database.prepare(`${PROPERTY_SELECT} WHERE p.slug = ? AND COALESCE(p.is_file, 0) = 1 LIMIT 1`).bind(String(slug)).first()
      if (!row) return null
      return fileRecord(fromD1Row(row))
    },

    async findFileById(id) {
      const property = await selectById(id, true)
      if (!property) return null
      return this.findFileBySlug(property.slug)
    },

    async insertFileRecord(record) {
      const property = fileRecordToProperty(record)
      const saved = await save(property, null, true, true)
      return saved ? this.findFileBySlug(saved.slug) : null
    },

    async updateFileRecord(id, record) {
      const current = await selectById(id, true)
      if (!current) return null
      const saved = await save(fileRecordToProperty(record, current), id, false, true)
      return saved ? this.findFileBySlug(saved.slug) : null
    },

    async deleteFileRecord(id) {
      const result = await database.prepare('DELETE FROM properties WHERE id = ? AND COALESCE(is_file, 0) = 1').bind(Number(id)).run()
      return Number(result.meta?.changes || 0) > 0
    },

    async listLabels() {
      const result = await database.prepare(`SELECT id, name, is_badge, is_filter, badge_variant, created_at, updated_at, hide, slug
        FROM labels ORDER BY id`).all()
      return result.results || []
    },

    async editorOptions() {
      const [categories, cities, societies, phases, properties, labels] = await Promise.all([
        database.prepare('SELECT slug AS value, name AS label FROM categories ORDER BY name').all(),
        database.prepare('SELECT slug AS value, name AS label FROM cities ORDER BY name').all(),
        database.prepare('SELECT slug AS value, name AS label FROM societies ORDER BY name').all(),
        database.prepare('SELECT slug AS value, name AS label FROM phases ORDER BY name').all(),
        database.prepare('SELECT slug AS value, title AS label FROM properties WHERE COALESCE(is_file, 0) = 0 AND slug IS NOT NULL ORDER BY title').all(),
        this.listLabels(),
      ])
      const options = (result) => result.results || []
      return {
        category_id: options(categories), city_id: options(cities), society_id: options(societies),
        phase_id: options(phases), related_products: options(properties), labels,
      }
    },

    async findLabelBySlug(slug) {
      return database.prepare(`SELECT id, name, is_badge, is_filter, badge_variant, created_at, updated_at, hide, slug
        FROM labels WHERE slug = ? LIMIT 1`).bind(slug).first()
    },

    async saveLabel(label) {
      await database.prepare(`INSERT INTO labels (name, is_badge, is_filter, hide, slug) VALUES (?, ?, ?, 0, ?)
        ON CONFLICT(slug) DO UPDATE SET name = excluded.name, is_badge = excluded.is_badge, is_filter = excluded.is_filter,
          updated_at = CURRENT_TIMESTAMP`).bind(label.name, label.is_badge ? 1 : 0, label.is_filter === false ? 0 : 1, label.slug).run()
      return this.findLabelBySlug(label.slug)
    },

    async updateLabel(slug, label) {
      const result = await database.prepare(`UPDATE labels SET name = ?, is_badge = ?, is_filter = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?`)
        .bind(label.name, label.is_badge ? 1 : 0, label.is_filter === false ? 0 : 1, slug).run()
      return Number(result.meta?.changes || 0) ? this.findLabelBySlug(slug) : null
    },

    async deleteLabel(slug) {
      const result = await database.prepare('DELETE FROM labels WHERE slug = ?').bind(slug).run()
      return Number(result.meta?.changes || 0) > 0
    },

    async insertPropertyRecord(property) { return save(property, null, true, false) },
    async updatePropertyRecord(id, property) { return save(property, id, false, false) },

    async deletePropertyRecord(id) {
      const numericId = Number(id)
      if (!Number.isSafeInteger(numericId) || numericId < 1) return false
      const result = await database.prepare('DELETE FROM properties WHERE id = ? AND COALESCE(is_file, 0) = 0').bind(numericId).run()
      return Number(result.meta?.changes || 0) > 0
    },

    async removeLabelFromProperties(slug) {
      await database.prepare('DELETE FROM property_labels WHERE label_id = (SELECT id FROM labels WHERE slug = ?)').bind(slug).run()
    },
  }
}

function fileRecordToProperty(record, current = null) {
  const form = record.adminForm || {}
  const labelSlugs = Array.isArray(form.labels) ? form.labels : (current?.adminForm?.labels || [])
  return {
    ...(current || {}), id: record.id, slug: record.slug, title: record.title,
    propertyType: form.property_type || 'Residential', purchaseType: record.purchaseType || form.purchase_type || 'sale',
    fileOnly: true, public: record.public === true, shortDescription: record.shortDescription || '',
    location: {
      address: record.address || '', city: record.city ? { slug: record.city, name: record.cityName || record.city } : null,
      society: record.society ? { slug: record.society, name: record.societyName || record.society } : null,
      phase: record.phase ? { slug: record.phase, name: record.phaseName || record.phase } : null,
    },
    category: null, area: record.area || { value: '0', unit: 'marla' },
    price: record.price?.amount ?? '0', labels: labelSlugs.map((slug) => ({ slug, name: slug })),
    createdAt: record.updatedAt || new Date().toISOString(),
    adminForm: {
      ...form, property_type: form.property_type || 'Residential', file_type: record.fileType || form.file_type || 'Affidavit',
      purchase_type: record.purchaseType || form.purchase_type || 'sale', is_furnished: true,
      labels: labelSlugs, detailed_description_content: record.shortDescription || '',
    },
  }
}

function fileRecord(property) {
  return {
    sourceId: property.id,
    slug: property.slug, title: property.title,
    city: property.location.city?.slug || '', cityName: property.location.city?.name || '',
    society: property.location.society?.slug || '', societyName: property.location.society?.name || '',
    phase: property.location.phase?.slug || '', phaseName: property.location.phase?.name || '',
    fileType: property.fileType, area: property.area,
    price: { amount: property.price, currency: 'PKR' }, updatedAt: property.updatedAt || property.createdAt,
    public: property.public, shortDescription: property.shortDescription, address: property.location.address,
    purchaseType: property.purchaseType, adminForm: property.adminForm,
  }
}

export function propertySeedSql(properties) {
  const quote = (value) => value === null || value === undefined ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`
  const labels = new Map()
  for (const property of properties) for (const label of property.labels || []) labels.set(label.slug, label.name)
  const statements = [...labels].sort(([a], [b]) => a.localeCompare(b)).map(([slug, name], index) =>
    `INSERT OR IGNORE INTO labels (id, name, is_badge, is_filter, hide, slug) VALUES (${index + 1}, ${quote(name)}, 1, 1, 0, ${quote(slug)});`)
  for (const property of properties) {
    const descriptionId = property.descriptionHtml ? Number(property.id) : null
    if (descriptionId) statements.push(`INSERT OR IGNORE INTO detail_descriptions (id, text, hide) VALUES (${descriptionId}, ${quote(property.descriptionHtml)}, 0);`)
    const form = property.adminForm || {}
    const value = [
      Number(property.id), quote(property.title), quote(form.property_type || property.propertyType || 'Residential'), property.fileOnly ? 1 : 0,
      quote(form.file_type || 'Affidavit'), quote(form.purchase_type || property.purchaseType || 'sale'),
      (form.is_furnished ?? property.isFurnished ?? true) === true ? 1 : 0, quote(property.shortDescription || ''),
      quote(property.location?.address || ''), quote(form.features || ''), Number(property.beds) || 0, Number(property.baths) || 0,
      Number(property.area?.value) || 0, quote(property.area?.unit || null), Number(property.price) || 0,
      (form.is_discounted ?? property.isDiscounted) ? 1 : 0, Number(form.price_original_amount) || 0,
      quote(form.price_period_unit || 'month'), Number(form.price_period_value) || 1,
      Number(form.installment_advance_amount) || 0, quote(form.installment_total_period_text || null),
      Number(form.installment_amount) || 0, quote(form.installment_display_mode || 'installment'),
      property.category?.slug ? `(SELECT id FROM categories WHERE slug = ${quote(property.category.slug)})` : 'NULL',
      property.location?.city?.slug ? `(SELECT id FROM cities WHERE slug = ${quote(property.location.city.slug)})` : 'NULL',
      property.location?.society?.slug ? `(SELECT id FROM societies WHERE slug = ${quote(property.location.society.slug)})` : 'NULL',
      property.location?.phase?.slug ? `(SELECT id FROM phases WHERE slug = ${quote(property.location.phase.slug)})` : 'NULL',
      quote(form.embed_link || ''), property.public === true ? 0 : 1, quote(property.createdAt || '2026-01-01T00:00:00.000Z'),
      quote(property.createdAt || '2026-01-01T00:00:00.000Z'), descriptionId ?? 'NULL', quote(property.slug),
    ]
    statements.push(`INSERT OR IGNORE INTO properties (id, title, property_type, is_file, file_type, purchase_type, is_furnished, short_desc, address, features, beds, baths, area, unit, price_amount, is_discounted, price_original_amount, price_period_unit, price_period_value, installment_advance_amount, installment_total_period_text, installment_amount, installment_display_mode, category_id, city_id, society_id, phase_id, embed_link, hide, created_at, updated_at, detail_description_id, slug) VALUES (${value.join(', ')});`)
  }
  for (const property of properties) {
    for (const [position, label] of (property.labels || []).entries()) {
      statements.push(`INSERT OR IGNORE INTO property_labels (property_id, label_id, position) SELECT ${Number(property.id)}, id, ${position} FROM labels WHERE slug = ${quote(label.slug)};`)
    }
  }
  return statements.join('\n')
}

export function createMemoryPropertyRepository(source) {
  const taxonomyPaths = {
    category: (property) => property.category?.slug,
    city: (property) => property.location?.city?.slug,
    society: (property) => property.location?.society?.slug,
    phase: (property) => property.location?.phase?.slug,
  }
  const isPublic = (property) => property.public === true && property.fileOnly !== true
  const matches = (property, filters) => {
    const equalities = [
      ['category', property.category?.slug], ['city', property.location?.city?.slug],
      ['society', property.location?.society?.slug], ['phase', property.location?.phase?.slug],
      ['property_type', property.propertyType], ['purchase_type', property.purchaseType],
      ['area_unit', property.area?.unit], ['label', (property.labels || []).map((label) => label.slug).join(',')],
    ]
    for (const [key, value] of equalities) if (filters[key] !== undefined && !String(value ?? '').split(',').includes(filters[key])) return false
    if (filters.min_beds !== undefined && property.beds < Number(filters.min_beds)) return false
    if (filters.min_baths !== undefined && property.baths < Number(filters.min_baths)) return false
    if (filters.min_area !== undefined && Number(property.area?.value) < Number(filters.min_area)) return false
    if (filters.query !== undefined) {
      const searchable = [property.title, property.shortDescription, property.location?.address, property.location?.city?.name,
        property.category?.name, property.location?.society?.name, property.location?.phase?.name,
        ...(property.labels || []).map((label) => label.name)].filter(Boolean).join(' ').toLowerCase()
      if (!searchable.includes(filters.query.toLowerCase())) return false
    }
    return true
  }
  const cursorEncode = (property) => btoa(JSON.stringify({ createdAt: property.createdAt, id: property.id })).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
  const cursorDecode = (value, properties) => {
    try {
      const raw = value.replaceAll('-', '+').replaceAll('_', '/')
      const data = JSON.parse(atob(raw.padEnd(Math.ceil(raw.length / 4) * 4, '=')))
      return properties.find((property) => property.id === data.id && property.createdAt === data.createdAt) || null
    } catch { return null }
  }
  return {
    async hasPublicTaxonomySlug(name, slug) { return source.some((property) => isPublic(property) && taxonomyPaths[name]?.(property) === slug) },
    async listPublicProperties({ filters, limit, cursor }) {
      let properties = source.filter(isPublic).filter((property) => matches(property, filters))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id)
      if (cursor) {
        const anchor = cursorDecode(cursor, properties)
        if (!anchor) return { invalidCursor: true, items: [], hasMore: false }
        properties = properties.slice(properties.indexOf(anchor) + 1)
      }
      const items = properties.slice(0, limit)
      const hasMore = properties.length > limit
      return { items, hasMore, nextCursor: hasMore ? cursorEncode(items.at(-1)) : null }
    },
    async findPublicPropertyBySlug(slug) { return source.find((property) => property.slug === slug && isPublic(property)) ?? null },
  }
}
