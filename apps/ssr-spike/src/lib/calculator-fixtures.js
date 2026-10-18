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
    { calculator_phase_id: 'phase-demo', calculator_block_id: null, calculator_property_type_id: 'type-res-plot', dc_per_marla: 425000, dc_per_sqft: 0, fbr_per_marla: 440000, fbr_per_sqft: 0 },
    { calculator_phase_id: 'phase-demo', calculator_block_id: 'block-demo-a', calculator_property_type_id: 'type-res-house', dc_per_marla: 0, dc_per_sqft: 2200, fbr_per_marla: 0, fbr_per_sqft: 2500 },
    { calculator_phase_id: 'phase-demo', calculator_block_id: null, calculator_property_type_id: 'type-com-shop', dc_per_marla: 0, dc_per_sqft: 7800, fbr_per_marla: 0, fbr_per_sqft: 8400 },
    { calculator_phase_id: 'phase-demo', calculator_block_id: null, calculator_property_type_id: 'type-com-plot', dc_per_marla: 780000, dc_per_sqft: 0, fbr_per_marla: 820000, fbr_per_sqft: 0 },
    { calculator_phase_id: 'phase-demo', calculator_block_id: null, calculator_property_type_id: 'type-sector-shop', dc_per_marla: 0, dc_per_sqft: 7800, fbr_per_marla: 0, fbr_per_sqft: 8400 },
  ],
  calculator_transfer_fees: [
    { calculator_phase_id: 'phase-demo', calculator_block_id: null, category: 'Residential', reference_amount: 42000, reference_size: 5, reference_unit: 'marla' },
    { calculator_phase_id: 'phase-demo', calculator_block_id: null, category: 'Commercial', reference_amount: 95000, reference_size: 5, reference_unit: 'marla' },
    { calculator_phase_id: 'phase-demo', calculator_block_id: null, category: 'Sector Shop', reference_amount: 65000, reference_size: 5, reference_unit: 'marla' },
  ],
  calculator_fees: [
    ['biana', 4000], ['verification', 5250], ['transfer_file_plot_file', 7000], ['transfer_file_other', 8000],
    ['membership_form', 2100], ['agreement_simple', 4000], ['sports_fund', 10500], ['urgent_fee', 70000],
    ['executive_fee', 80000], ['mutation', 300], ['plra_service', 3600], ['plra_mutation', 200], ['online_psid', 15],
  ].map(([fee_key, amount]) => ({ fee_key, amount })),
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
