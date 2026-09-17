<?php
// api/routes/calculator-tax-rates.php

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

function handle_calculator_tax_rates($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_calculator_tax_rate($pdo, $id);
            return list_calculator_tax_rates($pdo);

        case 'POST':
            return create_calculator_tax_rate($pdo);

        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_calculator_tax_rate($pdo, $id);

        case 'DELETE':
            return send_json(['error' => 'Deleting calculator tax rates is not allowed.'], 405);

        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}

function list_calculator_tax_rates(PDO $pdo) {
    $stmt = $pdo->query("
        SELECT
            id,
            rate_key,
            rate_name,
            rate,
            rate_unit,
            is_active,
            created_at,
            updated_at
        FROM calculator_tax_rates
        ORDER BY id ASC
    ");
    send_json($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function get_calculator_tax_rate(PDO $pdo, $id) {
    $stmt = $pdo->prepare("
        SELECT
            id,
            rate_key,
            rate_name,
            rate,
            rate_unit,
            is_active,
            created_at,
            updated_at
        FROM calculator_tax_rates
        WHERE id = ?
    ");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        return send_json(['error' => 'Calculator tax rate not found'], 404);
    }

    send_json($row);
}

function create_calculator_tax_rate(PDO $pdo) {
    $input = get_request_data();
    $rate_key = trim($input['rate_key'] ?? '');
    $rate_name = trim($input['rate_name'] ?? '');
    $rate = isset($input['rate']) && $input['rate'] !== '' ? (float)$input['rate'] : 0;
    $rate_unit = trim($input['rate_unit'] ?? 'percent');
    $is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;

    if ($rate_key === '') {
        return send_json(['error' => 'rate_key is required'], 400);
    }
    if ($rate_name === '') {
        return send_json(['error' => 'rate_name is required'], 400);
    }
    if (!is_numeric($rate) || $rate < 0) {
        return send_json(['error' => 'Rate percentage must be a valid non-negative number'], 400);
    }

    $stmt = $pdo->prepare("SELECT id FROM calculator_tax_rates WHERE rate_key = ?");
    $stmt->execute([$rate_key]);
    if ($stmt->fetch()) {
        return send_json(['error' => 'A tax rate with this rate_key already exists'], 409);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO calculator_tax_rates
                (rate_key, rate_name, rate, rate_unit, is_active)
            VALUES
                (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$rate_key, $rate_name, $rate, $rate_unit, $is_active]);
        $new_id = $pdo->lastInsertId();
        return get_calculator_tax_rate($pdo, $new_id);
    } catch (PDOException $e) {
        error_log("Calculator tax rate create error: " . $e->getMessage());
        return send_json(['error' => 'Insert failed'], 500);
    }
}

function update_calculator_tax_rate(PDO $pdo, $id) {
    $input = get_request_data();

    $stmt = $pdo->prepare("SELECT * FROM calculator_tax_rates WHERE id = ?");
    $stmt->execute([$id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        return send_json(['error' => 'Calculator tax rate not found'], 404);
    }

    $rate_name = array_key_exists('rate_name', $input) ? trim($input['rate_name']) : $existing['rate_name'];
    $rate = array_key_exists('rate', $input) && $input['rate'] !== '' ? (float)$input['rate'] : (float)$existing['rate'];
    $is_active = isset($input['is_active']) ? (int)$input['is_active'] : (int)$existing['is_active'];

    if (!is_numeric($rate) || $rate < 0) {
        return send_json(['error' => 'Rate percentage must be a valid non-negative number'], 400);
    }

    if ($rate_name === '') {
        return send_json(['error' => 'rate_name is required'], 400);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE calculator_tax_rates
            SET
                rate_name = ?,
                rate = ?,
                is_active = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $rate_name,
            $rate,
            $is_active,
            $id
        ]);

        return get_calculator_tax_rate($pdo, $id);
    } catch (PDOException $e) {
        error_log("Calculator tax rate update error: " . $e->getMessage());
        return send_json(['error' => 'Update failed'], 500);
    }
}
