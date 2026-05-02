-- =============================================================================
-- 002_create_master_tables.sql
-- Master / catalog tables (no foreign keys to other business tables)
-- =============================================================================
-- Prerequisites: 001_create_database.sql
--
-- Tables:
--   customers       — vehicle owners
--   service_centers — repair locations; parent for mechanics (004)
--   spare_parts     — part catalog; parent for inventory & work_order_parts (005)
--
-- Next: 003_create_vehicle_tables.sql
-- =============================================================================

USE vms_db;

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  customer_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- service_centers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_centers (
  center_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  center_name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  address VARCHAR(512) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (center_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- spare_parts (catalog — required for service_center_inventory & work_order_parts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spare_parts (
  part_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  part_name VARCHAR(255) NOT NULL,
  brand VARCHAR(128) DEFAULT NULL,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (part_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
