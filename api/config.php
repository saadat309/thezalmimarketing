<?php
// api/config.php 

$DB_HOST = '127.0.0.1';
$DB_NAME = 'zalmimarketing';
$DB_USER = 'manto';        
$DB_PASS = 'Iamkhan@309';
// $DB_USER = 'zalmimarketing';        
// $DB_PASS = 'NotSoStrong@Zalmi1479S32M';




try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'DB connection failed', 'detail' => $e->getMessage()]);
    exit;
}