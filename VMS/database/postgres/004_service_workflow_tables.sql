-- =============================================================================
-- PostgreSQL / Neon — mechanics, service_requests, inspections, work_orders
-- =============================================================================

CREATE TABLE IF NOT EXISTS mechanics (
  mechanic_id BIGSERIAL PRIMARY KEY,
  center_id BIGINT NOT NULL REFERENCES service_centers (center_id) ON DELETE RESTRICT,
  mechanic_name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255) DEFAULT NULL,
  certification_level VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_requests (
  request_id BIGSERIAL PRIMARY KEY,
  vehicle_id BIGINT NOT NULL REFERENCES vehicles (vehicle_id) ON DELETE RESTRICT,
  center_id BIGINT NOT NULL REFERENCES service_centers (center_id) ON DELETE RESTRICT,
  request_date DATE NOT NULL,
  request_type VARCHAR(128) DEFAULT NULL,
  problem_description TEXT DEFAULT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspections (
  inspection_id BIGSERIAL PRIMARY KEY,
  request_id BIGINT NOT NULL UNIQUE REFERENCES service_requests (request_id) ON DELETE RESTRICT,
  mechanic_id BIGINT REFERENCES mechanics (mechanic_id) ON DELETE SET NULL,
  inspection_date DATE DEFAULT NULL,
  findings TEXT DEFAULT NULL,
  result VARCHAR(128) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_orders (
  work_order_id BIGSERIAL PRIMARY KEY,
  inspection_id BIGINT NOT NULL UNIQUE REFERENCES inspections (inspection_id) ON DELETE RESTRICT,
  open_date DATE DEFAULT NULL,
  close_date DATE DEFAULT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
