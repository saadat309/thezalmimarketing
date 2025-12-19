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

        $all = isset($_GET['all']);
        
        // Get properties
        $sqlProps = "SELECT id, title, hide FROM properties WHERE is_file = 0";
        if (!$all) $sqlProps .= " AND hide = 0";
        $sqlProps .= " ORDER BY created_at DESC";
        $stmt = $pdo->prepare($sqlProps);
        $stmt->execute();
        $result['properties'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get categories
        $sqlCats = "SELECT id, name, pic, thumb, hide FROM categories";
        if (!$all) $sqlCats .= " WHERE hide = 0";
        $sqlCats .= " ORDER BY created_at DESC";
        $stmt = $pdo->prepare($sqlCats);
        $stmt->execute();
        $result['categories'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get maps (map_docs)
        $sqlMaps = "SELECT id, title, description, map_pic, map_thumb, pdf, hide FROM map_docs";
        if (!$all) $sqlMaps .= " WHERE hide = 0";
        $sqlMaps .= " ORDER BY created_at DESC";
        $stmt = $pdo->prepare($sqlMaps);
        $stmt->execute();
        $result['maps'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        
        // Get files (properties with is_file = 1)
        $sqlFiles = "SELECT id, title, hide FROM properties WHERE is_file = 1";
        if (!$all) $sqlFiles .= " AND hide = 0";
        $sqlFiles .= " ORDER BY created_at DESC";
        $stmt = $pdo->prepare($sqlFiles);
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