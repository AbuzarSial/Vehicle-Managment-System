USE vms_db;

-- Inventory summary per center
SELECT sc.center_id, sc.center_name, sp.part_id, sp.part_name, sci.quantity_on_hand
FROM service_center_inventory sci
JOIN spare_parts sp ON sp.part_id = sci.part_id
JOIN service_centers sc ON sc.center_id = sci.center_id;
