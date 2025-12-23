<?php
// api/routes/landing-sections.php

require_once __DIR__ . '/../utils/ImageUpload.php';

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

function handleVideoUpload(array $file) {
    if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Landing video upload error code: " . ($file['error'] ?? 'unknown'));
    }

    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        throw new Exception("Invalid landing video upload.");
    }

    $uploadDir = ImageUpload::getPublicPath() . DIRECTORY_SEPARATOR . 'videos' . DIRECTORY_SEPARATOR . 'landing' . DIRECTORY_SEPARATOR;
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        throw new Exception("Failed to create landing video directory.");
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $uniqueName = uniqid('landing_video_', true);
    $fileName = $uniqueName . '.' . $extension;
    $targetPath = $uploadDir . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new Exception("Failed to move uploaded landing video.");
    }

    return '/videos/landing/' . $fileName;
}

function handleLandingMediaUpload(array $file, $type = 'image') {
    if ($type === 'image') {
        $result = ImageUpload::handleImageUpload($file, 'landing_popup', uniqid(), ['to_webp' => true]);
        return $result['full_path'];
    } else {
        return handleVideoUpload($file);
    }
}

function handle_landing_sections($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_landing_section($pdo, $id);
            return list_landing_sections($pdo);
        case 'POST':
            return create_landing_section($pdo);
        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_landing_section($pdo, $id);
        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_landing_section($pdo, $id);
        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}

function list_landing_sections(PDO $pdo) {
    try {
        $stmt = $pdo->prepare("
            SELECT ls.*, 
                   GROUP_CONCAT(lsi.item_id ORDER BY lsi.item_order SEPARATOR ',') as selected_items
            FROM landing_sections ls
            LEFT JOIN landing_section_items lsi ON ls.id = lsi.section_id
            GROUP BY ls.id
            ORDER BY ls.id
        ");
        $stmt->execute();
        $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the selected items into an array
        foreach ($sections as &$section) {
            if ($section['selected_items']) {
                $section['selected_items'] = array_map('intval', explode(',', $section['selected_items']));
            } else {
                $section['selected_items'] = [];
            }
        }
        
        send_json($sections);
    } catch (Exception $e) {
        send_json(['error' => 'Failed to fetch landing sections', 'detail' => $e->getMessage()], 500);
    }
}

function get_landing_section(PDO $pdo, $id) {
    try {
        $stmt = $pdo->prepare("
            SELECT ls.*, 
                   GROUP_CONCAT(lsi.item_id ORDER BY lsi.item_order SEPARATOR ',') as selected_items
            FROM landing_sections ls
            LEFT JOIN landing_section_items lsi ON ls.id = lsi.section_id
            WHERE ls.id = ?
            GROUP BY ls.id
        ");
        $stmt->execute([$id]);
        $section = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$section) {
            send_json(['error' => 'Landing section not found'], 404);
        }
        
        if ($section['selected_items']) {
            $section['selected_items'] = array_map('intval', explode(',', $section['selected_items']));
        } else {
            $section['selected_items'] = [];
        }
        
        send_json($section);
    } catch (Exception $e) {
        send_json(['error' => 'Failed to fetch landing section', 'detail' => $e->getMessage()], 500);
    }
}

function create_landing_section(PDO $pdo) {
    $data = get_request_data();
    
    try {
        $pdo->beginTransaction();

        $video_path = $data['video_path'] ?? null;
        if (isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
            $video_path = handleVideoUpload($_FILES['video']);
        }

        $media_path = $data['media_path'] ?? null;
        if (isset($_FILES['media']) && $_FILES['media']['error'] === UPLOAD_ERR_OK) {
            $media_path = handleLandingMediaUpload($_FILES['media'], $data['media_type'] ?? 'image');
        }
        
        // Insert the landing section
        $stmt = $pdo->prepare("
            INSERT INTO landing_sections 
            (slug, title, subtitle, collection_type, visibility, video_input_method, video_path, video_embed_link, media_path, media_type, delay_ms) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['slug'],
            $data['title'] ?? null,
            $data['subtitle'] ?? null,
            $data['collection_type'],
            $data['visibility'] ?? 1,
            $data['video_input_method'] ?? null,
            $video_path,
            $data['video_embed_link'] ?? null,
            $media_path,
            $data['media_type'] ?? null,
            $data['delay_ms'] ?? 5000
        ]);
        
        $section_id = $pdo->lastInsertId();
        
        // If there are selected items, insert them
        if (isset($data['selected_items']) && is_array($data['selected_items'])) {
            foreach ($data['selected_items'] as $index => $item_id) {
                $item_stmt = $pdo->prepare("
                    INSERT INTO landing_section_items (section_id, item_id, item_order) 
                    VALUES (?, ?, ?)
                ");
                $item_stmt->execute([$section_id, $item_id, $index]);
            }
        }
        
        $pdo->commit();
        
        // Return the created section
        $stmt = $pdo->prepare("
            SELECT ls.*, 
                   GROUP_CONCAT(lsi.item_id ORDER BY lsi.item_order SEPARATOR ',') as selected_items
            FROM landing_sections ls
            LEFT JOIN landing_section_items lsi ON ls.id = lsi.section_id
            WHERE ls.id = ?
            GROUP BY ls.id
        ");
        $stmt->execute([$section_id]);
        $section = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($section['selected_items']) {
            $section['selected_items'] = array_map('intval', explode(',', $section['selected_items']));
        } else {
            $section['selected_items'] = [];
        }
        
        send_json($section, 201);
    } catch (Exception $e) {
        $pdo->rollback();
        send_json(['error' => 'Failed to create landing section', 'detail' => $e->getMessage()], 500);
    }
}

function update_landing_section(PDO $pdo, $id) {
    $data = get_request_data();
    
    try {
        $pdo->beginTransaction();

        // Fetch existing data to handle old media deletion
        $stmt = $pdo->prepare("SELECT video_path, media_path FROM landing_sections WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        $video_path = $data['video_path'] ?? $existing['video_path'];
        $video_embed_link = $data['video_embed_link'] ?? null;
        $video_input_method = $data['video_input_method'] ?? null;

        $media_path = $data['media_path'] ?? $existing['media_path'];
        $media_type = $data['media_type'] ?? $existing['media_type'];
        $delay_ms = $data['delay_ms'] ?? 5000;

        // If media_type changed to embed, we must delete the old file if it existed
        if ($media_type === 'embed' && !empty($existing['media_path']) && $existing['media_type'] !== 'embed') {
            ImageUpload::deleteImageFiles($existing['media_path']);
            $media_path = null;
        }

        // Handle video upload
        if (isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
            $uploaded_path = handleVideoUpload($_FILES['video']);
            if (!empty($existing['video_path'])) {
                ImageUpload::deleteImageFiles($existing['video_path']);
            }
            $video_path = $uploaded_path;
        } elseif (isset($data['video_removed']) && $data['video_removed'] === 'true') {
             if (!empty($existing['video_path'])) {
                ImageUpload::deleteImageFiles($existing['video_path']);
            }
            $video_path = null;
        }

        // Handle popup media upload
        if (isset($_FILES['media']) && $_FILES['media']['error'] === UPLOAD_ERR_OK) {
            $uploaded_media_path = handleLandingMediaUpload($_FILES['media'], $media_type);
            // Delete old media if it was a file
            if (!empty($existing['media_path']) && $existing['media_type'] !== 'embed') {
                ImageUpload::deleteImageFiles($existing['media_path']);
            }
            $media_path = $uploaded_media_path;
        } elseif (isset($data['media_removed']) && $data['media_removed'] === 'true') {
             if (!empty($existing['media_path']) && $existing['media_type'] !== 'embed') {
                ImageUpload::deleteImageFiles($existing['media_path']);
            }
            $media_path = null;
        }
        
        // Final safety check: if we switched from a file type to another file type but didn't upload a new one, 
        // and the paths are different (which they shouldn't be unless explicitly set), delete the old one.
        // More importantly, if media_type is now 'embed', media_path must be null.
        if ($media_type === 'embed') {
            $media_path = null;
        }
        
        // Update the landing section
        $stmt = $pdo->prepare("
            UPDATE landing_sections 
            SET slug = ?, title = ?, subtitle = ?, collection_type = ?, 
                visibility = ?, video_input_method = ?, video_path = ?, video_embed_link = ?, 
                media_path = ?, media_type = ?, delay_ms = ?,
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        
        $result = $stmt->execute([
            $data['slug'],
            $data['title'] ?? null,
            $data['subtitle'] ?? null,
            $data['collection_type'],
            $data['visibility'] ?? 1,
            $video_input_method,
            $video_path,
            $video_embed_link,
            $media_path,
            $media_type,
            $delay_ms,
            $id
        ]);
        
        if (!$result) {
            throw new Exception("Failed to update landing section");
        }
        
        // Clear existing selected items
        $delete_stmt = $pdo->prepare("DELETE FROM landing_section_items WHERE section_id = ?");
        $delete_stmt->execute([$id]);
        
        // Insert new selected items
        // Note: When using FormData, arrays like selected_items might come in as selected_items[0], selected_items[1] etc.
        // PHP handles this if the name is selected_items[], but if it's JSON it's an array.
        // We should check how it's received.
        $selected_items = [];
        if (isset($data['selected_items'])) {
            if (is_array($data['selected_items'])) {
                $selected_items = $data['selected_items'];
            }
        }
        
        if (!empty($selected_items)) {
            foreach ($selected_items as $index => $item_id) {
                $item_stmt = $pdo->prepare("
                    INSERT INTO landing_section_items (section_id, item_id, item_order) 
                    VALUES (?, ?, ?)
                ");
                $item_stmt->execute([$id, $item_id, $index]);
            }
        }
        
        $pdo->commit();
        
        // Return the updated section
        $stmt = $pdo->prepare("
            SELECT ls.*, 
                   GROUP_CONCAT(lsi.item_id ORDER BY lsi.item_order SEPARATOR ',') as selected_items
            FROM landing_sections ls
            LEFT JOIN landing_section_items lsi ON ls.id = lsi.section_id
            WHERE ls.id = ?
            GROUP BY ls.id
        ");
        $stmt->execute([$id]);
        $section = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($section['selected_items']) {
            $section['selected_items'] = array_map('intval', explode(',', $section['selected_items']));
        } else {
            $section['selected_items'] = [];
        }
        
        send_json($section);
    } catch (Exception $e) {
        $pdo->rollback();
        send_json(['error' => 'Failed to update landing section', 'detail' => $e->getMessage()], 500);
    }
}

function delete_landing_section(PDO $pdo, $id) {
    try {
        $pdo->beginTransaction();
        
        // Delete landing section items first
        $stmt = $pdo->prepare("DELETE FROM landing_section_items WHERE section_id = ?");
        $stmt->execute([$id]);
        
        // Then delete the landing section
        $stmt = $pdo->prepare("DELETE FROM landing_sections WHERE id = ?");
        $result = $stmt->execute([$id]);
        
        if (!$result) {
            throw new Exception("Failed to delete landing section");
        }
        
        $pdo->commit();
        
        send_json(['message' => 'Landing section deleted successfully']);
    } catch (Exception $e) {
        $pdo->rollback();
        send_json(['error' => 'Failed to delete landing section', 'detail' => $e->getMessage()], 500);
    }
}