-- Jamaah Equipment Distribution Tables
CREATE TABLE IF NOT EXISTS jamaah_equipment_distribution (
    id SERIAL PRIMARY KEY,
    jamaah_id INTEGER REFERENCES jamaah(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES groups(id),
    distribution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'partial' CHECK (status IN ('partial', 'complete', 'pending')),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Distribution Details
CREATE TABLE IF NOT EXISTS jamaah_equipment_items (
    id SERIAL PRIMARY KEY,
    distribution_id INTEGER REFERENCES jamaah_equipment_distribution(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES inventory_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    size VARCHAR(20), -- For clothing items
    color VARCHAR(50), -- For slayer, etc
    serial_number VARCHAR(100), -- For earphones, etc
    received_date TIMESTAMP,
    received_by VARCHAR(100), -- Name of person who received if not jamaah
    notes TEXT,
    UNIQUE(distribution_id, item_id)
);

-- Standard Equipment Checklist Template
CREATE TABLE IF NOT EXISTS equipment_checklist_template (
    id SERIAL PRIMARY KEY,
    package_type VARCHAR(50), -- regular, vip, etc
    item_id INTEGER REFERENCES inventory_items(id),
    quantity INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_jamaah_equipment_jamaah ON jamaah_equipment_distribution(jamaah_id);
CREATE INDEX idx_jamaah_equipment_group ON jamaah_equipment_distribution(group_id);
CREATE INDEX idx_jamaah_equipment_status ON jamaah_equipment_distribution(status);
CREATE INDEX idx_equipment_items_distribution ON jamaah_equipment_items(distribution_id);
CREATE INDEX idx_equipment_items_item ON jamaah_equipment_items(item_id);

-- View for jamaah equipment status
CREATE OR REPLACE VIEW jamaah_equipment_status AS
SELECT 
    j.id as jamaah_id,
    j.name as jamaah_name,
    j.nik,
    j.phone,
    g.name as group_name,
    g.departure_date,
    jed.id as distribution_id,
    jed.status as distribution_status,
    jed.distribution_date,
    COUNT(DISTINCT jei.item_id) as items_received,
    STRING_AGG(DISTINCT i.name, ', ' ORDER BY i.name) as items_list,
    CASE 
        WHEN jed.status = 'complete' THEN 'Lengkap'
        WHEN jed.status = 'partial' THEN 'Sebagian'
        WHEN jed.status IS NULL THEN 'Belum Diambil'
        ELSE 'Pending'
    END as status_text
FROM jamaah j
LEFT JOIN groups g ON j.group_id = g.id
LEFT JOIN jamaah_equipment_distribution jed ON j.id = jed.jamaah_id
LEFT JOIN jamaah_equipment_items jei ON jed.id = jei.distribution_id
LEFT JOIN inventory_items i ON jei.item_id = i.id
GROUP BY j.id, j.name, j.nik, j.phone, g.name, g.departure_date, 
         jed.id, jed.status, jed.distribution_date;

-- View for equipment distribution summary by group
CREATE OR REPLACE VIEW group_equipment_summary AS
SELECT 
    g.id as group_id,
    g.name as group_name,
    g.departure_date,
    COUNT(DISTINCT j.id) as total_jamaah,
    COUNT(DISTINCT jed.jamaah_id) as jamaah_received,
    COUNT(DISTINCT CASE WHEN jed.status = 'complete' THEN jed.jamaah_id END) as complete_count,
    COUNT(DISTINCT CASE WHEN jed.status = 'partial' THEN jed.jamaah_id END) as partial_count,
    COUNT(DISTINCT j.id) - COUNT(DISTINCT jed.jamaah_id) as pending_count,
    ROUND((COUNT(DISTINCT jed.jamaah_id)::numeric / COUNT(DISTINCT j.id)::numeric * 100), 2) as completion_percentage
FROM groups g
JOIN jamaah j ON g.id = j.group_id
LEFT JOIN jamaah_equipment_distribution jed ON j.id = jed.jamaah_id
GROUP BY g.id, g.name, g.departure_date;

-- Function to check equipment availability before distribution
CREATE OR REPLACE FUNCTION check_equipment_availability(
    p_item_id INTEGER,
    p_quantity INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_stock INTEGER;
BEGIN
    SELECT current_stock INTO v_current_stock
    FROM inventory_items
    WHERE id = p_item_id;
    
    RETURN v_current_stock >= p_quantity;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update inventory when equipment is distributed
CREATE OR REPLACE FUNCTION update_inventory_on_distribution()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Record transaction in inventory
        INSERT INTO inventory_transactions (
            item_id, 
            transaction_type, 
            quantity, 
            reference_type, 
            reference_id,
            notes
        ) VALUES (
            NEW.item_id,
            'out',
            NEW.quantity,
            'jamaah_distribution',
            NEW.distribution_id,
            'Pengambilan perlengkapan jamaah'
        );
    ELSIF TG_OP = 'DELETE' THEN
        -- Return item to inventory
        INSERT INTO inventory_transactions (
            item_id, 
            transaction_type, 
            quantity, 
            reference_type, 
            reference_id,
            notes
        ) VALUES (
            OLD.item_id,
            'in',
            OLD.quantity,
            'jamaah_return',
            OLD.distribution_id,
            'Pengembalian perlengkapan jamaah'
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inventory_distribution
AFTER INSERT OR DELETE ON jamaah_equipment_items
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_distribution();

-- Sample checklist template data
INSERT INTO equipment_checklist_template (package_type, item_id, quantity, is_required) 
SELECT 'regular', id, 1, true FROM inventory_items WHERE category IN ('slayer', 'tas_serut', 'mukenah', 'ihram');

-- Function to initialize distribution for a jamaah
CREATE OR REPLACE FUNCTION initialize_jamaah_distribution(
    p_jamaah_id INTEGER,
    p_group_id INTEGER,
    p_created_by INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_distribution_id INTEGER;
BEGIN
    INSERT INTO jamaah_equipment_distribution (jamaah_id, group_id, status, created_by)
    VALUES (p_jamaah_id, p_group_id, 'pending', p_created_by)
    RETURNING id INTO v_distribution_id;
    
    RETURN v_distribution_id;
END;
$$ LANGUAGE plpgsql;