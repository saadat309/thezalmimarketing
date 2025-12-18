<?php
// api/utils/slug_util.php

function generate_slug($text) {
    // Replace non letter or digits by -
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);

    // Transliterate
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);

    // Remove unwanted characters
    $text = preg_replace('~[^-\w]+~', '', $text);

    // Trim
    $text = trim($text, '-');

    // Remove duplicate -
    $text = preg_replace('~-+~', '-', $text);

    // Lowercase
    $text = strtolower($text);

    if (empty($text)) {
        return 'n-a';
    }

    return $text;
}

/**
 * Generates a unique slug for a given table and column.
 * 
 * @param PDO $pdo
 * @param string $table The table name.
 * @param string $text The text to generate slug from.
 * @param int|null $exclude_id Optional ID to exclude (for updates).
 * @param string $column The slug column name (default 'slug').
 * @return string The unique slug.
 */
function generate_unique_slug(PDO $pdo, $table, $text, $exclude_id = null, $column = 'slug') {
    $slug = generate_slug($text);
    $original_slug = $slug;
    $count = 1;

    while (true) {
        $sql = "SELECT COUNT(*) FROM {$table} WHERE {$column} = ?";
        $params = [$slug];

        if ($exclude_id !== null) {
            $sql .= " AND id != ?";
            $params[] = $exclude_id;
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        if ($stmt->fetchColumn() == 0) {
            return $slug;
        }

        $slug = $original_slug . '-' . $count;
        $count++;
    }
}
