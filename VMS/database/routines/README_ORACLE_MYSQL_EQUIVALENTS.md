# Oracle manual concepts → MySQL equivalents (VMS project)

This project uses **MySQL 8+** (InnoDB, `utf8mb4`). Course manuals often reference **Oracle PL/SQL**. Use this table in viva to map terminology.

| Oracle-style concept | MySQL equivalent in this repo |
|----------------------|------------------------------|
| **PL/SQL package** (spec + body grouping routines) | One schema (`vms_db`) + multiple `CREATE PROCEDURE` / `CREATE FUNCTION` files under `routines/` (logical “package” = folder + naming prefix `sp_` / `fn_`). |
| **PL/SQL procedure** | `CREATE PROCEDURE` … `BEGIN` … `END` (see `003_procedures.sql`, `004_cursors.sql`). |
| **PL/SQL function** | `CREATE FUNCTION` … `RETURNS` … `RETURN` (see `002_functions.sql`). |
| **Object type** (structured type in DB) | **Relational pattern:** tables (`vehicles` + subtype tables `cars` / `motorcycles` / `trucks`) or, for attributes-only blobs, **JSON** columns (not used here). |
| **%ROWTYPE / record** | Temporary tables (`tmp_mechanic_workload_report`) or session variables; no first-class ROWTYPE. |
| **Explicit cursor** | `DECLARE cur CURSOR FOR SELECT …;` / `OPEN` / `FETCH` / `CLOSE` inside a procedure (`004_cursors.sql`). |
| **Trigger** (BEFORE / AFTER row) | `CREATE TRIGGER` … `BEFORE INSERT` … `FOR EACH ROW` (`001_triggers.sql`). |
| **`DBMS_OUTPUT`** | `SELECT` final result sets from procedures; or `SIGNAL` / application logging. |
| **`SYSDATE`** | `CURRENT_DATE`, `NOW()`, `CURDATE()` as appropriate. |

**Packages:** MySQL has no `PACKAGE` keyword. Group routines by **file naming** and **privileges** (`GRANT EXECUTE ON PROCEDURE …`) the same way you would document an Oracle package API.
