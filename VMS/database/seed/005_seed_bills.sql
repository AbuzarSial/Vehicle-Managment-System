-- =============================================================================
-- 005_seed_bills.sql — bills (one row per billed work_order; UNIQUE work_order_id)
-- =============================================================================
-- Prerequisites: 001–004
-- Twelve bills for twelve work orders — paid / unpaid / pending mix for AR demos.
-- total_amount in PKR (rounded workshop invoice style).
-- =============================================================================

USE vms_db;

INSERT INTO bills (
  bill_id, work_order_id, bill_date, total_amount, payment_status
) VALUES
(1, 1, '2026-03-15', 47200.00, 'paid'),
(2, 2, '2026-03-22', 34200.00, 'unpaid'),
(3, 3, '2026-04-08', 22650.00, 'paid'),
(4, 4, '2026-04-12', 28900.00, 'pending'),
(5, 5, '2026-03-31', 15800.00, 'paid'),
(6, 6, '2026-04-01', 9350.00, 'paid'),
(7, 7, '2026-04-18', 12400.00, 'unpaid'),
(8, 8, '2026-04-05', 18750.00, 'paid'),
(9, 9, '2026-04-05', 4100.00, 'paid'),
(10, 10, '2026-04-11', 24600.00, 'pending'),
(11, 11, '2026-04-19', 19800.00, 'paid'),
(12, 12, '2026-04-20', 22340.00, 'unpaid');
