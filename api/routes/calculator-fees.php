<?php
// api/routes/calculator-fees.php

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

function handle_calculator_fees($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_calculator_fee($pdo, $id);
            return list_calculator_fees($pdo);

        case 'POST':
            return create_calculator_fee($pdo);

        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_calculator_fee($pdo, $id);

        case 'DELETE':
            return send_json(['error' => 'Deleting calculator fees is not allowed.'], 405);

        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}

function list_calculator_fees(PDO $pdo) {
    $stmt = $pdo->query("
        SELECT
            id,
            fee_key,
            fee_name,
            amount,
            charge_unit,
            is_active,
            created_at,
            updated_at
        FROM calculator_fees
        ORDER BY id ASC
    ");
    send_json($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function get_calculator_fee(PDO $pdo, $id) {
    $stmt = $pdo->prepare("
        SELECT
            id,
            fee_key,
            fee_name,
            amount,
            charge_unit,
            is_active,
            created_at,
            updated_at
        FROM calculator_fees
        WHERE id = ?
    ");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        return send_json(['error' => 'Calculator fee not found'], 404);
    }

    send_json($row);
}

function create_calculator_fee(PDO $pdo) {
    $input = get_request_data();
    $fee_key = trim($input['fee_key'] ?? '');
    $fee_name = trim($input['fee_name'] ?? '');
    $amount = isset($input['amount']) && $input['amount'] !== '' ? (float)$input['amount'] : 0;
    $charge_unit = trim($input['charge_unit'] ?? 'transaction');
    $is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;

    if ($fee_key === '') {
        return send_json(['error' => 'fee_key is required'], 400);
    }
    if ($fee_name === '') {
        return send_json(['error' => 'fee_name is required'], 400);
    }
    if ($amount < 0) {
        return send_json(['error' => 'Fee amount must be non-negative (>= 0)'], 400);
    }
    if (!in_array($charge_unit, ['transaction', 'property', 'owner'])) {
        $charge_unit = 'transaction';
    }

    $stmt = $pdo->prepare("SELECT id FROM calculator_fees WHERE fee_key = ?");
    $stmt->execute([$fee_key]);
    if ($stmt->fetch()) {
        return send_json(['error' => 'A fee with this fee_key already exists'], 409);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO calculator_fees
                (fee_key, fee_name, amount, charge_unit, is_active)
            VALUES
                (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$fee_key, $fee_name, $amount, $charge_unit, $is_active]);
        $new_id = $pdo->lastInsertId();
        return get_calculator_fee($pdo, $new_id);
    } catch (PDOException $e) {
        error_log("Calculator fee create error: " . $e->getMessage());
        return send_json(['error' => 'Insert failed'], 500);
    }
}

function update_calculator_fee(PDO $pdo, $id) {
    $input = get_request_data();

    $stmt = $pdo->prepare("SELECT * FROM calculator_fees WHERE id = ?");
    $stmt->execute([$id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        return send_json(['error' => 'Calculator fee not found'], 404);
    }

    $fee_name = array_key_exists('fee_name', $input) ? trim($input['fee_name']) : $existing['fee_name'];
    $amount = array_key_exists('amount', $input) && $input['amount'] !== '' ? (float)$input['amount'] : (float)$existing['amount'];
    $is_active = isset($input['is_active']) ? (int)$input['is_active'] : (int)$existing['is_active'];

    if ($amount < 0) {
        return send_json(['error' => 'Fee amount must be non-negative (>= 0)'], 400);
    }

    if ($fee_name === '') {
        return send_json(['error' => 'fee_name is required'], 400);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE calculator_fees
            SET
                fee_name = ?,
                amount = ?,
                is_active = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $fee_name,
            $amount,
            $is_active,
            $id
        ]);

        return get_calculator_fee($pdo, $id);
    } catch (PDOException $e) {
        error_log("Calculator fee update error: " . $e->getMessage());
        return send_json(['error' => 'Update failed'], 500);
    }
}
