-- =============================================================================
-- 002_functions.sql — stored functions (MySQL 8+)
-- =============================================================================
-- Run AFTER schema. Safe to run before or after seed (functions only read data).
--
-- Viva: a stored function returns a scalar (or string) and can be used in SELECT,
-- WHERE, or from procedures — unlike procedures which use OUT params / result sets.
-- Oracle PL/SQL FUNCTION → MySQL CREATE FUNCTION with RETURNS clause.
-- =============================================================================

USE vms_db;

DELIMITER $$

DROP FUNCTION IF EXISTS fn_calculate_work_order_parts_total$$
CREATE FUNCTION fn_calculate_work_order_parts_total(p_work_order_id BIGINT UNSIGNED)
RETURNS DECIMAL(14,2)
READS SQL DATA
BEGIN
  DECLARE v_sum DECIMAL(14,2);
  SELECT COALESCE(SUM(quantity_used * sale_price_at_use), 0)
    INTO v_sum
  FROM work_order_parts
  WHERE work_order_id = p_work_order_id;
  RETURN v_sum;
END$$

DROP FUNCTION IF EXISTS fn_calculate_work_order_labor_total$$
CREATE FUNCTION fn_calculate_work_order_labor_total(p_work_order_id BIGINT UNSIGNED)
RETURNS DECIMAL(14,2)
READS SQL DATA
BEGIN
  DECLARE v_sum DECIMAL(14,2);
  SELECT COALESCE(SUM(hours_worked * labor_rate), 0)
    INTO v_sum
  FROM work_order_mechanics
  WHERE work_order_id = p_work_order_id;
  RETURN v_sum;
END$$

DROP FUNCTION IF EXISTS fn_calculate_bill_total$$
CREATE FUNCTION fn_calculate_bill_total(p_work_order_id BIGINT UNSIGNED)
RETURNS DECIMAL(14,2)
READS SQL DATA
BEGIN
  -- Suggested invoice = parts line revenue + labor line revenue (same roll-up as views).
  RETURN
    fn_calculate_work_order_parts_total(p_work_order_id)
    + fn_calculate_work_order_labor_total(p_work_order_id);
END$$

DELIMITER ;
