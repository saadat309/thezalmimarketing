<?php
// api/config.php 

// --- PRODUCTION SETTINGS ---
$DB_HOST = '127.0.0.1';
$DB_NAME = 'zalmimarketing';
$DB_USER = 'manto';        
$DB_PASS = 'Iamkhan@309';

define('FRONTEND_URL', 'http://localhost:5173');
define('APP_ENV', 'development'); // Change to 'production' in prod
// ---------------------------

// Production error reporting
if (APP_ENV === 'production') {
    ini_set('display_errors', '0');
    error_reporting(0);
} else {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
}

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, 
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    $msg = (APP_ENV === 'production') ? 'Database connection failed' : $e->getMessage();
    echo json_encode(['error' => 'DB connection failed', 'detail' => $msg]);
    exit;
}