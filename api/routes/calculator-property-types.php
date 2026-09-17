<?php
// api/routes/calculator-property-types.php

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

function handle_calculator_property_types($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_calculator_property_type($pdo, $id);
            return list_calculator_property_types($pdo);

        case 'POST':
            return send_json(['error' => 'Adding new calculator property types is not allowed. These are fixed system records.'], 405);

        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_calculator_property_type($pdo, $id);

        case 'DELETE':
            return send_json(['error' => 'Deleting calculator property types is not allowed. These are fixed system records.'], 405);

        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}


function list_calculator_property_types(PDO $pdo) {
    $stmt = $pdo->query("
        SELECT
            id,
            category,
            property_type,
            label,
            sort_order,
            is_active,
            created_at,
            updated_at
        FROM calculator_property_types
        ORDER BY sort_order ASC, id ASC
    ");

    send_json($stmt->fetchAll(PDO::FETCH_ASSOC));
}


function get_calculator_property_type(PDO $pdo, $id) {
    $stmt = $pdo->prepare("
        SELECT
            id,
            category,
            property_type,
            label,
            sort_order,
            is_active,
            created_at,
            updated_at
        FROM calculator_property_types
        WHERE id = ?
    ");

    $stmt->execute([$id]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        return send_json(['error' => 'Calculator property type not found'], 404);
    }

    send_json($row);
}


function update_calculator_property_type(PDO $pdo, $id) {
    $input = get_request_data();

    $stmt = $pdo->prepare("
        SELECT *
        FROM calculator_property_types
        WHERE id = ?
    ");

    $stmt->execute([$id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        return send_json(['error' => 'Calculator property type not found'], 404);
    }

    // Category and property_type are fixed system configuration records and cannot be changed.
    $category = $existing['category'];
    $property_type = $existing['property_type'];

    $label = array_key_exists('label', $input)
        ? trim($input['label'])
        : $existing['label'];

    $sort_order = isset($input['sort_order'])
        ? (int)$input['sort_order']
        : (int)$existing['sort_order'];

    $is_active = isset($input['is_active'])
        ? (int)$input['is_active']
        : (int)$existing['is_active'];

    if ($label === '') {
        return send_json([
            'error' => 'label is required'
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE calculator_property_types
            SET
                label = ?,
                sort_order = ?,
                is_active = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $label,
            $sort_order,
            $is_active,
            $id
        ]);

        return get_calculator_property_type($pdo, $id);

    } catch (PDOException $e) {
        error_log("Calculator property type update error: " . $e->getMessage());

        return send_json([
            'error' => 'Update failed'
        ], 500);
    }
}
