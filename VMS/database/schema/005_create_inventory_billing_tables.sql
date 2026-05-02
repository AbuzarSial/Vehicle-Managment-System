-- service_center_inventory (junction)
CREATE TABLE IF NOT EXISTS service_center_inventory (
  center_id BIGINT UNSIGNED NOT NULL,
  part_id BIGINT UNSIGNED NOT NULL,
  quantity_on_hand INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 0,
  shelf_location VARCHAR(128) DEFAULT NULL,
  PRIMARY KEY (center_id, part_id),
  CONSTRAINT fk_inventory_center FOREIGN KEY (center_id) REFERENCES service_centers(center_id) ON DELETE CASCADE,
  CONSTRAINT fk_inventory_part FOREIGN KEY (part_id) REFERENCES spare_parts(part_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- work_order_mechanics (junction)
CREATE TABLE IF NOT EXISTS work_order_mechanics (
  work_order_id BIGINT UNSIGNED NOT NULL,
  mechanic_id BIGINT UNSIGNED NOT NULL,
  hours_worked DECIMAL(6,2) DEFAULT 0.00,
  labor_rate DECIMAL(10,2) DEFAULT 0.00,
  PRIMARY KEY (work_order_id, mechanic_id),
  CONSTRAINT fk_wom_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
  CONSTRAINT fk_wom_mechanic FOREIGN KEY (mechanic_id) REFERENCES mechanics(mechanic_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- work_order_parts (junction)
CREATE TABLE IF NOT EXISTS work_order_parts (
  work_order_id BIGINT UNSIGNED NOT NULL,
  part_id BIGINT UNSIGNED NOT NULL,
  quantity_used INT NOT NULL DEFAULT 0,
  sale_price_at_use DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (work_order_id, part_id),
  CONSTRAINT fk_wop_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
  CONSTRAINT fk_wop_part FOREIGN KEY (part_id) REFERENCES spare_parts(part_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- bills
CREATE TABLE IF NOT EXISTS bills (
  bill_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  work_order_id BIGINT UNSIGNED NOT NULL,
  bill_date DATE NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(64) DEFAULT 'unpaid',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (bill_id),
  UNIQUE KEY uq_bills_work_order (work_order_id),
  CONSTRAINT fk_bills_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(work_order_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
