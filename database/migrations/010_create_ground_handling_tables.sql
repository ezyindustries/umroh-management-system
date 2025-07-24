-- Ground Handling Tables for Umroh Management System

-- Main ground handling records
CREATE TABLE IF NOT EXISTS ground_handling (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    
    -- Flight Details
    flight_code VARCHAR(20) NOT NULL,
    airline VARCHAR(100) NOT NULL,
    route VARCHAR(200) NOT NULL, -- e.g., "CGK-JED" or "JED-MED"
    terminal VARCHAR(20),
    departure_datetime TIMESTAMP NOT NULL,
    arrival_datetime TIMESTAMP NOT NULL,
    
    -- PIC (Person In Charge)
    pic_team VARCHAR(200),
    pic_phone VARCHAR(20),
    
    -- Counts
    total_pax INTEGER DEFAULT 0,
    total_baggage INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'preparing', 'in_progress', 'completed', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    
    INDEX idx_departure_date (departure_datetime),
    INDEX idx_status (status),
    INDEX idx_package_group (package_id, group_id)
);

-- Lounge reservations
CREATE TABLE IF NOT EXISTS ground_handling_lounges (
    id SERIAL PRIMARY KEY,
    ground_handling_id INTEGER NOT NULL REFERENCES ground_handling(id) ON DELETE CASCADE,
    lounge_type VARCHAR(50) CHECK (lounge_type IN ('departure', 'arrival', 'transit')),
    lounge_name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    booking_reference VARCHAR(50),
    pax_count INTEGER DEFAULT 0,
    booking_time TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ground_handling (ground_handling_id)
);

-- Hotel reservations for transit
CREATE TABLE IF NOT EXISTS ground_handling_hotels (
    id SERIAL PRIMARY KEY,
    ground_handling_id INTEGER NOT NULL REFERENCES ground_handling(id) ON DELETE CASCADE,
    hotel_name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    booking_reference VARCHAR(50),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    room_count INTEGER DEFAULT 0,
    pax_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ground_handling (ground_handling_id)
);

-- Meal box orders
CREATE TABLE IF NOT EXISTS ground_handling_meals (
    id SERIAL PRIMARY KEY,
    ground_handling_id INTEGER NOT NULL REFERENCES ground_handling(id) ON DELETE CASCADE,
    meal_type VARCHAR(50) CHECK (meal_type IN ('nasibox', 'rotibox', 'snackbox', 'other')),
    meal_time VARCHAR(50) CHECK (meal_time IN ('departure', 'arrival', 'transit')),
    quantity INTEGER NOT NULL,
    vendor_name VARCHAR(100),
    delivery_time TIMESTAMP,
    price_per_unit DECIMAL(10,2),
    total_price DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ground_handling (ground_handling_id)
);

-- Schedule mapping
CREATE TABLE IF NOT EXISTS ground_handling_schedules (
    id SERIAL PRIMARY KEY,
    ground_handling_id INTEGER NOT NULL REFERENCES ground_handling(id) ON DELETE CASCADE,
    schedule_type VARCHAR(50) NOT NULL CHECK (schedule_type IN ('tikum', 'boarding', 'takeoff', 'arrival', 'immigration', 'baggage_claim', 'hotel_checkin', 'domestic_departure')),
    scheduled_time TIMESTAMP NOT NULL,
    location VARCHAR(200),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'delayed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ground_handling (ground_handling_id),
    INDEX idx_schedule_time (scheduled_time)
);

-- Special requests
CREATE TABLE IF NOT EXISTS ground_handling_requests (
    id SERIAL PRIMARY KEY,
    ground_handling_id INTEGER NOT NULL REFERENCES ground_handling(id) ON DELETE CASCADE,
    jamaah_id INTEGER REFERENCES jamaah(id) ON DELETE SET NULL,
    request_type VARCHAR(50) CHECK (request_type IN ('wheelchair', 'window_seat', 'aisle_seat', 'special_meal', 'medical_assistance', 'miles_membership', 'other')),
    request_details TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ground_handling (ground_handling_id),
    INDEX idx_jamaah (jamaah_id)
);

-- Equipment preparation checklist
CREATE TABLE IF NOT EXISTS ground_handling_equipment (
    id SERIAL PRIMARY KEY,
    ground_handling_id INTEGER NOT NULL REFERENCES ground_handling(id) ON DELETE CASCADE,
    equipment_type VARCHAR(100) NOT NULL,
    quantity INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'prepared', 'distributed', 'returned')),
    responsible_person VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ground_handling (ground_handling_id)
);

-- Additional services (mobil box, bus, etc)
CREATE TABLE IF NOT EXISTS ground_handling_services (
    id SERIAL PRIMARY KEY,
    ground_handling_id INTEGER NOT NULL REFERENCES ground_handling(id) ON DELETE CASCADE,
    service_type VARCHAR(50) CHECK (service_type IN ('mobil_box', 'bus', 'porter', 'translator', 'medical_team', 'other')),
    vendor_name VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    booking_reference VARCHAR(50),
    service_datetime TIMESTAMP,
    price DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ground_handling (ground_handling_id)
);

-- Document uploads
CREATE TABLE IF NOT EXISTS ground_handling_documents (
    id SERIAL PRIMARY KEY,
    ground_handling_id INTEGER NOT NULL REFERENCES ground_handling(id) ON DELETE CASCADE,
    document_type VARCHAR(50) CHECK (document_type IN ('ticket', 'block_seat', 'manifest', 'invoice', 'other')),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ground_handling (ground_handling_id)
);

-- Domestic flight connections
CREATE TABLE IF NOT EXISTS ground_handling_domestic (
    id SERIAL PRIMARY KEY,
    ground_handling_id INTEGER NOT NULL REFERENCES ground_handling(id) ON DELETE CASCADE,
    domestic_flight_code VARCHAR(20),
    airline VARCHAR(100),
    route VARCHAR(100), -- e.g., "CGK-SUB"
    departure_datetime TIMESTAMP,
    arrival_datetime TIMESTAMP,
    pax_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ground_handling (ground_handling_id)
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_ground_handling_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ground_handling_timestamp
BEFORE UPDATE ON ground_handling
FOR EACH ROW EXECUTE FUNCTION update_ground_handling_timestamp();

-- View for upcoming ground handling tasks
CREATE OR REPLACE VIEW ground_handling_upcoming AS
SELECT 
    gh.*,
    p.name as package_name,
    g.name as group_name,
    EXTRACT(DAY FROM (gh.departure_datetime - CURRENT_TIMESTAMP)) as days_until_departure,
    CASE 
        WHEN gh.departure_datetime < CURRENT_TIMESTAMP THEN 'past'
        WHEN gh.departure_datetime <= CURRENT_TIMESTAMP + INTERVAL '3 days' THEN 'urgent'
        WHEN gh.departure_datetime <= CURRENT_TIMESTAMP + INTERVAL '7 days' THEN 'soon'
        ELSE 'upcoming'
    END as urgency_level
FROM ground_handling gh
LEFT JOIN packages p ON gh.package_id = p.id
LEFT JOIN groups g ON gh.group_id = g.id
WHERE gh.status != 'completed'
ORDER BY gh.departure_datetime ASC;