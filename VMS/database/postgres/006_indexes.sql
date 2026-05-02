-- =============================================================================
-- PostgreSQL / Neon — secondary indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_service_requests_center_status
  ON service_requests (center_id, status);

CREATE INDEX IF NOT EXISTS idx_service_requests_request_date
  ON service_requests (request_date);

CREATE INDEX IF NOT EXISTS idx_work_orders_status_open_date
  ON work_orders (status, open_date);

CREATE INDEX IF NOT EXISTS idx_bills_payment_bill_date
  ON bills (payment_status, bill_date);

CREATE INDEX IF NOT EXISTS idx_service_center_inventory_part
  ON service_center_inventory (part_id);

CREATE INDEX IF NOT EXISTS idx_work_order_mechanics_mechanic
  ON work_order_mechanics (mechanic_id);

CREATE INDEX IF NOT EXISTS idx_work_order_parts_part
  ON work_order_parts (part_id);
