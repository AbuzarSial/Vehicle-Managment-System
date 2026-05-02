USE vms_db;

-- service requests
INSERT INTO service_requests (vehicle_id, center_id, request_date, request_type, problem_description, status) VALUES
(1, 1, '2026-04-01', 'maintenance', 'Brake noise', 'open'),
(2, 2, '2026-04-02', 'repair', 'Engine stall', 'open');

-- inspections (link to requests)
INSERT INTO inspections (request_id, mechanic_id, inspection_date, findings, result) VALUES
(1, NULL, '2026-04-03', 'Brake pads worn', 'repair_needed'),
(2, NULL, '2026-04-04', 'Fuel system issue', 'repair_needed');
