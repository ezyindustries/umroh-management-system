-- Create modular schemas for better organization and performance
BEGIN;

-- Create schemas if not exists
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS jamaah;
CREATE SCHEMA IF NOT EXISTS payment;
CREATE SCHEMA IF NOT EXISTS flight;
CREATE SCHEMA IF NOT EXISTS hotel;
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS reports;

-- Move existing tables to appropriate schemas
-- Core schema (shared data)
ALTER TABLE IF EXISTS users SET SCHEMA core;
ALTER TABLE IF EXISTS roles SET SCHEMA core;
ALTER TABLE IF EXISTS user_roles SET SCHEMA core;
ALTER TABLE IF EXISTS packages SET SCHEMA core;
ALTER TABLE IF EXISTS activity_logs SET SCHEMA core;
ALTER TABLE IF EXISTS settings SET SCHEMA core;

-- Jamaah schema
ALTER TABLE IF EXISTS jamaah SET SCHEMA jamaah;
ALTER TABLE IF EXISTS documents SET SCHEMA jamaah;
ALTER TABLE IF EXISTS family_relations SET SCHEMA jamaah;
ALTER TABLE IF EXISTS medical_records SET SCHEMA jamaah;

-- Rename jamaah table for clarity
ALTER TABLE IF EXISTS jamaah.jamaah RENAME TO jamaah_data;

-- Payment schema
ALTER TABLE IF EXISTS payments SET SCHEMA payment;
ALTER TABLE IF EXISTS payment_schedules SET SCHEMA payment;
ALTER TABLE IF EXISTS payment_methods SET SCHEMA payment;

-- Flight schema
ALTER TABLE IF EXISTS flight_pnrs SET SCHEMA flight;
ALTER TABLE IF EXISTS flight_segments SET SCHEMA flight;
ALTER TABLE IF EXISTS pnr_jamaah_assignments SET SCHEMA flight;
ALTER TABLE IF EXISTS pnr_payment_schedule SET SCHEMA flight;

-- Hotel schema
ALTER TABLE IF EXISTS hotels SET SCHEMA hotel;
ALTER TABLE IF EXISTS hotel_rooms SET SCHEMA hotel;
ALTER TABLE IF EXISTS room_assignments SET SCHEMA hotel;
ALTER TABLE IF EXISTS room_types SET SCHEMA hotel;

-- Inventory schema
ALTER TABLE IF EXISTS inventory_items SET SCHEMA inventory;
ALTER TABLE IF EXISTS inventory_categories SET SCHEMA inventory;
ALTER TABLE IF EXISTS inventory_transactions SET SCHEMA inventory;
ALTER TABLE IF EXISTS jamaah_equipment_distribution SET SCHEMA inventory;

-- Create cross-schema views for reports
CREATE OR REPLACE VIEW reports.jamaah_complete AS
SELECT 
    j.id,
    j.nik,
    j.name,
    j.passport_number,
    j.phone,
    j.address,
    j.birth_date,
    j.gender,
    p.name as package_name,
    p.departure_date,
    p.return_date,
    COALESCE(py.total_paid, 0) as total_paid,
    COALESCE(py.total_amount, 0) as total_amount,
    j.status,
    j.created_at
FROM jamaah.jamaah_data j
LEFT JOIN core.packages p ON j.package_id = p.id
LEFT JOIN (
    SELECT 
        jamaah_id,
        SUM(amount) as total_paid,
        MAX(total_amount) as total_amount
    FROM payment.payments
    WHERE status = 'completed'
    GROUP BY jamaah_id
) py ON py.jamaah_id = j.id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jamaah_package ON jamaah.jamaah_data(package_id);
CREATE INDEX IF NOT EXISTS idx_jamaah_status ON jamaah.jamaah_data(status);
CREATE INDEX IF NOT EXISTS idx_jamaah_nik ON jamaah.jamaah_data(nik);
CREATE INDEX IF NOT EXISTS idx_payment_jamaah ON payment.payments(jamaah_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment.payments(status);

-- Grant permissions (adjust based on your user setup)
GRANT USAGE ON SCHEMA core, jamaah, payment, flight, hotel, inventory, reports TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA core TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA jamaah TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA payment TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA flight TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA hotel TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA inventory TO app_user;
GRANT SELECT ON ALL TABLES IN SCHEMA reports TO app_user;

-- Create audit log table if not exists
CREATE TABLE IF NOT EXISTS core.audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES core.users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for audit logs
CREATE INDEX idx_audit_user ON core.audit_logs(user_id);
CREATE INDEX idx_audit_entity ON core.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON core.audit_logs(created_at);

-- Add comment for documentation
COMMENT ON SCHEMA core IS 'Core shared data: users, roles, packages, settings';
COMMENT ON SCHEMA jamaah IS 'Jamaah management: personal data, documents, relations';
COMMENT ON SCHEMA payment IS 'Payment management: transactions, schedules, methods';
COMMENT ON SCHEMA flight IS 'Flight management: PNRs, segments, seat assignments';
COMMENT ON SCHEMA hotel IS 'Hotel management: rooms, assignments, facilities';
COMMENT ON SCHEMA inventory IS 'Inventory management: items, transactions, distribution';
COMMENT ON SCHEMA reports IS 'Reporting views and aggregated data';

COMMIT;