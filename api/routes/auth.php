<?php
// api/routes/auth.php

require_once __DIR__ . '/../utils/password_util.php'; // For password_verify
require_once __DIR__ . '/../utils/jwt_util.php';      // For JWT token generation
require_once __DIR__ . '/../utils/ImageUpload.php';    // For profile pic upload (will be used in update_my_profile)
require_once __DIR__ . '/../utils/email_util.php';    // For sending emails
require_once __DIR__ . '/../utils/token_util.php';    // For generating tokens

if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

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

function get_authenticated_user_id(PDO $pdo): ?int {
    $headers = getallheaders();
    $auth_header = null;
    if (isset($headers['Authorization'])) {
        $auth_header = $headers['Authorization'];
    } else {
        // Case-insensitive search
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $auth_header = $value;
                break;
            }
        }
    }

    if (!$auth_header || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
        // Debugging: Log headers if auth fails (optional, remove in prod)
        // error_log("Auth failed. Headers: " . print_r($headers, true));
        send_json(['error' => 'Authentication required'], 401);
        return null; // send_json exits, but for static analysis
    }

    $jwt_token = $matches[1];
    $payload = validate_jwt($jwt_token);

    if (!$payload || !isset($payload['user_id'])) {
        send_json(['error' => 'Invalid or expired token'], 401);
        return null; // send_json exits
    }

    // Optional: Re-fetch user to ensure they still exist and are active
    $stmt = $pdo->prepare("SELECT id, status FROM users WHERE id = ?");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || $user['status'] !== 'active') {
        send_json(['error' => 'User account is inactive or not found'], 401);
        return null; // send_json exits
    }

    return (int) $payload['user_id'];
}

function get_my_profile(PDO $pdo) {
    $user_id = get_authenticated_user_id($pdo); // This will exit if not authenticated

    $stmt = $pdo->prepare("SELECT id, name, email, profile_pic, bio, role_id, status FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user_profile = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user_profile) {
        return send_json(['error' => 'User profile not found'], 404);
    }
    
    // Get role name
    $user_profile['role_name'] = get_role_name_by_id($pdo, $user_profile['role_id']);

    send_json($user_profile);
}

function update_my_profile(PDO $pdo) {
    $user_id = get_authenticated_user_id($pdo); // This will exit if not authenticated
    $data = get_request_data();

    $fields = [];
    $values = [];

    // Allow updating name and bio
    if (isset($data['name'])) {
        $fields[] = 'name = ?';
        $values[] = $data['name'];
    }
    if (isset($data['bio'])) {
        $fields[] = 'bio = ?';
        $values[] = $data['bio'];
    }

    // Handle profile picture upload if a file is provided
    if (isset($_FILES['profile_pic']) && $_FILES['profile_pic']['error'] === UPLOAD_ERR_OK) {
        $uploaded_image = ImageUpload::handleImageUpload($_FILES['profile_pic'], 'user_profile', $user_id, ['to_webp' => true, 'max_width' => 400, 'max_height' => 400, 'thumb_width' => 100, 'thumb_height' => 100]);
        if ($uploaded_image) {
            $fields[] = 'profile_pic = ?';
            $values[] = $uploaded_image['full_path'];
            // You might want to delete the old profile picture if it exists
            // Need to fetch old profile_pic path first
        } else {
            return send_json(['error' => 'Failed to upload profile picture'], 500);
        }
    } elseif (isset($data['profile_pic_clear']) && $data['profile_pic_clear'] === true) {
        // Clear existing profile picture
        $stmt = $pdo->prepare("SELECT profile_pic FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $current_profile_pic = $stmt->fetchColumn();

        if ($current_profile_pic) {
            // Assume the full path is stored, extract the filename for deletion
            // This is a simplified deletion. ImageUpload::deleteImageFiles expects relative paths.
            ImageUpload::deleteImageFiles($current_profile_pic);
        }
        $fields[] = 'profile_pic = ?';
        $values[] = null;
    }


    if (empty($fields)) {
        return send_json(['message' => 'No fields to update'], 200);
    }

    $values[] = $user_id; // For the WHERE clause
    $sql = "UPDATE users SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        $pdo->commit();
        return send_json(['message' => 'Profile updated successfully'], 200);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Update profile error: " . $e->getMessage());
        return send_json(['error' => 'Failed to update profile', 'detail' => $e->getMessage()], 500);
    }
}

function handle_auth($method, PDO $pdo, $action = null) {
    // Determine the action based on the second segment of the URL
    // e.g., /api/auth/login, /api/auth/me
    switch ($action) {
        case 'login':
            if ($method === 'POST') {
                return login_user($pdo);
            }
            break;
        case 'forgot-password':
            if ($method === 'POST') {
                return forgot_password($pdo);
            }
            break;
        case 'reset-password':
            if ($method === 'POST') {
                return reset_password($pdo);
            }
            break;
        case 'me':
            if ($method === 'GET') {
                return get_my_profile($pdo);
            }
            if ($method === 'PUT' || $method === 'PATCH' || $method === 'POST') { // POST can be used for file uploads with method override
                return update_my_profile($pdo);
            }
            break;
        default:
            send_json(['error' => 'Action not found'], 404);
    }
    send_json(['error' => 'Method or action not allowed'], 405);
}

function login_user(PDO $pdo) {
    $data = get_request_data();

    if (empty($data['email']) || empty($data['password'])) {
        return send_json(['error' => 'Email and password are required'], 400);
    }

    $email = strtolower(trim($data['email']));
    $password = $data['password'];
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;

    $pdo->beginTransaction();
    try {
        // 1. Find user by email
        $stmt = $pdo->prepare("SELECT id, email, password_hash, role_id, status, name, profile_pic, bio FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            log_failed_login($pdo, null, $email, $ip_address, $user_agent);
            $pdo->commit(); // Commit the failed login log
            return send_json(['error' => 'Invalid credentials'], 401);
        }

        // 2. Verify password
        if (!verify_password($password, $user['password_hash'])) {
            log_failed_login($pdo, $user['id'], $email, $ip_address, $user_agent);
            $pdo->commit(); // Commit the failed login log
            return send_json(['error' => 'Invalid credentials'], 401);
        }

        // 3. Check user status
        if ($user['status'] !== 'active') {
            log_failed_login($pdo, $user['id'], $email, $ip_address, $user_agent, "Inactive/Blocked");
            $pdo->commit(); // Commit the failed login log
            return send_json(['error' => 'Account is not active or is blocked'], 403);
        }

        // 4. Generate JWT token
        $jwt_payload = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role_id' => $user['role_id'],
            'role_name' => get_role_name_by_id($pdo, $user['role_id']) // Helper to get role name
        ];
        $jwt_token = generate_jwt($jwt_payload);

        $pdo->commit(); // Commit the successful login

        send_json([
            'message' => 'Login successful',
            'token' => $jwt_token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role_id' => $user['role_id'],
                'status' => $user['status'],
                'profile_pic' => $user['profile_pic'] ?? null,
                'bio' => $user['bio'] ?? null,
                'role_name' => get_role_name_by_id($pdo, $user['role_id']) // Add role_name here
            ]
        ], 200);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Login error: " . $e->getMessage());
        return send_json(['error' => 'An internal server error occurred', 'detail' => $e->getMessage()], 500);
    }
}

// Helper function to log failed login attempts
function log_failed_login(PDO $pdo, $user_id, $email, $ip_address, $user_agent, $reason = null) {
    $stmt = $pdo->prepare("INSERT INTO failed_logins (user_id, email, ip_address, user_agent) VALUES (?, ?, ?, ?)");
    $stmt->execute([$user_id, $email, $ip_address, $user_agent]);
}

// Helper function to get role name by ID (can be moved to a more central utility if used elsewhere)
function get_role_name_by_id(PDO $pdo, $role_id) {
    $stmt = $pdo->prepare("SELECT name FROM roles WHERE id = ?");
    $stmt->execute([$role_id]);
    $role = $stmt->fetch(PDO::FETCH_ASSOC);
    return $role ? $role['name'] : null;
}

function forgot_password(PDO $pdo) {
    $data = get_request_data();
    if (empty($data['email'])) {
        return send_json(['error' => 'Email is required'], 400);
    }

    $email = strtolower(trim($data['email']));

    // 1. Check if user exists
    $stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ? AND status = 'active'");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        // For security, don't reveal if email exists or not
        return send_json(['message' => 'If your email is registered, you will receive a reset link.'], 200);
    }

    // 2. Generate token
    $token = generate_secure_token();
    $token_hash = hash('sha256', $token);
    $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $pdo->beginTransaction();
    try {
        // 3. Save to password_resets
        $stmt = $pdo->prepare("INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)");
        $stmt->execute([$user['id'], $token_hash, $expires_at]);

        // 4. Send Email
        // Assuming your frontend URL structure
        $reset_link = FRONTEND_URL . "/reset-password?token=" . $token . "&email=" . urlencode($email);
        $subject = "Password Reset Request - The Zalmi Marketing";
        $body = "
            <p>Hi " . htmlspecialchars($user['name']) . ",</p>
            <p>You requested to reset your password. Click the link below to set a new password. This link will expire in 1 hour.</p>
            <p><a href='" . $reset_link . "'>" . $reset_link . "</a></p>
            <p>If you didn't request this, please ignore this email.</p>
        ";

        if (send_email($email, $subject, $body)) {
            $pdo->commit();
            return send_json(['message' => 'If your email is registered, you will receive a reset link.'], 200);
        } else {
            throw new Exception("Failed to send email");
        }

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Forgot password error: " . $e->getMessage());
        return send_json(['error' => 'An error occurred. Please try again later.'], 500);
    }
}

function reset_password(PDO $pdo) {
    $data = get_request_data();
    if (empty($data['token']) || empty($data['email']) || empty($data['password'])) {
        return send_json(['error' => 'Token, email and password are required'], 400);
    }

    $token = $data['token'];
    $email = strtolower(trim($data['email']));
    $password = $data['password'];
    $token_hash = hash('sha256', $token);

    $pdo->beginTransaction();
    try {
        // 1. Validate token and email
        // We'll fetch the record first without the filters to see what's actually in the DB
        $stmt = $pdo->prepare("
            SELECT pr.id, pr.user_id, pr.used_at, pr.expires_at, u.email
            FROM password_resets pr
            JOIN users u ON pr.user_id = u.id
            WHERE pr.token_hash = ?
        ");
        $stmt->execute([$token_hash]);
        $reset_request = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$reset_request) {
            return send_json(['error' => 'Invalid or expired token'], 400);
        }

        if (strtolower($reset_request['email']) !== $email) {
            return send_json(['error' => 'Invalid or expired token'], 400);
        }

        if ($reset_request['used_at'] !== null) {
            return send_json(['error' => 'Invalid or expired token'], 400);
        }

        if (strtotime($reset_request['expires_at']) < time()) {
            return send_json(['error' => 'Invalid or expired token'], 400);
        }

        // 2. Update password
        $password_hash = hash_password($password);
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$password_hash, $reset_request['user_id']]);

        // 3. Mark token as used
        $stmt = $pdo->prepare("UPDATE password_resets SET used_at = CURRENT_TIMESTAMP, used_by_ip = ? WHERE id = ?");
        $stmt->execute([$_SERVER['REMOTE_ADDR'] ?? null, $reset_request['id']]);

        $pdo->commit();
        return send_json(['message' => 'Password reset successful. You can now log in.'], 200);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Reset password error: " . $e->getMessage());
        return send_json(['error' => 'An error occurred. Please try again later.'], 500);
    }
}

