<?php
// api/utils/jwt_util.php

// Define your secret key. This should be a strong, random string.
if (!defined('JWT_SECRET_KEY')) {
    define('JWT_SECRET_KEY', 'your_super_secret_jwt_key_that_is_at_least_32_chars_long'); 
}

// Recommended JWT algorithm
if (!defined('JWT_ALGORITHM')) {
    define('JWT_ALGORITHM', 'HS256');
}

// Function to encode JWT
function generate_jwt(array $payload): string {
    $header = [
        'typ' => 'JWT',
        'alg' => JWT_ALGORITHM
    ];

    $base64UrlHeader = base64url_encode(json_encode($header));
    $base64UrlPayload = base64url_encode(json_encode($payload));

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET_KEY, true);
    $base64UrlSignature = base64url_encode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

// Function to decode and validate JWT (optional, can be done by a middleware or specific endpoint)
function validate_jwt(string $jwt_token): ?array {
    $parts = explode('.', $jwt_token);
    if (count($parts) !== 3) {
        return null; // Invalid JWT format
    }

    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;

    $header = json_decode(base64url_decode($base64UrlHeader), true);
    $payload = json_decode(base64url_decode($base64UrlPayload), true);

    // Re-verify signature
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET_KEY, true);
    $base64UrlExpectedSignature = base64url_encode($signature);

    if ($base64UrlSignature !== $base64UrlExpectedSignature) {
        return null; // Invalid signature
    }

    // You might want to add expiration checks (exp) and other claims validation here
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null; // Token expired
    }

    return $payload;
}

// Helper function for Base664Url Encoding
function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

// Helper function for Base664Url Decoding
function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}
