-- Flight PNR Management Tables
CREATE TABLE IF NOT EXISTS flight_pnrs (
    id SERIAL PRIMARY KEY,
    pnr_code VARCHAR(10) NOT NULL UNIQUE,
    package_id INTEGER REFERENCES packages(id),
    airline VARCHAR(100) NOT NULL,
    total_pax INTEGER NOT NULL,
    filled_pax INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'booked', 'ticketed', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Flight Segments (for multi-city flights including transits)
CREATE TABLE IF NOT EXISTS flight_segments (
    id SERIAL PRIMARY KEY,
    pnr_id INTEGER REFERENCES flight_pnrs(id) ON DELETE CASCADE,
    segment_order INTEGER NOT NULL,
    flight_number VARCHAR(20) NOT NULL,
    departure_city VARCHAR(100) NOT NULL,
    departure_airport VARCHAR(10) NOT NULL,
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_city VARCHAR(100) NOT NULL,
    arrival_airport VARCHAR(10) NOT NULL,
    arrival_date DATE NOT NULL,
    arrival_time TIME NOT NULL,
    is_transit BOOLEAN DEFAULT FALSE,
    UNIQUE(pnr_id, segment_order)
);

-- PNR Payment Schedule
CREATE TABLE IF NOT EXISTS pnr_payment_schedule (
    id SERIAL PRIMARY KEY,
    pnr_id INTEGER REFERENCES flight_pnrs(id) ON DELETE CASCADE,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('deposit', 'installment', 'final')),
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PNR Jamaah Assignment
CREATE TABLE IF NOT EXISTS pnr_jamaah_assignments (
    id SERIAL PRIMARY KEY,
    pnr_id INTEGER REFERENCES flight_pnrs(id) ON DELETE CASCADE,
    jamaah_id INTEGER REFERENCES jamaah(id) ON DELETE CASCADE,
    seat_number VARCHAR(10),
    ticket_number VARCHAR(50),
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER REFERENCES users(id),
    UNIQUE(pnr_id, jamaah_id)
);

-- Create indexes for better performance
CREATE INDEX idx_flight_pnrs_package ON flight_pnrs(package_id);
CREATE INDEX idx_flight_pnrs_status ON flight_pnrs(status);
CREATE INDEX idx_flight_segments_pnr ON flight_segments(pnr_id);
CREATE INDEX idx_flight_segments_dates ON flight_segments(departure_date, arrival_date);
CREATE INDEX idx_pnr_payments_pnr ON pnr_payment_schedule(pnr_id);
CREATE INDEX idx_pnr_payments_status ON pnr_payment_schedule(payment_status);
CREATE INDEX idx_pnr_jamaah_pnr ON pnr_jamaah_assignments(pnr_id);
CREATE INDEX idx_pnr_jamaah_jamaah ON pnr_jamaah_assignments(jamaah_id);

-- View for PNR summary with payment status
CREATE OR REPLACE VIEW pnr_summary AS
SELECT 
    p.id,
    p.pnr_code,
    p.package_id,
    pk.name as package_name,
    pk.departure_date as package_departure,
    p.airline,
    p.total_pax,
    p.filled_pax,
    p.total_pax - p.filled_pax as remaining_pax,
    p.status,
    p.created_at,
    u.name as created_by_name,
    -- Payment summary
    COALESCE(SUM(ps.amount), 0) as total_amount,
    COALESCE(SUM(ps.paid_amount), 0) as total_paid,
    COALESCE(SUM(ps.amount) - SUM(ps.paid_amount), 0) as total_outstanding,
    -- Next payment info
    MIN(CASE WHEN ps.payment_status IN ('pending', 'partial') THEN ps.due_date END) as next_payment_date,
    MIN(CASE WHEN ps.payment_status IN ('pending', 'partial') THEN ps.amount - ps.paid_amount END) as next_payment_amount,
    -- Days until deadline
    MIN(CASE WHEN ps.payment_status IN ('pending', 'partial') THEN ps.due_date END) - CURRENT_DATE as days_until_payment
FROM flight_pnrs p
LEFT JOIN packages pk ON p.package_id = pk.id
LEFT JOIN users u ON p.created_by = u.id
LEFT JOIN pnr_payment_schedule ps ON p.id = ps.pnr_id
GROUP BY p.id, p.pnr_code, p.package_id, pk.name, pk.departure_date, p.airline, 
         p.total_pax, p.filled_pax, p.status, p.created_at, u.name;

-- View for flight route display
CREATE OR REPLACE VIEW flight_routes AS
SELECT 
    p.id as pnr_id,
    p.pnr_code,
    STRING_AGG(
        fs.departure_city || ' (' || fs.departure_airport || ') → ' || 
        fs.arrival_city || ' (' || fs.arrival_airport || ')',
        ' → ' ORDER BY fs.segment_order
    ) as route,
    MIN(fs.departure_date) as first_departure,
    MAX(fs.arrival_date) as last_arrival,
    COUNT(fs.id) as total_segments,
    SUM(CASE WHEN fs.is_transit THEN 1 ELSE 0 END) as transit_count
FROM flight_pnrs p
JOIN flight_segments fs ON p.id = fs.pnr_id
GROUP BY p.id, p.pnr_code;

-- Trigger to update PNR filled_pax count
CREATE OR REPLACE FUNCTION update_pnr_filled_pax()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE flight_pnrs 
        SET filled_pax = (
            SELECT COUNT(*) FROM pnr_jamaah_assignments WHERE pnr_id = NEW.pnr_id
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.pnr_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE flight_pnrs 
        SET filled_pax = (
            SELECT COUNT(*) FROM pnr_jamaah_assignments WHERE pnr_id = OLD.pnr_id
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.pnr_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pnr_filled_pax
AFTER INSERT OR DELETE ON pnr_jamaah_assignments
FOR EACH ROW
EXECUTE FUNCTION update_pnr_filled_pax();

-- Trigger to update payment status based on due date
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update overdue payments
    UPDATE pnr_payment_schedule
    SET payment_status = 'overdue'
    WHERE due_date < CURRENT_DATE 
    AND payment_status IN ('pending', 'partial')
    AND paid_amount < amount;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to update payment statuses daily (requires pg_cron extension)
-- This is a placeholder - actual implementation depends on your PostgreSQL setup
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('update-payment-status', '0 0 * * *', 'SELECT update_payment_status();');