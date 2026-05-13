-- =============================================================================
-- 001_create_users_and_grants.sql — DCL (Data Control Language) examples
-- =============================================================================
-- MySQL 8.0+ recommended (CREATE USER IF NOT EXISTS, role-style patterns).
--
-- WHEN TO RUN
--   Run manually once (as a high-privilege account such as root or admin) AFTER
--   schema scripts (001–007) and optionally after seeds — so objects exist before
--   GRANT. This file is NOT executed by the FastAPI app; it only affects the server
--   if you paste/run it yourself in Workbench / mysql CLI.
--
-- SECURITY
--   Passwords below are placeholders only. Replace every occurrence of
--   '<CHANGE_ME_STRONG_PASSWORD>' with a strong secret before running in any real
--   environment. Never commit real passwords to git.
--
-- VIVA NOTES
--   GRANT gives capabilities to a user@host; REVOKE removes them. FLUSH PRIVILEGES
--   reloads the in-memory grant tables (often redundant on MySQL 8+ after GRANT,
--   but shown here as the classic pattern your manual may expect).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Optional: choose a scope for where the app connects from.
--   'localhost' — only same machine as mysqld
--   '%' — any host (weaker; tighten in production to app subnet or host pattern)
-- ---------------------------------------------------------------------------

-- =============================================================================
-- 1) Reporting user — read-only access to reporting / UI views
-- =============================================================================
-- Use case: BI tools, read replicas, or analysts who must not mutate business data.

CREATE USER IF NOT EXISTS 'vms_report_reader'@'localhost'
  IDENTIFIED BY '<CHANGE_ME_STRONG_PASSWORD>';

-- Grant SELECT only on named views (principle of least privilege).
-- Adjust host ('localhost' → '%' or 'app.example.com') to match your deployment.

GRANT SELECT ON vms_db.vw_vehicle_details TO 'vms_report_reader'@'localhost';
GRANT SELECT ON vms_db.vw_low_stock_parts TO 'vms_report_reader'@'localhost';
GRANT SELECT ON vms_db.vw_pending_bills TO 'vms_report_reader'@'localhost';
GRANT SELECT ON vms_db.vw_service_request_summary TO 'vms_report_reader'@'localhost';
GRANT SELECT ON vms_db.vw_work_order_summary TO 'vms_report_reader'@'localhost';
GRANT SELECT ON vms_db.vw_customer_service_history TO 'vms_report_reader'@'localhost';
GRANT SELECT ON vms_db.vw_billing_summary TO 'vms_report_reader'@'localhost';
GRANT SELECT ON vms_db.vw_mechanic_workload TO 'vms_report_reader'@'localhost';
GRANT SELECT ON vms_db.vw_service_center_revenue TO 'vms_report_reader'@'localhost';
GRANT SELECT ON vms_db.vw_parts_usage_summary TO 'vms_report_reader'@'localhost';

-- Example REVOKE (run only if you mistakenly granted write access to the reader):
-- REVOKE INSERT, UPDATE, DELETE, DROP ON vms_db.* FROM 'vms_report_reader'@'localhost';

-- =============================================================================
-- 2) Application user — CRUD on base tables (typical ORM / API backend)
-- =============================================================================
-- Use case: FastAPI + SQLAlchemy style workloads (no DDL: no CREATE/DROP/ALTER).

CREATE USER IF NOT EXISTS 'vms_app_user'@'localhost'
  IDENTIFIED BY '<CHANGE_ME_STRONG_PASSWORD>';

-- Application DML on all current business tables (not views-only).
-- For stricter production, replace vms_db.* with a comma-separated table list.

GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.customers TO 'vms_app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.service_centers TO 'vms_app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.spare_parts TO 'vms_app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.vehicles TO 'vms_app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.cars TO 'vms_app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.motorcycles TO 'vms_app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.trucks TO 'vms_app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.mechanics TO 'vms_app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.service_requests TO 'vms_app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.inspections TO 'vms_app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.work_orders TO 'vms_app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.service_center_inventory TO 'vms_app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.work_order_mechanics TO 'vms_app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.work_order_parts TO 'vms_app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_db.bills TO 'vms_app_user'@'localhost';

-- Example REVOKE — remove DELETE on financial table while keeping other DML:
-- REVOKE DELETE ON vms_db.bills FROM 'vms_app_user'@'localhost';

-- =============================================================================
-- 3) Reload privilege cache (classic DCL step; safe after privilege changes)
-- =============================================================================

FLUSH PRIVILEGES;

-- =============================================================================
-- Verification (optional — run as admin to confirm grants)
-- =============================================================================
-- SHOW GRANTS FOR 'vms_report_reader'@'localhost';
-- SHOW GRANTS FOR 'vms_app_user'@'localhost';
