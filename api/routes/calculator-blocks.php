<?php
// api/routes/calculator-blocks.php

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

function handle_calculator_blocks($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_calculator_block($pdo, $id);
            return list_calculator_blocks($pdo);

        case 'POST':
            return create_calculator_block($pdo);

        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_calculator_block($pdo, $id);

        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_calculator_block($pdo, $id);

        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}


function list_calculator_blocks(PDO $pdo) {
    $stmt = $pdo->query("
        SELECT
            cb.id,
            cb.calculator_phase_id,
            cp.name AS calculator_phase_name,
            cp.city_id,
            c.name AS city_name,
            cp.society_id,
            s.name AS society_name,
            cb.name,
            cb.sort_order,
            cb.is_active,
            cb.created_at,
            cb.updated_at
        FROM calculator_blocks cb
        INNER JOIN calculator_phases cp ON cp.id = cb.calculator_phase_id
        INNER JOIN cities c ON c.id = cp.city_id
        INNER JOIN societies s ON s.id = cp.society_id
        ORDER BY cb.sort_order ASC, cb.id DESC
    ");

    send_json($stmt->fetchAll(PDO::FETCH_ASSOC));
}


function get_calculator_block(PDO $pdo, $id) {
    $stmt = $pdo->prepare("
        SELECT
            cb.id,
            cb.calculator_phase_id,
            cp.name AS calculator_phase_name,
            cp.city_id,
            c.name AS city_name,
            cp.society_id,
            s.name AS society_name,
            cb.name,
            cb.sort_order,
            cb.is_active,
            cb.created_at,
            cb.updated_at
        FROM calculator_blocks cb
        INNER JOIN calculator_phases cp ON cp.id = cb.calculator_phase_id
        INNER JOIN cities c ON c.id = cp.city_id
        INNER JOIN societies s ON s.id = cp.society_id
        WHERE cb.id = ?
    ");

    $stmt->execute([$id]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        return send_json(['error' => 'Calculator block not found'], 404);
    }

    send_json($row);
}


function create_calculator_block(PDO $pdo) {
    $input = get_request_data();

    $calculator_phase_id = isset($input['calculator_phase_id']) ? (int)$input['calculator_phase_id'] : 0;
    $name = trim($input['name'] ?? '');
    $sort_order = isset($input['sort_order']) ? (int)$input['sort_order'] : 0;
    $is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;

    if (!$calculator_phase_id) {
        return send_json(['error' => 'calculator_phase_id is required'], 400);
    }

    if ($name === '') {
        return send_json(['error' => 'name is required'], 400);
    }

    // Verify calculator phase exists
    $stmt = $pdo->prepare("SELECT id FROM calculator_phases WHERE id = ?");
    $stmt->execute([$calculator_phase_id]);

    if (!$stmt->fetch()) {
        return send_json(['error' => 'Calculator phase not found'], 404);
    }

    // Prevent duplicate block name within the same calculator phase
    $stmt = $pdo->prepare("
        SELECT id
        FROM calculator_blocks
        WHERE calculator_phase_id = ?
          AND name = ?
        LIMIT 1
    ");

    $stmt->execute([$calculator_phase_id, $name]);

    if ($stmt->fetch()) {
        return send_json([
            'error' => 'Calculator block already exists for this calculator phase'
        ], 409);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO calculator_blocks
                (calculator_phase_id, name, sort_order, is_active)
            VALUES
                (?, ?, ?, ?)
        ");

        $stmt->execute([
            $calculator_phase_id,
            $name,
            $sort_order,
            $is_active
        ]);

        $new_id = $pdo->lastInsertId();

        $stmt = $pdo->prepare("
            SELECT
                cb.id,
                cb.calculator_phase_id,
                cp.name AS calculator_phase_name,
                cp.city_id,
                c.name AS city_name,
                cp.society_id,
                s.name AS society_name,
                cb.name,
                cb.sort_order,
                cb.is_active,
                cb.created_at,
                cb.updated_at
            FROM calculator_blocks cb
            INNER JOIN calculator_phases cp ON cp.id = cb.calculator_phase_id
            INNER JOIN cities c ON c.id = cp.city_id
            INNER JOIN societies s ON s.id = cp.society_id
            WHERE cb.id = ?
        ");

        $stmt->execute([$new_id]);

        return send_json($stmt->fetch(PDO::FETCH_ASSOC), 201);

    } catch (PDOException $e) {
        error_log("Calculator block create error: " . $e->getMessage());

        return send_json([
            'error' => 'Insert failed'
        ], 500);
    }
}


function update_calculator_block(PDO $pdo, $id) {
    $input = get_request_data();

    $stmt = $pdo->prepare("
        SELECT *
        FROM calculator_blocks
        WHERE id = ?
    ");

    $stmt->execute([$id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        return send_json(['error' => 'Calculator block not found'], 404);
    }

    $calculator_phase_id = isset($input['calculator_phase_id'])
        ? (int)$input['calculator_phase_id']
        : (int)$existing['calculator_phase_id'];

    $name = array_key_exists('name', $input)
        ? trim($input['name'])
        : $existing['name'];

    $sort_order = isset($input['sort_order'])
        ? (int)$input['sort_order']
        : (int)$existing['sort_order'];

    $is_active = isset($input['is_active'])
        ? (int)$input['is_active']
        : (int)$existing['is_active'];

    if (!$calculator_phase_id || $name === '') {
        return send_json([
            'error' => 'calculator_phase_id and name are required'
        ], 400);
    }

    // Verify calculator phase exists if changed
    if ($calculator_phase_id !== (int)$existing['calculator_phase_id']) {
        $stmt = $pdo->prepare("SELECT id FROM calculator_phases WHERE id = ?");
        $stmt->execute([$calculator_phase_id]);
        if (!$stmt->fetch()) {
            return send_json(['error' => 'Calculator phase not found'], 404);
        }
    }

    // Prevent duplicate within the same calculator phase
    $stmt = $pdo->prepare("
        SELECT id
        FROM calculator_blocks
        WHERE calculator_phase_id = ?
          AND name = ?
          AND id != ?
        LIMIT 1
    ");

    $stmt->execute([
        $calculator_phase_id,
        $name,
        $id
    ]);

    if ($stmt->fetch()) {
        return send_json([
            'error' => 'Another calculator block with this name already exists in this calculator phase'
        ], 409);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE calculator_blocks
            SET
                calculator_phase_id = ?,
                name = ?,
                sort_order = ?,
                is_active = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $calculator_phase_id,
            $name,
            $sort_order,
            $is_active,
            $id
        ]);

        return get_calculator_block($pdo, $id);

    } catch (PDOException $e) {
        error_log("Calculator block update error: " . $e->getMessage());

        return send_json([
            'error' => 'Update failed'
        ], 500);
    }
}


function delete_calculator_block(PDO $pdo, $id) {
    try {
        $stmt = $pdo->prepare("
            DELETE FROM calculator_blocks
            WHERE id = ?
        ");

        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            return send_json([
                'error' => 'Calculator block not found'
            ], 404);
        }

        http_response_code(204);
        exit;

    } catch (PDOException $e) {
        error_log("Calculator block delete error: " . $e->getMessage());

        return send_json([
            'error' => 'Delete failed'
        ], 500);
    }
}
