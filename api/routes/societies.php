<?php
// api/routes/societies.php

require_once __DIR__ . '/../utils/slug_util.php';   // Include slug utility

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

function handle_societies($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_society($pdo, $id);
            return list_societies($pdo);
        case 'POST':
            return create_society($pdo);
        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_society($pdo, $id);
        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_society($pdo, $id);
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

function get_properties_for_entity(PDO $pdo, string $entity_type, int $entity_id) {
    $column = $entity_type . '_id';
    $stmt = $pdo->prepare("SELECT id FROM properties WHERE {$column} = ? AND is_file = 0");
    $stmt->execute([$entity_id]);
    return array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
}

function get_files_for_entity(PDO $pdo, string $entity_type, int $entity_id) {
    $column = $entity_type . '_id';
    $stmt = $pdo->prepare("SELECT id FROM properties WHERE {$column} = ? AND is_file = 1");
    $stmt->execute([$entity_id]);
    return array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
}

function list_societies(PDO $pdo) {
    $stmt = $pdo->query("SELECT id, name, slug, created_at, updated_at FROM societies ORDER BY id DESC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['map_ids'] = get_maps_for_entity($pdo, 'society', $row['id']);
        $row['property_ids'] = get_properties_for_entity($pdo, 'society', $row['id']);
        $row['file_ids'] = get_files_for_entity($pdo, 'society', $row['id']);
    }
    send_json($rows);
}

function get_society(PDO $pdo, $id) {
    $stmt = $pdo->prepare("SELECT id, name, slug, created_at, updated_at FROM societies WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return send_json(['error' => 'Society not found'], 404);

    $row['map_ids'] = get_maps_for_entity($pdo, 'society', $row['id']);
    $row['property_ids'] = get_properties_for_entity($pdo, 'society', $row['id']);
    $row['file_ids'] = get_files_for_entity($pdo, 'society', $row['id']);
    send_json($row);
}

function create_society(PDO $pdo) {
    $input = get_request_data();

    if (empty($input['name'])) {
        return send_json(['error' => 'name is required'], 400);
    }

    $slug = generate_unique_slug($pdo, 'societies', $input['name']);

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO societies (name, slug) VALUES (?, ?)");
        $stmt->execute([$input['name'], $slug]);
        $new_id = $pdo->lastInsertId();

        if (!$new_id) {
            $pdo->rollBack();
            return send_json(['error' => 'Failed to create society record.'], 500);
        }
        
        // Handle map associations if map_ids are provided
        if (isset($input['map_ids']) && is_array($input['map_ids'])) {
            $placeholders = implode(',', array_fill(0, count($input['map_ids']), '?'));
            $stmt_maps = $pdo->prepare("UPDATE map_docs SET society_id = ? WHERE id IN ({$placeholders})");
            $stmt_maps->execute(array_merge([$new_id], $input['map_ids']));
        }

        $pdo->commit();
        
        $stmt2 = $pdo->prepare("SELECT id, name, slug, created_at, updated_at FROM societies WHERE id = ?");
        $stmt2->execute([$new_id]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);
        $row['map_ids'] = get_maps_for_entity($pdo, 'society', $new_id); // Include map_ids
        return send_json($row, 201);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during create: " . $e->getMessage());
        return send_json(['error' => 'Insert failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) { // Catch general exceptions
        $pdo->rollBack();
        error_log("Exception during create: " . $e->getMessage());
        return send_json(['error' => 'Error during society creation', 'detail' => $e->getMessage()], 500);
    }
}


function update_society(PDO $pdo, $id) {
    $input = get_request_data();

    $stmt = $pdo->prepare("SELECT id, name, slug FROM societies WHERE id = ?");
    $stmt->execute([$id]);
    $exists = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$exists) return send_json(['error' => 'Society not found'], 404);

    $name = $input['name'] ?? $exists['name'];
    $slug = $exists['slug'];

    if (isset($input['name']) && $input['name'] !== $exists['name']) {
        $slug = generate_unique_slug($pdo, 'societies', $input['name'], $id);
    }

    $pdo->beginTransaction();
    try {
        $update_params = [$name, $slug, $id];
        $stmt = $pdo->prepare("UPDATE societies SET name = ?, slug = ? WHERE id = ?");
        $stmt->execute($update_params);
        $affected_rows = $stmt->rowCount();

        // Handle map associations
        if (isset($input['map_ids']) && is_array($input['map_ids'])) {
            $map_ids_to_link = $input['map_ids'];

            // 1. Unlink maps that are no longer associated with this society
            if (!empty($map_ids_to_link)) {
                $placeholders_not_in = implode(',', array_fill(0, count($map_ids_to_link), '?'));
                $stmt_unlink = $pdo->prepare("UPDATE map_docs SET society_id = NULL WHERE society_id = ? AND id NOT IN ({$placeholders_not_in})");
                $stmt_unlink->execute(array_merge([$id], $map_ids_to_link));
            } else {
                // If map_ids_to_link is empty, unlink all maps from this society
                $stmt_unlink_all = $pdo->prepare("UPDATE map_docs SET society_id = NULL WHERE society_id = ?");
                $stmt_unlink_all->execute([$id]);
            }

            // 2. Link maps that should be associated with this society (if not already linked)
            if (!empty($map_ids_to_link)) {
                $placeholders_in = implode(',', array_fill(0, count($map_ids_to_link), '?'));
                $stmt_link = $pdo->prepare("UPDATE map_docs SET society_id = ? WHERE id IN ({$placeholders_in})");
                $stmt_link->execute(array_merge([$id], $map_ids_to_link));
            }
        } else {
            // If map_ids is not provided, unlink all maps from this society
            $stmt_unlink_all = $pdo->prepare("UPDATE map_docs SET society_id = NULL WHERE society_id = ?");
            $stmt_unlink_all->execute([$id]);
        }
        
        $pdo->commit();

        $stmt2 = $pdo->prepare("SELECT id, name, slug, created_at, updated_at FROM societies WHERE id = ?");
        $stmt2->execute([$id]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);
        $row['map_ids'] = get_maps_for_entity($pdo, 'society', $id); // Include map_ids
        return send_json($row);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during update: " . $e->getMessage());
        return send_json(['error' => 'Update failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Exception during update: " . $e->getMessage());
        return send_json(['error' => 'Error during society update', 'detail' => $e->getMessage()], 500);
    }
}

function delete_society(PDO $pdo, $id) {
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("DELETE FROM societies WHERE id = ?");
        $stmt->execute([$id]);
        $pdo->commit();
        http_response_code(204);
        exit;
    } catch (PDOException $e) {
        $pdo->rollBack();
        return send_json(['error' => 'Delete failed', 'detail' => $e->getMessage()], 500);
    }
}
