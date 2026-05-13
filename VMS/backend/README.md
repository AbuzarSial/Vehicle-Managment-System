# Vehicle Service Management — FastAPI backend

MySQL-backed REST API for the VMS project. The SPA on Vercel calls this service; configure CORS and `DATABASE_URL` for your environment.

---

## Local run

```bash
cd VMS/backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # edit DATABASE_URL for your MySQL `vms_db`
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

- **Config:** `app/core/config.py` — loads `.env` from this directory when present; **environment variables override** `.env` (Pydantic Settings), which is what Render uses.
- **DB session:** `app/db/session.py` — `create_engine(settings.DATABASE_URL)` with `pool_pre_ping=True` for hosted MySQL.

---

## Deploy on [Render](https://render.com) (Web Service + external MySQL)

Do **not** commit real secrets. Set variables in the Render dashboard.

### 1. Create an external MySQL database

Use any MySQL 8–compatible host (PlanetScale MySQL-compatible mode, AWS RDS, Aiven, etc.) and create database **`vms_db`**. Run `VMS/database/schema/` and `VMS/database/seed/` against that instance (see `VMS/database/README.md`).

### 2. New Web Service on Render

| Setting | Value |
|--------|--------|
| **Root directory** | `VMS/backend` |
| **Runtime** | Python 3 |
| **Build command** | `pip install -r requirements.txt` |
| **Start command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

Render sets **`PORT`** automatically; binding **`0.0.0.0`** is required so the platform can route traffic to your process.

### 3. Environment variables (Render → Environment)

| Key | Example / notes |
|-----|-----------------|
| **`DATABASE_URL`** | See [DATABASE_URL format](#database_url-format) below. Must end with `/vms_db` (or path segment `vms_db`). |
| **`CORS_ALLOW_ORIGINS`** | Optional. Extra origins comma-separated, e.g. another Vercel preview URL. Production URL `https://vehicle-managment-system-mu.vercel.app` is already in `app/main.py` defaults. |
| **`CORS_ALLOW_ORIGIN_REGEX`** | Optional. e.g. `https://.*\.vercel\.app` for all Vercel preview deployments. |
| **`APP_NAME`** | Optional override for OpenAPI title. |

You do **not** need to upload a `.env` file if all values are set in the Render UI.

### 4. After deploy

1. Copy the service public URL (e.g. `https://vms-api-xxxx.onrender.com`).
2. In **Vercel** → your project → Environment variables, set **`VITE_API_BASE_URL`** to that URL **with no trailing slash** (see [Vercel](#vercel-frontend)).
3. Redeploy the frontend so the build picks up the new variable.

---

## `DATABASE_URL` format

Use **SQLAlchemy + PyMySQL** only (no PostgreSQL driver):

```text
mysql+pymysql://USERNAME:PASSWORD@HOST:PORT/vms_db
```

- **Database name:** `vms_db` (required for this project’s schema scripts).
- **Password:** URL-encode special characters (`@` → `%40`, `#` → `%23`, etc.).
- **SSL:** If your provider requires SSL, add query params supported by PyMySQL/SQLAlchemy, e.g. `?ssl_ca=/path/to/ca.pem` or your host’s documented flags.

Example (placeholder host):

```text
mysql+pymysql://vms_user:MyP%40ssw0rd@db.example.com:3306/vms_db
```

---

## Vercel (frontend)

Set **`VITE_API_BASE_URL`** to your **Render API base URL** (the origin only, no path):

```text
https://YOUR-SERVICE-NAME.onrender.com
```

Replace with your real Render hostname after the first successful deploy. The Vite dev proxy is not used in production; the browser calls this origin for `/api/v1/...` (ensure your frontend builds `apiClient` base URL from this variable — see `VMS/frontend/.env.example`).

---

## Health check

Render can use:

- **Path:** `/health`
- **Expected:** JSON `{"status":"ok"}`

---

## Dependencies (`requirements.txt`)

Includes: `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `pymysql`, `pydantic`, `pydantic-settings`, `python-dotenv`.

---

## CORS defaults (code)

`app/main.py` allows:

- `http://localhost:5173`, `http://127.0.0.1:5173`
- `https://vehicle-managment-system-mu.vercel.app`

Additional origins via **`CORS_ALLOW_ORIGINS`**; optional regex via **`CORS_ALLOW_ORIGIN_REGEX`**.
