<?php
// api/routes/products.php

function send_json($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function get_input_json() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function handle_products($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_product($pdo, $id);
            return list_products($pdo);
        case 'POST':
            return create_product($pdo);
        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_product($pdo, $id);
        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_product($pdo, $id);
        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}

function list_products(PDO $pdo) {
    $stmt = $pdo->query("SELECT id, name, slug, price, stock, created_at FROM products ORDER BY id DESC");
    $rows = $stmt->fetchAll();
    send_json($rows);
}

function get_product(PDO $pdo, $id) {
    $stmt = $pdo->prepare("SELECT id, name, slug, description, price, stock, created_at FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) return send_json(['error' => 'Product not found'], 404);
    send_json($row);
}

function create_product(PDO $pdo) {
    $input = get_input_json();
    if (empty($input['name']) || empty($input['slug'])) {
        return send_json(['error' => 'name and slug required'], 400);
    }
    $desc = $input['description'] ?? null;
    $price = isset($input['price']) ? (float)$input['price'] : 0;
    $stock = isset($input['stock']) ? (int)$input['stock'] : 0;

    $stmt = $pdo->prepare("INSERT INTO products (name, slug, description, price, stock) VALUES (?, ?, ?, ?, ?)");
    try {
        $stmt->execute([$input['name'], $input['slug'], $desc, $price, $stock]);
        $id = $pdo->lastInsertId();
        $stmt2 = $pdo->prepare("SELECT id, name, slug, description, price, stock, created_at FROM products WHERE id = ?");
        $stmt2->execute([$id]);
        $row = $stmt2->fetch();
        return send_json($row, 201);
    } catch (PDOException $e) {
        return send_json(['error' => 'Insert failed', 'detail' => $e->getMessage()], 500);
    }
}

function update_product(PDO $pdo, $id) {
    $input = get_input_json();
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $exists = $stmt->fetch();
    if (!$exists) return send_json(['error' => 'Product not found'], 404);

    $name = $input['name'] ?? $exists['name'];
    $slug = $input['slug'] ?? $exists['slug'];
    $desc = array_key_exists('description', $input) ? $input['description'] : $exists['description'];
    $price = array_key_exists('price', $input) ? (float)$input['price'] : $exists['price'];
    $stock = array_key_exists('stock', $input) ? (int)$input['stock'] : $exists['stock'];

    $stmt = $pdo->prepare("UPDATE products SET name = ?, slug = ?, description = ?, price = ?, stock = ? WHERE id = ?");
    $stmt->execute([$name, $slug, $desc, $price, $stock, $id]);

    $stmt2 = $pdo->prepare("SELECT id, name, slug, description, price, stock FROM products WHERE id = ?");
    $stmt2->execute([$id]);
    $row = $stmt2->fetch();
    return send_json($row);
}

function delete_product(PDO $pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
    http_response_code(204);
    exit;
}
