-- Create departure_groups table
CREATE TABLE IF NOT EXISTS departure_groups (
    id SERIAL PRIMARY KEY,
    package_id INTEGER NOT NULL REFERENCES core.packages(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    max_members INTEGER NOT NULL,
    current_members INTEGER DEFAULT 0,
    departure_date DATE,
    bus_number VARCHAR(50),
    meeting_time TIME,
    meeting_point TEXT,
    tour_leader VARCHAR(255),
    tour_leader_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'departed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_departure_groups_package_id ON departure_groups(package_id);
CREATE INDEX idx_departure_groups_status ON departure_groups(status);
CREATE INDEX idx_departure_groups_departure_date ON departure_groups(departure_date);

-- Create sub_groups table for hotel-based grouping
CREATE TABLE IF NOT EXISTS departure_sub_groups (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES departure_groups(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    hotel_makkah VARCHAR(255),
    hotel_madinah VARCHAR(255),
    max_members INTEGER NOT NULL,
    current_members INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sub_groups
CREATE INDEX idx_departure_sub_groups_group_id ON departure_sub_groups(group_id);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES departure_groups(id) ON DELETE CASCADE,
    sub_group_id INTEGER REFERENCES departure_sub_groups(id) ON DELETE SET NULL,
    jamaah_id INTEGER NOT NULL,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'coordinator', 'assistant')),
    seat_number VARCHAR(20),
    room_number VARCHAR(20),
    notes TEXT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Create indexes for group_members
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_sub_group_id ON group_members(sub_group_id);
CREATE INDEX idx_group_members_jamaah_id ON group_members(jamaah_id);

-- Add unique constraint to prevent duplicate members
ALTER TABLE group_members ADD CONSTRAINT unique_jamaah_per_group UNIQUE (group_id, jamaah_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_departure_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_departure_groups_updated_at_trigger
BEFORE UPDATE ON departure_groups
FOR EACH ROW
EXECUTE FUNCTION update_departure_groups_updated_at();

CREATE TRIGGER update_departure_sub_groups_updated_at_trigger
BEFORE UPDATE ON departure_sub_groups
FOR EACH ROW
EXECUTE FUNCTION update_departure_groups_updated_at();