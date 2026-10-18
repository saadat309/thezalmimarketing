import assert from 'node:assert/strict'
import { syntheticCalculatorConfig as config } from '../../ssr-spike/src/lib/calculator-fixtures.js'
import { calculateStagingEstimate } from '../src/data/calculator.js'

const base = {
  phaseId: 'phase-demo', blockId: '', propertyTypeId: 'type-res-plot', propertyName: 'Plot',
  category: 'Residential', size: 5, coveredArea: 0, usesCoveredArea: false,
  transferType: 'Regular', payer: 'Purchaser', owners: 1, taxpayer: 'Filer',
  verification: 'Required', bianaIncluded: 'Included', agreementType: 'Simple',
  stampDutyPayment: 'Online', customDcRate: '', customFbrRate: '',
  overrides: {}, deletedLines: [], customExpenses: [],
}

function estimate(overrides = {}, sourceConfig = config) {
  return calculateStagingEstimate(sourceConfig, { ...base, ...overrides })
}

// Golden values follow the legacy src/routes/calculator.jsx calculation rules,
// using only the repository's explicitly synthetic fixture configuration.
const regular = estimate()
assert.equal(regular.dcValue, 2_125_000)
assert.equal(regular.fbrValue, 2_200_000)
assert.equal(regular.grandTotal, 213_465)
assert.deepEqual(regular.lines.map((line) => line.amount), [4000, 5250, 7000, 31500, 10500, 75000, 2100, 4000, 46615, 27500])

assert.equal(estimate({ payer: 'Seller' }).grandTotal, 60_500)
assert.equal(estimate({ payer: 'Seller', taxpayer: 'Non-Filer' }).grandTotal, 253_000)
assert.equal(estimate({ payer: 'Purchaser', taxpayer: 'Non-Filer' }).grandTotal, 416_965)
assert.equal(estimate({ transferType: 'Hiba', payer: 'Seller' }).grandTotal, 0)
assert.equal(estimate({ transferType: 'Biana Only' }).grandTotal, 4000)
assert.equal(estimate({ transferType: 'Urgent', owners: 2 }).grandTotal, 437_565)
assert.equal(estimate({ transferType: 'Executive' }).grandTotal, 293_465)
assert.equal(estimate({ agreementType: 'DC Value', stampDutyPayment: 'Bank' }).grandTotal, 215_575)

const hibaPurchaser = estimate({ transferType: 'Hiba' })
assert.deepEqual(hibaPurchaser.lines.map((line) => line.label), [
  'Transfer File (1 owner)', 'Membership Fee (1 owner)', 'Membership Form (1 owner)', 'Stamp Duty (Online)',
])
assert.equal(hibaPurchaser.grandTotal, 130_715)

// Source membership thresholds include <=10, open (10,40), and >=40 Marla.
assert.equal(estimate({ size: 10 }).lines.find((line) => line.label.startsWith('Membership Fee')).amount, 75_000)
assert.equal(estimate({ size: 10.01 }).lines.find((line) => line.label.startsWith('Membership Fee')).amount, 150_000)
assert.equal(estimate({ size: 40 }).lines.find((line) => line.label.startsWith('Membership Fee')).amount, 200_000)

// The legacy uses its size tiers only when no fee rules are configured.
const noRules = structuredClone(config)
noRules.calculator_fee_rules = []
assert.equal(estimate({ size: 5 }, noRules).lines.find((line) => line.label.startsWith('Membership Fee')).amount, 75_000)
assert.equal(estimate({ size: 10 }, noRules).lines.find((line) => line.label.startsWith('Membership Fee')).amount, 75_000)
assert.equal(estimate({ size: 10.01 }, noRules).lines.find((line) => line.label.startsWith('Membership Fee')).amount, 150_000)
assert.equal(estimate({ size: 40 }, noRules).lines.find((line) => line.label.startsWith('Membership Fee')).amount, 200_000)
assert.equal(estimate({ category: 'Commercial', size: 4 }, noRules).lines.find((line) => line.label.startsWith('Membership Fee')).amount, 150_000)
assert.equal(estimate({ category: 'Commercial', size: 4.01 }, noRules).lines.find((line) => line.label.startsWith('Membership Fee')).amount, 200_000)

// With rules present but no range matching, the legacy uses a flat category fallback.
const gappedResidentialRules = structuredClone(config)
gappedResidentialRules.calculator_fee_rules = [{ property_type: 'Residential', unit: 'marla', min_area: 0, max_area: 2, fee_amount: 60_000, is_active: true }]
assert.equal(estimate({ size: 5 }, gappedResidentialRules).lines.find((line) => line.label.startsWith('Membership Fee')).amount, 150_000)
const gappedCommercialRules = structuredClone(config)
gappedCommercialRules.calculator_fee_rules = [{ property_type: 'Commercial', unit: 'marla', min_area: 0, max_area: 2, fee_amount: 60_000, is_active: true }]
assert.equal(estimate({ category: 'Commercial', size: 5 }, gappedCommercialRules).lines.find((line) => line.label.startsWith('Membership Fee')).amount, 200_000)

// The legacy's missing-reference fallback treats only the Commercial category
// or a Shop property type as commercial; other category names use residential rates.
const noTransferRefs = structuredClone(config)
noTransferRefs.calculator_transfer_fees = []
assert.equal(estimate({ category: 'Other', size: 1 }, noTransferRefs).lines.find((line) => line.label === 'Base Transfer Fee').amount, 10_500)
assert.equal(estimate({ category: 'Other', propertyName: 'Shop', size: 1 }, noTransferRefs).lines.find((line) => line.label === 'Base Transfer Fee').amount, 105_000)

// Covered-area lookup and zero-valued explicit overrides retain source semantics.
const house = estimate({ blockId: 'block-demo-a', propertyTypeId: 'type-res-house', propertyName: 'House', usesCoveredArea: true, coveredArea: 1000 })
assert.equal(house.dcValue, 2_200_000)
assert.equal(house.fbrValue, 2_500_000)
const blockPreferred = structuredClone(config)
blockPreferred.calculator_rates.push({ ...config.calculator_rates[0], id: 'rate-block-plot', calculator_block_id: 'block-demo-a', dc_per_marla: 500_000, fbr_per_marla: 600_000 })
assert.equal(estimate({ blockId: 'block-demo-a' }, blockPreferred).dcValue, 2_500_000)
assert.equal(estimate({ blockId: 'block-demo-a' }, blockPreferred).fbrValue, 3_000_000)
assert.equal(estimate({ blockId: 'block-demo-b' }).dcValue, regular.dcValue, 'missing block rate falls back to the phase rate')

// Sq. Ft. transfer references use covered area for covered-area property types,
// but retain the source marla conversion for the same reference otherwise.
const sqftTransfer = structuredClone(config)
const residentialTransfer = sqftTransfer.calculator_transfer_fees.find((item) => item.category === 'Residential')
residentialTransfer.reference_unit = 'sqft'
residentialTransfer.reference_size = 1125
assert.equal(estimate({ propertyName: 'House', usesCoveredArea: true, coveredArea: 1000 }, sqftTransfer).lines.find((line) => line.label === 'Base Transfer Fee').amount, 28_000)
assert.equal(estimate({}, sqftTransfer).lines.find((line) => line.label === 'Base Transfer Fee').amount, 31_500)

const kanalRule = structuredClone(config)
kanalRule.calculator_fee_rules = [{ property_type: 'Residential', unit: 'kanal', min_area: 0, max_area: 2, fee_amount: 99_000, is_active: true }]
assert.equal(estimate({ size: 20 }, kanalRule).lines.find((line) => line.label.startsWith('Membership Fee')).amount, 99_000)

const plotRate = config.calculator_rates.find((item) => item.id === 'rate-demo-plot')
plotRate.is_active = false
assert.equal(estimate().rateFound, false)
plotRate.is_active = true
const transferFee = config.calculator_transfer_fees.find((item) => item.id === 'transfer-demo-residential')
transferFee.is_active = false
assert.equal(estimate().lines.find((line) => line.label === 'Base Transfer Fee').amount, 52_500)
transferFee.is_active = true
const bianaFee = config.calculator_fees.find((item) => item.fee_key === 'biana')
bianaFee.amount = 4100
assert.equal(estimate({ transferType: 'Biana Only' }).grandTotal, 4100)
bianaFee.is_active = false
assert.equal(estimate({ transferType: 'Biana Only' }).grandTotal, 4000)
bianaFee.is_active = true
bianaFee.amount = 4000
const sellerTaxRate = config.calculator_tax_rates.find((item) => item.rate_key === 'seller_236c_filer')
sellerTaxRate.rate = 3.5
assert.equal(estimate({ payer: 'Seller' }).grandTotal, 77_000)
sellerTaxRate.is_active = false
assert.equal(estimate({ payer: 'Seller' }).grandTotal, 60_500)
sellerTaxRate.is_active = true
sellerTaxRate.rate = 2.75
const residentialFeeRule = config.calculator_fee_rules.find((item) => item.property_type === 'Residential' && item.min_area === 0 && item.max_area === 10)
residentialFeeRule.fee_amount = 82000
assert.equal(estimate().lines.find((line) => line.label.startsWith('Membership Fee')).amount, 82000)
residentialFeeRule.is_active = false
assert.equal(estimate().lines.find((line) => line.label.startsWith('Membership Fee')).amount, 150000)
residentialFeeRule.is_active = true
residentialFeeRule.fee_amount = 75000
assert.equal(estimate({ customDcRate: '0' }).dcValue, 0)
const edited = estimate({ overrides: { Biana: '0' }, customExpenses: [{ id: 'synthetic-extra', label: 'Sample fee', amount: 123 }] })
assert.equal(edited.lines[0].amount, 0)
assert.equal(edited.grandTotal, regular.grandTotal - 4000 + 123)
assert.equal(estimate({ transferType: 'Biana Only', overrides: { Biana: '0' }, customExpenses: [{ label: 'Ignored source early return', amount: 99 }] }).grandTotal, 4000)
assert.equal(estimate({ payer: 'Seller', overrides: { 'Seller Tax 236C (Filer @ 2.75%)': '0' } }).grandTotal, 60_500)

console.log('Synthetic calculator formula parity checks passed.')
