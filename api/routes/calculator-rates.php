<?php
// api/routes/calculator-rates.php

require_once __DIR__ . '/../utils/slug_util.php';

function send_json($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function get_request_data() {
    $data = [];
    if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
        $data = $_POST;
        if (empty($data) && empty($_FILES)) {
            $raw = file_get_contents('php://input');
            $json_data = json_decode($raw, true);
            if (is_array($json_data)) {
                $data = $json_data;
            }
        }
    }
    return $data;
}

function handle_calculator_rates($method, PDO $pdo, $segments = []) {
    $action = $segments[1] ?? null;
    $sub_action = $segments[2] ?? null;

    if ($action === 'import') {
        if ($method === 'POST') {
            return import_calculator_rates($pdo);
        }
        return send_json(['error' => 'Method not allowed'], 405);
    }

    if ($action === 'template') {
        if ($method === 'GET') {
            return download_sample_template($pdo);
        }
        return send_json(['error' => 'Method not allowed'], 405);
    }

    $id = is_numeric($action) ? (int)$action : null;

    switch ($method) {
        case 'GET':
            if ($id) return get_calculator_rate($pdo, $id);
            return list_calculator_rates($pdo);

        case 'POST':
            return create_calculator_rate($pdo);

        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_calculator_rate($pdo, $id);

        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_calculator_rate($pdo, $id);

        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}

function list_calculator_rates(PDO $pdo) {
    $stmt = $pdo->query("
        SELECT
            cr.id,
            cr.calculator_phase_id,
            cp.name AS calculator_phase_name,
            cp.city_id,
            c.name AS city_name,
            cp.society_id,
            s.name AS society_name,
            cr.calculator_block_id,
            cb.name AS calculator_block_name,
            cr.calculator_property_type_id,
            cpt.category,
            cpt.property_type,
            cpt.label AS property_type_label,
            cr.dc_per_marla,
            cr.dc_per_sqft,
            cr.fbr_per_marla,
            cr.fbr_per_sqft,
            cr.is_active,
            cr.created_at,
            cr.updated_at
        FROM calculator_rates cr
        INNER JOIN calculator_phases cp ON cp.id = cr.calculator_phase_id
        INNER JOIN cities c ON c.id = cp.city_id
        INNER JOIN societies s ON s.id = cp.society_id
        LEFT JOIN calculator_blocks cb ON cb.id = cr.calculator_block_id
        INNER JOIN calculator_property_types cpt ON cpt.id = cr.calculator_property_type_id
        ORDER BY cp.sort_order ASC, cp.id DESC, cb.sort_order ASC, cpt.sort_order ASC
    ");

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as &$row) {
        if ($row['dc_per_sqft'] !== null || $row['fbr_per_sqft'] !== null) {
            $row['unit'] = 'sqft';
            $row['unit_label'] = 'Per Sq. Ft.';
            $row['dc_rate'] = $row['dc_per_sqft'];
            $row['fbr_rate'] = $row['fbr_per_sqft'];
        } else {
            $row['unit'] = 'marla';
            $row['unit_label'] = 'Per Marla';
            $row['dc_rate'] = $row['dc_per_marla'];
            $row['fbr_rate'] = $row['fbr_per_marla'];
        }
    }
    unset($row);

    send_json($rows);
}

function get_calculator_rate(PDO $pdo, $id) {
    $stmt = $pdo->prepare("
        SELECT
            cr.id,
            cr.calculator_phase_id,
            cp.name AS calculator_phase_name,
            cp.city_id,
            c.name AS city_name,
            cp.society_id,
            s.name AS society_name,
            cr.calculator_block_id,
            cb.name AS calculator_block_name,
            cr.calculator_property_type_id,
            cpt.category,
            cpt.property_type,
            cpt.label AS property_type_label,
            cr.dc_per_marla,
            cr.dc_per_sqft,
            cr.fbr_per_marla,
            cr.fbr_per_sqft,
            cr.is_active,
            cr.created_at,
            cr.updated_at
        FROM calculator_rates cr
        INNER JOIN calculator_phases cp ON cp.id = cr.calculator_phase_id
        INNER JOIN cities c ON c.id = cp.city_id
        INNER JOIN societies s ON s.id = cp.society_id
        LEFT JOIN calculator_blocks cb ON cb.id = cr.calculator_block_id
        INNER JOIN calculator_property_types cpt ON cpt.id = cr.calculator_property_type_id
        WHERE cr.id = ?
    ");

    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        return send_json(['error' => 'Calculator rate not found'], 404);
    }

    if ($row['dc_per_sqft'] !== null || $row['fbr_per_sqft'] !== null) {
        $row['unit'] = 'sqft';
        $row['unit_label'] = 'Per Sq. Ft.';
        $row['dc_rate'] = $row['dc_per_sqft'];
        $row['fbr_rate'] = $row['fbr_per_sqft'];
    } else {
        $row['unit'] = 'marla';
        $row['unit_label'] = 'Per Marla';
        $row['dc_rate'] = $row['dc_per_marla'];
        $row['fbr_rate'] = $row['fbr_per_marla'];
    }

    send_json($row);
}

function parse_rate_input($input) {
    $calculator_phase_id = isset($input['calculator_phase_id']) ? (int)$input['calculator_phase_id'] : 0;
    $calculator_block_id = !empty($input['calculator_block_id']) ? (int)$input['calculator_block_id'] : null;
    $calculator_property_type_id = isset($input['calculator_property_type_id']) ? (int)$input['calculator_property_type_id'] : 0;
    
    $unit = trim(strtolower($input['unit'] ?? 'marla'));
    $dc_rate = isset($input['dc_rate']) && $input['dc_rate'] !== '' ? (float)$input['dc_rate'] : null;
    $fbr_rate = isset($input['fbr_rate']) && $input['fbr_rate'] !== '' ? (float)$input['fbr_rate'] : null;
    $is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;

    return [
        'calculator_phase_id' => $calculator_phase_id,
        'calculator_block_id' => $calculator_block_id,
        'calculator_property_type_id' => $calculator_property_type_id,
        'unit' => $unit,
        'dc_rate' => $dc_rate,
        'fbr_rate' => $fbr_rate,
        'is_active' => $is_active
    ];
}

function create_calculator_rate(PDO $pdo) {
    $input = get_request_data();
    $data = parse_rate_input($input);

    if (!$data['calculator_phase_id'] || !$data['calculator_property_type_id']) {
        return send_json(['error' => 'calculator_phase_id and calculator_property_type_id are required'], 400);
    }

    $stmt = $pdo->prepare("SELECT id FROM calculator_phases WHERE id = ?");
    $stmt->execute([$data['calculator_phase_id']]);
    if (!$stmt->fetch()) {
        return send_json(['error' => 'Calculator phase not found'], 404);
    }

    if ($data['calculator_block_id']) {
        $stmt = $pdo->prepare("SELECT id FROM calculator_blocks WHERE id = ? AND calculator_phase_id = ?");
        $stmt->execute([$data['calculator_block_id'], $data['calculator_phase_id']]);
        if (!$stmt->fetch()) {
            return send_json(['error' => 'Calculator block not found or does not belong to the selected phase'], 404);
        }
    }

    $stmt = $pdo->prepare("SELECT id FROM calculator_property_types WHERE id = ?");
    $stmt->execute([$data['calculator_property_type_id']]);
    if (!$stmt->fetch()) {
        return send_json(['error' => 'Calculator property type not found'], 404);
    }

    $stmt = $pdo->prepare("
        SELECT id FROM calculator_rates
        WHERE calculator_phase_id = ?
          AND ((calculator_block_id IS NULL AND ? IS NULL) OR calculator_block_id = ?)
          AND calculator_property_type_id = ?
        LIMIT 1
    ");
    $stmt->execute([
        $data['calculator_phase_id'],
        $data['calculator_block_id'],
        $data['calculator_block_id'],
        $data['calculator_property_type_id']
    ]);
    if ($stmt->fetch()) {
        return send_json(['error' => 'A rate for this Phase + Block + Property Type combination already exists'], 409);
    }

    $dc_per_marla = ($data['unit'] === 'sqft') ? null : $data['dc_rate'];
    $dc_per_sqft = ($data['unit'] === 'sqft') ? $data['dc_rate'] : null;
    $fbr_per_marla = ($data['unit'] === 'sqft') ? null : $data['fbr_rate'];
    $fbr_per_sqft = ($data['unit'] === 'sqft') ? $data['fbr_rate'] : null;

    try {
        $stmt = $pdo->prepare("
            INSERT INTO calculator_rates
                (calculator_phase_id, calculator_block_id, calculator_property_type_id, dc_per_marla, dc_per_sqft, fbr_per_marla, fbr_per_sqft, is_active)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['calculator_phase_id'],
            $data['calculator_block_id'],
            $data['calculator_property_type_id'],
            $dc_per_marla,
            $dc_per_sqft,
            $fbr_per_marla,
            $fbr_per_sqft,
            $data['is_active']
        ]);

        $new_id = $pdo->lastInsertId();
        return get_calculator_rate($pdo, $new_id);
    } catch (PDOException $e) {
        error_log("Calculator rate create error: " . $e->getMessage());
        return send_json(['error' => 'Insert failed'], 500);
    }
}

function update_calculator_rate(PDO $pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM calculator_rates WHERE id = ?");
    $stmt->execute([$id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        return send_json(['error' => 'Calculator rate not found'], 404);
    }

    $input = get_request_data();
    $data = parse_rate_input($input);

    $calculator_phase_id = array_key_exists('calculator_phase_id', $input) ? (int)$input['calculator_phase_id'] : (int)$existing['calculator_phase_id'];
    $calculator_block_id = array_key_exists('calculator_block_id', $input) ? (!empty($input['calculator_block_id']) ? (int)$input['calculator_block_id'] : null) : $existing['calculator_block_id'];
    $calculator_property_type_id = array_key_exists('calculator_property_type_id', $input) ? (int)$input['calculator_property_type_id'] : (int)$existing['calculator_property_type_id'];

    $unit = array_key_exists('unit', $input) ? trim(strtolower($input['unit'])) : (($existing['dc_per_sqft'] !== null) ? 'sqft' : 'marla');
    $dc_rate = array_key_exists('dc_rate', $input) ? ($input['dc_rate'] !== '' ? (float)$input['dc_rate'] : null) : (($unit === 'sqft') ? $existing['dc_per_sqft'] : $existing['dc_per_marla']);
    $fbr_rate = array_key_exists('fbr_rate', $input) ? ($input['fbr_rate'] !== '' ? (float)$input['fbr_rate'] : null) : (($unit === 'sqft') ? $existing['fbr_per_sqft'] : $existing['fbr_per_marla']);
    $is_active = array_key_exists('is_active', $input) ? (int)$input['is_active'] : (int)$existing['is_active'];

    $stmt = $pdo->prepare("
        SELECT id FROM calculator_rates
        WHERE calculator_phase_id = ?
          AND ((calculator_block_id IS NULL AND ? IS NULL) OR calculator_block_id = ?)
          AND calculator_property_type_id = ?
          AND id != ?
        LIMIT 1
    ");
    $stmt->execute([
        $calculator_phase_id,
        $calculator_block_id,
        $calculator_block_id,
        $calculator_property_type_id,
        $id
    ]);
    if ($stmt->fetch()) {
        return send_json(['error' => 'Another rate for this Phase + Block + Property Type combination already exists'], 409);
    }

    $dc_per_marla = ($unit === 'sqft') ? null : $dc_rate;
    $dc_per_sqft = ($unit === 'sqft') ? $dc_rate : null;
    $fbr_per_marla = ($unit === 'sqft') ? null : $fbr_rate;
    $fbr_per_sqft = ($unit === 'sqft') ? $fbr_rate : null;

    try {
        $stmt = $pdo->prepare("
            UPDATE calculator_rates
            SET
                calculator_phase_id = ?,
                calculator_block_id = ?,
                calculator_property_type_id = ?,
                dc_per_marla = ?,
                dc_per_sqft = ?,
                fbr_per_marla = ?,
                fbr_per_sqft = ?,
                is_active = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $calculator_phase_id,
            $calculator_block_id,
            $calculator_property_type_id,
            $dc_per_marla,
            $dc_per_sqft,
            $fbr_per_marla,
            $fbr_per_sqft,
            $is_active,
            $id
        ]);

        return get_calculator_rate($pdo, $id);
    } catch (PDOException $e) {
        error_log("Calculator rate update error: " . $e->getMessage());
        return send_json(['error' => 'Update failed'], 500);
    }
}

function delete_calculator_rate(PDO $pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM calculator_rates WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) {
        return send_json(['error' => 'Calculator rate not found'], 404);
    }
    http_response_code(204);
    exit;
}

function parse_csv_file($file_path) {
    $rows = [];
    if (($handle = fopen($file_path, 'r')) !== FALSE) {
        $header = null;
        while (($data = fgetcsv($handle, 1000, ',')) !== FALSE) {
            if (!$header) {
                
                $header = array_map(function ($header) {
                    $header = preg_replace('/^\xEF\xBB\xBF/', '', $header);
                    return trim(strtolower($header));
                }, $data);
            } else {
                $row = [];
                foreach ($header as $i => $h) {
                    $row[$h] = $data[$i] ?? '';
                }
                $rows[] = $row;
            }
        }
        fclose($handle);
    }
    return $rows;
}

function import_calculator_rates(PDO $pdo) {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        return send_json(['error' => 'No valid file uploaded'], 400);
    }

    $file = $_FILES['file'];
    $tmp_name = $file['tmp_name'];
    $file_name = $file['name'];
    $ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

    if ($ext !== 'csv') {
        return send_json(['error' => 'Invalid file format. Only .csv files are supported.'], 400);
    }

    $validate_only = isset($_POST['validate_only']) && ($_POST['validate_only'] === '1' || $_POST['validate_only'] === 'true');

    $parsed_rows = parse_csv_file($tmp_name);
    if (empty($parsed_rows)) {
        return send_json(['error' => 'Uploaded file is empty or could not be parsed'], 400);
    }

    // Load existing cities and societies maps (must exist in database, not auto-created)
    $cities_map = [];
    foreach ($pdo->query("SELECT id, name FROM cities")->fetchAll(PDO::FETCH_ASSOC) as $c) {
        $cities_map[strtolower(trim($c['name']))] = (int)$c['id'];
    }

    $societies_map = [];
    foreach ($pdo->query("SELECT id, name FROM societies")->fetchAll(PDO::FETCH_ASSOC) as $s) {
        $societies_map[strtolower(trim($s['name']))] = (int)$s['id'];
    }

    $property_types_map = [];
    foreach ($pdo->query("SELECT id, category, property_type, label FROM calculator_property_types")->fetchAll(PDO::FETCH_ASSOC) as $cpt) {
        $key1 = strtolower(trim($cpt['category'])) . '|' . strtolower(trim($cpt['property_type']));
        $key2 = strtolower(trim($cpt['label']));
        $property_types_map[$key1] = (int)$cpt['id'];
        $property_types_map[$key2] = (int)$cpt['id'];
    }

    $validation_results = [];
    $valid_rows_to_process = [];
    $file_seen_combinations = [];

    $total_rows = count($parsed_rows);
    $valid_count = 0;
    $invalid_count = 0;
    $duplicate_count = 0;

    foreach ($parsed_rows as $idx => $row) {
        $row_num = $idx + 2;
        $errors = [];

        $city_name = trim($row['city'] ?? $row['city_name'] ?? '');
        $society_name = trim($row['society'] ?? $row['society_name'] ?? '');
        $phase_name = trim($row['phase'] ?? $row['phase_name'] ?? $row['calculator_phase'] ?? '');
        $block_name = trim($row['block'] ?? $row['block_name'] ?? $row['calculator_block'] ?? '');
        $category = trim($row['category'] ?? '');
        $property_type = trim($row['property type'] ?? $row['property_type'] ?? $row['type'] ?? '');
        $unit_str = trim(strtolower($row['unit'] ?? 'marla'));
        $dc_rate = $row['dc rate'] ?? $row['dc_rate'] ?? $row['dc'] ?? null;
        $fbr_rate = $row['fbr rate'] ?? $row['fbr_rate'] ?? $row['fbr'] ?? null;
        $active_val = $row['active'] ?? $row['is_active'] ?? '1';

        // Validate city exists in DB (cities are not auto-created)
        $city_id = $cities_map[strtolower($city_name)] ?? null;
        if (!$city_id) {
            $errors[] = "City '$city_name' does not exist in the database (Cities must exist prior to import)";
        }

        // Validate society exists in DB (societies are not auto-created)
        $society_id = $societies_map[strtolower($society_name)] ?? null;
        if (!$society_id) {
            $errors[] = "Society '$society_name' does not exist in the database (Societies must exist prior to import)";
        }

        if ($phase_name === '') {
            $errors[] = "Missing required Phase name";
        }

        $prop_type_id = null;
        if ($category !== '' && $property_type !== '') {
            $ptkey = strtolower($category) . '|' . strtolower($property_type);
            $prop_type_id = $property_types_map[$ptkey] ?? null;
        } elseif ($property_type !== '') {
            $prop_type_id = $property_types_map[strtolower($property_type)] ?? null;
        }
        if (!$prop_type_id) {
            $errors[] = "Invalid or missing property type: '$property_type' (Category: '$category'). Must match a system property type.";
        }

        $normalized_unit = (strpos($unit_str, 'sq') !== false || strpos($unit_str, 'ft') !== false) ? 'sqft' : 'marla';

        $dc_num = ($dc_rate !== '' && $dc_rate !== null && is_numeric($dc_rate)) ? (float)$dc_rate : null;
        $fbr_num = ($fbr_rate !== '' && $fbr_rate !== null && is_numeric($fbr_rate)) ? (float)$fbr_rate : null;

        if ($dc_num === null && $fbr_num === null) {
            $errors[] = "At least one of DC Rate or FBR Rate is required and must be numeric";
        }

        $combo_key = strtolower($city_name) . '|' . strtolower($society_name) . '|' . strtolower($phase_name) . '|' . strtolower($block_name) . '|' . ($prop_type_id ?? '0');
        $is_file_duplicate = isset($file_seen_combinations[$combo_key]);
        if ($is_file_duplicate) {
            $errors[] = "Duplicate row inside uploaded file for this location & property type combination";
            $duplicate_count++;
        }
        $file_seen_combinations[$combo_key] = true;

        $is_valid = empty($errors);
        if (!$is_valid) {
            $invalid_count++;
        } else {
            $valid_count++;
            $valid_rows_to_process[] = [
                'city_id' => $city_id,
                'society_id' => $society_id,
                'phase_name' => $phase_name,
                'block_name' => $block_name,
                'calculator_property_type_id' => $prop_type_id,
                'unit' => $normalized_unit,
                'dc_rate' => $dc_num,
                'fbr_rate' => $fbr_num,
                'is_active' => (strtolower($active_val) === '0' || strtolower($active_val) === 'false' || strtolower($active_val) === 'no') ? 0 : 1
            ];
        }

        $validation_results[] = [
            'row' => $row_num,
            'city' => $city_name,
            'society' => $society_name,
            'phase' => $phase_name,
            'block' => $block_name,
            'property_type' => $property_type,
            'is_valid' => $is_valid,
            'is_duplicate' => $is_file_duplicate,
            'errors' => $errors
        ];
    }

    if ($validate_only) {
        return send_json([
            'total_rows' => $total_rows,
            'valid_rows' => $valid_count,
            'invalid_rows' => $invalid_count,
            'duplicate_rows' => $duplicate_count,
            'details' => $validation_results
        ]);
    }

    if ($invalid_count > 0 && empty($valid_rows_to_process)) {
        return send_json(['error' => 'Cannot import: all rows contain validation errors.'], 400);
    }

    try {
        $pdo->beginTransaction();

        $phases_map = [];
        foreach ($pdo->query("SELECT id, city_id, society_id, name FROM calculator_phases")->fetchAll(PDO::FETCH_ASSOC) as $cp) {
            $key = $cp['city_id'] . '|' . $cp['society_id'] . '|' . strtolower(trim($cp['name']));
            $phases_map[$key] = (int)$cp['id'];
        }

        $blocks_map = [];
        foreach ($pdo->query("SELECT id, calculator_phase_id, name FROM calculator_blocks")->fetchAll(PDO::FETCH_ASSOC) as $cb) {
            $key = $cb['calculator_phase_id'] . '|' . strtolower(trim($cb['name']));
            $blocks_map[$key] = (int)$cb['id'];
        }

        $inserted_rates = 0;
        $updated_rates = 0;
        $created_phases = 0;
        $created_blocks = 0;

        foreach ($valid_rows_to_process as $row) {
            $city_id = $row['city_id'];
            $society_id = $row['society_id'];
            $p_name = trim($row['phase_name']);
            $p_name_lower = strtolower($p_name);
            $phase_key = $city_id . '|' . $society_id . '|' . $p_name_lower;

            // Calculator phases ARE auto-created if missing
            if (!isset($phases_map[$phase_key])) {
                $stmt = $pdo->prepare("INSERT INTO calculator_phases (city_id, society_id, name, is_active) VALUES (?, ?, ?, 1)");
                $stmt->execute([$city_id, $society_id, $p_name]);
                $phase_id = (int)$pdo->lastInsertId();
                $phases_map[$phase_key] = $phase_id;
                $created_phases++;
            } else {
                $phase_id = $phases_map[$phase_key];
            }

            $block_id = null;
            $b_name = trim($row['block_name']);
            if ($b_name !== '') {
                $b_name_lower = strtolower($b_name);
                $block_key = $phase_id . '|' . $b_name_lower;
                // Calculator blocks ARE auto-created if missing
                if (!isset($blocks_map[$block_key])) {
                    $stmt = $pdo->prepare("INSERT INTO calculator_blocks (calculator_phase_id, name, is_active) VALUES (?, ?, 1)");
                    $stmt->execute([$phase_id, $b_name]);
                    $block_id = (int)$pdo->lastInsertId();
                    $blocks_map[$block_key] = $block_id;
                    $created_blocks++;
                } else {
                    $block_id = $blocks_map[$block_key];
                }
            }

            $stmt = $pdo->prepare("
                SELECT id FROM calculator_rates
                WHERE calculator_phase_id = ?
                  AND ((calculator_block_id IS NULL AND ? IS NULL) OR calculator_block_id = ?)
                  AND calculator_property_type_id = ?
                LIMIT 1
            ");
            $stmt->execute([$phase_id, $block_id, $block_id, $row['calculator_property_type_id']]);
            $existing_rate = $stmt->fetch(PDO::FETCH_ASSOC);

            $dc_per_marla = ($row['unit'] === 'sqft') ? null : $row['dc_rate'];
            $dc_per_sqft = ($row['unit'] === 'sqft') ? $row['dc_rate'] : null;
            $fbr_per_marla = ($row['unit'] === 'sqft') ? null : $row['fbr_rate'];
            $fbr_per_sqft = ($row['unit'] === 'sqft') ? $row['fbr_rate'] : null;

            if ($existing_rate) {
                $stmt = $pdo->prepare("
                    UPDATE calculator_rates
                    SET
                        dc_per_marla = ?,
                        dc_per_sqft = ?,
                        fbr_per_marla = ?,
                        fbr_per_sqft = ?,
                        is_active = ?
                    WHERE id = ?
                ");
                $stmt->execute([
                    $dc_per_marla,
                    $dc_per_sqft,
                    $fbr_per_marla,
                    $fbr_per_sqft,
                    $row['is_active'],
                    $existing_rate['id']
                ]);
                $updated_rates++;
            } else {
                $stmt = $pdo->prepare("
                    INSERT INTO calculator_rates
                        (calculator_phase_id, calculator_block_id, calculator_property_type_id, dc_per_marla, dc_per_sqft, fbr_per_marla, fbr_per_sqft, is_active)
                    VALUES
                        (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $phase_id,
                    $block_id,
                    $row['calculator_property_type_id'],
                    $dc_per_marla,
                    $dc_per_sqft,
                    $fbr_per_marla,
                    $fbr_per_sqft,
                    $row['is_active']
                ]);
                $inserted_rates++;
            }
        }

        $pdo->commit();

        return send_json([
            'success' => true,
            'message' => "Import completed successfully. Inserted Rates: $inserted_rates, Updated Rates: $updated_rates (Auto-created: $created_phases phases, $created_blocks blocks).",
            'total_rows' => $total_rows,
            'inserted' => $inserted_rates,
            'updated' => $updated_rates
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Calculator rates import transaction error: " . $e->getMessage());
        return send_json(['error' => 'Import transaction failed and rolled back'], 500);
    }
}

function download_sample_template(PDO $pdo) {
    $filename = "calculator_rates_sample.csv";
    $csv_data = "City,Society,Phase,Block,Category,Property Type,Unit,DC Rate,FBR Rate,Active\n";
    $csv_data .= "Lahore,DHA Lahore,Phase 5,,Residential,Plot,Per Marla,500000,450000,1\n";
    $csv_data .= "Lahore,DHA Lahore,Phase 5,Block A,Residential,House,Per Sq. Ft.,2500,2200,1\n";
    $csv_data .= "Lahore,DHA Lahore,Phase 5,Block B,Commercial,Shop,Per Sq. Ft.,5000,4500,1\n";
    $csv_data .= "Islamabad,Bahria Town,Phase 1,,Residential,File,Per Marla,300000,280000,1\n";

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    echo $csv_data;
    exit;
}
