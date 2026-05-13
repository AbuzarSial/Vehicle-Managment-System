-- =============================================================================
-- 004_views_usage_examples.sql
-- Sample queries for views defined in schema/007_views.sql
-- Run after schema + seeds (same session as other reports/* examples).
-- =============================================================================

USE vms_db;

-- ---------------------------------------------------------------------------
-- vw_vehicle_details — fleet list with resolved subtype
-- ---------------------------------------------------------------------------
-- SELECT * FROM vw_vehicle_details ORDER BY customer_name, registration_no;

-- ---------------------------------------------------------------------------
-- vw_low_stock_parts — procurement / restock alert panel
-- ---------------------------------------------------------------------------
-- SELECT * FROM vw_low_stock_parts ORDER BY center_name, part_name;

-- ---------------------------------------------------------------------------
-- vw_pending_bills — collections / AR (matches typical “pending” filter)
-- ---------------------------------------------------------------------------
-- SELECT * FROM vw_pending_bills ORDER BY bill_date DESC;

-- ---------------------------------------------------------------------------
-- vw_service_request_summary — pipeline / service desk board
-- ---------------------------------------------------------------------------
-- SELECT * FROM vw_service_request_summary ORDER BY request_date DESC LIMIT 25;

-- ---------------------------------------------------------------------------
-- vw_work_order_summary — WO financial roll-up (labor + parts vs bill)
-- ---------------------------------------------------------------------------
-- SELECT * FROM vw_work_order_summary ORDER BY work_order_open_date DESC LIMIT 25;

-- ---------------------------------------------------------------------------
-- vw_customer_service_history — customer profile timeline
-- ---------------------------------------------------------------------------
-- SELECT *
-- FROM vw_customer_service_history
-- WHERE customer_id = 1
-- ORDER BY request_date DESC, request_id DESC;

-- ---------------------------------------------------------------------------
-- vw_billing_summary — finance by center + month + payment bucket
-- ---------------------------------------------------------------------------
-- SELECT *
-- FROM vw_billing_summary
-- ORDER BY billing_month DESC, center_name, payment_status;

-- ---------------------------------------------------------------------------
-- vw_mechanic_workload — staffing / labor distribution
-- ---------------------------------------------------------------------------
-- SELECT * FROM vw_mechanic_workload ORDER BY center_name, total_hours_worked DESC;

-- ---------------------------------------------------------------------------
-- vw_service_center_revenue — site-level KPI strip
-- ---------------------------------------------------------------------------
-- SELECT * FROM vw_service_center_revenue ORDER BY total_billed_all DESC;

-- ---------------------------------------------------------------------------
-- vw_parts_usage_summary — parts sales / movement report
-- ---------------------------------------------------------------------------
-- SELECT * FROM vw_parts_usage_summary ORDER BY total_revenue_at_sale_price DESC;

-- ---------------------------------------------------------------------------
-- Cross-view dashboard-style slice (uncomment to run)
-- ---------------------------------------------------------------------------
-- SELECT center_name, total_billed_all, total_outstanding_amount
-- FROM vw_service_center_revenue
-- ORDER BY center_id;
