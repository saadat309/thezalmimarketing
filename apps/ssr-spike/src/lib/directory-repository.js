import { createD1TaxonomyRepository } from './taxonomy-repository.js'

function fromRow(row) {
  return JSON.parse(row.record_json)
}

function columns(kind, record) {
  return [
    kind,
    record.slug,
    record.public === true ? 1 : 0,
    record.city || '',
    record.society || '',
    record.phase || '',
    kind === 'files' ? record.fileType || '' : '',
    record.updatedAt || new Date().toISOString().slice(0, 10),
    [record.title, record.cityName, record.societyName, record.phaseName, record.fileType]
      .filter(Boolean).join(' ').toLowerCase(),
    JSON.stringify(record),
  ]
}

export function createD1DirectoryRepository(database) {
  if (!database) throw new Error('The local staging D1 binding is required.')
  const taxonomies = createD1TaxonomyRepository(database)

  return {
    async listPublic({ kind, query = '', city = null, society = null, phase = null, fileType = null }) {
      if (kind === 'maps') return taxonomies.listPublicMaps({ query, city, society, phase })
      const filters = { city: 'city_slug', society: 'society_slug', phase: 'phase_slug', fileType: 'file_type' }
      const clauses = ['kind = ?', 'is_public = 1']
      const values = [kind]
      for (const [key, column] of Object.entries(filters)) {
        const value = { city, society, phase, fileType }[key]
        if (value) {
          clauses.push(`${column} = ?`)
          values.push(value)
        }
      }
      if (query) {
        const escaped = query.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')
        clauses.push("search_text LIKE ? ESCAPE '\\'")
        values.push(`%${escaped}%`)
      }
      const [itemResult, optionResult] = await Promise.all([
        database.prepare(`
          SELECT record_json FROM staging_directories WHERE ${clauses.join(' AND ')}
          ORDER BY updated_at DESC, slug ASC
        `).bind(...values).all(),
        database.prepare(`
          SELECT DISTINCT 1 AS public, city_slug AS city, json_extract(record_json, '$.cityName') AS cityName,
            society_slug AS society, json_extract(record_json, '$.societyName') AS societyName,
            phase_slug AS phase, json_extract(record_json, '$.phaseName') AS phaseName, file_type AS fileType
          FROM staging_directories WHERE kind = ? AND is_public = 1
        `).bind(kind).all(),
      ])
      const all = optionResult.results || []
      const items = (itemResult.results || []).map(fromRow)
      return { all, items }
    },

    async listAll(kind) {
      if (kind === 'maps') return taxonomies.listMaps()
      const result = await database.prepare(`
        SELECT record_json FROM staging_directories WHERE kind = ? ORDER BY updated_at DESC, slug ASC
      `).bind(kind).all()
      return (result.results || []).map(fromRow)
    },

    async find(kind, slug) {
      if (kind === 'maps') return taxonomies.findMap(slug)
      const row = await database.prepare(`
        SELECT record_json FROM staging_directories WHERE kind = ? AND slug = ? LIMIT 1
      `).bind(kind, String(slug)).first()
      return row ? fromRow(row) : null
    },

    async insert(kind, record) {
      if (kind === 'maps') return taxonomies.insertMap(record)
      await database.prepare(`
        INSERT INTO staging_directories
          (kind, slug, is_public, city_slug, society_slug, phase_slug, file_type, updated_at, search_text, record_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(...columns(kind, record)).run()
      return this.find(kind, record.slug)
    },

    async update(kind, slug, record) {
      if (kind === 'maps') return taxonomies.updateMap(slug, record)
      const values = columns(kind, record)
      const result = await database.prepare(`
        UPDATE staging_directories SET
          is_public = ?, city_slug = ?, society_slug = ?, phase_slug = ?, file_type = ?,
          updated_at = ?, search_text = ?, record_json = ?
        WHERE kind = ? AND slug = ?
      `).bind(...values.slice(2, 9), JSON.stringify(record), kind, String(slug)).run()
      if (result.meta?.changes === 0) return null
      return this.find(kind, record.slug)
    },

    async delete(kind, slug) {
      if (kind === 'maps') return taxonomies.deleteMap(slug)
      const result = await database.prepare('DELETE FROM staging_directories WHERE kind = ? AND slug = ?')
        .bind(kind, String(slug)).run()
      return Number(result.meta?.changes || 0) > 0
    },

    async removeLabelFromFiles(slug) {
      const files = await this.listAll('files')
      for (const file of files) {
        const labels = file.adminForm?.labels
        if (!Array.isArray(labels) || !labels.includes(slug)) continue
        const updated = structuredClone(file)
        updated.adminForm.labels = labels.filter((label) => label !== slug)
        await this.update('files', file.slug, updated)
      }
    },
  }
}

export function directorySeedSql(records) {
  return records.map(({ kind, record }) => {
    const values = columns(kind, record).map((value) => `'${String(value).replaceAll("'", "''")}'`)
    return `INSERT OR IGNORE INTO staging_directories (kind, slug, is_public, city_slug, society_slug, phase_slug, file_type, updated_at, search_text, record_json) VALUES (${values.join(', ')});`
  }).join('\n')
}

export function createMemoryDirectoryRepository({ maps, files }) {
  const source = { maps, files }
  return {
    async listPublic({ kind, query, city, society, phase, fileType }) {
      const all = (source[kind] ?? []).filter((item) => item.public === true)
      const items = all.filter((item) => {
        if (city && item.city !== city) return false
        if (society && item.society !== society) return false
        if (phase && item.phase !== phase) return false
        if (fileType && item.fileType !== fileType) return false
        return !query || [item.title, item.cityName, item.societyName, item.phaseName, item.fileType]
          .filter(Boolean).join(' ').toLowerCase().includes(query)
      }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.slug.localeCompare(b.slug))
      return { all, items }
    },
    async listAll(kind) { return (source[kind] ?? []).map((item) => structuredClone(item)) },
    async find(kind, slug) { return structuredClone(source[kind]?.find((item) => item.slug === String(slug)) || null) },
    async insert(kind, record) {
      if (!source[kind] || source[kind].some((item) => item.slug === record.slug)) return null
      source[kind].push(structuredClone(record))
      return structuredClone(record)
    },
    async update(kind, slug, record) {
      const list = source[kind] || []
      const index = list.findIndex((item) => item.slug === String(slug))
      if (index < 0) return null
      list[index] = structuredClone(record)
      return structuredClone(list[index])
    },
    async delete(kind, slug) {
      const list = source[kind] || []
      const index = list.findIndex((item) => item.slug === String(slug))
      if (index < 0) return false
      list.splice(index, 1)
      return true
    },
  }
}
