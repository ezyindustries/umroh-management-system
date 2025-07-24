-- Hotel Management Tables
CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
    hotel_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_nights INTEGER GENERATED ALWAYS AS (
        EXTRACT(DAY FROM AGE(check_out_date, check_in_date))
    ) STORED,
    rooms_quad INTEGER DEFAULT 0,
    rooms_double INTEGER DEFAULT 0,
    rooms_triple INTEGER DEFAULT 0,
    total_rooms INTEGER GENERATED ALWAYS AS (
        rooms_quad + rooms_double + rooms_triple
    ) STORED,
    visa_approval_status VARCHAR(20) DEFAULT 'pending' CHECK (visa_approval_status IN ('pending', 'approved', 'rejected')),
    visa_approval_date DATE,
    confirmation_letter_url VARCHAR(500),
    confirmation_letter_uploaded_at TIMESTAMP,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
    payment_amount DECIMAL(15, 2),
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    provider_name VARCHAR(255),
    provider_contact VARCHAR(100),
    meal_type VARCHAR(50) DEFAULT 'no_meals' CHECK (meal_type IN ('international_fullboard', 'asia', 'no_meals')),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hotel Documents Table
CREATE TABLE IF NOT EXISTS hotel_documents (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- confirmation_letter, invoice, visa_approval
    document_name VARCHAR(255) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hotel Payment History
CREATE TABLE IF NOT EXISTS hotel_payment_history (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    notes TEXT,
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_hotels_package ON hotels(package_id);
CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_dates ON hotels(check_in_date, check_out_date);
CREATE INDEX idx_hotels_payment_status ON hotels(payment_status);
CREATE INDEX idx_hotel_documents_hotel ON hotel_documents(hotel_id);
CREATE INDEX idx_hotel_payment_hotel ON hotel_payment_history(hotel_id);

-- Trigger to update hotel payment status
CREATE OR REPLACE FUNCTION update_hotel_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE hotels 
    SET 
        paid_amount = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM hotel_payment_history 
            WHERE hotel_id = NEW.hotel_id
        ),
        payment_status = CASE
            WHEN paid_amount >= payment_amount THEN 'paid'
            WHEN paid_amount > 0 THEN 'partial'
            ELSE 'pending'
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.hotel_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_hotel_payment
AFTER INSERT OR UPDATE ON hotel_payment_history
FOR EACH ROW
EXECUTE FUNCTION update_hotel_payment_status();

-- View for hotel summary with package info
CREATE OR REPLACE VIEW hotel_summary AS
SELECT 
    h.*,
    p.name as package_name,
    p.code as package_code,
    p.departure_date as package_departure_date,
    CASE 
        WHEN h.payment_status = 'paid' THEN true
        ELSE false
    END as is_fully_paid,
    CASE
        WHEN h.paid_amount > 0 THEN 
            ROUND((h.paid_amount / NULLIF(h.payment_amount, 0) * 100), 2)
        ELSE 0
    END as payment_percentage
FROM hotels h
LEFT JOIN packages p ON h.package_id = p.id;