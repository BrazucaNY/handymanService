<?php
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

// Send email to yourself
$to = "davi65@gmail.com";
$subject = "New Newsletter Subscription";
$message = "A new user subscribed:\n\nEmail: {$email}";
$headers = "From: no-reply@rodrigueshandyman.com\r\n" .
           "Reply-To: no-reply@rodrigueshandyman.com\r\n" .
           "X-Mailer: PHP/" . phpversion();

if (mail($to, $subject, $message, $headers)) {
    echo json_encode(["status" => 200, "message" => "Thank you for subscribing!"]);
} else {
    echo json_encode(["status" => 500, "message" => "Subscription received, but email failed to send."]);
}
exit;
