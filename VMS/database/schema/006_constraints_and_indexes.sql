-- =============================================================================
-- 006_constraints_and_indexes.sql
-- Secondary indexes for joins, queues, and reporting filters
-- =============================================================================
-- Prerequisites: 001–005 applied.
--
-- CHECK constraints (MySQL 8.0.16+):
--   Domain checks are defined on the CREATE TABLE scripts in 002–005 so new
--   installs stay self-contained. Re-running this file does not add CHECKs;
--   legacy databases created before those CHECKs need one-time ALTER TABLE
--   (see commented block at end of this file).
--
-- Status columns (service_requests.status, work_orders.status, bills.payment_status):
--   No CHECK enums here — FastAPI accepts any VARCHAR(64) for request/work-order
--   status, and payment_status is normalized in the API but not limited to a fixed
--   set; a DB-level enum would reject valid API values and future labels.
--
-- ON DELETE CASCADE vs RESTRICT (summary across 003–005):
--   CASCADE — vehicles -> cars/motorcycles/trucks (subtype cleanup);
--             service_centers -> service_center_inventory (remove stock when center goes);
--             work_orders -> work_order_mechanics / work_order_parts (line items).
--   RESTRICT — anchors and catalogs: customers<-vehicles, centers/vehicles<-requests,
--             spare_parts<-inventory/parts lines, mechanics<-labor lines, bills<-work_orders.
--   SET NULL — inspections.mechanic_id when mechanic removed (optional assignee).
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

-- =============================================================================
-- Optional: one-time upgrade for databases created before CHECK constraints
-- were added to 002–005. Uncomment and run each statement that applies; skip
-- any that error with "Duplicate check constraint" (already present).
-- =============================================================================
-- ALTER TABLE spare_parts
--   ADD CONSTRAINT ck_spare_parts_unit_price_nonneg CHECK (unit_price >= 0);
-- ALTER TABLE vehicles
--   ADD CONSTRAINT ck_vehicles_model_year_range CHECK (
--     model_year IS NULL OR (model_year >= 1990 AND model_year <= YEAR(CURDATE()) + 1)
--   );
-- ALTER TABLE cars
--   ADD CONSTRAINT ck_cars_doors_positive CHECK (number_of_doors IS NULL OR number_of_doors > 0);
-- ALTER TABLE motorcycles
--   ADD CONSTRAINT ck_motorcycles_engine_cc_positive CHECK (engine_cc IS NULL OR engine_cc > 0);
-- ALTER TABLE trucks
--   ADD CONSTRAINT ck_trucks_load_capacity_nonneg CHECK (load_capacity IS NULL OR load_capacity >= 0),
--   ADD CONSTRAINT ck_trucks_axle_count_positive CHECK (axle_count IS NULL OR axle_count > 0);
-- ALTER TABLE service_center_inventory
--   ADD CONSTRAINT ck_sci_qty_on_hand_nonneg CHECK (quantity_on_hand >= 0),
--   ADD CONSTRAINT ck_sci_reorder_nonneg CHECK (reorder_level >= 0);
-- ALTER TABLE work_order_mechanics
--   ADD CONSTRAINT ck_wom_hours_nonneg CHECK (hours_worked >= 0),
--   ADD CONSTRAINT ck_wom_labor_rate_nonneg CHECK (labor_rate >= 0);
-- ALTER TABLE work_order_parts
--   ADD CONSTRAINT ck_wop_qty_nonneg CHECK (quantity_used >= 0),
--   ADD CONSTRAINT ck_wop_sale_price_nonneg CHECK (sale_price_at_use >= 0);
-- ALTER TABLE bills
--   ADD CONSTRAINT ck_bills_total_nonneg CHECK (total_amount >= 0);
