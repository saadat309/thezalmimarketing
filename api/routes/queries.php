<?php
// api/routes/queries.php

function handle_queries($method, PDO $pdo, $id = null) {
    $request_data = [];
    if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw, true);
        if (is_array($json)) {
            $request_data = $json;
        } else {
            $request_data = $_POST;
        }
    }
    
    // Check for method override
    if (isset($request_data['_method'])) {
        $method = strtoupper($request_data['_method']);
    }

    switch ($method) {
        case 'GET':
            if ($id === 'unread-count') return count_unread_queries($pdo);
            if ($id) return get_query($pdo, $id);
            return list_queries($pdo);
        case 'POST':
            return create_query($pdo, $request_data);
        case 'PATCH':
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID required']);
                exit;
            }
            return update_query($pdo, $id, $request_data);
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID required']);
                exit;
            }
            return delete_query($pdo, $id);
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit;
    }
}

function list_queries(PDO $pdo) {
    // Join with properties to get property title
    $sql = "SELECT q.*, p.title as property_title 
            FROM queries q 
            LEFT JOIN properties p ON q.property_id = p.id 
            ORDER BY q.created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $queries = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convert is_read to boolean for frontend consistency
    foreach ($queries as &$query) {
        $query['is_read'] = (bool)$query['is_read'];
    }
    
    echo json_encode($queries);
    exit;
}

function get_query(PDO $pdo, $id) {
    $sql = "SELECT q.*, p.title as property_title 
            FROM queries q 
            LEFT JOIN properties p ON q.property_id = p.id 
            WHERE q.id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    $query = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$query) {
        http_response_code(404);
        echo json_encode(['error' => 'Query not found']);
        exit;
    }

    $query['is_read'] = (bool)$query['is_read'];
    
    echo json_encode($query);
    exit;
}

function create_query(PDO $pdo, $data) {
    if (empty($data['name']) || empty($data['message'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name and Message are required']);
        exit;
    }

    // Prepare nullable fields
    $property_id = !empty($data['property_id']) ? $data['property_id'] : null;
    $phone = !empty($data['phone']) ? $data['phone'] : null;
    $email = !empty($data['email']) ? $data['email'] : null;
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
    $is_read = isset($data['is_read']) ? (int)(bool)$data['is_read'] : 0;

    try {
        $stmt = $pdo->prepare("INSERT INTO queries (property_id, name, email, phone, message, ip_address, user_agent, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $property_id,
            $data['name'],
            $email,
            $phone,
            $data['message'],
            $ip_address,
            $user_agent,
            $is_read
        ]);
        
        $id = $pdo->lastInsertId();
        return get_query($pdo, $id);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create query', 'detail' => $e->getMessage()]);
        exit;
    }
}

function update_query(PDO $pdo, $id, $data) {
    // Check exist
    $stmt = $pdo->prepare("SELECT id FROM queries WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Query not found']);
        exit;
    }

    $fields = [];
    $values = [];

    // Fields to allow updating
    $allowable = ['property_id', 'name', 'email', 'phone', 'message', 'is_read'];
    
    foreach ($allowable as $field) {
        if (array_key_exists($field, $data)) {
            $fields[] = "$field = ?";
            $val = $data[$field];
            if ($field === 'is_read') {
                $val = (int)(bool)$val;
            } elseif ($field === 'property_id') {
                $val = !empty($val) ? $val : null;
            }
            $values[] = $val;
        }
    }

    if (empty($fields)) {
        return get_query($pdo, $id); // No changes
    }

    $values[] = $id;
    $sql = "UPDATE queries SET " . implode(', ', $fields) . " WHERE id = ?";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        return get_query($pdo, $id);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update query', 'detail' => $e->getMessage()]);
        exit;
    }
}

function delete_query(PDO $pdo, $id) {
    try {
        $stmt = $pdo->prepare("DELETE FROM queries WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Query not found']);
            exit;
        }
        http_response_code(204);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete query', 'detail' => $e->getMessage()]);
        exit;
    }
}

function count_unread_queries(PDO $pdo) {
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM queries WHERE is_read = 0");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['count' => (int)$result['count']]);
    exit;
}
