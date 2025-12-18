<?php
// api/routes/users.php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/password_util.php'; // Assuming a password utility for hashing/verification
require_once __DIR__ . '/../utils/token_util.php'; // Assuming a token utility for generating invite tokens

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

function handle_users($method, PDO $pdo, $segments, $current_user = null) {
    $id = $segments[1] ?? null;
    $action = $segments[2] ?? null;
    // get_request_data for POST, PUT, PATCH handles JSON and form data
    $request_data = get_request_data();

    // Method override for POST requests acting as PUT/PATCH/DELETE
    if (isset($request_data['_method'])) {
        $method = strtoupper($request_data['_method']);
    }

    // Handle specific actions for a user ID
    if ($id && $action === 'generate-invite-token' && $method === 'POST') {
        return generate_invite_token_for_user($pdo, $id, $current_user);
    }

    switch ($method) {
        case 'GET':
            if ($id) return get_user($pdo, $id);
            return list_users($pdo);
        case 'POST':
            return create_user($pdo, $request_data, $current_user);
        case 'PUT':
        case 'PATCH':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return update_user($pdo, $id, $request_data, $current_user);
        case 'DELETE':
            if (!$id) return send_json(['error' => 'ID required'], 400);
            return delete_user($pdo, $id, $current_user);
        default:
            return send_json(['error' => 'Method not allowed'], 405);
    }
}

function list_users(PDO $pdo) {
    // Join with roles to get role name, and invites to get invite_token for inactive users
    $stmt = $pdo->query("
        SELECT 
            u.id, u.name, u.email, u.status, 
            r.name as role_name, r.id as role_id, 
            u.created_at, u.updated_at,
            CASE 
                WHEN u.status = 'inActive' AND i.is_used = 0 AND i.expires_at > NOW() 
                THEN i.token_hash 
                ELSE NULL 
            END AS invite_token
        FROM users u 
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN invites i ON u.email = i.email
        ORDER BY u.id DESC
    ");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    send_json($users);
}

function get_user(PDO $pdo, $id) {
    // Exclude password_hash
    $stmt = $pdo->prepare("SELECT u.id, u.name, u.email, u.status, r.name as role_name, r.id as role_id, u.created_at, u.updated_at FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) return send_json(['error' => 'User not found'], 404);
    send_json($user);
}

function create_user(PDO $pdo, $data, $current_user) {
    if (!$current_user) return send_json(['error' => 'Unauthorized'], 401);

    if (empty($data['name']) || empty($data['email']) || empty($data['role_id'])) {
        return send_json(['error' => 'Name, email, and role are required'], 400);
    }

    // Role check: Admin cannot create CEO
    // Fetch role name of the role being assigned
    $stmt = $pdo->prepare("SELECT name FROM roles WHERE id = ?");
    $stmt->execute([$data['role_id']]);
    $target_role = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$target_role) return send_json(['error' => 'Invalid role ID'], 400);

    $is_admin = strtolower($current_user['role_name']) === 'admin';
    $is_ceo = strtolower($current_user['role_name']) === 'ceo';
    $target_role_is_ceo = strtolower($target_role['name']) === 'ceo';

    if ($is_admin && $target_role_is_ceo) {
        return send_json(['error' => 'Admins cannot create CEO accounts.'], 403);
    }
    // Only Admin and CEO can create users (implied by access to this route, but good to double check if we had more roles)

    // Default status to 'inActive' for new users created via admin panel
    $status = $data['status'] ?? 'inActive';

    // Use a non-functional password hash for users created via invite (or NULL)
    // The schema specifies password_hash NOT NULL, so use an empty string hash or a specific placeholder
    $empty_password_hash = password_hash('', PASSWORD_DEFAULT); // Hash an empty string or use a specific placeholder
    
    $pdo->beginTransaction();
    try {
        // 1. Create the user
        $stmt = $pdo->prepare("INSERT INTO users (name, email, role_id, status, password_hash) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['email'], $data['role_id'], $status, $empty_password_hash]);
        $new_user_id = $pdo->lastInsertId();
        error_log("create_user: After user INSERT, new_user_id = " . var_export($new_user_id, true));

        if (!$new_user_id) {
            error_log("create_user: Failed to get lastInsertId after user INSERT. Rolling back.");
            $pdo->rollBack();
            return send_json(['error' => 'Failed to create user record'], 500);
        }

        // 2. Create an invite for the new user
        $invite_token = generate_secure_token(); // Function from token_util.php
        $token_hash = hash('sha256', $invite_token);
        $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour')); // Invite expires in 1 hour
        
        $invite_stmt = $pdo->prepare("INSERT INTO invites (token_hash, email, role_id, issued_by, expires_at) VALUES (?, ?, ?, ?, ?)");
        $issued_by = $current_user['id'];
        $invite_stmt->execute([$token_hash, $data['email'], $data['role_id'], $issued_by, $expires_at]);
        error_log("create_user: After invite INSERT.");
        
        // Fetch and return the newly created user along with the invite token
        $user = get_user_data_for_response($pdo, $new_user_id);
        $user['invite_token'] = $invite_token; // Return the raw token
        $user['invite_link'] = FRONTEND_URL . "/accept-invite?token=" . $invite_token . "&email=" . urlencode($data['email']);
        
        $pdo->commit();
        error_log("create_user: Transaction committed successfully.");
        return send_json($user, 201);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("create_user: PDOException caught: " . $e->getMessage() . " Code: " . $e->getCode());
        // Handle duplicate email error
        if ($e->getCode() == 23000) { // Integrity constraint violation
            return send_json(['error' => 'Email already exists'], 409);
        }
        return send_json(['error' => 'Failed to create user', 'detail' => $e->getMessage()], 500);
    }
}

function update_user(PDO $pdo, $id, $data, $current_user) {
    if (!$current_user) return send_json(['error' => 'Unauthorized'], 401);

    // Fetch existing user to check their role
    $stmt = $pdo->prepare("SELECT u.id, u.email, u.name, u.status, u.role_id, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?");
    $stmt->execute([$id]);
    $target_user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$target_user) return send_json(['error' => 'User not found'], 404);

    $is_admin = strtolower($current_user['role_name']) === 'admin';
    $is_ceo = strtolower($current_user['role_name']) === 'ceo';
    $target_is_ceo = strtolower($target_user['role_name']) === 'ceo';
    $is_self = $current_user['id'] == $id;

    $fields = [];
    $values = [];

    // Fields to allow updating - start with common fields
    $allowable_for_update = ['name', 'email', 'status', 'profile_pic', 'bio'];

    // RBAC Rules for who can update whom
    // Rule 1: Admin cannot update CEO
    if ($is_admin && $target_is_ceo) {
        return send_json(['error' => 'Admins cannot modify CEO accounts.'], 403);
    }

    // Handle role_id changes specifically
    if (isset($data['role_id']) && $data['role_id'] != $target_user['role_id']) {
        // Validate if the new role_id exists
        $role_stmt = $pdo->prepare("SELECT id FROM roles WHERE id = ?");
        $role_stmt->execute([$data['role_id']]);
        if (!$role_stmt->fetch(PDO::FETCH_ASSOC)) {
            return send_json(['error' => 'Invalid role ID provided.'], 400);
        }

        // Rule 2: User cannot change their own role
        if ($is_self) {
            return send_json(['error' => 'You cannot change your own role.'], 403);
        }
        // Rule 3: Only CEO can change other users' roles
        if (!$is_ceo) {
            return send_json(['error' => 'Only CEO can change user roles.'], 403);
        }
        // If current user is CEO and not self-editing, allow role change
        $fields[] = "role_id = ?";
        $values[] = $data['role_id'];
    }

    // Process other allowable fields
    foreach ($allowable_for_update as $field) {
        if (array_key_exists($field, $data)) {
            $fields[] = "$field = ?";
            $values[] = $data[$field];
        }
    }

    if (empty($fields)) {
        return get_user_data_for_response($pdo, $id); // No changes
    }

    $values[] = $id;
    $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        $pdo->commit();
        return get_user_data_for_response($pdo, $id);
    } catch (PDOException $e) {
        $pdo->rollBack();
        if ($e->getCode() == 23000) { // Integrity constraint violation (e.g., duplicate email)
            return send_json(['error' => 'Email already exists or invalid role_id'], 409);
        }
        return send_json(['error' => 'Failed to update user', 'detail' => $e->getMessage()], 500);
    }
}

function delete_user(PDO $pdo, $id, $current_user) {
    if (!$current_user) return send_json(['error' => 'Unauthorized'], 401);

    // Fetch target user and their profile pic
    $stmt = $pdo->prepare("SELECT u.id, u.role_id, u.profile_pic, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?");
    $stmt->execute([$id]);
    $target_user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$target_user) return send_json(['error' => 'User not found'], 404);

    $is_admin = strtolower($current_user['role_name']) === 'admin';
    $target_is_ceo = strtolower($target_user['role_name']) === 'ceo';
    $is_self = $current_user['id'] == $id;

    // RBAC Rules:
    // 1. User cannot delete themselves
    if ($is_self) {
        return send_json(['error' => 'You cannot delete your own account.'], 403);
    }

    // 2. Admin cannot delete CEO
    if ($is_admin && $target_is_ceo) {
        return send_json(['error' => 'Admins cannot delete CEO accounts.'], 403);
    }

    $pdo->beginTransaction();
    try {
        // Delete invites associated with this user's email if they were never used
        $stmt_invites = $pdo->prepare("DELETE FROM invites WHERE email = (SELECT email FROM users WHERE id = ?) AND is_used = 0");
        $stmt_invites->execute([$id]);

        // Delete the user record
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            $pdo->rollBack();
            return send_json(['error' => 'User not found'], 404);
        }

        // If deletion was successful, remove the profile picture file
        if ($target_user['profile_pic']) {
            require_once __DIR__ . '/../utils/ImageUpload.php';
            ImageUpload::deleteImageFiles($target_user['profile_pic']);
        }

        $pdo->commit();
        http_response_code(204);
        exit;
    } catch (PDOException $e) {
        $pdo->rollBack();
        return send_json(['error' => 'Delete failed', 'detail' => $e->getMessage()], 500);
    }
}

// Helper to get user data for response, excluding password_hash
function get_user_data_for_response(PDO $pdo, $id) {
    $stmt = $pdo->prepare("
        SELECT 
            u.id, u.name, u.email, u.status, 
            r.name as role_name, r.id as role_id, 
            u.created_at, u.updated_at,
            CASE 
                WHEN u.status = 'inActive' AND i.is_used = 0 AND i.expires_at > NOW() 
                THEN i.token_hash 
                ELSE NULL 
            END AS invite_token
        FROM users u 
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN invites i ON u.email = i.email AND i.role_id = u.role_id
        WHERE u.id = ?
        ORDER BY i.expires_at DESC
        LIMIT 1
    ");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function generate_invite_token_for_user(PDO $pdo, $user_id, $current_user) {
    if (!$current_user) {
        return send_json(['error' => 'Unauthorized'], 401);
    }

    $current_user_role = strtolower($current_user['role_name']);
    if ($current_user_role !== 'admin' && $current_user_role !== 'ceo') {
        return send_json(['error' => 'Only Admins or CEOs can generate invite tokens.'], 403);
    }

    // Fetch the target user's details
    $stmt = $pdo->prepare("SELECT id, email, role_id, status FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $target_user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$target_user) {
        return send_json(['error' => 'User not found'], 404);
    }
    
    // An active user should not need an invite token, they already have an account
    if ($target_user['status'] !== 'inActive') {
        return send_json(['error' => 'Invite token can only be generated for inactive users.'], 400);
    }

    $pdo->beginTransaction();
    try {
        // 1. Invalidate/Delete existing unused invites for this user's email
        // This ensures only one active invite exists per user at a time.
        $delete_stmt = $pdo->prepare("DELETE FROM invites WHERE email = ? AND is_used = 0");
        $delete_stmt->execute([$target_user['email']]);

        // 2. Generate a new plain-text invite token
        $invite_token = generate_secure_token(); // From token_util.php
        $token_hash = hash('sha256', $invite_token);
        $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour')); // Invite expires in 1 hour
        
        // 3. Store the new hashed token in the invites table
        $invite_stmt = $pdo->prepare("INSERT INTO invites (token_hash, email, role_id, issued_by, expires_at) VALUES (?, ?, ?, ?, ?)");
        $issued_by = $current_user['id'];
        $invite_stmt->execute([$token_hash, $target_user['email'], $target_user['role_id'], $issued_by, $expires_at]);
        
        $pdo->commit();
        
        // 4. Return the plain-text invite token to the frontend
        return send_json(['invite_token' => $invite_token], 200);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("generate_invite_token_for_user: PDOException caught: " . $e->getMessage());
        return send_json(['error' => 'Failed to generate invite token', 'detail' => $e->getMessage()], 500);
    }
}

