<?php
// api/routes/roles.php

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

function handle_roles($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_role($pdo, $id);
            return list_roles($pdo);
        default:
            return send_json(['error' => 'Method not allowed for roles. Only GET is supported.'], 405);
    }
}

function list_roles(PDO $pdo) {
    $stmt = $pdo->query("SELECT id, name FROM roles ORDER BY priority ASC"); // Order by priority might be useful
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    send_json($rows);
}

function get_role(PDO $pdo, $id) {
    $stmt = $pdo->prepare("SELECT id, name FROM roles WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return send_json(['error' => 'Role not found'], 404);
    send_json($row);
}
