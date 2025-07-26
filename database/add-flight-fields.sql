-- Add flight detail fields to packages table
ALTER TABLE core.packages 
ADD COLUMN IF NOT EXISTS departure_city VARCHAR(100) DEFAULT 'Jakarta',
ADD COLUMN IF NOT EXISTS transit_city_departure VARCHAR(100),
ADD COLUMN IF NOT EXISTS arrival_city VARCHAR(100) DEFAULT 'Madinah',
ADD COLUMN IF NOT EXISTS departure_flight_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS return_departure_city VARCHAR(100) DEFAULT 'Jeddah',
ADD COLUMN IF NOT EXISTS transit_city_return VARCHAR(100),
ADD COLUMN IF NOT EXISTS return_arrival_city VARCHAR(100) DEFAULT 'Jakarta',
ADD COLUMN IF NOT EXISTS return_flight_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS flight_info TEXT;

-- Add comments for documentation
COMMENT ON COLUMN core.packages.departure_city IS 'City of departure for outbound flight';
COMMENT ON COLUMN core.packages.transit_city_departure IS 'Transit city for outbound flight (if any)';
COMMENT ON COLUMN core.packages.arrival_city IS 'Arrival city for outbound flight';
COMMENT ON COLUMN core.packages.departure_flight_number IS 'Flight number for outbound flight';
COMMENT ON COLUMN core.packages.return_departure_city IS 'City of departure for return flight';
COMMENT ON COLUMN core.packages.transit_city_return IS 'Transit city for return flight (if any)';
COMMENT ON COLUMN core.packages.return_arrival_city IS 'Arrival city for return flight';
COMMENT ON COLUMN core.packages.return_flight_number IS 'Flight number for return flight';
COMMENT ON COLUMN core.packages.flight_info IS 'Additional flight information or notes';