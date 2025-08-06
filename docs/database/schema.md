# Database Schema Documentation

## Overview
Umroh Management System menggunakan PostgreSQL dengan multiple schemas untuk organisasi data yang lebih baik. Database dirancang untuk mendukung 50.000+ jamaah per tahun dengan performa optimal.

## Database Structure

### Schemas
System menggunakan schema-based separation untuk modularitas:

1. **public**: Default schema untuk system tables
2. **core**: Core business entities (packages, etc)
3. **jamaah**: Jamaah-related tables
4. **finance**: Payment and financial data
5. **hotels**: Hotel booking management
6. **documents**: Document management
7. **security**: Authentication and authorization
8. **audit**: Audit trails and logs

## Schema Details

### Core Schema

#### core.packages
Menyimpan data paket umroh.

```sql
CREATE TABLE core.packages (
    id SERIAL PRIMARY KEY,
    kode_paket VARCHAR(50) UNIQUE NOT NULL,
    nama_paket VARCHAR(255) NOT NULL,
    harga DECIMAL(12,2) NOT NULL,
    tanggal_keberangkatan DATE NOT NULL,
    tanggal_kembali DATE NOT NULL,
    durasi_hari INTEGER GENERATED ALWAYS AS (
        tanggal_kembali - tanggal_keberangkatan + 1
    ) STORED,
    kuota INTEGER NOT NULL DEFAULT 45,
    kuota_terpakai INTEGER DEFAULT 0,
    maskapai VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    -- Hotel Information
    hotel_makkah VARCHAR(255),
    bintang_makkah INTEGER CHECK (bintang_makkah BETWEEN 1 AND 5),
    jarak_makkah VARCHAR(100),
    malam_makkah INTEGER,
    hotel_madinah VARCHAR(255),
    bintang_madinah INTEGER CHECK (bintang_madinah BETWEEN 1 AND 5),
    jarak_madinah VARCHAR(100),
    malam_madinah INTEGER,
    -- Media
    gambar_utama TEXT,
    gambar_tambahan JSONB,
    video_url TEXT,
    pdf_itinerary TEXT,
    -- Content
    fasilitas JSONB,
    itinerary JSONB,
    syarat_ketentuan TEXT,
    ketentuan_pembayaran TEXT,
    kebijakan_pembatalan TEXT,
    catatan_khusus TEXT,
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER,
    updated_by INTEGER,
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_packages_departure ON core.packages(tanggal_keberangkatan);
CREATE INDEX idx_packages_status ON core.packages(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_packages_deleted ON core.packages(deleted_at);
```

### Jamaah Schema

#### jamaah.jamaah_data
Data utama jamaah dengan informasi lengkap.

```sql
CREATE TABLE jamaah.jamaah_data (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE,
    -- Personal Information
    nama_lengkap VARCHAR(255) NOT NULL,
    nik VARCHAR(16) UNIQUE NOT NULL,
    tanggal_lahir DATE NOT NULL,
    tempat_lahir VARCHAR(100) NOT NULL,
    jenis_kelamin VARCHAR(20) NOT NULL CHECK (jenis_kelamin IN ('male', 'female')),
    no_telepon VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    alamat TEXT NOT NULL,
    -- Regional data
    provinsi VARCHAR(100),
    kabupaten VARCHAR(100),
    kecamatan VARCHAR(100),
    kelurahan VARCHAR(100),
    -- Personal data
    status_pernikahan VARCHAR(50),
    pendidikan_terakhir VARCHAR(50),
    pekerjaan VARCHAR(100),
    -- Family data
    status_dalam_keluarga VARCHAR(50) NOT NULL,
    main_family_id INTEGER REFERENCES jamaah.jamaah_data(id),
    preferensi_kamar VARCHAR(20) NOT NULL DEFAULT 'quad',
    request_satu_kamar BOOLEAN DEFAULT FALSE,
    -- Passport data
    nama_paspor VARCHAR(255),
    no_paspor VARCHAR(50),
    kota_penerbitan_paspor VARCHAR(100),
    tanggal_penerbitan_paspor DATE,
    tanggal_kadaluarsa_paspor DATE,
    foto_paspor_url TEXT,
    -- Package assignment
    package_id INTEGER REFERENCES core.packages(id),
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    verified_at TIMESTAMP,
    verified_by INTEGER,
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER
);

-- Indexes
CREATE INDEX idx_jamaah_nik ON jamaah.jamaah_data(nik);
CREATE INDEX idx_jamaah_nama ON jamaah.jamaah_data(nama_lengkap);
CREATE INDEX idx_jamaah_telepon ON jamaah.jamaah_data(no_telepon);
CREATE INDEX idx_jamaah_family ON jamaah.jamaah_data(main_family_id);
CREATE INDEX idx_jamaah_package ON jamaah.jamaah_data(package_id);
CREATE INDEX idx_jamaah_deleted ON jamaah.jamaah_data(deleted_at);

-- Full text search
CREATE INDEX idx_jamaah_search ON jamaah.jamaah_data 
USING gin(to_tsvector('indonesian', nama_lengkap || ' ' || nik || ' ' || no_telepon));
```

#### jamaah.family_relations
Relasi keluarga antar jamaah.

```sql
CREATE TABLE jamaah.family_relations (
    id SERIAL PRIMARY KEY,
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id),
    related_jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id),
    relationship_type VARCHAR(50) NOT NULL, -- istri, anak, orangtua, saudara
    is_mahram BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(jamaah_id, related_jamaah_id)
);
```

#### jamaah.medical_info
Informasi medis jamaah.

```sql
CREATE TABLE jamaah.medical_info (
    id SERIAL PRIMARY KEY,
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id) UNIQUE,
    blood_type VARCHAR(10),
    medical_conditions TEXT[],
    medications TEXT[],
    allergies TEXT[],
    dietary_restrictions TEXT[],
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    special_needs TEXT,
    wheelchair_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Finance Schema

#### finance.payments
Transaksi pembayaran jamaah.

```sql
CREATE TABLE finance.payments (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id),
    package_id INTEGER REFERENCES core.packages(id),
    payment_type VARCHAR(50) NOT NULL, -- DP, Cicilan, Pelunasan
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    -- Bank details
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_holder VARCHAR(255),
    reference_number VARCHAR(100),
    -- Verification
    status VARCHAR(50) DEFAULT 'pending',
    verified_by INTEGER,
    verified_at TIMESTAMP,
    verification_notes TEXT,
    -- Receipt
    receipt_url TEXT,
    receipt_uploaded_at TIMESTAMP,
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER,
    updated_at TIMESTAMP,
    updated_by INTEGER,
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_payments_jamaah ON finance.payments(jamaah_id);
CREATE INDEX idx_payments_package ON finance.payments(package_id);
CREATE INDEX idx_payments_date ON finance.payments(payment_date);
CREATE INDEX idx_payments_status ON finance.payments(status);
CREATE INDEX idx_payments_receipt ON finance.payments(receipt_number);
```

#### finance.payment_plans
Rencana pembayaran cicilan.

```sql
CREATE TABLE finance.payment_plans (
    id SERIAL PRIMARY KEY,
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id) UNIQUE,
    package_id INTEGER REFERENCES core.packages(id),
    total_amount DECIMAL(12,2) NOT NULL,
    dp_amount DECIMAL(12,2) NOT NULL,
    dp_percentage INTEGER,
    installment_count INTEGER DEFAULT 3,
    monthly_amount DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### finance.payment_schedules
Jadwal pembayaran cicilan.

```sql
CREATE TABLE finance.payment_schedules (
    id SERIAL PRIMARY KEY,
    payment_plan_id INTEGER REFERENCES finance.payment_plans(id),
    installment_number INTEGER,
    due_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    paid_date DATE,
    payment_id INTEGER REFERENCES finance.payments(id),
    reminder_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schedules_due_date ON finance.payment_schedules(due_date);
CREATE INDEX idx_schedules_status ON finance.payment_schedules(status);
```

### Hotels Schema

#### hotels.hotel_bookings
Booking hotel untuk paket.

```sql
CREATE TABLE hotels.hotel_bookings (
    id SERIAL PRIMARY KEY,
    booking_reference VARCHAR(100) UNIQUE,
    package_id INTEGER REFERENCES core.packages(id),
    city VARCHAR(50) NOT NULL CHECK (city IN ('Makkah', 'Madinah')),
    hotel_name VARCHAR(255) NOT NULL,
    star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
    distance_to_haram VARCHAR(100),
    -- Booking details
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INTEGER GENERATED ALWAYS AS (
        check_out_date - check_in_date
    ) STORED,
    total_rooms INTEGER NOT NULL,
    room_type VARCHAR(50),
    total_guests INTEGER,
    -- Provider information
    booking_provider VARCHAR(100),
    confirmation_number VARCHAR(100),
    contact_person VARCHAR(255),
    phone_number VARCHAR(50),
    -- Financial
    total_amount DECIMAL(12,2),
    paid_amount DECIMAL(12,2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_deadline DATE,
    -- Status
    booking_status VARCHAR(50) DEFAULT 'pending',
    confirmed_at TIMESTAMP,
    confirmed_by INTEGER,
    -- Notes
    special_requests TEXT,
    hotel_notes TEXT,
    internal_notes TEXT,
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER,
    updated_by INTEGER,
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_hotel_package ON hotels.hotel_bookings(package_id);
CREATE INDEX idx_hotel_checkin ON hotels.hotel_bookings(check_in_date);
CREATE INDEX idx_hotel_city ON hotels.hotel_bookings(city);
CREATE INDEX idx_hotel_status ON hotels.hotel_bookings(booking_status);
```

#### hotels.room_allocations
Alokasi kamar untuk jamaah.

```sql
CREATE TABLE hotels.room_allocations (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES hotels.hotel_bookings(id),
    room_number VARCHAR(50),
    room_type VARCHAR(50),
    floor_number INTEGER,
    jamaah_ids INTEGER[],
    capacity INTEGER,
    occupied INTEGER,
    special_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_room_booking ON hotels.room_allocations(booking_id);
```

### Documents Schema

#### documents.document_types
Master jenis dokumen.

```sql
CREATE TABLE documents.document_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    required BOOLEAN DEFAULT FALSE,
    max_size_mb INTEGER DEFAULT 5,
    allowed_formats TEXT[],
    active BOOLEAN DEFAULT TRUE
);

-- Default document types
INSERT INTO documents.document_types (code, name, required, allowed_formats) VALUES
('ktp', 'KTP', true, ARRAY['jpg', 'jpeg', 'png', 'pdf']),
('passport', 'Paspor', true, ARRAY['jpg', 'jpeg', 'png', 'pdf']),
('foto', 'Pas Foto', true, ARRAY['jpg', 'jpeg', 'png']),
('vaksin', 'Sertifikat Vaksin', true, ARRAY['pdf', 'jpg', 'jpeg', 'png']),
('akta_nikah', 'Akta Nikah', false, ARRAY['pdf', 'jpg', 'jpeg', 'png']),
('akta_lahir', 'Akta Lahir', false, ARRAY['pdf', 'jpg', 'jpeg', 'png']);
```

#### documents.jamaah_documents
Dokumen yang diupload jamaah.

```sql
CREATE TABLE documents.jamaah_documents (
    id SERIAL PRIMARY KEY,
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id),
    document_type_id INTEGER REFERENCES documents.document_types(id),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    -- Verification
    status VARCHAR(50) DEFAULT 'pending',
    verified_by INTEGER,
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    -- Metadata
    uploaded_at TIMESTAMP DEFAULT NOW(),
    uploaded_by INTEGER,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_docs_jamaah ON documents.jamaah_documents(jamaah_id);
CREATE INDEX idx_docs_type ON documents.jamaah_documents(document_type_id);
CREATE INDEX idx_docs_status ON documents.jamaah_documents(status);
```

### Security Schema

#### security.users
System users dengan roles.

```sql
CREATE TABLE security.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    -- Status
    active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    -- Tokens
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON security.users(email);
CREATE INDEX idx_users_username ON security.users(username);
CREATE INDEX idx_users_role ON security.users(role);
```

#### security.roles
Role definitions.

```sql
CREATE TABLE security.roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB,
    active BOOLEAN DEFAULT TRUE
);

-- Default roles
INSERT INTO security.roles (code, name, description) VALUES
('admin', 'Administrator', 'Full system access'),
('marketing', 'Marketing', 'Manage packages and jamaah registration'),
('finance', 'Finance', 'Manage payments and financial reports'),
('operator', 'Operator', 'Manage departures and operations'),
('visa', 'Tim Visa', 'Manage visa processing'),
('ticketing', 'Tim Ticketing', 'Manage flight bookings'),
('hotel', 'Tim Hotel', 'Manage hotel bookings');
```

### Audit Schema

#### audit.activity_logs
Log semua aktivitas user.

```sql
CREATE TABLE audit.activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    username VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Partitioning by month for performance
CREATE TABLE audit.activity_logs_2024_01 PARTITION OF audit.activity_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE INDEX idx_logs_user ON audit.activity_logs(user_id);
CREATE INDEX idx_logs_entity ON audit.activity_logs(entity_type, entity_id);
CREATE INDEX idx_logs_created ON audit.activity_logs(created_at);
```

## Database Features

### 1. Soft Delete
Semua tabel utama menggunakan soft delete dengan kolom `deleted_at`.

### 2. Audit Trail
Setiap perubahan data dicatat dengan `created_by`, `updated_by`, dan timestamp.

### 3. JSON Support
Menggunakan JSONB untuk data fleksibel seperti fasilitas, itinerary, permissions.

### 4. Generated Columns
Kolom yang dihitung otomatis seperti durasi hari dan jumlah malam.

### 5. Check Constraints
Validasi data di level database untuk integritas.

### 6. Full Text Search
Index untuk pencarian cepat nama jamaah.

### 7. Partitioning
Table partitioning untuk audit logs berdasarkan bulan.

## Performance Optimization

### Indexes Strategy
1. Primary key indexes (automatic)
2. Foreign key indexes
3. Frequently queried columns
4. Composite indexes for common queries
5. Partial indexes for filtered queries
6. GIN indexes for JSONB and full-text search

### Query Optimization
1. Use EXPLAIN ANALYZE for query planning
2. Avoid N+1 queries with proper joins
3. Use materialized views for complex reports
4. Implement query result caching

### Maintenance
1. Regular VACUUM and ANALYZE
2. Index maintenance
3. Partition management
4. Archive old data

## Backup & Recovery

### Backup Strategy
1. Daily full backup
2. Hourly incremental backup
3. Transaction log archiving
4. Off-site backup storage

### Recovery Plan
1. Point-in-time recovery
2. Disaster recovery site
3. Regular recovery testing
4. Documentation and runbooks