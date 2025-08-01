-- Create hotel_bookings table for managing hotel reservations
CREATE TABLE IF NOT EXISTS hotel_bookings (
    id SERIAL PRIMARY KEY,
    package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    hotel_name VARCHAR(255) NOT NULL,
    hotel_city VARCHAR(50) NOT NULL CHECK (hotel_city IN ('makkah', 'madinah')),
    booking_reference VARCHAR(100), -- Hotel confirmation number/booking code
    check_in_date DATE,
    check_out_date DATE,
    nights INTEGER DEFAULT 0,
    total_rooms INTEGER DEFAULT 0,
    room_types JSONB DEFAULT '{}', -- {"quad": 0, "triple": 0, "double": 0, "single": 0}
    booking_status VARCHAR(50) DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'modified')),
    payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
    hotel_provider VARCHAR(255),
    contact_person VARCHAR(255),
    phone_number VARCHAR(50),
    total_amount DECIMAL(12, 2) DEFAULT 0,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'IDR',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_hotel_bookings_package_id ON hotel_bookings(package_id);
CREATE INDEX idx_hotel_bookings_hotel_city ON hotel_bookings(hotel_city);
CREATE INDEX idx_hotel_bookings_booking_status ON hotel_bookings(booking_status);
CREATE INDEX idx_hotel_bookings_payment_status ON hotel_bookings(payment_status);
CREATE INDEX idx_hotel_bookings_check_in_date ON hotel_bookings(check_in_date);
CREATE INDEX idx_hotel_bookings_booking_reference ON hotel_bookings(booking_reference);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hotel_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hotel_bookings_updated_at_trigger
    BEFORE UPDATE ON hotel_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_hotel_bookings_updated_at();

-- Add comments for documentation
COMMENT ON TABLE hotel_bookings IS 'Stores hotel reservation details for umroh packages';
COMMENT ON COLUMN hotel_bookings.booking_reference IS 'Hotel confirmation number or booking code';
COMMENT ON COLUMN hotel_bookings.room_types IS 'JSON object storing room type allocations: quad, triple, double, single';
COMMENT ON COLUMN hotel_bookings.booking_status IS 'Current status of the hotel booking';
COMMENT ON COLUMN hotel_bookings.payment_status IS 'Payment status for this hotel booking';