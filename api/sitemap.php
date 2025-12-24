<?php
// api/sitemap.php
require_once 'config.php';

header("Content-Type: application/xml; charset=utf-8");

$base_url = "https://thezalmimarketing.com";

echo '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

// 1. Static Pages
$static_pages = [
    '',
    '/about',
    '/contact',
    '/properties',
    '/maps',
    '/files',
    '/search',
    '/privacy-policy'
];

foreach ($static_pages as $page) {
    echo '  <url>' . PHP_EOL;
    echo '    <loc>' . $base_url . $page . '</loc>' . PHP_EOL;
    echo '    <changefreq>weekly</changefreq>' . PHP_EOL;
    echo '    <priority>' . ($page === '' ? '1.0' : '0.8') . '</priority>' . PHP_EOL;
    echo '  </url>' . PHP_EOL;
}

// 2. Properties (Dynamic)
try {
    $stmt = $pdo->prepare("SELECT slug, updated_at FROM properties WHERE is_file = 0");
    $stmt->execute();
    while ($row = $stmt->fetch()) {
        echo '  <url>' . PHP_EOL;
        echo '    <loc>' . $base_url . '/properties/' . $row['slug'] . '</loc>' . PHP_EOL;
        if ($row['updated_at']) {
            echo '    <lastmod>' . date('Y-m-d', strtotime($row['updated_at'])) . '</lastmod>' . PHP_EOL;
        }
        echo '    <changefreq>weekly</changefreq>' . PHP_EOL;
        echo '    <priority>0.7</priority>' . PHP_EOL;
        echo '  </url>' . PHP_EOL;
    }
} catch (Exception $e) {
    // Silently fail or log
}

// 3. Categories (Dynamic)
try {
    $stmt = $pdo->prepare("SELECT name FROM categories");
    $stmt->execute();
    while ($row = $stmt->fetch()) {
        echo '  <url>' . PHP_EOL;
        echo '    <loc>' . $base_url . '/properties?category=' . urlencode($row['name']) . '</loc>' . PHP_EOL;
        echo '    <changefreq>monthly</changefreq>' . PHP_EOL;
        echo '    <priority>0.6</priority>' . PHP_EOL;
        echo '  </url>' . PHP_EOL;
    }
} catch (Exception $e) {
}

echo '</urlset>';
