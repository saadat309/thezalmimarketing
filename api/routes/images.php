<?php
// api/routes/images.php

require_once __DIR__ . '/../utils/ImageUpload.php'; // For deleteImageFiles

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

function handle_images($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_image($pdo, $id);
            return list_images($pdo);
        case 'POST': // Creating an image usually tied to a media_id
            return create_image($pdo);
        case 'PUT':
        case 'PATCH':
            // Specific action for reordering
            if ($id === 'reorder') { // e.g., PATCH /api/images/reorder
                return reorder_images($pdo);
            }
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_image($pdo, $id);
        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_image($pdo, $id);
        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}

function list_images(PDO $pdo) {
    // List images, perhaps by media_id if provided in query params
    $media_id = $_GET['media_id'] ?? null;
    $sql = "SELECT id, media_id, path, thumb_path, alt, position, is_card_pic, hide, created_at, updated_at FROM images";
    $params = [];
    if ($media_id) {
        $sql .= " WHERE media_id = ?";
        $params[] = $media_id;
    }
    $sql .= " ORDER BY position ASC, id ASC"; // Order by position by default

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    send_json($rows);
}

function get_image(PDO $pdo, $id) {
    $stmt = $pdo->prepare("SELECT id, media_id, path, thumb_path, alt, position, is_card_pic, hide, created_at, updated_at FROM images WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) return send_json(['error' => 'Image not found'], 404);
    send_json($row);
}

function create_image(PDO $pdo) {
    send_json(['error' => 'Image creation should be handled through parent entity forms for now.'], 405);
    // Image creation will be implicitly handled when a property/map is created/updated
    // The ImageUpload utility handles the file saving part.
    // The database insertion into 'images' table will happen within PropertyForm/MapForm's API endpoints.
}

function update_image(PDO $pdo, $id) {
    $input = get_input_json();
    $stmt = $pdo->prepare("SELECT * FROM images WHERE id = ?");
    $stmt->execute([$id]);
    $exists = $stmt->fetch();
    if (!$exists) return send_json(['error' => 'Image not found'], 404);

    $alt = $input['alt'] ?? $exists['alt'];
    // Removed $caption = $input['caption'] ?? $exists['caption']; as 'caption' column does not exist
    $is_card_pic = $input['is_card_pic'] ?? $exists['is_card_pic'];
    $hide = $input['hide'] ?? $exists['hide'];

    $stmt = $pdo->prepare("UPDATE images SET alt = ?, is_card_pic = ?, hide = ? WHERE id = ?");
    try {
        $stmt->execute([$alt, $is_card_pic, $hide, $id]);
        $stmt2 = $pdo->prepare("SELECT id, media_id, path, thumb_path, alt, position, is_card_pic, hide, created_at, updated_at FROM images WHERE id = ?");
        $stmt2->execute([$id]);
        $row = $stmt2->fetch();
        return send_json($row);
    } catch (PDOException $e) {
        return send_json(['error' => 'Update failed', 'detail' => $e->getMessage()], 500);
    }
}

function delete_image(PDO $pdo, $id) {
    // Fetch image details to get paths for deletion
    $stmt = $pdo->prepare("SELECT path, thumb_path FROM images WHERE id = ?");
    $stmt->execute([$id]);
    $image = $stmt->fetch();

    if (!$image) return send_json(['error' => 'Image not found'], 404);

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("DELETE FROM images WHERE id = ?");
        $stmt->execute([$id]);

        // Delete files from server
        ImageUpload::deleteImageFiles($image['path'], $image['thumb_path']);
        
        $pdo->commit();
        http_response_code(204);
        exit;
    } catch (PDOException $e) {
        $pdo->rollBack();
        return send_json(['error' => 'Delete failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        return send_json(['error' => 'Error during image deletion', 'detail' => $e->getMessage()], 500);
    }
}

function reorder_images(PDO $pdo) {
    $input = get_input_json();
    $media_id = $input['media_id'] ?? null;
    $image_ids_in_order = $input['image_ids'] ?? [];

    if (!$media_id || !is_array($image_ids_in_order) || empty($image_ids_in_order)) {
        return send_json(['error' => 'media_id and an ordered array of image_ids are required'], 400);
    }

    $pdo->beginTransaction();
    try {
        $position = 0;
        foreach ($image_ids_in_order as $image_id) {
            $stmt = $pdo->prepare("UPDATE images SET position = ? WHERE id = ? AND media_id = ?");
            $stmt->execute([$position, $image_id, $media_id]);
            $position++;
        }
        $pdo->commit();
        return send_json(['message' => 'Images reordered successfully']);
    } catch (PDOException $e) {
        $pdo->rollBack();
        return send_json(['error' => 'Reordering failed', 'detail' => $e->getMessage()], 500);
    }
}