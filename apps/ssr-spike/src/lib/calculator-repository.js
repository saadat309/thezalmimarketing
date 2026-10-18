const TABLES = {
  calculator_phases: ['id', 'city_id', 'society_id', 'name', 'sort_order', 'is_active'],
  calculator_blocks: ['id', 'calculator_phase_id', 'name', 'sort_order', 'is_active'],
  calculator_property_types: ['id', 'category', 'property_type', 'label', 'sort_order', 'is_active'],
  calculator_rates: ['id', 'calculator_phase_id', 'calculator_block_id', 'calculator_property_type_id', 'dc_per_marla', 'dc_per_sqft', 'fbr_per_marla', 'fbr_per_sqft', 'is_active'],
  calculator_transfer_fees: ['id', 'calculator_phase_id', 'calculator_block_id', 'category', 'reference_amount', 'reference_size', 'reference_unit', 'is_active'],
  calculator_fees: ['id', 'fee_key', 'fee_name', 'amount', 'charge_unit', 'is_active'],
  calculator_tax_rates: ['id', 'rate_key', 'rate_name', 'rate', 'rate_unit', 'is_active'],
  calculator_fee_rules: ['id', 'fee_id', 'property_type', 'unit', 'min_area', 'max_area', 'fee_amount', 'is_active'],
}
const numberOrNull = (value) => value == null ? null : Number(value)
const bool = (value) => Boolean(value)
const id = (value) => value == null ? null : String(value)
const sqlText = (value) => `'${String(value).replaceAll("'", "''")}'`
const DECIMAL_FIELDS = new Set(['dc_per_marla','dc_per_sqft','fbr_per_marla','fbr_per_sqft','reference_amount','reference_size','amount','rate','min_area','max_area','fee_amount'])

function project(table, row) {
  const item = Object.fromEntries(TABLES[table].map((key) => [key, row[key]]))
  item.id = id(item.id)
  for (const key of ['city_id', 'society_id', 'calculator_phase_id', 'calculator_block_id', 'calculator_property_type_id', 'fee_id']) if (key in item) item[key] = id(item[key])
  for (const key of ['is_active']) if (key in item) item[key] = bool(item[key])
  for (const key of ['dc_per_marla', 'dc_per_sqft', 'fbr_per_marla', 'fbr_per_sqft', 'reference_amount', 'reference_size', 'amount', 'rate', 'min_area', 'max_area', 'fee_amount']) if (key in item) item[key] = numberOrNull(item[key])
  item.updated_at = row.updated_at || ''
  return item
}

export function createD1CalculatorRepository(db) {
  if (!db) throw new Error('STAGING_DB binding is required for calculator storage.')
  const all = async (sql, ...values) => (await db.prepare(sql).bind(...values).all()).results
  const first = async (sql, ...values) => db.prepare(sql).bind(...values).first()
  const run = async (sql, ...values) => db.prepare(sql).bind(...values).run()
  const listRaw = async (table) => {
    const order = {
      calculator_phases: 'sort_order ASC, name ASC', calculator_blocks: 'sort_order ASC, name ASC',
      calculator_property_types: 'sort_order ASC, id ASC',
    }[table] || 'id ASC'
    return all(`SELECT * FROM ${table} ORDER BY ${order}`)
  }
  const loadConfig = async () => {
    const [cities, societies, ...tables] = await Promise.all([
      all('SELECT id, name FROM cities ORDER BY name ASC'), all('SELECT id, name FROM societies ORDER BY name ASC'),
      ...Object.keys(TABLES).map(listRaw),
    ])
    const config = { cities: cities.map((x) => ({ id: id(x.id), name: x.name })), societies: societies.map((x) => ({ id: id(x.id), name: x.name })) }
    Object.keys(TABLES).forEach((table, i) => { config[table] = tables[i].map((row) => project(table, row)) })
    for (const rule of config.calculator_fee_rules) {
      const fee = config.calculator_fees.find((x) => x.id === rule.fee_id)
      rule.fee_key = fee?.fee_key || ''
    }
    return config
  }
  const find = async (domain, recordId) => {
    const table = domain.startsWith('calculator-') ? domain.replaceAll('-', '_') : domain
    if (!TABLES[table]) return null
    const row = await first(`SELECT * FROM ${table} WHERE id = ?`, Number(recordId))
    return row ? project(table, row) : null
  }
  const list = async (domain) => {
    const table = domain.replaceAll('-', '_')
    if (!TABLES[table]) return []
    const config = await loadConfig()
    const rows = config[table]
    if (table === 'calculator_phases') return rows.map((x) => ({ ...x, city_name: config.cities.find((c) => c.id === x.city_id)?.name || '', society_name: config.societies.find((s) => s.id === x.society_id)?.name || '' }))
    if (table === 'calculator_blocks') return rows.map((x) => {
      const phase = config.calculator_phases.find((p) => p.id === x.calculator_phase_id)
      return { ...x, calculator_phase_name: phase?.name || '', city_name: config.cities.find((c) => c.id === phase?.city_id)?.name || '', society_name: config.societies.find((s) => s.id === phase?.society_id)?.name || '' }
    })
    if (table === 'calculator_rates') return rows.map((x) => {
      const phase = config.calculator_phases.find((p) => p.id === x.calculator_phase_id), block = config.calculator_blocks.find((b) => b.id === x.calculator_block_id), type = config.calculator_property_types.find((t) => t.id === x.calculator_property_type_id)
      const unit = x.dc_per_marla != null || x.dc_per_sqft == null ? 'marla' : 'sqft'
      return { ...x, city_name: config.cities.find((c) => c.id === phase?.city_id)?.name || '', society_name: config.societies.find((s) => s.id === phase?.society_id)?.name || '', calculator_phase_name: phase?.name || '', calculator_block_name: block?.name || '', category: type?.category || '', property_type_label: type?.label || '', unit, unit_label: unit === 'sqft' ? 'Per Sq. Ft.' : 'Per Marla', dc_rate: unit === 'sqft' ? x.dc_per_sqft || 0 : x.dc_per_marla || 0, fbr_rate: unit === 'sqft' ? x.fbr_per_sqft || 0 : x.fbr_per_marla || 0 }
    })
    if (table === 'calculator_transfer_fees') return rows.map((x) => {
      const phase = config.calculator_phases.find((p) => p.id === x.calculator_phase_id), block = config.calculator_blocks.find((b) => b.id === x.calculator_block_id)
      const amount = x.reference_amount || 0, size = x.reference_size || 0, refMarla = x.reference_unit === 'sqft' ? size / 225 : size, refSqft = x.reference_unit === 'sqft' ? size : size * 225, base = Math.max(0, amount - 10500)
      const round = (n, p) => Math.round((n + Number.EPSILON) * 10 ** p) / 10 ** p
      return { ...x, city_name: config.cities.find((c) => c.id === phase?.city_id)?.name || '', society_name: config.societies.find((s) => s.id === phase?.society_id)?.name || '', calculator_phase_name: phase?.name || '', calculator_block_name: block?.name || '', base_transfer_fee: round(base, 2), reference_marla: round(refMarla, 4), reference_sqft: round(refSqft, 4), per_marla_rate: refMarla ? round(base / refMarla, 2) : 0, per_sqft_rate: refSqft ? round(base / refSqft, 4) : 0 }
    })
    if (table === 'calculator_fee_rules') return rows.map((x) => {
      const fee = config.calculator_fees.find((f) => f.id === x.fee_id)
      return { ...x, fee_name: fee?.fee_name || '', fee_key: fee?.fee_key || '' }
    })
    return rows
  }
  const insert = async (domain, values) => {
    const table = domain.replaceAll('-', '_')
    if (!TABLES[table]) return null
    const fields = Object.keys(values).filter((key) => TABLES[table].includes(key) && key !== 'id')
    const stored = fields.map((key) => key === 'is_active' ? (values[key] ? 1 : 0) : values[key] == null || values[key] === '' ? null : DECIMAL_FIELDS.has(key) ? String(values[key]) : values[key])
    const result = await db.prepare(`INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`).bind(...stored).run()
    return find(domain, String(result.meta.last_row_id))
  }
  const update = async (domain, recordId, values) => {
    const table = domain.replaceAll('-', '_')
    if (!TABLES[table]) return null
    const fields = Object.keys(values).filter((key) => TABLES[table].includes(key) && key !== 'id')
    if (!fields.length) return find(domain, recordId)
    const stored = fields.map((key) => key === 'is_active' ? (values[key] ? 1 : 0) : values[key] == null || values[key] === '' ? null : DECIMAL_FIELDS.has(key) ? String(values[key]) : values[key])
    await db.prepare(`UPDATE ${table} SET ${fields.map((x) => `${x} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(...stored, Number(recordId)).run()
    return find(domain, recordId)
  }
  const remove = async (domain, recordId) => {
    const table = domain.replaceAll('-', '_')
    if (!TABLES[table]) return false
    const result = await db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(Number(recordId)).run()
    return result.meta.changes > 0
  }
  const applyImport = async (domain, rows, config) => {
    const statements = []
    let created_phases = 0, created_blocks = 0, inserted = 0, updated = 0
    const phases = new Map(config.calculator_phases.map((item) => [`${item.city_id}|${item.society_id}|${item.name.trim().toLowerCase()}`, item]))
    const blocks = new Map(config.calculator_blocks.map((item) => [`${item.calculator_phase_id}|${item.name.trim().toLowerCase()}`, item]))
    const rates = new Map(config.calculator_rates.map((item) => [`${item.calculator_phase_id}|${item.calculator_block_id || ''}|${item.calculator_property_type_id}`, item]))
    const transferFees = new Map(config.calculator_transfer_fees.map((item) => [`${item.calculator_phase_id}|${item.calculator_block_id || ''}|${item.category.trim().toLowerCase()}`, item]))
    const addedPhases = new Set(), addedBlocks = new Set()
    for (const row of rows) {
      const phaseKey = `${row.cityId}|${row.societyId}|${row.phaseName.trim().toLowerCase()}`
      let phase = phases.get(phaseKey)
      if (!phase && domain === 'calculator-rates') {
        if (!addedPhases.has(phaseKey)) {
        statements.push(db.prepare('INSERT OR IGNORE INTO calculator_phases (city_id,society_id,name) VALUES (?,?,?)').bind(Number(row.cityId), Number(row.societyId), row.phaseName))
          addedPhases.add(phaseKey); created_phases++
        }
      }
      const phaseIdSql = phase ? String(Number(phase.id)) : `(SELECT id FROM calculator_phases WHERE city_id=${Number(row.cityId)} AND society_id=${Number(row.societyId)} AND lower(name)=lower(${sqlText(row.phaseName)}) ORDER BY id LIMIT 1)`
      let block = null
      if (row.blockName) {
        const blockKey = `${phase?.id || phaseKey}|${row.blockName.trim().toLowerCase()}`
        block = blocks.get(blockKey)
        if (!block && domain === 'calculator-rates') {
          if (!addedBlocks.has(blockKey)) {
            statements.push(db.prepare(`INSERT OR IGNORE INTO calculator_blocks (calculator_phase_id,name) VALUES (${phaseIdSql},?)`).bind(row.blockName))
            addedBlocks.add(blockKey); created_blocks++
          }
        }
      }
      const blockSql = !row.blockName ? 'NULL' : block ? String(Number(block.id)) : `(SELECT id FROM calculator_blocks WHERE calculator_phase_id=${phaseIdSql} AND lower(name)=lower(${sqlText(row.blockName)}) ORDER BY id LIMIT 1)`
      if (domain === 'calculator-rates') {
        const typeSql = '(SELECT id FROM calculator_property_types WHERE category = ? AND property_type = ? ORDER BY id LIMIT 1)'
        // A single UPDATE followed by conditional INSERT keeps nullable block scopes portable.
        const fields = row.unit === 'sqft' ? [null,row.dcText,null,row.fbrText] : [row.dcText,null,row.fbrText,null]
        const scope = `${phase?.id || phaseKey}|${block?.id || (row.blockName ? `${phase?.id || phaseKey}:${row.blockName.trim().toLowerCase()}` : '')}|${row.propertyTypeId}`
        const existing = rates.get(scope)
        if (existing) {
          statements.push(db.prepare(`UPDATE calculator_rates SET dc_per_marla=?,dc_per_sqft=?,fbr_per_marla=?,fbr_per_sqft=?,is_active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(...fields, row.is_active ? 1 : 0, Number(existing.id))); updated++
        } else {
          statements.push(db.prepare(`INSERT INTO calculator_rates (calculator_phase_id,calculator_block_id,calculator_property_type_id,dc_per_marla,dc_per_sqft,fbr_per_marla,fbr_per_sqft,is_active) VALUES (${phaseIdSql},${blockSql},${typeSql},?,?,?,?,?)`).bind(row.category || '', row.propertyType, ...fields, row.is_active ? 1 : 0)); inserted++
        }
      } else {
        const scope = `${row.phaseId}|${row.blockId || ''}|${row.category.trim().toLowerCase()}`
        const existing = transferFees.get(scope)
        if (existing) {
          statements.push(db.prepare('UPDATE calculator_transfer_fees SET reference_amount=?,reference_size=?,reference_unit=?,is_active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(row.reference_amount_text, row.reference_size_text, row.reference_unit, row.is_active ? 1 : 0, Number(existing.id))); updated++
        } else {
          statements.push(db.prepare('INSERT INTO calculator_transfer_fees (calculator_phase_id,calculator_block_id,category,reference_amount,reference_size,reference_unit,is_active) VALUES (?,?,?,?,?,?,?)').bind(Number(row.phaseId),row.blockId == null ? null : Number(row.blockId),row.category,row.reference_amount_text,row.reference_size_text,row.reference_unit,row.is_active ? 1 : 0)); inserted++
        }
      }
    }
    if (statements.length) await db.batch(statements)
    return domain === 'calculator-rates' ? { inserted, updated, created_phases, created_blocks } : { inserted, updated }
  }
  return { loadConfig, list, find, insert, update, remove, applyImport, TABLES }
}

