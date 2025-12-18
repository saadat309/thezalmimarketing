<?php
// api/utils/auth_middleware.php

require_once __DIR__ . '/jwt_util.php';

if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

function authenticate_request(PDO $pdo): ?array {
    $headers = getallheaders();
    $auth_header = null;
    if (isset($headers['Authorization'])) {
        $auth_header = $headers['Authorization'];
    } else {
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $auth_header = $value;
                break;
            }
        }
    }

    if (!$auth_header || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    $jwt_token = $matches[1];
    $payload = validate_jwt($jwt_token);

    if (!$payload || !isset($payload['user_id'])) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }

    // Optional: Re-fetch user to ensure they still exist and are active
    $stmt = $pdo->prepare("SELECT id, status, role_id FROM users WHERE id = ?");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || $user['status'] !== 'active') {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'User account is inactive or not found']);
        exit;
    }

    // Get role name
    $stmt = $pdo->prepare("SELECT name FROM roles WHERE id = ?");
    $stmt->execute([$user['role_id']]);
    $role = $stmt->fetch(PDO::FETCH_ASSOC);
    $user['role_name'] = $role ? $role['name'] : null;

    return $user; // Returns user array with id, status, role_id, role_name
}
