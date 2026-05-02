USE vms_db;

-- bills for work orders
INSERT INTO bills (work_order_id, bill_date, total_amount, payment_status) VALUES
(1, '2026-04-06', 150.00, 'unpaid'),
(2, '2026-04-07', 230.50, 'pending');
