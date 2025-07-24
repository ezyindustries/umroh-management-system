-- Inventory Items Table
CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('slayer', 'tas_serut', 'tas_tenteng', 'koper', 'seragam', 'mukenah', 'ihram', 'earphone', 'other')),
    unit VARCHAR(20) DEFAULT 'pcs',
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 50,
    last_purchase_price DECIMAL(15, 2),
    selling_price DECIMAL(15, 2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Transactions Table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'purchase', 'group_distribution', 'jamaah_sale', 'adjustment'
    reference_id INTEGER, -- Could be group_id, jamaah_id, etc
    price_per_unit DECIMAL(15, 2),
    total_amount DECIMAL(15, 2),
    notes TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Slayer Colors Table
CREATE TABLE IF NOT EXISTS slayer_colors (
    id SERIAL PRIMARY KEY,
    color_name VARCHAR(50) NOT NULL UNIQUE,
    color_code VARCHAR(7), -- hex color code
    current_stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group Slayer Assignment
CREATE TABLE IF NOT EXISTS group_slayer_assignments (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    slayer_color_id INTEGER REFERENCES slayer_colors(id),
    quantity_assigned INTEGER NOT NULL,
    notes TEXT,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Earphone Mapping to Groups
CREATE TABLE IF NOT EXISTS earphone_mappings (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    serial_numbers TEXT[], -- Array of serial numbers if tracked
    distribution_date DATE,
    return_date DATE,
    status VARCHAR(20) DEFAULT 'distributed' CHECK (status IN ('distributed', 'returned', 'lost')),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jamaah Equipment Checklist
CREATE TABLE IF NOT EXISTS jamaah_equipment_checklist (
    id SERIAL PRIMARY KEY,
    jamaah_id INTEGER REFERENCES jamaah(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES inventory_items(id),
    quantity INTEGER DEFAULT 1,
    is_received BOOLEAN DEFAULT false,
    received_date DATE,
    is_sold BOOLEAN DEFAULT false,
    sale_price DECIMAL(15, 2),
    notes TEXT,
    checked_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(jamaah_id, item_id)
);

-- Team Leader Equipment Checklist
CREATE TABLE IF NOT EXISTS tl_equipment_checklist (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    checklist_type VARCHAR(50) NOT NULL, -- 'equipment', 'documents', 'id_cards'
    checklist_data JSONB NOT NULL, -- Flexible JSON structure for different types
    is_completed BOOLEAN DEFAULT false,
    completed_date DATE,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Alerts View
CREATE OR REPLACE VIEW inventory_alerts AS
SELECT 
    ii.id,
    ii.name,
    ii.category,
    ii.current_stock,
    ii.minimum_stock,
    CASE 
        WHEN ii.current_stock < ii.minimum_stock THEN 'critical'
        WHEN ii.current_stock < (ii.minimum_stock * 1.5) THEN 'warning'
        ELSE 'ok'
    END as stock_status,
    (ii.minimum_stock - ii.current_stock) as shortage_quantity
FROM inventory_items ii
WHERE ii.current_stock < ii.minimum_stock;

-- Sales Recap View
CREATE OR REPLACE VIEW sales_recap AS
SELECT 
    DATE_TRUNC('month', it.transaction_date) as month,
    ii.name as item_name,
    ii.category,
    COUNT(DISTINCT it.reference_id) as total_transactions,
    SUM(it.quantity) as total_quantity_sold,
    SUM(it.total_amount) as total_revenue,
    AVG(it.price_per_unit) as avg_price
FROM inventory_transactions it
JOIN inventory_items ii ON it.item_id = ii.id
WHERE it.transaction_type = 'out' 
    AND it.reference_type = 'jamaah_sale'
GROUP BY DATE_TRUNC('month', it.transaction_date), ii.id, ii.name, ii.category;

-- Indexes for performance
CREATE INDEX idx_inventory_transactions_item ON inventory_transactions(item_id);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_group_slayer_group ON group_slayer_assignments(group_id);
CREATE INDEX idx_earphone_group ON earphone_mappings(group_id);
CREATE INDEX idx_jamaah_checklist_jamaah ON jamaah_equipment_checklist(jamaah_id);
CREATE INDEX idx_tl_checklist_group ON tl_equipment_checklist(group_id);

-- Trigger to update inventory stock
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type = 'in' THEN
        UPDATE inventory_items 
        SET current_stock = current_stock + NEW.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.item_id;
    ELSIF NEW.transaction_type = 'out' THEN
        UPDATE inventory_items 
        SET current_stock = current_stock - NEW.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.item_id;
    END IF;
    
    -- Update slayer color stock if applicable
    IF EXISTS (SELECT 1 FROM inventory_items WHERE id = NEW.item_id AND category = 'slayer') THEN
        -- Logic to update slayer_colors table based on notes or additional info
        NULL; -- Placeholder for slayer color update logic
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory
AFTER INSERT ON inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION update_inventory_stock();

-- Trigger to update slayer color stock
CREATE OR REPLACE FUNCTION update_slayer_color_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE slayer_colors 
    SET current_stock = current_stock - NEW.quantity_assigned
    WHERE id = NEW.slayer_color_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_slayer_stock
AFTER INSERT ON group_slayer_assignments
FOR EACH ROW
EXECUTE FUNCTION update_slayer_color_stock();