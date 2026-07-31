<?php
/**
 * Zirian EV Charging Solutions - Admin Dashboard (Mini-CRM)
 * Protected by a basic password, displays leads/quotes, updates lead statuses,
 * and lists active technical support tickets.
 */

session_start();

// Define Admin Password (Change this to your desired password for production)
define('ADMIN_PASSWORD', 'Zirian2026!');

// Handle Logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    unset($_SESSION['admin_logged_in']);
    session_destroy();
    header('Location: admin_dashboard.php');
    exit;
}

// Handle Login Form Submission
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if ($_POST['password'] === ADMIN_PASSWORD) {
        $_SESSION['admin_logged_in'] = true;
        // Regenerate session ID for security
        session_regenerate_id(true);
        header('Location: admin_dashboard.php');
        exit;
    } else {
        $error = 'Contraseña de acceso incorrecta. Intente de nuevo.';
    }
}

// Check Authentication
$authenticated = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

if (!$authenticated):
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zirian CRM - Acceso Administrativo</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #070a13;
        }
        .font-tech {
            font-family: 'Orbitron', sans-serif;
        }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen p-4 text-white overflow-hidden relative">
    <!-- Neon Background Accents -->
    <div class="absolute w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] top-1/4 left-1/4"></div>
    <div class="absolute w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[100px] bottom-1/4 right-1/4"></div>

    <div class="w-full max-w-md backdrop-blur-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10">
        <!-- Logo -->
        <div class="text-center mb-8">
            <h1 class="font-tech text-3xl font-bold tracking-wider bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                ZIRIAN
            </h1>
            <p class="text-slate-400 text-xs mt-1 uppercase tracking-widest font-tech">Control Center / CRM</p>
        </div>

        <?php if (!empty($error)): ?>
            <div class="bg-red-900/30 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg mb-6 flex items-center">
                <svg class="w-5 h-5 mr-2 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span><?php echo htmlspecialchars($error); ?></span>
            </div>
        <?php endif; ?>

        <form action="admin_dashboard.php" method="POST" class="space-y-6">
            <div>
                <label for="password" class="block text-slate-300 text-sm font-semibold mb-2">Contraseña del Sistema</label>
                <input type="password" id="password" name="password" required autofocus
                       class="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-600 transition"
                       placeholder="••••••••••••">
            </div>
            
            <button type="submit" 
                    class="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300 font-tech uppercase tracking-wide">
                Ingresar al CRM
            </button>
        </form>
    </div>
</body>
</html>
<?php 
exit; 
endif; 

// User is authenticated. Include database connection
require_once 'conexion.php';

// Self-healing database check to ensure `fecha_visita` exists
try {
    $pdo->query("SELECT `fecha_visita` FROM `leads` LIMIT 1");
} catch (PDOException $e) {
    try {
        $pdo->exec("ALTER TABLE `leads` ADD COLUMN `fecha_visita` DATETIME NULL AFTER `status`");
    } catch (PDOException $ex) {
        $error = "Error al actualizar la base de datos para soporte de calendario: " . $ex->getMessage();
    }
}

// Handle Lead Status Updates
$msg = isset($_GET['msg']) ? trim($_GET['msg']) : '';
if (isset($_GET['action']) && $_GET['action'] === 'update_status' && isset($_GET['id']) && isset($_GET['status'])) {
    $lead_id = (int)$_GET['id'];
    $new_status = trim($_GET['status']);
    
    $allowed_statuses = ['Nuevo', 'Contactado', 'Visita Programada'];
    if (in_array($new_status, $allowed_statuses)) {
        try {
            $sql = "UPDATE `leads` SET `status` = :status";
            $params = [':status' => $new_status, ':id' => $lead_id];
            if ($new_status !== 'Visita Programada') {
                $sql .= ", `fecha_visita` = NULL";
            }
            $sql .= " WHERE `id` = :id";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            header('Location: admin_dashboard.php?msg=' . urlencode('Estado del lead actualizado correctamente.'));
            exit;
        } catch (PDOException $e) {
            $error = 'Error en base de datos: ' . $e->getMessage();
        }
    }
}

// Handle Scheduling a Visit Date
if (isset($_GET['action']) && $_GET['action'] === 'schedule_visit' && isset($_GET['id']) && isset($_GET['date'])) {
    $lead_id = (int)$_GET['id'];
    $visit_date = trim($_GET['date']);
    
    try {
        $stmt = $pdo->prepare("UPDATE `leads` SET `status` = 'Visita Programada', `fecha_visita` = :fecha_visita WHERE `id` = :id");
        $stmt->execute([':fecha_visita' => $visit_date, ':id' => $lead_id]);
        $msg = 'Visita agendada correctamente para el ' . date('d/M/Y H:i', strtotime($visit_date)) . '.';
        header('Location: admin_dashboard.php?msg=' . urlencode($msg));
        exit;
    } catch (PDOException $e) {
        $error = 'Error en base de datos al agendar visita: ' . $e->getMessage();
    }
}

// Handle Ticket Status Updates
if (isset($_GET['action']) && $_GET['action'] === 'update_ticket_status' && isset($_GET['id']) && isset($_GET['status'])) {
    $ticket_id = (int)$_GET['id'];
    $new_status = trim($_GET['status']);
    
    $allowed_ticket_statuses = ['Abierto', 'Resuelto', 'Cerrado'];
    if (in_array($new_status, $allowed_ticket_statuses)) {
        try {
            $stmt = $pdo->prepare("UPDATE `support_tickets` SET `status` = :status WHERE `id` = :id");
            $stmt->execute([':status' => $new_status, ':id' => $ticket_id]);
            header('Location: admin_dashboard.php?msg=' . urlencode('Estado del ticket de soporte actualizado correctamente.'));
            exit;
        } catch (PDOException $e) {
            $error = 'Error en base de datos: ' . $e->getMessage();
        }
    }
}

// Fetch Leads & Quotes
try {
    $stmt = $pdo->query("SELECT * FROM `leads` ORDER BY `fecha_creacion` DESC");
    $leads = $stmt->fetchAll();
    
    // Fetch Support Tickets
    $stmt_tickets = $pdo->query("SELECT * FROM `support_tickets` ORDER BY `fecha_creacion` DESC");
    $tickets = $stmt_tickets->fetchAll();
    
    // Fetch Statistics
    $total_leads = count($leads);
    $qualified_leads = 0;
    $active_tickets = 0;
    
    foreach ($leads as $l) {
        if ($l['tipo_lead'] === 'Cotización Cualificada') {
            $qualified_leads++;
        }
    }
    
    foreach ($tickets as $t) {
        if ($t['status'] === 'Abierto') {
            $active_tickets++;
        }
    }
    
} catch (PDOException $e) {
    $error = 'Error al cargar los datos del sistema: ' . $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zirian CRM - Panel de Administración</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #070a13;
        }
        .font-tech {
            font-family: 'Orbitron', sans-serif;
        }
    </style>
</head>
<body class="min-h-screen text-slate-100 p-4 sm:p-6 lg:p-8">

    <!-- Top Navigation Header -->
    <header class="w-full max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center bg-slate-900/80 border border-slate-800 p-4 sm:p-6 rounded-2xl backdrop-blur-md gap-4">
        <div class="flex items-center space-x-3">
            <div class="bg-gradient-to-tr from-blue-600 to-emerald-500 p-2.5 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
            </div>
            <div>
                <h1 class="font-tech text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">ZIRIAN CRM</h1>
                <p class="text-slate-400 text-xs tracking-wider uppercase">Portal de Administración & Control</p>
            </div>
        </div>
        
        <div class="flex items-center space-x-4">
            <span class="text-xs px-3 py-1 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 rounded-full font-tech">ONLINE</span>
            <a href="admin_dashboard.php?action=logout" 
               class="text-sm bg-slate-800 hover:bg-red-950 border border-slate-700 hover:border-red-900 px-4 py-2 rounded-xl transition duration-300">
                Cerrar Sesión
            </a>
        </div>
    </header>

    <main class="w-full max-w-7xl mx-auto space-y-8">
        
        <!-- Welcome Header / Gerente Profile -->
        <div class="w-full bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between backdrop-blur-md gap-4">
            <div class="flex items-center space-x-4">
                <div class="relative">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-bold text-white text-lg font-tech shadow-md shadow-blue-500/10">
                        R
                    </div>
                    <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div>
                    <h2 class="text-white font-semibold text-base flex items-center gap-1.5">
                        Hola Rodrigo
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </h2>
                    <p class="text-xs text-blue-400 font-tech uppercase tracking-wider">Tienes acceso de Gerente</p>
                </div>
            </div>
            <div class="text-right hidden sm:block">
                <span class="text-slate-500 text-[10px] uppercase font-tech tracking-wider block">Fecha Control</span>
                <span class="text-sm font-semibold text-white font-tech"><?php echo date('d / M / Y'); ?></span>
            </div>
        </div>
        <!-- Alerts -->
        <?php if (!empty($msg)): ?>
            <div class="bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-sm p-4 rounded-xl flex items-center">
                <svg class="w-5 h-5 mr-3 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span><?php echo htmlspecialchars($msg); ?></span>
            </div>
        <?php endif; ?>
        
        <?php if (!empty($error)): ?>
            <div class="bg-red-950/40 border border-red-500/50 text-red-200 text-sm p-4 rounded-xl flex items-center">
                <svg class="w-5 h-5 mr-3 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span><?php echo htmlspecialchars($error); ?></span>
            </div>
        <?php endif; ?>

        <!-- KPI Stats Cards -->
        <section class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <a href="#leads-section" onclick="filterLeads('all')" 
               class="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-blue-500 hover:bg-slate-900/80 hover:scale-[1.02] transition-all duration-300 cursor-pointer block text-center flex flex-col items-center justify-center group">
                <p class="text-slate-400 text-sm group-hover:text-blue-400 transition-colors">Prospectos Totales</p>
                <div class="flex items-baseline space-x-2 mt-2 justify-center">
                    <span class="text-4xl font-bold font-tech text-blue-400"><?php echo $total_leads; ?></span>
                    <span class="text-slate-500 text-xs">registrados</span>
                </div>
            </a>
            
            <a href="#leads-section" onclick="filterLeads('Cotización Cualificada')" 
               class="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-emerald-500 hover:bg-slate-900/80 hover:scale-[1.02] transition-all duration-300 cursor-pointer block text-center flex flex-col items-center justify-center group">
                <p class="text-slate-400 text-sm group-hover:text-emerald-400 transition-colors">Cotizaciones Cualificadas</p>
                <div class="flex items-baseline space-x-2 mt-2 justify-center">
                    <span class="text-4xl font-bold font-tech text-emerald-400"><?php echo $qualified_leads; ?></span>
                    <span class="text-slate-500 text-xs">desde cotizador</span>
                </div>
            </a>

            <a href="#tickets-section" 
               class="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-amber-500 hover:bg-slate-900/80 hover:scale-[1.02] transition-all duration-300 cursor-pointer block text-center flex flex-col items-center justify-center group">
                <p class="text-slate-400 text-sm group-hover:text-amber-400 transition-colors">Tickets Abiertos</p>
                <div class="flex items-baseline space-x-2 mt-2 justify-center">
                    <span class="text-4xl font-bold font-tech text-amber-500"><?php echo $active_tickets; ?></span>
                    <span class="text-slate-500 text-xs">soporte pendientes</span>
                </div>
            </a>
        </section>

        <!-- TABLE 1: Leads and Qualified Estimates -->
        <section id="leads-section" class="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div class="p-6 border-b border-slate-850 bg-slate-900/40 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <div class="flex items-center space-x-3">
                        <h2 class="font-tech text-lg font-bold text-white">Leads y Cotizaciones Recientes</h2>
                        <span id="filter-badge" class="hidden px-2.5 py-0.5 text-[10px] rounded-full bg-blue-950 border border-blue-500/50 text-blue-300 font-medium font-tech uppercase"></span>
                        <button id="filter-reset-btn" onclick="filterLeads('all')" class="hidden text-xs text-red-400 hover:text-red-300 hover:underline font-medium">Restablecer</button>
                    </div>
                    <p class="text-xs text-slate-400">Prospectos capturados vía formularios e interactivos</p>
                </div>
                <span class="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 font-tech">API Listo</span>
            </div>
            
            <div class="overflow-x-auto w-full">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <th class="px-6 py-4">Fecha</th>
                            <th class="px-6 py-4">Nombre / Contacto</th>
                            <th class="px-6 py-4">Tipo Lead</th>
                            <th class="px-6 py-4">Detalles EV / Proyecto</th>
                            <th class="px-6 py-4">Ubicación</th>
                            <th class="px-6 py-4 text-center">Estado</th>
                            <th class="px-6 py-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/60 text-sm">
                        <?php if (empty($leads)): ?>
                            <tr>
                                <td colspan="7" class="px-6 py-10 text-center text-slate-500 font-tech">No hay prospectos registrados aún.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($leads as $l): ?>
                                <tr class="hover:bg-slate-950/20 transition duration-150" 
                                    data-tipo-lead="<?php echo htmlspecialchars($l['tipo_lead']); ?>"
                                    data-status="<?php echo htmlspecialchars($l['status']); ?>">
                                    <td class="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                                        <?php echo date('d/M/Y H:i', strtotime($l['fecha_creacion'])); ?>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="font-semibold text-white"><?php echo htmlspecialchars($l['nombre']); ?></div>
                                        <div class="text-xs text-slate-400 flex flex-col mt-0.5">
                                            <span>📞 <?php echo htmlspecialchars($l['telefono']); ?></span>
                                            <?php if (!empty($l['email'])): ?>
                                                <span>✉️ <?php echo htmlspecialchars($l['email']); ?></span>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <?php if ($l['tipo_lead'] === 'Cotización Cualificada'): ?>
                                            <span class="px-2.5 py-1 text-xs rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-medium">
                                                Cualificada
                                            </span>
                                        <?php else: ?>
                                            <span class="px-2.5 py-1 text-xs rounded-full bg-blue-950/60 border border-blue-500/40 text-blue-300 font-medium">
                                                Contacto Directo
                                            </span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="px-6 py-4">
                                        <?php if ($l['tipo_lead'] === 'Cotización Cualificada'): ?>
                                            <div class="text-xs text-slate-300 space-y-0.5">
                                                <div>🚗 <span class="font-medium text-white"><?php echo htmlspecialchars($l['marca_ev']); ?></span></div>
                                                <div>🏢 Instalación: <?php echo htmlspecialchars($l['tipo_instalacion']); ?></div>
                                                <div>📏 Distancia: <?php echo htmlspecialchars($l['distancia_centro_carga']); ?></div>
                                            </div>
                                        <?php else: ?>
                                            <span class="text-xs text-slate-500">—</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="px-6 py-4 text-slate-300">
                                        <?php echo htmlspecialchars($l['ubicacion']); ?>
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <?php 
                                        $badge_class = 'bg-slate-800 text-slate-300';
                                        if ($l['status'] === 'Nuevo') {
                                            $badge_class = 'bg-blue-900/50 text-blue-300 border border-blue-500/30';
                                        } elseif ($l['status'] === 'Contactado') {
                                            $badge_class = 'bg-amber-900/50 text-amber-300 border border-amber-500/30';
                                        } elseif ($l['status'] === 'Visita Programada') {
                                            $badge_class = 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30';
                                        }
                                        ?>
                                        <span class="px-2 py-0.5 text-xs font-semibold rounded-md <?php echo $badge_class; ?>">
                                            <?php echo htmlspecialchars($l['status']); ?>
                                        </span>
                                        <?php if ($l['status'] === 'Visita Programada' && !empty($l['fecha_visita'])): ?>
                                            <div class="mt-1.5 text-[10px] text-emerald-400 font-semibold font-tech uppercase tracking-wide">
                                                📅 <?php echo date('d/M H:i', strtotime($l['fecha_visita'])); ?>
                                            </div>
                                        <?php endif; ?>
                                    </td>
                                    <td class="px-6 py-4 text-center whitespace-nowrap">
                                        <div class="inline-flex rounded-md shadow-sm" role="group">
                                            <a href="admin_dashboard.php?action=update_status&id=<?php echo $l['id']; ?>&status=Contactado" 
                                               class="px-2.5 py-1 text-xs font-medium rounded-l-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-amber-300 transition duration-150"
                                               title="Marcar como Contactado">
                                                Contactar
                                            </a>
                                            <a href="#" onclick="openScheduleModal(<?php echo $l['id']; ?>, '<?php echo htmlspecialchars(addslashes($l['nombre'])); ?>'); event.preventDefault();" 
                                               class="px-2.5 py-1 text-xs font-medium rounded-r-lg border-t border-b border-r border-slate-700 bg-slate-800 hover:bg-slate-700 text-emerald-400 transition duration-150"
                                               title="Programar visita de Scouting">
                                                Agendar Visita
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- TABLE 2: Active Support Tickets -->
        <section id="tickets-section" class="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div class="p-6 border-b border-slate-850 bg-slate-900/40">
                <h2 class="font-tech text-lg font-bold text-white">Tickets de Soporte Técnico</h2>
                <p class="text-xs text-slate-400">Solicitudes de soporte y garantías recibidas</p>
            </div>
            
            <div class="overflow-x-auto w-full">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <th class="px-6 py-4">Fecha</th>
                            <th class="px-6 py-4">Folio Cliente</th>
                            <th class="px-6 py-4">Descripción del Problema</th>
                            <th class="px-6 py-4 text-center">Archivo Adjunto</th>
                            <th class="px-6 py-4 text-center">Estado</th>
                            <th class="px-6 py-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/60 text-sm">
                        <?php if (empty($tickets)): ?>
                            <tr>
                                <td colspan="6" class="px-6 py-10 text-center text-slate-500 font-tech">No hay tickets de soporte registrados aún.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($tickets as $t): ?>
                                <tr class="hover:bg-slate-950/20 transition duration-150">
                                    <td class="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                                        <?php echo date('d/M/Y H:i', strtotime($t['fecha_creacion'])); ?>
                                    </td>
                                    <td class="px-6 py-4 font-semibold text-white whitespace-nowrap font-tech">
                                        #<?php echo htmlspecialchars($t['folio_cliente']); ?>
                                    </td>
                                    <td class="px-6 py-4 text-slate-300 max-w-xs break-words">
                                        <?php echo nl2br(htmlspecialchars($t['descripcion'])); ?>
                                    </td>
                                    <td class="px-6 py-4 text-center whitespace-nowrap">
                                        <?php if (!empty($t['foto_path']) && file_exists($t['foto_path'])): ?>
                                            <a href="<?php echo htmlspecialchars($t['foto_path']); ?>" target="_blank"
                                               class="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 hover:underline">
                                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                                Ver Foto
                                            </a>
                                        <?php else: ?>
                                            <span class="text-xs text-slate-600">Ninguno</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <?php 
                                        $ticket_badge = 'bg-slate-800 text-slate-300';
                                        if ($t['status'] === 'Abierto') {
                                            $ticket_badge = 'bg-red-900/50 text-red-300 border border-red-500/30';
                                        } elseif ($t['status'] === 'Resuelto') {
                                            $ticket_badge = 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30';
                                        } elseif ($t['status'] === 'Cerrado') {
                                            $ticket_badge = 'bg-slate-900/80 text-slate-500 border border-slate-850';
                                        }
                                        ?>
                                        <span class="px-2 py-0.5 text-xs font-semibold rounded-md <?php echo $ticket_badge; ?>">
                                            <?php echo htmlspecialchars($t['status']); ?>
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-center whitespace-nowrap">
                                        <div class="inline-flex rounded-md shadow-sm" role="group">
                                            <a href="admin_dashboard.php?action=update_ticket_status&id=<?php echo $t['id']; ?>&status=Resuelto" 
                                               class="px-2.5 py-1 text-xs font-medium rounded-l-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-emerald-400 transition duration-150"
                                               title="Marcar como Resuelto">
                                                Resolver
                                            </a>
                                            <a href="admin_dashboard.php?action=update_ticket_status&id=<?php echo $t['id']; ?>&status=Cerrado" 
                                               class="px-2.5 py-1 text-xs font-medium rounded-r-lg border-t border-b border-r border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 transition duration-150"
                                               title="Cerrar Ticket">
                                                Cerrar
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </section>
        
        <!-- CALENDAR SECTION: Eventos & Visitas Programadas -->
        <section id="calendar-section" class="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm p-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 class="font-tech text-lg font-bold text-white flex items-center">
                        <svg class="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Calendario de Visitas e Inspecciones Técnicas
                    </h2>
                    <p class="text-xs text-slate-400">Control visual de scouting técnico y citas programadas en Los Cabos</p>
                </div>
                
                <div class="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                    <button onclick="prevMonth()" class="text-slate-400 hover:text-white p-1 transition">&lt;</button>
                    <span id="calendar-month-year" class="text-sm font-semibold text-white font-tech min-w-[120px] text-center">-</span>
                    <button onclick="nextMonth()" class="text-slate-400 hover:text-white p-1 transition">&gt;</button>
                </div>
            </div>

            <!-- Calendar Grid Headers -->
            <div class="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-800 pb-2">
                <div>Lun</div>
                <div>Mar</div>
                <div>Mié</div>
                <div>Jue</div>
                <div>Vie</div>
                <div>Sáb</div>
                <div>Dom</div>
            </div>

            <div id="calendar-grid" class="grid grid-cols-7 gap-2 min-h-[300px]">
                <!-- Populated dynamically via JS -->
            </div>
            
            <!-- Event Detail Drawer / Popover (Hidden by default) -->
            <div id="event-detail-card" class="hidden mt-6 bg-slate-950/90 border border-blue-500/30 p-5 rounded-xl">
                <div class="flex justify-between items-start border-b border-slate-800 pb-3 mb-3">
                    <h3 class="font-tech text-sm font-bold text-white uppercase tracking-wider flex items-center">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
                        Detalle del Evento
                    </h3>
                    <button onclick="closeEventDetail()" class="text-slate-400 hover:text-white text-xs">&times; Cerrar</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-slate-500 text-xs uppercase tracking-wider font-semibold">Cliente</p>
                        <p id="event-client-name" class="text-white font-semibold text-base mt-0.5">-</p>
                        
                        <p class="text-slate-500 text-xs uppercase tracking-wider font-semibold mt-3">Ubicación</p>
                        <p id="event-location" class="text-slate-300 mt-0.5">-</p>
                    </div>
                    <div>
                        <p class="text-slate-500 text-xs uppercase tracking-wider font-semibold">Fecha y Hora de Visita</p>
                        <p id="event-datetime" class="text-blue-400 font-tech font-bold text-base mt-0.5">-</p>

                        <div class="mt-4 flex flex-wrap gap-2">
                            <a id="event-call-btn" href="#" class="inline-flex items-center bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 text-xs transition font-semibold">
                                📞 Llamar
                            </a>
                            <a id="event-wa-btn" href="#" target="_blank" class="inline-flex items-center bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-lg text-xs transition font-semibold">
                                💬 WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
    </main>

    <!-- MODAL: Agendar Visita -->
    <div id="schedule-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <h3 class="font-tech text-lg font-bold text-white mb-2">Programar Inspección Técnica</h3>
            <p class="text-xs text-slate-400 mb-6">Asigne fecha y hora para la visita de scouting del cliente.</p>
            
            <form id="schedule-form" method="GET" action="admin_dashboard.php" class="space-y-6">
                <input type="hidden" name="action" value="schedule_visit">
                <input type="hidden" id="schedule-lead-id" name="id" value="">
                
                <div>
                    <label class="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Cliente</label>
                    <input type="text" id="schedule-lead-name" readonly 
                           class="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none font-semibold">
                </div>

                <div>
                    <label for="schedule-date" class="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Fecha y Hora de Visita *</label>
                    <input type="datetime-local" id="schedule-date" name="date" required 
                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition">
                </div>

                <div class="flex justify-end space-x-3 pt-2">
                    <button type="button" onclick="closeScheduleModal()" 
                            class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition">
                        Cancelar
                    </button>
                    <button type="submit" 
                            class="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold text-sm shadow-md transition">
                        Agendar Visita
                    </button>
                </div>
            </form>
        </div>
    </div>

    <footer class="w-full max-w-7xl mx-auto mt-12 text-center text-xs text-slate-600 font-tech">
        ZIRIAN CONTROL CENTER &copy; <?php echo date('Y'); ?> • DESARROLLO DE ALTA INGENIERÍA EN ENERGÍA EV.
    </footer>

    <!-- Pass Calendar Events from PHP to JS -->
    <?php
    $events_json = [];
    foreach ($leads as $l) {
        if ($l['status'] === 'Visita Programada' && !empty($l['fecha_visita'])) {
            $events_json[] = [
                'id' => $l['id'],
                'client_name' => $l['nombre'],
                'date' => date('Y-m-d', strtotime($l['fecha_visita'])),
                'time' => date('H:i', strtotime($l['fecha_visita'])),
                'location' => $l['ubicacion'],
                'phone' => $l['telefono']
            ];
        }
    }
    ?>
    <script>
        const calendarEvents = <?php echo json_encode($events_json); ?>;
        
        // Leads filtering logic
        function filterLeads(type) {
            const rows = document.querySelectorAll('#leads-section tbody tr');
            
            rows.forEach(row => {
                // Skip placeholder row
                if (row.cells.length === 1 && row.cells[0].colSpan === 7) return;
                
                const leadType = row.getAttribute('data-tipo-lead');
                if (type === 'all' || leadType === type) {
                    row.classList.remove('hidden');
                } else {
                    row.classList.add('hidden');
                }
            });

            // Toggle filter badge
            const badge = document.getElementById('filter-badge');
            const resetBtn = document.getElementById('filter-reset-btn');
            if (type === 'all') {
                badge.classList.add('hidden');
                resetBtn.classList.add('hidden');
            } else {
                badge.innerText = `Solo: ${type === 'Cotización Cualificada' ? 'Cotizaciones' : type}`;
                badge.classList.remove('hidden');
                resetBtn.classList.remove('hidden');
            }
        }

        // Calendar rendering logic
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();

        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        function renderCalendar() {
            const grid = document.getElementById('calendar-grid');
            const monthYearLabel = document.getElementById('calendar-month-year');
            if (!grid || !monthYearLabel) return;
            
            grid.innerHTML = '';
            monthYearLabel.innerText = `${monthNames[currentMonth]} ${currentYear}`;
            
            // Days in month
            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            // Convert JS day index (0=Sun, 1=Mon, ...) to Mon-Sun index (0=Mon, ..., 6=Sun)
            let firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;
            
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            
            // Prev month days to fill gap
            const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
            for (let i = firstDayIndex - 1; i >= 0; i--) {
                const dayCell = document.createElement('div');
                dayCell.className = "bg-slate-950/20 text-slate-700 p-2 rounded-lg border border-slate-900/35 min-h-[75px] text-left opacity-35 select-none text-xs";
                dayCell.innerText = prevMonthDays - i;
                grid.appendChild(dayCell);
            }
            
            // Current month days
            const today = new Date();
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
                
                dayCell.className = `p-2 rounded-lg border border-slate-800/80 min-h-[75px] text-left transition relative ${isToday ? 'bg-blue-950/30 border-blue-500/50' : 'bg-slate-950/40'}`;
                
                // Day number
                const dayNum = document.createElement('span');
                dayNum.className = `text-xs font-semibold ${isToday ? 'text-blue-400' : 'text-slate-400'}`;
                dayNum.innerText = day;
                dayCell.appendChild(dayNum);
                
                // Find events for this day
                const yyyy = currentYear;
                const mm = String(currentMonth + 1).padStart(2, '0');
                const dd = String(day).padStart(2, '0');
                const dateStr = `${yyyy}-${mm}-${dd}`;
                
                const dayEvents = calendarEvents.filter(e => e.date === dateStr);
                
                if (dayEvents.length > 0) {
                    const eventContainer = document.createElement('div');
                    eventContainer.className = "mt-1.5 space-y-1";
                    
                    dayEvents.forEach(evt => {
                        const evtBadge = document.createElement('div');
                        evtBadge.className = "text-[10px] bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 px-1.5 py-0.5 rounded cursor-pointer truncate font-medium hover:bg-emerald-900 transition-colors font-tech";
                        evtBadge.innerText = `${evt.time} - ${evt.client_name}`;
                        evtBadge.title = `Visita programada con ${evt.client_name}`;
                        evtBadge.onclick = (e) => {
                            e.stopPropagation();
                            showEventDetail(evt);
                        };
                        eventContainer.appendChild(evtBadge);
                    });
                    dayCell.appendChild(eventContainer);
                }
                
                grid.appendChild(dayCell);
            }
            
            // Next month days to fill grid to multiples of 7
            const totalCells = firstDayIndex + daysInMonth;
            const nextMonthCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
            for (let i = 1; i <= nextMonthCells; i++) {
                const dayCell = document.createElement('div');
                dayCell.className = "bg-slate-950/20 text-slate-700 p-2 rounded-lg border border-slate-900/35 min-h-[75px] text-left opacity-35 select-none text-xs";
                dayCell.innerText = i;
                grid.appendChild(dayCell);
            }
        }

        function prevMonth() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
            closeEventDetail();
        }

        function nextMonth() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
            closeEventDetail();
        }

        function showEventDetail(evt) {
            document.getElementById('event-client-name').innerText = evt.client_name;
            document.getElementById('event-location').innerText = evt.location;
            document.getElementById('event-datetime').innerText = `${evt.date} a las ${evt.time} hs`;
            
            document.getElementById('event-call-btn').href = `tel:${evt.phone}`;
            const cleanPhone = evt.phone.replace(/\D/g, '');
            document.getElementById('event-wa-btn').href = `https://wa.me/${cleanPhone}`;
            
            const detailCard = document.getElementById('event-detail-card');
            detailCard.classList.remove('hidden');
            detailCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function closeEventDetail() {
            const card = document.getElementById('event-detail-card');
            if (card) card.classList.add('hidden');
        }

        // Schedule Modal management
        function openScheduleModal(leadId, leadName) {
            document.getElementById('schedule-lead-id').value = leadId;
            document.getElementById('schedule-lead-name').value = leadName;
            
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(10, 0, 0, 0);
            
            const offset = tomorrow.getTimezoneOffset();
            const localTomorrow = new Date(tomorrow.getTime() - (offset * 60 * 1000));
            const defaultDateTime = localTomorrow.toISOString().slice(0, 16);
            
            document.getElementById('schedule-date').value = defaultDateTime;
            document.getElementById('schedule-modal').classList.remove('hidden');
        }

        function closeScheduleModal() {
            document.getElementById('schedule-modal').classList.add('hidden');
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderCalendar();
        });
    </script>

</body>
</html>
