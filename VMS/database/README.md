# Database scaffold for Vehicle Service Management System

This folder contains raw MySQL SQL files to create the database schema, seed sample data, and provide report queries.

**Hosted PostgreSQL (Neon):** use **`postgres/`** scripts instead — same logical model, Postgres/Neon-compatible DDL and seeds. See `postgres/README.md`.

Run order (local MySQL):

1. schema/001_create_database.sql
2. schema/002_create_master_tables.sql
3. schema/003_create_vehicle_tables.sql
4. schema/004_create_service_workflow_tables.sql
5. schema/005_create_inventory_billing_tables.sql
6. schema/006_constraints_and_indexes.sql
7. schema/007_views.sql

Then run seed files in `database/seed/` in numeric order.

Notes:
- All tables use InnoDB and utf8mb4 character set.
- Foreign key cascades are applied for subtype and junction tables where appropriate.
- This is a scaffold for academic use; do not run in production without reviewing.
