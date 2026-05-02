-- =============================================================================
-- 005_create_inventory_billing_tables.sql
-- Junction tables (inventory, labor, parts) and billing
-- =============================================================================
-- Prerequisites:
--   002_create_master_tables.sql (service_centers, spare_parts)
--   004_create_service_workflow_tables.sql (mechanics, work_orders)
--
-- Junction tables use composite PRIMARY KEY (parent ids).
-- bills: one row per work_order (UNIQUE work_order_id).
--
-- Next (optional): 006_constraints_and_indexes.sql, 007_views.sql
-- =============================================================================

USE vms_db;

-- ---------------------------------------------------------------------------
-- service_center_inventory (center <-> spare_part quantities)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_center_inventory (
  center_id BIGINT UNSIGNED NOT NULL,
  part_id BIGINT UNSIGNED NOT NULL,
  quantity_on_hand INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 0,
  shelf_location VARCHAR(128) DEFAULT NULL,
  PRIMARY KEY (center_id, part_id),
  CONSTRAINT fk_sci_center FOREIGN KEY (center_id)
    REFERENCES service_centers (center_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_sci_part FOREIGN KEY (part_id)
    REFERENCES spare_parts (part_id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- work_order_mechanics (work_order <-> mechanic labor lines)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS work_order_mechanics (
  work_order_id BIGINT UNSIGNED NOT NULL,
  mechanic_id BIGINT UNSIGNED NOT NULL,
  hours_worked DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  labor_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (work_order_id, mechanic_id),
  CONSTRAINT fk_wom_work_order FOREIGN KEY (work_order_id)
    REFERENCES work_orders (work_order_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_wom_mechanic FOREIGN KEY (mechanic_id)
    REFERENCES mechanics (mechanic_id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- work_order_parts (work_order <-> spare_part usage lines)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS work_order_parts (
  work_order_id BIGINT UNSIGNED NOT NULL,
  part_id BIGINT UNSIGNED NOT NULL,
  quantity_used INT NOT NULL DEFAULT 0,
  sale_price_at_use DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (work_order_id, part_id),
  CONSTRAINT fk_wop_work_order FOREIGN KEY (work_order_id)
    REFERENCES work_orders (work_order_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_wop_part FOREIGN KEY (part_id)
    REFERENCES spare_parts (part_id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- bills (one bill per work_order — UNIQUE enforces 1:1)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bills (
  bill_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  work_order_id BIGINT UNSIGNED NOT NULL,
  bill_date DATE NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(64) NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (bill_id),
  UNIQUE KEY uq_bills_work_order (work_order_id),
  CONSTRAINT fk_bills_work_order FOREIGN KEY (work_order_id)
    REFERENCES work_orders (work_order_id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
