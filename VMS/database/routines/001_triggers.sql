-- =============================================================================
-- 001_triggers.sql — BEFORE INSERT validation triggers (MySQL 8+)
-- =============================================================================
-- Run AFTER schema (001–007) and AFTER seed if you want triggers to validate
-- future inserts only; re-running this file uses DROP TRIGGER IF EXISTS first.
--
-- Viva: triggers are procedural logic bound to a table event (here BEFORE INSERT).
-- They reject bad rows with SIGNAL before the row is written — complementary to
-- CHECK constraints on the same columns.
-- =============================================================================

USE vms_db;

DELIMITER $$

-- ---------------------------------------------------------------------------
-- work_order_parts: reject non-positive quantity_used (line items must consume stock)
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS tr_work_order_parts_bi_validate_qty$$
CREATE TRIGGER tr_work_order_parts_bi_validate_qty
BEFORE INSERT ON work_order_parts
FOR EACH ROW
BEGIN
  IF NEW.quantity_used IS NULL OR NEW.quantity_used <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'work_order_parts.quantity_used must be > 0';
  END IF;
END$$

-- ---------------------------------------------------------------------------
-- work_order_mechanics: reject negative hours or labor rate
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS tr_work_order_mechanics_bi_validate_labor$$
CREATE TRIGGER tr_work_order_mechanics_bi_validate_labor
BEFORE INSERT ON work_order_mechanics
FOR EACH ROW
BEGIN
  IF NEW.hours_worked IS NULL OR NEW.hours_worked < 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'work_order_mechanics.hours_worked must be >= 0';
  END IF;
  IF NEW.labor_rate IS NULL OR NEW.labor_rate < 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'work_order_mechanics.labor_rate must be >= 0';
  END IF;
END$$

-- ---------------------------------------------------------------------------
-- bills: reject negative invoice totals
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS tr_bills_bi_validate_total$$
CREATE TRIGGER tr_bills_bi_validate_total
BEFORE INSERT ON bills
FOR EACH ROW
BEGIN
  IF NEW.total_amount IS NULL OR NEW.total_amount < 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'bills.total_amount must be >= 0';
  END IF;
END$$

DELIMITER ;

-- ---------------------------------------------------------------------------
-- Optional (advanced): stock sufficiency at the work order’s service center
-- ---------------------------------------------------------------------------
-- A production system might JOIN work_orders → inspections → service_requests to
-- find center_id and compare service_center_inventory.quantity_on_hand with
-- NEW.quantity_used. That requires every (center, part) pair to exist in inventory
-- before any WO line insert — our academic seed keeps inventory rows aligned, but
-- enabling this without a full stock reservation model can block legitimate edge
-- cases. Leave disabled; implement when business rules are finalized.
--
-- Example sketch (DO NOT RUN unless you accept stricter rules):
-- DELIMITER $$
-- DROP TRIGGER IF EXISTS tr_work_order_parts_bi_stock_check$$
-- CREATE TRIGGER tr_work_order_parts_bi_stock_check
-- BEFORE INSERT ON work_order_parts
-- FOR EACH ROW
-- BEGIN
--   DECLARE v_center BIGINT UNSIGNED;
--   DECLARE v_on_hand INT;
--   SELECT sr.center_id INTO v_center
--   FROM work_orders wo
--   INNER JOIN inspections i ON i.inspection_id = wo.inspection_id
--   INNER JOIN service_requests sr ON sr.request_id = i.request_id
--   WHERE wo.work_order_id = NEW.work_order_id;
--   SELECT sci.quantity_on_hand INTO v_on_hand
--   FROM service_center_inventory sci
--   WHERE sci.center_id = v_center AND sci.part_id = NEW.part_id;
--   IF v_on_hand IS NULL OR v_on_hand < NEW.quantity_used THEN
--     SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock at service center';
--   END IF;
-- END$$
-- DELIMITER ;
