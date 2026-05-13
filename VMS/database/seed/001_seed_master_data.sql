-- =============================================================================
-- 001_seed_master_data.sql — service_centers, spare_parts, mechanics
-- =============================================================================
-- Run after schema scripts (001–007). For a clean demo, truncate child tables
-- in reverse FK order or use an empty vms_db.
-- Localized sample data: Pakistan (fictional demo only — not real persons).
-- =============================================================================

USE vms_db;

-- ---------------------------------------------------------------------------
-- Service centers (12) — multi-city network for dashboards / viva
-- ---------------------------------------------------------------------------
INSERT INTO service_centers (center_id, center_name, phone, city, address) VALUES
(1, 'Lahore Motor Clinic', '+92 300 1112233', 'Lahore', 'Block C, Johar Town, Lahore'),
(2, 'Karachi Auto Point', '+92 321 4445566', 'Karachi', 'North Nazimabad, Karachi'),
(3, 'Rizwan Diesel Works', '+92 332 7778899', 'Faisalabad', 'Peoples Colony Road, Faisalabad'),
(4, 'Islamabad QuickFit Garage', '+92 311 2233445', 'Islamabad', 'I-8 Markaz, Islamabad'),
(5, 'Multan Highway Motors', '+92 306 5566778', 'Multan', 'Bosan Road, Multan'),
(6, 'Peshawar Charsadda Auto Care', '+92 333 8899001', 'Peshawar', 'University Road, Peshawar'),
(7, 'Rawalpindi Saddar Service Hub', '+92 345 1122334', 'Rawalpindi', 'Murree Road, Rawalpindi'),
(8, 'Gujranwala GT Road Workshop', '+92 321 9988776', 'Gujranwala', 'GT Road, Gujranwala'),
(9, 'Hyderabad Indus Motors Clinic', '+92 334 4455667', 'Hyderabad', 'Latifabad Unit 8, Hyderabad'),
(10, 'Sialkot Defence Workshop', '+92 300 6677889', 'Sialkot', 'Defence Road, Sialkot'),
(11, 'Quetta Baleli Service Point', '+92 322 3344556', 'Quetta', 'Baleli Road, Quetta'),
(12, 'Bahawalpur City Auto Works', '+92 302 7788990', 'Bahawalpur', 'Model Town A, Bahawalpur');

-- ---------------------------------------------------------------------------
-- Spare parts catalog (12) — PKR unit prices typical for Pakistan retail demo
-- ---------------------------------------------------------------------------
INSERT INTO spare_parts (part_id, part_name, brand, unit_price) VALUES
(1, 'Brake pad set (front)', 'Bosch', 8500.00),
(2, 'Engine oil filter', 'Kixx', 1250.00),
(3, 'Cabin air filter', 'Guard', 3300.00),
(4, 'Spark plug (each)', 'NGK', 480.00),
(5, 'Serpentine belt', 'Gates', 4950.00),
(6, 'Engine coolant (1 L pack)', 'Suzuki Genuine', 2150.00),
(7, 'Wiper blade set', 'Bosch', 3200.00),
(8, '12V automotive battery', 'Osaka', 19800.00),
(9, 'Clutch plate kit', 'Exedy', 14500.00),
(10, 'Timing belt kit', 'Gates', 11200.00),
(11, 'Front shock absorber (each)', 'KYB', 8800.00),
(12, 'AC gas R134a refill (labour+gas)', 'Local service', 4500.00);

-- ---------------------------------------------------------------------------
-- Mechanics (15) — distributed across centers (staffing / workload demos)
-- ---------------------------------------------------------------------------
INSERT INTO mechanics (mechanic_id, center_id, mechanic_name, specialization, certification_level) VALUES
(1, 1, 'Usman Tariq', 'Brakes & suspension', 'NTSC Grade A'),
(2, 1, 'Hassan Javed', 'Engine diagnostics', 'NTSC Grade B'),
(3, 2, 'Imran Ashraf', 'Electrical systems', 'NTSC Grade A'),
(4, 2, 'Maryam Siddiqui', 'Hybrid & EFI systems', 'NTSC Grade A'),
(5, 3, 'Rizwan Ahmed', 'General repair', 'NTSC Grade B'),
(6, 3, 'Talha Mahmood', 'Fleet maintenance', 'NTSC Grade B'),
(7, 4, 'Omar Farooq', 'Wheel alignment & balancing', 'NTSC Grade A'),
(8, 5, 'Bilal Hussain', 'AC & climate control', 'NTSC Grade B'),
(9, 6, 'Khalid Mehmood', 'Diesel injection', 'NTSC Grade A'),
(10, 7, 'Sanaullah Khan', 'Transmission overhaul', 'NTSC Grade B'),
(11, 8, 'Hamza Iqbal', 'Body & dent repair', 'NTSC Grade B'),
(12, 9, 'Tariq Jamil', 'General service', 'NTSC Grade B'),
(13, 10, 'Faisal Rehman', 'Electrical & wiring', 'NTSC Grade A'),
(14, 11, 'Nadeem Akhtar', 'Heavy vehicle brakes', 'NTSC Grade A'),
(15, 12, 'Noman Hafeez', 'General diagnostics', 'NTSC Grade B');
