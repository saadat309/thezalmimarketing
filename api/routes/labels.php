<?php
// api/routes/labels.php

require_once __DIR__ . '/../utils/slug_util.php';   // Include slug utility

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

function handle_labels($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_label($pdo, $id);
            return list_labels($pdo);
        case 'POST':
            return create_label($pdo);
        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_label($pdo, $id);
        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_label($pdo, $id);
        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}

function get_properties_for_label(PDO $pdo, int $label_id, bool $is_file) {
    $stmt = $pdo->prepare("
        SELECT p.id 
        FROM properties p 
        JOIN property_labels pl ON p.id = pl.property_id 
        WHERE pl.label_id = ? AND p.is_file = ?
    ");
    $stmt->execute([$label_id, (int)$is_file]);
    return array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
}

function list_labels(PDO $pdo) {
    $stmt = $pdo->query("SELECT id, name, slug, is_badge, is_filter, badge_variant, created_at, updated_at FROM labels ORDER BY id DESC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['property_ids'] = get_properties_for_label($pdo, $row['id'], false);
        $row['file_ids'] = get_properties_for_label($pdo, $row['id'], true);
    }
    send_json($rows);
}

function get_label(PDO $pdo, $id) {
    $stmt = $pdo->prepare("SELECT id, name, slug, is_badge, is_filter, badge_variant, created_at, updated_at FROM labels WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return send_json(['error' => 'Label not found'], 404);

    $row['property_ids'] = get_properties_for_label($pdo, $id, false);
    $row['file_ids'] = get_properties_for_label($pdo, $id, true);
    send_json($row);
}

function create_label(PDO $pdo) {
    $input = get_request_data();
    error_log("Input data for create_label: " . print_r($input, true));

    if (empty($input['name'])) {
        return send_json(['error' => 'name is required'], 400);
    }

    $slug = generate_unique_slug($pdo, 'labels', $input['name']);
    $is_badge = isset($input['is_badge']) ? (int)(bool)$input['is_badge'] : 0;
    $is_filter = isset($input['is_filter']) ? (int)(bool)$input['is_filter'] : 1;
    $badge_variant = $input['badge_variant'] ?? 'secondary';

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO labels (name, slug, is_badge, is_filter, badge_variant) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$input['name'], $slug, $is_badge, $is_filter, $badge_variant]);
        $new_id = $pdo->lastInsertId();

        if (!$new_id) {
            $pdo->rollBack();
            return send_json(['error' => 'Failed to create label record.'], 500);
        }
        
        $pdo->commit();

        $stmt2 = $pdo->prepare("SELECT id, name, slug, is_badge, is_filter, badge_variant, created_at, updated_at FROM labels WHERE id = ?");
        $stmt2->execute([$new_id]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);
        error_log("Label after create: " . print_r($row, true));
        return send_json($row, 201);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during create: " . $e->getMessage());
        return send_json(['error' => 'Insert failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) { // Catch general exceptions
        $pdo->rollBack();
        error_log("Exception during create: " . $e->getMessage());
        return send_json(['error' => 'Error during label creation', 'detail' => $e->getMessage()], 500);
    } finally {
        error_log("--- END CREATE LABEL DEBUG ---");
    }
}

function update_label(PDO $pdo, $id) {
    $input = get_request_data();
    error_log("--- UPDATE LABEL DEBUG (ID: $id) ---");
    error_log("Input data received: " . print_r($input, true));

    $stmt = $pdo->prepare("SELECT id, name, slug, is_badge, is_filter, badge_variant FROM labels WHERE id = ?");
    $stmt->execute([$id]);
    $exists = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$exists) return send_json(['error' => 'Label not found'], 404);
    error_log("Existing label data (from DB): " . print_r($exists, true));

    $name = $input['name'] ?? $exists['name'];
    $slug = $exists['slug'];

    if (isset($input['name']) && $input['name'] !== $exists['name']) {
        $slug = generate_unique_slug($pdo, 'labels', $input['name'], $id);
    }

    $is_badge = isset($input['is_badge']) ? (int)(bool)$input['is_badge'] : (int)(bool)$exists['is_badge'];
    $is_filter = isset($input['is_filter']) ? (int)(bool)$input['is_filter'] : (int)(bool)$exists['is_filter'];
    $badge_variant = $input['badge_variant'] ?? $exists['badge_variant'];

    $pdo->beginTransaction();
    try {
        $update_params = [$name, $slug, $is_badge, $is_filter, $badge_variant, $id];
        error_log("Final params for UPDATE: " . print_r($update_params, true));
        $stmt = $pdo->prepare("UPDATE labels SET name = ?, slug = ?, is_badge = ?, is_filter = ?, badge_variant = ? WHERE id = ?");
        $stmt->execute($update_params);
        $affected_rows = $stmt->rowCount();
        error_log("UPDATE affected rows: " . $affected_rows);
        
        $pdo->commit();

        $stmt2 = $pdo->prepare("SELECT id, name, slug, is_badge, is_filter, badge_variant, created_at, updated_at FROM labels WHERE id = ?");
        $stmt2->execute([$id]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);
        error_log("Label after update: " . print_r($row, true));
        return send_json($row);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during update: " . $e->getMessage());
        return send_json(['error' => 'Update failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Exception during update: " . $e->getMessage());
        return send_json(['error' => 'Error during label update', 'detail' => $e->getMessage()], 500);
    } finally {
        error_log("--- END UPDATE LABEL DEBUG ---");
    }
}

function delete_label(PDO $pdo, $id) {
    $pdo->beginTransaction();
    try {
        // First, check if this label is associated with any properties
        $stmt_check = $pdo->prepare("SELECT COUNT(*) FROM property_labels WHERE label_id = ?");
        $stmt_check->execute([$id]);
        if ($stmt_check->fetchColumn() > 0) {
            $pdo->rollBack();
            return send_json(['error' => 'Cannot delete label: It is currently assigned to one or more properties. Please remove it from properties first.'], 409);
        }

        $stmt = $pdo->prepare("DELETE FROM labels WHERE id = ?");
        $stmt->execute([$id]);
        $pdo->commit();
        http_response_code(204);
        exit;
    } catch (PDOException $e) {
        $pdo->rollBack();
        return send_json(['error' => 'Delete failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        return send_json(['error' => 'Error during label deletion', 'detail' => $e->getMessage()], 500);
    }
}
