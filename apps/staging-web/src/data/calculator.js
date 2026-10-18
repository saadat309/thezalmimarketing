const money = (value) => `Rs. ${Math.round(Number(value) || 0).toLocaleString('en-PK')}`
const getFee = (config, key, fallback) => Number(config.calculator_fees.find((item) => item.fee_key === key && item.is_active !== false && item.is_active !== 0)?.amount ?? fallback)
const getTax = (config, key, fallback) => Number(config.calculator_tax_rates.find((item) => item.rate_key === key && item.is_active !== false && item.is_active !== 0)?.rate ?? fallback)

// Pure staging calculation; kept separate so synthetic examples can be compared
// against the legacy calculation rules without mounting the React route.
export function calculateStagingEstimate(config, input) {
  const { phaseId, blockId, propertyTypeId, propertyName, category, size, coveredArea, usesCoveredArea, transferType, payer, owners, taxpayer, verification, bianaIncluded, agreementType, stampDutyPayment, customDcRate, customFbrRate, overrides = {}, deletedLines = [], customExpenses = [] } = input
  const rates = config.calculator_rates
  const isActiveRate = (item) => item.is_active !== false && item.is_active !== 0
  const rate = (blockId && rates.find((item) => isActiveRate(item) && String(item.calculator_phase_id) === phaseId && String(item.calculator_block_id || '') === blockId && String(item.calculator_property_type_id) === propertyTypeId)) || rates.find((item) => isActiveRate(item) && String(item.calculator_phase_id) === phaseId && !item.calculator_block_id && String(item.calculator_property_type_id) === propertyTypeId)
  let dcMarla = Number(rate?.dc_per_marla || 0)
  let dcSqft = Number(rate?.dc_per_sqft || 0)
  let fbrMarla = Number(rate?.fbr_per_marla || 0)
  let fbrSqft = Number(rate?.fbr_per_sqft || 0)
  const customDc = customDcRate !== '' && customDcRate != null && Number.isFinite(Number(customDcRate)) ? Number(customDcRate) : null
  const customFbr = customFbrRate !== '' && customFbrRate != null && Number.isFinite(Number(customFbrRate)) ? Number(customFbrRate) : null
  if (customDc !== null) usesCoveredArea ? dcSqft = customDc : dcMarla = customDc
  if (customFbr !== null) usesCoveredArea ? fbrSqft = customFbr : fbrMarla = customFbr
  const dcValue = usesCoveredArea && coveredArea > 0 ? coveredArea * (dcSqft || dcMarla / 225) : size * (dcMarla || dcSqft * 225)
  const fbrValue = usesCoveredArea && coveredArea > 0 ? coveredArea * (fbrSqft || fbrMarla / 225) : size * (fbrMarla || fbrSqft * 225)
  const fee = (key, fallback) => getFee(config, key, fallback)
  const tax = (key, fallback) => getTax(config, key, fallback)
  const sellerTaxRate = tax(taxpayer === 'Filer' ? 'seller_236c_filer' : 'seller_236c_non_filer', taxpayer === 'Filer' ? 2.75 : 11.5)
  const buyerTaxRate = tax(taxpayer === 'Filer' ? 'purchaser_236k_filer' : 'purchaser_236k_non_filer', taxpayer === 'Filer' ? 1.25 : 10.5)
  const activeRate = Boolean(rate || customDc !== null || customFbr !== null)
  const result = { dcValue, fbrValue, rateFound: activeRate, lines: [], grandTotal: 0 }
  const add = (label, amount, explanation, locked = false) => result.lines.push({ id: label, label, amount, explanation, locked })
  if (transferType === 'Biana Only') {
    add('Biana', fee('biana', 4000), 'Fixed Biana amount configured by administration.', true)
    result.grandTotal = result.lines[0].amount
    return result
  }
  else if (transferType === 'Hiba' && payer === 'Seller') return result
  else if (payer === 'Seller') {
    add(`Seller Tax 236C (${taxpayer} @ ${sellerTaxRate}%)`, fbrValue * sellerTaxRate / 100, `Calculated as FBR Value (${money(fbrValue)}) × ${sellerTaxRate}% (Section 236C seller tax).`, true)
    result.grandTotal = result.lines[0].amount
    return result
  }
  else {
    const count = Math.max(1, owners)
    const isHiba = transferType === 'Hiba'
    const isPlotOrFile = ['Plot', 'File'].includes(propertyName)
    const sportsFund = fee('sports_fund', 10500)
    const isActiveTransferFee = (item) => item.is_active !== false && item.is_active !== 0
    const transferRef = (blockId && config.calculator_transfer_fees.find((item) => isActiveTransferFee(item) && String(item.calculator_phase_id) === phaseId && String(item.calculator_block_id || '') === blockId && item.category.toLowerCase() === category.toLowerCase())) || config.calculator_transfer_fees.find((item) => isActiveTransferFee(item) && String(item.calculator_phase_id) === phaseId && !item.calculator_block_id && item.category.toLowerCase() === category.toLowerCase())
    let baseTransfer
    let transferExplanation
    if (transferRef) {
      const refSize = Number(transferRef.reference_size || 0)
      const refAmount = Number(transferRef.reference_amount || 0)
      const refMarla = transferRef.reference_unit === 'sqft' ? refSize / 225 : refSize
      const refSqft = transferRef.reference_unit === 'sqft' ? refSize : refSize * 225
      const baseFee = Math.max(0, refAmount - sportsFund)
      baseTransfer = transferRef.reference_unit === 'sqft' && usesCoveredArea && coveredArea ? coveredArea * baseFee / refSqft : size * baseFee / refMarla
      transferExplanation = 'Calculated from the synthetic location/category reference fee.'
    } else {
      const commercial = category.toLowerCase() !== 'residential' || propertyName.toLowerCase().includes('shop')
      baseTransfer = usesCoveredArea && coveredArea ? coveredArea * (commercial ? 467 : 47) : size * (commercial ? 105000 : 10500)
      transferExplanation = 'Calculated using the source calculator fallback rate because no sample transfer reference matched.'
    }
    let membership = category.toLowerCase() === 'residential' ? (size <= 10 ? 75000 : size < 40 ? 150000 : 200000) : (size <= 4 ? 150000 : 200000)
    const rule = config.calculator_fee_rules.find((item) => {
      if (item.property_type.toLowerCase() !== (category.toLowerCase() === 'residential' ? 'residential' : 'commercial') || item.is_active === false || item.is_active === 0) return false
      const minimum = Number(item.min_area || 0)
      const maximum = item.max_area == null ? null : Number(item.max_area)
      const area = (item.unit || 'marla').toLowerCase() === 'kanal' ? size / 20 : size
      if (maximum !== null) return minimum === 0 ? area <= maximum : area > minimum && area < maximum
      return item.property_type.toLowerCase() === 'residential' ? area >= minimum : area > minimum
    })
    if (rule) membership = Number(rule.fee_amount)
    if (!isHiba && bianaIncluded === 'Included') add('Biana', fee('biana', 4000), 'Initial token/earnest money (Biana).')
    if (!isHiba && verification === 'Required') add('Verification Charges', fee('verification', 5250), 'Property and ownership verification charges.')
    add(`Transfer File (${count} owner${count > 1 ? 's' : ''})`, fee(isPlotOrFile ? 'transfer_file_plot_file' : 'transfer_file_other', isPlotOrFile ? 7000 : 8000) * count, `Charged per owner for ${count} owner(s).`)
    if (!isHiba) { add('Base Transfer Fee', baseTransfer, transferExplanation); add('Sports Fund (Once per property)', sportsFund, 'Mandatory society sports fund charged once per property.') }
    add(`Membership Fee (${count} owner${count > 1 ? 's' : ''})`, membership * count, `Society membership fee ${money(membership)} per owner × ${count}.`)
    add(`Membership Form (${count} owner${count > 1 ? 's' : ''})`, fee('membership_form', 2100) * count, `Membership form fee per owner × ${count}.`)
    if (transferType === 'Urgent') add(`Urgent Transfer Fee (${count} owner${count > 1 ? 's' : ''})`, fee('urgent_fee', 70000) * count, `Urgent processing surcharge per owner × ${count}.`)
    if (transferType === 'Executive') add(`Executive Transfer Fee (${count} owner${count > 1 ? 's' : ''})`, fee('executive_fee', 80000) * count, `Executive processing surcharge per owner × ${count}.`)
    if (!isHiba) add(`Agreement to Sell (${agreementType})`, agreementType === 'Simple' ? fee('agreement_simple', 4000) : dcValue * 0.001 + 4000, agreementType === 'Simple' ? 'Fixed simple agreement fee.' : 'Calculated as (DC Value × 0.1%) + Rs. 4,000.')
    const stamp = dcValue * 0.01 + dcValue * 0.01 + fee('mutation', 300) + fee('plra_service', 3600) + fee('plra_mutation', 200) + (stampDutyPayment === 'Online' ? fee('online_psid', 15) : 0)
    if (stamp > 0) add(`Stamp Duty (${stampDutyPayment})`, stamp, 'Includes AR-17 at 1% of DC value, 63A at 1%, mutation and PLRA charges, plus online PSID when selected.')
    if (!isHiba) add(`Advance Tax 236K (${taxpayer} @ ${buyerTaxRate}%)`, fbrValue * buyerTaxRate / 100, `Calculated as FBR Value (${money(fbrValue)}) × ${buyerTaxRate}% (Section 236K purchaser tax).`)
  }
  result.lines = [
    ...result.lines
      .filter((item) => !deletedLines.includes(item.label))
      .map((item) => {
        const override = overrides[item.label]
        const parsedOverride = Number.parseFloat(override)
        return override !== undefined && Number.isFinite(parsedOverride) ? { ...item, amount: parsedOverride } : item
      }),
    ...customExpenses.map((item) => ({ ...item, amount: Number.parseFloat(item.amount) || 0, explanation: 'Custom user-added expense.' })),
  ]
  result.grandTotal = result.lines.reduce((sum, item) => sum + item.amount, 0)
  return result
}
