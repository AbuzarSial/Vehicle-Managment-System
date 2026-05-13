-- =============================================================================
-- 004_seed_work_orders_inventory.sql — work_orders, inventory, labor, parts lines
-- =============================================================================
-- Prerequisites: 001, 002, 003
-- Skips inspection_id 4 (request 4 still awaiting WO — pipeline demo).
-- Labor rates and part prices in PKR (demo only).
-- =============================================================================

USE vms_db;

-- ---------------------------------------------------------------------------
-- Work orders (6) — tied to inspections 1,2,3,5,6,7 (not inspection 4)
-- ---------------------------------------------------------------------------
INSERT INTO work_orders (
  work_order_id, inspection_id, open_date, close_date, status
) VALUES
(1, 1, '2026-03-14', '2026-03-15', 'completed'),
(2, 2, '2026-03-20', '2026-03-22', 'completed'),
(3, 3, '2026-04-04', NULL, 'open'),
(4, 5, '2026-03-30', '2026-03-31', 'completed'),
(5, 6, '2026-03-31', '2026-04-01', 'completed'),
(6, 7, '2026-04-17', NULL, 'open');

-- ---------------------------------------------------------------------------
-- Service center inventory — includes low-stock rows for vw_low_stock_parts
-- ---------------------------------------------------------------------------
INSERT INTO service_center_inventory (
  center_id, part_id, quantity_on_hand, reorder_level, shelf_location
) VALUES
-- Center 1
(1, 1, 4, 6, 'A1-01'),
(1, 2, 24, 10, 'A1-02'),
(1, 4, 18, 12, 'A2-04'),
(1, 7, 2, 4, 'B1-03'),
-- Center 2
(2, 1, 8, 6, 'R1-01'),
(2, 3, 3, 8, 'R1-02'),
(2, 5, 1, 4, 'R2-01'),
(2, 8, 4, 3, 'R3-BAT'),
-- Center 3
(3, 2, 30, 15, 'C1-01'),
(3, 6, 9, 6, 'C1-05'),
(3, 7, 1, 4, 'C2-02'),
(3, 8, 2, 2, 'C3-BAT');

-- ---------------------------------------------------------------------------
-- Labor allocation (work_order_mechanics) — rates 1500–5000 PKR/hr (demo)
-- ---------------------------------------------------------------------------
INSERT INTO work_order_mechanics (
  work_order_id, mechanic_id, hours_worked, labor_rate
) VALUES
(1, 1, 2.50, 2800.00),
(1, 2, 0.75, 3200.00),
(2, 2, 3.00, 3500.00),
(3, 5, 1.25, 2200.00),
(4, 4, 2.00, 4000.00),
(5, 3, 1.50, 3000.00),
(6, 1, 1.00, 2800.00),
(6, 3, 0.50, 3100.00);

-- ---------------------------------------------------------------------------
-- Parts consumed on work orders (work_order_parts) — PKR sale_price_at_use
-- ---------------------------------------------------------------------------
INSERT INTO work_order_parts (
  work_order_id, part_id, quantity_used, sale_price_at_use
) VALUES
(1, 1, 1, 8200.00),
(2, 4, 4, 450.00),
(2, 3, 1, 3200.00),
(3, 8, 1, 19500.00),
(4, 2, 1, 1200.00),
(5, 3, 1, 3200.00),
(6, 7, 1, 3100.00);
