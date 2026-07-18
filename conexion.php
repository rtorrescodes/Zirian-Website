<?php
/**
 * Zirian EV Charging Solutions - Database Connection (PDO)
 * Designed for secure cPanel environment
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'qjgjivmy_zirianwebsite');
define('DB_PASS', 'p3XCdAp375EkbrS');
define('DB_NAME', 'qjgjivmy_zirianwebsite');

try {
    // Set DSN with UTF-8 encoding
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    
    // PDO options for security and error handling
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false, // True prepared statements for SQL Injection prevention
    ];
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
} catch (PDOException $e) {
    // Write detailed error to server logs but hide details from end-user
    error_log("Connection failed: " . $e->getMessage());
    
    // Set HTTP response code and return secure error message
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión interna. Por favor, intente más tarde.'
    ]);
    exit;
}
