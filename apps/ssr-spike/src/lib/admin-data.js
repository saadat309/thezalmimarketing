import { syntheticFiles, syntheticMaps } from './directory-fixtures.js'
import { syntheticProperties } from './property-fixtures.js'
import { syntheticCalculatorConfig } from './calculator-fixtures.js'

const DOMAIN_FIELDS = {
  properties: {
    title: 'text', shortDescription: 'textarea', address: 'text', propertyType: 'text', purchaseType: 'text',
    category: 'text', city: 'text', society: 'text', phase: 'text', price: 'integer', area: 'number', areaUnit: 'text', beds: 'integer', baths: 'integer',
    isFurnished: 'boolean', isDiscounted: 'boolean', visible: 'boolean', description: 'textarea',
  },
  files: { title: 'text', city: 'text', society: 'text', phase: 'text', fileType: 'text', area: 'number', areaUnit: 'text', price: 'integer', visible: 'boolean' },
  maps: { title: 'text', city: 'text', society: 'text', phase: 'text', description: 'textarea', visible: 'boolean' },
  cities: { name: 'text', map_ids: 'multiSelect' },
  categories: { name: 'text' },
  societies: { name: 'text', map_ids: 'multiSelect' },
  phases: { name: 'text', map_ids: 'multiSelect' },
  queries: { property_id: 'optionalText', property_title: 'optionalText', name: 'text', email: 'optionalText', phone: 'optionalText', message: 'textarea', created_at: 'text', is_read: 'boolean' },
  'landing-page': { sectionName: 'text', title: 'text', subtitle: 'textarea', order: 'integer', active: 'boolean', collection: 'text', selectedItems: 'json', mediaMode: 'text', mediaUrl: 'optionalText', delayMs: 'integer' },
  'calculator-phases': { name: 'text', active: 'boolean' },
  'calculator-blocks': { name: 'text', phase: 'text', active: 'boolean' },
  'calculator-property-types': { name: 'text', active: 'boolean' },
  'calculator-rates': {
    calculator_phase_id: 'select', calculator_block_id: 'optionalSelect', calculator_property_type_id: 'select',
    unit: 'select', dc_rate: 'number', fbr_rate: 'number', is_active: 'boolean',
  },
  'calculator-transfer-fees': {
    calculator_phase_id: 'select', calculator_block_id: 'optionalSelect', category: 'select',
    reference_amount: 'number', reference_size: 'number', reference_unit: 'select', is_active: 'boolean',
  },
  'calculator-fees': { fee_key: 'text', fee_name: 'text', amount: 'number', charge_unit: 'select', is_active: 'boolean' },
  'calculator-tax-rates': { rate_key: 'text', rate_name: 'text', rate: 'number', rate_unit: 'select', is_active: 'boolean' },
  'calculator-fee-rules': {
    fee_id: 'select', property_type: 'select', unit: 'select', min_area: 'number', max_area: 'optionalNumber', fee_amount: 'number', is_active: 'boolean',
  },
}

const initial = {
  cities: [{ id: 'city-lahore', name: 'Lahore', map_ids: [], updated_at: '2026-10-18' }, { id: 'city-multan', name: 'Multan', map_ids: [], updated_at: '2026-10-18' }],
  categories: [{ id: 'category-homes', name: 'Homes', pic: '', updated_at: '2026-10-18' }],
  societies: [{ id: 'society-sample', name: 'Sample Garden Society', map_ids: [], updated_at: '2026-10-18' }],
  phases: [{ id: 'phase-sample', name: 'Sample Phase One', map_ids: [], updated_at: '2026-10-18' }],
  queries: [
    { id: 'query-sample-1', property_id: '101', property_title: 'Synthetic Garden Home', name: 'Sample Visitor', email: 'visitor@example.invalid', phone: '+92 300 0000000', message: 'I would like more information about this sample listing.', created_at: '2026-10-17 11:30:00', is_read: false },
    { id: 'query-sample-2', property_id: null, property_title: '', name: 'Demo Customer', email: 'demo@example.invalid', phone: '+92 300 0000001', message: 'Please share the synthetic brochure and available viewing times.', created_at: '2026-10-15 15:45:00', is_read: true },
  ],
  'landing-page': [
    { id: 'section-popup', sectionName: 'Landing Popup', title: 'Special Offer', subtitle: 'Discover our latest synthetic listings.', order: 1, active: false, collection: 'popup', selectedItems: [], mediaMode: 'image', mediaUrl: '', delayMs: 5000 },
    { id: 'section-video', sectionName: 'Video Section', title: 'Featured Video', subtitle: 'Watch our latest property showcase.', order: 2, active: true, collection: 'video', selectedItems: [], mediaMode: 'embed', mediaUrl: '', delayMs: 5000 },
    { id: 'section-featured', sectionName: 'Featured Properties', title: 'Featured Properties', subtitle: 'Discover our hand-picked selection of properties.', order: 3, active: true, collection: 'properties', selectedItems: ['1'], mediaMode: 'image', mediaUrl: '', delayMs: 5000 },
    { id: 'section-categories', sectionName: 'Property Categories', title: 'Property Categories', subtitle: 'Explore properties by type.', order: 4, active: true, collection: 'categories', selectedItems: ['category-homes'], mediaMode: 'image', mediaUrl: '', delayMs: 5000 },
    { id: 'section-maps', sectionName: 'Location Maps', title: 'Location Maps', subtitle: 'Find properties in prime locations.', order: 5, active: true, collection: 'maps', selectedItems: [], mediaMode: 'image', mediaUrl: '', delayMs: 5000 },
    { id: 'section-files', sectionName: 'Available Files', title: 'Available Files', subtitle: 'Explore available property files.', order: 6, active: false, collection: 'files', selectedItems: [], mediaMode: 'image', mediaUrl: '', delayMs: 5000 },
  ],
  'calculator-phases': [{ id: 'calc-phase-sample', name: 'Sample Phase', active: true }],
  'calculator-blocks': [{ id: 'calc-block-sample', name: 'Sample Block', phase: 'Sample Phase', active: true }],
  'calculator-property-types': [{ id: 'calc-type-house', name: 'House', active: true }],
  'calculator-rates': [{ id: 'calc-rate-sample', name: 'Sample residential rate', phase: 'Sample Phase', block: 'Sample Block', propertyType: 'House', amount: 1000 }],
  'calculator-transfer-fees': [{ id: 'calc-transfer-sample', name: 'Sample transfer fee', phase: 'Sample Phase', block: 'Sample Block', amount: 5000 }],
  'calculator-fees': [{ id: 'calc-fee-sample', name: 'Sample processing fee', amount: 2500 }],
  'calculator-tax-rates': [{ id: 'calc-tax-sample', name: 'Sample tax rate', rate: 1 }],
  'calculator-fee-rules': [],
}

const records = new Map(Object.entries(initial).map(([domain, items]) => [domain, items.map((item) => ({ ...item }))]))
const publicSources = { properties: syntheticProperties, files: syntheticFiles, maps: syntheticMaps }
let nextId = 1

function calculatorRateUnit(rate) {
  return Number(rate.dc_per_marla) !== 0 || Number(rate.dc_per_sqft) === 0 ? 'marla' : 'sqft'
}

function calculatorRateRecord(rate) {
  const phase = syntheticCalculatorConfig.calculator_phases.find((item) => item.id === rate.calculator_phase_id)
  const society = syntheticCalculatorConfig.societies.find((item) => item.id === phase?.society_id)
  const city = syntheticCalculatorConfig.cities.find((item) => item.id === phase?.city_id)
  const block = syntheticCalculatorConfig.calculator_blocks.find((item) => item.id === rate.calculator_block_id)
  const propertyType = syntheticCalculatorConfig.calculator_property_types.find((item) => item.id === rate.calculator_property_type_id)
  const unit = calculatorRateUnit(rate)
  return {
    id: rate.id,
    city_name: city?.name || '', society_name: society?.name || '', calculator_phase_name: phase?.name || '',
    calculator_block_name: block?.name || '', category: propertyType?.category || '',
    property_type_label: propertyType?.label || propertyType?.property_type || '',
    unit_label: unit === 'sqft' ? 'Per Sq. Ft.' : 'Per Marla', unit,
    calculator_phase_id: rate.calculator_phase_id, calculator_block_id: rate.calculator_block_id || '',
    calculator_property_type_id: rate.calculator_property_type_id,
    dc_rate: unit === 'sqft' ? Number(rate.dc_per_sqft) : Number(rate.dc_per_marla),
    fbr_rate: unit === 'sqft' ? Number(rate.fbr_per_sqft) : Number(rate.fbr_per_marla),
    is_active: rate.is_active !== false,
    updated_at: rate.updated_at || '2026-10-18',
  }
}

function calculatorRateOptions() {
  return {
    calculator_phase_id: syntheticCalculatorConfig.calculator_phases.map((phase) => {
      const city = syntheticCalculatorConfig.cities.find((item) => item.id === phase.city_id)
      const society = syntheticCalculatorConfig.societies.find((item) => item.id === phase.society_id)
      return { value: phase.id, label: `${city?.name || ''} > ${society?.name || ''} > ${phase.name}` }
    }),
    calculator_block_id: syntheticCalculatorConfig.calculator_blocks.map((block) => ({ value: block.id, label: block.name, phaseId: block.calculator_phase_id })),
    calculator_property_type_id: syntheticCalculatorConfig.calculator_property_types.map((type) => ({ value: type.id, label: `${type.category} - ${type.label || type.property_type}` })),
    unit: [{ value: 'marla', label: 'Per Marla' }, { value: 'sqft', label: 'Per Sq. Ft.' }],
  }
}

function calculatorTransferFeeOptions() {
  return {
    calculator_phase_id: calculatorRateOptions().calculator_phase_id,
    calculator_block_id: calculatorRateOptions().calculator_block_id,
    category: [...new Set(syntheticCalculatorConfig.calculator_property_types.map((item) => item.category).filter(Boolean))]
      .map((category) => ({ value: category, label: category })),
    reference_unit: [{ value: 'marla', label: 'Marla' }, { value: 'sqft', label: 'Sq. Ft.' }],
  }
}

function calculatorTransferFeeRecord(fee) {
  const phase = syntheticCalculatorConfig.calculator_phases.find((item) => item.id === fee.calculator_phase_id)
  const society = syntheticCalculatorConfig.societies.find((item) => item.id === phase?.society_id)
  const city = syntheticCalculatorConfig.cities.find((item) => item.id === phase?.city_id)
  const block = syntheticCalculatorConfig.calculator_blocks.find((item) => item.id === fee.calculator_block_id)
  const amount = Number(fee.reference_amount) || 0
  const size = Number(fee.reference_size) || 0
  const unit = fee.reference_unit === 'sqft' ? 'sqft' : 'marla'
  const base = Math.max(0, amount - 10500)
  const referenceMarla = unit === 'sqft' ? size / 225 : size
  const referenceSqft = unit === 'sqft' ? size : size * 225
  const round = (value, places) => {
    const scale = 10 ** places
    return Math.round((value + Number.EPSILON) * scale) / scale
  }
  return {
    id: fee.id, calculator_phase_id: fee.calculator_phase_id, calculator_phase_name: phase?.name || '',
    city_name: city?.name || '', society_name: society?.name || '', calculator_block_id: fee.calculator_block_id || '',
    calculator_block_name: block?.name || '', category: fee.category, reference_amount: amount,
    reference_size: size, reference_unit: unit, is_active: fee.is_active !== false,
    base_transfer_fee: round(base, 2), reference_marla: round(referenceMarla, 4), reference_sqft: round(referenceSqft, 4),
    per_marla_rate: referenceMarla > 0 ? round(base / referenceMarla, 2) : 0,
    per_sqft_rate: referenceSqft > 0 ? round(base / referenceSqft, 4) : 0,
    updated_at: fee.updated_at || '2026-10-18',
  }
}

function validateCalculatorTransferFeeFields(input) {
  const result = {}
  const errors = {}
  const categories = new Set(syntheticCalculatorConfig.calculator_property_types.map((item) => item.category).filter(Boolean))
  for (const [key, value] of Object.entries(input)) {
    if (!Object.hasOwn(DOMAIN_FIELDS['calculator-transfer-fees'], key)) errors[key] = 'Field is not editable.'
    else if (key === 'calculator_phase_id' && typeof value === 'string' && syntheticCalculatorConfig.calculator_phases.some((item) => item.id === value)) result[key] = value
    else if (key === 'calculator_block_id' && (value === '' || typeof value === 'string') && (value === '' || syntheticCalculatorConfig.calculator_blocks.some((item) => item.id === value))) result[key] = value
    else if (key === 'category' && typeof value === 'string' && categories.has(value)) result[key] = value
    else if (key === 'reference_amount' && typeof value === 'number' && Number.isFinite(value) && value > 10500) result[key] = value
    else if (key === 'reference_size' && typeof value === 'number' && Number.isFinite(value) && value > 0) result[key] = value
    else if (key === 'reference_unit' && ['marla', 'sqft'].includes(value)) result[key] = value
    else if (key === 'is_active' && typeof value === 'boolean') result[key] = value
    else errors[key] = 'Value is invalid.'
  }
  for (const field of ['calculator_phase_id', 'category', 'reference_amount', 'reference_size', 'reference_unit']) {
    if (!(field in result)) errors[field] ||= 'This field is required or invalid.'
  }
  if (result.calculator_block_id) {
    const block = syntheticCalculatorConfig.calculator_blocks.find((item) => item.id === result.calculator_block_id)
    if (block && result.calculator_phase_id && block.calculator_phase_id !== result.calculator_phase_id) errors.calculator_block_id = 'Block must belong to the selected phase.'
  }
  return { result, errors }
}

function calculatorTransferFeeScopeExists(fields, ignoreId) {
  return syntheticCalculatorConfig.calculator_transfer_fees.some((fee) => fee.id !== ignoreId &&
    fee.calculator_phase_id === fields.calculator_phase_id &&
    (fee.calculator_block_id || '') === (fields.calculator_block_id || '') && fee.category === fields.category)
}

function writeCalculatorTransferFee(fee, fields) {
  for (const key of ['calculator_phase_id', 'category', 'reference_amount', 'reference_size', 'reference_unit', 'is_active']) {
    if (fields[key] !== undefined) fee[key] = fields[key]
  }
  if (fields.calculator_block_id !== undefined) fee.calculator_block_id = fields.calculator_block_id || null
  fee.updated_at = new Date().toISOString().slice(0, 10)
  return calculatorTransferFeeRecord(fee)
}

function validateCalculatorFeeFields(input, { updating = false } = {}) {
  const result = {}
  const errors = {}
  const allowed = updating ? ['fee_name', 'amount', 'is_active'] : ['fee_key', 'fee_name', 'amount', 'charge_unit', 'is_active']
  for (const [key, value] of Object.entries(input)) {
    if (!allowed.includes(key)) errors[key] = updating && ['fee_key', 'charge_unit'].includes(key) ? 'This field cannot be changed after creation.' : 'Field is not editable.'
    else if (key === 'fee_key' && typeof value === 'string' && /^[a-z][a-z0-9_]{0,79}$/.test(value.trim())) result[key] = value.trim()
    else if (key === 'fee_name' && typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 150) result[key] = value.trim()
    else if (key === 'amount' && typeof value === 'number' && Number.isFinite(value) && value >= 0) result[key] = value
    else if (key === 'charge_unit' && ['transaction', 'property', 'owner'].includes(value)) result[key] = value
    else if (key === 'is_active' && typeof value === 'boolean') result[key] = value
    else errors[key] = 'Value is invalid.'
  }
  const required = updating ? [] : ['fee_key', 'fee_name', 'amount', 'charge_unit']
  for (const field of required) if (!(field in result)) errors[field] ||= 'This field is required or invalid.'
  if (!Object.keys(result).length && !Object.keys(errors).length) errors._ = 'Provide at least one editable field.'
  return { result, errors }
}

function writeCalculatorFee(fee, fields) {
  for (const key of ['fee_key', 'fee_name', 'amount', 'charge_unit', 'is_active']) {
    if (fields[key] !== undefined) fee[key] = fields[key]
  }
  fee.updated_at = new Date().toISOString().slice(0, 10)
  return { ...fee }
}

function validateCalculatorTaxRateFields(input, { updating = false } = {}) {
  const result = {}
  const errors = {}
  const allowed = updating ? ['rate_name', 'rate', 'is_active'] : ['rate_key', 'rate_name', 'rate', 'rate_unit', 'is_active']
  for (const [key, value] of Object.entries(input)) {
    if (!allowed.includes(key)) errors[key] = updating && ['rate_key', 'rate_unit'].includes(key) ? 'This field cannot be changed after creation.' : 'Field is not editable.'
    else if (key === 'rate_key' && typeof value === 'string' && /^[a-z][a-z0-9_]{0,79}$/.test(value.trim())) result[key] = value.trim()
    else if (key === 'rate_name' && typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 150) result[key] = value.trim()
    else if (key === 'rate' && typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 9999.9999) result[key] = value
    else if (key === 'rate_unit' && value === 'percent') result[key] = value
    else if (key === 'is_active' && typeof value === 'boolean') result[key] = value
    else errors[key] = 'Value is invalid.'
  }
  const required = updating ? [] : ['rate_key', 'rate_name', 'rate', 'rate_unit']
  for (const field of required) if (!(field in result)) errors[field] ||= 'This field is required or invalid.'
  if (!Object.keys(result).length && !Object.keys(errors).length) errors._ = 'Provide at least one editable field.'
  return { result, errors }
}

function calculatorFeeRuleRecord(rule) {
  const fee = syntheticCalculatorConfig.calculator_fees.find((item) => item.id === rule.fee_id)
  return { ...rule, fee_key: fee?.fee_key || '', fee_name: fee?.fee_name || '', is_active: rule.is_active !== false && rule.is_active !== 0 }
}

function calculatorFeeRuleOptions() {
  return {
    fee_id: syntheticCalculatorConfig.calculator_fees.map((fee) => ({ value: fee.id, label: `${fee.fee_name} (${fee.fee_key})` })),
    property_type: [{ value: 'Residential', label: 'Residential' }, { value: 'Commercial', label: 'Commercial' }],
    unit: [{ value: 'marla', label: 'Marla' }, { value: 'kanal', label: 'Kanal' }],
  }
}

function validateCalculatorFeeRuleFields(input, { updating = false } = {}) {
  const result = {}
  const errors = {}
  const fields = DOMAIN_FIELDS['calculator-fee-rules']
  for (const [key, value] of Object.entries(input)) {
    if (!Object.hasOwn(fields, key)) errors[key] = 'Field is not editable.'
    else if (key === 'fee_id' && typeof value === 'string' && syntheticCalculatorConfig.calculator_fees.some((item) => item.id === value)) result[key] = value
    else if (key === 'property_type' && ['Residential', 'Commercial'].includes(value)) result[key] = value
    else if (key === 'unit' && ['marla', 'kanal'].includes(value)) result[key] = value
    else if (key === 'min_area' && typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1000000) result[key] = value
    else if (key === 'max_area' && (value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1000000))) result[key] = value
    else if (key === 'fee_amount' && typeof value === 'number' && Number.isFinite(value) && value >= 0) result[key] = value
    else if (key === 'is_active' && typeof value === 'boolean') result[key] = value
    else errors[key] = 'Value is invalid.'
  }
  const required = ['fee_id', 'property_type', 'unit', 'min_area', 'fee_amount']
  for (const field of required) if (!(field in result)) errors[field] ||= 'This field is required or invalid.'
  if (result.max_area != null && result.min_area !== undefined && result.max_area <= result.min_area) errors.max_area = 'Maximum area must be greater than minimum area.'
  if (!Object.keys(result).length && !Object.keys(errors).length) errors._ = 'Provide at least one editable field.'
  return { result, errors }
}

function writeCalculatorFeeRule(rule, fields) {
  for (const key of ['fee_id', 'property_type', 'unit', 'min_area', 'max_area', 'fee_amount', 'is_active']) {
    if (fields[key] !== undefined) rule[key] = fields[key]
  }
  if (rule.is_active === undefined) rule.is_active = true
  rule.updated_at = new Date().toISOString().slice(0, 10)
  return calculatorFeeRuleRecord(rule)
}

function writeCalculatorTaxRate(rate, fields) {
  for (const key of ['rate_key', 'rate_name', 'rate', 'rate_unit', 'is_active']) {
    if (fields[key] !== undefined) rate[key] = fields[key]
  }
  rate.updated_at = new Date().toISOString().slice(0, 10)
  return { ...rate }
}

function writeCalculatorRate(rate, fields) {
  if (fields.calculator_phase_id !== undefined) rate.calculator_phase_id = fields.calculator_phase_id
  if (fields.calculator_block_id !== undefined) rate.calculator_block_id = fields.calculator_block_id || null
  if (fields.calculator_property_type_id !== undefined) rate.calculator_property_type_id = fields.calculator_property_type_id
  if (fields.unit !== undefined) {
    rate.dc_per_marla = fields.unit === 'marla' ? Number(fields.dc_rate ?? 0) : 0
    rate.dc_per_sqft = fields.unit === 'sqft' ? Number(fields.dc_rate ?? 0) : 0
    rate.fbr_per_marla = fields.unit === 'marla' ? Number(fields.fbr_rate ?? 0) : 0
    rate.fbr_per_sqft = fields.unit === 'sqft' ? Number(fields.fbr_rate ?? 0) : 0
  } else {
    const unit = calculatorRateUnit(rate)
    if (fields.dc_rate !== undefined) rate[unit === 'sqft' ? 'dc_per_sqft' : 'dc_per_marla'] = Number(fields.dc_rate)
    if (fields.fbr_rate !== undefined) rate[unit === 'sqft' ? 'fbr_per_sqft' : 'fbr_per_marla'] = Number(fields.fbr_rate)
  }
  if (fields.is_active !== undefined) rate.is_active = fields.is_active
  rate.updated_at = new Date().toISOString().slice(0, 10)
  return calculatorRateRecord(rate)
}

function validateCalculatorRateFields(input) {
  const result = {}
  const errors = {}
  for (const [key, value] of Object.entries(input)) {
    if (!Object.hasOwn(DOMAIN_FIELDS['calculator-rates'], key)) errors[key] = 'Field is not editable.'
    else if (key === 'calculator_phase_id' && typeof value === 'string' && syntheticCalculatorConfig.calculator_phases.some((item) => item.id === value)) result[key] = value
    else if (key === 'calculator_block_id' && (value === '' || typeof value === 'string') && (value === '' || syntheticCalculatorConfig.calculator_blocks.some((item) => item.id === value))) result[key] = value
    else if (key === 'calculator_property_type_id' && typeof value === 'string' && syntheticCalculatorConfig.calculator_property_types.some((item) => item.id === value)) result[key] = value
    else if (key === 'unit' && ['marla', 'sqft'].includes(value)) result[key] = value
    else if (['dc_rate', 'fbr_rate'].includes(key) && typeof value === 'number' && Number.isFinite(value) && value >= 0) result[key] = value
    else if (key === 'is_active' && typeof value === 'boolean') result[key] = value
    else errors[key] = 'Value is invalid.'
  }
  for (const field of ['calculator_phase_id', 'calculator_property_type_id', 'unit', 'dc_rate', 'fbr_rate']) {
    if (!(field in result)) errors[field] ||= 'This field is required.'
  }
  if (result.calculator_block_id) {
    const block = syntheticCalculatorConfig.calculator_blocks.find((item) => item.id === result.calculator_block_id)
    const selectedPhase = result.calculator_phase_id
    if (block && selectedPhase && block.calculator_phase_id !== selectedPhase) errors.calculator_block_id = 'Block must belong to the selected phase.'
  }
  return { result, errors }
}

function calculatorRateScopeExists(fields, ignoreId) {
  return syntheticCalculatorConfig.calculator_rates.some((rate) => rate.id !== ignoreId &&
    rate.calculator_phase_id === fields.calculator_phase_id &&
    (rate.calculator_block_id || '') === (fields.calculator_block_id || '') &&
    rate.calculator_property_type_id === fields.calculator_property_type_id)
}

function toSlug(value) {
  return value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'synthetic-record'
}

function sourceId(domain, item) {
  return domain === 'properties' ? String(item.id) : item.slug
}

function toAdminRecord(domain, item) {
  if (domain === 'properties') return {
    id: sourceId(domain, item), title: item.title, shortDescription: item.shortDescription || '', address: item.location?.address || '',
    propertyType: item.propertyType || 'Residential', purchaseType: item.purchaseType || 'sale', category: item.category?.name || '',
    city: item.location?.city?.name || '', society: item.location?.society?.name || '', phase: item.location?.phase?.name || '',
    price: Number(item.price) || 0, area: Number(item.area?.value) || 0,
    areaUnit: item.area?.unit || 'sqft', beds: Number(item.beds) || 0, baths: Number(item.baths) || 0,
    isFurnished: item.isFurnished === true, isDiscounted: item.isDiscounted === true, visible: item.public === true,
    description: item.descriptionHtml || '',
  }
  if (domain === 'files') return {
    id: item.slug, title: item.title, city: item.cityName, society: item.societyName, phase: item.phaseName,
    fileType: item.fileType, area: Number(item.area?.value) || 0, areaUnit: item.area?.unit || 'marla',
    price: Number(item.price?.amount) || 0, visible: item.public === true,
  }
  if (domain === 'maps') return { id: item.slug, title: item.title, city: item.cityName, society: item.societyName, phase: item.phaseName, description: item.description || '', visible: item.public === true }
  return { id: item.slug, title: item.title, city: item.cityName, visible: item.public === true }
}

function publicSourceList(domain) {
  const source = publicSources[domain]
  return domain === 'properties' ? source.filter((item) => item.fileOnly !== true).map((item) => toAdminRecord(domain, item)) : source.map((item) => toAdminRecord(domain, item))
}

function findPublicSource(domain, id) {
  const source = publicSources[domain]
  return source.find((item) => sourceId(domain, item) === String(id) && (domain !== 'properties' || item.fileOnly !== true)) || null
}

function applyPublicFields(domain, target, fields) {
  if (fields.title !== undefined) target.title = fields.title
  if (fields.visible !== undefined) target.public = fields.visible
  if (domain === 'properties') {
    if (fields.shortDescription !== undefined) target.shortDescription = fields.shortDescription
    if (fields.address !== undefined) target.location.address = fields.address
    if (fields.propertyType !== undefined) target.propertyType = fields.propertyType
    if (fields.purchaseType !== undefined) target.purchaseType = fields.purchaseType
    if (fields.category !== undefined) target.category = { ...target.category, name: fields.category, slug: toSlug(fields.category) }
    if (fields.city !== undefined) target.location.city = { ...target.location.city, name: fields.city, slug: toSlug(fields.city) }
    if (fields.society !== undefined) target.location.society = { ...target.location.society, name: fields.society, slug: toSlug(fields.society) }
    if (fields.phase !== undefined) target.location.phase = { ...target.location.phase, name: fields.phase, slug: toSlug(fields.phase) }
    if (fields.price !== undefined) target.price = String(fields.price)
    if (fields.area !== undefined || fields.areaUnit !== undefined) target.area = { ...target.area, value: String(fields.area ?? target.area?.value ?? 0), unit: fields.areaUnit ?? target.area?.unit ?? 'sqft' }
    if (fields.beds !== undefined) target.beds = fields.beds
    if (fields.baths !== undefined) target.baths = fields.baths
    if (fields.isFurnished !== undefined) target.isFurnished = fields.isFurnished
    if (fields.isDiscounted !== undefined) target.isDiscounted = fields.isDiscounted
    if (fields.description !== undefined) target.descriptionHtml = fields.description
  } else {
    if (fields.city !== undefined) {
      target.cityName = fields.city
      target.city = toSlug(fields.city)
    }
    if (fields.society !== undefined) { target.societyName = fields.society; target.society = toSlug(fields.society) }
    if (fields.phase !== undefined) { target.phaseName = fields.phase; target.phase = toSlug(fields.phase) }
    if (domain === 'files') {
      if (fields.fileType !== undefined) target.fileType = fields.fileType
      if (fields.area !== undefined || fields.areaUnit !== undefined) target.area = { ...target.area, value: String(fields.area ?? target.area?.value ?? 0), unit: fields.areaUnit ?? target.area?.unit ?? 'marla' }
      if (fields.price !== undefined) target.price = { ...target.price, amount: String(fields.price), currency: 'PKR' }
    }
    if (domain === 'maps' && fields.description !== undefined) target.description = fields.description
  }
  return toAdminRecord(domain, target)
}

function createPublicSource(domain, fields) {
  const source = publicSources[domain]
  const template = source[0]
  if (!template) return null
  const baseSlug = toSlug(fields.title)
  let slug = baseSlug
  let suffix = 2
  while (source.some((item) => item.slug === slug)) slug = `${baseSlug}-${suffix++}`
  const target = structuredClone(template)
  target.slug = slug
  target.title = fields.title
  target.public = fields.visible === true
  target.updatedAt = new Date().toISOString().slice(0, 10)
  if (domain === 'properties') {
    const numericIds = source.map((item) => Number(item.id)).filter(Number.isFinite)
    target.id = Math.max(0, ...numericIds) + 1
    target.fileOnly = false
    target.createdAt = new Date().toISOString()
    target.category = { ...target.category, name: fields.category || target.category.name, slug: toSlug(fields.category || target.category.name) }
    target.location.city = { ...target.location.city, name: fields.city || target.location.city.name, slug: toSlug(fields.city || target.location.city.name) }
    target.price = String(fields.price ?? 0)
  } else {
    target.cityName = fields.city || target.cityName
    target.city = toSlug(fields.city || target.cityName)
    if (domain === 'files') target.fileType = fields.fileType || target.fileType
  }
  applyPublicFields(domain, target, fields)
  source.push(target)
  return toAdminRecord(domain, target)
}

function updatePublicSource(domain, id, fields) {
  const target = findPublicSource(domain, id)
  return target ? applyPublicFields(domain, target, fields) : null
}

function removePublicSource(domain, id) {
  const source = publicSources[domain]
  const index = source.findIndex((item) => sourceId(domain, item) === String(id) && (domain !== 'properties' || item.fileOnly !== true))
  if (index < 0) return false
  source.splice(index, 1)
  return true
}

function json(request, body, status = 200, extraHeaders = {}) {
  const headers = new Headers({ 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders })
  const origin = request.headers.get('Origin')
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Credentials', 'true')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    headers.append('Vary', 'Origin')
  }
  return Response.json(body, { status, headers })
}

async function readBody(request) {
  const length = Number(request.headers.get('Content-Length') || 0)
  if (length > 12_000) return { error: 'too_large' }
  try {
    const text = await request.text()
    if (new TextEncoder().encode(text).byteLength > 12_000) return { error: 'too_large' }
    const value = JSON.parse(text)
    return value && typeof value === 'object' && !Array.isArray(value) ? { value } : { error: 'invalid_json' }
  } catch {
    return { error: 'invalid_json' }
  }
}

function validateFields(domain, input) {
  const schema = DOMAIN_FIELDS[domain]
  const result = {}
  const errors = {}
  for (const key of Object.keys(input)) {
    if (!Object.hasOwn(schema, key)) {
      errors[key] = 'Field is not editable.'
      continue
    }
    const type = schema[key]
    const value = input[key]
    if (type === 'boolean' && typeof value === 'boolean') result[key] = value
    else if (type === 'number' && typeof value === 'number' && Number.isFinite(value) && value >= 0) result[key] = value
    else if (type === 'integer' && typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) result[key] = value
    else if (type === 'multiSelect' && Array.isArray(value) && value.length <= 100 && value.every((entry) => typeof entry === 'string' && entry.length <= 100) && new Set(value).size === value.length) {
      const availableMaps = new Set(syntheticMaps.map((item) => item.slug))
      if (value.every((mapId) => availableMaps.has(mapId))) result[key] = value
      else errors[key] = 'Choose only available synthetic maps.'
    }
    else if (type === 'json' && Array.isArray(value) && value.length <= 100 && value.every((entry) => typeof entry === 'string' && entry.length <= 100) && new Set(value).size === value.length) result[key] = value
    else if (type === 'slug' && typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) result[key] = value
    else if (['text', 'textarea', 'optionalText'].includes(type) && typeof value === 'string' && (type !== 'text' || value.trim().length > 0) && value.length <= (type === 'textarea' ? 5000 : 300)) result[key] = value.trim()
    else errors[key] = 'Value is invalid.'
  }
  if (['cities', 'categories', 'societies', 'phases'].includes(domain) && !result.name) errors.name ||= 'Name is required.'
  if (!Object.keys(result).length && !Object.keys(errors).length) errors._ = 'Provide at least one editable field.'
  return { result, errors }
}

function taxonomyMapConflict(domain, mapIds, ignoreId) {
  if (!['cities', 'societies', 'phases'].includes(domain) || !Array.isArray(mapIds)) return false
  const assignedElsewhere = new Set((records.get(domain) || [])
    .filter((item) => item.id !== ignoreId)
    .flatMap((item) => item.map_ids || []))
  return mapIds.some((mapId) => assignedElsewhere.has(mapId))
}

export function createMemoryAdminRepository() {
  return {
    list(domain) {
      if (domain === 'calculator-rates') return syntheticCalculatorConfig.calculator_rates.map(calculatorRateRecord)
      if (domain === 'calculator-transfer-fees') return syntheticCalculatorConfig.calculator_transfer_fees.map(calculatorTransferFeeRecord)
      if (domain === 'calculator-fees') return syntheticCalculatorConfig.calculator_fees.map((item) => ({ ...item }))
      if (domain === 'calculator-tax-rates') return syntheticCalculatorConfig.calculator_tax_rates.map((item) => ({ ...item }))
      if (domain === 'calculator-fee-rules') return syntheticCalculatorConfig.calculator_fee_rules.map(calculatorFeeRuleRecord)
      return publicSources[domain] ? publicSourceList(domain) : (records.get(domain) || []).map((item) => ({ ...item }))
    },
    find(domain, id) {
      if (domain === 'calculator-rates') {
        const rate = syntheticCalculatorConfig.calculator_rates.find((item) => item.id === id)
        return rate ? calculatorRateRecord(rate) : null
      }
      if (domain === 'calculator-transfer-fees') {
        const fee = syntheticCalculatorConfig.calculator_transfer_fees.find((item) => item.id === id)
        return fee ? calculatorTransferFeeRecord(fee) : null
      }
      if (domain === 'calculator-fees') return syntheticCalculatorConfig.calculator_fees.find((item) => item.id === id) || null
      if (domain === 'calculator-tax-rates') return syntheticCalculatorConfig.calculator_tax_rates.find((item) => item.id === id) || null
      if (domain === 'calculator-fee-rules') {
        const rule = syntheticCalculatorConfig.calculator_fee_rules.find((item) => item.id === id)
        return rule ? calculatorFeeRuleRecord(rule) : null
      }
      return publicSources[domain] ? (findPublicSource(domain, id) ? toAdminRecord(domain, findPublicSource(domain, id)) : null) : records.get(domain)?.find((item) => item.id === id) || null
    },
    insert(domain, fields) {
      if (domain === 'calculator-rates') {
        const rate = { id: `rate-sample-${nextId++}`, calculator_phase_id: '', calculator_block_id: null, calculator_property_type_id: '', dc_per_marla: 0, dc_per_sqft: 0, fbr_per_marla: 0, fbr_per_sqft: 0, is_active: true }
        syntheticCalculatorConfig.calculator_rates.push(rate)
        return writeCalculatorRate(rate, fields)
      }
      if (domain === 'calculator-transfer-fees') {
        const fee = { id: `transfer-fee-sample-${nextId++}`, calculator_phase_id: '', calculator_block_id: null, category: '', reference_amount: 0, reference_size: 0, reference_unit: 'marla', is_active: true }
        syntheticCalculatorConfig.calculator_transfer_fees.push(fee)
        return writeCalculatorTransferFee(fee, fields)
      }
      if (domain === 'calculator-fees') {
        if (syntheticCalculatorConfig.calculator_fees.some((item) => item.fee_key === fields.fee_key)) return null
        const fee = { id: `fee-sample-${nextId++}`, is_active: true, ...fields }
        syntheticCalculatorConfig.calculator_fees.push(fee)
        return { ...fee }
      }
      if (domain === 'calculator-tax-rates') {
        if (syntheticCalculatorConfig.calculator_tax_rates.some((item) => item.rate_key === fields.rate_key)) return null
        const rate = { id: `tax-sample-${nextId++}`, is_active: true, ...fields }
        syntheticCalculatorConfig.calculator_tax_rates.push(rate)
        return { ...rate }
      }
      if (domain === 'calculator-fee-rules') {
        const rule = { id: `fee-rule-sample-${nextId++}`, max_area: null, is_active: true, ...fields }
        syntheticCalculatorConfig.calculator_fee_rules.push(rule)
        return calculatorFeeRuleRecord(rule)
      }
      if (publicSources[domain]) return createPublicSource(domain, fields)
      const item = {
        id: `${domain.replaceAll('-', '').slice(0, 8)}-sample-${nextId++}`,
        ...(domain === 'cities' || domain === 'societies' || domain === 'phases' ? { map_ids: [] } : {}),
        ...(domain === 'categories' ? { pic: '' } : {}),
        updated_at: new Date().toISOString().slice(0, 10),
        ...fields,
      }
      records.get(domain).push(item)
      return { ...item }
    },
    update(domain, id, fields) {
      if (domain === 'calculator-rates') {
        const rate = syntheticCalculatorConfig.calculator_rates.find((item) => item.id === id)
        return rate ? writeCalculatorRate(rate, fields) : null
      }
      if (domain === 'calculator-transfer-fees') {
        const fee = syntheticCalculatorConfig.calculator_transfer_fees.find((item) => item.id === id)
        return fee ? writeCalculatorTransferFee(fee, fields) : null
      }
      if (domain === 'calculator-fees') {
        const fee = syntheticCalculatorConfig.calculator_fees.find((item) => item.id === id)
        return fee ? writeCalculatorFee(fee, fields) : null
      }
      if (domain === 'calculator-tax-rates') {
        const rate = syntheticCalculatorConfig.calculator_tax_rates.find((item) => item.id === id)
        return rate ? writeCalculatorTaxRate(rate, fields) : null
      }
      if (domain === 'calculator-fee-rules') {
        const rule = syntheticCalculatorConfig.calculator_fee_rules.find((item) => item.id === id)
        return rule ? writeCalculatorFeeRule(rule, fields) : null
      }
      if (publicSources[domain]) return updatePublicSource(domain, id, fields)
      const list = records.get(domain) || []
      const index = list.findIndex((item) => item.id === id)
      if (index < 0) return null
      list[index] = { ...list[index], ...fields, updated_at: new Date().toISOString().slice(0, 10) }
      return { ...list[index] }
    },
    remove(domain, id) {
      if (domain === 'calculator-rates') {
        const index = syntheticCalculatorConfig.calculator_rates.findIndex((item) => item.id === id)
        if (index < 0) return false
        syntheticCalculatorConfig.calculator_rates.splice(index, 1)
        return true
      }
      if (domain === 'calculator-transfer-fees') {
        const index = syntheticCalculatorConfig.calculator_transfer_fees.findIndex((item) => item.id === id)
        if (index < 0) return false
        syntheticCalculatorConfig.calculator_transfer_fees.splice(index, 1)
        return true
      }
      if (domain === 'calculator-fees') return false
      if (domain === 'calculator-tax-rates') return false
      if (domain === 'calculator-fee-rules') {
        const index = syntheticCalculatorConfig.calculator_fee_rules.findIndex((item) => item.id === id)
        if (index < 0) return false
        syntheticCalculatorConfig.calculator_fee_rules.splice(index, 1)
        return true
      }
      if (publicSources[domain]) return removePublicSource(domain, id)
      const list = records.get(domain) || []
      const index = list.findIndex((item) => item.id === id)
      if (index < 0) return false
      list.splice(index, 1)
      return true
    },
  }
}

export function createAdminDataApi(repository, auth) {
  return {
    async collection(request, domain) {
      if (domain === 'users') {
        if (request.method === 'OPTIONS') return auth.options(request)
        const guard = auth.requireAdmin(request)
        if (guard.response) return guard.response
        if (request.method !== 'GET') return json(request, { error: { code: 'read_only_resource' } }, 405)
        return json(request, {
          items: [
            { id: 'staging-admin-1', email: 'admin.one@staging.invalid', name: 'Staging Admin One', role: 'Admin', active: true },
            { id: 'staging-admin-2', email: 'admin.two@staging.invalid', name: 'Staging Admin Two', role: 'Admin', active: true },
          ],
          count: 2,
          readOnly: true,
        })
      }
      if (domain === 'profile') {
        if (request.method === 'OPTIONS') return auth.options(request)
        const guard = auth.requireAdmin(request)
        if (guard.response) return guard.response
        if (request.method !== 'GET') return json(request, { error: { code: 'read_only_resource' } }, 405)
        return json(request, { user: guard.user, readOnly: true })
      }
      if (!Object.hasOwn(DOMAIN_FIELDS, domain)) return json(request, { error: { code: 'unknown_domain' } }, 404)
      if (request.method === 'OPTIONS') return auth.options(request)
      const mutation = request.method !== 'GET' && request.method !== 'OPTIONS'
      const guard = auth.requireAdmin(request, { csrf: mutation })
      if (guard.response) return guard.response
      if (request.method === 'GET') {
        const items = repository.list(domain)
        const calculatorRates = domain === 'calculator-rates'
        const calculatorTransferFees = domain === 'calculator-transfer-fees'
        return json(request, {
          items, count: items.length, fields: DOMAIN_FIELDS[domain],
          ...(calculatorRates ? {
            options: calculatorRateOptions(),
            columns: ['id', 'city_name', 'society_name', 'calculator_phase_name', 'calculator_block_name', 'category', 'property_type_label', 'unit_label', 'dc_rate', 'fbr_rate', 'is_active', 'updated_at'],
          } : {}),
          ...(calculatorTransferFees ? {
            options: calculatorTransferFeeOptions(),
            columns: ['id', 'city_name', 'society_name', 'calculator_phase_name', 'calculator_block_name', 'category', 'reference_amount', 'reference_size', 'reference_unit', 'base_transfer_fee', 'per_marla_rate', 'per_sqft_rate', 'is_active', 'updated_at'],
          } : {}),
          ...(domain === 'calculator-fees' ? {
            options: { charge_unit: [{ value: 'transaction', label: 'Transaction' }, { value: 'property', label: 'Property' }, { value: 'owner', label: 'Owner' }] },
            columns: ['id', 'fee_key', 'fee_name', 'amount', 'charge_unit', 'is_active', 'updated_at'],
          } : {}),
          ...(domain === 'calculator-tax-rates' ? {
            options: { rate_unit: [{ value: 'percent', label: 'Percent (%)' }] },
            columns: ['id', 'rate_key', 'rate_name', 'rate', 'rate_unit', 'is_active', 'updated_at'],
          } : {}),
          ...(domain === 'calculator-fee-rules' ? {
            options: calculatorFeeRuleOptions(),
            columns: ['id', 'fee_name', 'fee_key', 'property_type', 'unit', 'min_area', 'max_area', 'fee_amount', 'is_active', 'updated_at'],
          } : {}),
          ...(['cities', 'societies', 'phases'].includes(domain) ? {
            options: { map_ids: syntheticMaps.map((item) => ({ value: item.slug, label: item.title })) },
            columns: ['id', 'name', 'map_ids', 'updated_at'],
          } : {}),
          ...(domain === 'categories' ? { columns: ['id', 'name', 'pic', 'updated_at'] } : {}),
        })
      }
      if (request.method !== 'POST') return json(request, { error: { code: 'method_not_allowed' } }, 405)
      const body = await readBody(request)
      if (body.error) return json(request, { error: { code: body.error } }, body.error === 'too_large' ? 413 : 400)
      const { result, errors } = domain === 'calculator-rates' ? validateCalculatorRateFields(body.value)
        : domain === 'calculator-transfer-fees' ? validateCalculatorTransferFeeFields(body.value)
          : domain === 'calculator-fees' ? validateCalculatorFeeFields(body.value)
            : domain === 'calculator-tax-rates' ? validateCalculatorTaxRateFields(body.value)
              : domain === 'calculator-fee-rules' ? validateCalculatorFeeRuleFields(body.value) : validateFields(domain, body.value)
      if (!Object.keys(errors).length && taxonomyMapConflict(domain, result.map_ids)) errors.map_ids = 'A map can be associated with only one record in this taxonomy.'
      if (domain === 'calculator-rates' && !Object.keys(errors).length && calculatorRateScopeExists(result)) errors._ = 'A rate already exists for this phase, block, and property type.'
      if (domain === 'calculator-transfer-fees' && !Object.keys(errors).length && calculatorTransferFeeScopeExists(result)) errors._ = 'A transfer fee already exists for this phase, block, and category.'
      if (domain === 'calculator-fees' && !Object.keys(errors).length && syntheticCalculatorConfig.calculator_fees.some((item) => item.fee_key === result.fee_key)) errors.fee_key = 'A calculator fee with this key already exists.'
      if (domain === 'calculator-tax-rates' && !Object.keys(errors).length && syntheticCalculatorConfig.calculator_tax_rates.some((item) => item.rate_key === result.rate_key)) errors.rate_key = 'A tax rate with this key already exists.'
      if (Object.keys(errors).length) return json(request, { error: { code: 'invalid_fields', fields: errors } }, 400)
      return json(request, { item: repository.insert(domain, result) }, 201)
    },

    async item(request, domain, id) {
      if (domain === 'users' || domain === 'profile') {
        const guard = auth.requireAdmin(request, { csrf: request.method !== 'GET' })
        if (guard.response) return guard.response
        return json(request, { error: { code: 'read_only_resource' } }, 405)
      }
      if (!Object.hasOwn(DOMAIN_FIELDS, domain)) return json(request, { error: { code: 'unknown_domain' } }, 404)
      if (request.method === 'OPTIONS') return auth.options(request)
      const mutation = request.method === 'PUT' || request.method === 'PATCH' || request.method === 'DELETE'
      const guard = auth.requireAdmin(request, { csrf: mutation })
      if (guard.response) return guard.response
      if (request.method === 'GET') {
        const item = repository.find(domain, id)
        return item ? json(request, { item }) : json(request, { error: { code: 'not_found' } }, 404)
      }
      if (request.method === 'DELETE') {
        if (['calculator-fees', 'calculator-tax-rates'].includes(domain)) return json(request, { error: { code: 'read_only_action' } }, 405)
        return repository.remove(domain, id) ? json(request, { ok: true }) : json(request, { error: { code: 'not_found' } }, 404)
      }
      if (!['PUT', 'PATCH'].includes(request.method)) return json(request, { error: { code: 'method_not_allowed' } }, 405)
      const body = await readBody(request)
      if (body.error) return json(request, { error: { code: body.error } }, body.error === 'too_large' ? 413 : 400)
      const { result, errors } = domain === 'calculator-rates' ? validateCalculatorRateFields(body.value)
        : domain === 'calculator-transfer-fees' ? validateCalculatorTransferFeeFields(body.value)
          : domain === 'calculator-fees' ? validateCalculatorFeeFields(body.value, { updating: true })
            : domain === 'calculator-tax-rates' ? validateCalculatorTaxRateFields(body.value, { updating: true })
              : domain === 'calculator-fee-rules' ? validateCalculatorFeeRuleFields(body.value, { updating: true }) : validateFields(domain, body.value)
      if (!Object.keys(errors).length && taxonomyMapConflict(domain, result.map_ids, id)) errors.map_ids = 'A map can be associated with only one record in this taxonomy.'
      if (domain === 'calculator-rates' && !Object.keys(errors).length && calculatorRateScopeExists(result, id)) errors._ = 'A rate already exists for this phase, block, and property type.'
      if (domain === 'calculator-transfer-fees' && !Object.keys(errors).length && calculatorTransferFeeScopeExists(result, id)) errors._ = 'A transfer fee already exists for this phase, block, and category.'
      if (Object.keys(errors).length) return json(request, { error: { code: 'invalid_fields', fields: errors } }, 400)
      const item = repository.update(domain, id, result)
      return item ? json(request, { item }) : json(request, { error: { code: 'not_found' } }, 404)
    },
  }
}

export const ADMIN_DOMAINS = Object.freeze(Object.keys(DOMAIN_FIELDS))
export const ADMIN_DOMAIN_FIELDS = DOMAIN_FIELDS
