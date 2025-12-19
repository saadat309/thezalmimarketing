<?php
// api/routes/maps.php

require_once __DIR__ . '/../utils/ImageUpload.php';
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

function handle_maps($method, PDO $pdo, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) return get_map($pdo, $id);
            return list_maps($pdo);
        case 'POST':
            return create_map($pdo);
        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_map($pdo, $id);
        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_map($pdo, $id);
        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}

function list_maps(PDO $pdo) {
    $sql = "SELECT
                            md.id, md.title, md.slug, md.description, md.map_pic, md.map_thumb, md.pdf, md.hide, md.created_at, md.updated_at,
                            c.id AS city_id, c.name AS city_name,
                            s.id AS society_id, s.name AS society_name,
                            p.id AS phase_id, p.name AS phase_name
                         FROM map_docs md
                         LEFT JOIN cities c ON md.city_id = c.id
                         LEFT JOIN societies s ON md.society_id = s.id
                         LEFT JOIN phases p ON md.phase_id = p.id
                         WHERE 1=1";
    $params = [];

    // Hide filter
    if (!isset($_GET['all'])) {
        $sql .= " AND md.hide = 0";
    }

    // Available for filter (dashboard usage)
    if (isset($_GET['available_for'])) {
        $available_for = $_GET['available_for'];
        switch ($available_for) {
            case 'city':
                $sql .= " AND md.city_id IS NULL";
                break;
            case 'society':
                $sql .= " AND md.society_id IS NULL";
                break;
            case 'phase':
                $sql .= " AND md.phase_id IS NULL";
                break;
        }
    }

    // Search Query (Expanded)
    if (!empty($_GET['query'])) {
        $q = '%' . $_GET['query'] . '%';
        $sql .= " AND (
            md.title LIKE ? 
            OR md.description LIKE ? 
            OR c.name LIKE ? 
            OR s.name LIKE ? 
            OR p.name LIKE ?
        )";
        for ($i = 0; $i < 5; $i++) {
            $params[] = $q;
        }
    }

    // City Filter
    if (!empty($_GET['city'])) {
        $sql .= " AND c.name = ?";
        $params[] = $_GET['city'];
    }

    // Society Filter
    if (!empty($_GET['societyName'])) {
        $sql .= " AND s.name = ?";
        $params[] = $_GET['societyName'];
    }

    // Phase Filter
    if (!empty($_GET['phase'])) {
        $sql .= " AND p.name = ?";
        $params[] = $_GET['phase'];
    }
    
    $sql .= " ORDER BY md.id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    send_json($rows);
}

function get_map(PDO $pdo, $id) {
    $stmt = $pdo->prepare("SELECT
                            md.id, md.title, md.slug, md.description, md.map_pic, md.map_thumb, md.pdf, md.hide, md.created_at, md.updated_at,
                            md.city_id, c.name AS city_name,
                            md.society_id, s.name AS society_name,
                            md.phase_id, p.name AS phase_name
                         FROM map_docs md
                         LEFT JOIN cities c ON md.city_id = c.id
                         LEFT JOIN societies s ON md.society_id = s.id
                         LEFT JOIN phases p ON md.phase_id = p.id
                         WHERE md.id = ?");
    $stmt->execute([$id]);
    $map = $stmt->fetch();
    if (!$map) return send_json(['error' => 'Map not found'], 404);
    
    send_json($map);
}

function create_map(PDO $pdo) {
    $input = get_request_data();
    error_log("Input data for create_map: " . print_r($input, true));
    error_log("Files data for create_map: " . print_r($_FILES, true));

    if (empty($input['title'])) {
        return send_json(['error' => 'Title is required'], 400);
    }

    $slug = generate_unique_slug($pdo, 'map_docs', $input['title']);
    $map_pic = null;
    $map_thumb = null;
    $pdf = null;

    $description = $input['description'] ?? null;
    $hide = isset($input['hide']) ? (int)(bool)$input['hide'] : 0;
    
    $city_id = !empty($input['city_id']) && $input['city_id'] !== '0' ? $input['city_id'] : null;
    $society_id = !empty($input['society_id']) && $input['society_id'] !== '0' ? $input['society_id'] : null;
    $phase_id = !empty($input['phase_id']) && $input['phase_id'] !== '0' ? $input['phase_id'] : null;

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO map_docs (title, slug, description, hide, city_id, society_id, phase_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$input['title'], $slug, $description, $hide, $city_id, $society_id, $phase_id]);
        $new_map_id = $pdo->lastInsertId();

        if ($new_map_id) {
            // Handle map image
            if (isset($_FILES['mapImage']) && $_FILES['mapImage']['error'] === UPLOAD_ERR_OK) {
                $uploaded_images = ImageUpload::handleImageUpload($_FILES['mapImage'], 'map', $new_map_id);
                $map_pic = $uploaded_images['full_path'];
                $map_thumb = $uploaded_images['thumb_path'];
            } elseif (isset($input['map_pic_url']) && $input['map_pic_url']) {
                // If map_pic_url is provided, duplicate the existing image
                $duplicated_images = ImageUpload::duplicateImageFile($input['map_pic_url'], 'map', $new_map_id);
                $map_pic = $duplicated_images['full_path'];
                $map_thumb = $duplicated_images['thumb_path'];
            }

            // Handle map PDF
            if (isset($_FILES['mapPdf'])) {
                if ($_FILES['mapPdf']['error'] === UPLOAD_ERR_OK) {
                    $upload_dir = ImageUpload::getPublicPath() . DIRECTORY_SEPARATOR . 'pdf_docs' . DIRECTORY_SEPARATOR . 'maps' . DIRECTORY_SEPARATOR;
                    if (!is_dir($upload_dir)) {
                        if (!mkdir($upload_dir, 0755, true)) {
                            throw new Exception("Failed to create PDF upload directory.");
                        }
                    }
                    $file_extension = strtolower(pathinfo($_FILES['mapPdf']['name'], PATHINFO_EXTENSION));
                    $new_file_name = 'map_' . $new_map_id . '.' . $file_extension;
                    $target_file = $upload_dir . $new_file_name;
                    
                    if (!move_uploaded_file($_FILES['mapPdf']['tmp_name'], $target_file)) {
                        throw new Exception("PDF upload failed: unable to move file.");
                    }
                    $pdf = '/pdf_docs/maps/' . $new_file_name;
                } elseif ($_FILES['mapPdf']['error'] === UPLOAD_ERR_INI_SIZE || $_FILES['mapPdf']['error'] === UPLOAD_ERR_FORM_SIZE) {
                    throw new Exception("PDF file is too large for server limits.");
                }
            } elseif (isset($input['pdf_url']) && $input['pdf_url']) {
                // If pdf_url is provided, duplicate the existing PDF
                $original_pdf_path_relative = ltrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $input['pdf_url']), DIRECTORY_SEPARATOR);
                $original_pdf_path = ImageUpload::getPublicPath() . DIRECTORY_SEPARATOR . $original_pdf_path_relative;
                if (file_exists($original_pdf_path)) {
                    $upload_dir = ImageUpload::getPublicPath() . DIRECTORY_SEPARATOR . 'pdf_docs' . DIRECTORY_SEPARATOR . 'maps' . DIRECTORY_SEPARATOR;
                    if (!is_dir($upload_dir)) {
                        if (!mkdir($upload_dir, 0755, true)) {
                            throw new Exception("Failed to create PDF upload directory.");
                        }
                    }
                    $file_extension = strtolower(pathinfo($original_pdf_path, PATHINFO_EXTENSION));
                    $new_file_name = 'map_' . $new_map_id . '.' . $file_extension;
                    $target_file = $upload_dir . $new_file_name;

                    if (!copy($original_pdf_path, $target_file)) {
                        throw new Exception("PDF duplication failed.");
                    }
                    $pdf = '/pdf_docs/maps/' . $new_file_name;
                } else {
                    throw new Exception("Original PDF file not found for duplication: " . $original_pdf_path);
                }
            }

            $update_stmt = $pdo->prepare("UPDATE map_docs SET map_pic = ?, map_thumb = ?, pdf = ? WHERE id = ?");
            $update_stmt->execute([$map_pic, $map_thumb, $pdf, $new_map_id]);

        } else {
            $pdo->rollBack();
            return send_json(['error' => 'Failed to create map record.'], 500);
        }

        $pdo->commit();
        return get_map($pdo, $new_map_id);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during map creation: " . $e->getMessage());
        return send_json(['error' => 'Insert failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Exception during map creation: " . $e->getMessage());
        return send_json(['error' => 'Error during map creation', 'detail' => $e->getMessage()], 500);
    }
}

function update_map(PDO $pdo, $id) {
    $input = get_request_data();
    error_log("--- UPDATE MAP DEBUG (ID: $id) ---");
    error_log("Input data received: " . print_r($input, true));
    error_log("Files data received: " . print_r($_FILES, true));

    $stmt = $pdo->prepare("SELECT id, title, slug, description, map_pic, map_thumb, pdf, hide, city_id, society_id, phase_id FROM map_docs WHERE id = ?");
    $stmt->execute([$id]);
    $exists = $stmt->fetch();
    if (!$exists) return send_json(['error' => 'Map not found'], 404);
    error_log("Existing map data (from DB): " . print_r($exists, true));

    $title = $input['title'] ?? $exists['title'];
    $slug = $exists['slug'];

    if (isset($input['title']) && $input['title'] !== $exists['title']) {
        $slug = generate_unique_slug($pdo, 'map_docs', $input['title'], $id);
    }

    $description = $input['description'] ?? $exists['description'];
    $hide = isset($input['hide']) ? (int)(bool)$input['hide'] : (int)(bool)$exists['hide'];
    
    $city_id = isset($input['city_id']) ? (!empty($input['city_id']) && $input['city_id'] !== '0' ? $input['city_id'] : null) : $exists['city_id'];
    $society_id = isset($input['society_id']) ? (!empty($input['society_id']) && $input['society_id'] !== '0' ? $input['society_id'] : null) : $exists['society_id'];
    $phase_id = isset($input['phase_id']) ? (!empty($input['phase_id']) && $input['phase_id'] !== '0' ? $input['phase_id'] : null) : $exists['phase_id'];

    $current_map_pic = $exists['map_pic'];
    $current_map_thumb = $exists['map_thumb'];
    $current_pdf = $exists['pdf'];

    $new_map_pic = $current_map_pic;
    $new_map_thumb = $current_map_thumb;
    $new_pdf = $current_pdf;

    $pdo->beginTransaction();
    try {
        if (isset($_FILES['mapImage']) && $_FILES['mapImage']['error'] === UPLOAD_ERR_OK) {
            if ($current_map_pic) {
                ImageUpload::deleteImageFiles($current_map_pic, $current_map_thumb);
            }
            $uploaded_images = ImageUpload::handleImageUpload($_FILES['mapImage'], 'map', $id);
            $new_map_pic = $uploaded_images['full_path'];
            $new_map_thumb = $uploaded_images['thumb_path'];
        } elseif (isset($input['mapImage_removed']) && $input['mapImage_removed'] === 'true') {
            if ($current_map_pic) {
                ImageUpload::deleteImageFiles($current_map_pic, $current_map_thumb);
            }
            $new_map_pic = null;
            $new_map_thumb = null;
        }

        if (isset($_FILES['mapPdf'])) {
            if ($_FILES['mapPdf']['error'] === UPLOAD_ERR_OK) {
                if ($current_pdf) {
                    ImageUpload::deleteImageFiles($current_pdf);
                }
                
                $upload_dir = ImageUpload::getPublicPath() . DIRECTORY_SEPARATOR . 'pdf_docs' . DIRECTORY_SEPARATOR . 'maps' . DIRECTORY_SEPARATOR;
                if (!is_dir($upload_dir)) {
                    if (!mkdir($upload_dir, 0755, true)) {
                        throw new Exception("Failed to create PDF upload directory.");
                    }
                }
                $file_extension = strtolower(pathinfo($_FILES['mapPdf']['name'], PATHINFO_EXTENSION));
                $new_file_name = 'map_' . $id . '.' . $file_extension;
                $target_file = $upload_dir . $new_file_name;
                
                if (!move_uploaded_file($_FILES['mapPdf']['tmp_name'], $target_file)) {
                    throw new Exception("PDF upload failed: unable to move file.");
                }
                $new_pdf = '/pdf_docs/maps/' . $new_file_name;
            } elseif ($_FILES['mapPdf']['error'] === UPLOAD_ERR_INI_SIZE || $_FILES['mapPdf']['error'] === UPLOAD_ERR_FORM_SIZE) {
                throw new Exception("PDF file is too large for server limits.");
            }
        } elseif (isset($input['mapPdf_removed']) && $input['mapPdf_removed'] === 'true') {
            if ($current_pdf) {
                ImageUpload::deleteImageFiles($current_pdf);
            }
            $new_pdf = null;
        }

        $update_params = [
            $title, $slug, $description, $new_map_pic, $new_map_thumb, $new_pdf, $hide, $city_id, $society_id, $phase_id, $id
        ];
        error_log("Final params for UPDATE: " . print_r($update_params, true));
        $stmt = $pdo->prepare("UPDATE map_docs SET title = ?, slug = ?, description = ?, map_pic = ?, map_thumb = ?, pdf = ?, hide = ?, city_id = ?, society_id = ?, phase_id = ? WHERE id = ?");
        $stmt->execute($update_params);
        $affected_rows = $stmt->rowCount();
        error_log("UPDATE affected rows: " . $affected_rows);
        
        $pdo->commit();
        return get_map($pdo, $id);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during map update: " . $e->getMessage());
        return send_json(['error' => 'Update failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Exception during map update: " . $e->getMessage());
        return send_json(['error' => 'Error during map update', 'detail' => $e->getMessage()], 500);
    } finally {
        error_log("--- END UPDATE MAP DEBUG ---");
    }
}

function delete_map(PDO $pdo, $id) {
    $stmt = $pdo->prepare("SELECT map_pic, map_thumb, pdf FROM map_docs WHERE id = ?");
    $stmt->execute([$id]);
    $map = $stmt->fetch();

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("DELETE FROM map_docs WHERE id = ?");
        $stmt->execute([$id]);

        if ($map) {
            if ($map['map_pic']) {
                ImageUpload::deleteImageFiles($map['map_pic'], $map['map_thumb']);
            }
            if ($map['pdf']) {
                ImageUpload::deleteImageFiles($map['pdf']);
            }
        }
        $pdo->commit();
        http_response_code(204);
        exit;
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during map deletion: " . $e->getMessage());
        return send_json(['error' => 'Delete failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Exception during map deletion: " . $e->getMessage());
        return send_json(['error' => 'Error during map deletion', 'detail' => $e->getMessage()], 500);
    }
}