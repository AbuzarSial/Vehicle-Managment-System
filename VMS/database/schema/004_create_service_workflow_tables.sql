-- Service requests, inspections, work orders, mechanics

-- mechanics
CREATE TABLE IF NOT EXISTS mechanics (
  mechanic_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  center_id BIGINT UNSIGNED NOT NULL,
  mechanic_name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255) DEFAULT NULL,
  certification_level VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (mechanic_id),
  CONSTRAINT fk_mechanics_center FOREIGN KEY (center_id) REFERENCES service_centers(center_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- service_requests
CREATE TABLE IF NOT EXISTS service_requests (
  request_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehicle_id BIGINT UNSIGNED NOT NULL,
  center_id BIGINT UNSIGNED NOT NULL,
  request_date DATE NOT NULL,
  request_type VARCHAR(128) DEFAULT NULL,
  problem_description TEXT DEFAULT NULL,
  status VARCHAR(64) DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (request_id),
  CONSTRAINT fk_requests_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE RESTRICT,
  CONSTRAINT fk_requests_center FOREIGN KEY (center_id) REFERENCES service_centers(center_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- inspections (one-to-one with service_requests)
CREATE TABLE IF NOT EXISTS inspections (
  inspection_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  request_id BIGINT UNSIGNED NOT NULL,
  mechanic_id BIGINT UNSIGNED DEFAULT NULL,
  inspection_date DATE DEFAULT NULL,
  findings TEXT DEFAULT NULL,
  result VARCHAR(128) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (inspection_id),
  UNIQUE KEY uq_inspections_request (request_id),
  CONSTRAINT fk_inspections_request FOREIGN KEY (request_id) REFERENCES service_requests(request_id) ON DELETE RESTRICT,
  CONSTRAINT fk_inspections_mechanic FOREIGN KEY (mechanic_id) REFERENCES mechanics(mechanic_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- work_orders (one-to-one with inspections)
CREATE TABLE IF NOT EXISTS work_orders (
  work_order_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  inspection_id BIGINT UNSIGNED NOT NULL,
  open_date DATE DEFAULT NULL,
  close_date DATE DEFAULT NULL,
  status VARCHAR(64) DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (work_order_id),
  UNIQUE KEY uq_work_orders_inspection (inspection_id),
  CONSTRAINT fk_work_orders_inspection FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
