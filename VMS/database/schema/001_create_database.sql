-- =============================================================================
-- 001_create_database.sql
-- Vehicle Service Management System — database bootstrap
-- =============================================================================
-- Run this script first. It creates the application schema database with
-- utf8mb4 so all tables can store full Unicode (e.g. names, addresses).
--
-- Next: 002_create_master_tables.sql
-- =============================================================================

CREATE DATABASE IF NOT EXISTS vms_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE vms_db;
