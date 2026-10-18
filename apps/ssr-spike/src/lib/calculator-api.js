import { syntheticCalculatorConfig } from './calculator-fixtures.js'

export function handleCalculatorConfig(request) {
  if (request.method === 'HEAD') {
    return new Response(null, { headers: { 'Cache-Control': 'no-store' } })
  }
  if (request.method !== 'GET') {
    return Response.json({ error: { code: 'method_not_allowed' } }, {
      status: 405,
      headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' },
    })
  }
  return Response.json(syntheticCalculatorConfig, { headers: { 'Cache-Control': 'no-store' } })
}
