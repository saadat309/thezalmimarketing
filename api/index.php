<?php
// api/index.php
header('Content-Type: application/json');

require __DIR__ . '/config.php';

// CORS Configuration
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origin = FRONTEND_URL;

if ($origin === $allowed_origin || APP_ENV !== 'production') {
    header("Access-Control-Allow-Origin: $origin");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit;
}

require_once __DIR__ . '/utils/auth_middleware.php'; // Include auth middleware

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
// Normalize path by removing the base directory if it exists (e.g., /api/)
$relative = ltrim($path, '/');
$segments = array_values(array_filter(explode('/', $relative)));

// If the first segment is 'api', skip it to get the actual resource
if (!empty($segments) && $segments[0] === 'api') {
    array_shift($segments);
}

$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;

if ($resource === '' || $resource === 'ping') {
    echo json_encode(['status' => 'ok']);
    exit;
}

// --- Protected Routes Logic ---
$user = null; // Default to null (unauthenticated)

// 1. Users & Roles: Always Protected
if (in_array($resource, ['users', 'roles'])) {
    $user = authenticate_request($pdo);
}

// 2. Queries: Protected except POST (contact form)
if ($resource === 'queries' && $method !== 'POST') {
    $user = authenticate_request($pdo);
}

// 3. Content Management (Properties, Maps, etc.): Protected for modifications
// Assuming GET is public for frontend website
$content_resources = ['products', 'categories', 'images', 'cities', 'phases', 'societies', 'maps', 'properties', 'files', 'labels', 'landing-sections' ];
if (in_array($resource, $content_resources) && in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    $user = authenticate_request($pdo);
}

// 4. Auth: Special handling inside route (me needs auth, login doesn't)
// handled inside auth.php or by specific check if needed.
// actually auth/me IS protected.
if ($resource === 'auth' && $id === 'me') {
   // auth.php handles its own auth check for 'me', but we could unify it.
   // For now, let's leave auth.php as is or rely on its internal check.
   // auth.php's `get_my_profile` and `update_my_profile` call `get_authenticated_user_id`.
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

// --- Add this block for files ---
if ($resource === 'files') {
    require __DIR__ . '/routes/files.php';
    // The handle_properties call is already inside files.php, so no need to call it here.
    exit;
}
// --- End of new block ---

// --- Add this block for labels ---
if ($resource === 'labels') {
    require __DIR__ . '/routes/labels.php';
    handle_labels($method, $pdo, $id);
    exit;
}
// --- End of new block ---

// --- Add this block for queries ---
if ($resource === 'queries') {
    require __DIR__ . '/routes/queries.php';
    handle_queries($method, $pdo, $id);
    exit;
}
// --- End of new block ---

// --- Add this block for users ---
if ($resource === 'users') {
    require __DIR__ . '/routes/users.php';
    // Pass authenticated user to handler
    handle_users($method, $pdo, $segments, $user);
    exit;
}
// --- End of new block ---

// --- Add this block for roles ---
if ($resource === 'roles') {
    require __DIR__ . '/routes/roles.php';
    handle_roles($method, $pdo, $id);
    exit;
}

// --- Add this block for invites ---
if ($resource === 'invites') {
    require __DIR__ . '/routes/invites.php';
    // The action for invites will be in $segments[1] for routes like /api/invites/accept
    $action = $segments[1] ?? null;
    handle_invites($method, $pdo, $action);
    exit;
}

// --- Add this block for auth ---
if ($resource === 'auth') {
    require __DIR__ . '/routes/auth.php';
    $action = $segments[1] ?? null; // For routes like /api/auth/login
    handle_auth($method, $pdo, $action);
    exit;
}

// --- Add this block for landing-sections ---
if ($resource === 'landing-sections') {
    require __DIR__ . '/routes/landing-sections.php';
    handle_landing_sections($method, $pdo, $id);
    exit;
}
// --- End of new block ---

if ($resource === 'landing-available-items') {
    // This route should be protected as it provides data for admin dashboard
    $user = authenticate_request($pdo);
    require __DIR__ . '/routes/landing-available-items.php';
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
