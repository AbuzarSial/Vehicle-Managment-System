-- =============================================================================
-- 002_seed_customers_vehicles.sql — customers, vehicles, subtypes
-- =============================================================================
-- Prerequisites: 001_seed_master_data.sql
-- Each vehicle appears in exactly one subtype table (car, motorcycle, or truck).
-- VINs: 17 chars, fictional, no letters I, O, or Q (ISO 3779 style demo).
-- Registration numbers: unique fictional Punjab/Sindh/KPK style plates.
-- =============================================================================

USE vms_db;

-- ---------------------------------------------------------------------------
-- Customers (15) — fictional Pakistani Muslim names; demo emails @example.pk
-- ---------------------------------------------------------------------------
INSERT INTO customers (customer_id, customer_name, phone, email) VALUES
(1, 'Muhammad Ali Khan', '+92 300 1234567', 'ali.khan@example.pk'),
(2, 'Fatima Noor', '+92 321 7654321', 'fatima.noor@demo-mail.pk'),
(3, 'Ahmed Raza', '+92 332 1122334', 'ahmed.raza@example.pk'),
(4, 'Ayesha Malik', '+92 333 9988776', 'ayesha.malik@demo-mail.pk'),
(5, 'Zainab Khan', '+92 334 6677889', 'zainab.khan@example.pk'),
(6, 'Hassan Abdullah', '+92 301 4455667', 'hassan.abdullah@example.pk'),
(7, 'Khadija Binte Rashid', '+92 302 2233445', 'khadija.rashid@demo-mail.pk'),
(8, 'Umar Farooq', '+92 303 8877665', 'umar.farooq@example.pk'),
(9, 'Sara Ahmed', '+92 304 5566443', 'sara.ahmed@demo-mail.pk'),
(10, 'Yusuf Ibrahim', '+92 305 1122998', 'yusuf.ibrahim@example.pk'),
(11, 'Amina Sheikh', '+92 306 3344556', 'amina.sheikh@demo-mail.pk'),
(12, 'Ibrahim Saleem', '+92 307 7788990', 'ibrahim.saleem@example.pk'),
(13, 'Hafsa Malik', '+92 308 9900112', 'hafsa.malik@demo-mail.pk'),
(14, 'Abdullah Siddiqui', '+92 309 6677881', 'abdullah.siddiqui@example.pk'),
(15, 'Noor Fatima', '+92 310 4455234', 'noor.fatima@example.pk');

-- ---------------------------------------------------------------------------
-- Vehicles (15) — popular models in Pakistan; unique registration_no + vin
-- ---------------------------------------------------------------------------
INSERT INTO vehicles (vehicle_id, customer_id, registration_no, vin, make, model, model_year) VALUES
(1, 1, 'LEA-24-1001', 'LGBCH58DXTV123401', 'Toyota', 'Corolla', 2019),
(2, 2, 'LEA-23-7782', 'LGBCH58DXTV123402', 'Toyota', 'Hilux', 2021),
(3, 3, 'RWP-22-3344', 'MALBA51ADPN123403', 'Honda', 'Civic', 2018),
(4, 4, 'KHI-21-9081', 'MALBA51ADPN123404', 'Yamaha', 'YBR 125', 2022),
(5, 5, 'FSD-22-5520', 'NMTKH58EXVU123405', 'Suzuki', 'Cultus', 2019),
(6, 6, 'SKT-21-4415', 'NMTKH58EXVU123406', 'Honda', 'City', 2023),
(7, 7, 'LHR-20-0703', 'PRLCN11AEWN123407', 'Honda', 'CD 70', 2021),
(8, 8, 'FSD-19-9931', 'PRLCN11AEWN123408', 'Suzuki', 'Alto', 2020),
(9, 9, 'ISB-25-1200', 'RTLDM22BFXP123409', 'KIA', 'Sportage', 2022),
(10, 10, 'MUL-24-5566', 'RTLDM22BFXP123410', 'Suzuki', 'Swift', 2021),
(11, 11, 'PES-23-7788', 'SVMEK33CGYR123411', 'Toyota', 'Fortuner', 2020),
(12, 12, 'HYD-22-9900', 'TVNFK44DHZS123412', 'Changan', 'Alsvin', 2023),
(13, 13, 'SIA-21-3341', 'UWPGK55EJAT123413', 'Honda', 'BR-V', 2019),
(14, 14, 'UET-20-8800', 'VXPHL66FKBU123414', 'FAW', 'Carrier', 2018),
(15, 15, 'BWP-19-4412', 'WYRJM77GLCV123415', 'Honda', 'Pridor', 2023);

-- ---------------------------------------------------------------------------
-- Subtype rows (PK = vehicle_id → vehicles) — 10 cars, 3 motorcycles, 2 trucks
-- ---------------------------------------------------------------------------
INSERT INTO cars (vehicle_id, number_of_doors, body_type) VALUES
(1, 4, 'sedan'),
(3, 4, 'sedan'),
(5, 5, 'hatchback'),
(6, 4, 'sedan'),
(8, 5, 'hatchback'),
(9, 5, 'SUV'),
(10, 5, 'hatchback'),
(11, 5, 'SUV'),
(12, 4, 'sedan'),
(13, 5, 'SUV');

INSERT INTO motorcycles (vehicle_id, engine_cc, bike_type) VALUES
(4, 125, 'standard'),
(7, 70, 'standard'),
(15, 100, 'standard');

INSERT INTO trucks (vehicle_id, load_capacity, axle_count) VALUES
(2, 950.00, 2),
(14, 1200.00, 2);
