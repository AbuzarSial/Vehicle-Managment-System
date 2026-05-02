USE vms_db;

-- customers
INSERT INTO customers (customer_name, phone, email) VALUES
('John Doe', '+1-555-1000', 'john.doe@example.com'),
('Jane Smith', '+1-555-1001', 'jane.smith@example.com');

-- vehicles
INSERT INTO vehicles (customer_id, registration_no, vin, make, model, model_year) VALUES
(1, 'ABC-123', '1HGBH41JXMN109186', 'Toyota', 'Corolla', 2010),
(2, 'XYZ-789', '2HGDH51JXMN109999', 'Honda', 'Civic', 2018);

-- vehicle subtypes: first vehicle is a car, second is a motorcycle
INSERT INTO cars (vehicle_id, number_of_doors, body_type) VALUES (1, 4, 'sedan');
INSERT INTO motorcycles (vehicle_id, engine_cc, bike_type) VALUES (2, 250, 'standard');
