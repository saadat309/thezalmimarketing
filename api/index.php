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

$method = $_SERVER['REQUEST_METHOD'];
// Handle method override for forms that can't use PUT/PATCH directly (e.g., with file uploads)
if ($method === 'POST' && isset($_POST['_method'])) {
    $allowed_methods = ['PUT', 'PATCH', 'DELETE'];
    $override_method = strtoupper($_POST['_method']);
    if (in_array($override_method, $allowed_methods)) {
        $method = $override_method;
    }
}

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
    handle_products($method, $pdo, $id);
    exit;
}

if ($resource === 'categories') {
    require __DIR__ . '/routes/categories.php';
    handle_categories($method, $pdo, $id);
    exit;
}

if ($resource === 'images') {
    require __DIR__ . '/routes/images.php';
    handle_images($method, $pdo, $id);
    exit;
}

// --- Add this block for cities ---
if ($resource === 'cities') {
    require __DIR__ . '/routes/cities.php';
    handle_cities($method, $pdo, $id);
    exit;
}

if ($resource === 'phases') {
    require __DIR__ . '/routes/phases.php';
    handle_phases($method, $pdo, $id);
    exit;
}

if ($resource === 'societies') {
    require __DIR__ . '/routes/societies.php';
    handle_societies($method, $pdo, $id);
    exit;
}

if ($resource === 'maps') {
    require __DIR__ . '/routes/maps.php';
    handle_maps($method, $pdo, $id);
    exit;
}

// --- Add this block for properties ---
if ($resource === 'properties') {
    require __DIR__ . '/routes/properties.php';
    handle_properties($method, $pdo, $id);
    exit;
}
// --- End of new block ---

http_response_code(404);
echo json_encode(['error' => 'Not found']);
