<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function respond(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'Please submit through the project brief form.']);
}
// No cross-origin submissions; only this site's JSON form can send a brief.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!in_array($origin, ['https://amaanity.com', 'https://www.amaanity.com'], true)) {
    respond(403, ['ok' => false, 'error' => 'Please send your brief from amaanity.com.']);
}
if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
    respond(415, ['ok' => false, 'error' => 'Unsupported submission format.']);
}
$raw = file_get_contents('php://input', false, null, 0, 16001);
if ($raw === false || strlen($raw) > 16000) respond(413, ['ok' => false, 'error' => 'Please shorten your project notes.']);
$data = json_decode($raw, true);
if (!is_array($data)) respond(400, ['ok' => false, 'error' => 'Invalid brief.']);
$name = is_string($data['name'] ?? null) ? trim($data['name']) : '';
$email = is_string($data['email'] ?? null) ? trim($data['email']) : '';
$brief = is_string($data['brief'] ?? null) ? trim($data['brief']) : '';
if ($name === '' || strlen($name) > 150 || preg_match('/[\r\n]/', $name) ||
    strlen($email) > 254 || preg_match('/[\r\n]/', $email) || !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    strlen($brief) < 30 || strlen($brief) > 12000) {
    respond(422, ['ok' => false, 'error' => 'Please check your name, email and project notes.']);
}
// Keep rate-limit data outside the public document root, without recording IPs.
$directory = sys_get_temp_dir() . '/amaanity-brief-rate';
if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
    respond(503, ['ok' => false, 'error' => 'Sending is temporarily unavailable. Please try again shortly.']);
}
$key = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . __FILE__);
$lock = @fopen($directory . '/' . $key, 'c+');
if (!$lock || !flock($lock, LOCK_EX)) respond(503, ['ok' => false, 'error' => 'Please try again shortly.']);
$attempts = json_decode(stream_get_contents($lock) ?: '[]', true) ?: [];
$now = time();
$attempts = array_values(array_filter($attempts, fn($t) => is_int($t) && $t > $now - 3600));
if (count($attempts) >= 5 || ($attempts && $now - end($attempts) < 45)) {
    flock($lock, LOCK_UN); fclose($lock);
    respond(429, ['ok' => false, 'error' => 'Please wait before sending another brief.']);
}
$attempts[] = $now;
rewind($lock); ftruncate($lock, 0); fwrite($lock, json_encode($attempts));
flock($lock, LOCK_UN); fclose($lock);
$headers = [
    'From' => 'Amaanity Website <amaan@amaanity.com>',
    'Reply-To' => $email,
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
];
$body = "New website project brief\n\n" . $brief . "\n\nReply directly to this email to contact the client.\n";
$sent = function_exists('mail') && @mail('amaan@amaanity.com', 'New Amaanity project brief', $body, $headers);
if (!$sent) respond(503, ['ok' => false, 'error' => 'Your brief could not be sent. Please try again or email amaan@amaanity.com.']);
respond(200, ['ok' => true]);
