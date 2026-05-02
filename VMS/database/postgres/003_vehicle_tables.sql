-- =============================================================================
-- PostgreSQL / Neon — vehicles + subtypes
-- =============================================================================

CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers (customer_id) ON DELETE RESTRICT,
  registration_no VARCHAR(64) NOT NULL,
  vin VARCHAR(64) NOT NULL,
  make VARCHAR(128) DEFAULT NULL,
  model VARCHAR(128) DEFAULT NULL,
  model_year SMALLINT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_vehicles_registration_no UNIQUE (registration_no),
  CONSTRAINT uq_vehicles_vin UNIQUE (vin)
);

CREATE TABLE IF NOT EXISTS cars (
  vehicle_id BIGINT NOT NULL PRIMARY KEY REFERENCES vehicles (vehicle_id) ON DELETE CASCADE,
  number_of_doors SMALLINT DEFAULT NULL,
  body_type VARCHAR(64) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS motorcycles (
  vehicle_id BIGINT NOT NULL PRIMARY KEY REFERENCES vehicles (vehicle_id) ON DELETE CASCADE,
  engine_cc INTEGER DEFAULT NULL,
  bike_type VARCHAR(64) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS trucks (
  vehicle_id BIGINT NOT NULL PRIMARY KEY REFERENCES vehicles (vehicle_id) ON DELETE CASCADE,
  load_capacity DECIMAL(10, 2) DEFAULT NULL,
  axle_count SMALLINT DEFAULT NULL
);
