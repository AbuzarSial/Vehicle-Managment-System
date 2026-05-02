-- =============================================================================
-- 005_seed_bills.sql — bills (one row per billed work order)
-- =============================================================================
-- Prerequisites: 001–004
-- Open work orders (3, 6) have no bill yet — matches operational reality.
-- total_amount in PKR (demo: basic / medium / major repair bands).
-- =============================================================================

USE vms_db;

INSERT INTO bills (
  bill_id, work_order_id, bill_date, total_amount, payment_status
) VALUES
(1, 1, '2026-03-15', 46500.00, 'paid'),
(2, 2, '2026-03-22', 33800.00, 'unpaid'),
(3, 4, '2026-03-31', 15500.00, 'pending'),
(4, 5, '2026-04-01', 9200.00, 'paid');

-- Work orders 3 and 6 remain without bills while status = open.
