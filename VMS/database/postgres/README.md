# PostgreSQL / Neon (serverless)

Neon is **PostgreSQL**, not MySQL. Use these scripts instead of `database/schema/*.sql` when your `DATABASE_URL` points at Neon.

## 1. Create a database

In the [Neon console](https://console.neon.tech), create a project and branch. Copy the connection string (choose **pooled** if offered).

Use **`sslmode=require`** in the URL.

## 2. Run DDL (once per empty database)

In Neon **SQL Editor** or via `psql`, run **in order**:

1. `002_master_tables.sql`
2. `003_vehicle_tables.sql`
3. `004_service_workflow_tables.sql`
4. `005_inventory_billing_tables.sql`
5. `006_indexes.sql`
6. `007_views.sql`

## 3. Load demo seeds (optional)

Run **in order**:

1. `seed_001_master.sql`
2. `seed_002_customers_vehicles.sql`
3. `seed_003_requests_inspections.sql`
4. `seed_004_work_orders_inventory.sql`
5. `seed_005_bills.sql`
6. `008_align_sequences.sql` ← **required** after explicit IDs

## 4. Backend connection string

Set **`DATABASE_URL`** for SQLAlchemy + psycopg v3, for example:

```bash
postgresql+psycopg://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

The FastAPI app reads this from **`VMS/backend/.env`**.

MySQL scripts under `database/schema/` remain the source of truth for **local MySQL** development; this folder mirrors the same logical model for **Postgres/Neon**.
