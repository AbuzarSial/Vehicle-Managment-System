-- =============================================================================
-- 004_cursors.sql — explicit CURSOR inside a stored procedure (MySQL 8+)
-- =============================================================================
-- Run AFTER schema (mechanics / work_order_mechanics must exist).
--
-- Viva: a CURSOR is a named server-side iterator over a SELECT result. MySQL
-- procedures FETCH rows into variables inside a LOOP — same teaching goal as
-- Oracle explicit cursors, different syntax.
-- =============================================================================

USE vms_db;

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_generate_mechanic_workload_report$$
CREATE PROCEDURE sp_generate_mechanic_workload_report()
BEGIN
  DECLARE v_done INT DEFAULT 0;
  DECLARE v_mechanic_id BIGINT UNSIGNED;
  DECLARE v_mechanic_name VARCHAR(255);
  DECLARE v_center_id BIGINT UNSIGNED;
  DECLARE v_hours DECIMAL(12,2);
  DECLARE v_labor_pkr DECIMAL(14,2);

  DECLARE cur_mechanics CURSOR FOR
    SELECT m.mechanic_id, m.mechanic_name, m.center_id
    FROM mechanics m
    ORDER BY m.center_id, m.mechanic_id;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

  DROP TEMPORARY TABLE IF EXISTS tmp_mechanic_workload_report;
  CREATE TEMPORARY TABLE tmp_mechanic_workload_report (
    mechanic_id BIGINT UNSIGNED NOT NULL,
    mechanic_name VARCHAR(255) NOT NULL,
    center_id BIGINT UNSIGNED NOT NULL,
    total_hours_worked DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_labor_pkr DECIMAL(14,2) NOT NULL DEFAULT 0
  );

  OPEN cur_mechanics;

  mechanic_loop: LOOP
    FETCH cur_mechanics INTO v_mechanic_id, v_mechanic_name, v_center_id;
    IF v_done = 1 THEN
      LEAVE mechanic_loop;
    END IF;

    SELECT COALESCE(SUM(wom.hours_worked), 0), COALESCE(SUM(wom.hours_worked * wom.labor_rate), 0)
      INTO v_hours, v_labor_pkr
    FROM work_order_mechanics wom
    WHERE wom.mechanic_id = v_mechanic_id;

    INSERT INTO tmp_mechanic_workload_report (
      mechanic_id, mechanic_name, center_id, total_hours_worked, total_labor_pkr
    ) VALUES (
      v_mechanic_id, v_mechanic_name, v_center_id, v_hours, v_labor_pkr
    );
  END LOOP;

  CLOSE cur_mechanics;

  SELECT * FROM tmp_mechanic_workload_report ORDER BY center_id, mechanic_id;
  DROP TEMPORARY TABLE IF EXISTS tmp_mechanic_workload_report;
END$$

DELIMITER ;
