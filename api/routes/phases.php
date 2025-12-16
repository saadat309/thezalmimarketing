<?php
// api/routes/phases.php


function send_json($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function get_request_data() {
    $data = [];

    if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
        $data = $_POST;
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

function handle_phases($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_phase($pdo, $id);
            return list_phases($pdo);
        case 'POST':
            return create_phase($pdo);
        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_phase($pdo, $id);
        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_phase($pdo, $id);
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

function list_phases(PDO $pdo) {
    $stmt = $pdo->query("SELECT id, name, created_at, updated_at FROM phases ORDER BY id DESC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['map_ids'] = get_maps_for_entity($pdo, 'phase', $row['id']);
    }
    send_json($rows);
}

function get_phase(PDO $pdo, $id) {
    $stmt = $pdo->prepare("SELECT id, name, created_at, updated_at FROM phases WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return send_json(['error' => 'Phase not found'], 404);

    $row['map_ids'] = get_maps_for_entity($pdo, 'phase', $row['id']);
    send_json($row);
}

function create_phase(PDO $pdo) {
    $input = get_request_data();
    error_log("--- CREATE PHASE DEBUG ---");
    error_log("Input data for create_phase: " . print_r($input, true));

    if (empty($input['name'])) {
        return send_json(['error' => 'name is required'], 400);
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO phases (name) VALUES (?)");
        $stmt->execute([$input['name']]);
        $new_id = $pdo->lastInsertId();

        if (!$new_id) {
            $pdo->rollBack();
            return send_json(['error' => 'Failed to create phase record.'], 500);
        }
        
        // Handle map associations if map_ids are provided
        if (isset($input['map_ids']) && is_array($input['map_ids'])) {
            $placeholders = implode(',', array_fill(0, count($input['map_ids']), '?'));
            $stmt_maps = $pdo->prepare("UPDATE map_docs SET phase_id = ? WHERE id IN ({$placeholders})");
            $stmt_maps->execute(array_merge([$new_id], $input['map_ids']));
        }

        $pdo->commit();

        $stmt2 = $pdo->prepare("SELECT id, name, created_at, updated_at FROM phases WHERE id = ?");
        $stmt2->execute([$new_id]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);
        $row['map_ids'] = get_maps_for_entity($pdo, 'phase', $new_id); // Include map_ids
        error_log("Phase after create: " . print_r($row, true));
        return send_json($row, 201);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during create: " . $e->getMessage());
        return send_json(['error' => 'Insert failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) { // Catch general exceptions
        $pdo->rollBack();
        error_log("Exception during create: " . $e->getMessage());
        return send_json(['error' => 'Error during phase creation', 'detail' => $e->getMessage()], 500);
    } finally {
        error_log("--- END CREATE PHASE DEBUG ---");
    }
}


function update_phase(PDO $pdo, $id) {
    $input = get_request_data();
    error_log("--- UPDATE PHASE DEBUG (ID: $id) ---");
    error_log("Input data received: " . print_r($input, true));

    $stmt = $pdo->prepare("SELECT id, name FROM phases WHERE id = ?");
    $stmt->execute([$id]);
    $exists = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$exists) return send_json(['error' => 'Phase not found'], 404);
    error_log("Existing phase data (from DB): " . print_r($exists, true));

    $name = $input['name'] ?? $exists['name'];

    $pdo->beginTransaction();
    try {
        $update_params = [$name, $id];
        error_log("Final params for UPDATE: " . print_r($update_params, true));
        $stmt = $pdo->prepare("UPDATE phases SET name = ? WHERE id = ?");
        $stmt->execute($update_params);
        $affected_rows = $stmt->rowCount();
        error_log("UPDATE affected rows: " . $affected_rows);

        // Handle map associations
        if (isset($input['map_ids']) && is_array($input['map_ids'])) {
            $map_ids_to_link = $input['map_ids'];

            // 1. Unlink maps that are no longer associated with this phase
            if (!empty($map_ids_to_link)) {
                $placeholders_not_in = implode(',', array_fill(0, count($map_ids_to_link), '?'));
                $stmt_unlink = $pdo->prepare("UPDATE map_docs SET phase_id = NULL WHERE phase_id = ? AND id NOT IN ({$placeholders_not_in})");
                $stmt_unlink->execute(array_merge([$id], $map_ids_to_link));
            } else {
                // If map_ids_to_link is empty, unlink all maps from this phase
                $stmt_unlink_all = $pdo->prepare("UPDATE map_docs SET phase_id = NULL WHERE phase_id = ?");
                $stmt_unlink_all->execute([$id]);
            }

            // 2. Link maps that should be associated with this phase (if not already linked)
            if (!empty($map_ids_to_link)) {
                $placeholders_in = implode(',', array_fill(0, count($map_ids_to_link), '?'));
                $stmt_link = $pdo->prepare("UPDATE map_docs SET phase_id = ? WHERE id IN ({$placeholders_in})");
                $stmt_link->execute(array_merge([$id], $map_ids_to_link));
            }
        } else {
            // If map_ids is not provided, unlink all maps from this phase
            $stmt_unlink_all = $pdo->prepare("UPDATE map_docs SET phase_id = NULL WHERE phase_id = ?");
            $stmt_unlink_all->execute([$id]);
        }
        
        $pdo->commit();

        $stmt2 = $pdo->prepare("SELECT id, name, created_at, updated_at FROM phases WHERE id = ?");
        $stmt2->execute([$id]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);
        $row['map_ids'] = get_maps_for_entity($pdo, 'phase', $id); // Include map_ids
        error_log("Phase after update: " . print_r($row, true));
        return send_json($row);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during update: " . $e->getMessage());
        return send_json(['error' => 'Update failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Exception during update: " . $e->getMessage());
        return send_json(['error' => 'Error during phase update', 'detail' => $e->getMessage()], 500);
    } finally {
        error_log("--- END UPDATE PHASE DEBUG ---");
    }
}

function delete_phase(PDO $pdo, $id) {
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("DELETE FROM phases WHERE id = ?");
        $stmt->execute([$id]);
        $pdo->commit();
        http_response_code(204);
        exit;
    } catch (PDOException $e) {
        $pdo->rollBack();
        return send_json(['error' => 'Delete failed', 'detail' => $e->getMessage()], 500);
    }
}
