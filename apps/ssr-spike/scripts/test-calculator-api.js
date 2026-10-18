import assert from 'node:assert/strict'
import { syntheticCalculatorConfig } from '../src/lib/calculator-fixtures.js'
import { handleCalculatorConfig } from '../src/lib/calculator-api.js'

assert.ok(syntheticCalculatorConfig.cities.every((item) => item.id.startsWith('city-')))
assert.ok(syntheticCalculatorConfig.calculator_phases.every((item) => item.id.startsWith('phase-')))
assert.ok(syntheticCalculatorConfig.calculator_rates.every((item) => Number.isFinite(Number(item.dc_per_marla))))
assert.ok(syntheticCalculatorConfig.calculator_fees.every((item) => Number.isFinite(Number(item.amount))))
assert.ok(syntheticCalculatorConfig.calculator_tax_rates.every((item) => Number.isFinite(Number(item.rate))))
assert.ok(JSON.stringify(syntheticCalculatorConfig).includes('Synthetic'))
assert.equal(Object.hasOwn(syntheticCalculatorConfig, 'production'), false)
let response = handleCalculatorConfig(new Request('https://staging.invalid/api/v1/calculator/config'))
assert.equal(response.status, 200)
assert.equal(response.headers.get('cache-control'), 'no-store')
let body = await response.json()
assert.equal(body.calculator_phases.length, 1)
response = handleCalculatorConfig(new Request('https://staging.invalid/api/v1/calculator/config', { method: 'HEAD' }))
assert.equal(response.status, 200)
response = handleCalculatorConfig(new Request('https://staging.invalid/api/v1/calculator/config', { method: 'POST' }))
assert.equal(response.status, 405)
assert.equal(response.headers.get('allow'), 'GET, HEAD')

console.log('Synthetic calculator config checks passed.')
