<?php
// api/routes/calculator-transfer-fees.php

define('SPORTS_FUND', 10500);
define('SQFT_PER_MARLA', 225);

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

function parse_csv_file($file_path) {
    $rows = [];
    if (($handle = fopen($file_path, 'r')) !== FALSE) {
        $header = null;
        while (($data = fgetcsv($handle, 1000, ',')) !== FALSE) {
            if (!$header) {
                $header = array_map('trim', array_map('strtolower', $data));
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

function handle_calculator_transfer_fees($method, PDO $pdo, $segments = []) {
    $action = $segments[1] ?? null;

    if ($action === 'import') {
        if ($method === 'POST') {
            return import_calculator_transfer_fees($pdo);
        }
        return send_json(['error' => 'Method not allowed'], 405);
    }

    if ($action === 'template') {
        if ($method === 'GET') {
            return download_transfer_fee_template($pdo);
        }
        return send_json(['error' => 'Method not allowed'], 405);
    }

    $id = is_numeric($action) ? (int)$action : null;

    switch ($method) {
        case 'GET':
            if ($id) return get_calculator_transfer_fee($pdo, $id);
            return list_calculator_transfer_fees($pdo);

        case 'POST':
            return create_calculator_transfer_fee($pdo);

        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_calculator_transfer_fee($pdo, $id);

        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_calculator_transfer_fee($pdo, $id);

        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}

function compute_transfer_fee_derived($row) {
    $ref_amount = (float)($row['reference_amount'] ?? 0);
    $ref_size = (float)($row['reference_size'] ?? 0);
    $unit = strtolower(trim($row['reference_unit'] ?? 'marla'));

    $base_fee = max(0, $ref_amount - SPORTS_FUND);

    if ($unit === 'sqft') {
        $ref_sqft = $ref_size;
        $ref_marla = $ref_size > 0 ? ($ref_size / SQFT_PER_MARLA) : 0;
    } else {
        $ref_marla = $ref_size;
        $ref_sqft = $ref_size * SQFT_PER_MARLA;
    }

    $per_marla_rate = $ref_marla > 0 ? ($base_fee / $ref_marla) : 0;
    $per_sqft_rate = $ref_sqft > 0 ? ($base_fee / $ref_sqft) : 0;

    $row['base_transfer_fee'] = round($base_fee, 2);
    $row['reference_marla'] = round($ref_marla, 4);
    $row['reference_sqft'] = round($ref_sqft, 4);
    $row['per_marla_rate'] = round($per_marla_rate, 2);
    $row['per_sqft_rate'] = round($per_sqft_rate, 4);

    return $row;
}

function list_calculator_transfer_fees(PDO $pdo) {
    $stmt = $pdo->query("
        SELECT
            ctf.id,
            ctf.calculator_phase_id,
            cp.name AS calculator_phase_name,
            cp.city_id,
            c.name AS city_name,
            cp.society_id,
            s.name AS society_name,
            ctf.calculator_block_id,
            cb.name AS calculator_block_name,
            ctf.category,
            ctf.reference_amount,
            ctf.reference_size,
            ctf.reference_unit,
            ctf.is_active,
            ctf.created_at,
            ctf.updated_at
        FROM calculator_transfer_fees ctf
        INNER JOIN calculator_phases cp ON cp.id = ctf.calculator_phase_id
        INNER JOIN cities c ON c.id = cp.city_id
        INNER JOIN societies s ON s.id = cp.society_id
        LEFT JOIN calculator_blocks cb ON cb.id = ctf.calculator_block_id
        ORDER BY cp.sort_order ASC, cp.id DESC, cb.sort_order ASC, ctf.category ASC
    ");

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as &$row) {
        $row = compute_transfer_fee_derived($row);
    }
    unset($row);

    send_json($rows);
}

function get_calculator_transfer_fee(PDO $pdo, $id) {
    $stmt = $pdo->prepare("
        SELECT
            ctf.id,
            ctf.calculator_phase_id,
            cp.name AS calculator_phase_name,
            cp.city_id,
            c.name AS city_name,
            cp.society_id,
            s.name AS society_name,
            ctf.calculator_block_id,
            cb.name AS calculator_block_name,
            ctf.category,
            ctf.reference_amount,
            ctf.reference_size,
            ctf.reference_unit,
            ctf.is_active,
            ctf.created_at,
            ctf.updated_at
        FROM calculator_transfer_fees ctf
        INNER JOIN calculator_phases cp ON cp.id = ctf.calculator_phase_id
        INNER JOIN cities c ON c.id = cp.city_id
        INNER JOIN societies s ON s.id = cp.society_id
        LEFT JOIN calculator_blocks cb ON cb.id = ctf.calculator_block_id
        WHERE ctf.id = ?
    ");

    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        return send_json(['error' => 'Calculator transfer fee not found'], 404);
    }

    $row = compute_transfer_fee_derived($row);
    send_json($row);
}

function parse_transfer_fee_input($input) {
    $calculator_phase_id = isset($input['calculator_phase_id']) ? (int)$input['calculator_phase_id'] : 0;
    $calculator_block_id = !empty($input['calculator_block_id']) ? (int)$input['calculator_block_id'] : null;
    $category = trim($input['category'] ?? 'Residential');
    $reference_amount = isset($input['reference_amount']) && $input['reference_amount'] !== '' ? (float)$input['reference_amount'] : 0;
    $reference_size = isset($input['reference_size']) && $input['reference_size'] !== '' ? (float)$input['reference_size'] : 0;
    $reference_unit = trim(strtolower($input['reference_unit'] ?? 'marla'));
    if (!in_array($reference_unit, ['marla', 'sqft'])) {
        $reference_unit = 'marla';
    }
    $is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;

    return [
        'calculator_phase_id' => $calculator_phase_id,
        'calculator_block_id' => $calculator_block_id,
        'category' => $category,
        'reference_amount' => $reference_amount,
        'reference_size' => $reference_size,
        'reference_unit' => $reference_unit,
        'is_active' => $is_active
    ];
}

function validate_transfer_fee_data($data) {
    $errors = [];
    if (!$data['calculator_phase_id']) {
        $errors[] = 'Calculator phase is required';
    }
    if (empty($data['category'])) {
        $errors[] = 'Category is required';
    }
    if ($data['reference_size'] <= 0) {
        $errors[] = 'Reference size must be greater than 0';
    }
    if ($data['reference_amount'] <= SPORTS_FUND) {
        $errors[] = 'Reference transfer fee amount must be greater than Rs. ' . number_format(SPORTS_FUND) . ' (Sports Fund)';
    }
    return $errors;
}

function create_calculator_transfer_fee(PDO $pdo) {
    $input = get_request_data();
    $data = parse_transfer_fee_input($input);

    $errors = validate_transfer_fee_data($data);
    if (!empty($errors)) {
        return send_json(['error' => implode(', ', $errors)], 400);
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

    $stmt = $pdo->prepare("
        SELECT id FROM calculator_transfer_fees
        WHERE calculator_phase_id = ?
          AND ((calculator_block_id IS NULL AND ? IS NULL) OR calculator_block_id = ?)
          AND category = ?
        LIMIT 1
    ");
    $stmt->execute([
        $data['calculator_phase_id'],
        $data['calculator_block_id'],
        $data['calculator_block_id'],
        $data['category']
    ]);
    if ($stmt->fetch()) {
        return send_json(['error' => 'A transfer fee for this Phase + Block + Category combination already exists'], 409);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO calculator_transfer_fees
                (calculator_phase_id, calculator_block_id, category, reference_amount, reference_size, reference_unit, is_active)
            VALUES
                (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['calculator_phase_id'],
            $data['calculator_block_id'],
            $data['category'],
            $data['reference_amount'],
            $data['reference_size'],
            $data['reference_unit'],
            $data['is_active']
        ]);

        $new_id = $pdo->lastInsertId();
        return get_calculator_transfer_fee($pdo, $new_id);
    } catch (PDOException $e) {
        error_log("Calculator transfer fee create error: " . $e->getMessage());
        return send_json(['error' => 'Insert failed'], 500);
    }
}

function update_calculator_transfer_fee(PDO $pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM calculator_transfer_fees WHERE id = ?");
    $stmt->execute([$id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        return send_json(['error' => 'Calculator transfer fee not found'], 404);
    }

    $input = get_request_data();
    $data = parse_transfer_fee_input($input);

    $calculator_phase_id = array_key_exists('calculator_phase_id', $input) ? (int)$input['calculator_phase_id'] : (int)$existing['calculator_phase_id'];
    $calculator_block_id = array_key_exists('calculator_block_id', $input) ? (!empty($input['calculator_block_id']) ? (int)$input['calculator_block_id'] : null) : $existing['calculator_block_id'];
    $category = array_key_exists('category', $input) ? trim($input['category']) : $existing['category'];
    $reference_amount = array_key_exists('reference_amount', $input) ? (float)$input['reference_amount'] : (float)$existing['reference_amount'];
    $reference_size = array_key_exists('reference_size', $input) ? (float)$input['reference_size'] : (float)$existing['reference_size'];
    $reference_unit = array_key_exists('reference_unit', $input) ? trim(strtolower($input['reference_unit'])) : $existing['reference_unit'];
    $is_active = array_key_exists('is_active', $input) ? (int)$input['is_active'] : (int)$existing['is_active'];

    $merged_data = [
        'calculator_phase_id' => $calculator_phase_id,
        'calculator_block_id' => $calculator_block_id,
        'category' => $category,
        'reference_amount' => $reference_amount,
        'reference_size' => $reference_size,
        'reference_unit' => $reference_unit,
        'is_active' => $is_active
    ];

    $errors = validate_transfer_fee_data($merged_data);
    if (!empty($errors)) {
        return send_json(['error' => implode(', ', $errors)], 400);
    }

    $stmt = $pdo->prepare("
        SELECT id FROM calculator_transfer_fees
        WHERE calculator_phase_id = ?
          AND ((calculator_block_id IS NULL AND ? IS NULL) OR calculator_block_id = ?)
          AND category = ?
          AND id != ?
        LIMIT 1
    ");
    $stmt->execute([
        $calculator_phase_id,
        $calculator_block_id,
        $calculator_block_id,
        $category,
        $id
    ]);
    if ($stmt->fetch()) {
        return send_json(['error' => 'Another transfer fee for this Phase + Block + Category combination already exists'], 409);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE calculator_transfer_fees
            SET
                calculator_phase_id = ?,
                calculator_block_id = ?,
                category = ?,
                reference_amount = ?,
                reference_size = ?,
                reference_unit = ?,
                is_active = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $calculator_phase_id,
            $calculator_block_id,
            $category,
            $reference_amount,
            $reference_size,
            $reference_unit,
            $is_active,
            $id
        ]);

        return get_calculator_transfer_fee($pdo, $id);
    } catch (PDOException $e) {
        error_log("Calculator transfer fee update error: " . $e->getMessage());
        return send_json(['error' => 'Update failed'], 500);
    }
}

function delete_calculator_transfer_fee(PDO $pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM calculator_transfer_fees WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) {
        return send_json(['error' => 'Calculator transfer fee not found'], 404);
    }
    http_response_code(204);
    exit;
}

function import_calculator_transfer_fees(PDO $pdo) {
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

    $cities_map = [];
    foreach ($pdo->query("SELECT id, name FROM cities")->fetchAll(PDO::FETCH_ASSOC) as $c) {
        $cities_map[strtolower(trim($c['name']))] = (int)$c['id'];
    }

    $societies_map = [];
    foreach ($pdo->query("SELECT id, name FROM societies")->fetchAll(PDO::FETCH_ASSOC) as $s) {
        $societies_map[strtolower(trim($s['name']))] = (int)$s['id'];
    }

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
        $ref_size_val = $row['reference size marla'] ?? $row['reference_size_marla'] ?? $row['reference size'] ?? $row['reference_size'] ?? null;
        $ref_unit_str = trim(strtolower($row['reference unit'] ?? $row['reference_unit'] ?? $row['unit'] ?? 'marla'));
        $ref_amount_val = $row['reference transfer fee'] ?? $row['reference_transfer_fee'] ?? $row['reference_amount'] ?? $row['amount'] ?? null;
        $active_val = $row['active'] ?? $row['is_active'] ?? '1';

        $city_id = $cities_map[strtolower($city_name)] ?? null;
        if (!$city_id) {
            $errors[] = "City '$city_name' does not exist in the database (Cities must exist prior to import)";
        }

        $society_id = $societies_map[strtolower($society_name)] ?? null;
        if (!$society_id) {
            $errors[] = "Society '$society_name' does not exist in the database (Societies must exist prior to import)";
        }

        $phase_id = null;
        if ($city_id && $society_id && $phase_name !== '') {
            $phase_key = $city_id . '|' . $society_id . '|' . strtolower($phase_name);
            $phase_id = $phases_map[$phase_key] ?? null;
            if (!$phase_id) {
                $errors[] = "Phase '$phase_name' does not exist in the database for City '$city_name' & Society '$society_name' (Phases must exist prior to import)";
            }
        } elseif ($phase_name === '') {
            $errors[] = "Missing required Phase name";
        }

        $block_id = null;
        if ($phase_id && $block_name !== '') {
            $block_key = $phase_id . '|' . strtolower($block_name);
            $block_id = $blocks_map[$block_key] ?? null;
            if (!$block_id) {
                $errors[] = "Block '$block_name' does not exist in the database for Phase '$phase_name' (Blocks must exist prior to import)";
            }
        }

        if ($category === '') {
            $errors[] = "Missing required Category (e.g. Residential, Commercial, Sector Shop)";
        }

        $ref_size_num = ($ref_size_val !== '' && $ref_size_val !== null && is_numeric($ref_size_val)) ? (float)$ref_size_val : 0;
        if ($ref_size_num <= 0) {
            $errors[] = "Reference size must be greater than 0";
        }

        $ref_amount_num = ($ref_amount_val !== '' && $ref_amount_val !== null && is_numeric($ref_amount_val)) ? (float)$ref_amount_val : 0;
        if ($ref_amount_num <= SPORTS_FUND) {
            $errors[] = "Reference transfer fee must be greater than Rs. 10,500 (Sports Fund)";
        }

        $normalized_unit = (strpos($ref_unit_str, 'sq') !== false || strpos($ref_unit_str, 'ft') !== false) ? 'sqft' : 'marla';

        $combo_key = strtolower($city_name) . '|' . strtolower($society_name) . '|' . strtolower($phase_name) . '|' . strtolower($block_name) . '|' . strtolower($category);
        $is_file_duplicate = isset($file_seen_combinations[$combo_key]);
        if ($is_file_duplicate) {
            $errors[] = "Duplicate row inside uploaded file for this location & category combination";
            $duplicate_count++;
        }
        $file_seen_combinations[$combo_key] = true;

        $is_valid = empty($errors);
        if (!$is_valid) {
            $invalid_count++;
        } else {
            $valid_count++;
            $valid_rows_to_process[] = [
                'calculator_phase_id' => $phase_id,
                'calculator_block_id' => $block_id,
                'category' => $category,
                'reference_size' => $ref_size_num,
                'reference_unit' => $normalized_unit,
                'reference_amount' => $ref_amount_num,
                'is_active' => (strtolower($active_val) === '0' || strtolower($active_val) === 'false' || strtolower($active_val) === 'no') ? 0 : 1
            ];
        }

        $validation_results[] = [
            'row' => $row_num,
            'city' => $city_name,
            'society' => $society_name,
            'phase' => $phase_name,
            'block' => $block_name,
            'category' => $category,
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

        $inserted_count = 0;
        $updated_count = 0;

        foreach ($valid_rows_to_process as $row) {
            $phase_id = $row['calculator_phase_id'];
            $block_id = $row['calculator_block_id'];

            $stmt = $pdo->prepare("
                SELECT id FROM calculator_transfer_fees
                WHERE calculator_phase_id = ?
                  AND ((calculator_block_id IS NULL AND ? IS NULL) OR calculator_block_id = ?)
                  AND category = ?
                LIMIT 1
            ");
            $stmt->execute([$phase_id, $block_id, $block_id, $row['category']]);
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                $stmt = $pdo->prepare("
                    UPDATE calculator_transfer_fees
                    SET
                        reference_amount = ?,
                        reference_size = ?,
                        reference_unit = ?,
                        is_active = ?
                    WHERE id = ?
                ");
                $stmt->execute([
                    $row['reference_amount'],
                    $row['reference_size'],
                    $row['reference_unit'],
                    $row['is_active'],
                    $existing['id']
                ]);
                $updated_count++;
            } else {
                $stmt = $pdo->prepare("
                    INSERT INTO calculator_transfer_fees
                        (calculator_phase_id, calculator_block_id, category, reference_amount, reference_size, reference_unit, is_active)
                    VALUES
                        (?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $phase_id,
                    $block_id,
                    $row['category'],
                    $row['reference_amount'],
                    $row['reference_size'],
                    $row['reference_unit'],
                    $row['is_active']
                ]);
                $inserted_count++;
            }
        }

        $pdo->commit();

        return send_json([
            'success' => true,
            'message' => "Import completed successfully. Inserted: $inserted_count, Updated: $updated_count.",
            'total_rows' => $total_rows,
            'inserted' => $inserted_count,
            'updated' => $updated_count
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Calculator transfer fees import error: " . $e->getMessage());
        return send_json(['error' => 'Import transaction failed and rolled back'], 500);
    }
}

function download_transfer_fee_template(PDO $pdo) {
    $filename = "calculator_transfer_fees_sample.csv";
    $csv_data = "City,Society,Phase,Block,Category,Reference Size,Reference Unit,Reference Transfer Fee,Active\n";
    $csv_data .= "Lahore,DHA Lahore,Phase 5,,Residential,5,Marla,110500,1\n";
    $csv_data .= "Lahore,DHA Lahore,Phase 5,Block A,Residential,10,Marla,210500,1\n";
    $csv_data .= "Lahore,DHA Lahore,Phase 5,Block B,Commercial,4,Marla,310500,1\n";
    $csv_data .= "Islamabad,Bahria Town,Phase 1,,Residential,5,Marla,90500,1\n";

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    echo $csv_data;
    exit;
}
