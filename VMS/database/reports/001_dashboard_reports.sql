USE vms_db;

-- Example: total open requests per center
SELECT sc.center_id, sc.center_name, COUNT(sr.request_id) AS open_requests
FROM service_centers sc
LEFT JOIN service_requests sr ON sr.center_id = sc.center_id AND sr.status = 'open'
GROUP BY sc.center_id, sc.center_name;
