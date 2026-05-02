# Data dictionary

Brief descriptions of tables and key columns.

- customers: customer_id (PK), customer_name, phone, email, created_at
- service_centers: center_id (PK), center_name, phone, city, address, created_at
- spare_parts: part_id (PK), part_name, brand, unit_price, created_at
- vehicles: vehicle_id (PK), customer_id (FK), registration_no (U), vin (U), make, model, model_year
- cars/motorcycles/trucks: subtype tables with PK = vehicle_id and FK -> vehicles(vehicle_id)
- mechanics: mechanic_id (PK), center_id (FK), mechanic_name, specialization, certification_level
- service_requests: request_id (PK), vehicle_id (FK), center_id (FK), request_date, request_type, problem_description, status
- inspections: inspection_id (PK), request_id (U FK), mechanic_id (FK), inspection_date, findings, result
- work_orders: work_order_id (PK), inspection_id (U FK), open_date, close_date, status
- service_center_inventory: (center_id, part_id) PK, quantity_on_hand, reorder_level
- work_order_mechanics: (work_order_id, mechanic_id) PK, hours_worked, labor_rate
- work_order_parts: (work_order_id, part_id) PK, quantity_used, sale_price_at_use
- bills: bill_id (PK), work_order_id (U FK), bill_date, total_amount, payment_status
