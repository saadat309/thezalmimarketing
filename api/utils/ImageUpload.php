<?php
// api/utils/ImageUpload.php

// Ensure these are defined for consistent JSON responses
if (!function_exists('send_json')) {
    function send_json($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}

class ImageUpload {
    private static $uploadBaseDir = __DIR__ . '/../../public/images'; // Base directory for images

    /**
     * Processes an uploaded image, saves it, and generates a thumbnail.
     *
     * @param array $file The $_FILES entry for the uploaded file.
     * @param string $entity_name A descriptive name for the entity (e.g., 'category', 'property').
     * @param string $record_id The ID of the record associated with the image.
     * @param array $options Configuration options
     * @return array|false An array containing 'full_path' and 'thumb_path' on success, false on failure.
     */
    public static function handleImageUpload(array $file, string $entity_name, string $record_id, array $options = []) {
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            error_log("No file uploaded or invalid upload for entity: $entity_name, record: $record_id");
            return false;
        }

        $defaultOptions = [
            'max_width' => 1200,
            'max_height' => 800,
            'thumb_width' => 150,
            'thumb_height' => 150,
            'to_webp' => true,
        ];
        $options = array_merge($defaultOptions, $options);

        // Map entity names to subdirectories
        $subDir = 'others';
        if (strpos($entity_name, 'property') !== false) {
            $subDir = 'properties';
        } elseif (strpos($entity_name, 'category') !== false) {
            $subDir = 'categories';
        } elseif (strpos($entity_name, 'map') !== false) {
            $subDir = 'maps';
        } elseif (strpos($entity_name, 'user') !== false) {
            $subDir = 'users';
        }

        $entityBaseDir = self::$uploadBaseDir . '/' . $subDir;
        $entityThumbDir = $entityBaseDir . '/thumbs';

        // Ensure directories exist
        if (!is_dir($entityBaseDir)) {
            mkdir($entityBaseDir, 0777, true);
        }
        if (!is_dir($entityThumbDir)) {
            mkdir($entityThumbDir, 0777, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $uniqueName = uniqid($entity_name . '_' . $record_id . '_', true);
        
        $targetExtension = $options['to_webp'] ? 'webp' : strtolower($extension);

        $baseFileName = $uniqueName;
        $fullPath = '/images/' . $subDir . '/' . $baseFileName . '.' . $targetExtension;
        $fullFilePath = $entityBaseDir . '/' . $baseFileName . '.' . $targetExtension;

        $thumbPath = '/images/' . $subDir . '/thumbs/' . $baseFileName . '_thumb.' . $targetExtension;
        $thumbFilePath = $entityThumbDir . '/' . $baseFileName . '_thumb.' . $targetExtension;

        try {
            // Process and save main image
            if (!self::processImage($file['tmp_name'], $fullFilePath, $options['max_width'], $options['max_height'], $options['to_webp'])) {
                error_log("Failed to process main image for entity: $entity_name, record: $record_id");
                return false;
            }

            // Generate and save thumbnail
            if (!self::generateThumbnail($file['tmp_name'], $thumbFilePath, $options['thumb_width'], $options['thumb_height'], $options['to_webp'])) {
                error_log("Failed to generate thumbnail for entity: $entity_name, record: $record_id");
                // Attempt to clean up the main image if thumbnail generation fails
                if (file_exists($fullFilePath)) {
                    unlink($fullFilePath);
                }
                return false;
            }

            return [
                'full_path' => $fullPath,
                'thumb_path' => $thumbPath,
            ];

        } catch (Exception $e) {
            error_log("Image upload exception for entity: $entity_name, record: $record_id - " . $e->getMessage());
            // Clean up any partially created files
            if (file_exists($fullFilePath)) {
                unlink($fullFilePath);
            }
            if (file_exists($thumbFilePath)) {
                unlink($thumbFilePath);
            }
            return false;
        }
    }

    /**
     * Resizes and saves an image, optionally converting to WebP.
     *
     * @param string $source_path Path to the source image file.
     * @param string $target_path Path where the processed image will be saved.
     * @param int $max_width Maximum width for the image.
     * @param int $max_height Maximum height for the image.
     * @param bool $to_webp Whether to convert the image to WebP.
     * @return bool True on success, false on failure.
     */
    public static function processImage(string $source_path, string $target_path, int $max_width, int $max_height, bool $to_webp = true): bool {
        $image_info = getimagesize($source_path);
        if (!$image_info) {
            error_log("Failed to get image size for source: " . $source_path);
            return false;
        }

        list($original_width, $original_height, $type) = $image_info;

        $source_image = null;
        switch ($type) {
            case IMAGETYPE_JPEG:
                $source_image = imagecreatefromjpeg($source_path);
                break;
            case IMAGETYPE_PNG:
                $source_image = imagecreatefrompng($source_path);
                break;
            case IMAGETYPE_GIF:
                $source_image = imagecreatefromgif($source_path);
                break;
            case IMAGETYPE_WEBP: // If already webp, just load it
                $source_image = imagecreatefromwebp($source_path);
                break;
            default:
                error_log("Unsupported image type: " . $type);
                return false;
        }

        if (!$source_image) {
            error_log("Failed to create image resource from source: " . $source_path);
            return false;
        }

        $new_width = $original_width;
        $new_height = $original_height;

        // Calculate new dimensions to fit within max_width and max_height while maintaining aspect ratio
        if ($original_width > $max_width || $original_height > $max_height) {
            $aspect_ratio = $original_width / $original_height;
            if ($original_width / $max_width > $original_height / $max_height) {
                $new_width = $max_width;
                $new_height = (int)($new_width / $aspect_ratio);
            } else {
                $new_height = $max_height;
                $new_width = (int)($new_height * $aspect_ratio);
            }
        }
        
        $resized_image = imagecreatetruecolor($new_width, $new_height);
        if ($resized_image === false) { // Check if imagecreatetruecolor failed
            error_log("Failed to create true color image for resizing.");
            imagedestroy($source_image);
            return false;
        }

        if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_GIF) { // Preserve transparency for PNG and GIF
            imagealphablending($resized_image, false);
            imagesavealpha($resized_image, true);
            $transparent = imagecolorallocatealpha($resized_image, 255, 255, 255, 127);
            if ($transparent === false) { // Check if imagecolorallocatealpha failed
                error_log("Failed to allocate transparent color.");
                imagedestroy($source_image);
                imagedestroy($resized_image);
                return false;
            }
            imagefilledrectangle($resized_image, 0, 0, $new_width, $new_height, $transparent);
        }

        if (!imagecopyresampled($resized_image, $source_image, 0, 0, 0, 0, $new_width, $new_height, $original_width, $original_height)) {
            error_log("Failed to resample image.");
            imagedestroy($source_image);
            imagedestroy($resized_image);
            return false;
        }

        $saved = false;
        if ($to_webp) {
            $saved = imagewebp($resized_image, $target_path, 80); // 80 is quality
        } else {
            // Save as original type if not converting to webp
            switch ($type) {
                case IMAGETYPE_JPEG:
                    $saved = imagejpeg($resized_image, $target_path, 80);
                    break;
                case IMAGETYPE_PNG:
                    $saved = imagepng($resized_image, $target_path, 9);
                    break;
                case IMAGETYPE_GIF:
                    $saved = imagegif($resized_image, $target_path);
                    break;
                case IMAGETYPE_WEBP:
                    $saved = imagewebp($resized_image, $target_path, 80);
                    break;
                default:
                    error_log("Attempted to save unsupported image type to original format.");
                    $saved = false;
            }
        }

        imagedestroy($source_image);
        imagedestroy($resized_image);

        return $saved;
    }

    /**
     * Generates a thumbnail from a source image.
     *
     * @param string $source_path Path to the source image file.
     * @param string $thumbnail_path Path where the thumbnail will be saved.
     * @param int $max_width Maximum width for the thumbnail.
     * @param int $max_height Maximum height for the thumbnail.
     * @param bool $to_webp Whether to convert the thumbnail to WebP.
     * @return bool True on success, false on failure.
     */
    public static function generateThumbnail(string $source_path, string $thumbnail_path, int $max_width = 150, int $max_height = 150, bool $to_webp = true): bool {
        return self::processImage($source_path, $thumbnail_path, $max_width, $max_height, $to_webp);
    }

    /**
     * Deletes image and optional thumbnail files from the filesystem.
     *
     * @param string $image_path The relative path of the main image (e.g., '/images/myimage.webp').
     * @param string|null $thumb_path The relative path of the thumbnail (e.g., '/images/thumbs/myimage_thumb.webp'), or null if no thumbnail.
     * @return bool True if all specified files were deleted or didn't exist, false if an error occurred during deletion.
     */
    public static function deleteImageFiles(string $image_path, string $thumb_path = null): bool {
        $success = true;
        
        $publicDir = realpath(__DIR__ . '/../../public');
        
        // Helper to resolve and delete
        $deleteFile = function($relPath) use ($publicDir) {
            if (!$relPath) return true;
            
            // Standardize path: remove leading slash, remove /public/ if present
            $cleanPath = ltrim($relPath, '/');
            if (strpos($cleanPath, 'public/') === 0) {
                $cleanPath = substr($cleanPath, 7);
            }
            
            $fullPath = $publicDir . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $cleanPath);
            
            error_log("Attempting to delete file: " . $fullPath);
            
            if (file_exists($fullPath)) {
                if (unlink($fullPath)) {
                    error_log("Successfully deleted: " . $fullPath);
                    return true;
                } else {
                    error_log("Failed to unlink: " . $fullPath);
                    return false;
                }
            } else {
                error_log("File not found for deletion: " . $fullPath);
                return true; // Consider success if already gone
            }
        };

        if (!$deleteFile($image_path)) $success = false;
        if ($thumb_path && !$deleteFile($thumb_path)) $success = false;
        
        return $success;
    }

    /**
     * Duplicates an existing image and its thumbnail by path, generating new unique filenames.
     *
     * @param string $image_url The URL of the existing image (e.g., '/images/entity_id_unique.webp').
     * @param string $entity_name A descriptive name for the entity (e.g., 'category', 'product').
     * @param string $record_id The ID of the record associated with the new image.
     * @param array $options Configuration options (same as handleImageUpload).
     * @return array|false An array containing 'full_path' and 'thumb_path' on success, false on failure.
     */
    public static function duplicateImageFile(string $image_url, string $entity_name, string $record_id, array $options = []) {
        if (empty($image_url)) {
            return false;
        }

        // Construct the absolute path to the original image file
        $original_full_path_relative = ltrim($image_url, '/'); // Remove leading slash
        $original_full_file_path = __DIR__ . '/../../public/' . $original_full_path_relative;

        if (!file_exists($original_full_file_path)) {
            error_log("Original image file not found for duplication: " . $original_full_file_path);
            return false;
        }

        $defaultOptions = [
            'max_width' => 1200,
            'max_height' => 800,
            'thumb_width' => 150,
            'thumb_height' => 150,
            'to_webp' => true,
        ];
        $options = array_merge($defaultOptions, $options);

        // Map entity names to subdirectories
        $subDir = 'others';
        if (strpos($entity_name, 'property') !== false) {
            $subDir = 'properties';
        } elseif (strpos($entity_name, 'category') !== false) {
            $subDir = 'categories';
        } elseif (strpos($entity_name, 'map') !== false) {
            $subDir = 'maps';
        } elseif (strpos($entity_name, 'user') !== false) {
            $subDir = 'users';
        }

        $entityBaseDir = self::$uploadBaseDir . '/' . $subDir;
        $entityThumbDir = $entityBaseDir . '/thumbs';

        // Ensure directories exist
        if (!is_dir($entityBaseDir)) {
            mkdir($entityBaseDir, 0777, true);
        }
        if (!is_dir($entityThumbDir)) {
            mkdir($entityThumbDir, 0777, true);
        }

        // Generate new unique filenames
        $uniqueName = uniqid($entity_name . '_' . $record_id . '_', true);
        $targetExtension = $options['to_webp'] ? 'webp' : pathinfo($original_full_file_path, PATHINFO_EXTENSION);

        $new_fullPath = '/images/' . $subDir . '/' . $uniqueName . '.' . $targetExtension;
        $new_fullFilePath = $entityBaseDir . '/' . $uniqueName . '.' . $targetExtension;

        $new_thumbPath = '/images/' . $subDir . '/thumbs/' . $uniqueName . '_thumb.' . $targetExtension;
        $new_thumbFilePath = $entityThumbDir . '/' . $uniqueName . '_thumb.' . $targetExtension;

        try {
            // Duplicate and process main image
            if (!self::processImage($original_full_file_path, $new_fullFilePath, $options['max_width'], $options['max_height'], $options['to_webp'])) {
                error_log("Failed to duplicate and process main image from URL: " . $image_url);
                return false;
            }

            // Duplicate and generate thumbnail
            if (!self::generateThumbnail($original_full_file_path, $new_thumbFilePath, $options['thumb_width'], $options['thumb_height'], $options['to_webp'])) {
                error_log("Failed to generate thumbnail for duplicated image: " . $image_url);
                // Clean up the main duplicated image if thumbnail generation fails
                if (file_exists($new_fullFilePath)) {
                    unlink($new_fullFilePath);
                }
                return false;
            }

            return [
                'full_path' => $new_fullPath,
                'thumb_path' => $new_thumbPath,
            ];

        } catch (Exception $e) {
            error_log("Image duplication exception for URL: $image_url - " . $e->getMessage());
            // Clean up any partially created files
            if (file_exists($new_fullFilePath)) {
                unlink($new_fullFilePath);
            }
            if (file_exists($new_thumbFilePath)) {
                unlink($new_thumbFilePath);
            }
            return false;
        }
    }
}
