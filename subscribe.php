<?php
// Allow cross-domain AJAX if needed
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => 405, "message" => "Method not allowed"]);
    exit;
}

// Example: get the email field from the form
$email = isset($_POST['email']) ? trim($_POST['email']) : '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => 400, "message" => "Invalid email address"]);
    exit;
}

// TODO: Save to database or send to Mailchimp
// For now, just simulate success
echo json_encode(["status" => 200, "message" => "Thank you for subscribing!"]);
exit;
