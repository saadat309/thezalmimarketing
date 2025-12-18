<?php
// api/utils/password_util.php

// Function to hash a password
// (Not used directly by user creation form, but good to have for login/reset)
function hash_password($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Function to verify a password
// (Not used directly by user creation form)
function verify_password($password, $hash) {
    return password_verify($password, $hash);
}
