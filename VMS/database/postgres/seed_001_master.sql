-- Pakistan demo seed — master (same data as database/seed/001_seed_master_data.sql)
INSERT INTO service_centers (center_id, center_name, phone, city, address) VALUES
(1, 'Lahore Motor Clinic', '+92 300 1112233', 'Lahore', 'Johar Town, Lahore'),
(2, 'Karachi Auto Point', '+92 321 4445566', 'Karachi', 'North Nazimabad, Karachi'),
(3, 'Rizwan Diesel Works', '+92 332 7778899', 'Faisalabad', 'Peoples Colony, Faisalabad');

INSERT INTO spare_parts (part_id, part_name, brand, unit_price) VALUES
(1, 'Brake pad set (front)', 'Bosch', 8200.00),
(2, 'Engine oil filter', 'Kixx', 1200.00),
(3, 'Cabin air filter', 'Guard', 3200.00),
(4, 'Spark plug (each)', 'NGK', 450.00),
(5, 'Serpentine belt', 'Gates', 4800.00),
(6, 'Engine coolant (1 L pack)', 'Suzuki Genuine', 2100.00),
(7, 'Wiper blade set', 'Bosch', 3100.00),
(8, '12V automotive battery', 'Osaka', 19500.00);

INSERT INTO mechanics (mechanic_id, center_id, mechanic_name, specialization, certification_level) VALUES
(1, 1, 'Usman Tariq', 'Brakes & suspension', 'NTSC Grade A'),
(2, 1, 'Hassan Javed', 'Engine diagnostics', 'NTSC Grade B'),
(3, 2, 'Imran Ashraf', 'Electrical systems', 'NTSC Grade A'),
(4, 2, 'Maryam Ahmed', 'Hybrid & EFI systems', 'NTSC Grade A'),
(5, 3, 'Rizwan Ahmed', 'General repair', 'NTSC Grade B'),
(6, 3, 'Talha Mahmood', 'Fleet maintenance', 'NTSC Grade B');
