-- Missing tables for PostgreSQL

-- Roles table (tidak ada di schema utama)
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
    ('Admin', 'Administrator dengan akses penuh'),
    ('Marketing', 'Tim marketing untuk input jamaah'),
    ('Keuangan', 'Tim keuangan untuk verifikasi pembayaran'),
    ('Operator Keberangkatan', 'Tim operator untuk atur keberangkatan'),
    ('Tim Visa', 'Tim visa untuk proses dokumen'),
    ('Tim Ticketing', 'Tim ticketing untuk atur penerbangan'),
    ('Tim Hotel', 'Tim hotel untuk atur akomodasi')
ON CONFLICT (name) DO NOTHING;

-- Audit logs table (jika belum ada)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    action VARCHAR(50),
    table_name VARCHAR(50),
    record_id INT,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Update users table untuk support role_name jika belum
-- (schema postgres sudah pakai role_name enum, tapi perlu pastikan)