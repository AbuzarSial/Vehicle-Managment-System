-- Additional indexes and constraints for performance and data integrity

USE vms_db;

-- Indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_requests_vehicle ON service_requests(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_requests_center ON service_requests(center_id);
CREATE INDEX IF NOT EXISTS idx_mechanics_center ON mechanics(center_id);
CREATE INDEX IF NOT EXISTS idx_inspections_mechanic ON inspections(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_inspection ON work_orders(inspection_id);

-- Fulltext or functional indexes could be added here later
