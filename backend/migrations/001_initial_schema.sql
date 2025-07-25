-- Initial database schema for Umroh Management System
BEGIN;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS jamaah;
CREATE SCHEMA IF NOT EXISTS payment;
CREATE SCHEMA IF NOT EXISTS flight;
CREATE SCHEMA IF NOT EXISTS hotel;
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS reports;

-- Core: Users table
CREATE TABLE IF NOT EXISTS core.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Core: Packages table
CREATE TABLE IF NOT EXISTS core.packages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    duration_days INTEGER GENERATED ALWAYS AS (return_date - departure_date + 1) STORED,
    quota INTEGER NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_by INTEGER REFERENCES core.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jamaah: Main table
CREATE TABLE IF NOT EXISTS jamaah.jamaah_data (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL DEFAULT ('REG' || to_char(CURRENT_DATE, 'YYYYMM') || lpad(nextval('jamaah.jamaah_reg_seq')::text, 5, '0')),
    nik VARCHAR(16) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    birth_place VARCHAR(100),
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    passport_number VARCHAR(20) UNIQUE,
    passport_issued_date DATE,
    passport_expired_date DATE,
    marital_status VARCHAR(20),
    education VARCHAR(50),
    occupation VARCHAR(100),
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    package_id INTEGER REFERENCES core.packages(id),
    status VARCHAR(50) DEFAULT 'registered',
    notes TEXT,
    created_by INTEGER REFERENCES core.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for registration numbers
CREATE SEQUENCE IF NOT EXISTS jamaah.jamaah_reg_seq START 1;

-- Jamaah: Documents
CREATE TABLE IF NOT EXISTS jamaah.documents (
    id SERIAL PRIMARY KEY,
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES core.users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by INTEGER REFERENCES core.users(id),
    verified_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT
);

-- Jamaah: Family relations
CREATE TABLE IF NOT EXISTS jamaah.family_relations (
    id SERIAL PRIMARY KEY,
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id) ON DELETE CASCADE,
    related_jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id) ON DELETE CASCADE,
    relationship VARCHAR(50) NOT NULL,
    is_mahram BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(jamaah_id, related_jamaah_id)
);

-- Payment: Payment records
CREATE TABLE IF NOT EXISTS payment.payments (
    id SERIAL PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE NOT NULL DEFAULT ('PAY' || to_char(CURRENT_DATE, 'YYYYMM') || lpad(nextval('payment.payment_seq')::text, 6, '0')),
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id),
    package_id INTEGER REFERENCES core.packages(id),
    payment_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    verified_by INTEGER REFERENCES core.users(id),
    verified_at TIMESTAMP,
    notes TEXT,
    created_by INTEGER REFERENCES core.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for payment numbers
CREATE SEQUENCE IF NOT EXISTS payment.payment_seq START 1;

-- Payment: Payment schedule
CREATE TABLE IF NOT EXISTS payment.payment_schedules (
    id SERIAL PRIMARY KEY,
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id),
    package_id INTEGER REFERENCES core.packages(id),
    payment_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Core: Activity logs
CREATE TABLE IF NOT EXISTS core.activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES core.users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_username ON core.users(username);
CREATE INDEX idx_users_email ON core.users(email);
CREATE INDEX idx_packages_status ON core.packages(status);
CREATE INDEX idx_packages_departure ON core.packages(departure_date);

CREATE INDEX idx_jamaah_nik ON jamaah.jamaah_data(nik);
CREATE INDEX idx_jamaah_name ON jamaah.jamaah_data(name);
CREATE INDEX idx_jamaah_package ON jamaah.jamaah_data(package_id);
CREATE INDEX idx_jamaah_status ON jamaah.jamaah_data(status);

CREATE INDEX idx_documents_jamaah ON jamaah.documents(jamaah_id);
CREATE INDEX idx_documents_type ON jamaah.documents(document_type);

CREATE INDEX idx_payments_jamaah ON payment.payments(jamaah_id);
CREATE INDEX idx_payments_date ON payment.payments(payment_date);
CREATE INDEX idx_payments_status ON payment.payments(status);

CREATE INDEX idx_activity_user ON core.activity_logs(user_id);
CREATE INDEX idx_activity_entity ON core.activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_created ON core.activity_logs(created_at);

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON core.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON core.packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jamaah_updated_at BEFORE UPDATE ON jamaah.jamaah_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;