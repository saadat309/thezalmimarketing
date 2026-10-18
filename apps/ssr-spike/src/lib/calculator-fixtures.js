// Fabricated examples only. Do not replace with production calculator records.
export const syntheticCalculatorConfig = {
  cities: [{ id: 'city-lahore', name: 'Lahore' }],
  societies: [{ id: 'society-demo', name: 'DHA Lahore (Synthetic)' }],
  calculator_phases: [
    { id: 'phase-demo', city_id: 'city-lahore', society_id: 'society-demo', name: 'Sample Phase' },
  ],
  calculator_blocks: [
    { id: 'block-demo-a', calculator_phase_id: 'phase-demo', name: 'Sample Block A' },
    { id: 'block-demo-b', calculator_phase_id: 'phase-demo', name: 'Sample Block B' },
  ],
  calculator_property_types: [
    { id: 'type-res-plot', category: 'Residential', property_type: 'Plot', label: 'Plot' },
    { id: 'type-res-house', category: 'Residential', property_type: 'House', label: 'House' },
    { id: 'type-com-shop', category: 'Commercial', property_type: 'Shop', label: 'Shop' },
    { id: 'type-com-plot', category: 'Commercial', property_type: 'Plot', label: 'Commercial Plot' },
    { id: 'type-sector-shop', category: 'Sector Shop', property_type: 'Shop', label: 'Sector Shop' },
  ],
  calculator_rates: [
    { id: 'rate-demo-plot', calculator_phase_id: 'phase-demo', calculator_block_id: null, calculator_property_type_id: 'type-res-plot', dc_per_marla: 425000, dc_per_sqft: 0, fbr_per_marla: 440000, fbr_per_sqft: 0, is_active: true, updated_at: '2026-10-18' },
    { id: 'rate-demo-house', calculator_phase_id: 'phase-demo', calculator_block_id: 'block-demo-a', calculator_property_type_id: 'type-res-house', dc_per_marla: 0, dc_per_sqft: 2200, fbr_per_marla: 0, fbr_per_sqft: 2500, is_active: true, updated_at: '2026-10-18' },
    { id: 'rate-demo-shop', calculator_phase_id: 'phase-demo', calculator_block_id: null, calculator_property_type_id: 'type-com-shop', dc_per_marla: 0, dc_per_sqft: 7800, fbr_per_marla: 0, fbr_per_sqft: 8400, is_active: true, updated_at: '2026-10-18' },
    { id: 'rate-demo-commercial-plot', calculator_phase_id: 'phase-demo', calculator_block_id: null, calculator_property_type_id: 'type-com-plot', dc_per_marla: 780000, dc_per_sqft: 0, fbr_per_marla: 820000, fbr_per_sqft: 0, is_active: true, updated_at: '2026-10-18' },
    { id: 'rate-demo-sector-shop', calculator_phase_id: 'phase-demo', calculator_block_id: null, calculator_property_type_id: 'type-sector-shop', dc_per_marla: 0, dc_per_sqft: 7800, fbr_per_marla: 0, fbr_per_sqft: 8400, is_active: true, updated_at: '2026-10-18' },
  ],
  calculator_transfer_fees: [
    { id: 'transfer-demo-residential', calculator_phase_id: 'phase-demo', calculator_block_id: null, category: 'Residential', reference_amount: 42000, reference_size: 5, reference_unit: 'marla', is_active: true, updated_at: '2026-10-18' },
    { id: 'transfer-demo-commercial', calculator_phase_id: 'phase-demo', calculator_block_id: null, category: 'Commercial', reference_amount: 95000, reference_size: 5, reference_unit: 'marla', is_active: true, updated_at: '2026-10-18' },
    { id: 'transfer-demo-sector-shop', calculator_phase_id: 'phase-demo', calculator_block_id: null, category: 'Sector Shop', reference_amount: 65000, reference_size: 5, reference_unit: 'marla', is_active: true, updated_at: '2026-10-18' },
  ],
  calculator_fees: [
    ['biana', 'Biana', 4000, 'transaction'], ['verification', 'Verification', 5250, 'transaction'],
    ['transfer_file_plot_file', 'Transfer File - Plot/File', 7000, 'owner'], ['transfer_file_other', 'Transfer File - Other', 8000, 'owner'],
    ['membership_fee_residential', 'Membership Fee - Residential', 150000, 'owner'],
    ['membership_fee_commercial', 'Membership Fee - Commercial/Sector Shop', 200000, 'owner'],
    ['membership_form', 'Membership Form', 2100, 'owner'], ['agreement_simple', 'Simple Agreement', 4000, 'transaction'],
    ['sports_fund', 'Sports Fund', 10500, 'property'], ['urgent_fee', 'Urgent Transfer Fee', 70000, 'owner'],
    ['executive_fee', 'Executive Transfer Fee', 80000, 'owner'], ['mutation', 'Mutation', 300, 'transaction'],
    ['plra_service', 'PLRA Service Charges', 3600, 'transaction'], ['plra_mutation', 'PLRA Mutation', 200, 'transaction'],
    ['online_psid', 'Online PSID', 15, 'transaction'],
  ].map(([fee_key, fee_name, amount, charge_unit]) => ({
    id: `fee-demo-${fee_key}`, fee_key, fee_name, amount, charge_unit, is_active: true, updated_at: '2026-10-18',
  })),
  calculator_tax_rates: [
    ['seller_236c_filer', 2.75], ['seller_236c_non_filer', 11.5],
    ['purchaser_236k_filer', 1.25], ['purchaser_236k_non_filer', 10.5],
  ].map(([rate_key, rate]) => ({ rate_key, rate })),
  calculator_fee_rules: [
    { property_type: 'Residential', unit: 'marla', min_area: 0, max_area: 10, fee_amount: 75000, is_active: 1 },
    { property_type: 'Residential', unit: 'marla', min_area: 10, max_area: 40, fee_amount: 150000, is_active: 1 },
    { property_type: 'Residential', unit: 'marla', min_area: 40, max_area: null, fee_amount: 200000, is_active: 1 },
    { property_type: 'Commercial', unit: 'marla', min_area: 0, max_area: 4, fee_amount: 150000, is_active: 1 },
    { property_type: 'Commercial', unit: 'marla', min_area: 4, max_area: null, fee_amount: 200000, is_active: 1 },
  ],
}
