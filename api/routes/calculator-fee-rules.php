<?php
// api/routes/calculator-fee-rules.php

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

function handle_calculator_fee_rules($method, PDO $pdo, $id = null) {
    try {
        $pdo->exec("ALTER TABLE calculator_fee_rules ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");
    } catch (PDOException $e) {
        // column may already exist
    }

    switch ($method) {
        case 'GET':
            if ($id) return get_calculator_fee_rule($pdo, $id);
            return list_calculator_fee_rules($pdo);

        case 'POST':
            return create_calculator_fee_rule($pdo);

        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_calculator_fee_rule($pdo, $id);

        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_calculator_fee_rule($pdo, $id);

        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}

function list_calculator_fee_rules(PDO $pdo) {
    $stmt = $pdo->query("
        SELECT
            cfr.id,
            cfr.fee_id,
            cf.fee_key,
            cf.fee_name,
            cfr.property_type,
            cfr.unit,
            cfr.min_area,
            cfr.max_area,
            cfr.fee_amount,
            cfr.is_active,
            cfr.created_at,
            cfr.updated_at
        FROM calculator_fee_rules cfr
        INNER JOIN calculator_fees cf ON cf.id = cfr.fee_id
        ORDER BY cfr.fee_id ASC, cfr.property_type ASC, cfr.min_area ASC
    ");
    send_json($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function get_calculator_fee_rule(PDO $pdo, $id) {
    $stmt = $pdo->prepare("
        SELECT
            cfr.id,
            cfr.fee_id,
            cf.fee_key,
            cf.fee_name,
            cfr.property_type,
            cfr.unit,
            cfr.min_area,
            cfr.max_area,
            cfr.fee_amount,
            cfr.is_active,
            cfr.created_at,
            cfr.updated_at
        FROM calculator_fee_rules cfr
        INNER JOIN calculator_fees cf ON cf.id = cfr.fee_id
        WHERE cfr.id = ?
    ");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        return send_json(['error' => 'Calculator fee rule not found'], 404);
    }

    send_json($row);
}

function create_calculator_fee_rule(PDO $pdo) {
    $input = get_request_data();
    $fee_id = isset($input['fee_id']) ? (int)$input['fee_id'] : 0;
    $property_type = trim($input['property_type'] ?? '');
    $unit = trim(strtolower($input['unit'] ?? 'marla'));
    $min_area = isset($input['min_area']) && $input['min_area'] !== '' ? (float)$input['min_area'] : 0;
    $max_area = isset($input['max_area']) && $input['max_area'] !== '' && $input['max_area'] !== 'null' ? (float)$input['max_area'] : null;
    $fee_amount = isset($input['fee_amount']) && $input['fee_amount'] !== '' ? (float)$input['fee_amount'] : 0;
    $is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;

    if (!$fee_id) {
        return send_json(['error' => 'fee_id is required'], 400);
    }
    if (!in_array($property_type, ['Residential', 'Commercial'])) {
        return send_json(['error' => 'property_type must be Residential or Commercial'], 400);
    }
    if (!in_array($unit, ['marla', 'kanal'])) {
        return send_json(['error' => 'unit must be marla or kanal'], 400);
    }
    if ($min_area < 0) {
        return send_json(['error' => 'min_area cannot be negative'], 400);
    }
    if ($max_area !== null && $max_area <= $min_area) {
        return send_json(['error' => 'max_area must be greater than min_area'], 400);
    }
    if ($fee_amount < 0) {
        return send_json(['error' => 'fee_amount cannot be negative'], 400);
    }

    $stmt = $pdo->prepare("SELECT id FROM calculator_fees WHERE id = ?");
    $stmt->execute([$fee_id]);
    if (!$stmt->fetch()) {
        return send_json(['error' => 'Selected calculator fee does not exist'], 404);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO calculator_fee_rules
                (fee_id, property_type, unit, min_area, max_area, fee_amount, is_active)
            VALUES
                (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$fee_id, $property_type, $unit, $min_area, $max_area, $fee_amount, $is_active]);
        $new_id = $pdo->lastInsertId();
        return get_calculator_fee_rule($pdo, $new_id);
    } catch (PDOException $e) {
        error_log("Calculator fee rule create error: " . $e->getMessage());
        return send_json(['error' => 'Insert failed: ' . $e->getMessage()], 500);
    }
}

function update_calculator_fee_rule(PDO $pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM calculator_fee_rules WHERE id = ?");
    $stmt->execute([$id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        return send_json(['error' => 'Calculator fee rule not found'], 404);
    }

    $input = get_request_data();
    $fee_id = isset($input['fee_id']) ? (int)$input['fee_id'] : (int)$existing['fee_id'];
    $property_type = isset($input['property_type']) ? trim($input['property_type']) : $existing['property_type'];
    $unit = isset($input['unit']) ? trim(strtolower($input['unit'])) : $existing['unit'];
    $min_area = isset($input['min_area']) && $input['min_area'] !== '' ? (float)$input['min_area'] : (float)$existing['min_area'];
    $max_area = array_key_exists('max_area', $input) 
        ? ($input['max_area'] === '' || $input['max_area'] === null || $input['max_area'] === 'null' ? null : (float)$input['max_area'])
        : $existing['max_area'];
    $fee_amount = isset($input['fee_amount']) && $input['fee_amount'] !== '' ? (float)$input['fee_amount'] : (float)$existing['fee_amount'];
    $is_active = isset($input['is_active']) ? (int)$input['is_active'] : (int)$existing['is_active'];

    if (!in_array($property_type, ['Residential', 'Commercial'])) {
        return send_json(['error' => 'property_type must be Residential or Commercial'], 400);
    }
    if (!in_array($unit, ['marla', 'kanal'])) {
        return send_json(['error' => 'unit must be marla or kanal'], 400);
    }
    if ($min_area < 0) {
        return send_json(['error' => 'min_area cannot be negative'], 400);
    }
    if ($max_area !== null && $max_area <= $min_area) {
        return send_json(['error' => 'max_area must be greater than min_area'], 400);
    }
    if ($fee_amount < 0) {
        return send_json(['error' => 'fee_amount cannot be negative'], 400);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE calculator_fee_rules
            SET
                fee_id = ?,
                property_type = ?,
                unit = ?,
                min_area = ?,
                max_area = ?,
                fee_amount = ?,
                is_active = ?
            WHERE id = ?
        ");
        $stmt->execute([$fee_id, $property_type, $unit, $min_area, $max_area, $fee_amount, $is_active, $id]);
        return get_calculator_fee_rule($pdo, $id);
    } catch (PDOException $e) {
        error_log("Calculator fee rule update error: " . $e->getMessage());
        return send_json(['error' => 'Update failed: ' . $e->getMessage()], 500);
    }
}

function delete_calculator_fee_rule(PDO $pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM calculator_fee_rules WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) {
        return send_json(['error' => 'Calculator fee rule not found'], 404);
    }
    http_response_code(204);
    exit;
}
