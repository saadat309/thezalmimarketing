// Fabricated examples only. Do not replace with production calculator records.
export const syntheticCalculatorConfig = {
  cities: [{ id: 'city-lahore', name: 'Lahore' }],
  societies: [{ id: 'society-demo', city_id: 'city-lahore', name: 'DHA Lahore (Synthetic)' }],
  calculator_phases: [
    { id: 'phase-demo', city_id: 'city-lahore', society_id: 'society-demo', name: 'Sample Phase', sort_order: 0, is_active: true, updated_at: '2026-10-18' },
  ],
  calculator_blocks: [
    { id: 'block-demo-a', calculator_phase_id: 'phase-demo', name: 'Sample Block A', sort_order: 0, is_active: true, updated_at: '2026-10-18' },
    { id: 'block-demo-b', calculator_phase_id: 'phase-demo', name: 'Sample Block B', sort_order: 1, is_active: true, updated_at: '2026-10-18' },
  ],
  calculator_property_types: [
    { id: 'type-res-plot', category: 'Residential', property_type: 'Plot', label: 'Plot', sort_order: 0, is_active: true, updated_at: '2026-10-18' },
    { id: 'type-res-house', category: 'Residential', property_type: 'House', label: 'House', sort_order: 1, is_active: true, updated_at: '2026-10-18' },
    { id: 'type-com-shop', category: 'Commercial', property_type: 'Shop', label: 'Shop', sort_order: 2, is_active: true, updated_at: '2026-10-18' },
    { id: 'type-com-plot', category: 'Commercial', property_type: 'Plot', label: 'Commercial Plot', sort_order: 3, is_active: true, updated_at: '2026-10-18' },
    { id: 'type-sector-shop', category: 'Sector Shop', property_type: 'Shop', label: 'Sector Shop', sort_order: 4, is_active: true, updated_at: '2026-10-18' },
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
    ['seller_236c_filer', 'Seller 236C - Filer', 2.75], ['seller_236c_non_filer', 'Seller 236C - Non-Filer', 11.5],
    ['purchaser_236k_filer', 'Purchaser 236K - Filer', 1.25], ['purchaser_236k_non_filer', 'Purchaser 236K - Non-Filer', 10.5],
  ].map(([rate_key, rate_name, rate]) => ({ id: `tax-demo-${rate_key}`, rate_key, rate_name, rate, rate_unit: 'percent', is_active: true, updated_at: '2026-10-18' })),
  calculator_fee_rules: [
    ['rule-demo-residential-0-10', 'membership_fee_residential', 'Residential', 'marla', 0, 10, 75000],
    ['rule-demo-residential-10-40', 'membership_fee_residential', 'Residential', 'marla', 10, 40, 150000],
    ['rule-demo-residential-40-plus', 'membership_fee_residential', 'Residential', 'marla', 40, null, 200000],
    ['rule-demo-commercial-0-4', 'membership_fee_commercial', 'Commercial', 'marla', 0, 4, 150000],
    ['rule-demo-commercial-4-plus', 'membership_fee_commercial', 'Commercial', 'marla', 4, null, 200000],
  ].map(([id, fee_key, property_type, unit, min_area, max_area, fee_amount]) => ({
    id, fee_id: `fee-demo-${fee_key}`, fee_key, property_type, unit, min_area, max_area, fee_amount, is_active: true, updated_at: '2026-10-18',
  })),
}
