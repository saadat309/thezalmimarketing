import assert from 'node:assert/strict'
import { syntheticCalculatorConfig } from '../src/lib/calculator-fixtures.js'
import { handleCalculatorConfig } from '../src/lib/calculator-api.js'

const state = structuredClone(syntheticCalculatorConfig)
const repository = { async loadConfig() { return structuredClone(state) } }
let response = await handleCalculatorConfig(new Request('https://staging.invalid/api/v1/calculator/config'),repository)
assert.equal(response.status,200)
assert.equal(response.headers.get('cache-control'),'no-store')
let body = await response.json()
assert.equal(body.calculator_phases.length,1)
assert.equal(body.calculator_fee_rules.length,5)
state.calculator_fee_rules[0].is_active = false
state.calculator_fees[0].is_active = false
body = await (await handleCalculatorConfig(new Request('https://staging.invalid/api/v1/calculator/config'),repository)).json()
assert.equal(body.calculator_fee_rules.length,4)
assert.ok(body.calculator_fee_rules.every((rule)=>rule.fee_id !== state.calculator_fees[0].id))
response = await handleCalculatorConfig(new Request('https://staging.invalid/api/v1/calculator/config',{method:'HEAD'}),repository)
assert.equal(response.status,200)
response = await handleCalculatorConfig(new Request('https://staging.invalid/api/v1/calculator/config',{method:'POST'}),repository)
assert.equal(response.status,405)
assert.equal(response.headers.get('allow'),'GET, HEAD')
response = await handleCalculatorConfig(new Request('https://staging.invalid/api/v1/calculator/config'),{loadConfig:async()=>{throw Error('synthetic unavailable')}})
assert.equal(response.status,503)
assert.equal((await response.json()).error.code,'storage_unavailable')
console.log('Calculator API filtering, methods, freshness headers, and storage errors passed.')
