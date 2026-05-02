USE vms_db;

-- vw_vehicle_details: combines vehicle and subtype info
CREATE OR REPLACE VIEW vw_vehicle_details AS
SELECT
  v.vehicle_id,
  v.registration_no,
  v.vin,
  v.make,
  v.model,
  v.model_year,
  c.customer_id,
  c.customer_name,
  CASE
    WHEN car.vehicle_id IS NOT NULL THEN 'car'
    WHEN m.vehicle_id IS NOT NULL THEN 'motorcycle'
    WHEN t.vehicle_id IS NOT NULL THEN 'truck'
    ELSE 'unknown'
  END AS vehicle_type
FROM vehicles v
JOIN customers c ON c.customer_id = v.customer_id
LEFT JOIN cars car ON car.vehicle_id = v.vehicle_id
LEFT JOIN motorcycles m ON m.vehicle_id = v.vehicle_id
LEFT JOIN trucks t ON t.vehicle_id = v.vehicle_id;

-- vw_low_stock_parts: parts at or below reorder level across centers
CREATE OR REPLACE VIEW vw_low_stock_parts AS
SELECT
  sci.center_id,
  sc.center_name,
  sci.part_id,
  sp.part_name,
  sci.quantity_on_hand,
  sci.reorder_level
FROM service_center_inventory sci
JOIN spare_parts sp ON sp.part_id = sci.part_id
JOIN service_centers sc ON sc.center_id = sci.center_id
WHERE sci.quantity_on_hand <= sci.reorder_level;

-- vw_pending_bills: bills with unpaid status
CREATE OR REPLACE VIEW vw_pending_bills AS
SELECT
  b.bill_id,
  b.work_order_id,
  b.bill_date,
  b.total_amount,
  b.payment_status,
  wo.status AS work_order_status
FROM bills b
JOIN work_orders wo ON wo.work_order_id = b.work_order_id
WHERE b.payment_status IN ('unpaid', 'pending');
