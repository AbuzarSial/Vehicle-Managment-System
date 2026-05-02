# EERD to Schema mapping

This document explains how entities and relationships in the EERD map to the SQL schema.

- One-to-many relationships (e.g., customer -> vehicles) are modeled with a foreign key on the child table (`vehicles.customer_id`)
- One-to-one relationships (inspection to service_request, work_order to inspection, bill to work_order) are enforced with a UNIQUE constraint on the FK column and a regular PK on the child table.
- Subtype (inheritance) for vehicles is modeled with separate tables `cars`, `motorcycles`, `trucks` that have PK = FK to `vehicles.vehicle_id` and ON DELETE CASCADE.
- Many-to-many relationships (work orders to mechanics, work orders to parts) are modeled with junction tables using composite PKs and FKs.
