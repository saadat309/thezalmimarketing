import { syntheticCalculatorConfig as config } from './calculator-fixtures.js'

const MAX_CSV_BYTES = 512 * 1024
const MAX_CSV_ROWS = 500

export const CALCULATOR_CSV_DOMAINS = Object.freeze(['calculator-rates', 'calculator-transfer-fees'])

const templates = {
  'calculator-rates': {
    filename: 'calculator_rates_sample.csv',
    content: 'City,Society,Phase,Block,Category,Property Type,Unit,DC Rate,FBR Rate,Active\r\nLahore,DHA Lahore (Synthetic),Sample Phase,,Residential,Plot,Per Marla,425000,440000,1\r\nLahore,DHA Lahore (Synthetic),Sample Phase,Sample Block A,Residential,House,Per Sq. Ft.,2200,2500,1\r\n',
  },
  'calculator-transfer-fees': {
    filename: 'calculator_transfer_fees_sample.csv',
    content: 'City,Society,Phase,Block,Category,Reference Size,Reference Unit,Reference Transfer Fee,Active\r\nLahore,DHA Lahore (Synthetic),Sample Phase,,Residential,5,Marla,42000,1\r\nLahore,DHA Lahore (Synthetic),Sample Phase,Sample Block A,Commercial,5,Marla,95000,1\r\n',
  },
}

export function calculatorCsvTemplate(domain, request) {
  const template = templates[domain]
  if (!template) return null
  const headers = new Headers({
      'Cache-Control': 'no-store',
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${template.filename}"`,
    })
  const origin = request?.headers.get('Origin')
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Credentials', 'true')
    headers.append('Vary', 'Origin')
  }
  return new Response(template.content, { headers })
}

export async function readBoundedCsvForm(request) {
  const statedLength = Number(request.headers.get('Content-Length') || 0)
  if (statedLength > MAX_CSV_BYTES) return { error: 'too_large' }
  if (!request.body) return { error: 'missing_file' }
  const reader = request.body.getReader()
  const chunks = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_CSV_BYTES) {
        await reader.cancel()
        return { error: 'too_large' }
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  try {
    const replay = new Request(request.url, { method: 'POST', headers: request.headers, body: bytes })
    const form = await replay.formData()
    const file = form.get('file')
    if (!(file instanceof File) || !file.name) return { error: 'missing_file' }
    if (!/\.csv$/i.test(file.name)) return { error: 'invalid_format' }
    const content = await file.text()
    return { content, validateOnly: ['1', 'true'].includes(String(form.get('validate_only') || '').toLowerCase()) }
  } catch {
    return { error: 'invalid_form' }
  }
}

export function parseCsv(content) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    if (quoted) {
      if (char === '"' && content[index + 1] === '"') { cell += '"'; index += 1 }
      else if (char === '"') quoted = false
      else cell += char
    } else if (char === '"' && cell.length === 0) quoted = true
    else if (char === ',') { row.push(cell); cell = '' }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && content[index + 1] === '\n') index += 1
      row.push(cell); cell = ''
      if (row.some((value) => value.trim() !== '')) rows.push(row)
      row = []
    } else cell += char
  }
  if (quoted) return { error: 'malformed_csv' }
  row.push(cell)
  if (row.some((value) => value.trim() !== '')) rows.push(row)
  if (!rows.length) return { error: 'empty' }
  const headers = rows.shift().map((value, index) => value.replace(/^\uFEFF/, '').trim().toLowerCase() || `column_${index + 1}`)
  const parsed = rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
  if (!parsed.length) return { error: 'empty' }
  if (parsed.length > MAX_CSV_ROWS) return { error: 'too_many_rows' }
  return { rows: parsed }
}

function value(row, ...keys) {
  for (const key of keys) if (row[key] !== undefined) return String(row[key]).trim()
  return ''
}

function activeValue(text) {
  return !['0', 'false', 'no'].includes(text.toLowerCase())
}

function summarize(domain, parsedRows) {
  const cities = new Map(config.cities.map((item) => [item.name.trim().toLowerCase(), item]))
  const societies = new Map(config.societies.map((item) => [item.name.trim().toLowerCase(), item]))
  const propertyTypes = new Map()
  for (const item of config.calculator_property_types) {
    propertyTypes.set(`${item.category.trim().toLowerCase()}|${item.property_type.trim().toLowerCase()}`, item)
    propertyTypes.set(item.label.trim().toLowerCase(), item)
  }
  const seen = new Set()
  const details = []
  const validRows = []
  let duplicateRows = 0
  for (const [index, row] of parsedRows.entries()) {
    const errors = []
    const city = value(row, 'city', 'city_name')
    const society = value(row, 'society', 'society_name')
    const phase = value(row, 'phase', 'phase_name', 'calculator_phase')
    const block = value(row, 'block', 'block_name', 'calculator_block')
    const cityRecord = cities.get(city.toLowerCase())
    const societyRecord = societies.get(society.toLowerCase())
    if (!cityRecord) errors.push(`City '${city}' does not exist in the synthetic dataset.`)
    if (!societyRecord) errors.push(`Society '${society}' does not exist in the synthetic dataset.`)
    if (!phase) errors.push('Missing required Phase name.')
    const unitText = value(row, ...(domain === 'calculator-rates' ? ['unit'] : ['reference unit', 'reference_unit', 'unit'])) || 'marla'
    const unit = /sq|ft/i.test(unitText) ? 'sqft' : 'marla'
    let normalized
    let duplicateKey
    if (domain === 'calculator-rates') {
      const category = value(row, 'category')
      const propertyType = value(row, 'property type', 'property_type', 'type')
      const type = propertyTypes.get(category && propertyType ? `${category.toLowerCase()}|${propertyType.toLowerCase()}` : propertyType.toLowerCase())
      if (!type) errors.push(`Invalid or missing property type: '${propertyType}' (Category: '${category}'). Must match a fixed calculator property type.`)
      const dcText = value(row, 'dc rate', 'dc_rate', 'dc')
      const fbrText = value(row, 'fbr rate', 'fbr_rate', 'fbr')
      const dc = dcText !== '' && Number.isFinite(Number(dcText)) ? Number(dcText) : null
      const fbr = fbrText !== '' && Number.isFinite(Number(fbrText)) ? Number(fbrText) : null
      if ((dcText !== '' && dc === null) || (fbrText !== '' && fbr === null) || (dc === null && fbr === null)) errors.push('At least one DC Rate or FBR Rate must be numeric.')
      duplicateKey = [city.toLowerCase(), society.toLowerCase(), phase.toLowerCase(), block.toLowerCase(), type?.id || '0'].join('|')
      normalized = { cityId: cityRecord?.id, societyId: societyRecord?.id, phaseName: phase, blockName: block, propertyTypeId: type?.id, unit, dcRate: dc ?? 0, fbrRate: fbr ?? 0, is_active: activeValue(value(row, 'active', 'is_active') || '1') }
    } else {
      const phaseRecord = config.calculator_phases.find((item) => item.city_id === cityRecord?.id && item.society_id === societyRecord?.id && item.name.trim().toLowerCase() === phase.toLowerCase())
      if (cityRecord && societyRecord && phase && !phaseRecord) errors.push(`Phase '${phase}' does not exist for City '${city}' and Society '${society}'.`)
      const blockRecord = block && phaseRecord ? config.calculator_blocks.find((item) => item.calculator_phase_id === phaseRecord.id && item.name.trim().toLowerCase() === block.toLowerCase()) : null
      if (block && phaseRecord && !blockRecord) errors.push(`Block '${block}' does not exist for Phase '${phase}'.`)
      const category = value(row, 'category')
      if (!category) errors.push('Missing required Category (e.g. Residential, Commercial, Sector Shop).')
      const sizeText = value(row, 'reference size marla', 'reference_size_marla', 'reference size', 'reference_size')
      const amountText = value(row, 'reference transfer fee', 'reference_transfer_fee', 'reference_amount', 'amount')
      const size = sizeText !== '' && Number.isFinite(Number(sizeText)) ? Number(sizeText) : 0
      const amount = amountText !== '' && Number.isFinite(Number(amountText)) ? Number(amountText) : 0
      if (size <= 0) errors.push('Reference size must be greater than 0.')
      if (amount <= 10500) errors.push('Reference transfer fee must exceed Rs. 10,500 (Sports Fund).')
      duplicateKey = [city.toLowerCase(), society.toLowerCase(), phase.toLowerCase(), block.toLowerCase(), category.toLowerCase()].join('|')
      normalized = { phaseId: phaseRecord?.id, blockId: blockRecord?.id || null, category, reference_size: size, reference_unit: unit, reference_amount: amount, is_active: activeValue(value(row, 'active', 'is_active') || '1') }
    }
    const isDuplicate = seen.has(duplicateKey)
    if (isDuplicate) { errors.push(domain === 'calculator-rates' ? 'Duplicate row inside uploaded file for this location and property type combination.' : 'Duplicate row inside uploaded file for this location and category combination.'); duplicateRows += 1 }
    seen.add(duplicateKey)
    const isValid = errors.length === 0
    if (isValid) validRows.push(normalized)
    details.push({ row: index + 2, city, society, phase, block, ...(domain === 'calculator-rates' ? { property_type: value(row, 'property type', 'property_type', 'type') } : { category: value(row, 'category') }), is_valid: isValid, is_duplicate: isDuplicate, errors })
  }
  return {
    summary: { total_rows: parsedRows.length, valid_rows: validRows.length, invalid_rows: parsedRows.length - validRows.length, duplicate_rows: duplicateRows, details },
    validRows,
  }
}

export function prepareCalculatorCsvImport(domain, content) {
  if (!CALCULATOR_CSV_DOMAINS.includes(domain)) return { error: 'unsupported_domain' }
  const parsed = parseCsv(content)
  if (parsed.error) return { error: parsed.error }
  return summarize(domain, parsed.rows)
}

export function applyCalculatorCsvImport(domain, rows) {
  if (domain === 'calculator-rates') {
    let inserted = 0
    let updated = 0
    let created_phases = 0
    let created_blocks = 0
    for (const row of rows) {
      let phase = config.calculator_phases.find((item) => item.city_id === row.cityId && item.society_id === row.societyId && item.name.toLowerCase() === row.phaseName.toLowerCase())
      if (!phase) {
        phase = { id: `phase-import-${crypto.randomUUID()}`, city_id: row.cityId, society_id: row.societyId, name: row.phaseName, sort_order: 0, is_active: true, updated_at: new Date().toISOString().slice(0, 10) }
        config.calculator_phases.push(phase); created_phases += 1
      }
      let blockId = null
      if (row.blockName) {
        let block = config.calculator_blocks.find((item) => item.calculator_phase_id === phase.id && item.name.toLowerCase() === row.blockName.toLowerCase())
        if (!block) {
          block = { id: `block-import-${crypto.randomUUID()}`, calculator_phase_id: phase.id, name: row.blockName, sort_order: 0, is_active: true, updated_at: new Date().toISOString().slice(0, 10) }
          config.calculator_blocks.push(block); created_blocks += 1
        }
        blockId = block.id
      }
      const rate = config.calculator_rates.find((item) => item.calculator_phase_id === phase.id && (item.calculator_block_id || null) === blockId && item.calculator_property_type_id === row.propertyTypeId)
      const rateFields = row.unit === 'sqft'
        ? { dc_per_marla: 0, dc_per_sqft: row.dcRate, fbr_per_marla: 0, fbr_per_sqft: row.fbrRate }
        : { dc_per_marla: row.dcRate, dc_per_sqft: 0, fbr_per_marla: row.fbrRate, fbr_per_sqft: 0 }
      if (rate) { Object.assign(rate, rateFields, { is_active: row.is_active, updated_at: new Date().toISOString().slice(0, 10) }); updated += 1 }
      else { config.calculator_rates.push({ id: `rate-import-${crypto.randomUUID()}`, calculator_phase_id: phase.id, calculator_block_id: blockId, calculator_property_type_id: row.propertyTypeId, ...rateFields, is_active: row.is_active, updated_at: new Date().toISOString().slice(0, 10) }); inserted += 1 }
    }
    return { inserted, updated, created_phases, created_blocks }
  }
  let inserted = 0
  let updated = 0
  for (const row of rows) {
    const fee = config.calculator_transfer_fees.find((item) => item.calculator_phase_id === row.phaseId && (item.calculator_block_id || null) === row.blockId && item.category.toLowerCase() === row.category.toLowerCase())
    const feeFields = {
      calculator_phase_id: row.phaseId, calculator_block_id: row.blockId, category: row.category,
      reference_size: row.reference_size, reference_unit: row.reference_unit,
      reference_amount: row.reference_amount, is_active: row.is_active,
    }
    if (fee) { Object.assign(fee, feeFields, { updated_at: new Date().toISOString().slice(0, 10) }); updated += 1 }
    else { config.calculator_transfer_fees.push({ id: `transfer-import-${crypto.randomUUID()}`, ...feeFields, updated_at: new Date().toISOString().slice(0, 10) }); inserted += 1 }
  }
  return { inserted, updated }
}
