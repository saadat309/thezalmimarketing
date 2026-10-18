import { syntheticCalculatorConfig } from './calculator-fixtures.js'

export async function handleCalculatorConfig(request, repository) {
  if (request.method === 'HEAD') {
    return new Response(null, { headers: { 'Cache-Control': 'no-store' } })
  }
  if (request.method !== 'GET') {
    return Response.json({ error: { code: 'method_not_allowed' } }, {
      status: 405,
      headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' },
    })
  }
  try {
    repository ||= { loadConfig: async () => structuredClone(syntheticCalculatorConfig) }
    const config = await repository.loadConfig()
    config.calculator_phases = config.calculator_phases.filter((item) => item.is_active)
    config.calculator_blocks = config.calculator_blocks.filter((item) => item.is_active)
    config.calculator_property_types = config.calculator_property_types.filter((item) => item.is_active)
    config.calculator_rates = config.calculator_rates.filter((item) => item.is_active)
    config.calculator_transfer_fees = config.calculator_transfer_fees.filter((item) => item.is_active)
    config.calculator_fees = config.calculator_fees.filter((item) => item.is_active)
    config.calculator_tax_rates = config.calculator_tax_rates.filter((item) => item.is_active)
    config.calculator_fee_rules = config.calculator_fee_rules.filter((item) => item.is_active)
    return Response.json(config, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: { code: 'storage_unavailable' } }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
