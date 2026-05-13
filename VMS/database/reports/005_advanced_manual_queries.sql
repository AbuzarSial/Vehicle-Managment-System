-- =============================================================================
-- 005_advanced_manual_queries.sql
-- Project manual: joins, set ops, subqueries, aggregation (MySQL 8+)
-- Run on vms_db after schema (001–007) and seeds (001–005).
-- Viva tip: run one block at a time in MySQL Workbench / CLI and narrate the plan.
-- =============================================================================

USE vms_db;

-- ############################################################################
-- 1. JOINS (INNER, LEFT, RIGHT, FULL OUTER equivalent)
-- ############################################################################
-- Viva: INNER keeps only matching rows; LEFT keeps all left rows (NULLs where no
-- match on right); RIGHT is the mirror of LEFT; MySQL has no FULL OUTER JOIN,
-- so we UNION a LEFT-only anti-join, the inner join, and a RIGHT-only anti-join.
-- ############################################################################

-- ---------------------------------------------------------------------------
-- 1a) INNER JOIN — only customers who actually have at least one vehicle
--     (viva: both sides must match; good for “active fleet owners” list)
-- ---------------------------------------------------------------------------
SELECT
  c.customer_id,
  c.customer_name,
  v.vehicle_id,
  v.registration_no,
  v.make,
  v.model
FROM customers c
INNER JOIN vehicles v ON v.customer_id = c.customer_id
ORDER BY c.customer_name, v.registration_no;

-- ---------------------------------------------------------------------------
-- 1b) LEFT JOIN — every customer, even if they have zero vehicles yet
--     (viva: “who are we onboarding?” — NULL vehicle columns = no fleet row)
-- ---------------------------------------------------------------------------
SELECT
  c.customer_id,
  c.customer_name,
  v.vehicle_id,
  v.registration_no
FROM customers c
LEFT JOIN vehicles v ON v.customer_id = c.customer_id
ORDER BY c.customer_id, v.vehicle_id;

-- ---------------------------------------------------------------------------
-- 1c) RIGHT JOIN — every vehicle row, with owner when FK resolves
--     (viva: same shape as LEFT if you swap table order; useful when the “driver”
--     table is vehicles for a registration export)
-- ---------------------------------------------------------------------------
SELECT
  c.customer_id,
  c.customer_name,
  v.vehicle_id,
  v.registration_no,
  v.make
FROM customers c
RIGHT JOIN vehicles v ON v.customer_id = c.customer_id
ORDER BY v.vehicle_id;

-- ---------------------------------------------------------------------------
-- 1d) FULL OUTER JOIN equivalent (MySQL) — customers ∪ vehicles on the join key
--     Part A: customers with no matching vehicle (anti-join from the left)
--     Part B: inner join rows (customer + vehicle matched)
--     Part C: vehicles whose customer_id has no row in customers (should be empty
--             in a clean FK database; included to show the complete pattern)
--     Viva: UNION removes exact duplicates; UNION ALL is faster if you know no dupes.
-- ---------------------------------------------------------------------------
SELECT
  c.customer_id,
  v.vehicle_id,
  'left_only_customer' AS match_bucket
FROM customers c
LEFT JOIN vehicles v ON v.customer_id = c.customer_id
WHERE v.vehicle_id IS NULL

UNION

SELECT
  c.customer_id,
  v.vehicle_id,
  'inner_match' AS match_bucket
FROM customers c
INNER JOIN vehicles v ON v.customer_id = c.customer_id

UNION

SELECT
  c.customer_id,
  v.vehicle_id,
  'right_only_vehicle' AS match_bucket
FROM customers c
RIGHT JOIN vehicles v ON v.customer_id = c.customer_id
WHERE c.customer_id IS NULL
ORDER BY match_bucket, customer_id, vehicle_id;

-- ############################################################################
-- 2. SET OPERATIONS: UNION, INTERSECT equivalent, MINUS equivalent
-- ############################################################################
-- Viva: UNION stacks result sets (same column count/types). MySQL has no INTERSECT
-- or EXCEPT/MINUS keywords; we simulate with joins or NOT EXISTS / anti-joins.
-- ############################################################################

-- ---------------------------------------------------------------------------
-- 2a) UNION — combine two projections (here: two city lists as one report column)
--     Example: service center cities UNION distinct cities appearing on requests
--              via vehicle owner journey (simplified: two SELECTs same shape)
--     Viva: UNION dedupes; UNION ALL keeps duplicates and is cheaper.
-- ---------------------------------------------------------------------------
SELECT sc.city AS location_name, 'service_center' AS source_kind
FROM service_centers sc
WHERE sc.city IS NOT NULL AND sc.city <> ''

UNION

SELECT DISTINCT sc2.city AS location_name, 'center_with_request' AS source_kind
FROM service_requests sr
INNER JOIN service_centers sc2 ON sc2.center_id = sr.center_id
WHERE sc2.city IS NOT NULL AND sc2.city <> ''
ORDER BY location_name, source_kind;

-- ---------------------------------------------------------------------------
-- 2b) INTERSECT equivalent — part_ids that appear BOTH in inventory AND on a WO
--     (MySQL: INNER JOIN the two distinct sets on part_id)
--     Viva: “parts we stock AND have consumed on jobs” = intersection of two sets.
-- ---------------------------------------------------------------------------
SELECT DISTINCT sci.part_id, sp.part_name
FROM service_center_inventory sci
INNER JOIN (
  SELECT DISTINCT wop.part_id
  FROM work_order_parts wop
) used ON used.part_id = sci.part_id
INNER JOIN spare_parts sp ON sp.part_id = sci.part_id
ORDER BY sci.part_id;

-- Same intent using EXISTS (also a common INTERSECT-style pattern):
SELECT DISTINCT sp.part_id, sp.part_name
FROM spare_parts sp
WHERE EXISTS (SELECT 1 FROM service_center_inventory sci WHERE sci.part_id = sp.part_id)
  AND EXISTS (SELECT 1 FROM work_order_parts wop WHERE wop.part_id = sp.part_id)
ORDER BY sp.part_id;

-- ---------------------------------------------------------------------------
-- 2c) MINUS / EXCEPT equivalent — customers who have NO vehicle at all
--     (MySQL: LEFT JOIN ... WHERE right.pk IS NULL  OR  NOT EXISTS)
--     Viva: “set difference A minus B” = rows in A with no partner in B.
-- ---------------------------------------------------------------------------
SELECT c.customer_id, c.customer_name, c.phone
FROM customers c
LEFT JOIN vehicles v ON v.customer_id = c.customer_id
WHERE v.vehicle_id IS NULL
ORDER BY c.customer_id;

-- Same with NOT EXISTS (often preferred in viva for clarity):
SELECT c.customer_id, c.customer_name
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM vehicles v WHERE v.customer_id = c.customer_id
)
ORDER BY c.customer_id;

-- ---------------------------------------------------------------------------
-- 2d) MINUS example — vehicles that have never had a service request
--     (viva: dormant fleet / “never visited workshop” marketing list)
-- ---------------------------------------------------------------------------
SELECT v.vehicle_id, v.registration_no, v.make, v.model
FROM vehicles v
LEFT JOIN service_requests sr ON sr.vehicle_id = v.vehicle_id
WHERE sr.request_id IS NULL
ORDER BY v.vehicle_id;

-- ############################################################################
-- 3. SUBQUERIES (non-correlated vs correlated)
-- ############################################################################
-- Viva: non-correlated subquery runs once (result cached/independent of outer row).
-- Correlated subquery re-evaluates per outer row (outer columns referenced inside).
-- ############################################################################

-- ---------------------------------------------------------------------------
-- 3a) Non-correlated subquery — all service requests for “Toyota” vehicles
--     The inner query does not reference the outer alias; it runs independently.
-- ---------------------------------------------------------------------------
SELECT sr.request_id, sr.request_date, sr.status, sr.vehicle_id
FROM service_requests sr
WHERE sr.vehicle_id IN (
  SELECT v.vehicle_id
  FROM vehicles v
  WHERE v.make = 'Toyota'
)
ORDER BY sr.request_date DESC;

-- ---------------------------------------------------------------------------
-- 3b) Non-correlated subquery in FROM — average bill amount as a benchmark
-- ---------------------------------------------------------------------------
SELECT
  b.bill_id,
  b.work_order_id,
  b.total_amount,
  bench.avg_bill_all_centers,
  (b.total_amount - bench.avg_bill_all_centers) AS diff_from_avg
FROM bills b
CROSS JOIN (
  SELECT AVG(b2.total_amount) AS avg_bill_all_centers
  FROM bills b2
) bench
ORDER BY b.bill_id;

-- ---------------------------------------------------------------------------
-- 3c) Correlated subquery — per customer: date of their most recent service request
--     Outer row: c.customer_id — inner WHERE references c.customer_id (correlated).
-- ---------------------------------------------------------------------------
SELECT
  c.customer_id,
  c.customer_name,
  (
    SELECT MAX(sr.request_date)
    FROM vehicles v
    INNER JOIN service_requests sr ON sr.vehicle_id = v.vehicle_id
    WHERE v.customer_id = c.customer_id
  ) AS last_service_request_date
FROM customers c
ORDER BY c.customer_id;

-- ---------------------------------------------------------------------------
-- 3d) Correlated EXISTS — mechanics who worked at least one billable WO line
--     (exists checks per mechanic row against work_order_mechanics)
-- ---------------------------------------------------------------------------
SELECT m.mechanic_id, m.mechanic_name, m.center_id
FROM mechanics m
WHERE EXISTS (
  SELECT 1
  FROM work_order_mechanics wom
  WHERE wom.mechanic_id = m.mechanic_id
)
ORDER BY m.mechanic_id;

-- ############################################################################
-- 4. AGGREGATION — GROUP BY, HAVING, COUNT, SUM, AVG
-- ############################################################################
-- Viva: GROUP BY collapses rows; HAVING filters groups (after aggregation).
-- WHERE filters rows before aggregation — examiners often ask WHEN to use each.
-- ############################################################################

-- ---------------------------------------------------------------------------
-- 4a) GROUP BY + COUNT + SUM — mechanic workload (hours and labor value by mechanic)
--     Project tie-in: same story as vw_mechanic_workload but raw tables.
-- ---------------------------------------------------------------------------
SELECT
  m.mechanic_id,
  m.mechanic_name,
  COUNT(DISTINCT wom.work_order_id) AS work_orders_touched,
  SUM(wom.hours_worked) AS total_hours,
  SUM(wom.hours_worked * wom.labor_rate) AS total_labor_pkr
FROM mechanics m
LEFT JOIN work_order_mechanics wom ON wom.mechanic_id = m.mechanic_id
GROUP BY m.mechanic_id, m.mechanic_name
ORDER BY total_labor_pkr DESC;

-- ---------------------------------------------------------------------------
-- 4b) HAVING — only centers with more than N bills (post-aggregate filter)
--     Service center revenue style: join bills to WO pipeline, group by center.
-- ---------------------------------------------------------------------------
SELECT
  sc.center_id,
  sc.center_name,
  COUNT(b.bill_id) AS bill_count,
  SUM(b.total_amount) AS total_billed_pkr,
  AVG(b.total_amount) AS avg_bill_pkr
FROM service_centers sc
INNER JOIN service_requests sr ON sr.center_id = sc.center_id
INNER JOIN inspections i ON i.request_id = sr.request_id
INNER JOIN work_orders wo ON wo.inspection_id = i.inspection_id
INNER JOIN bills b ON b.work_order_id = wo.work_order_id
GROUP BY sc.center_id, sc.center_name
HAVING COUNT(b.bill_id) >= 1
ORDER BY total_billed_pkr DESC;

-- ---------------------------------------------------------------------------
-- 4c) COUNT / AVG / SUM — most used spare parts by quantity on work orders
--     (viva: “top movers” for procurement — aligns with vw_parts_usage_summary)
-- ---------------------------------------------------------------------------
SELECT
  sp.part_id,
  sp.part_name,
  SUM(wop.quantity_used) AS total_qty_used,
  AVG(wop.sale_price_at_use) AS avg_sale_unit_pkr,
  SUM(wop.quantity_used * wop.sale_price_at_use) AS line_revenue_pkr
FROM spare_parts sp
INNER JOIN work_order_parts wop ON wop.part_id = sp.part_id
GROUP BY sp.part_id, sp.part_name
ORDER BY total_qty_used DESC;

-- ---------------------------------------------------------------------------
-- 4d) Pending bills — GROUP BY payment_status with HAVING on unpaid pipeline
--     (raw-table version of vw_pending_bills story)
-- ---------------------------------------------------------------------------
SELECT
  b.payment_status,
  COUNT(*) AS bill_count,
  SUM(b.total_amount) AS total_due_pkr,
  AVG(b.total_amount) AS avg_due_pkr
FROM bills b
WHERE b.payment_status IN ('unpaid', 'pending')
GROUP BY b.payment_status
HAVING COUNT(*) >= 1;

-- ---------------------------------------------------------------------------
-- 4e) Low stock — aggregate count of low-stock rows per center (GROUP BY + HAVING)
-- ---------------------------------------------------------------------------
SELECT
  sci.center_id,
  sc.center_name,
  COUNT(*) AS low_stock_sku_count,
  SUM(sci.quantity_on_hand) AS total_units_on_hand
FROM service_center_inventory sci
INNER JOIN service_centers sc ON sc.center_id = sci.center_id
WHERE sci.quantity_on_hand <= sci.reorder_level
GROUP BY sci.center_id, sc.center_name
HAVING COUNT(*) >= 1
ORDER BY low_stock_sku_count DESC;
