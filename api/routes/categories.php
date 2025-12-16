<?php
// api/routes/categories.php

require_once __DIR__ . '/../utils/ImageUpload.php'; // Include the ImageUpload utility

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

function handle_categories($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_category($pdo, $id);
            return list_categories($pdo);
        case 'POST':
            return create_category($pdo);
        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_category($pdo, $id);
        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_category($pdo, $id);
        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}

function list_categories(PDO $pdo) {
    $stmt = $pdo->query("SELECT id, name, pic, thumb, created_at, updated_at FROM categories ORDER BY id DESC");
    $rows = $stmt->fetchAll();
    send_json($rows);
}

function get_category(PDO $pdo, $id) {
    $stmt = $pdo->prepare("SELECT id, name, pic, thumb, created_at, updated_at FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) return send_json(['error' => 'Category not found'], 404);
    send_json($row);
}

function create_category(PDO $pdo) {
    $input = get_request_data(); // Get data from $_POST or JSON body
    error_log("Input data for create_category: " . print_r($input, true));
    error_log("Files data for create_category: " . print_r($_FILES, true));

    if (empty($input['name'])) {
        return send_json(['error' => 'name is required'], 400);
    }

    $pic = null;
    $thumb = null;

    $pdo->beginTransaction();
    try {
        // First, insert the category record to get an ID
        $stmt = $pdo->prepare("INSERT INTO categories (name) VALUES (?)");
        $stmt->execute([$input['name']]);
        $new_category_id = $pdo->lastInsertId();

        if ($new_category_id) {
            // Handle image upload if a file is provided
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $uploaded_images = ImageUpload::handleImageUpload($_FILES['image'], 'category', $new_category_id);
                if ($uploaded_images) {
                    $pic = $uploaded_images['full_path'];
                    $thumb = $uploaded_images['thumb_path'];

                    // Update the category with image paths
                    $update_stmt = $pdo->prepare("UPDATE categories SET pic = ?, thumb = ? WHERE id = ?");
                    $update_stmt->execute([$pic, $thumb, $new_category_id]);
                } else {
                    // If image upload failed, rollback and report error
                    $pdo->rollBack();
                    return send_json(['error' => 'Image upload failed during category creation.'], 500);
                }
            } elseif (isset($input['image_url']) && $input['image_url']) {
                // If image_url is provided, duplicate the existing image
                $duplicated_images = ImageUpload::duplicateImageFile($input['image_url'], 'category', $new_category_id);
                if ($duplicated_images) {
                    $pic = $duplicated_images['full_path'];
                    $thumb = $duplicated_images['thumb_path'];

                    // Update the category with image paths
                    $update_stmt = $pdo->prepare("UPDATE categories SET pic = ?, thumb = ? WHERE id = ?");
                    $update_stmt->execute([$pic, $thumb, $new_category_id]);
                } else {
                    $pdo->rollBack();
                    return send_json(['error' => 'Image duplication failed during category creation.'], 500);
                }
            }
        } else {
            $pdo->rollBack();
            return send_json(['error' => 'Failed to create category record.'], 500);
        }

        $pdo->commit();

        // Fetch and return the newly created category
        $stmt2 = $pdo->prepare("SELECT id, name, pic, thumb, created_at, updated_at FROM categories WHERE id = ?");
        $stmt2->execute([$new_category_id]);
        $row = $stmt2->fetch();
        return send_json($row, 201);

    } catch (PDOException $e) {
        $pdo->rollBack();
        return send_json(['error' => 'Insert failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) { // Catch general exceptions from ImageUpload
        $pdo->rollBack();
        return send_json(['error' => 'Error during category creation or image upload', 'detail' => $e->getMessage()], 500);
    }
}


function update_category(PDO $pdo, $id) {
    $input = get_request_data(); // Get data from $_POST or JSON body

    error_log("--- UPDATE CATEGORY DEBUG (ID: $id) ---");
    error_log("Input data received: " . print_r($input, true));
    error_log("Files data received: " . print_r($_FILES, true));

    $stmt = $pdo->prepare("SELECT id, name, pic, thumb FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $exists = $stmt->fetch();
    if (!$exists) return send_json(['error' => 'Category not found'], 404);
    error_log("Existing category data (from DB): " . print_r($exists, true));

    $name = $input['name'] ?? $exists['name'];

    $current_pic = $exists['pic'];
    $current_thumb = $exists['thumb'];

    $new_pic = $current_pic;
    $new_thumb = $current_thumb;

    // Check for image upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        // New image uploaded: delete old ones first
        if ($current_pic) {
            ImageUpload::deleteImageFiles($current_pic, $current_thumb);
        }
        $uploaded_images = ImageUpload::handleImageUpload($_FILES['image'], 'category', $id);
        if ($uploaded_images) {
            $new_pic = $uploaded_images['full_path'];
            $new_thumb = $uploaded_images['thumb_path'];
        } else {
            return send_json(['error' => 'Image upload failed during category update.'], 500);
        }
    } else {
        // No new image uploaded, check if client wants to remove existing image
        // The frontend should send 'pic_removed' flag
        if (isset($input['pic_removed']) && $input['pic_removed'] === 'true') {
            if ($current_pic) {
                ImageUpload::deleteImageFiles($current_pic, $current_thumb);
            }
            $new_pic = null;
            $new_thumb = null;
        }
    }

    $pdo->beginTransaction();
    try {
        $update_params = [$name, $new_pic, $new_thumb, $id];
        error_log("Final params for UPDATE: " . print_r($update_params, true));
        $stmt = $pdo->prepare("UPDATE categories SET name = ?, pic = ?, thumb = ? WHERE id = ?");
        $stmt->execute($update_params);
        $affected_rows = $stmt->rowCount();
        error_log("UPDATE affected rows: " . $affected_rows);
        $pdo->commit();

        $stmt2 = $pdo->prepare("SELECT id, name, pic, thumb, created_at, updated_at FROM categories WHERE id = ?");
        $stmt2->execute([$id]);
        $row = $stmt2->fetch();
        error_log("Category after update: " . print_r($row, true));
        return send_json($row);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during update: " . $e->getMessage());
        return send_json(['error' => 'Update failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Exception during update: " . $e->getMessage());
        return send_json(['error' => 'Error during category update', 'detail' => $e->getMessage()], 500);
    } finally {
        error_log("--- END UPDATE CATEGORY DEBUG ---");
    }
}

function delete_category(PDO $pdo, $id) {
    // First, fetch the category to get image paths
    $stmt = $pdo->prepare("SELECT pic, thumb FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $category = $stmt->fetch();

    $pdo->beginTransaction();
    try {
        // Delete the record from the database
        $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$id]);

        // If category existed and had images, delete them from server
        if ($category && ($category['pic'] || $category['thumb'])) {
            ImageUpload::deleteImageFiles($category['pic'], $category['thumb']);
        }
        $pdo->commit();
        http_response_code(204);
        exit;
    } catch (PDOException $e) {
        $pdo->rollBack();
        return send_json(['error' => 'Delete failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        return send_json(['error' => 'Error during category deletion', 'detail' => $e->getMessage()], 500);
    }
}