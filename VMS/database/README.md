# Database scaffold for Vehicle Service Management System

This folder contains raw MySQL SQL files to create the database schema, seed sample data, and provide report queries.

**Step-by-step workflow (Roman Urdu + diagrams):** see **[README_WORKFLOW.md](README_WORKFLOW.md)** — explains why scripts run in order, table relationships, seeds, and how queries/views fit together.

Run order:

1. schema/001_create_database.sql
2. schema/002_create_master_tables.sql
3. schema/003_create_vehicle_tables.sql
4. schema/004_create_service_workflow_tables.sql
5. schema/005_create_inventory_billing_tables.sql
6. schema/006_constraints_and_indexes.sql
7. schema/007_views.sql

Then run seed files in `database/seed/` in numeric order.

Then run **routines** (stored programs) in numeric order — **after** schema and seeds so tables, views, and demo data exist:

1. `routines/001_triggers.sql`
2. `routines/002_functions.sql`
3. `routines/003_procedures.sql`
4. `routines/004_cursors.sql`

**Why this order:** triggers attach to tables; functions must exist before procedures that call `fn_*`; the cursor report procedure reads `mechanics` and `work_order_mechanics`. Re-running routine files uses `DROP … IF EXISTS` so you can refresh during development.

**Oracle / PL/SQL vs MySQL (coursework narrative):** see **`docs/mysql_equivalent_of_oracle_features.md`** — packages, object types, views/functions, and optional `JSON_OBJECT`. A shorter mapping table: **`routines/README_ORACLE_MYSQL_EQUIVALENTS.md`**.

Optionally (once per environment, as MySQL `root` or admin): run **`dcl/001_create_users_and_grants.sql`** after routines if you want `GRANT EXECUTE` on procedures/functions for the application user (extend that file as needed).

### DCL (users and privileges)

After the database and objects exist, you may **optionally** run **`dcl/001_create_users_and_grants.sql`** as a privileged MySQL account (for example `root`) to demonstrate **Data Control Language**: `CREATE USER`, `GRANT`, `REVOKE`, and `FLUSH PRIVILEGES`.

- **When to run it:** only when you intentionally set up reporting and application database users—typically once per environment, after `schema/` (and usually after `seed/`) so tables and views exist. The VMS application **does not** execute this file; nothing changes at runtime until you run the script manually in your SQL client.
- **Passwords:** the script uses the placeholder `'<CHANGE_ME_STRONG_PASSWORD>'`. Replace it with a strong secret before running anywhere other than a disposable local lab. Do not store real passwords in the repository.
- **GRANT vs REVOKE:** **GRANT** attaches privileges (such as `SELECT` or `INSERT`) to a `user@host` for specific objects (here, views for the report user and tables for the app user). **REVOKE** removes those privileges—for example if you accidentally granted writes to the read-only user, or if you want to strip `DELETE` on `bills` from the app user while keeping `SELECT`/`INSERT`/`UPDATE`. After privilege changes, **`FLUSH PRIVILEGES`** reloads grant tables (common in coursework; MySQL 8 often applies grants immediately, but flushing is still valid).

Notes:
- All tables use InnoDB and utf8mb4 character set.
- Foreign key cascades are applied for subtype and junction tables where appropriate.
- This is a scaffold for academic use; do not run in production without reviewing.
