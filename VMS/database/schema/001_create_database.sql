-- =============================================================================
-- 001_create_database.sql
-- Vehicle Service Management System — database bootstrap
-- =============================================================================
-- Run this script first on self-administered MySQL (e.g. local root). It creates
-- the application database `vms_db` with utf8mb4 so tables store full Unicode.
--
-- Managed MySQL (Aiven, Railway, PlanetScale, etc.): you often **cannot** run
-- CREATE DATABASE. Create `vms_db` from the provider UI (or use the DB they
-- give you — then see `DEPLOYMENT.md` / `README.md` “Managed MySQL”) and **skip
-- this file**, starting from `002_create_master_tables.sql` into that database.
--
-- Next: 002_create_master_tables.sql
-- =============================================================================

CREATE DATABASE IF NOT EXISTS vms_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE vms_db;
