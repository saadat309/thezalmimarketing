<?php
// api/routes/properties.php

require_once __DIR__ . '/../utils/ImageUpload.php';

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
    switch ($method) {
        case 'GET':
            if ($id) return get_property($pdo, $id);
            return list_properties($pdo);
        case 'POST':
            return create_property($pdo);
        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_property($pdo, $id);
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

    $stmt = $pdo->prepare("SELECT id, path, thumb_path, alt, caption, position, is_card_pic, hide FROM images WHERE media_id = ? ORDER BY position ASC");
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
    $stmt = $pdo->prepare("SELECT pl.label_id, l.name, l.is_badge, l.badge_variant, l.is_filter FROM property_labels pl JOIN labels l ON pl.label_id = l.id WHERE pl.property_id = ? ORDER BY pl.position ASC");
    $stmt->execute([$property_id]);
    return $stmt->fetchAll();
}

function get_property_related_properties(PDO $pdo, $property_id) {
    $stmt = $pdo->prepare("SELECT prp.related_property_id, p.title FROM property_related_properties prp JOIN properties p ON prp.related_property_id = p.id WHERE prp.property_id = ? ORDER BY prp.position ASC");
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


function list_properties(PDO $pdo) {
    $sql = "SELECT
                p.id, p.title, p.property_type, p.is_file, p.file_type, p.purchase_type, p.is_furnished, p.short_desc, p.address, p.features,
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
            ORDER BY p.id DESC";
    
    $stmt = $pdo->query($sql);
    $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($properties as &$property) {
        $property['labels'] = get_property_labels($pdo, $property['id']);
        $property['related_properties'] = get_property_related_properties($pdo, $property['id']);
        // If frontend needs all media for list, we can fetch here, but for now thumbnail_url is enough
        // $property['media'] = get_property_media($pdo, $property['media_id']);
    }
    send_json($properties);
}

function get_property(PDO $pdo, $id) {
    $sql = "SELECT
                p.id, p.title, p.property_type, p.is_file, p.file_type, p.purchase_type, p.is_furnished, p.short_desc, p.address, p.features,
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

    $pdo->beginTransaction();
    try {
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
            title, property_type, is_file, file_type, purchase_type, is_furnished, short_desc, address, features,
            beds, baths, area, unit, price_amount, is_discounted, price_original_amount, price_period_unit, price_period_value,
            installment_advance_amount, installment_total_period_text, installment_amount, installment_display_mode,
            media_id, category_id, city_id, society_id, phase_id, embed_link, hide, detail_description_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->execute([
            $input['title'],
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
            $duplicated_images = ImageUpload::duplicateImageFile($input['thumbnail_image_url'], 'property_thumb', $property_id);
            if ($duplicated_images) {
                $stmt = $pdo->prepare("INSERT INTO images (media_id, path, thumb_path, alt, position, is_card_pic) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$media_id, $duplicated_images['full_path'], $duplicated_images['thumb_path'], $input['title'] . ' Thumbnail', $image_position++, 1]);
            } else {
                $pdo->rollBack();
                return send_json(['error' => 'Thumbnail image duplication failed.'], 500);
            }
        }


        // Process gallery images (is_card_pic = false)
        if (isset($_FILES['gallery_images']) && is_array($_FILES['gallery_images']['error'])) {
            foreach ($_FILES['gallery_images']['error'] as $key => $error) {
                if ($error === UPLOAD_ERR_OK) {
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
                        $stmt->execute([$media_id, $uploaded_images['full_path'], $uploaded_images['thumb_path'], $input['title'] . ' Gallery ' . $key, $image_position++, 0]);
                    } else {
                        $pdo->rollBack();
                        return send_json(['error' => 'Gallery image upload failed.'], 500);
                    }
                }
            }
        } elseif (isset($input['gallery_image_urls']) && is_array($input['gallery_image_urls'])) {
            // This is for existing images that are sent as URLs (e.g., when editing and reordering)
            foreach ($input['gallery_image_urls'] as $key => $image_data) {
                if ($image_data['url']) {
                    // Assuming image_data can contain 'id' for existing images or 'url' for new duplicates
                    if (isset($image_data['id'])) {
                        // This is an existing image being reordered, just update its position
                        $stmt = $pdo->prepare("UPDATE images SET position = ? WHERE id = ? AND media_id = ?");
                        $stmt->execute([$image_position++, $image_data['id'], $media_id]);
                    } else {
                        // This is a duplicated image
                        $duplicated_images = ImageUpload::duplicateImageFile($image_data['url'], 'property_gallery', $property_id . '_' . $key);
                        if ($duplicated_images) {
                            $stmt = $pdo->prepare("INSERT INTO images (media_id, path, thumb_path, alt, position, is_card_pic) VALUES (?, ?, ?, ?, ?, ?)");
                            $stmt->execute([$media_id, $duplicated_images['full_path'], $duplicated_images['thumb_path'], $input['title'] . ' Gallery ' . $key, $image_position++, 0]);
                        } else {
                            $pdo->rollBack();
                            return send_json(['error' => 'Gallery image duplication failed.'], 500);
                        }
                    }
                }
            }
        }

        // Process video
        if (isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
            // TODO: Implement video upload handling (similar to image but saves video path)
            // For now, only embed link is supported via frontend
            $pdo->rollBack();
            return send_json(['error' => 'Direct video upload is not yet supported. Please use embed links.'], 500);
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
        if (isset($input['labels']) && is_array($input['labels'])) {
            $position = 0;
            foreach ($input['labels'] as $label_data) {
                $label_id = is_array($label_data) && isset($label_data['id']) ? $label_data['id'] : $label_data;
                $stmt = $pdo->prepare("INSERT INTO property_labels (property_id, label_id, position) VALUES (?, ?, ?)");
                $stmt->execute([$property_id, $label_id, $position++]);
            }
        }


        $pdo->commit();
        return get_property($pdo, $property_id);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during property creation: " . $e->getMessage());
        return send_json(['error' => 'Insert failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Exception during property creation: " . $e->getMessage());
        return send_json(['error' => 'Error during property creation', 'detail' => $e->getMessage()], 500);
    }
}

function update_property(PDO $pdo, $id) {
    $input = get_request_data();
    error_log("Input data for update_property (ID: $id): " . print_r($input, true));
    error_log("Files data for update_property (ID: $id): " . print_r($_FILES, true));

    $stmt = $pdo->prepare("SELECT * FROM properties WHERE id = ?");
    $stmt->execute([$id]);
    $exists = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$exists) return send_json(['error' => 'Property not found'], 404);

    $pdo->beginTransaction();
    try {
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
        $current_video_embed_link = $current_media['video'] ? $current_media['video']['video_embed_link'] : null;
        if (isset($input['video_embed_link_removed']) && $input['video_embed_link_removed'] === 'true') {
            $stmt = $pdo->prepare("UPDATE medias SET video = NULL, video_embed_link = NULL WHERE id = ?");
            $stmt->execute([$media_id]);
        } elseif (isset($input['video_embed_link'])) { // Only update if the field was sent
            $stmt = $pdo->prepare("UPDATE medias SET video = NULL, video_embed_link = ? WHERE id = ?"); // Clear direct upload if embed link is provided
            $stmt->execute([$input['video_embed_link'], $media_id]);
        }
        // If $_FILES['video'] is set, process uploaded video (not implemented yet for direct upload)
        // If no video input, and there was a video, leave as is (don't clear it unless explicitly removed)


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
        $stmt = $pdo->prepare("DELETE FROM property_labels WHERE property_id = ?");
        $stmt->execute([$id]);
        if (isset($input['labels']) && is_array($input['labels'])) {
            $position = 0;
            foreach ($input['labels'] as $label_data) {
                $label_id = is_array($label_data) && isset($label_data['id']) ? $label_data['id'] : $label_data;
                $stmt = $pdo->prepare("INSERT INTO property_labels (property_id, label_id, position) VALUES (?, ?, ?)");
                $stmt->execute([$id, $label_id, $position++]);
            }
        }


        $pdo->commit();
        return get_property($pdo, $id);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PDOException during property update: " . $e->getMessage());
        return send_json(['error' => 'Update failed', 'detail' => $e->getMessage()], 500);
    } catch (Exception $e) {
        $pdo->rollBack();
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
            // TODO: Delete video file if directly uploaded

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
