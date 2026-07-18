<?php
/**
 * Zirian EV Charging Solutions - REST API Leads Endpoint
 * Returns leads list in JSON format, secured by a static Bearer Token.
 * Ready for Scouting App integration.
 */

// Headers for REST API response
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Allow preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Utilice peticiones GET.'
    ]);
    exit;
}

// Secure API Token Definition (Update this token with a strong secret key)
define('API_SECURE_TOKEN', 'Zirian_Scouting_Secure_2026_Token');

// Authentication check
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? trim($headers['Authorization']) : '';
$queryParamsToken = isset($_GET['api_token']) ? trim($_GET['api_token']) : '';

$isAuthenticated = false;

// 1. Verify via Bearer token in Authorization header
if (!empty($authHeader) && preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
    if ($matches[1] === API_SECURE_TOKEN) {
        $isAuthenticated = true;
    }
}

// 2. Fallback: Verify via query parameter api_token
if (!$isAuthenticated && !empty($queryParamsToken)) {
    if ($queryParamsToken === API_SECURE_TOKEN) {
        $isAuthenticated = true;
    }
}

// If authentication fails, return 401 Unauthorized
if (!$isAuthenticated) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Acceso denegado. Token de seguridad no válido o ausente.'
    ]);
    exit;
}

require_once 'conexion.php';

try {
    // Optional filters: filter by status or tipo_lead
    $statusFilter = isset($_GET['status']) ? trim(strip_tags($_GET['status'])) : null;
    $tipoFilter = isset($_GET['tipo_lead']) ? trim(strip_tags($_GET['tipo_lead'])) : null;
    
    $query = "SELECT `id`, `nombre`, `telefono`, `email`, `marca_ev`, `tipo_instalacion`, `distancia_centro_carga`, `tipo_lead`, `ubicacion`, `status`, `fecha_creacion` 
              FROM `leads` WHERE 1=1";
    
    $params = [];
    
    if ($statusFilter !== null) {
        $query .= " AND `status` = :status";
        $params[':status'] = $statusFilter;
    }
    
    if ($tipoFilter !== null) {
        $query .= " AND `tipo_lead` = :tipo_lead";
        $params[':tipo_lead'] = $tipoFilter;
    }
    
    // Order by newest first
    $query .= " ORDER BY `fecha_creacion` DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    $leads = $stmt->fetchAll();
    
    // Return leads list
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'total' => count($leads),
        'leads' => $leads
    ]);
    
} catch (PDOException $e) {
    error_log("API Leads fetch failed: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al recuperar los leads desde el servidor.'
    ]);
}
