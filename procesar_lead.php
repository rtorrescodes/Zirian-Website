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
    
    // Send email notification via SMTP
    require_once 'enviar_correo.php';
    
    $asunto = "Nuevo Lead registrado: " . $nombre . " (" . $tipo_lead . ")";
    $cuerpoHtml = "
    <div style='font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
        <h2 style='color: #0066FF; border-bottom: 2px solid #00D2FF; padding-bottom: 10px;'>Nuevo Registro en Zirian Website</h2>
        <p>Se ha recibido un nuevo registro de lead:</p>
        <table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>
            <tr style='background-color: #f9f9f9;'><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Nombre:</td><td style='padding: 8px; border: 1px solid #ddd;'>{$nombre}</td></tr>
            <tr><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Teléfono / WhatsApp:</td><td style='padding: 8px; border: 1px solid #ddd;'>{$telefono}</td></tr>
            <tr style='background-color: #f9f9f9;'><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Email:</td><td style='padding: 8px; border: 1px solid #ddd;'>" . (!empty($email) ? $email : 'No proporcionado') . "</td></tr>
            <tr><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Ubicación:</td><td style='padding: 8px; border: 1px solid #ddd;'>{$ubicacion}</td></tr>
            <tr style='background-color: #f9f9f9;'><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Tipo de Lead:</td><td style='padding: 8px; border: 1px solid #ddd;'>{$tipo_lead}</td></tr>
            <tr><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Marca EV:</td><td style='padding: 8px; border: 1px solid #ddd;'>" . (!empty($marca_ev) ? $marca_ev : 'N/A') . "</td></tr>
            <tr style='background-color: #f9f9f9;'><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Tipo Instalación:</td><td style='padding: 8px; border: 1px solid #ddd;'>" . (!empty($tipo_instalacion) ? $tipo_instalacion : 'N/A') . "</td></tr>
            <tr><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Distancia Carga:</td><td style='padding: 8px; border: 1px solid #ddd;'>" . (!empty($distancia_centro_carga) ? $distancia_centro_carga : 'N/A') . "</td></tr>
            <tr style='background-color: #f9f9f9;'><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Fecha Registro:</td><td style='padding: 8px; border: 1px solid #ddd;'>" . date('Y-m-d H:i:s') . "</td></tr>
        </table>
        <br>
        <p style='text-align: center;'><a href='https://zirian.com/admin_dashboard.php' style='display: inline-block; padding: 10px 20px; background-color: #0066FF; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;'>Ver en Dashboard CRM</a></p>
    </div>
    ";
    
    enviarCorreoSMTP($asunto, $cuerpoHtml);

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
