-- =============================================================================
-- 007_views.sql
-- Read-friendly views for UI layers and ad hoc reporting
-- =============================================================================
-- Prerequisites: 001–006 applied (tables + indexes).
--
-- View index (MySQL 8+):
--   Core / existing:  vw_vehicle_details, vw_low_stock_parts, vw_pending_bills,
--                     vw_service_request_summary, vw_work_order_summary
--   Extended:         vw_customer_service_history, vw_billing_summary,
--                     vw_mechanic_workload, vw_service_center_revenue,
--                     vw_parts_usage_summary
--
-- Sample SELECT patterns: ../reports/004_views_usage_examples.sql
-- =============================================================================

USE vms_db;

-- ---------------------------------------------------------------------------
-- vw_vehicle_details
-- Purpose: Fleet and registration screens — owner + vehicle + subtype attrs.
-- One row per vehicle with owner and resolved subtype label (+ subtype attrs).
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- vw_low_stock_parts
-- Purpose: Inventory alerts / procurement — restock list per center and part.
-- Rows where on-hand quantity is at or below reorder threshold (restock list).
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- vw_pending_bills
-- Purpose: Collections / AR widget — unpaid or pending bills with WO context.
-- Bills not yet settled — ties bill to work order lifecycle state.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- vw_service_request_summary
-- Purpose: Service desk pipeline board — one row per request with full context.
-- Request-centric pipeline: customer, vehicle, center, optional inspection/WO ids.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- vw_work_order_summary
-- Purpose: WO detail / margin-style reporting — labor vs parts vs bill totals.
-- Work-order-centric roll-up: origin request + vehicle + bill + cost breakdown.
-- Labor/parts costs use line totals (hours * rate, qty * sale price).
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- vw_customer_service_history
-- Purpose: Customer profile / CRM-style timeline — every service visit per customer
--          (one row per service_request) with vehicle, center, pipeline, and bill.
-- Joins: customers -> vehicles -> service_requests -> centers; optional inspection,
--        work_order, bill (LEFT joins so open requests without WO still appear).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_customer_service_history AS
SELECT
  cust.customer_id,
  cust.customer_name,
  cust.phone AS customer_phone,
  sr.request_id,
  sr.request_date,
  sr.request_type,
  sr.status AS request_status,
  v.vehicle_id,
  v.registration_no,
  v.make,
  v.model,
  sc.center_id,
  sc.center_name,
  i.inspection_id,
  i.inspection_date,
  i.result AS inspection_result,
  wo.work_order_id,
  wo.status AS work_order_status,
  wo.open_date AS work_order_open_date,
  wo.close_date AS work_order_close_date,
  b.bill_id,
  b.bill_date,
  b.total_amount AS bill_total_amount,
  b.payment_status AS bill_payment_status
FROM customers cust
INNER JOIN vehicles v ON v.customer_id = cust.customer_id
INNER JOIN service_requests sr ON sr.vehicle_id = v.vehicle_id
INNER JOIN service_centers sc ON sc.center_id = sr.center_id
LEFT JOIN inspections i ON i.request_id = sr.request_id
LEFT JOIN work_orders wo ON wo.inspection_id = i.inspection_id
LEFT JOIN bills b ON b.work_order_id = wo.work_order_id;

-- ---------------------------------------------------------------------------
-- vw_billing_summary
-- Purpose: Finance / management dashboards — billed amounts rolled up by center,
--          calendar month, and payment_status (paid vs pipeline mix).
-- Joins: bills -> work_orders -> inspections -> service_requests -> service_centers.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_billing_summary AS
SELECT
  sc.center_id,
  sc.center_name,
  DATE_FORMAT(b.bill_date, '%Y-%m') AS billing_month,
  b.payment_status,
  COUNT(*) AS bill_count,
  SUM(b.total_amount) AS total_amount
FROM bills b
INNER JOIN work_orders wo ON wo.work_order_id = b.work_order_id
INNER JOIN inspections i ON i.inspection_id = wo.inspection_id
INNER JOIN service_requests sr ON sr.request_id = i.request_id
INNER JOIN service_centers sc ON sc.center_id = sr.center_id
GROUP BY
  sc.center_id,
  sc.center_name,
  DATE_FORMAT(b.bill_date, '%Y-%m'),
  b.payment_status;

-- ---------------------------------------------------------------------------
-- vw_mechanic_workload
-- Purpose: Staffing / dispatch — labor hours and value per mechanic and home center.
-- Joins: mechanics -> service_centers; LEFT work_order_mechanics so roster includes
--          mechanics with zero assigned lines (zeros for aggregates).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_mechanic_workload AS
SELECT
  m.mechanic_id,
  m.mechanic_name,
  m.specialization,
  m.center_id,
  sc.center_name,
  COUNT(DISTINCT wom.work_order_id) AS work_orders_touched,
  COALESCE(SUM(wom.hours_worked), 0) AS total_hours_worked,
  COALESCE(SUM(wom.hours_worked * wom.labor_rate), 0) AS total_labor_value
FROM mechanics m
INNER JOIN service_centers sc ON sc.center_id = m.center_id
LEFT JOIN work_order_mechanics wom ON wom.mechanic_id = m.mechanic_id
GROUP BY
  m.mechanic_id,
  m.mechanic_name,
  m.specialization,
  m.center_id,
  sc.center_name;

-- ---------------------------------------------------------------------------
-- vw_service_center_revenue
-- Purpose: Executive summary per site — bill counts, all billed, paid vs outstanding.
-- Joins: service_centers LEFT to bills via WO pipeline so centers with no bills
--        still appear with zeros (avoids losing idle locations on dashboard).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_service_center_revenue AS
SELECT
  sc.center_id,
  sc.center_name,
  COUNT(rb.bill_id) AS bill_count,
  COALESCE(SUM(rb.total_amount), 0) AS total_billed_all,
  COALESCE(SUM(CASE WHEN rb.payment_status = 'paid' THEN rb.total_amount ELSE 0 END), 0) AS total_paid_amount,
  COALESCE(
    SUM(CASE WHEN rb.payment_status IN ('unpaid', 'pending') THEN rb.total_amount ELSE 0 END),
    0
  ) AS total_outstanding_amount
FROM service_centers sc
LEFT JOIN (
  SELECT
    sr.center_id,
    b.bill_id,
    b.total_amount,
    b.payment_status
  FROM bills b
  INNER JOIN work_orders wo ON wo.work_order_id = b.work_order_id
  INNER JOIN inspections i ON i.inspection_id = wo.inspection_id
  INNER JOIN service_requests sr ON sr.request_id = i.request_id
) rb ON rb.center_id = sc.center_id
GROUP BY sc.center_id, sc.center_name;

-- ---------------------------------------------------------------------------
-- vw_parts_usage_summary
-- Purpose: Parts sales analytics — consumption and revenue per catalog SKU across WOs.
-- Joins: spare_parts LEFT work_order_parts so unused parts still list (zeros).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_parts_usage_summary AS
SELECT
  sp.part_id,
  sp.part_name,
  sp.brand AS part_brand,
  sp.unit_price AS catalog_unit_price,
  COUNT(DISTINCT wop.work_order_id) AS work_order_count,
  COALESCE(SUM(wop.quantity_used), 0) AS total_quantity_used,
  COALESCE(SUM(wop.quantity_used * wop.sale_price_at_use), 0) AS total_revenue_at_sale_price
FROM spare_parts sp
LEFT JOIN work_order_parts wop ON wop.part_id = sp.part_id
GROUP BY sp.part_id, sp.part_name, sp.brand, sp.unit_price;
