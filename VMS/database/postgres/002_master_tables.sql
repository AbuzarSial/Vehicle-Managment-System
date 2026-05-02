-- =============================================================================
-- PostgreSQL / Neon — master tables (run after creating DB in Neon console)
-- Matches logical model of database/schema/002_create_master_tables.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS customers (
  customer_id BIGSERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_centers (
  center_id BIGSERIAL PRIMARY KEY,
  center_name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  address VARCHAR(512) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spare_parts (
  part_id BIGSERIAL PRIMARY KEY,
  part_name VARCHAR(255) NOT NULL,
  brand VARCHAR(128) DEFAULT NULL,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
