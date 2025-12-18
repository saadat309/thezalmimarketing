<?php
// api/routes/landing-available-items.php

function send_json($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function get_available_items(PDO $pdo) {
    try {
        $result = [
            'properties' => [],
            'categories' => [],
            'maps' => [],
            'files' => [] // Actually properties with is_file = 1
        ];
        
        // Get properties
        $stmt = $pdo->prepare("
            SELECT id, title, hide
            FROM properties
            WHERE is_file = 0
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $result['properties'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get categories
        $stmt = $pdo->prepare("
            SELECT id, name, pic, thumb, hide
            FROM categories
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $result['categories'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get maps (map_docs)
        $stmt = $pdo->prepare("
            SELECT id, title, description, map_pic, map_thumb, pdf, hide
            FROM map_docs
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $result['maps'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        
        // Get files (properties with is_file = 1)
        $stmt = $pdo->prepare("
            SELECT id, title, hide
            FROM properties
            WHERE is_file = 1
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $result['files'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        send_json($result);
    } catch (Exception $e) {
        send_json(['error' => 'Failed to fetch available items', 'detail' => $e->getMessage()], 500);
    }
}

// Handle the request
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    get_available_items($pdo);
} else {
    send_json(['error' => 'Method not allowed'], 405);
}