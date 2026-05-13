-- =============================================================================
-- 003_procedures.sql — stored procedures (MySQL 8+)
-- =============================================================================
-- Run AFTER 002_functions.sql (procedures call the billing helper functions).
--
-- Viva: procedures group imperative steps (INSERT/UPDATE, branching) without
-- returning a scalar directly — Oracle PACKAGE bodies often map to one or more
-- MySQL procedures in the same schema.
-- =============================================================================

USE vms_db;

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_create_bill_for_work_order$$
CREATE PROCEDURE sp_create_bill_for_work_order(
  IN p_work_order_id BIGINT UNSIGNED,
  IN p_bill_date DATE,
  IN p_payment_status VARCHAR(64),
  IN p_total_amount DECIMAL(12,2) -- pass NULL to auto-sum labor + parts via functions
)
BEGIN
  DECLARE v_total DECIMAL(14,2);
  DECLARE v_existing BIGINT UNSIGNED;

  SELECT COUNT(*) INTO v_existing FROM bills WHERE work_order_id = p_work_order_id;
  IF v_existing > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Bill already exists for this work_order_id (1:1 rule)';
  END IF;

  IF p_total_amount IS NULL THEN
    SET v_total = fn_calculate_bill_total(p_work_order_id);
  ELSE
    SET v_total = p_total_amount;
  END IF;

  INSERT INTO bills (work_order_id, bill_date, total_amount, payment_status)
  VALUES (p_work_order_id, p_bill_date, v_total, p_payment_status);
END$$

DROP PROCEDURE IF EXISTS sp_update_service_request_status$$
CREATE PROCEDURE sp_update_service_request_status(
  IN p_request_id BIGINT UNSIGNED,
  IN p_new_status VARCHAR(64)
)
BEGIN
  UPDATE service_requests
  SET status = p_new_status
  WHERE request_id = p_request_id;

  IF ROW_COUNT() = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'service_requests.request_id not found';
  END IF;
END$$

DROP PROCEDURE IF EXISTS sp_restock_part$$
CREATE PROCEDURE sp_restock_part(
  IN p_center_id BIGINT UNSIGNED,
  IN p_part_id BIGINT UNSIGNED,
  IN p_qty_to_add INT
)
BEGIN
  IF p_qty_to_add IS NULL OR p_qty_to_add <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'p_qty_to_add must be > 0';
  END IF;

  UPDATE service_center_inventory
  SET quantity_on_hand = quantity_on_hand + p_qty_to_add
  WHERE center_id = p_center_id AND part_id = p_part_id;

  IF ROW_COUNT() = 0 THEN
    INSERT INTO service_center_inventory (
      center_id, part_id, quantity_on_hand, reorder_level, shelf_location
    ) VALUES (
      p_center_id,
      p_part_id,
      p_qty_to_add,
      5,
      'RESTOCK-AUTO'
    );
  END IF;
END$$

DELIMITER ;
