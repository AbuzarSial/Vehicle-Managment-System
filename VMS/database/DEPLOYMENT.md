# Deploying `vms_db` on managed MySQL (Aiven, Railway, etc.)

This project uses **MySQL only** (InnoDB, `utf8mb4`). The FastAPI backend expects:

```text
DATABASE_URL=mysql+pymysql://USER:PASSWORD@HOST:PORT/vms_db
```

The **database name** in the path should be **`vms_db`** unless you intentionally use another name and align `USE` statements (see below).

---

## 1. Aiven for MySQL

1. Create an Aiven account and a **MySQL** service (not PostgreSQL).
2. In the service **Overview**, open **Connection information**:
   - Note **Host**, **Port**, **User**, **Password**, and **Database name**.
3. If Aiven created a default database (e.g. `defaultdb`), either:
   - Add a new database **`vms_db`** from the **Databases** tab (recommended), or  
   - Use the default name and replace every `USE vms_db;` in `schema/*.sql` and `seed/*.sql` with `USE defaultdb;` before import (table names stay the same).
4. Enable **SSL** if required (Aiven typically does). For the `mysql` client, you may need `--ssl-mode=REQUIRED` (see import examples).

---

## 2. Railway MySQL

1. Add a **MySQL** plugin/template to your project (not Postgres).
2. Open the MySQL service variables: copy **MYSQLHOST**, **MYSQLPORT**, **MYSQLUSER**, **MYSQLPASSWORD**, **MYSQLDATABASE**.
3. Railway often sets **`MYSQLDATABASE`** to a value like `railway`. Either:
   - Create **`vms_db`** via Railway’s MySQL console / admin if allowed, and point your app at `vms_db`, or  
   - Keep `MYSQLDATABASE` as provided and replace `USE vms_db;` in all SQL files with `USE railway;` (example) before import.

---

## 3. Exact SQL run order (schema → seed → routines)

| Step | File |
|------|------|
| 0 (optional) | `schema/001_create_database.sql` — **skip on managed MySQL** if you cannot `CREATE DATABASE`; create `vms_db` in the UI instead |
| 1 | `schema/002_create_master_tables.sql` |
| 2 | `schema/003_create_vehicle_tables.sql` |
| 3 | `schema/004_create_service_workflow_tables.sql` |
| 4 | `schema/005_create_inventory_billing_tables.sql` |
| 5 | `schema/006_constraints_and_indexes.sql` |
| 6 | `schema/007_views.sql` |
| 7 | `seed/001_seed_master_data.sql` |
| 8 | `seed/002_seed_customers_vehicles.sql` |
| 9 | `seed/003_seed_requests_inspections.sql` |
| 10 | `seed/004_seed_work_orders_inventory.sql` |
| 11 | `seed/005_seed_bills.sql` |
| 12 | `routines/001_triggers.sql` (optional but recommended) |
| 13 | `routines/002_functions.sql` |
| 14 | `routines/003_procedures.sql` |
| 15 | `routines/004_cursors.sql` |

Seeds are ordered so **parents are inserted before children** (centers/parts/mechanics → customers/vehicles → requests → work orders → bills). Running out of order will cause **foreign key errors**.

---

## 4. Import with `mysql` CLI (from repository root)

Set variables (adjust for your host; **avoid** putting real passwords in shell history — prefer a `.my.cnf` or prompt):

```bash
export MYSQL_HOST="your-mysql-host.a.aivencloud.com"
export MYSQL_PORT="12345"
export MYSQL_USER="avnadmin"
export MYSQL_DB="vms_db"
```

**Schema (managed: skip `001`, database must already exist):**

```bash
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/schema/002_create_master_tables.sql
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/schema/003_create_vehicle_tables.sql
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/schema/004_create_service_workflow_tables.sql
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/schema/005_create_inventory_billing_tables.sql
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/schema/006_constraints_and_indexes.sql
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/schema/007_views.sql
```

If your MySQL client does not support `--ssl-mode`, try `--ssl` or follow the provider’s SSL doc.

**Self-hosted (full privileges, create DB first):**

```bash
mysql -u root -p < VMS/database/schema/001_create_database.sql
mysql -u root -p vms_db < VMS/database/schema/002_create_master_tables.sql
# … same pattern for 003–007 …
```

**Seed:**

```bash
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/seed/001_seed_master_data.sql
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/seed/002_seed_customers_vehicles.sql
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/seed/003_seed_requests_inspections.sql
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/seed/004_seed_work_orders_inventory.sql
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/seed/005_seed_bills.sql
```

**Routines:**

```bash
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/routines/001_triggers.sql
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/routines/002_functions.sql
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/routines/003_procedures.sql
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p --ssl-mode=REQUIRED "$MYSQL_DB" < VMS/database/routines/004_cursors.sql
```

`mysql` runs each file in order; `-p` prompts for password (omit password in the command line).

---

## 5. Connection string for the backend (`DATABASE_URL`)

SQLAlchemy + PyMySQL:

```text
mysql+pymysql://USER:PASSWORD@HOST:PORT/vms_db
```

- Replace **`USER`**, **`PASSWORD`** (URL-encoded if it contains `@`, `#`, `/`, etc.), **`HOST`**, **`PORT`** with the managed service values.
- If the provider requires TLS, append query parameters supported by your stack, for example:

```text
mysql+pymysql://USER:PASSWORD@HOST:PORT/vms_db?ssl_ca=%2Fpath%2Fto%2Fca.pem
```

Use the provider’s documentation for the exact SSL parameter names.

---

## 6. MySQL compatibility and FK safety

- All scripts under `schema/`, `seed/`, and `routines/` target **MySQL 8.0+** (e.g. `CREATE OR REPLACE VIEW`, enforced `CHECK` constraints).
- **Do not** run seeds twice on the same data: fixed `PRIMARY KEY` values will **duplicate** unless you truncate or drop and recreate tables.
- For a clean re-import: drop database `vms_db` (if permitted) and recreate, or `DROP TABLE` in reverse dependency order, then rerun `002`–`007` and seeds.

---

## 7. Optional: DCL

After import, you may run `dcl/001_create_users_and_grants.sql` as an admin user if your host allows `CREATE USER` / `GRANT` (some managed tiers restrict this).
