<?php
// api/routes/calculator-config.php

function send_json($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function handle_calculator_config(PDO $pdo) {
    try {
        // Cities (no is_active column)
        $cities = $pdo->query("SELECT id, name FROM cities ORDER BY name ASC")->fetchAll(PDO::FETCH_ASSOC);

        // Societies (no is_active column)
        $societies = $pdo->query("SELECT id, name FROM societies ORDER BY name ASC")->fetchAll(PDO::FETCH_ASSOC);

        // Calculator Phases
        $phasesStmt = $pdo->query("
            SELECT cp.id, cp.city_id, cp.society_id, cp.name, cp.sort_order, cp.is_active
            FROM calculator_phases cp
            WHERE cp.is_active = 1
            ORDER BY cp.sort_order ASC, cp.name ASC
        ");
        $phases = $phasesStmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculator Blocks
        $blocksStmt = $pdo->query("
            SELECT cb.id, cb.calculator_phase_id, cb.name, cb.sort_order, cb.is_active
            FROM calculator_blocks cb
            WHERE cb.is_active = 1
            ORDER BY cb.sort_order ASC, cb.name ASC
        ");
        $blocks = $blocksStmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculator Property Types
        $cptStmt = $pdo->query("
            SELECT id, category, property_type, label, sort_order, is_active
            FROM calculator_property_types
            WHERE is_active = 1
            ORDER BY sort_order ASC, id ASC
        ");
        $property_types = $cptStmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculator Rates
        $ratesStmt = $pdo->query("
            SELECT
                cr.id,
                cr.calculator_phase_id,
                cr.calculator_block_id,
                cr.calculator_property_type_id,
                cr.dc_per_marla,
                cr.dc_per_sqft,
                cr.fbr_per_marla,
                cr.fbr_per_sqft,
                cr.is_active
            FROM calculator_rates cr
            WHERE cr.is_active = 1
        ");
        $rates = $ratesStmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculator Transfer Fees
        $tfStmt = $pdo->query("
            SELECT
                ctf.id,
                ctf.calculator_phase_id,
                ctf.calculator_block_id,
                ctf.category,
                ctf.reference_amount,
                ctf.reference_size,
                ctf.reference_unit,
                ctf.is_active
            FROM calculator_transfer_fees ctf
            WHERE ctf.is_active = 1
        ");
        $transfer_fees = $tfStmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculator Fees
        $feesStmt = $pdo->query("
            SELECT id, fee_key, fee_name, amount, charge_unit, is_active
            FROM calculator_fees
            WHERE is_active = 1
        ");
        $fees = $feesStmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculator Tax Rates
        $taxStmt = $pdo->query("
            SELECT id, rate_key, rate_name, rate, rate_unit, is_active
            FROM calculator_tax_rates
            WHERE is_active = 1
        ");
        $tax_rates = $taxStmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculator Fee Rules
        try {
            $pdo->exec("ALTER TABLE calculator_fee_rules ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");
        } catch (PDOException $e) {}

        $rulesStmt = $pdo->query("
            SELECT id, fee_id, property_type, unit, min_area, max_area, fee_amount, is_active
            FROM calculator_fee_rules
            WHERE is_active = 1
        ");
        $fee_rules = $rulesStmt->fetchAll(PDO::FETCH_ASSOC);

        send_json([
            'cities' => $cities,
            'societies' => $societies,
            'calculator_phases' => $phases,
            'calculator_blocks' => $blocks,
            'calculator_property_types' => $property_types,
            'calculator_rates' => $rates,
            'calculator_transfer_fees' => $transfer_fees,
            'calculator_fees' => $fees,
            'calculator_tax_rates' => $tax_rates,
            'calculator_fee_rules' => $fee_rules
        ]);

    } catch (PDOException $e) {
        error_log("Calculator config error: " . $e->getMessage());
        send_json(['error' => 'Failed to load calculator configuration: ' . $e->getMessage()], 500);
    }
}
