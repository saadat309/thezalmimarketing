import { prepareCalculatorCsvImport, readBoundedCsvForm, calculatorCsvTemplate } from './calculator-import.js'

const DOMAINS = new Set(['calculator-phases','calculator-blocks','calculator-property-types','calculator-rates','calculator-transfer-fees','calculator-fees','calculator-tax-rates','calculator-fee-rules'])
const TABLE = (domain) => domain.replaceAll('-', '_')
const FIELDS = {
  'calculator-phases': { city_id:'select',society_id:'select',name:'text',sort_order:'integer',is_active:'boolean' },
  'calculator-blocks': { calculator_phase_id:'select',name:'text',sort_order:'integer',is_active:'boolean' },
  'calculator-property-types': { category:'text',property_type:'text',label:'text',sort_order:'integer',is_active:'boolean' },
  'calculator-rates': { calculator_phase_id:'select',calculator_block_id:'optionalSelect',calculator_property_type_id:'select',unit:'select',dc_rate:'number',fbr_rate:'number',is_active:'boolean' },
  'calculator-transfer-fees': { calculator_phase_id:'select',calculator_block_id:'optionalSelect',category:'select',reference_amount:'number',reference_size:'number',reference_unit:'select',is_active:'boolean' },
  'calculator-fees': { fee_key:'text',fee_name:'text',amount:'number',charge_unit:'select',is_active:'boolean' },
  'calculator-tax-rates': { rate_key:'text',rate_name:'text',rate:'number',rate_unit:'select',is_active:'boolean' },
  'calculator-fee-rules': { fee_id:'select',property_type:'select',unit:'select',min_area:'number',max_area:'optionalNumber',fee_amount:'number',is_active:'boolean' },
}
const json = (request, body, status = 200, extra = {}) => {
  const headers = new Headers({ 'Cache-Control': 'no-store', ...extra })
  const origin = request.headers.get('Origin')
  if (origin) { headers.set('Access-Control-Allow-Origin', origin); headers.set('Access-Control-Allow-Credentials', 'true'); headers.append('Vary', 'Origin') }
  return Response.json(body, { status, headers })
}
async function readJsonBody(request) {
  const stated = Number(request.headers.get('Content-Length') || 0)
  if (stated > 12_000) return { error: 'too_large' }
  try {
    const text = await request.text()
    if (new TextEncoder().encode(text).byteLength > 12_000) return { error: 'too_large' }
    const value = JSON.parse(text)
    return value && typeof value === 'object' && !Array.isArray(value) ? { value } : { error: 'invalid_json' }
  } catch { return { error: 'invalid_json' } }
}
const numeric = (x, min = 0) => typeof x === 'number' && Number.isFinite(x) && x >= min
const bool = (x) => typeof x === 'boolean'
const decimalFits = (value, precision, scale) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return false
  const text = String(value)
  if (!/^\d+(?:\.\d+)?$/.test(text)) return false
  const [whole, fraction = ''] = text.split('.')
  return whole.replace(/^0+/, '').length <= precision - scale && fraction.length <= scale
}

function duplicate(domain, input, config, ignoreId = null) {
  const same = (a,b) => String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase()
  if (domain === 'calculator-phases') return config.calculator_phases.some((x)=>x.id!==ignoreId && x.city_id===input.city_id && x.society_id===input.society_id && same(x.name,input.name))
  if (domain === 'calculator-blocks') return config.calculator_blocks.some((x)=>x.id!==ignoreId && x.calculator_phase_id===input.calculator_phase_id && same(x.name,input.name))
  if (domain === 'calculator-fees') return config.calculator_fees.some((x)=>x.id!==ignoreId && same(x.fee_key,input.fee_key))
  if (domain === 'calculator-tax-rates') return config.calculator_tax_rates.some((x)=>x.id!==ignoreId && same(x.rate_key,input.rate_key))
  if (domain === 'calculator-rates') return config.calculator_rates.some((x)=>x.id!==ignoreId && x.calculator_phase_id===input.calculator_phase_id && (x.calculator_block_id||'')===(input.calculator_block_id||'') && x.calculator_property_type_id===input.calculator_property_type_id)
  if (domain === 'calculator-transfer-fees') return config.calculator_transfer_fees.some((x)=>x.id!==ignoreId && x.calculator_phase_id===input.calculator_phase_id && (x.calculator_block_id||'')===(input.calculator_block_id||'') && same(x.category,input.category))
  return false
}

function validate(domain, input, config, current = null) {
  const errors = {}, result = {}
  const allow = {
    'calculator-phases': ['city_id','society_id','name','sort_order','is_active'],
    'calculator-blocks': ['calculator_phase_id','name','sort_order','is_active'],
    'calculator-property-types': ['label','sort_order','is_active'],
    'calculator-rates': ['calculator_phase_id','calculator_block_id','calculator_property_type_id','unit','dc_rate','fbr_rate','is_active'],
    'calculator-transfer-fees': ['calculator_phase_id','calculator_block_id','category','reference_amount','reference_size','reference_unit','is_active'],
    'calculator-fees': current ? ['fee_name','amount','is_active'] : ['fee_key','fee_name','amount','charge_unit','is_active'],
    'calculator-tax-rates': current ? ['rate_name','rate','is_active'] : ['rate_key','rate_name','rate','rate_unit','is_active'],
    'calculator-fee-rules': ['fee_id','property_type','unit','min_area','max_area','fee_amount','is_active'],
  }[domain]
  const required = {
    'calculator-phases': ['city_id','society_id','name'], 'calculator-blocks': ['calculator_phase_id','name'],
    'calculator-property-types': [], 'calculator-rates': ['calculator_phase_id','calculator_property_type_id','unit','dc_rate','fbr_rate'],
    'calculator-transfer-fees': ['calculator_phase_id','category','reference_amount','reference_size','reference_unit'],
    'calculator-fees': current ? [] : ['fee_key','fee_name','amount','charge_unit'],
    'calculator-tax-rates': current ? [] : ['rate_key','rate_name','rate','rate_unit'], 'calculator-fee-rules': ['fee_id','property_type','unit','min_area','fee_amount'],
  }[domain]
  for (const [key, value] of Object.entries(input || {})) {
    if (!allow.includes(key)) { errors[key] = 'Field is not editable.'; continue }
    let valid = false
    if (['fee_key','rate_key'].includes(key)) valid = typeof value === 'string' && /^[a-z][a-z0-9_]{0,79}$/.test(value.trim())
    else if (['name','label','fee_name','rate_name','category'].includes(key)) valid = typeof value === 'string' && value.trim().length > 0 && value.trim().length <= (key === 'category' ? 50 : key === 'label' ? 120 : 150)
    else if (key.endsWith('_id')) {
      const list = key === 'city_id' ? config.cities : key === 'society_id' ? config.societies : key === 'fee_id' ? config.calculator_fees
        : key === 'calculator_phase_id' ? config.calculator_phases : key === 'calculator_block_id' ? config.calculator_blocks
          : key === 'calculator_property_type_id' ? config.calculator_property_types : []
      valid = (value === '' && key === 'calculator_block_id') || (typeof value === 'string' && value !== '' && list.some((x) => x.id === value))
    }
    else if (['sort_order'].includes(key)) valid = Number.isInteger(value) && value >= 0
    else if (['is_active'].includes(key)) valid = bool(value)
    else if (key === 'unit') valid = domain === 'calculator-fee-rules' ? ['marla','kanal'].includes(value) : domain === 'calculator-rates' ? ['marla','sqft'].includes(value) : false
    else if (key === 'reference_unit') valid = ['marla','sqft'].includes(value)
    else if (key === 'property_type') valid = ['Residential','Commercial'].includes(value)
    else if (key === 'charge_unit') valid = ['transaction','property','owner'].includes(value)
    else if (key === 'rate_unit') valid = value === 'percent'
    else if (['dc_rate','fbr_rate'].includes(key)) valid = numeric(value) && decimalFits(value,18,input.unit === 'sqft' ? 4 : 2)
    else if (key === 'amount' || key === 'reference_amount') valid = decimalFits(value,18,2) && (key !== 'reference_amount' || value > 10500)
    else if (key === 'reference_size') valid = decimalFits(value,18,4) && value > 0
    else if (key === 'rate') valid = decimalFits(value,8,4) && value <= 9999.9999
    else if (key === 'min_area' || key === 'max_area') valid = value === null && key === 'max_area' || decimalFits(value,10,2)
    else if (key === 'fee_amount') valid = decimalFits(value,12,2)
    if (key === 'category' && domain === 'calculator-transfer-fees') valid = config.calculator_property_types.some((item)=>item.category===value)
    if (!valid) errors[key] = 'Value is invalid.'
    else result[key] = typeof value === 'string' && ['name','label','fee_name','rate_name','fee_key','rate_key','category'].includes(key) ? value.trim() : value
  }
  for (const key of required) if (!(key in result)) errors[key] ||= 'This field is required or invalid.'
  if (domain === 'calculator-rates') result.unit = result.unit || current?.unit || 'marla'
  if (domain === 'calculator-fee-rules') {
    result.min_area ??= current?.min_area ?? 0
    result.max_area = result.max_area === undefined ? current?.max_area ?? null : result.max_area
    if (result.max_area != null && result.min_area != null && result.max_area <= result.min_area) errors.max_area = 'Maximum area must exceed minimum area.'
  }
  if (domain === 'calculator-blocks' && result.calculator_phase_id && config.calculator_phases.every((x) => x.id !== result.calculator_phase_id)) errors.calculator_phase_id = 'Choose a valid phase.'
  if (['calculator-rates','calculator-transfer-fees'].includes(domain) && result.calculator_block_id && config.calculator_blocks.find((x) => x.id === result.calculator_block_id)?.calculator_phase_id !== result.calculator_phase_id) errors.calculator_block_id = 'Block must belong to the selected phase.'
  if (Object.keys(errors).length) return { errors }
  if (domain === 'calculator-rates') {
    result.dc_per_marla = result.unit === 'marla' ? result.dc_rate : null; result.dc_per_sqft = result.unit === 'sqft' ? result.dc_rate : null
    result.fbr_per_marla = result.unit === 'marla' ? result.fbr_rate : null; result.fbr_per_sqft = result.unit === 'sqft' ? result.fbr_rate : null
    for (const k of ['unit','dc_rate','fbr_rate']) delete result[k]
  }
  if (current) { for (const key of ['fee_key','charge_unit','rate_key','rate_unit']) delete result[key] }
  return { result }
}

export function createCalculatorAdminApi(auth, repository) {
  return async (request, domain, id = null) => {
    if (!DOMAINS.has(domain)) return null
    if (request.method === 'OPTIONS') return auth.options(request)
    const mutation = !['GET','OPTIONS'].includes(request.method)
    const guard = await auth.requireAdmin(request, { csrf: mutation })
    if (guard.response) return guard.response
    if (id === 'template') return request.method === 'GET' ? calculatorCsvTemplate(domain, request) : json(request, { error: { code: 'method_not_allowed' } }, 405)
    const config = await repository.loadConfig()
    if (!id) {
      if (request.method === 'GET') {
        const items = await repository.list(domain)
        const phases = config.calculator_phases.map((phase) => ({ value:phase.id,label:`${config.cities.find((c)=>c.id===phase.city_id)?.name || ''} > ${config.societies.find((s)=>s.id===phase.society_id)?.name || ''} > ${phase.name}` }))
        const phaseIds = config.calculator_phases.map((phase) => phase.id)
        const phaseBlocks = config.calculator_blocks.map((block) => ({ value:block.id,label:block.name,phaseId:block.calculator_phase_id }))
        const categories = [...new Set(config.calculator_property_types.map((x)=>x.category))].map((value)=>({value,label:value}))
        const types = config.calculator_property_types.map((x)=>({value:x.id,label:`${x.category} - ${x.label}`}))
        const options = {
          'calculator-phases': { city_id:config.cities.map((x)=>({value:x.id,label:x.name})),society_id:config.societies.map((x)=>({value:x.id,label:x.name})) },
          'calculator-blocks': { calculator_phase_id:phases },
          'calculator-property-types': {},
          'calculator-rates': { calculator_phase_id:phases,calculator_block_id:phaseBlocks,calculator_property_type_id:types,unit:[{value:'marla',label:'Per Marla'},{value:'sqft',label:'Per Sq. Ft.'}] },
          'calculator-transfer-fees': { calculator_phase_id:phases,calculator_block_id:phaseBlocks,category:categories,reference_unit:[{value:'marla',label:'Marla'},{value:'sqft',label:'Sq. Ft.'}] },
          'calculator-fees': { charge_unit:['transaction','property','owner'].map((value)=>({value,label:value})) },
          'calculator-tax-rates': { rate_unit:[{value:'percent',label:'Percent (%)'}] },
          'calculator-fee-rules': { fee_id:config.calculator_fees.map((x)=>({value:x.id,label:`${x.fee_name} (${x.fee_key})`})),property_type:['Residential','Commercial'].map((value)=>({value,label:value})),unit:['marla','kanal'].map((value)=>({value,label:value})) },
        }[domain]
        const columns = Object.keys(items[0] || FIELDS[domain]).filter((key) => !['dc_per_marla','dc_per_sqft','fbr_per_marla','fbr_per_sqft'].includes(key))
        return json(request, { items, count: items.length, fields: FIELDS[domain], options, columns, readOnly: domain === 'calculator-property-types' })
      }
      if (request.method !== 'POST' || domain === 'calculator-property-types') return json(request, { error: { code: 'read_only_action' } }, 405)
      const parsedBody = await readJsonBody(request)
      if (parsedBody.error) return json(request,{error:{code:parsedBody.error}},parsedBody.error==='too_large'?413:400)
      const body = parsedBody.value
      const { result, errors } = validate(domain, body?.value ?? body, config)
      if (errors) return json(request, { error: { code: 'invalid_fields', fields: errors } }, 400)
      if (duplicate(domain,result,config)) return json(request,{error:{code:'invalid_fields',fields:{_:domain==='calculator-rates'?'A rate already exists for this phase, block, and property type.':domain==='calculator-transfer-fees'?'A transfer fee already exists for this phase, block, and category.':'A record with this key or name already exists.'}}},400)
      try { const item = await repository.insert(domain, result); return item ? json(request, { item }, 201) : json(request, { error: { code: 'write_failed' } }, 500) }
      catch { return json(request, { error: { code: 'write_failed' } }, 409) }
    }
    if (id === 'import' && ['calculator-rates','calculator-transfer-fees'].includes(domain)) {
      if (request.method !== 'POST') return json(request,{error:{code:'method_not_allowed'}},405)
      const form = await readBoundedCsvForm(request)
      if (form.error) return json(request,{error:{code:form.error}},form.error === 'too_large' ? 413 : 400)
      const prepared = prepareCalculatorCsvImport(domain,form.content,config)
      if (prepared.error) return json(request,{error:{code:prepared.error}},400)
      if (form.validateOnly) return json(request,prepared.summary)
      if (!prepared.validRows.length) return json(request,{error:{code:'no_valid_rows'}},400)
      try {
        const counts = await repository.applyImport(domain,prepared.validRows,config)
        const message = domain === 'calculator-rates'
          ? `Import completed successfully. Inserted Rates: ${counts.inserted}, Updated Rates: ${counts.updated} (Auto-created: ${counts.created_phases} phases, ${counts.created_blocks} blocks).`
          : `Import completed successfully. Inserted: ${counts.inserted}, Updated: ${counts.updated}.`
        return json(request,{success:true,message,total_rows:prepared.summary.total_rows,...counts})
      } catch { return json(request,{error:{code:'import_failed'}},409) }
    }
    if (request.method === 'GET') { const item = (await repository.list(domain)).find((x) => x.id === id); return item ? json(request, { item }) : json(request, { error: { code: 'not_found' } }, 404) }
    if (request.method === 'DELETE') {
      if (['calculator-property-types','calculator-fees','calculator-tax-rates'].includes(domain)) return json(request, { error: { code: 'read_only_action' } }, 405)
      try { return await repository.remove(domain,id) ? json(request,{ok:true}) : json(request,{error:{code:'not_found'}},404) }
      catch { return json(request,{error:{code:'in_use'}},409) }
    }
    if (!['PUT','PATCH'].includes(request.method)) return json(request, { error: { code: 'method_not_allowed' } }, 405)
    const current = domain === 'calculator-rates' || domain === 'calculator-transfer-fees'
      ? (await repository.list(domain)).find((x)=>x.id===id)
      : await repository.find(domain,id)
    if (!current) return json(request,{error:{code:'not_found'}},404)
    const parsedBody = await readJsonBody(request)
    if (parsedBody.error) return json(request,{error:{code:parsedBody.error}},parsedBody.error==='too_large'?413:400)
    const body = parsedBody.value
    const { result, errors } = validate(domain, body?.value ?? body, config, current)
    if (errors) return json(request,{error:{code:'invalid_fields',fields:errors}},400)
    if (duplicate(domain,{...current,...result},config,id)) return json(request,{error:{code:'invalid_fields',fields:{_:domain==='calculator-rates'?'A rate already exists for this phase, block, and property type.':domain==='calculator-transfer-fees'?'A transfer fee already exists for this phase, block, and category.':'A record with this key or name already exists.'}}},400)
    if (domain === 'calculator-rates' && current.unit) {
      // Preserve legacy unit-column semantics when editing the selected display rate.
      result.dc_per_marla = current.unit === 'marla' ? result.dc_per_marla : null
    }
    try { const item = await repository.update(domain,id,result); return item ? json(request,{item}) : json(request,{error:{code:'not_found'}},404) }
    catch { return json(request,{error:{code:'write_failed'}},409) }
  }
}
