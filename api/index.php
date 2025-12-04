<?php
// api/index.php
ini_set('display_errors','1');
error_reporting(E_ALL);
header('Content-Type: application/json');

// CORS for local dev (adjust production later)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // In production, you should replace '*' with your actual frontend domain
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit;
}
// In production, you should replace '*' with your actual frontend domain
header('Access-Control-Allow-Origin: *');

require __DIR__ . '/config.php';

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$base = '/'; // for php -S when started inside api/
$relative = ltrim(substr($path, strlen($base)), '/');
$segments = array_values(array_filter(explode('/', $relative)));

$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;

if ($resource === '' || $resource === 'ping') {
    echo json_encode(['status' => 'ok']);
    exit;
}

if ($resource === 'products') {
    require __DIR__ . '/routes/products.php';
    handle_products($_SERVER['REQUEST_METHOD'], $pdo, $id);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
