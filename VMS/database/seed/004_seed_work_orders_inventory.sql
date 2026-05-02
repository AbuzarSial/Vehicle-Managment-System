USE vms_db;

-- create work orders from inspections
INSERT INTO work_orders (inspection_id, open_date, status) VALUES
(1, '2026-04-04', 'open'),
(2, '2026-04-05', 'open');

-- seed service_center_inventory
INSERT INTO service_center_inventory (center_id, part_id, quantity_on_hand, reorder_level, shelf_location) VALUES
(1, 1, 5, 2, 'A1'),
(1, 2, 10, 5, 'A2'),
(2, 1, 2, 2, 'B1');

-- assign mechanics and work_order_mechanics placeholder (mechanics must be seeded separately)
