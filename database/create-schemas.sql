-- Create schemas for modular organization
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS jamaah;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS operations;

-- Core: Users table
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

-- Core: Packages table
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

-- Jamaah: Main data table
CREATE TABLE IF NOT EXISTS jamaah.jamaah_data (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE,
    nik VARCHAR(16) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    birth_place VARCHAR(100),
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'L', 'P')),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    passport_number VARCHAR(20) UNIQUE,
    passport_issued_date DATE,
    passport_expired_date DATE,
    marital_status VARCHAR(20),
    education VARCHAR(50),
    occupation VARCHAR(100),
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    package_id INT REFERENCES core.packages(id),
    mahram_id INT REFERENCES jamaah.jamaah_data(id),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_by INT REFERENCES core.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_jamaah_nik ON jamaah.jamaah_data(nik);
CREATE INDEX idx_jamaah_passport ON jamaah.jamaah_data(passport_number);
CREATE INDEX idx_jamaah_package ON jamaah.jamaah_data(package_id);
CREATE INDEX idx_jamaah_status ON jamaah.jamaah_data(status);

-- Jamaah: Documents table
CREATE TABLE IF NOT EXISTS jamaah.documents (
    id SERIAL PRIMARY KEY,
    jamaah_id INT NOT NULL REFERENCES jamaah.jamaah_data(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_by INT REFERENCES core.users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    verified_by INT REFERENCES core.users(id),
    verified_at TIMESTAMP,
    notes TEXT
);

-- Jamaah: Family relations
CREATE TABLE IF NOT EXISTS jamaah.family_relations (
    id SERIAL PRIMARY KEY,
    jamaah_id INT NOT NULL REFERENCES jamaah.jamaah_data(id) ON DELETE CASCADE,
    related_jamaah_id INT NOT NULL REFERENCES jamaah.jamaah_data(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    is_mahram BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(jamaah_id, related_jamaah_id)
);

-- Finance: Payments table
CREATE TABLE IF NOT EXISTS finance.payments (
    id SERIAL PRIMARY KEY,
    jamaah_id INT NOT NULL REFERENCES jamaah.jamaah_data(id),
    package_id INT REFERENCES core.packages(id),
    amount DECIMAL(15,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL, -- 'dp', 'installment', 'full'
    payment_method VARCHAR(50), -- 'transfer', 'cash', 'card'
    payment_date DATE NOT NULL,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    reference_number VARCHAR(100),
    proof_file VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    verified_by INT REFERENCES core.users(id),
    verified_at TIMESTAMP,
    notes TEXT,
    created_by INT REFERENCES core.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Core: Activity logs
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

-- Create update trigger function
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

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON finance.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create registration number function
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
    FROM jamaah.jamaah_data
    WHERE registration_number LIKE 'JMH-' || year_part || month_part || '%';
    
    new_number := 'JMH-' || year_part || month_part || LPAD(seq_number::TEXT, 6, '0');
    NEW.registration_number := new_number;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply registration number trigger
CREATE TRIGGER generate_jamaah_registration_number
    BEFORE INSERT ON jamaah.jamaah_data
    FOR EACH ROW
    WHEN (NEW.registration_number IS NULL)
    EXECUTE FUNCTION generate_registration_number();

-- Insert sample data for testing
INSERT INTO core.packages (name, code, description, price, departure_date, return_date, quota, makkah_hotel, madinah_hotel, makkah_nights, madinah_nights, airline)
VALUES 
    ('Paket VIP Plus Ramadhan', 'VIP-RAM-2024', 'Paket premium dengan fasilitas terbaik', 50000000, '2024-03-15', '2024-03-30', 100, 'Hilton Makkah', 'Sheraton Madinah', 7, 6, 'Garuda Indonesia'),
    ('Paket VIP Reguler', 'VIP-REG-2024', 'Paket VIP dengan harga terjangkau', 40000000, '2024-04-10', '2024-04-24', 150, 'Swissotel Makkah', 'Movenpick Madinah', 6, 5, 'Saudi Airlines'),
    ('Paket Ekonomi', 'EKO-2024', 'Paket hemat untuk keluarga', 30000000, '2024-05-01', '2024-05-14', 200, 'Dar Al Tawhid', 'Al Haram Hotel', 5, 4, 'Lion Air');

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA core TO platform_admin;
GRANT ALL PRIVILEGES ON SCHEMA jamaah TO platform_admin;
GRANT ALL PRIVILEGES ON SCHEMA finance TO platform_admin;
GRANT ALL PRIVILEGES ON SCHEMA operations TO platform_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA core TO platform_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA jamaah TO platform_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA finance TO platform_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA core TO platform_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA jamaah TO platform_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA finance TO platform_admin;