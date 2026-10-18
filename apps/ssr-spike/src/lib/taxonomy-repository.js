const TAXONOMY_TABLES = Object.freeze({
  categories: 'categories', cities: 'cities', societies: 'societies', phases: 'phases',
})
const RELATION_COLUMNS = Object.freeze({ cities: 'city_id', societies: 'society_id', phases: 'phase_id' })

function slugify(value) {
  return value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'synthetic-record'
}

function normalize(row, mapIds = []) {
  return {
    id: row.id,
    name: row.name,
    ...(Object.hasOwn(row, 'pic') ? { pic: row.pic || '' } : {}),
    ...(RELATION_COLUMNS[row.domain] ? { map_ids: mapIds } : {}),
    updated_at: row.updated_at || '',
  }
}

function mapRecord(row) {
  return {
    slug: row.slug,
    title: row.title,
    city: row.city_slug || '', cityName: row.city_name || '',
    society: row.society_slug || '', societyName: row.society_name || '',
    phase: row.phase_slug || '', phaseName: row.phase_name || '',
    description: row.description || '', embedLink: row.embed_link || '',
    updatedAt: row.updated_at || '', public: row.hide === 0,
  }
}

export function createD1TaxonomyRepository(database) {
  if (!database) throw new Error('The local staging D1 binding is required.')

  async function mapSlugsFor(domain, id) {
    const column = RELATION_COLUMNS[domain]
    if (!column) return []
    const result = await database.prepare(`SELECT slug FROM map_docs WHERE ${column} = ? ORDER BY id`).bind(id).all()
    return (result.results || []).map((row) => row.slug)
  }

  async function assignMaps(domain, id, slugs) {
    const column = RELATION_COLUMNS[domain]
    if (!column) return
    const statements = [database.prepare(`UPDATE map_docs SET ${column} = NULL WHERE ${column} = ? AND slug NOT IN (${slugs.length ? slugs.map(() => '?').join(',') : "''"})`).bind(id, ...slugs)]
    for (const slug of slugs) statements.push(database.prepare(`UPDATE map_docs SET ${column} = ? WHERE slug = ?`).bind(id, slug))
    await database.batch(statements)
  }

  async function taxonomyRecord(domain, row) {
    if (!row) return null
    return normalize({ ...row, domain }, await mapSlugsFor(domain, row.id))
  }

  async function taxonomyBySlug(domain, slug) {
    const table = TAXONOMY_TABLES[domain]
    return table ? await database.prepare(`SELECT id FROM ${table} WHERE slug = ? LIMIT 1`).bind(slug).first() : null
  }

  async function mapRow(slug) {
    return database.prepare(`
      SELECT m.*, c.slug AS city_slug, c.name AS city_name,
        s.slug AS society_slug, s.name AS society_name, p.slug AS phase_slug, p.name AS phase_name
      FROM map_docs m LEFT JOIN cities c ON c.id = m.city_id
      LEFT JOIN societies s ON s.id = m.society_id LEFT JOIN phases p ON p.id = m.phase_id
      WHERE m.slug = ? LIMIT 1
    `).bind(String(slug)).first()
  }

  async function mapRows({ query = '', city = null, society = null, phase = null, publicOnly = false } = {}) {
    const clauses = []
    const params = []
    if (publicOnly) clauses.push('m.hide = 0')
    for (const [value, column] of [[city, 'c.slug'], [society, 's.slug'], [phase, 'p.slug']]) {
      if (value) { clauses.push(`${column} = ?`); params.push(value) }
    }
    if (query) {
      clauses.push('(lower(m.title) LIKE ? ESCAPE \'\\\' OR lower(coalesce(m.description, \'\')) LIKE ? ESCAPE \'\\\')')
      const escaped = query.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')
      params.push(`%${escaped}%`, `%${escaped}%`)
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    const result = await database.prepare(`
      SELECT m.*, c.slug AS city_slug, c.name AS city_name,
        s.slug AS society_slug, s.name AS society_name, p.slug AS phase_slug, p.name AS phase_name
      FROM map_docs m LEFT JOIN cities c ON c.id = m.city_id
      LEFT JOIN societies s ON s.id = m.society_id LEFT JOIN phases p ON p.id = m.phase_id
      ${where} ORDER BY m.updated_at DESC, m.id DESC
    `).bind(...params).all()
    return (result.results || []).map(mapRecord)
  }

  async function mapOptions() {
    const rows = await mapRows()
    return rows.map((row) => ({ value: row.slug, label: row.title }))
  }

  return {
    async list(domain) {
      const table = TAXONOMY_TABLES[domain]
      if (!table) return []
      const rows = await database.prepare(`SELECT id, name, pic, thumb, slug, hide, created_at, updated_at FROM ${table} ORDER BY id`).all()
      return Promise.all((rows.results || []).map((row) => taxonomyRecord(domain, row)))
    },
    async find(domain, id) {
      const table = TAXONOMY_TABLES[domain]
      if (!table || !/^\d+$/.test(String(id))) return null
      const row = await database.prepare(`SELECT id, name, pic, thumb, slug, hide, created_at, updated_at FROM ${table} WHERE id = ?`).bind(Number(id)).first()
      return taxonomyRecord(domain, row)
    },
    async hasMapConflict(domain, slugs, ignoreId = null) {
      const column = RELATION_COLUMNS[domain]
      if (!column || !slugs.length) return false
      const placeholders = slugs.map(() => '?').join(',')
      const row = await database.prepare(`SELECT 1 AS conflict FROM map_docs WHERE slug IN (${placeholders}) AND ${column} IS NOT NULL AND ${column} != coalesce(?, -1) LIMIT 1`)
        .bind(...slugs, ignoreId === null ? null : Number(ignoreId)).first()
      return Boolean(row)
    },
    async mapOptions() { return mapOptions() },
    async insert(domain, fields) {
      const table = TAXONOMY_TABLES[domain]
      if (!table) return null
      const slug = slugify(fields.name)
      const result = await database.prepare(`INSERT INTO ${table} (name, slug, hide) VALUES (?, ?, 0)`)
        .bind(fields.name, slug).run()
      const id = Number(result.meta?.last_row_id)
      if (RELATION_COLUMNS[domain]) await assignMaps(domain, id, fields.map_ids || [])
      return this.find(domain, id)
    },
    async update(domain, id, fields) {
      const table = TAXONOMY_TABLES[domain]
      if (!table || !/^\d+$/.test(String(id))) return null
      const result = await database.prepare(`UPDATE ${table} SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .bind(fields.name, Number(id)).run()
      if (!Number(result.meta?.changes || 0)) return null
      if (RELATION_COLUMNS[domain] && fields.map_ids !== undefined) await assignMaps(domain, Number(id), fields.map_ids)
      return this.find(domain, id)
    },
    async delete(domain, id) {
      const table = TAXONOMY_TABLES[domain]
      if (!table || !/^\d+$/.test(String(id))) return false
      const result = await database.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(Number(id)).run()
      return Number(result.meta?.changes || 0) > 0
    },
    async listMaps() { return mapRows() },
    async listPublicMaps(filters = {}) {
      const [items, all] = await Promise.all([
        mapRows({ ...filters, publicOnly: true }), mapRows({ publicOnly: true }),
      ])
      return { items, all }
    },
    async findMap(slug) { const row = await mapRow(slug); return row ? mapRecord(row) : null },
    async insertMap(record) {
      const [city, society, phase] = await Promise.all([
        taxonomyBySlug('cities', record.city), taxonomyBySlug('societies', record.society), taxonomyBySlug('phases', record.phase),
      ])
      const result = await database.prepare(`
        INSERT INTO map_docs (title, description, hide, city_id, society_id, phase_id, slug, embed_link, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(record.title, record.description || '', record.public ? 0 : 1, city?.id ?? null, society?.id ?? null, phase?.id ?? null,
        record.slug, record.embedLink || '', record.updatedAt || new Date().toISOString().slice(0, 10)).run()
      return result.meta?.changes ? this.findMap(record.slug) : null
    },
    async updateMap(slug, record) {
      const [city, society, phase] = await Promise.all([
        taxonomyBySlug('cities', record.city), taxonomyBySlug('societies', record.society), taxonomyBySlug('phases', record.phase),
      ])
      const result = await database.prepare(`
        UPDATE map_docs SET title = ?, description = ?, hide = ?, city_id = ?, society_id = ?, phase_id = ?, embed_link = ?, updated_at = ?
        WHERE slug = ?
      `).bind(record.title, record.description || '', record.public ? 0 : 1, city?.id ?? null, society?.id ?? null, phase?.id ?? null,
        record.embedLink || '', record.updatedAt || new Date().toISOString().slice(0, 10), String(slug)).run()
      return result.meta?.changes ? this.findMap(record.slug) : null
    },
    async deleteMap(slug) {
      const result = await database.prepare('DELETE FROM map_docs WHERE slug = ?').bind(String(slug)).run()
      return Number(result.meta?.changes || 0) > 0
    },
  }
}

export function taxonomySeedSql({ cities, societies, phases, categories = [], maps }) {
  const quote = (value) => value === null || value === undefined ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`
  const statements = []
  for (const [table, records] of Object.entries({ categories, cities, societies, phases })) {
    records.forEach((item, index) => statements.push(
      `INSERT OR IGNORE INTO ${table} (id, name, slug, hide, created_at, updated_at) VALUES (${Number(item.id || index + 1)}, ${quote(item.name)}, ${quote(item.slug)}, ${item.hide ? 1 : 0}, ${quote(item.created_at || '2026-10-18 00:00:00')}, ${quote(item.updated_at || '2026-10-18 00:00:00')});`,
    ))
  }
  for (const item of maps) {
    const findId = (records, slug) => records.find((entry) => entry.slug === slug)?.id ?? null
    statements.push(`INSERT OR IGNORE INTO map_docs (id, title, description, hide, city_id, society_id, phase_id, slug, updated_at, embed_link) VALUES (${Number(item.id)}, ${quote(item.title)}, ${quote(item.description)}, ${item.public ? 0 : 1}, ${findId(cities, item.city) ?? 'NULL'}, ${findId(societies, item.society) ?? 'NULL'}, ${findId(phases, item.phase) ?? 'NULL'}, ${quote(item.slug)}, ${quote(item.updatedAt)}, ${quote(item.embedLink || '')});`)
  }
  return statements.join('\n')
}
