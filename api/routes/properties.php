<?php
// api/routes/properties.php

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

    // For POST, PUT, PATCH requests
    // First, try to get data from $_POST (for x-www-form-urlencoded or multipart/form-data if files are present)
    if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
        $data = $_POST;

        // If $_POST is empty, and there are no files, try to parse JSON from php://input
        // This handles application/json requests.
        if (empty($data) && empty($_FILES)) {
            $raw = file_get_contents('php://input');
            $json_data = json_decode($raw, true);
            if (is_array($json_data)) {
                $data = $json_data;
            }
        }
    }
    // For GET requests, try to get data from $_GET
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $data = $_GET;
    }
    return $data;
}

function handle_properties($method, PDO $pdo, $id = null) {
    // Get all request data, including _method if present
    $request_data = get_request_data();
    
    // Check for method override (e.g., for PATCH/PUT via POST)
    $actual_method = $method;
    if (isset($request_data['_method'])) {
        $actual_method = strtoupper($request_data['_method']);
    }

    switch ($actual_method) {
        case 'GET':
            if ($id) return get_property($pdo, $id);
            $is_file_filter = isset($request_data['is_file']) ? (bool)$request_data['is_file'] : null;
            return list_properties($pdo, $is_file_filter);
        case 'POST':
            return create_property($pdo);
        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            // Pass the request_data to update_property
            return update_property($pdo, $id, $request_data); 
        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_property($pdo, $id);
        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}

function get_property_media(PDO $pdo, $media_id) {
    if (!$media_id) return ['gallery_images' => [], 'thumbnail_image' => null, 'video' => null];

    $stmt = $pdo->prepare("SELECT video, video_embed_link FROM medias WHERE id = ?");
    $stmt->execute([$media_id]);
    $media_info = $stmt->fetch();

    $gallery_images = [];
    $thumbnail_image = null;

    $stmt = $pdo->prepare("SELECT id, path, thumb_path, alt, position, is_card_pic, hide FROM images WHERE media_id = ? ORDER BY position ASC");
    $stmt->execute([$media_id]);
    $images = $stmt->fetchAll();

    foreach ($images as $img) {
        if ($img['is_card_pic']) {
            $thumbnail_image = $img;
        } else {
            $gallery_images[] = $img;
        }
    }

    $video_data = null;
    if ($media_info) {
        if (!empty($media_info['video'])) {
            $video_data = ['type' => 'upload', 'path' => $media_info['video']];
        } elseif (!empty($media_info['video_embed_link'])) {
            $video_data = ['type' => 'embed', 'video_embed_link' => $media_info['video_embed_link']];
        }
    }

    return [
        'gallery_images' => $gallery_images,
        'thumbnail_image' => $thumbnail_image,
        'video' => $video_data
    ];
}

function get_property_labels(PDO $pdo, $property_id) {
    $stmt = $pdo->prepare("SELECT pl.label_id, l.name, l.slug, l.is_badge, l.badge_variant, l.is_filter FROM property_labels pl JOIN labels l ON pl.label_id = l.id WHERE pl.property_id = ? ORDER BY pl.position ASC");
    $stmt->execute([$property_id]);
    return $stmt->fetchAll();
}

function get_property_related_properties(PDO $pdo, $property_id) {
    $stmt = $pdo->prepare("SELECT prp.related_property_id, p.title, p.slug FROM property_related_properties prp JOIN properties p ON prp.related_property_id = p.id WHERE prp.property_id = ? ORDER BY prp.position ASC");
    $stmt->execute([$property_id]);
    return $stmt->fetchAll();
}

function get_property_detail_description(PDO $pdo, $detail_description_id) {
    if (!$detail_description_id) return null;
    $stmt = $pdo->prepare("SELECT text FROM detail_descriptions WHERE id = ?");
    $stmt->execute([$detail_description_id]);
    $desc = $stmt->fetch();
    return $desc ? $desc['text'] : null;
}

/**
 * Handles uploading a video file to the server.
 */
function handleVideoUpload(array $file, string $entity_name, string $record_id) {
    if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Video upload error code: " . ($file['error'] ?? 'unknown'));
    }

    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        throw new Exception("Invalid video upload attempt.");
    }

    $uploadDir = ImageUpload::getPublicPath() . DIRECTORY_SEPARATOR . 'videos' . DIRECTORY_SEPARATOR . 'properties' . DIRECTORY_SEPARATOR;
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        throw new Exception("Failed to create video directory.");
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $uniqueName = uniqid($entity_name . '_' . $record_id . '_', true);
    $fileName = $uniqueName . '.' . $extension;
    $targetPath = $uploadDir . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new Exception("Failed to move uploaded video file.");
    }

    return '/videos/properties/' . $fileName;
}


function list_properties(PDO $pdo, $is_file_filter = null) {
    $sql = "SELECT
                p.id, p.title, p.slug, p.property_type, p.is_file, p.file_type, p.purchase_type, p.is_furnished, p.short_desc, p.address, p.features,
                p.beds, p.baths, p.area, p.unit, p.price_amount, p.is_discounted, p.price_original_amount, p.price_period_unit, p.price_period_value,
                p.installment_advance_amount, p.installment_total_period_text, p.installment_amount, p.installment_display_mode,
                p.media_id, p.category_id, p.city_id, p.society_id, p.phase_id, p.embed_link, p.hide, p.created_at, p.updated_at,
                c.name AS category_name,
                ci.name AS city_name,
                s.name AS society_name,
                ph.name AS phase_name,
                dd.text AS detailed_description_content,
                (SELECT i.path FROM images i WHERE i.media_id = p.media_id AND i.is_card_pic = TRUE ORDER BY i.position ASC LIMIT 1) AS thumbnail_url
            FROM properties p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN cities ci ON p.city_id = ci.id
            LEFT JOIN societies s ON p.society_id = s.id
            LEFT JOIN phases ph ON p.phase_id = ph.id
            LEFT JOIN detail_descriptions dd ON p.detail_description_id = dd.id
            WHERE 1=1
            ";

    $params = [];
    
    // File Filter
    if ($is_file_filter === null) {
        $sql .= " AND p.is_file = ?";
        $params[] = 0;
    } else {
        $sql .= " AND p.is_file = ?";
        $params[] = (int)$is_file_filter;
    }

    // Hide filter (usually want only visible ones on frontend)
    // If we are in dashboard context, we might want all, but generic list is usually public
    if (!isset($_GET['all'])) {
        $sql .= " AND p.hide = 0";
    }

    // Search Query (Expanded)
    if (!empty($_GET['query'])) {
        $q = '%' . $_GET['query'] . '%';
        $sql .= " AND (
            p.title LIKE ? 
            OR p.short_desc LIKE ? 
            OR p.address LIKE ? 
            OR c.name LIKE ? 
            OR ci.name LIKE ? 
            OR s.name LIKE ? 
            OR ph.name LIKE ?
            OR EXISTS (SELECT 1 FROM property_labels pl JOIN labels l ON pl.label_id = l.id WHERE pl.property_id = p.id AND l.name LIKE ?)
        )";
        for ($i = 0; $i < 8; $i++) {
            $params[] = $q;
        }
    }

    // Category Filter
    if (!empty($_GET['category'])) {
        $sql .= " AND c.name = ?";
        $params[] = $_GET['category'];
    }

    // City Filter
    if (!empty($_GET['city'])) {
        $sql .= " AND ci.name = ?";
        $params[] = $_GET['city'];
    }

    // Society Filter
    if (!empty($_GET['societyName'])) {
        $sql .= " AND s.name = ?";
        $params[] = $_GET['societyName'];
    }

    // Phase Filter
    if (!empty($_GET['phase'])) {
        $sql .= " AND ph.name = ?";
        $params[] = $_GET['phase'];
    }

    // Property Type Filter
    if (!empty($_GET['property_type'])) {
        $sql .= " AND p.property_type = ?";
        $params[] = $_GET['property_type'];
    }

    // Purchase Type Filter
    if (!empty($_GET['priceType'])) {
        $sql .= " AND p.purchase_type = ?";
        $params[] = $_GET['priceType'];
    }

    // Label Filter
    if (!empty($_GET['label'])) {
        $sql .= " AND EXISTS (SELECT 1 FROM property_labels pl JOIN labels l ON pl.label_id = l.id WHERE pl.property_id = p.id AND l.name = ?)";
        $params[] = $_GET['label'];
    }

    // Beds/Baths (Min value check)
    if (!empty($_GET['beds'])) {
        $sql .= " AND p.beds >= ?";
        $params[] = (int)$_GET['beds'];
    }
    if (!empty($_GET['baths'])) {
        $sql .= " AND p.baths >= ?";
        $params[] = (int)$_GET['baths'];
    }

    // Area Size Filter
    if (!empty($_GET['area'])) {
        $sql .= " AND p.area >= ?";
        $params[] = (int)$_GET['area'];
    }
    if (!empty($_GET['areaUnit'])) {
        $sql .= " AND p.unit = ?";
        $params[] = $_GET['areaUnit'];
    }

    $sql .= " ORDER BY p.id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($properties as &$property) {
        $property['labels'] = get_property_labels($pdo, $property['id']);
        $property['related_properties'] = get_property_related_properties($pdo, $property['id']);
        // Fetch all media for list as requested
        $property['media'] = get_property_media($pdo, $property['media_id']);
    }
    send_json($properties);
}

function get_property(PDO $pdo, $id) {
    $sql = "SELECT
                p.id, p.title, p.slug, p.property_type, p.is_file, p.file_type, p.purchase_type, p.is_furnished, p.short_desc, p.address, p.features,
                p.beds, p.baths, p.area, p.unit, p.price_amount, p.is_discounted, p.price_original_amount, p.price_period_unit, p.price_period_value,
                p.installment_advance_amount, p.installment_total_period_text, p.installment_amount, p.installment_display_mode,
                p.media_id, p.category_id, p.city_id, p.society_id, p.phase_id, p.embed_link, p.hide, p.created_at, p.updated_at, p.detail_description_id,
                c.name AS category_name,
                ci.name AS city_name,
                s.name AS society_name,
                ph.name AS phase_name
            FROM properties p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN cities ci ON p.city_id = ci.id
            LEFT JOIN societies s ON p.society_id = s.id
            LEFT JOIN phases ph ON p.phase_id = ph.id
            WHERE p.id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    $property = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$property) return send_json(['error' => 'Property not found'], 404);

    $property['media'] = get_property_media($pdo, $property['media_id']);
    $property['labels'] = get_property_labels($pdo, $property['id']);
    $property['related_properties'] = get_property_related_properties($pdo, $property['id']);
    $property['detailed_description_content'] = get_property_detail_description($pdo, $property['detail_description_id']);

    send_json($property);
}

function create_property(PDO $pdo) {
    $input = get_request_data();
    error_log("Input data for create_property: " . print_r($input, true));
    error_log("Files data for create_property: " . print_r($_FILES, true));

    if (empty($input['title'])) {
        return send_json(['error' => 'Title is required'], 400);
    }

    $slug = generate_unique_slug($pdo, 'properties', $input['title']);

    try {
        $pdo->beginTransaction();

        // 1. Create medias entry (even if empty, will be updated)
        $stmt = $pdo->prepare("INSERT INTO medias (video, video_embed_link) VALUES (?, ?)");
        $stmt->execute([null, null]); // Placeholder values
        $media_id = $pdo->lastInsertId();

        // 2. Create detail_description entry (if content provided)
        $detail_description_id = null;
        if (!empty($input['detailed_description_content'])) {
            $stmt = $pdo->prepare("INSERT INTO detail_descriptions (text) VALUES (?)");
            $stmt->execute([$input['detailed_description_content']]);
            $detail_description_id = $pdo->lastInsertId();
        }

        // 3. Insert property
        $stmt = $pdo->prepare("INSERT INTO properties (
            title, slug, property_type, is_file, file_type, purchase_type, is_furnished, short_desc, address, features,
            beds, baths, area, unit, price_amount, is_discounted, price_original_amount, price_period_unit, price_period_value,
            installment_advance_amount, installment_total_period_text, installment_amount, installment_display_mode,
            media_id, category_id, city_id, society_id, phase_id, embed_link, hide, detail_description_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->execute([
            $input['title'],
            $slug,
            $input['property_type'] ?? 'Residential',
            isset($input['is_file']) ? (int)(bool)$input['is_file'] : 0,
            $input['file_type'] ?? 'Affidavit',
            $input['purchase_type'] ?? 'sale',
            isset($input['is_furnished']) ? (int)(bool)$input['is_furnished'] : 1,
            $input['short_desc'] ?? null,
            $input['address'] ?? null,
            $input['features'] ?? null,
            $input['beds'] ?? 0,
            $input['baths'] ?? 0,
            $input['area'] ?? 0,
            $input['unit'] ?? 'sqft',
            $input['price_amount'] ?? 0,
            isset($input['is_discounted']) ? (int)(bool)$input['is_discounted'] : 0,
            $input['price_original_amount'] ?? 0,
            $input['price_period_unit'] ?? 'month',
            $input['price_period_value'] ?? 1,
            $input['installment_advance_amount'] ?? 0,
            $input['installment_total_period_text'] ?? null,
            $input['installment_amount'] ?? 0,
            $input['installment_display_mode'] ?? 'installment',
            $media_id,
            empty($input['category_id']) ? null : $input['category_id'],
            empty($input['city_id']) ? null : $input['city_id'],
            empty($input['society_id']) ? null : $input['society_id'],
            empty($input['phase_id']) ? null : $input['phase_id'],
            $input['embed_link'] ?? null,
            isset($input['hide']) ? (int)(bool)$input['hide'] : 0,
            $detail_description_id
        ]);
        $property_id = $pdo->lastInsertId();

        if (!$property_id) {
            $pdo->rollBack();
            return send_json(['error' => 'Failed to create property record.'], 500);
        }

        // 4. Handle Media (Images and Video)
        $image_position = 0;

        // Process thumbnail image (is_card_pic = true)
        if (isset($_FILES['thumbnail_image']) && $_FILES['thumbnail_image']['error'] === UPLOAD_ERR_OK) {
            $uploaded_images = ImageUpload::handleImageUpload($_FILES['thumbnail_image'], 'property_thumb', $property_id);
            if ($uploaded_images) {
                $stmt = $pdo->prepare("INSERT INTO images (media_id, path, thumb_path, alt, position, is_card_pic) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$media_id, $uploaded_images['full_path'], $uploaded_images['thumb_path'], $input['title'] . ' Thumbnail', $image_position++, 1]);
            } else {
                $pdo->rollBack();
                return send_json(['error' => 'Thumbnail image upload failed.'], 500);
            }
        } elseif (isset($input['thumbnail_image_url']) && $input['thumbnail_image_url']) {
            $original_thumb_path_relative = ltrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $input['thumbnail_image_url']), DIRECTORY_SEPARATOR);
            $original_thumb_file_path = ImageUpload::getPublicPath() . DIRECTORY_SEPARATOR . $original_thumb_path_relative;
            if (file_exists($original_thumb_file_path)) {
                $duplicated_images = ImageUpload::duplicateImageFile($input['thumbnail_image_url'], 'property_thumb', $property_id);
                if ($duplicated_images) {
                    $stmt = $pdo->prepare("INSERT INTO images (media_id, path, thumb_path, alt, position, is_card_pic) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$media_id, $duplicated_images['full_path'], $duplicated_images['thumb_path'], $input['title'] . ' Thumbnail', $image_position++, 1]);
                } else {
                    $pdo->rollBack();
                    return send_json(['error' => 'Thumbnail image duplication failed.'], 500);
                }
            } else {
                error_log("Warning: Original thumbnail file not found for duplication: " . $original_thumb_file_path);
                // Continue without thumbnail, don't rollBack
            }
        }


        // Process gallery images (is_card_pic = false)
        // Image position starts after thumbnail (if uploaded)
        $current_gallery_image_position = $image_position;
        $incoming_gallery_images_data = isset($input['gallery_images_data']) && is_array($input['gallery_images_data']) ? $input['gallery_images_data'] : [];
        
        foreach ($incoming_gallery_images_data as $key => $image_data) {
            // Handle new file upload (if it's a new item marked with is_new and has a file)
            if (isset($image_data['is_new']) && $image_data['is_new'] === 'true' && isset($_FILES['gallery_images']['name'][$key]) && $_FILES['gallery_images']['error'][$key] === UPLOAD_ERR_OK) {
                $file_to_upload = [
                    'name' => $_FILES['gallery_images']['name'][$key],
                    'type' => $_FILES['gallery_images']['type'][$key],
                    'tmp_name' => $_FILES['gallery_images']['tmp_name'][$key],
                    'error' => $_FILES['gallery_images']['error'][$key],
                    'size' => $_FILES['gallery_images']['size'][$key],
                ];
                $uploaded_images = ImageUpload::handleImageUpload($file_to_upload, 'property_gallery', $property_id . '_' . $key);
                if ($uploaded_images) {
                    $stmt = $pdo->prepare("INSERT INTO images (media_id, path, thumb_path, alt, position, is_card_pic) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$media_id, $uploaded_images['full_path'], $uploaded_images['thumb_path'], $input['title'] . ' Gallery ' . $key, $current_gallery_image_position++, 0]);
                } else {
                    $pdo->rollBack();
                    return send_json(['error' => 'Gallery image upload failed.'], 500);
                }
            } 
            // Handle new image from existing URL (duplication)
            elseif (isset($image_data['url']) && $image_data['url']) {
                $original_gallery_path_relative = ltrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $image_data['url']), DIRECTORY_SEPARATOR);
                $original_gallery_file_path = ImageUpload::getPublicPath() . DIRECTORY_SEPARATOR . $original_gallery_path_relative;
                if (file_exists($original_gallery_file_path)) {
                    $duplicated_images = ImageUpload::duplicateImageFile($image_data['url'], 'property_gallery', $property_id . '_' . $key);
                    if ($duplicated_images) {
                        $stmt = $pdo->prepare("INSERT INTO images (media_id, path, thumb_path, alt, position, is_card_pic) VALUES (?, ?, ?, ?, ?, ?)");
                        $stmt->execute([$media_id, $duplicated_images['full_path'], $duplicated_images['thumb_path'], $input['title'] . ' Gallery ' . $key, $current_gallery_image_position++, 0]);
                    } else {
                        $pdo->rollBack();
                        return send_json(['error' => 'Gallery image duplication failed.'], 500);
                    }
                } else {
                    error_log("Warning: Original gallery image file not found for duplication: " . $original_gallery_file_path);
                    // Continue without duplicating this image, don't rollBack
                }
            }
        }

        // Process video
        if (isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
            $uploaded_video_path = handleVideoUpload($_FILES['video'], 'property_video', $property_id);
            $stmt = $pdo->prepare("UPDATE medias SET video = ?, video_embed_link = NULL WHERE id = ?");
            $stmt->execute([$uploaded_video_path, $media_id]);
        } elseif (isset($input['video_url']) && $input['video_url']) {
             // Duplicate existing video file
             $original_video_path_relative = ltrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $input['video_url']), DIRECTORY_SEPARATOR);
             $original_video_path = ImageUpload::getPublicPath() . DIRECTORY_SEPARATOR . $original_video_path_relative;
             if (file_exists($original_video_path)) {
                 $upload_dir = ImageUpload::getPublicPath() . DIRECTORY_SEPARATOR . 'videos' . DIRECTORY_SEPARATOR . 'properties' . DIRECTORY_SEPARATOR;
                 if (!is_dir($upload_dir)) {
                     mkdir($upload_dir, 0755, true);
                 }
                 $file_extension = pathinfo($original_video_path, PATHINFO_EXTENSION);
                 $new_file_name = uniqid('property_video_' . $property_id . '_', true) . '.' . $file_extension;
                 $target_file = $upload_dir . $new_file_name;

                 if (copy($original_video_path, $target_file)) {
                     $new_video_path = '/videos/properties/' . $new_file_name;
                     $stmt = $pdo->prepare("UPDATE medias SET video = ?, video_embed_link = NULL WHERE id = ?");
                     $stmt->execute([$new_video_path, $media_id]);
                 } else {
                     $pdo->rollBack();
                     return send_json(['error' => 'Video duplication failed.'], 500);
                 }
             } else {
                 // Warning: Original video not found, proceeding without video
                 error_log("Warning: Original video file not found for duplication: " . $original_video_path);
                 // Don't rollBack, just skip this video.
             }
        } elseif (!empty($input['video_embed_link'])) {
            $stmt = $pdo->prepare("UPDATE medias SET video = NULL, video_embed_link = ? WHERE id = ?");
            $stmt->execute([$input['video_embed_link'], $media_id]);
        }

        // 5. Handle Related Properties
        if (isset($input['related_properties']) && is_array($input['related_properties'])) {
            $position = 0;
            foreach ($input['related_properties'] as $related_property_id) {
                $stmt = $pdo->prepare("INSERT INTO property_related_properties (property_id, related_property_id, position) VALUES (?, ?, ?)");
                $stmt->execute([$property_id, $related_property_id, $position++]);
            }
        }

        // 6. Handle Labels
        $final_label_ids_for_property = [];

        // Process new labels to create
        if (isset($input['new_labels_to_create']) && !empty($input['new_labels_to_create'])) {
            $new_labels_data = json_decode($input['new_labels_to_create'], true);
            foreach ($new_labels_data as $new_label) {
                $stmt = $pdo->prepare("INSERT INTO labels (name, is_badge, is_filter, badge_variant) VALUES (?, ?, ?, ?)");
                $stmt->execute([
                    $new_label['name'],
                    $new_label['is_badge'],
                    $new_label['is_filter'],
                    $new_label['badge_variant']
                ]);
                $final_label_ids_for_property[] = $pdo->lastInsertId();
            }
        }

        // Add existing labels
        if (isset($input['existing_labels']) && is_array($input['existing_labels'])) {
            foreach ($input['existing_labels'] as $existing_label_id) {
                // Ensure the existing_label_id is valid before adding to the list
                if (!empty($existing_label_id)) {
                    $final_label_ids_for_property[] = $existing_label_id;
                }
            }
        }
        
        // Insert all final labels into property_labels
        $position = 0;
        foreach ($final_label_ids_for_property as $label_id) {
            $stmt = $pdo->prepare("INSERT INTO property_labels (property_id, label_id, position) VALUES (?, ?, ?)");
            $stmt->execute([$property_id, $label_id, $position++]);
        }


        $pdo->commit();
        return get_property($pdo, $property_id);

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) { // Check if transaction is active
            $pdo->rollBack();
        }
        error_log("PDOException during property creation: " . $e->getMessage());
        return send_json(['error' => 'Insert failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) { // Check if transaction is active
            $pdo->rollBack();
        }
        error_log("Exception during property creation: " . $e->getMessage());
        return send_json(['error' => 'Error during property creation', 'detail' => $e->getMessage()], 500);
    }
}

function update_property(PDO $pdo, $id, $input_data = null) {
    $input = $input_data ?? get_request_data();
    error_log("Input data for update_property (ID: $id): " . print_r($input, true));
    error_log("Files data for update_property (ID: $id): " . print_r($_FILES, true));

    $stmt = $pdo->prepare("SELECT * FROM properties WHERE id = ?");
    $stmt->execute([$id]);
    $exists = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$exists) return send_json(['error' => 'Property not found'], 404);

    $slug = $exists['slug'];
    if (isset($input['title']) && $input['title'] !== $exists['title']) {
        $slug = generate_unique_slug($pdo, 'properties', $input['title'], $id);
    }

    try {
        $pdo->beginTransaction();
        // 1. Update detail_description entry
        $detail_description_id = $exists['detail_description_id'];
        if (isset($input['detailed_description_content'])) { // Check if the field was sent
            if (!empty($input['detailed_description_content'])) {
                if ($detail_description_id) {
                    $stmt = $pdo->prepare("UPDATE detail_descriptions SET text = ? WHERE id = ?");
                    $stmt->execute([$input['detailed_description_content'], $detail_description_id]);
                } else {
                    $stmt = $pdo->prepare("INSERT INTO detail_descriptions (text) VALUES (?)");
                    $stmt->execute([$input['detailed_description_content']]);
                    $detail_description_id = $pdo->lastInsertId();
                }
            } elseif ($detail_description_id) { // Content is empty, and a description existed
                $stmt = $pdo->prepare("DELETE FROM detail_descriptions WHERE id = ?");
                $stmt->execute([$detail_description_id]);
                $detail_description_id = null;
            }
        }


        // 2. Update properties table
        $update_fields = [];
        $update_values = [];

        foreach ([
            'title', 'property_type', 'is_file', 'file_type', 'purchase_type', 'is_furnished', 'short_desc', 'address', 'features',
            'beds', 'baths', 'area', 'unit', 'price_amount', 'is_discounted', 'price_original_amount', 'price_period_unit', 'price_period_value',
            'installment_advance_amount', 'installment_total_period_text', 'installment_amount', 'installment_display_mode',
            'category_id', 'city_id', 'society_id', 'phase_id', 'embed_link', 'hide'
        ] as $field) {
            if (isset($input[$field])) {
                $update_fields[] = "$field = ?";
                $value = $input[$field];
                // Convert boolean-like strings to integers
                if (in_array($field, ['is_file', 'is_furnished', 'is_discounted', 'hide'])) {
                    $value = (int)(bool)$value;
                }
                // Handle null for relationship IDs if sent as empty string or 0
                if (in_array($field, ['category_id', 'city_id', 'society_id', 'phase_id']) && (empty($value) || $value === '0')) {
                    $value = null;
                }
                $update_values[] = $value;
            }
        }
        $update_fields[] = "slug = ?";
        $update_values[] = $slug;
        $update_fields[] = "detail_description_id = ?";
        $update_values[] = $detail_description_id;
        $update_fields[] = "updated_at = CURRENT_TIMESTAMP"; // Ensure updated_at is touched

        $update_sql = "UPDATE properties SET " . implode(', ', $update_fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($update_sql);
        $stmt->execute(array_merge($update_values, [$id]));

        // 3. Handle Media (Images and Video)
        $media_id = $exists['media_id'];
        if (!$media_id) {
            // If property didn't have media_id, create a new one
            $stmt = $pdo->prepare("INSERT INTO medias (video, video_embed_link) VALUES (?, ?)");
            $stmt->execute([null, null]);
            $media_id = $pdo->lastInsertId();
            $stmt = $pdo->prepare("UPDATE properties SET media_id = ? WHERE id = ?");
            $stmt->execute([$media_id, $id]);
        }

        // Clean up old images if they are being replaced or removed
        $current_media = get_property_media($pdo, $media_id);

        // Thumbnail image handling
        // Check if a new file is uploaded
        if (isset($_FILES['thumbnail_image']) && $_FILES['thumbnail_image']['error'] === UPLOAD_ERR_OK) {
            // Delete old thumbnail if it exists
            if ($current_media['thumbnail_image']) {
                ImageUpload::deleteImageFiles($current_media['thumbnail_image']['path'], $current_media['thumbnail_image']['thumb_path']);
                $stmt = $pdo->prepare("DELETE FROM images WHERE id = ?");
                $stmt->execute([$current_media['thumbnail_image']['id']]);
            }
            // Upload new thumbnail
            $uploaded_images = ImageUpload::handleImageUpload($_FILES['thumbnail_image'], 'property_thumb', $id);
            if ($uploaded_images) {
                $stmt = $pdo->prepare("INSERT INTO images (media_id, path, thumb_path, alt, position, is_card_pic) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$media_id, $uploaded_images['full_path'], $uploaded_images['thumb_path'], $input['title'] . ' Thumbnail', 0, 1]);
            } else {
                $pdo->rollBack();
                return send_json(['error' => 'Thumbnail image upload failed during update.'], 500);
            }
        } elseif (isset($input['thumbnail_image_removed']) && $input['thumbnail_image_removed'] === 'true') { // Check for explicit removal
            if ($current_media['thumbnail_image']) {
                ImageUpload::deleteImageFiles($current_media['thumbnail_image']['path'], $current_media['thumbnail_image']['thumb_path']);
                $stmt = $pdo->prepare("DELETE FROM images WHERE id = ?");
                $stmt->execute([$current_media['thumbnail_image']['id']]);
            }
        }


        // Gallery images handling (more complex due to reordering/deleting existing and adding new)
        $existing_gallery_images = $current_media['gallery_images'];
        $incoming_gallery_images_data = isset($input['gallery_images_data']) && is_array($input['gallery_images_data']) ? $input['gallery_images_data'] : [];

        $incoming_image_ids_to_keep = array_filter(array_column($incoming_gallery_images_data, 'id'));
        $current_image_ids = array_column($existing_gallery_images, 'id');

        // Delete images that were present but are not in the new list (i.e., removed by user)
        foreach ($existing_gallery_images as $img) {
            if (!in_array($img['id'], $incoming_image_ids_to_keep)) {
                ImageUpload::deleteImageFiles($img['path'], $img['thumb_path']);
                $stmt = $pdo->prepare("DELETE FROM images WHERE id = ?");
                $stmt->execute([$img['id']]);
            }
        }

        // Update positions for existing images and insert new ones
        $image_position = 1; // Start after thumbnail, assuming thumbnail is at 0
        foreach ($incoming_gallery_images_data as $idx => $img_data) {
            // Handle existing image by ID
            if (isset($img_data['id']) && in_array($img_data['id'], $current_image_ids)) {
                $stmt = $pdo->prepare("UPDATE images SET position = ? WHERE id = ? AND media_id = ?");
                $stmt->execute([$image_position++, $img_data['id'], $media_id]);
            } 
            // Handle new file upload
            elseif (isset($_FILES['gallery_images']['name'][$idx]) && $_FILES['gallery_images']['error'][$idx] === UPLOAD_ERR_OK) {
                $file_to_upload = [
                    'name' => $_FILES['gallery_images']['name'][$idx],
                    'type' => $_FILES['gallery_images']['type'][$idx],
                    'tmp_name' => $_FILES['gallery_images']['tmp_name'][$idx],
                    'error' => $_FILES['gallery_images']['error'][$idx],
                    'size' => $_FILES['gallery_images']['size'][$idx],
                ];
                $uploaded_images = ImageUpload::handleImageUpload($file_to_upload, 'property_gallery', $id . '_' . uniqid());
                if ($uploaded_images) {
                    $stmt = $pdo->prepare("INSERT INTO images (media_id, path, thumb_path, alt, position, is_card_pic) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$media_id, $uploaded_images['full_path'], $uploaded_images['thumb_path'], $input['title'] . ' Gallery', $image_position++, 0]);
                } else {
                    $pdo->rollBack();
                    return send_json(['error' => 'New gallery image upload failed during update.'], 500);
                }
            }
            // Handle new image from existing URL (duplication)
            elseif (isset($img_data['url'])) { // This would be if an existing public image URL is provided to duplicate
                 $duplicated_images = ImageUpload::duplicateImageFile($img_data['url'], 'property_gallery', $id . '_' . uniqid());
                if ($duplicated_images) {
                    $stmt = $pdo->prepare("INSERT INTO images (media_id, path, thumb_path, alt, position, is_card_pic) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$media_id, $duplicated_images['full_path'], $duplicated_images['thumb_path'], $input['title'] . ' Gallery', $image_position++, 0]);
                } else {
                    $pdo->rollBack();
                    return send_json(['error' => 'New gallery image duplication failed during update.'], 500);
                }
            }
        }


        // Video handling
        $current_video_path = $current_media['video']['path'] ?? null;
        $current_video_embed_link = $current_media['video']['video_embed_link'] ?? null;

        $update_video = false;
        $new_video_path = $current_video_path;
        $new_video_embed_link = $current_video_embed_link;

        // Scenario 1: New video file uploaded
        if (isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
            // Delete old video file if it exists
            if ($current_video_path) {
                ImageUpload::deleteImageFiles($current_video_path);
            }
            $uploaded_video_path = handleVideoUpload($_FILES['video'], 'property_video', $id);
            $new_video_path = $uploaded_video_path;
            $new_video_embed_link = null; // Clear embed link if new video file is uploaded
            $update_video = true;
        } 
        // Scenario 2: Video embed link explicitly removed
        elseif (isset($input['video_removed']) && $input['video_removed'] === 'true') {
            // This flag is used to remove either an uploaded video or an embed link
            if ($current_video_path) {
                ImageUpload::deleteImageFiles($current_video_path);
            }
            $new_video_path = null;
            $new_video_embed_link = null;
            $update_video = true;
        }
        // Scenario 3: Video embed link updated/set (only if no direct video upload)
        elseif (isset($input['video_embed_link'])) {
            // If an embed link is provided, clear any existing direct video file
            if ($current_video_path) {
                ImageUpload::deleteImageFiles($current_video_path);
            }
            $new_video_path = null;
            $new_video_embed_link = $input['video_embed_link'];
            $update_video = true;
        }

        if ($update_video) {
            $stmt = $pdo->prepare("UPDATE medias SET video = ?, video_embed_link = ? WHERE id = ?");
            $stmt->execute([$new_video_path, $new_video_embed_link, $media_id]);
        }

        // 4. Handle Related Properties
        $stmt = $pdo->prepare("DELETE FROM property_related_properties WHERE property_id = ?");
        $stmt->execute([$id]);
        if (isset($input['related_properties']) && is_array($input['related_properties'])) {
            $position = 0;
            foreach ($input['related_properties'] as $related_property_id) {
                $stmt = $pdo->prepare("INSERT INTO property_related_properties (property_id, related_property_id, position) VALUES (?, ?, ?)");
                $stmt->execute([$id, $related_property_id, $position++]);
            }
        }

        // 5. Handle Labels
        // Delete all current label associations for this property
        $stmt = $pdo->prepare("DELETE FROM property_labels WHERE property_id = ?");
        $stmt->execute([$id]);

        $final_label_ids_for_property = [];

        // Process new labels to create
        if (isset($input['new_labels_to_create']) && !empty($input['new_labels_to_create'])) {
            $new_labels_data = json_decode($input['new_labels_to_create'], true);
            foreach ($new_labels_data as $new_label) {
                $stmt = $pdo->prepare("INSERT INTO labels (name, is_badge, is_filter, badge_variant) VALUES (?, ?, ?, ?)");
                $stmt->execute([
                    $new_label['name'],
                    $new_label['is_badge'],
                    $new_label['is_filter'],
                    $new_label['badge_variant']
                ]);
                $final_label_ids_for_property[] = $pdo->lastInsertId();
            }
        }

        // Add existing labels
        if (isset($input['existing_labels']) && is_array($input['existing_labels'])) {
            foreach ($input['existing_labels'] as $existing_label_id) {
                // Ensure the existing_label_id is valid before adding to the list
                if (!empty($existing_label_id)) {
                    $final_label_ids_for_property[] = $existing_label_id;
                }
            }
        }
        
        // Insert all final labels into property_labels
        $position = 0;
        foreach ($final_label_ids_for_property as $label_id) {
            $stmt = $pdo->prepare("INSERT INTO property_labels (property_id, label_id, position) VALUES (?, ?, ?)");
            $stmt->execute([$id, $label_id, $position++]);
        }


        $pdo->commit();
        return get_property($pdo, $id);

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) { // Check if transaction is active
            $pdo->rollBack();
        }
        error_log("PDOException during property update: " . $e->getMessage());
        return send_json(['error' => 'Update failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) { // Check if transaction is active
            $pdo->rollBack();
        }
        error_log("Exception during property update: " . $e->getMessage());
        return send_json(['error' => 'Error during property update', 'detail' => $e->getMessage()], 500);
    }
}

function delete_property(PDO $pdo, $id) {
    $stmt = $pdo->prepare("SELECT media_id, detail_description_id FROM properties WHERE id = ?");
    $stmt->execute([$id]);
    $property = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$property) return send_json(['error' => 'Property not found'], 404);

    $pdo->beginTransaction();
    try {
        // Delete related properties and labels first
        $stmt = $pdo->prepare("DELETE FROM property_related_properties WHERE property_id = ?");
        $stmt->execute([$id]);
        $stmt = $pdo->prepare("DELETE FROM property_labels WHERE property_id = ?");
        $stmt->execute([$id]);

        // Delete property record
        $stmt = $pdo->prepare("DELETE FROM properties WHERE id = ?");
        $stmt->execute([$id]);

        // Delete media (images and video file if applicable)
        if ($property['media_id']) {
            $media_info = get_property_media($pdo, $property['media_id']);
            if ($media_info['thumbnail_image']) {
                ImageUpload::deleteImageFiles($media_info['thumbnail_image']['path'], $media_info['thumbnail_image']['thumb_path']);
            }
            foreach ($media_info['gallery_images'] as $img) {
                ImageUpload::deleteImageFiles($img['path'], $img['thumb_path']);
            }
            // Delete video file if directly uploaded
            if ($media_info['video'] && $media_info['video']['path']) {
                ImageUpload::deleteImageFiles($media_info['video']['path']);
            }

            $stmt = $pdo->prepare("DELETE FROM medias WHERE id = ?");
            $stmt->execute([$property['media_id']]);
        }

        // Delete detailed description
        if ($property['detail_description_id']) {
            $stmt = $pdo->prepare("DELETE FROM detail_descriptions WHERE id = ?");
            $stmt->execute([$property['detail_description_id']]);
        }

        $pdo->commit();
        http_response_code(204);
        exit;
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during property deletion: " . $e->getMessage());
        return send_json(['error' => 'Delete failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Exception during property deletion: " . $e->getMessage());
        return send_json(['error' => 'Error during property deletion', 'detail' => $e->getMessage()], 500);
    }
}
