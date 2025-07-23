-- Aplikasi Umroh Management Database Schema (PostgreSQL)
-- Created: 2025-07-22
-- Description: Complete database schema for Umroh Management System - PostgreSQL version

-- Create custom types for ENUM replacements
CREATE TYPE user_role AS ENUM ('Admin', 'Marketing', 'Keuangan', 'Operator Keberangkatan', 'Tim Visa', 'Tim Ticketing', 'Tim Hotel');
CREATE TYPE package_status AS ENUM ('active', 'inactive', 'full', 'completed');
CREATE TYPE gender_type AS ENUM ('L', 'P');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE document_type AS ENUM ('paspor', 'ktp', 'visa', 'vaksin', 'foto', 'kk', 'akta_lahir', 'other');
CREATE TYPE payment_method AS ENUM ('transfer_bank', 'cash', 'credit_card', 'debit_card', 'other');
CREATE TYPE group_status AS ENUM ('planning', 'active', 'departed', 'completed');
CREATE TYPE room_type AS ENUM ('single', 'double', 'triple', 'quad');
CREATE TYPE backup_type AS ENUM ('full', 'incremental', 'manual');
CREATE TYPE backup_status AS ENUM ('in_progress', 'completed', 'failed');
CREATE TYPE notification_type AS ENUM ('success', 'error', 'warning', 'info');
CREATE TYPE activity_type AS ENUM ('login', 'logout', 'create', 'update', 'delete', 'export', 'import', 'backup', 'restore', 'view', 'search', 'filter', 'print', 'email', 'download', 'upload', 'api_call');

-- 1. Users table for authentication and role management
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_name user_role NOT NULL DEFAULT 'Marketing',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Packages table for Umroh packages
CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE,
    duration INT NOT NULL, -- Duration in days
    price DECIMAL(15,2) NOT NULL,
    quota INT NOT NULL,
    booked INT DEFAULT 0,
    remaining_seats INT GENERATED ALWAYS AS (quota - booked) STORED,
    makkah_hotel VARCHAR(100) NOT NULL,
    madinah_hotel VARCHAR(100) NOT NULL,
    makkah_nights INT NOT NULL,
    madinah_nights INT NOT NULL,
    airline VARCHAR(50) NOT NULL,
    flight_number VARCHAR(20),
    transit_city VARCHAR(50),
    description TEXT,
    brochure_image VARCHAR(255),
    status package_status DEFAULT 'active',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_packages_departure_date ON packages(departure_date);
CREATE INDEX idx_packages_status ON packages(status);

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Jamaah table for pilgrims data
CREATE TABLE jamaah (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    nik VARCHAR(16) UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    birth_place VARCHAR(50),
    gender gender_type NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT NOT NULL,
    city VARCHAR(50),
    province VARCHAR(50),
    postal_code VARCHAR(10),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    package_id INT,
    mahram_id INT NULL, -- For women, reference to male guardian
    medical_notes TEXT,
    is_elderly BOOLEAN DEFAULT FALSE,
    verification_status verification_status DEFAULT 'pending',
    verification_notes TEXT,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
    FOREIGN KEY (mahram_id) REFERENCES jamaah(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_jamaah_nik ON jamaah(nik);
CREATE INDEX idx_jamaah_package_id ON jamaah(package_id);
CREATE INDEX idx_jamaah_verification_status ON jamaah(verification_status);

CREATE TRIGGER update_jamaah_updated_at BEFORE UPDATE ON jamaah 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Documents table for jamaah documents
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    jamaah_id INT NOT NULL,
    document_type document_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_status verification_status DEFAULT 'pending',
    verification_notes TEXT,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    uploaded_by INT,
    FOREIGN KEY (jamaah_id) REFERENCES jamaah(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_documents_jamaah_id ON documents(jamaah_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- 5. Payments table for tracking payments
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    jamaah_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method payment_method NOT NULL,
    reference_number VARCHAR(100),
    bank_name VARCHAR(50),
    account_number VARCHAR(50),
    notes TEXT,
    receipt_path VARCHAR(500),
    verification_status verification_status DEFAULT 'pending',
    verification_notes TEXT,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jamaah_id) REFERENCES jamaah(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_payments_jamaah_id ON payments(jamaah_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Groups table for managing travel groups
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    package_id INT NOT NULL,
    leader_jamaah_id INT,
    bus_number VARCHAR(20),
    departure_time TIMESTAMP,
    gathering_point VARCHAR(200),
    total_members INT DEFAULT 0,
    notes TEXT,
    status group_status DEFAULT 'planning',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (leader_jamaah_id) REFERENCES jamaah(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Group members junction table
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL,
    jamaah_id INT NOT NULL,
    room_number VARCHAR(20),
    room_type room_type DEFAULT 'double',
    special_requests TEXT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, jamaah_id),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (jamaah_id) REFERENCES jamaah(id) ON DELETE CASCADE
);

-- 8. Activity logs table
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    activity_type activity_type NOT NULL,
    module VARCHAR(50),
    description TEXT,
    related_id INT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- 9. Backup logs table
CREATE TABLE backup_logs (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    backup_type backup_type DEFAULT 'manual',
    status backup_status DEFAULT 'in_progress',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    error_message TEXT,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 10. Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- 11. User sessions table for tracking active sessions
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- 12. Package brosur table
CREATE TABLE package_brosur (
    id SERIAL PRIMARY KEY,
    package_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 13. Family relations table
CREATE TABLE family_relations (
    id SERIAL PRIMARY KEY,
    jamaah_id INT NOT NULL,
    related_jamaah_id INT NOT NULL,
    relationship VARCHAR(50) NOT NULL, -- e.g., 'spouse', 'child', 'parent', 'sibling'
    is_mahram BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(jamaah_id, related_jamaah_id),
    FOREIGN KEY (jamaah_id) REFERENCES jamaah(id) ON DELETE CASCADE,
    FOREIGN KEY (related_jamaah_id) REFERENCES jamaah(id) ON DELETE CASCADE
);

-- 14. System settings table
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default settings
INSERT INTO system_settings (key, value, description) VALUES
    ('company_name', 'PT Umroh Management', 'Company name for reports'),
    ('company_address', 'Jakarta, Indonesia', 'Company address'),
    ('company_phone', '+62 21 1234567', 'Company phone number'),
    ('company_email', 'info@umroh-management.com', 'Company email'),
    ('backup_retention_days', '30', 'Number of days to retain backups'),
    ('session_timeout_minutes', '60', 'Session timeout in minutes'),
    ('max_upload_size_mb', '10', 'Maximum upload size in MB'),
    ('enable_notifications', 'true', 'Enable system notifications'),
    ('enable_auto_backup', 'true', 'Enable automatic backups'),
    ('backup_schedule', '0 2 * * *', 'Cron expression for backup schedule');

-- 15. Performance metrics table
CREATE TABLE performance_metrics (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255),
    method VARCHAR(10),
    response_time_ms INT,
    status_code INT,
    user_id INT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX idx_performance_metrics_endpoint ON performance_metrics(endpoint);

-- Create views for reporting
CREATE VIEW payment_summary AS
SELECT 
    j.id as jamaah_id,
    j.full_name,
    j.nik,
    p.name as package_name,
    p.price as package_price,
    COALESCE(SUM(pay.amount), 0) as total_paid,
    p.price - COALESCE(SUM(pay.amount), 0) as remaining_balance
FROM jamaah j
LEFT JOIN packages p ON j.package_id = p.id
LEFT JOIN payments pay ON j.id = pay.jamaah_id AND pay.verification_status = 'verified'
GROUP BY j.id, j.full_name, j.nik, p.name, p.price;

CREATE VIEW package_summary AS
SELECT 
    p.id,
    p.name,
    p.departure_date,
    p.quota,
    p.booked,
    p.remaining_seats,
    COUNT(j.id) as actual_registered,
    p.status
FROM packages p
LEFT JOIN jamaah j ON p.id = j.package_id
GROUP BY p.id, p.name, p.departure_date, p.quota, p.booked, p.remaining_seats, p.status;

-- Create function to update package booked count
CREATE OR REPLACE FUNCTION update_package_booked_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE packages SET booked = booked + 1 WHERE id = NEW.package_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE packages SET booked = booked - 1 WHERE id = OLD.package_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.package_id != NEW.package_id THEN
        UPDATE packages SET booked = booked - 1 WHERE id = OLD.package_id;
        UPDATE packages SET booked = booked + 1 WHERE id = NEW.package_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_package_count_on_jamaah
AFTER INSERT OR DELETE OR UPDATE OF package_id ON jamaah
FOR EACH ROW EXECUTE FUNCTION update_package_booked_count();

-- Create function to log activities
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_logs (
        user_id,
        ip_address,
        activity_type,
        module,
        description,
        related_id,
        old_data,
        new_data
    ) VALUES (
        current_setting('app.current_user_id', true)::INT,
        current_setting('app.current_ip', true),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'create'::activity_type
            WHEN TG_OP = 'UPDATE' THEN 'update'::activity_type
            WHEN TG_OP = 'DELETE' THEN 'delete'::activity_type
        END,
        TG_TABLE_NAME,
        TG_OP || ' on ' || TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply activity logging to main tables
CREATE TRIGGER log_jamaah_activity
AFTER INSERT OR UPDATE OR DELETE ON jamaah
FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_packages_activity
AFTER INSERT OR UPDATE OR DELETE ON packages
FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_payments_activity
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_documents_activity
AFTER INSERT OR UPDATE OR DELETE ON documents
FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Grant permissions (adjust as needed for your environment)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO umroh_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO umroh_user;