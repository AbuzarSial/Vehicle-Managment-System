-- =============================================================================
-- 006_constraints_and_indexes.sql
-- Secondary indexes for joins, queues, and reporting filters
-- =============================================================================
-- Prerequisites: 001–005 applied.
--
-- Notes:
--   InnoDB automatically indexes foreign-key columns on the child table when
--   needed. This script focuses on *additional* composites and “reverse”
--   lookups on junction tables (where the PK leads with another column).
--
-- Next: 007_views.sql
-- =============================================================================

USE vms_db;

-- ---------------------------------------------------------------------------
-- Service request queues (by center + status; by date ranges)
-- ---------------------------------------------------------------------------
CREATE INDEX idx_service_requests_center_status
  ON service_requests (center_id, status);

CREATE INDEX idx_service_requests_request_date
  ON service_requests (request_date);

-- ---------------------------------------------------------------------------
-- Work order boards (status + timeline)
-- ---------------------------------------------------------------------------
CREATE INDEX idx_work_orders_status_open_date
  ON work_orders (status, open_date);

-- ---------------------------------------------------------------------------
-- Billing / accounts receivable style filters
-- ---------------------------------------------------------------------------
CREATE INDEX idx_bills_payment_bill_date
  ON bills (payment_status, bill_date);

-- ---------------------------------------------------------------------------
-- Inventory: “which centers stock this part?” (PK starts with center_id)
-- ---------------------------------------------------------------------------
CREATE INDEX idx_service_center_inventory_part
  ON service_center_inventory (part_id);

-- ---------------------------------------------------------------------------
-- Labor lines: “what did this mechanic work on?” (PK starts with work_order_id)
-- ---------------------------------------------------------------------------
CREATE INDEX idx_work_order_mechanics_mechanic
  ON work_order_mechanics (mechanic_id);

-- ---------------------------------------------------------------------------
-- Parts usage: “where was this part consumed?” (PK starts with work_order_id)
-- ---------------------------------------------------------------------------
CREATE INDEX idx_work_order_parts_part
  ON work_order_parts (part_id);
