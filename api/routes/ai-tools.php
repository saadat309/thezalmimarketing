<?php
// api/routes/ai-tools.php

function handle_ai_tools(PDO $pdo) {
    // Verify AI internal secret header
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $ai_secret = $headers['X-AI-Secret'] ?? $headers['x-ai-secret'] ?? $_SERVER['HTTP_X_AI_SECRET'] ?? '';
    
    $expected_secret = defined('AI_INTERNAL_SECRET') ? AI_INTERNAL_SECRET : (getenv('AI_INTERNAL_SECRET') ?: 'dev_secret_zalmi_12345');

    if ($ai_secret !== $expected_secret) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Unauthorized AI tool request']);
        return;
    }

    $action = $_GET['action'] ?? '';

    switch ($action) {
        case 'search_properties':
            search_properties_tool($pdo);
            break;
        case 'get_societies':
            get_societies_tool($pdo);
            break;
        case 'search_files':
            search_files_tool($pdo);
            break;
        case 'search_maps':
            search_maps_tool($pdo);
            break;
        case 'search_dc_fbr_rates':
            search_dc_fbr_rates_tool($pdo);
            break;
        case 'calculate_transfer_expenses':
            calculate_transfer_expenses_tool($pdo);
            break;
        default:
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Unknown action']);
            break;
    }
}

function search_properties_tool(PDO $pdo) {
    $city = $_GET['city'] ?? null;
    $property_type = $_GET['property_type'] ?? null;
    $area_size = $_GET['area_size'] ?? null;
    $max_price = $_GET['max_price'] ?? null;
    $society = $_GET['society'] ?? null;

    $where = " WHERE p.is_file = 0";
    $params = [];

    if ($city) {
        $where .= " AND ci.name LIKE ?";
        $params[] = "%$city%";
    }
    if ($property_type) {
        $where .= " AND p.property_type LIKE ?";
        $params[] = "%$property_type%";
    }
    if ($area_size) {
        $where .= " AND p.area LIKE ?";
        $params[] = "%$area_size%";
    }
    if ($max_price) {
        $where .= " AND p.price_amount <= ?";
        $params[] = (float)$max_price;
    }
    if ($society) {
        $where .= " AND s.name LIKE ?";
        $params[] = "%$society%";
    }

    // Get total count
    $count_sql = "SELECT COUNT(*) FROM properties p 
                  LEFT JOIN cities ci ON p.city_id = ci.id
                  LEFT JOIN societies s ON p.society_id = s.id
                  LEFT JOIN phases ph ON p.phase_id = ph.id" . $where;
    
    $stmt = $pdo->prepare($count_sql);
    $stmt->execute($params);
    $total_count = (int)$stmt->fetchColumn();

    // Get results
    $sql = "SELECT p.id, p.title, p.slug, p.price_amount as price, p.area, p.unit, p.property_type, ci.name as city, s.name as society, ph.name as phase, p.hide, p.is_file 
            FROM properties p 
            LEFT JOIN cities ci ON p.city_id = ci.id
            LEFT JOIN societies s ON p.society_id = s.id
            LEFT JOIN phases ph ON p.phase_id = ph.id" . $where . " ORDER BY p.created_at DESC LIMIT 10";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'count' => $total_count, 'properties' => $results]);
}

function get_societies_tool(PDO $pdo) {
    $sql = "SELECT id, name, slug FROM societies ORDER BY name ASC";
    $stmt = $pdo->query($sql);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'societies' => $results]);
}

function search_files_tool(PDO $pdo) {
    $society = $_GET['society'] ?? null;
    $file_type = $_GET['file_type'] ?? null;
    $city = $_GET['city'] ?? null;

    $sql = "SELECT p.id, p.title, p.slug, p.file_type, p.price_amount as price, p.area, p.unit, ci.name as city, s.name as society, ph.name as phase
            FROM properties p 
            LEFT JOIN cities ci ON p.city_id = ci.id
            LEFT JOIN societies s ON p.society_id = s.id
            LEFT JOIN phases ph ON p.phase_id = ph.id
            WHERE p.is_file = 1";
    $params = [];

    if ($society) {
        $sql .= " AND s.name LIKE ?";
        $params[] = "%$society%";
    }
    if ($file_type) {
        $sql .= " AND p.file_type LIKE ?";
        $params[] = "%$file_type%";
    }
    if ($city) {
        $sql .= " AND ci.name LIKE ?";
        $params[] = "%$city%";
    }

    $sql .= " ORDER BY p.created_at DESC LIMIT 10";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'count' => count($results), 'files' => $results]);
}

function search_maps_tool(PDO $pdo) {
    $society = $_GET['society'] ?? null;
    $city = $_GET['city'] ?? null;

    $sql = "SELECT md.id, md.title, md.slug, md.description, md.map_pic, md.pdf, ci.name AS city_name, s.name AS society_name, p.name AS phase_name
            FROM map_docs md
            LEFT JOIN cities ci ON md.city_id = ci.id
            LEFT JOIN societies s ON md.society_id = s.id
            LEFT JOIN phases p ON md.phase_id = p.id
            WHERE 1=1";
    $params = [];

    if ($society) {
        $sql .= " AND (s.name LIKE ? OR p.name LIKE ?)";
        $params[] = "%$society%";
        $params[] = "%$society%";
    }
    if ($city) {
        $sql .= " AND ci.name LIKE ?";
        $params[] = "%$city%";
    }

    $sql .= " ORDER BY md.id DESC LIMIT 10";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'count' => count($results), 'maps' => $results]);
}

function search_dc_fbr_rates_tool(PDO $pdo) {
    $society = $_GET['society'] ?? null;
    $property_type = $_GET['property_type'] ?? null;

    $sql = "SELECT 
                cr.id, cp.name AS phase_name, c.name AS city_name, s.name AS society_name, cb.name AS block_name,
                cpt.property_type, cpt.label AS property_type_label,
                cr.dc_per_marla, cr.dc_per_sqft, cr.fbr_per_marla, cr.fbr_per_sqft
            FROM calculator_rates cr
            INNER JOIN calculator_phases cp ON cp.id = cr.calculator_phase_id
            INNER JOIN cities c ON c.id = cp.city_id
            INNER JOIN societies s ON s.id = cp.society_id
            LEFT JOIN calculator_blocks cb ON cb.id = cr.calculator_block_id
            INNER JOIN calculator_property_types cpt ON cpt.id = cr.calculator_property_type_id
            WHERE cr.is_active = 1";
    $params = [];

    if ($society) {
        $sql .= " AND s.name LIKE ?";
        $params[] = "%$society%";
    }
    if ($property_type) {
        $sql .= " AND (cpt.property_type LIKE ? OR cpt.label LIKE ?)";
        $params[] = "%$property_type%";
        $params[] = "%$property_type%";
    }

    $sql .= " LIMIT 10";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'count' => count($results), 'dc_fbr_rates' => $results]);
}

function calculate_transfer_expenses_tool(PDO $pdo) {
    $society_query = $_GET['society'] ?? 'DHA';
    $phase_query = $_GET['phase'] ?? 'Phase 1';
    $block_query = $_GET['block'] ?? null;
    $property_type_query = $_GET['property_type'] ?? 'Plot';
    $size_marla = (float)($_GET['size_marla'] ?? 5);
    $taxpayer = $_GET['taxpayer_status'] ?? 'Filer';
    $who_is_paying = $_GET['payer'] ?? 'Purchaser';

    // Fetch fees
    $fees = [];
    $stmt = $pdo->query("SELECT fee_key, amount FROM calculator_fees WHERE is_active = 1");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $fees[$row['fee_key']] = (float)$row['amount'];
    }

    $biana = $fees['biana'] ?? 4000;
    $verification_fee = $fees['verification'] ?? 5250;
    $transfer_file_plot = $fees['transfer_file_plot_file'] ?? 7000;
    $membership_form_fee = $fees['membership_form'] ?? 2100;
    $sports_fund_fee = $fees['sports_fund'] ?? 10500;
    $mutation_fee = $fees['mutation'] ?? 300;
    $plra_service_fee = $fees['plra_service'] ?? 3600;
    $plra_mutation_fee = $fees['plra_mutation'] ?? 200;
    $online_psid_fee = $fees['online_psid'] ?? 15;

    // Fetch tax rates
    $tax_rates = [];
    $stmt = $pdo->query("SELECT rate_key, rate FROM calculator_tax_rates WHERE is_active = 1");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $tax_rates[$row['rate_key']] = (float)$row['rate'];
    }

    $seller_filer = $tax_rates['seller_236c_filer'] ?? 2.75;
    $seller_non_filer = $tax_rates['seller_236c_non_filer'] ?? 11.5;
    $purchaser_filer = $tax_rates['purchaser_236k_filer'] ?? 1.25;
    $purchaser_non_filer = $tax_rates['purchaser_236k_non_filer'] ?? 10.5;

    // Find Phase & Rate
    $rate_sql = "SELECT cr.*, cpt.property_type, cp.name as phase_name, s.name as society_name 
                 FROM calculator_rates cr
                 INNER JOIN calculator_phases cp ON cp.id = cr.calculator_phase_id
                 INNER JOIN societies s ON s.id = cp.society_id
                 INNER JOIN calculator_property_types cpt ON cpt.id = cr.calculator_property_type_id
                 WHERE s.name LIKE ? AND cp.name LIKE ? AND (cpt.property_type LIKE ? OR cpt.label LIKE ?)";
    $stmt = $pdo->prepare($rate_sql);
    $stmt->execute(["%$society_query%", "%$phase_query%", "%$property_type_query%", "%$property_type_query%"]);
    $matched_rate = $stmt->fetch(PDO::FETCH_ASSOC);

    $dc_per_marla = $matched_rate ? (float)$matched_rate['dc_per_marla'] : 1500000;
    $fbr_per_marla = $matched_rate ? (float)$matched_rate['fbr_per_marla'] : 1400000;

    $dc_value = $size_marla * $dc_per_marla;
    $fbr_value = $size_marla * $fbr_per_marla;

    // Transfer Fee
    $base_transfer_fee = $size_marla * 10500;
    $final_transfer_fee = $base_transfer_fee + $sports_fund_fee;

    $lines = [];
    if ($who_is_paying === 'Seller') {
        $tax_rate = ($taxpayer === 'Filer') ? $seller_filer : $seller_non_filer;
        $seller_tax = $fbr_value * ($tax_rate / 100);
        $lines[] = ['label' => "Seller Tax 236C ($taxpayer @ $tax_rate%)", 'amount' => $seller_tax];
        $grand_total = $seller_tax;
    } else {
        // Purchaser
        $lines[] = ['label' => 'Transfer File (1 owner)', 'amount' => $transfer_file_plot];
        $lines[] = ['label' => 'Base Transfer Fee', 'amount' => $base_transfer_fee];
        $lines[] = ['label' => 'Sports Fund (Once per property)', 'amount' => $sports_fund_fee];
        
        // Membership fee rule
        $membership_fee = $size_marla <= 10 ? 75000 : 150000;
        $lines[] = ['label' => 'Membership Fee (1 owner)', 'amount' => $membership_fee];
        $lines[] = ['label' => 'Membership Form (1 owner)', 'amount' => $membership_form_fee];
        $lines[] = ['label' => 'Agreement to Sell (Simple)', 'amount' => 4000];

        // Stamp Duty
        $ar17 = $dc_value * 0.01;
        $challan63a = ($dc_value * 0.01) + $mutation_fee + $plra_service_fee + $plra_mutation_fee;
        $total_stamp_duty = $ar17 + $challan63a + $online_psid_fee;
        $lines[] = ['label' => 'Stamp Duty (Online)', 'amount' => $total_stamp_duty];

        // Advance Tax 236K
        $tax_236k_rate = ($taxpayer === 'Filer') ? $purchaser_filer : $purchaser_non_filer;
        $total_236k = $fbr_value * ($tax_236k_rate / 100);
        $lines[] = ['label' => "Advance Tax 236K ($taxpayer @ $tax_236k_rate%)", 'amount' => $total_236k];

        $grand_total = 0;
        foreach ($lines as $l) {
            $grand_total += $l['amount'];
        }
    }

    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'society' => $society_query,
        'phase' => $phase_query,
        'block' => $block_query ?? 'All Blocks',
        'property_type' => $property_type_query,
        'size_marla' => $size_marla,
        'taxpayer_status' => $taxpayer,
        'payer' => $who_is_paying,
        'dc_value' => $dc_value,
        'fbr_value' => $fbr_value,
        'lines' => $lines,
        'grand_total' => $grand_total
    ]);
}
