<?php
// api/utils/token_util.php

function generate_secure_token($length = 32) {
    return bin2hex(random_bytes($length));
}
