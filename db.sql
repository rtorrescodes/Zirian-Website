-- =====================================================================
-- Zirian EV Charging Solutions - Database Schema
-- cPanel MySQL / MariaDB compatible
-- =====================================================================

-- Table structure for `leads`
CREATE TABLE IF NOT EXISTS `leads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) NULL,
  `marca_ev` VARCHAR(50) NULL,
  `tipo_instalacion` VARCHAR(50) NULL,
  `distancia_centro_carga` VARCHAR(50) NULL,
  `tipo_lead` VARCHAR(50) DEFAULT 'Contacto Directo', -- 'Contacto Directo' o 'Cotización Cualificada'
  `ubicacion` VARCHAR(100) NOT NULL,                  -- Código Postal / Ciudad / Municipio
  `status` VARCHAR(50) DEFAULT 'Nuevo',               -- 'Nuevo', 'Contactado', 'Visita Programada'
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_tipo_lead` (`tipo_lead`),
  INDEX `idx_fecha` (`fecha_creacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for `support_tickets`
CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `folio_cliente` VARCHAR(50) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `foto_path` VARCHAR(255) NULL,
  `status` VARCHAR(50) DEFAULT 'Abierto',             -- 'Abierto', 'Resuelto', 'Cerrado'
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ticket_status` (`status`),
  INDEX `idx_folio` (`folio_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
