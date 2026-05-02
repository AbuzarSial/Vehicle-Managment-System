USE vms_db;

-- Seed service_centers
INSERT INTO service_centers (center_name, phone, city, address) VALUES
('Downtown Auto Service', '+1-555-0100', 'Metropolis', '123 Main St'),
('Uptown Motors', '+1-555-0101', 'Metropolis', '456 Elm St');

-- Seed spare_parts
INSERT INTO spare_parts (part_name, brand, unit_price) VALUES
('Brake Pad', 'Acme', 25.50),
('Oil Filter', 'FilterCo', 7.20),
('Spark Plug', 'Ignite', 4.75);
