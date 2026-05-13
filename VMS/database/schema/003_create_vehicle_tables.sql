-- =============================================================================
-- 003_create_vehicle_tables.sql
-- Vehicles (supertype) and subtype tables (EERD specialization)
-- =============================================================================
-- Prerequisites: 002_create_master_tables.sql (customers must exist)
--
-- Pattern:
--   vehicles — common attributes; FK -> customers
--   cars / motorcycles / trucks — PK = vehicle_id, FK -> vehicles ON DELETE CASCADE
--
-- ON DELETE policy (why not CASCADE everywhere):
--   vehicles -> customers RESTRICT — prevents deleting a customer who still owns
--     vehicles; avoids silent loss of fleet history. Delete or reassign vehicles first.
--   subtype rows (cars/motorcycles/trucks) -> vehicles CASCADE — deleting the supertype
--     row must remove exactly one subtype row (PK = vehicle_id); CASCADE keeps EERD
--     specialization tables consistent without orphan subtype rows.
--
-- Next: 004_create_service_workflow_tables.sql
-- =============================================================================

USE vms_db;

-- ---------------------------------------------------------------------------
-- vehicles (supertype)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  registration_no VARCHAR(64) NOT NULL,
  vin VARCHAR(64) NOT NULL,
  make VARCHAR(128) DEFAULT NULL,
  model VARCHAR(128) DEFAULT NULL,
  model_year SMALLINT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (vehicle_id),
  UNIQUE KEY uq_vehicles_registration_no (registration_no),
  UNIQUE KEY uq_vehicles_vin (vin),
  CONSTRAINT fk_vehicles_customer FOREIGN KEY (customer_id)
    REFERENCES customers (customer_id)
    ON DELETE RESTRICT,
  CONSTRAINT ck_vehicles_model_year_range CHECK (
    model_year IS NULL
    OR (
      model_year >= 1990
      AND model_year <= YEAR(CURDATE()) + 1
    )
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- cars (subtype)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cars (
  vehicle_id BIGINT UNSIGNED NOT NULL,
  number_of_doors SMALLINT UNSIGNED DEFAULT NULL,
  body_type VARCHAR(64) DEFAULT NULL,
  PRIMARY KEY (vehicle_id),
  CONSTRAINT fk_cars_vehicle FOREIGN KEY (vehicle_id)
    REFERENCES vehicles (vehicle_id)
    ON DELETE CASCADE,
  CONSTRAINT ck_cars_doors_positive CHECK (number_of_doors IS NULL OR number_of_doors > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- motorcycles (subtype)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS motorcycles (
  vehicle_id BIGINT UNSIGNED NOT NULL,
  engine_cc INT UNSIGNED DEFAULT NULL,
  bike_type VARCHAR(64) DEFAULT NULL,
  PRIMARY KEY (vehicle_id),
  CONSTRAINT fk_motorcycles_vehicle FOREIGN KEY (vehicle_id)
    REFERENCES vehicles (vehicle_id)
    ON DELETE CASCADE,
  CONSTRAINT ck_motorcycles_engine_cc_positive CHECK (engine_cc IS NULL OR engine_cc > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- trucks (subtype)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trucks (
  vehicle_id BIGINT UNSIGNED NOT NULL,
  load_capacity DECIMAL(10,2) DEFAULT NULL,
  axle_count SMALLINT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (vehicle_id),
  CONSTRAINT fk_trucks_vehicle FOREIGN KEY (vehicle_id)
    REFERENCES vehicles (vehicle_id)
    ON DELETE CASCADE,
  CONSTRAINT ck_trucks_load_capacity_nonneg CHECK (load_capacity IS NULL OR load_capacity >= 0),
  CONSTRAINT ck_trucks_axle_count_positive CHECK (axle_count IS NULL OR axle_count > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
