-- =====================================================
-- MANAJEMEN JAMAAH - DATABASE SCHEMA
-- Based on Business Flow Documentation
-- =====================================================

-- Create schemas
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS jamaah;
CREATE SCHEMA IF NOT EXISTS finance;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (already exists, ensure it has required fields)
CREATE TABLE IF NOT EXISTS core.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    roles TEXT[],
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Packages table
CREATE TABLE IF NOT EXISTS core.packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    quota INT NOT NULL DEFAULT 0,
    makkah_hotel VARCHAR(200),
    madinah_hotel VARCHAR(200),
    makkah_nights INT DEFAULT 0,
    madinah_nights INT DEFAULT 0,
    airline VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- JAMAAH SCHEMA
-- =====================================================

-- Main jamaah data table
CREATE TABLE IF NOT EXISTS jamaah.jamaah_data (
    id SERIAL PRIMARY KEY,
    
    -- Identity (NIK for WNI, Passport for WNA)
    nik VARCHAR(16) UNIQUE,
    passport_number VARCHAR(50) UNIQUE,
    
    -- Personal Information
    name VARCHAR(255) NOT NULL,
    birth_place VARCHAR(100),
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    
    -- Contact Information
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    phone VARCHAR(20) NOT NULL,
    phone_secondary VARCHAR(20),
    email VARCHAR(100),
    
    -- Emergency Contact
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    
    -- Age Category will be calculated via function/view
    age_category VARCHAR(20),
    
    -- Medical & Special Needs
    medical_flag BOOLEAN DEFAULT FALSE,
    medical_conditions TEXT,
    special_needs TEXT,
    additional_requests TEXT,
    
    -- Status Management
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'completed')),
    status_changed_at TIMESTAMP,
    status_changed_by INT REFERENCES core.users(id),
    status_notes TEXT,
    
    -- Metadata
    created_by INT REFERENCES core.users(id),
    updated_by INT REFERENCES core.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure either NIK or Passport is provided
    CONSTRAINT identity_check CHECK (
        (nik IS NOT NULL AND LENGTH(nik) = 16) OR 
        (passport_number IS NOT NULL AND LENGTH(passport_number) > 0)
    )
);

-- Create indexes for search optimization
CREATE INDEX idx_jamaah_phone ON jamaah.jamaah_data(phone);
CREATE INDEX idx_jamaah_phone_secondary ON jamaah.jamaah_data(phone_secondary);
CREATE INDEX idx_jamaah_name ON jamaah.jamaah_data(name);
CREATE INDEX idx_jamaah_nik ON jamaah.jamaah_data(nik);
CREATE INDEX idx_jamaah_passport ON jamaah.jamaah_data(passport_number);
CREATE INDEX idx_jamaah_status ON jamaah.jamaah_data(status);
CREATE INDEX idx_jamaah_age_category ON jamaah.jamaah_data(age_category);
CREATE INDEX idx_jamaah_medical_flag ON jamaah.jamaah_data(medical_flag);

-- Package registrations (jamaah can register to multiple packages)
CREATE TABLE IF NOT EXISTS jamaah.package_registrations (
    id SERIAL PRIMARY KEY,
    jamaah_id INT NOT NULL REFERENCES jamaah.jamaah_data(id) ON DELETE CASCADE,
    package_id INT NOT NULL REFERENCES core.packages(id),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registration_number VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_by INT REFERENCES core.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate registrations
    UNIQUE(jamaah_id, package_id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS jamaah.documents (
    id SERIAL PRIMARY KEY,
    jamaah_id INT NOT NULL REFERENCES jamaah.jamaah_data(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'ktp', 'passport', 'photo_4x6', 'birth_certificate', 
        'health_certificate', 'vaccination', 'other'
    )),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    expiry_date DATE, -- For passport
    uploaded_by INT REFERENCES core.users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    verified_by INT REFERENCES core.users(id),
    verified_at TIMESTAMP,
    notes TEXT
);

-- Create index for document expiry monitoring
CREATE INDEX idx_documents_expiry ON jamaah.documents(expiry_date) WHERE document_type = 'passport';

-- Audit trail for all changes
CREATE TABLE IF NOT EXISTS jamaah.audit_trail (
    id SERIAL PRIMARY KEY,
    jamaah_id INT NOT NULL REFERENCES jamaah.jamaah_data(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- create, update, status_change, delete
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    user_id INT REFERENCES core.users(id),
    user_ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs
CREATE TABLE IF NOT EXISTS core.activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES core.users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON core.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON core.packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jamaah_updated_at BEFORE UPDATE ON jamaah.jamaah_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate registration number
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TRIGGER AS $$
DECLARE
    new_number VARCHAR(50);
    year_part VARCHAR(4);
    month_part VARCHAR(2);
    seq_number INT;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    month_part := TO_CHAR(CURRENT_DATE, 'MM');
    
    -- Get next sequence number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(registration_number FROM 10 FOR 6) AS INT)), 0) + 1
    INTO seq_number
    FROM jamaah.package_registrations
    WHERE registration_number LIKE 'REG-' || year_part || month_part || '%';
    
    new_number := 'REG-' || year_part || month_part || LPAD(seq_number::TEXT, 6, '0');
    NEW.registration_number := new_number;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply registration number trigger
CREATE TRIGGER generate_registration_number_trigger
    BEFORE INSERT ON jamaah.package_registrations
    FOR EACH ROW
    WHEN (NEW.registration_number IS NULL)
    EXECUTE FUNCTION generate_registration_number();

-- Function to check package date overlap
CREATE OR REPLACE FUNCTION check_package_overlap(
    p_jamaah_id INT,
    p_package_id INT
) RETURNS TABLE(can_register BOOLEAN, reason TEXT) AS $$
DECLARE
    v_new_departure DATE;
    v_new_return DATE;
    v_overlap_count INT;
    v_conflict_package TEXT;
BEGIN
    -- Get new package dates
    SELECT departure_date, return_date INTO v_new_departure, v_new_return
    FROM core.packages WHERE id = p_package_id;
    
    -- Check for overlaps
    SELECT COUNT(*), MAX(p.name || ' (' || p.departure_date || ' to ' || p.return_date || ')')
    INTO v_overlap_count, v_conflict_package
    FROM jamaah.package_registrations pr
    JOIN core.packages p ON pr.package_id = p.id
    WHERE pr.jamaah_id = p_jamaah_id
    AND pr.status = 'active'
    AND (
        (v_new_departure BETWEEN p.departure_date AND p.return_date) OR
        (v_new_return BETWEEN p.departure_date AND p.return_date) OR
        (p.departure_date BETWEEN v_new_departure AND v_new_return)
    );
    
    IF v_overlap_count > 0 THEN
        RETURN QUERY SELECT FALSE, 'Date overlap with ' || v_conflict_package;
    ELSE
        RETURN QUERY SELECT TRUE, NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to audit changes
CREATE OR REPLACE FUNCTION audit_jamaah_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Audit each changed field
        IF OLD.name IS DISTINCT FROM NEW.name THEN
            INSERT INTO jamaah.audit_trail (jamaah_id, action, field_name, old_value, new_value, user_id)
            VALUES (NEW.id, 'update', 'name', OLD.name, NEW.name, NEW.updated_by);
        END IF;
        
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO jamaah.audit_trail (jamaah_id, action, field_name, old_value, new_value, reason, user_id)
            VALUES (NEW.id, 'status_change', 'status', OLD.status, NEW.status, NEW.status_notes, NEW.status_changed_by);
            
            NEW.status_changed_at = CURRENT_TIMESTAMP;
        END IF;
        
        -- Add more field audits as needed
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger
CREATE TRIGGER audit_jamaah_changes_trigger
    BEFORE UPDATE ON jamaah.jamaah_data
    FOR EACH ROW
    EXECUTE FUNCTION audit_jamaah_changes();

-- Function to calculate age category
CREATE OR REPLACE FUNCTION calculate_age_category(birth_date DATE)
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN CASE 
        WHEN EXTRACT(YEAR FROM AGE(birth_date)) < 2 THEN 'infant'
        WHEN EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 2 AND 11 THEN 'child'
        WHEN EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 12 AND 59 THEN 'adult'
        ELSE 'senior'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update age category
CREATE OR REPLACE FUNCTION update_age_category()
RETURNS TRIGGER AS $$
BEGIN
    NEW.age_category := calculate_age_category(NEW.birth_date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for age category
CREATE TRIGGER update_age_category_trigger
    BEFORE INSERT OR UPDATE OF birth_date ON jamaah.jamaah_data
    FOR EACH ROW
    EXECUTE FUNCTION update_age_category();

-- Function to auto-complete jamaah status
CREATE OR REPLACE FUNCTION auto_complete_jamaah_status()
RETURNS VOID AS $$
BEGIN
    UPDATE jamaah.jamaah_data jd
    SET status = 'completed',
        status_changed_at = CURRENT_TIMESTAMP,
        status_notes = 'Auto-completed by system'
    FROM jamaah.package_registrations pr
    JOIN core.packages p ON pr.package_id = p.id
    WHERE jd.id = pr.jamaah_id
    AND jd.status = 'active'
    AND p.return_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample packages
INSERT INTO core.packages (name, code, description, price, departure_date, return_date, quota, makkah_hotel, madinah_hotel, makkah_nights, madinah_nights, airline)
VALUES 
    ('Umroh Maret 2025', 'UMR-MAR-2025', 'Paket umroh reguler bulan Maret', 35000000, '2025-03-15', '2025-03-28', 150, 'Hilton Makkah', 'Sheraton Madinah', 7, 6, 'Garuda Indonesia'),
    ('Umroh Ramadhan 2025', 'UMR-RAM-2025', 'Paket umroh spesial Ramadhan', 45000000, '2025-04-01', '2025-04-15', 100, 'Swissotel Makkah', 'Movenpick Madinah', 8, 6, 'Saudi Airlines'),
    ('Umroh Plus Turki 2025', 'UMR-TUR-2025', 'Paket umroh plus wisata Turki', 55000000, '2025-05-10', '2025-05-25', 80, 'Fairmont Makkah', 'InterContinental Madinah', 6, 5, 'Turkish Airlines')
ON CONFLICT (code) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA core TO platform_admin;
GRANT ALL PRIVILEGES ON SCHEMA jamaah TO platform_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA core TO platform_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA jamaah TO platform_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA core TO platform_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA jamaah TO platform_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA jamaah TO platform_admin;