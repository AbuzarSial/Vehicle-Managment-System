# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.







frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── PageHeader.jsx
│   │   │
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── Table.jsx
│   │       ├── Badge.jsx
│   │       ├── Loader.jsx
│   │       └── EmptyState.jsx
│   │
│   ├── config/
│   │   └── navigation.js
│   │
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── pages/
│   │   │   │   └── DashboardPage.jsx
│   │   │   └── components/
│   │   │       ├── StatCards.jsx
│   │   │       ├── RecentRequestsTable.jsx
│   │   │       └── LowStockPanel.jsx
│   │   │
│   │   ├── customers/
│   │   │   ├── pages/
│   │   │   │   └── CustomersPage.jsx
│   │   │   ├── components/
│   │   │   │   ├── CustomerForm.jsx
│   │   │   │   ├── CustomerTable.jsx
│   │   │   │   └── CustomerFilters.jsx
│   │   │   ├── services/
│   │   │   │   └── customerService.js
│   │   │   └── validators/
│   │   │       └── customerSchema.js
│   │   │
│   │   ├── vehicles/
│   │   │   ├── pages/
│   │   │   │   └── VehiclesPage.jsx
│   │   │   ├── components/
│   │   │   │   ├── VehicleForm.jsx
│   │   │   │   └── VehicleTable.jsx
│   │   │   ├── services/
│   │   │   │   └── vehicleService.js
│   │   │   └── validators/
│   │   │       └── vehicleSchema.js
│   │   │
│   │   ├── serviceRequests/
│   │   ├── serviceCenters/
│   │   ├── mechanics/
│   │   ├── inspections/
│   │   ├── workOrders/
│   │   ├── spareParts/
│   │   ├── bills/
│   │   └── reports/
│   │
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   └── useModal.js
│   │
│   ├── lib/
│   │   ├── apiClient.js
│   │   ├── utils.js
│   │   ├── constants.js
│   │   └── formatters.js
│   │
│   ├── routes/
│   │   ├── AppRouter.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── styles/
│   │   └── index.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js





backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── api.py
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── exceptions.py
│   │   └── logging.py
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── session.py
│   │   └── init_db.py
│   │
│   ├── modules/
│   │   ├── __init__.py
│   │   │
│   │   ├── customers/
│   │   │   ├── __init__.py
│   │   │   ├── model.py
│   │   │   ├── schema.py
│   │   │   ├── service.py
│   │   │   ├── router.py
│   │   │   └── constants.py
│   │   │
│   │   ├── vehicles/
│   │   │   ├── __init__.py
│   │   │   ├── model.py
│   │   │   ├── schema.py
│   │   │   ├── service.py
│   │   │   ├── router.py
│   │   │   └── constants.py
│   │   │
│   │   ├── service_requests/
│   │   │   ├── __init__.py
│   │   │   ├── model.py
│   │   │   ├── schema.py
│   │   │   ├── service.py
│   │   │   ├── router.py
│   │   │   └── constants.py
│   │   │
│   │   ├── service_centers/
│   │   ├── mechanics/
│   │   ├── inspections/
│   │   ├── work_orders/
│   │   ├── spare_parts/
│   │   ├── bills/
│   │   └── dashboard/
│   │
│   └── shared/
│       ├── __init__.py
│       ├── pagination.py
│       ├── responses.py
│       └── utils.py
│
├── alembic/
│   ├── env.py
│   ├── README
│   └── versions/
│
├── tests/
│   ├── __init__.py
│   └── conftest.py
│
├── .env.example
├── requirements.txt
├── alembic.ini
└── README.md



docs/
├── eerd/
├── screenshots/
├── api/
└── notes/


database/
├── schema/
│   ├── 001_create_database.sql
│   ├── 002_create_master_tables.sql
│   ├── 003_create_vehicle_tables.sql
│   ├── 004_create_service_workflow_tables.sql
│   ├── 005_create_inventory_billing_tables.sql
│   ├── 006_constraints_and_indexes.sql
│   └── 007_views.sql
│
├── seed/
│   ├── 001_seed_master_data.sql
│   ├── 002_seed_customers_vehicles.sql
│   ├── 003_seed_requests_inspections.sql
│   ├── 004_seed_work_orders_inventory.sql
│   └── 005_seed_bills.sql
│
├── reports/
│   ├── 001_dashboard_reports.sql
│   ├── 002_inventory_reports.sql
│   └── 003_billing_reports.sql
│
├── docs/
│   ├── data_dictionary.md
│   └── eerd_to_schema_mapping.md
│
└── README.md