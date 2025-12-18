<?php
// api/routes/invites.php

// Ensure send_json and get_request_data are available
// For now, assuming they are globally available or included by index.php
// If not, consider moving them to a common utility file (e.g., api/utils/api_helpers.php)
// or ensuring they are included here if not in index.php

require_once __DIR__ . '/../utils/password_util.php'; // For password hashing
require_once __DIR__ . '/../utils/token_util.php'; // For generate_secure_token if needed (already in users.php)

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


function handle_invites($method, PDO $pdo, $action = null) {
    switch ($method) {
        case 'POST':
            // Assume 'action' segment is '/accept'
            if ($action === 'accept') {
                return accept_invite($pdo);
            }
            break;
    }
    send_json(['error' => 'Method or action not allowed'], 405);
}

function accept_invite(PDO $pdo) {
    $data = get_request_data();

    // 1. Validate input
    if (empty($data['token']) || empty($data['email']) || empty($data['password'])) {
        return send_json(['error' => 'Token, email, and password are required.'], 400);
    }
    if (strlen($data['password']) < 8) { // Example password policy
        return send_json(['error' => 'Password must be at least 8 characters long.'], 400);
    }

    $invite_token = $data['token'];
    $email = strtolower($data['email']);
    $password = $data['password'];

    $token_hash = hash('sha256', $invite_token);

    $pdo->beginTransaction();
    try {
        // 2. Find and validate invite
        $stmt = $pdo->prepare("SELECT * FROM invites WHERE token_hash = ? AND email = ?");
        $stmt->execute([$token_hash, $email]);
        $invite = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$invite) {
            $pdo->rollBack();
            return send_json(['error' => 'Invalid invitation token or email.'], 400);
        }
        if ($invite['is_used']) {
            $pdo->rollBack();
            return send_json(['error' => 'Invitation already used.'], 400);
        }
        if (strtotime($invite['expires_at']) < time()) {
            $pdo->rollBack();
            return send_json(['error' => 'Invitation expired.'], 400);
        }

        // 3. Hash password and update user
        $password_hash = hash_password($password); // From password_util.php

        // Find the user by email (created with default password_hash by admin)
        $user_stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $user_stmt->execute([$email]);
        $user = $user_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            $pdo->rollBack();
            return send_json(['error' => 'User not found for this email.'], 404);
        }

        $update_user_stmt = $pdo->prepare("UPDATE users SET password_hash = ?, status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $update_user_stmt->execute([$password_hash, $user['id']]);

        // 4. Mark invite as used
        $update_invite_stmt = $pdo->prepare("UPDATE invites SET is_used = 1, used_at = CURRENT_TIMESTAMP, used_by_user_id = ? WHERE id = ?");
        $update_invite_stmt->execute([$user['id'], $invite['id']]);

        $pdo->commit();
        send_json(['message' => 'Account activated and password set successfully. You can now log in.'], 200);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Invite acceptance failed: " . $e->getMessage());
        return send_json(['error' => 'Failed to process invitation.', 'detail' => $e->getMessage()], 500);
    }
}
