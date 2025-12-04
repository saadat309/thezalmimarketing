<?php
ini_set('display_errors','1');
error_reporting(E_ALL);

require __DIR__ . '/config.php'; // uses your config.php which sets $pdo

try {
  $stmt = $pdo->query('SELECT 1');
  $res = $stmt->fetchColumn();
  echo json_encode(['db' => 'ok', 'res' => $res]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['db' => 'error', 'message' => $e->getMessage()]);
}