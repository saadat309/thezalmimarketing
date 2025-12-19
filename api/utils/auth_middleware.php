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
    $auth_header = null;
    
    // 1. Try apache_request_headers() - most reliable on Apache
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        foreach ($headers as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) {
                $auth_header = $value;
                break;
            }
        }
    }

    // 2. Try getallheaders() as fallback
    if (!$auth_header && function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) {
                $auth_header = $value;
                break;
            }
        }
    }

    // 3. Comprehensive scan of $_SERVER
    if (!$auth_header) {
        $server_keys = [
            'HTTP_AUTHORIZATION',
            'REDIRECT_HTTP_AUTHORIZATION',
            'AUTHORIZATION',
            'REDIRECT_AUTHORIZATION',
            'PHP_AUTH_AUTHORIZATION',
            'REDIRECT_REDIRECT_HTTP_AUTHORIZATION'
        ];
        foreach ($server_keys as $key) {
            if (isset($_SERVER[$key]) && !empty($_SERVER[$key])) {
                $auth_header = $_SERVER[$key];
                break;
            }
        }
        
        if (!$auth_header) {
            foreach ($_SERVER as $key => $value) {
                if (stripos($key, 'AUTHORIZATION') !== false && !empty($value)) {
                    $auth_header = $value;
                    break;
                }
            }
        }
    }

    // 4. Custom Header Bypass (X-Auth-Token)
    if (!$auth_header && isset($_SERVER['HTTP_X_AUTH_TOKEN']) && !empty($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        $auth_header = 'Bearer ' . trim($_SERVER['HTTP_X_AUTH_TOKEN']);
    }

    if (!$auth_header || !preg_match('/Bearer\s(\S+)/i', $auth_header, $matches)) {
        // Collect ALL HTTP headers for deep debugging
        $received_http_headers = [];
        foreach ($_SERVER as $key => $value) {
            if (substr($key, 0, 5) === 'HTTP_') {
                $received_http_headers[] = $key;
            }
        }

        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => 'Authentication required', 
            'detail' => 'Authorization header missing or invalid format',
            'debug_info' => [
                'header_found' => !empty($auth_header),
                'available_http_headers' => $received_http_headers,
                'method' => $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN',
                'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'UNKNOWN'
            ]
        ]);
        exit;
    }

    $jwt_token = $matches[1];
    $payload = validate_jwt($jwt_token);

    if (!$payload || !isset($payload['user_id'])) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => 'Invalid or expired token',
            'detail' => 'The provided token could not be validated'
        ]);
        exit;
    }

    // Fetch user to ensure they still exist and are active
    $stmt = $pdo->prepare("SELECT id, status, role_id FROM users WHERE id = ?");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Unauthorized', 'detail' => 'User account not found']);
        exit;
    }

    if ($user['status'] !== 'active') {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Unauthorized', 'detail' => 'User account is inactive or blocked']);
        exit;
    }

    // Get role name
    $stmt = $pdo->prepare("SELECT name FROM roles WHERE id = ?");
    $stmt->execute([$user['role_id']]);
    $role = $stmt->fetch(PDO::FETCH_ASSOC);
    $user['role_name'] = $role ? $role['name'] : null;

    return $user;
}
