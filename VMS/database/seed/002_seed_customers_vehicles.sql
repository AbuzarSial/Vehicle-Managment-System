-- =============================================================================
-- 002_seed_customers_vehicles.sql — customers, vehicles, subtypes
-- =============================================================================
-- Prerequisites: 001_seed_master_data.sql
-- Each vehicle appears in exactly one subtype table (car, motorcycle, or truck).
-- Localized sample data: Pakistan (demo only).
-- =============================================================================

USE vms_db;

-- ---------------------------------------------------------------------------
-- Customers (5)
-- ---------------------------------------------------------------------------
INSERT INTO customers (customer_id, customer_name, phone, email) VALUES
(1, 'Muhammad Ali Khan', '+92 300 1234567', 'ali.khan@example.pk'),
(2, 'Fatima Noor', '+92 321 7654321', 'fatima.noor@autohub.pk'),
(3, 'Ahmed Raza', '+92 332 1122334', 'ahmed.raza@example.pk'),
(4, 'Ayesha Malik', '+92 333 9988776', 'ayesha.malik@pakmail.pk'),
(5, 'Zainab Khan', '+92 334 6677889', 'zainab.khan@example.pk');

-- ---------------------------------------------------------------------------
-- Vehicles (8) — common makes/models in Pakistan; VINs are 17 chars (no I, O, Q)
-- ---------------------------------------------------------------------------
INSERT INTO vehicles (vehicle_id, customer_id, registration_no, vin, make, model, model_year) VALUES
(1, 1, 'LEA-23-1456', 'JTDBU4EE9B3014527', 'Toyota', 'Corolla', 2019),
(2, 1, 'LEX-19-7788', 'MNTCH5DN1LE789012', 'Toyota', 'Hilux', 2021),
(3, 2, 'ICT-21-3344', 'MRHFD16408P901234', 'Honda', 'Civic', 2017),
(4, 2, 'KHI-20-9087', 'JYARN23E08A008811', 'Yamaha', 'YBR 125', 2022),
(5, 3, 'RWP-22-5521', 'JMWRBA7S1KD901234', 'Suzuki', 'Cultus', 2018),
(6, 4, 'SKT-21-4411', 'MRHEM55508P567890', 'Honda', 'City', 2023),
(7, 5, 'LHR-21-0702', 'MD626KS5109123456', 'Honda', 'CD 70', 2021),
(8, 5, 'FSD-18-9933', 'MARAFJF76MF901234', 'Suzuki', 'Alto', 2020);

-- ---------------------------------------------------------------------------
-- Subtype rows (PK = vehicle_id → vehicles)
-- ---------------------------------------------------------------------------
INSERT INTO cars (vehicle_id, number_of_doors, body_type) VALUES
(1, 4, 'sedan'),
(3, 4, 'sedan'),
(5, 5, 'hatchback'),
(6, 4, 'sedan'),
(8, 5, 'hatchback');

INSERT INTO motorcycles (vehicle_id, engine_cc, bike_type) VALUES
(4, 125, 'standard'),
(7, 70, 'standard');

INSERT INTO trucks (vehicle_id, load_capacity, axle_count) VALUES
(2, 950.00, 2);
