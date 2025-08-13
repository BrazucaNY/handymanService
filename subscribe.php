<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => 405, "message" => "Method not allowed"]);
    exit;
}

$email = isset($_POST['email_id']) ? trim($_POST['email_id']) : '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => 400, "message" => "Invalid email address"]);
    exit;
}

// Example: save to a file (replace with database or Mailchimp API if needed)
$file = __DIR__ . '/subscribers.txt';
file_put_contents($file, $email . PHP_EOL, FILE_APPEND | LOCK_EX);

echo json_encode(["status" => 200, "message" => "Thank you for subscribing!"]);
exit;
