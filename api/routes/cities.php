<?php
// api/routes/cities.php


function send_json($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Modified to get input from POST, and JSON body as fallback for non-file requests
function get_request_data() {
    $data = [];

    // For POST, PUT, PATCH requests
    if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
        // 1. Always start with $_POST (for x-www-form-urlencoded or multipart/form-data if files are present)
        $data = $_POST;

        // 2. If $_POST is empty, and there are no files, try to parse JSON from php://input
        // This handles application/json requests.
        if (empty($data) && empty($_FILES)) {
            $raw = file_get_contents('php://input');
            $json_data = json_decode($raw, true);
            if (is_array($json_data)) {
                $data = $json_data;
            }
        }
    }
    return $data;
}

function handle_cities($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_city($pdo, $id);
            return list_cities($pdo);
        case 'POST':
            return create_city($pdo);
        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_city($pdo, $id);
        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_city($pdo, $id);
        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}

function get_maps_for_entity(PDO $pdo, string $entity_type, int $entity_id) {
    $column = $entity_type . '_id';
    $stmt = $pdo->prepare("SELECT id FROM map_docs WHERE {$column} = ?");
    $stmt->execute([$entity_id]);
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

function list_cities(PDO $pdo) {
    $stmt = $pdo->query("SELECT id, name, created_at, updated_at FROM cities ORDER BY id DESC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['map_ids'] = get_maps_for_entity($pdo, 'city', $row['id']);
    }
    send_json($rows);
}

function get_city(PDO $pdo, $id) {
    $stmt = $pdo->prepare("SELECT id, name, created_at, updated_at FROM cities WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return send_json(['error' => 'City not found'], 404);

    $row['map_ids'] = get_maps_for_entity($pdo, 'city', $row['id']);
    send_json($row);
}

function create_city(PDO $pdo) {
    $input = get_request_data();
    error_log("--- CREATE CITY DEBUG ---");
    error_log("Input data for create_city: " . print_r($input, true));

    if (empty($input['name'])) {
        return send_json(['error' => 'name is required'], 400);
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO cities (name) VALUES (?)");
        $stmt->execute([$input['name']]);
        $new_city_id = $pdo->lastInsertId();

        if (!$new_city_id) {
            $pdo->rollBack();
            return send_json(['error' => 'Failed to create city record.'], 500);
        }

        // Handle map associations if map_ids are provided
        if (isset($input['map_ids']) && is_array($input['map_ids'])) {
            $placeholders = implode(',', array_fill(0, count($input['map_ids']), '?'));
            $stmt_maps = $pdo->prepare("UPDATE map_docs SET city_id = ? WHERE id IN ({$placeholders})");
            $stmt_maps->execute(array_merge([$new_city_id], $input['map_ids']));
        }

        $pdo->commit();

        $stmt2 = $pdo->prepare("SELECT id, name, created_at, updated_at FROM cities WHERE id = ?");
        $stmt2->execute([$new_city_id]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);
        $row['map_ids'] = get_maps_for_entity($pdo, 'city', $new_city_id); // Include map_ids
        error_log("City after create: " . print_r($row, true));
        return send_json($row, 201);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during create: " . $e->getMessage());
        return send_json(['error' => 'Insert failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Exception during create: " . $e->getMessage());
        return send_json(['error' => 'Error during city creation', 'detail' => $e->getMessage()], 500);
    } finally {
        error_log("--- END CREATE CITY DEBUG ---");
    }
}


function update_city(PDO $pdo, $id) {
    $input = get_request_data();
    error_log("--- UPDATE CITY DEBUG (ID: $id) ---");
    error_log("Input data received: " . print_r($input, true));

    $stmt = $pdo->prepare("SELECT id, name FROM cities WHERE id = ?");
    $stmt->execute([$id]);
    $exists = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$exists) return send_json(['error' => 'City not found'], 404);
    error_log("Existing city data (from DB): " . print_r($exists, true));

    $name = $input['name'] ?? $exists['name'];

    $pdo->beginTransaction();
    try {
        $update_params = [$name, $id];
        error_log("Final params for UPDATE: " . print_r($update_params, true));
        $stmt = $pdo->prepare("UPDATE cities SET name = ? WHERE id = ?");
        $stmt->execute($update_params);
        $affected_rows = $stmt->rowCount();
        error_log("UPDATE affected rows: " . $affected_rows);

        // Handle map associations
        if (isset($input['map_ids']) && is_array($input['map_ids'])) {
            $map_ids_to_link = $input['map_ids'];

            // 1. Unlink maps that are no longer associated with this city
            if (!empty($map_ids_to_link)) {
                $placeholders_not_in = implode(',', array_fill(0, count($map_ids_to_link), '?'));
                $stmt_unlink = $pdo->prepare("UPDATE map_docs SET city_id = NULL WHERE city_id = ? AND id NOT IN ({$placeholders_not_in})");
                $stmt_unlink->execute(array_merge([$id], $map_ids_to_link));
            } else {
                // If map_ids_to_link is empty, unlink all maps from this city
                $stmt_unlink_all = $pdo->prepare("UPDATE map_docs SET city_id = NULL WHERE city_id = ?");
                $stmt_unlink_all->execute([$id]);
            }

            // 2. Link maps that should be associated with this city (if not already linked)
            if (!empty($map_ids_to_link)) {
                $placeholders_in = implode(',', array_fill(0, count($map_ids_to_link), '?'));
                $stmt_link = $pdo->prepare("UPDATE map_docs SET city_id = ? WHERE id IN ({$placeholders_in})");
                $stmt_link->execute(array_merge([$id], $map_ids_to_link));
            }
        } else {
            // If map_ids is not provided, unlink all maps from this city
            $stmt_unlink_all = $pdo->prepare("UPDATE map_docs SET city_id = NULL WHERE city_id = ?");
            $stmt_unlink_all->execute([$id]);
        }
        
        $pdo->commit();

        $stmt2 = $pdo->prepare("SELECT id, name, created_at, updated_at FROM cities WHERE id = ?");
        $stmt2->execute([$id]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);
        $row['map_ids'] = get_maps_for_entity($pdo, 'city', $id); // Include map_ids
        error_log("City after update: " . print_r($row, true));
        return send_json($row);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during update: " . $e->getMessage());
        return send_json(['error' => 'Update failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Exception during update: " . $e->getMessage());
        return send_json(['error' => 'Error during city update', 'detail' => $e->getMessage()], 500);
    } finally {
        error_log("--- END UPDATE CITY DEBUG ---");
    }
}

function delete_city(PDO $pdo, $id) {
    $pdo->beginTransaction();
    try {
        // Delete the record from the database
        $stmt = $pdo->prepare("DELETE FROM cities WHERE id = ?");
        $stmt->execute([$id]);

        $pdo->commit();
        http_response_code(204);
        exit;
    } catch (PDOException $e) {
        $pdo->rollBack();
        return send_json(['error' => 'Delete failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        return send_json(['error' => 'Error during city deletion', 'detail' => $e->getMessage()], 500);
    }
}
