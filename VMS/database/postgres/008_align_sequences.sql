-- After inserts with explicit IDs, advance SERIAL sequences so the next INSERT works.
SELECT setval(pg_get_serial_sequence('customers', 'customer_id'), COALESCE((SELECT MAX(customer_id) FROM customers), 1));
SELECT setval(pg_get_serial_sequence('service_centers', 'center_id'), COALESCE((SELECT MAX(center_id) FROM service_centers), 1));
SELECT setval(pg_get_serial_sequence('spare_parts', 'part_id'), COALESCE((SELECT MAX(part_id) FROM spare_parts), 1));
SELECT setval(pg_get_serial_sequence('vehicles', 'vehicle_id'), COALESCE((SELECT MAX(vehicle_id) FROM vehicles), 1));
SELECT setval(pg_get_serial_sequence('mechanics', 'mechanic_id'), COALESCE((SELECT MAX(mechanic_id) FROM mechanics), 1));
SELECT setval(pg_get_serial_sequence('service_requests', 'request_id'), COALESCE((SELECT MAX(request_id) FROM service_requests), 1));
SELECT setval(pg_get_serial_sequence('inspections', 'inspection_id'), COALESCE((SELECT MAX(inspection_id) FROM inspections), 1));
SELECT setval(pg_get_serial_sequence('work_orders', 'work_order_id'), COALESCE((SELECT MAX(work_order_id) FROM work_orders), 1));
SELECT setval(pg_get_serial_sequence('bills', 'bill_id'), COALESCE((SELECT MAX(bill_id) FROM bills), 1));
