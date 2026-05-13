-- =============================================================================
-- 003_seed_requests_inspections.sql — service_requests + inspections
-- =============================================================================
-- Prerequisites: 001, 002
-- Mix of statuses; not every request has an inspection (open pipeline demo).
-- Localized sample descriptions: Pakistan context (demo only).
-- =============================================================================

USE vms_db;

-- ---------------------------------------------------------------------------
-- Service requests (10) — varied workflow states for dashboards / CRUD
-- ---------------------------------------------------------------------------
INSERT INTO service_requests (
  request_id, vehicle_id, center_id, request_date, request_type,
  problem_description, status
) VALUES
(1, 1, 1, '2026-03-12', 'maintenance', 'Grinding noise under light braking; vibration on M-2 motorway.', 'completed'),
(2, 3, 1, '2026-03-18', 'repair', 'Check engine light; rough idle after cold start in winter.', 'completed'),
(3, 6, 3, '2026-04-02', 'diagnostic', 'Battery warning on dash; remote lock intermittent.', 'in_progress'),
(4, 2, 2, '2026-04-05', 'repair', 'Clutch slipping on hill starts (Murree Road route).', 'in_progress'),
(5, 8, 3, '2026-04-22', 'inspection', 'Pre-road-trip inspection before Eid holiday travel.', 'open'),
(6, 5, 2, '2026-04-24', 'repair', 'AC weak on passenger side; possible blend door.', 'open'),
(7, 4, 2, '2026-03-28', 'repair', 'Oil leak near drain bolt; chain slack noisy.', 'completed'),
(8, 7, 3, '2026-04-10', 'maintenance', 'Annual service + brake fluid flush (Honda CD 70).', 'cancelled'),
(9, 1, 2, '2026-03-30', 'maintenance', 'Rotate tyres + replace cabin filter.', 'completed'),
(10, 8, 1, '2026-04-15', 'repair', 'Rear wiper motor intermittent during monsoon.', 'in_progress');

-- ---------------------------------------------------------------------------
-- Inspections (7) — one-to-one with selected requests (request_id UNIQUE)
-- Requests 5, 6, 8 intentionally have no inspection row yet / cancelled.
-- ---------------------------------------------------------------------------
INSERT INTO inspections (
  inspection_id, request_id, mechanic_id, inspection_date, findings, result
) VALUES
(1, 1, 1, '2026-03-13', 'Front pads below 3 mm; rotors scored lightly.', 'repair_needed'),
(2, 2, 2, '2026-03-19', 'O2 sensor slow response; exhaust manifold gasket seeping.', 'repair_needed'),
(3, 3, 5, '2026-04-03', '12V battery failing load test; terminals corroded.', 'repair_needed'),
(4, 4, 3, '2026-04-06', 'Transmission fluid dark; clutch hydraulic reservoir low.', 'repair_needed'),
(5, 7, 4, '2026-03-29', 'Drain bolt gasket distorted; drive chain within spec.', 'repair_needed'),
(6, 9, 3, '2026-03-31', 'Tyres wear even; cabin filter obstructed with debris.', 'passed'),
(7, 10, 1, '2026-04-16', 'Rear wiper assembly draws high current; harness connector loose.', 'repair_needed');
