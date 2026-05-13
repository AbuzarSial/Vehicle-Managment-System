# MySQL equivalents for Oracle packages and object types (VMS coursework)

This note is for **academic / viva** use. The project database is **MySQL** (InnoDB, `utf8mb4`). The course manual often refers to **Oracle PL/SQL packages** and **object types**. Those are **Oracle-specific** features; they are **not** available as the same language constructs in MySQL. Below is how we **justify and map** them while keeping **MySQL only** as the implementation.

---

## 1. Oracle packages → not in MySQL

**What Oracle calls a package:** a named container with a **specification** (declarations) and **body** (implementations) that groups related procedures, functions, types, variables, and cursors in one namespace (e.g. `pkg_billing.create_invoice(...)`).

**MySQL:** there is **no `PACKAGE` keyword** and no package-level private variables or forward declarations in the Oracle sense. Routines are first-class objects in a **schema** (`CREATE PROCEDURE`, `CREATE FUNCTION`, `CREATE TRIGGER`).

**How this project models the “package” idea:**

| Manual idea (Oracle) | VMS MySQL equivalent |
|----------------------|----------------------|
| One billing “package” | **`routines/002_functions.sql`** + **`routines/003_procedures.sql`** — related `fn_*` and `sp_*` routines with a **shared naming prefix** and the same database (`vms_db`). |
| Validation in package body | **`routines/001_triggers.sql`** — `BEFORE INSERT` triggers on `work_order_parts`, `work_order_mechanics`, `bills`. |
| Cursor-heavy report | **`routines/004_cursors.sql`** — `sp_generate_mechanic_workload_report` with an explicit `CURSOR` / `FETCH` / `LOOP`. |

**Documentation discipline:** grouping files under **`VMS/database/routines/`** plays the role of a **logical package** in coursework: one folder, ordered scripts, comments that describe the “public API” (`sp_create_bill_for_work_order`, `fn_calculate_bill_total`, etc.). A short tabular mapping also lives in **`routines/README_ORACLE_MYSQL_EQUIVALENTS.md`**.

---

## 2. Oracle object types → not natively in MySQL

**What Oracle calls an object type:** a user-defined type with attributes and optionally methods (e.g. a type `t_bill_line` with `part_id`, `qty`, `unit_price`).

**MySQL:** there is **no `CREATE TYPE … AS OBJECT`**. Structured data is normally modeled as:

1. **Normalized tables** and **foreign keys** (e.g. `work_order_parts`, `work_order_mechanics`, `bills`).
2. **Views** that join and project a “document-shaped” row for reporting (e.g. **`vw_work_order_summary`** — one row per work order with labor and parts roll-ups and bill columns).
3. **Stored functions** that return a **scalar** derived from those tables (e.g. **`fn_calculate_bill_total(work_order_id)`** in `routines/002_functions.sql` — suggested total = parts + labor lines).
4. Optionally, **JSON** in the result of a `SELECT` for nested or document-style output without an Oracle object type.

So the “object type” in the manual is replaced by **relational design + views + functions**, and JSON only where you want a **serialized structure** in one column.

---

## 3. Example: structured work order billing (view + function)

**View (already in schema):** `vw_work_order_summary` exposes a **single logical row per work order** with identifiers, customer/center context, bill amounts, and **computed** `labor_line_total` and `parts_line_total` (see `schema/007_views.sql`). That is the usual MySQL pattern for “structured read model” instead of an Oracle object instance.

**Function (already in routines):** after loading `routines/002_functions.sql`, you can compare the **stored bill** with the **calculated** roll-up:

```sql
USE vms_db;

SELECT
  wo.work_order_id,
  b.total_amount           AS stored_bill_total,
  fn_calculate_bill_total(wo.work_order_id) AS calculated_parts_plus_labor
FROM work_orders wo
LEFT JOIN bills b ON b.work_order_id = wo.work_order_id
WHERE wo.work_order_id = 1;
```

**Viva line:** “We do not define an Oracle object type for ‘billing’; we store normalized line tables and expose a **view** for reporting plus a **function** for a scalar total when procedures need it.”

---

## 4. Optional: JSON_OBJECT (MySQL 5.7.8+ / 8.x)

If the examiner asks for “structured output like an object,” you can show a **single JSON document per work order** built from columns (no application code required — run in MySQL client):

```sql
USE vms_db;

SELECT
  wo.work_order_id,
  JSON_OBJECT(
    'work_order_id', wo.work_order_id,
    'status', wo.status,
    'bill', JSON_OBJECT(
      'bill_id', b.bill_id,
      'total_amount', b.total_amount,
      'payment_status', b.payment_status
    ),
    'calculated_total_pkr', fn_calculate_bill_total(wo.work_order_id)
  ) AS billing_document
FROM work_orders wo
LEFT JOIN bills b ON b.work_order_id = wo.work_order_id
WHERE wo.work_order_id IN (1, 2, 3)
ORDER BY wo.work_order_id;
```

**Note:** `JSON_OBJECT` requires a MySQL version that supports the JSON functions (5.7.8+). `fn_calculate_bill_total` must exist (run `routines/002_functions.sql` first). This is **illustrative** for vivas; the main app continues to use tables/views as designed.

---

## 5. Summary table (memorize for viva)

| Oracle feature | MySQL in this project |
|----------------|------------------------|
| Package | Folder **`routines/`** + ordered **`001`–`004`** scripts + naming convention |
| Package procedure | `CREATE PROCEDURE` (`003`, `004`) |
| Package function | `CREATE FUNCTION` (`002`) |
| Package private helper | Local routines / triggers / SQL in same file |
| Object type (structured) | Tables + **views** (`007_views.sql`) |
| Object method | **Stored function** or **procedure** |
| Nested structure in one column | **`JSON_OBJECT` / `JSON_ARRAYAGG`** (optional) |

---

## 6. What we explicitly do **not** do

- We do **not** port the schema to Oracle or PostgreSQL for this deliverable.
- We do **not** claim MySQL has packages or object types; we **map** manual terminology to **supported MySQL mechanisms** and to **this repository’s file layout**.

This document, together with **`routines/README_ORACLE_MYSQL_EQUIVALENTS.md`**, is the approved **academic** answer for “where are the packages and object types?” — **they are represented by MySQL routines, triggers, views, and optional JSON**, not by Oracle syntax.
