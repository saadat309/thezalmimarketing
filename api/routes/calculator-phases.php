<?php
// api/routes/calculator-phases.php

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

function handle_calculator_phases($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_calculator_phase($pdo, $id);
            return list_calculator_phases($pdo);

        case 'POST':
            return create_calculator_phase($pdo);

        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_calculator_phase($pdo, $id);

        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_calculator_phase($pdo, $id);

        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}


function list_calculator_phases(PDO $pdo) {
    $stmt = $pdo->query("
        SELECT
            cp.id,
            cp.city_id,
            c.name AS city_name,
            cp.society_id,
            s.name AS society_name,
            cp.name,
            cp.sort_order,
            cp.is_active,
            cp.created_at,
            cp.updated_at
        FROM calculator_phases cp
        INNER JOIN cities c ON c.id = cp.city_id
        INNER JOIN societies s ON s.id = cp.society_id
        ORDER BY cp.sort_order ASC, cp.id DESC
    ");

    send_json($stmt->fetchAll(PDO::FETCH_ASSOC));
}


function get_calculator_phase(PDO $pdo, $id) {
    $stmt = $pdo->prepare("
        SELECT
            cp.id,
            cp.city_id,
            c.name AS city_name,
            cp.society_id,
            s.name AS society_name,
            cp.name,
            cp.sort_order,
            cp.is_active,
            cp.created_at,
            cp.updated_at
        FROM calculator_phases cp
        INNER JOIN cities c ON c.id = cp.city_id
        INNER JOIN societies s ON s.id = cp.society_id
        WHERE cp.id = ?
    ");

    $stmt->execute([$id]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        return send_json(['error' => 'Calculator phase not found'], 404);
    }

    send_json($row);
}


function create_calculator_phase(PDO $pdo) {
    $input = get_request_data();

    $city_id = isset($input['city_id']) ? (int)$input['city_id'] : 0;
    $society_id = isset($input['society_id']) ? (int)$input['society_id'] : 0;
    $name = trim($input['name'] ?? '');
    $sort_order = isset($input['sort_order']) ? (int)$input['sort_order'] : 0;
    $is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;

    if (!$city_id) {
        return send_json(['error' => 'city_id is required'], 400);
    }

    if (!$society_id) {
        return send_json(['error' => 'society_id is required'], 400);
    }

    if ($name === '') {
        return send_json(['error' => 'name is required'], 400);
    }

    // Verify city
    $stmt = $pdo->prepare("SELECT id FROM cities WHERE id = ?");
    $stmt->execute([$city_id]);

    if (!$stmt->fetch()) {
        return send_json(['error' => 'City not found'], 404);
    }

    // Verify society
    $stmt = $pdo->prepare("SELECT id FROM societies WHERE id = ?");
    $stmt->execute([$society_id]);

    if (!$stmt->fetch()) {
        return send_json(['error' => 'Society not found'], 404);
    }

    // Prevent duplicate
    $stmt = $pdo->prepare("
        SELECT id
        FROM calculator_phases
        WHERE city_id = ?
          AND society_id = ?
          AND name = ?
        LIMIT 1
    ");

    $stmt->execute([$city_id, $society_id, $name]);

    if ($stmt->fetch()) {
        return send_json([
            'error' => 'Calculator phase already exists for this city and society'
        ], 409);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO calculator_phases
                (city_id, society_id, name, sort_order, is_active)
            VALUES
                (?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $city_id,
            $society_id,
            $name,
            $sort_order,
            $is_active
        ]);

        $new_id = $pdo->lastInsertId();

        $stmt = $pdo->prepare("
            SELECT
                cp.id,
                cp.city_id,
                c.name AS city_name,
                cp.society_id,
                s.name AS society_name,
                cp.name,
                cp.sort_order,
                cp.is_active,
                cp.created_at,
                cp.updated_at
            FROM calculator_phases cp
            INNER JOIN cities c ON c.id = cp.city_id
            INNER JOIN societies s ON s.id = cp.society_id
            WHERE cp.id = ?
        ");

        $stmt->execute([$new_id]);

        return send_json($stmt->fetch(PDO::FETCH_ASSOC), 201);

    } catch (PDOException $e) {
        error_log("Calculator phase create error: " . $e->getMessage());

        return send_json([
            'error' => 'Insert failed'
        ], 500);
    }
}


function update_calculator_phase(PDO $pdo, $id) {
    $input = get_request_data();

    $stmt = $pdo->prepare("
        SELECT *
        FROM calculator_phases
        WHERE id = ?
    ");

    $stmt->execute([$id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        return send_json(['error' => 'Calculator phase not found'], 404);
    }

    $city_id = isset($input['city_id'])
        ? (int)$input['city_id']
        : (int)$existing['city_id'];

    $society_id = isset($input['society_id'])
        ? (int)$input['society_id']
        : (int)$existing['society_id'];

    $name = array_key_exists('name', $input)
        ? trim($input['name'])
        : $existing['name'];

    $sort_order = isset($input['sort_order'])
        ? (int)$input['sort_order']
        : (int)$existing['sort_order'];

    $is_active = isset($input['is_active'])
        ? (int)$input['is_active']
        : (int)$existing['is_active'];

    if (!$city_id || !$society_id || $name === '') {
        return send_json([
            'error' => 'city_id, society_id and name are required'
        ], 400);
    }

    // Prevent duplicate
    $stmt = $pdo->prepare("
        SELECT id
        FROM calculator_phases
        WHERE city_id = ?
          AND society_id = ?
          AND name = ?
          AND id != ?
        LIMIT 1
    ");

    $stmt->execute([
        $city_id,
        $society_id,
        $name,
        $id
    ]);

    if ($stmt->fetch()) {
        return send_json([
            'error' => 'Another calculator phase with this name already exists'
        ], 409);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE calculator_phases
            SET
                city_id = ?,
                society_id = ?,
                name = ?,
                sort_order = ?,
                is_active = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $city_id,
            $society_id,
            $name,
            $sort_order,
            $is_active,
            $id
        ]);

        return get_calculator_phase($pdo, $id);

    } catch (PDOException $e) {
        error_log("Calculator phase update error: " . $e->getMessage());

        return send_json([
            'error' => 'Update failed'
        ], 500);
    }
}


function delete_calculator_phase(PDO $pdo, $id) {
    try {
        $stmt = $pdo->prepare("
            DELETE FROM calculator_phases
            WHERE id = ?
        ");

        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            return send_json([
                'error' => 'Calculator phase not found'
            ], 404);
        }

        http_response_code(204);
        exit;

    } catch (PDOException $e) {
        error_log("Calculator phase delete error: " . $e->getMessage());

        return send_json([
            'error' => 'Delete failed'
        ], 500);
    }
}
