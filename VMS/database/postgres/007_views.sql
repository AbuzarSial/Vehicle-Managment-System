-- =============================================================================
-- PostgreSQL / Neon — reporting views (same logic as database/schema/007_views.sql)
-- =============================================================================

CREATE OR REPLACE VIEW vw_vehicle_details AS
SELECT
  v.vehicle_id,
  v.registration_no,
  v.vin,
  v.make,
  v.model,
  v.model_year,
  cust.customer_id,
  cust.customer_name,
  CASE
    WHEN car.vehicle_id IS NOT NULL THEN 'car'
    WHEN moto.vehicle_id IS NOT NULL THEN 'motorcycle'
    WHEN trk.vehicle_id IS NOT NULL THEN 'truck'
    ELSE 'unknown'
  END AS vehicle_type,
  car.number_of_doors AS car_number_of_doors,
  car.body_type AS car_body_type,
  moto.engine_cc AS motorcycle_engine_cc,
  moto.bike_type AS motorcycle_bike_type,
  trk.load_capacity AS truck_load_capacity,
  trk.axle_count AS truck_axle_count
FROM vehicles v
JOIN customers cust ON cust.customer_id = v.customer_id
LEFT JOIN cars car ON car.vehicle_id = v.vehicle_id
LEFT JOIN motorcycles moto ON moto.vehicle_id = v.vehicle_id
LEFT JOIN trucks trk ON trk.vehicle_id = v.vehicle_id;

CREATE OR REPLACE VIEW vw_low_stock_parts AS
SELECT
  sci.center_id,
  sc.center_name,
  sci.part_id,
  sp.part_name,
  sci.quantity_on_hand,
  sci.reorder_level,
  sci.shelf_location
FROM service_center_inventory sci
JOIN spare_parts sp ON sp.part_id = sci.part_id
JOIN service_centers sc ON sc.center_id = sci.center_id
WHERE sci.quantity_on_hand <= sci.reorder_level;

CREATE OR REPLACE VIEW vw_pending_bills AS
SELECT
  b.bill_id,
  b.work_order_id,
  b.bill_date,
  b.total_amount,
  b.payment_status,
  wo.status AS work_order_status,
  wo.open_date AS work_order_open_date,
  wo.close_date AS work_order_close_date
FROM bills b
JOIN work_orders wo ON wo.work_order_id = b.work_order_id
WHERE b.payment_status IN ('unpaid', 'pending');

CREATE OR REPLACE VIEW vw_service_request_summary AS
SELECT
  sr.request_id,
  sr.request_date,
  sr.request_type,
  sr.status AS request_status,
  sr.problem_description,
  sr.vehicle_id,
  v.registration_no,
  v.make,
  v.model,
  cust.customer_id,
  cust.customer_name,
  sr.center_id,
  sc.center_name,
  i.inspection_id,
  i.inspection_date,
  i.result AS inspection_result,
  wo.work_order_id,
  wo.status AS work_order_status,
  wo.open_date AS work_order_open_date,
  wo.close_date AS work_order_close_date
FROM service_requests sr
JOIN vehicles v ON v.vehicle_id = sr.vehicle_id
JOIN customers cust ON cust.customer_id = v.customer_id
JOIN service_centers sc ON sc.center_id = sr.center_id
LEFT JOIN inspections i ON i.request_id = sr.request_id
LEFT JOIN work_orders wo ON wo.inspection_id = i.inspection_id;

CREATE OR REPLACE VIEW vw_work_order_summary AS
SELECT
  wo.work_order_id,
  wo.status AS work_order_status,
  wo.open_date AS work_order_open_date,
  wo.close_date AS work_order_close_date,
  i.inspection_id,
  sr.request_id,
  sr.request_date,
  sr.request_type,
  v.vehicle_id,
  v.registration_no,
  v.make,
  v.model,
  cust.customer_id,
  cust.customer_name,
  sr.center_id,
  sc.center_name,
  b.bill_id,
  b.bill_date,
  b.total_amount AS bill_total_amount,
  b.payment_status AS bill_payment_status,
  COALESCE(labor.labor_line_total, 0) AS labor_line_total,
  COALESCE(parts.parts_line_total, 0) AS parts_line_total
FROM work_orders wo
JOIN inspections i ON i.inspection_id = wo.inspection_id
JOIN service_requests sr ON sr.request_id = i.request_id
JOIN vehicles v ON v.vehicle_id = sr.vehicle_id
JOIN customers cust ON cust.customer_id = v.customer_id
JOIN service_centers sc ON sc.center_id = sr.center_id
LEFT JOIN bills b ON b.work_order_id = wo.work_order_id
LEFT JOIN (
  SELECT
    work_order_id,
    SUM(hours_worked * labor_rate) AS labor_line_total
  FROM work_order_mechanics
  GROUP BY work_order_id
) labor ON labor.work_order_id = wo.work_order_id
LEFT JOIN (
  SELECT
    work_order_id,
    SUM(quantity_used * sale_price_at_use) AS parts_line_total
  FROM work_order_parts
  GROUP BY work_order_id
) parts ON parts.work_order_id = wo.work_order_id;
