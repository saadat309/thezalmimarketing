const SECTION_NAMES = Object.freeze({
  'landing-popup': 'Landing Popup',
  'video-section': 'Video Section',
  'featured-properties': 'Featured Properties',
  'property-categories': 'Property Categories',
  'location-maps': 'Location Maps',
  'available-files': 'Available Files',
})

function toRecord(row, selectedItems = []) {
  return {
    id: String(row.id),
    sectionName: SECTION_NAMES[row.slug] || row.slug.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
    title: row.title || '',
    subtitle: row.subtitle || '',
    order: Number(row.id),
    active: Boolean(row.visibility),
    collection: row.collection_type,
    selectedItems: selectedItems.map(String),
    mediaMode: row.media_type || 'image',
    mediaUrl: row.video_embed_link || '',
    delayMs: Number(row.delay_ms ?? 5000),
  }
}

export function createD1LandingRepository(database) {
  if (!database) throw new Error('The local staging D1 binding is required.')

  async function findRow(id) {
    if (!/^\d+$/.test(String(id))) return null
    return database.prepare('SELECT * FROM landing_sections WHERE id = ? LIMIT 1').bind(Number(id)).first()
  }

  async function itemIds(sectionId) {
    const result = await database.prepare('SELECT item_id FROM landing_section_items WHERE section_id = ? ORDER BY item_order, id').bind(sectionId).all()
    return (result.results || []).map((row) => String(row.item_id))
  }

  async function record(row) {
    return row ? toRecord(row, await itemIds(row.id)) : null
  }

  return {
    async list() {
      const result = await database.prepare('SELECT * FROM landing_sections ORDER BY id').all()
      return Promise.all((result.results || []).map(record))
    },
    async find(id) { return record(await findRow(id)) },
    async listPublic() {
      const result = await database.prepare('SELECT * FROM landing_sections WHERE visibility = 1 ORDER BY id').all()
      return Promise.all((result.results || []).map(async (row) => ({
        slug: row.slug,
        title: row.title || '',
        subtitle: row.subtitle || '',
        collection: row.collection_type,
        selectedItems: await itemIds(row.id),
        mediaType: row.media_type || 'image',
        mediaUrl: row.video_embed_link || '',
        delayMs: Number(row.delay_ms ?? 5000),
      })))
    },
    async update(id, fields) {
      const current = await findRow(id)
      if (!current) return null
      const title = fields.title ?? current.title
      const subtitle = fields.subtitle ?? current.subtitle
      const visibility = fields.active === undefined ? current.visibility : (fields.active ? 1 : 0)
      const delayMs = fields.delayMs ?? current.delay_ms
      const mediaMode = fields.mediaMode ?? current.media_type ?? 'image'
      const embedLink = fields.mediaUrl ?? current.video_embed_link ?? ''
      const collection = fields.collection ?? current.collection_type
      if (fields.selectedItems?.some((itemId) => !/^\d+$/.test(String(itemId)))) return null
      const statements = [database.prepare(`
        UPDATE landing_sections SET title = ?, subtitle = ?, visibility = ?, delay_ms = ?, media_type = ?,
          video_input_method = ?, video_embed_link = ?, collection_type = ?, version = version + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(title, subtitle, visibility, delayMs, mediaMode, mediaMode === 'embed' ? 'embed' : null,
        mediaMode === 'embed' ? embedLink : null, collection, Number(id))]
      if (fields.selectedItems !== undefined) {
        statements.push(database.prepare('DELETE FROM landing_section_items WHERE section_id = ?').bind(Number(id)))
        fields.selectedItems.forEach((itemId, index) => statements.push(
          database.prepare('INSERT INTO landing_section_items (section_id, item_id, item_order) VALUES (?, ?, ?)')
            .bind(Number(id), Number(itemId), index),
        ))
      }
      const [updated] = await database.batch(statements)
      if (!Number(updated.meta?.changes || 0)) return null
      return this.find(id)
    },
  }
}
