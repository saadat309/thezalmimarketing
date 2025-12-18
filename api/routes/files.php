<?php
// api/routes/files.php

// Include the properties API handler
require_once __DIR__ . '/properties.php';

// Ensure the database connection is available
global $pdo; // Assuming $pdo is available in the global scope from index.php

// Force is_file to true for all requests to this endpoint
$_GET['is_file'] = '1';

// Get HTTP method and ID from the request
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_uri = explode('/', trim($path, '/'));
$id = null;

// Determine the ID if present in the URI after 'files'
$files_index = array_search('files', $request_uri);
if ($files_index !== false && isset($request_uri[$files_index + 1])) {
    $id = $request_uri[$files_index + 1];
}

// Call the generic properties handler with the forced is_file filter
handle_properties($method, $pdo, $id);
