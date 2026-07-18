<?php
/**
 * Zirian EV Charging Solutions - Lead Processor
 * Receives data via POST (JSON or Form Data), validates, sanitizes, and inserts into DB securely.
 */

// Headers for REST API compliance
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Allow preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Utilice peticiones POST.'
    ]);
    exit;
}

// Include connection
require_once 'conexion.php';

// Read raw body if JSON, otherwise fall back to $_POST
$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);

if (json_last_error() !== JSON_ERROR_NONE || empty($data)) {
    $data = $_POST;
}

// Extract and sanitize input data
$nombre = isset($data['nombre']) ? trim(strip_tags($data['nombre'])) : '';
$telefono = isset($data['telefono']) ? trim(strip_tags($data['telefono'])) : '';
$email = isset($data['email']) ? trim(strip_tags($data['email'])) : '';
$ubicacion = isset($data['ubicacion']) ? trim(strip_tags($data['ubicacion'])) : '';

// Extra fields for the interactive estimator
$marca_ev = isset($data['marca_ev']) ? trim(strip_tags($data['marca_ev'])) : null;
$tipo_instalacion = isset($data['tipo_instalacion']) ? trim(strip_tags($data['tipo_instalacion'])) : null;
$distancia_centro_carga = isset($data['distancia_centro_carga']) ? trim(strip_tags($data['distancia_centro_carga'])) : null;
$tipo_lead = isset($data['tipo_lead']) ? trim(strip_tags($data['tipo_lead'])) : 'Contacto Directo';

// Validation Rules
$errors = [];

if (empty($nombre)) {
    $errors[] = 'El nombre es obligatorio.';
} elseif (strlen($nombre) > 100) {
    $errors[] = 'El nombre no debe exceder los 100 caracteres.';
}

if (empty($telefono)) {
    $errors[] = 'El teléfono es obligatorio.';
} elseif (!preg_match('/^[0-9\s\-\+\(\)]{8,20}$/', $telefono)) {
    $errors[] = 'El formato del teléfono no es válido (use entre 8 y 20 caracteres numéricos).';
}

if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'El formato del correo electrónico no es válido.';
}

if (empty($ubicacion)) {
    $errors[] = 'La ubicación (Ciudad o Código Postal) es obligatoria.';
}

// If validation fails, return errors
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Error de validación de datos.',
        'errors' => $errors
    ]);
    exit;
}

try {
    // Insert statement using Prepared Statements (safe against SQL Injection)
    $sql = "INSERT INTO `leads` 
            (`nombre`, `telefono`, `email`, `marca_ev`, `tipo_instalacion`, `distancia_centro_carga`, `tipo_lead`, `ubicacion`, `status`, `fecha_creacion`) 
            VALUES 
            (:nombre, :telefono, :email, :marca_ev, :tipo_instalacion, :distancia_centro_carga, :tipo_lead, :ubicacion, 'Nuevo', NOW())";
            
    $stmt = $pdo->prepare($sql);
    
    // Bind parameters
    $stmt->execute([
        ':nombre'                 => $nombre,
        ':telefono'               => $telefono,
        ':email'                  => !empty($email) ? $email : null,
        ':marca_ev'               => $marca_ev,
        ':tipo_instalacion'       => $tipo_instalacion,
        ':distancia_centro_carga' => $distancia_centro_carga,
        ':tipo_lead'              => $tipo_lead,
        ':ubicacion'              => $ubicacion
    ]);
    
    // Return success response
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => '¡Cotización / Lead registrado con éxito! Un especialista de Zirian se pondrá en contacto a la brevedad.'
    ]);
    
} catch (PDOException $e) {
    // Log exception details
    error_log("Database insertion failed: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lo sentimos, ocurrió un error en nuestro sistema al procesar su solicitud. Intente de nuevo.'
    ]);
}
