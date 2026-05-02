-- =============================================================================
-- PostgreSQL / Neon — inventory, labor/parts lines, bills
-- =============================================================================

CREATE TABLE IF NOT EXISTS service_center_inventory (
  center_id BIGINT NOT NULL REFERENCES service_centers (center_id) ON DELETE CASCADE,
  part_id BIGINT NOT NULL REFERENCES spare_parts (part_id) ON DELETE RESTRICT,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 0,
  shelf_location VARCHAR(128) DEFAULT NULL,
  PRIMARY KEY (center_id, part_id)
);

CREATE TABLE IF NOT EXISTS work_order_mechanics (
  work_order_id BIGINT NOT NULL REFERENCES work_orders (work_order_id) ON DELETE CASCADE,
  mechanic_id BIGINT NOT NULL REFERENCES mechanics (mechanic_id) ON DELETE RESTRICT,
  hours_worked DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
  labor_rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (work_order_id, mechanic_id)
);

CREATE TABLE IF NOT EXISTS work_order_parts (
  work_order_id BIGINT NOT NULL REFERENCES work_orders (work_order_id) ON DELETE CASCADE,
  part_id BIGINT NOT NULL REFERENCES spare_parts (part_id) ON DELETE RESTRICT,
  quantity_used INTEGER NOT NULL DEFAULT 0,
  sale_price_at_use DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (work_order_id, part_id)
);

CREATE TABLE IF NOT EXISTS bills (
  bill_id BIGSERIAL PRIMARY KEY,
  work_order_id BIGINT NOT NULL UNIQUE REFERENCES work_orders (work_order_id) ON DELETE RESTRICT,
  bill_date DATE NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(64) NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
