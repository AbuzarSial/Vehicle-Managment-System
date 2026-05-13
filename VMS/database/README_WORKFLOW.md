# Database workflow aur queries — samajhne wali guide

Yeh document **`VMS/database/`** folder ke SQL scripts, business flow, aur queries ka talluq explain karta hai. Technical names English mein hain taake code/SQL ke saath match rahe.

---

## 1. Maqsad (purpose)

- **Database naam:** `vms_db` (MySQL, InnoDB, utf8mb4)
- **Kaam:** workshop / service center ka record — customers, gaariyan, centers, mechanics, requests, inspection, work orders, parts, bills.

Poora logical flow seedha **EERD / assignment workflow** se match karta hai:

**Customer → Vehicle → Service Request → Inspection → Work Order → Bill**

---

## 2. Folder structure (kahan kya hai)

| Folder / file | Kaam |
|---------------|------|
| **`schema/`** | Tables, FKs, indexes, **views** — pehle yeh scripts number order mein chalao |
| **`seed/`** | Demo data (Pakistan-style PKR demo) — schema ke **baad** |
| **`reports/`** | Reporting queries (dashboard-style); optional reporting |
| **`docs/`** | Data dictionary, EERD mapping — columns ki detail |

Short technical order: **`database/README.md`** (sirf list). Yahan **detail workflow** hai.

---

## 3. Schema scripts — kyun is order mein?

Har script agli files par depend karti hai (foreign keys).

| Order | File | Khulasa |
|-------|------|---------|
| 1 | `001_create_database.sql` | `CREATE DATABASE vms_db` + `USE vms_db` |
| 2 | `002_create_master_tables.sql` | `customers`, `service_centers`, `spare_parts` — baaki sab in par anchor |
| 3 | `003_create_vehicle_tables.sql` | `vehicles` + subtypes (`cars`, `motorcycles`, `trucks`) |
| 4 | `004_create_service_workflow_tables.sql` | `mechanics`, `service_requests`, `inspections`, `work_orders` |
| 5 | `005_create_inventory_billing_tables.sql` | Inventory junctions, `work_order_*` lines, `bills` |
| 6 | `006_constraints_and_indexes.sql` | Extra indexes (performance / filters) |
| 7 | `007_views.sql` | **Views** jaise `vw_service_request_summary` — reporting ke liye |

**Note:** Backend (FastAPI) zyada tar **tables par SQLAlchemy queries** use karta hai; views ka logic reporting rules reflect karta hai.

---

## 4. Business workflow (database perspective)

Neeche flow **tables** ke naam ke saath hai — assignment ka main story.

```mermaid
flowchart LR
  CU[customers]
  VE[vehicles]
  SR[service_requests]
  SC[service_centers]
  ME[mechanics]
  IN[inspections]
  WO[work_orders]
  BI[bills]

  CU --> VE
  VE --> SR
  SC --> SR
  SR --> IN
  ME --> IN
  IN --> WO
  WO --> BI
```

**Roman Urdu summary:**

1. **Customer** (`customers`) — malik ka record.
2. **Vehicle** (`vehicles`) — har gaari `customer_id` se customer se judi hai; car/bike/truck ke liye `cars` / `motorcycles` / `trucks` subtype rows.
3. **Service request** (`service_requests`) — kaun si gaari (`vehicle_id`), kis center par (`center_id`), kab, status.
4. **Inspection** (`inspections`) — ek request par ideally ek inspection (`request_id` unique); mechanic optional (`mechanic_id`).
5. **Work order** (`work_orders`) — ek inspection se ek work order (`inspection_id` unique); mechanics/parts alag junction tables.
6. **Bill** (`bills`) — ek work order par ek bill (`work_order_id` unique).

**Parts / inventory:**

- **`spare_parts`** — catalog.
- **`service_center_inventory`** — har center par stock (composite key `center_id`, `part_id`).
- **`work_order_parts`** — WO par konsa part kitni quantity.

---

## 5. Seed files — data ka order

Schema ke **baad**, numeric order:

| File | Approx. purpose |
|------|------------------|
| `001_seed_master_data.sql` | Centers, mechanics, spare parts base catalog |
| `002_seed_customers_vehicles.sql` | Customers + vehicles (+ subtypes jahan zaroor ho) |
| `003_seed_requests_inspections.sql` | Service requests + inspections |
| `004_seed_work_orders_inventory.sql` | Work orders, labor lines, parts lines, inventory rows |
| `005_seed_bills.sql` | Bills |

Seeds dubara chalane se pehle assignment ke mutabiq **truncate / drop** strategy dekho — IDs seed files ke saath align rehni ho to full reset kabhi zaroori ho sakta hai.

---

## 6. Views (`007_views.sql`) — queries kahan simplify hoti hain

Views reporting ke “named queries” jaisi hain — same joins/bar filters baar baar likhne ki bajaye:

- Misal ke taur par: pipeline summary, pending bills, low stock jaisi shapes.

Backend kabhi **views se directly read** kare, kabhi **same logic ORM** se — dono patterns docs mein mention hain.

---

## 7. `reports/` folder

Yeh scripts **adhoc reporting / analytics** ke liye hain (misal: dashboard-style joins). Inhe schema + seeds ke baad chala sakte ho taake demo reports validate hon.

---

## 8. Backend se database ka connection

- Backend **`DATABASE_URL`** use karta hai, misal:  
  `mysql+pymysql://USER:PASSWORD@HOST:3306/vms_db`
- Details: **`VMS/backend/.env.example`** aur **`VMS/README.md`** → Environment variables.

SQL scripts MySQL client se:

```bash
mysql -u root -p < VMS/database/schema/001_create_database.sql
mysql -u root -p vms_db < VMS/database/schema/002_create_master_tables.sql
# ... baqi schema order ...
mysql -u root -p vms_db < VMS/database/seed/001_seed_master_data.sql
# ... seeds ...
```

---

## 9. Aur detail kahan milegi?

| Document | Content |
|----------|---------|
| **`database/README.md`** | Schema + seed **run order** (short) |
| **`database/docs/data_dictionary.md`** | Columns / tables overview |
| **`database/docs/eerd_to_schema_mapping.md`** | EERD ↔ tables mapping |
| **`VMS/README.md`** | Poori app — API, frontend, setup |

---

## 10. Khulasa

- Pehle **`schema/`** `001` → `007`, phir **`seed/`** `001` → `005`.
- Workflow tables ke through **customer se le kar bill** tak linked hai.
- **Queries** reporting/views aur `reports/` mein; routine CRUD FastAPI **REST** se hota hai.

Agar koi script fail ho to pehle check karo: pehle wali files chal chuki hain, database naam **`vms_db`** hai, aur MySQL user ko zaroori privileges hain.
