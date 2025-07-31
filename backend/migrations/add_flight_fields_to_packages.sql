-- Add flight-related fields to packages table
ALTER TABLE core.packages 
ADD COLUMN IF NOT EXISTS pnr_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS ticket_vendor VARCHAR(200),
ADD COLUMN IF NOT EXISTS ticket_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS flight_payment_status VARCHAR(20),
ADD COLUMN IF NOT EXISTS flight_notes TEXT;

-- Add index for pnr_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_packages_pnr_code ON core.packages(pnr_code);