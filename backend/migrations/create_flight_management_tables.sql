-- Flight Management System Tables
-- Created: 2025-07-31

-- Drop existing tables if needed (be careful in production!)
-- DROP TABLE IF EXISTS pnr_payments CASCADE;
-- DROP TABLE IF EXISTS package_pnr CASCADE;
-- DROP TABLE IF EXISTS flight_pnr CASCADE;

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS flight;

-- Table: flight_pnr (Master PNR data)
CREATE TABLE IF NOT EXISTS flight.pnr (
    id SERIAL PRIMARY KEY,
    pnr_code VARCHAR(20) UNIQUE NOT NULL,
    airline VARCHAR(100) NOT NULL,
    airline_code VARCHAR(10),
    departure_city VARCHAR(100) NOT NULL,
    arrival_city VARCHAR(100) NOT NULL,
    departure_date DATE NOT NULL,
    departure_time TIME,
    arrival_time TIME,
    return_date DATE,
    return_departure_time TIME,
    return_arrival_time TIME,
    flight_number VARCHAR(50),
    return_flight_number VARCHAR(50),
    total_seats INTEGER NOT NULL DEFAULT 0,
    used_seats INTEGER NOT NULL DEFAULT 0,
    price_per_seat DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, partial_paid, paid, cancelled
    booking_date DATE,
    payment_due_date DATE,
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_seats CHECK (used_seats <= total_seats),
    CONSTRAINT check_payment CHECK (paid_amount <= total_price)
);

-- Table: package_pnr (Relationship between packages and PNR)
CREATE TABLE IF NOT EXISTS flight.package_pnr (
    id SERIAL PRIMARY KEY,
    package_id INTEGER NOT NULL,
    pnr_id INTEGER NOT NULL REFERENCES flight.pnr(id) ON DELETE CASCADE,
    seats_allocated INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    assigned_by INTEGER,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_package FOREIGN KEY (package_id) REFERENCES core.packages(id),
    CONSTRAINT unique_package_pnr UNIQUE (package_id, pnr_id)
);

-- Table: pnr_payments (Payment history for PNR)
CREATE TABLE IF NOT EXISTS flight.pnr_payments (
    id SERIAL PRIMARY KEY,
    pnr_id INTEGER NOT NULL REFERENCES flight.pnr(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- transfer, cash, credit_card, etc
    payment_reference VARCHAR(100),
    payment_proof TEXT, -- Base64 or URL
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_name VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'verified', -- pending, verified, rejected
    verified_by INTEGER,
    verified_at TIMESTAMP,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_pnr_status ON flight.pnr(status);
CREATE INDEX idx_pnr_departure_date ON flight.pnr(departure_date);
CREATE INDEX idx_pnr_airline ON flight.pnr(airline);
CREATE INDEX idx_package_pnr_package ON flight.package_pnr(package_id);
CREATE INDEX idx_pnr_payments_pnr ON flight.pnr_payments(pnr_id);
CREATE INDEX idx_pnr_payments_date ON flight.pnr_payments(payment_date);

-- Create trigger to update PNR status based on payments
CREATE OR REPLACE FUNCTION update_pnr_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate total paid amount for the PNR
    UPDATE flight.pnr 
    SET 
        paid_amount = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM flight.pnr_payments 
            WHERE pnr_id = NEW.pnr_id 
            AND status = 'verified'
        ),
        status = CASE 
            WHEN (
                SELECT COALESCE(SUM(amount), 0) 
                FROM flight.pnr_payments 
                WHERE pnr_id = NEW.pnr_id 
                AND status = 'verified'
            ) >= total_price THEN 'paid'
            WHEN (
                SELECT COALESCE(SUM(amount), 0) 
                FROM flight.pnr_payments 
                WHERE pnr_id = NEW.pnr_id 
                AND status = 'verified'
            ) > 0 THEN 'partial_paid'
            ELSE 'pending'
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.pnr_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment inserts and updates
CREATE TRIGGER trigger_update_pnr_payment_status
AFTER INSERT OR UPDATE OF amount, status ON flight.pnr_payments
FOR EACH ROW
EXECUTE FUNCTION update_pnr_payment_status();

-- Create trigger to update PNR used_seats when package assignment changes
CREATE OR REPLACE FUNCTION update_pnr_used_seats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update used_seats for the PNR
    UPDATE flight.pnr 
    SET 
        used_seats = (
            SELECT COALESCE(SUM(seats_allocated), 0) 
            FROM flight.package_pnr 
            WHERE pnr_id = COALESCE(NEW.pnr_id, OLD.pnr_id)
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.pnr_id, OLD.pnr_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for package_pnr changes
CREATE TRIGGER trigger_update_pnr_used_seats
AFTER INSERT OR UPDATE OR DELETE ON flight.package_pnr
FOR EACH ROW
EXECUTE FUNCTION update_pnr_used_seats();

-- Create view for packages without PNR
CREATE OR REPLACE VIEW flight.packages_without_pnr AS
SELECT 
    p.id,
    p.code,
    p.name,
    p.departure_date,
    p.return_date,
    p.departure_city,
    p.arrival_city,
    p.airline,
    p.quota,
    p.departure_flight_number,
    p.return_flight_number,
    CASE 
        WHEN p.departure_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'urgent'
        WHEN p.departure_date <= CURRENT_DATE + INTERVAL '60 days' THEN 'soon'
        ELSE 'normal'
    END as urgency
FROM core.packages p
LEFT JOIN flight.package_pnr pp ON p.id = pp.package_id
WHERE pp.id IS NULL
AND p.status = 'active'
AND p.departure_date > CURRENT_DATE
ORDER BY p.departure_date ASC;

-- Create view for PNR summary
CREATE OR REPLACE VIEW flight.pnr_summary AS
SELECT 
    p.*,
    COALESCE(p.total_seats - p.used_seats, 0) as available_seats,
    CASE 
        WHEN p.paid_amount >= p.total_price THEN 'Lunas'
        WHEN p.paid_amount > 0 THEN 'Partial (' || ROUND((p.paid_amount / p.total_price * 100)::numeric, 0) || '%)'
        ELSE 'Belum Bayar'
    END as payment_status,
    CASE 
        WHEN p.departure_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'very_urgent'
        WHEN p.departure_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'urgent'
        ELSE 'normal'
    END as urgency,
    COUNT(DISTINCT pp.package_id) as total_packages,
    STRING_AGG(DISTINCT pkg.name, ', ' ORDER BY pkg.name) as package_names
FROM flight.pnr p
LEFT JOIN flight.package_pnr pp ON p.id = pp.pnr_id
LEFT JOIN core.packages pkg ON pp.package_id = pkg.id
GROUP BY p.id;

-- Grant permissions (adjust based on your user setup)
-- GRANT ALL ON SCHEMA flight TO umroh_user;
-- GRANT ALL ON ALL TABLES IN SCHEMA flight TO umroh_user;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA flight TO umroh_user;

-- Insert sample data for testing (optional)
/*
INSERT INTO flight.pnr (pnr_code, airline, airline_code, departure_city, arrival_city, departure_date, return_date, total_seats, price_per_seat, total_price, status)
VALUES 
    ('ABC123', 'Garuda Indonesia', 'GA', 'Jakarta', 'Jeddah', '2025-08-15', '2025-08-25', 50, 8000000, 400000000, 'pending'),
    ('XYZ789', 'Saudi Airlines', 'SV', 'Jakarta', 'Madinah', '2025-09-01', '2025-09-10', 40, 7500000, 300000000, 'pending');
*/