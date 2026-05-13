-- =============================================================================
-- 003_seed_requests_inspections.sql — service_requests + inspections
-- =============================================================================
-- Prerequisites: 001, 002
-- Exactly one inspection per request_id where an inspection row exists (UNIQUE).
-- Requests 5, 6, 15: no inspection row yet (open intake / quote pending for viva).
-- Localized problem text: Pakistan roads / climate (fictional).
-- =============================================================================

USE vms_db;

-- ---------------------------------------------------------------------------
-- Service requests (15) — vehicles 1–15, centers 1–12 mixed
-- ---------------------------------------------------------------------------
INSERT INTO service_requests (
  request_id, vehicle_id, center_id, request_date, request_type,
  problem_description, status
) VALUES
(1, 1, 1, '2026-03-12', 'maintenance', 'Grinding under light braking on M-2 motorway near Sheikhupura.', 'completed'),
(2, 3, 1, '2026-03-18', 'repair', 'Check engine light; rough idle after cold start (Lahore winter fog).', 'completed'),
(3, 6, 3, '2026-04-02', 'diagnostic', 'Battery warning lamp; remote central lock intermittent.', 'in_progress'),
(4, 2, 2, '2026-04-05', 'repair', 'Clutch slipping on hill starts toward Murree Expressway.', 'in_progress'),
(5, 8, 3, '2026-04-22', 'inspection', 'Pre-Eid long route inspection Multan to Rahim Yar Khan.', 'open'),
(6, 5, 5, '2026-04-24', 'repair', 'AC weak on passenger side; suspected blend door in 45°C heat.', 'open'),
(7, 4, 2, '2026-03-28', 'repair', 'Oil weep near drain bolt; drive chain slack noise (city traffic).', 'completed'),
(8, 7, 6, '2026-04-10', 'maintenance', 'Annual service + brake fluid flush (Honda CD 70 daily commuter).', 'cancelled'),
(9, 1, 2, '2026-03-30', 'maintenance', 'Tyre rotation + cabin filter replacement before Ramazan travel.', 'completed'),
(10, 11, 4, '2026-04-15', 'repair', 'Rear wiper motor stalls during monsoon drizzle in Islamabad.', 'in_progress'),
(11, 9, 7, '2026-04-01', 'repair', 'Turbo whistle under load GT Road run Rawalpindi segment.', 'completed'),
(12, 10, 8, '2026-04-03', 'maintenance', 'Scheduled 10k km service Suzuki Swift.', 'completed'),
(13, 12, 9, '2026-04-08', 'diagnostic', 'EPS warning after pothole on Hyderabad bypass.', 'completed'),
(14, 14, 10, '2026-04-11', 'repair', 'Load bed vibration empty vs laden (commercial route).', 'completed'),
(15, 13, 11, '2026-04-25', 'inspection', 'Pre-purchase inspection for family SUV (quoted pending).', 'open');

-- ---------------------------------------------------------------------------
-- Inspections (12) — one row per request_id; requests 5, 6, 15 have no row yet
-- ---------------------------------------------------------------------------
INSERT INTO inspections (
  inspection_id, request_id, mechanic_id, inspection_date, findings, result
) VALUES
(1, 1, 1, '2026-03-13', 'Front pads below 3 mm; rotors lightly scored.', 'repair_needed'),
(2, 2, 2, '2026-03-19', 'O2 sensor slow; exhaust manifold gasket seep.', 'repair_needed'),
(3, 3, 5, '2026-04-03', '12V battery fails load test; terminals corroded.', 'repair_needed'),
(4, 4, 3, '2026-04-06', 'Clutch hydraulic reservoir low; fluid dark.', 'repair_needed'),
(5, 7, 4, '2026-03-29', 'Drain bolt gasket distorted; chain slack within spec.', 'repair_needed'),
(6, 9, 3, '2026-03-31', 'Tyre wear even; cabin filter heavily clogged.', 'passed'),
(7, 10, 7, '2026-04-16', 'Rear wiper motor high draw; connector loose at tailgate.', 'repair_needed'),
(8, 11, 10, '2026-04-02', 'Intercooler hose clamp loose; boost leak minor.', 'repair_needed'),
(9, 12, 11, '2026-04-04', 'Engine oil at lower mark; plugs within service interval.', 'passed'),
(10, 13, 12, '2026-04-09', 'Steering rack boot torn LH; EPS torque sensor within range.', 'repair_needed'),
(11, 14, 13, '2026-04-12', 'Rear leaf spring U-bolt torque low; shackle bush worn.', 'repair_needed'),
(12, 8, 9, '2026-04-11', 'Customer cancelled before lift — no work performed.', 'passed');
