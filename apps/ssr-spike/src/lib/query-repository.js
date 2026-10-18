function toRecord(row) {
  return {
    id: String(row.id),
    property_id: row.property_id == null ? null : String(row.property_id),
    property_title: row.property_title || '',
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    message: row.message,
    created_at: row.created_at || '',
    is_read: Boolean(row.is_read),
  }
}

const SELECT = `SELECT q.id, q.property_id, p.title AS property_title, q.name, q.email, q.phone,
  q.message, q.created_at, q.is_read FROM queries q
  LEFT JOIN properties p ON p.id = q.property_id`;

export function createD1QueryRepository(database) {
  if (!database) throw new Error('The local staging D1 binding is required.')
  return {
    async propertyExists(id) {
      if (!/^\d+$/.test(String(id))) return false
      return Boolean(await database.prepare('SELECT id FROM properties WHERE id = ? LIMIT 1').bind(Number(id)).first())
    },
    async list() {
      const result = await database.prepare(`${SELECT} ORDER BY q.created_at DESC, q.id DESC`).all()
      return (result.results || []).map(toRecord)
    },
    async find(id) {
      if (!/^\d+$/.test(String(id))) return null
      const row = await database.prepare(`${SELECT} WHERE q.id = ? LIMIT 1`).bind(Number(id)).first()
      return row ? toRecord(row) : null
    },
    async insert(fields) {
      const propertyId = fields.property_id ? Number(fields.property_id) : null
      if (propertyId !== null && !Number.isSafeInteger(propertyId)) return null
      const result = await database.prepare(`INSERT INTO queries (property_id, name, email, phone, message, is_read, processed_by)
        VALUES (?, ?, ?, ?, ?, ?, NULL)`).bind(propertyId, fields.name, fields.email || null, fields.phone || null, fields.message, fields.is_read ? 1 : 0).run()
      return this.find(String(result.meta?.last_row_id))
    },
    async update(id, fields) {
      const current = await this.find(id)
      if (!current) return null
      const columns = { property_id: 'property_id', name: 'name', email: 'email', phone: 'phone', message: 'message', is_read: 'is_read' }
      const keys = Object.keys(fields).filter((key) => columns[key])
      if (!keys.length) return current
      const assignments = keys.map((key) => `${columns[key]} = ?`)
      const values = keys.map((key) => key === 'is_read' ? Number(Boolean(fields[key])) : key === 'property_id' ? (fields[key] ? Number(fields[key]) : null) : (fields[key] || null))
      assignments.push('updated_at = CURRENT_TIMESTAMP')
      values.push(Number(id))
      await database.prepare(`UPDATE queries SET ${assignments.join(', ')} WHERE id = ?`).bind(...values).run()
      return this.find(id)
    },
    async delete(id) {
      if (!/^\d+$/.test(String(id))) return false
      const result = await database.prepare('DELETE FROM queries WHERE id = ?').bind(Number(id)).run()
      return Number(result.meta?.changes || 0) > 0
    },
  }
}

export const syntheticQuerySeedSql = `
INSERT INTO queries (id, property_id, name, phone, email, message, ip_address, user_agent, is_read, processed_by, created_at)
VALUES
  (1, NULL, 'Sample Visitor', '+92 300 0000000', 'visitor@example.invalid', 'I would like more information about this synthetic listing.', NULL, NULL, 0, NULL, '2026-10-17 11:30:00'),
  (2, NULL, 'Demo Customer', '+92 300 0000001', 'demo@example.invalid', 'Please share the synthetic brochure and viewing times.', NULL, NULL, 1, NULL, '2026-10-15 15:45:00')
ON CONFLICT(id) DO NOTHING;
`
