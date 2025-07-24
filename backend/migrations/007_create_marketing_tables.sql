-- Marketing Customer Table
CREATE TABLE IF NOT EXISTS marketing_customers (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    pipeline_stage VARCHAR(20) DEFAULT 'leads' CHECK (pipeline_stage IN ('leads', 'interest', 'booked')),
    first_contact_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_contact_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_from VARCHAR(20) CHECK (last_message_from IN ('customer', 'agent')),
    summary TEXT,
    package_code VARCHAR(50),
    package_id INTEGER REFERENCES packages(id),
    pax_count INTEGER,
    adult_count INTEGER,
    child_count INTEGER,
    preferred_month VARCHAR(20),
    room_type VARCHAR(50),
    agreed_price DECIMAL(15, 2),
    payment_status VARCHAR(20) DEFAULT 'pending',
    booking_date DATE,
    payment_due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing Conversations Table
CREATE TABLE IF NOT EXISTS marketing_conversations (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES marketing_customers(id) ON DELETE CASCADE,
    message_id VARCHAR(255),
    from_number VARCHAR(20),
    to_number VARCHAR(20),
    message_type VARCHAR(20), -- text, image, document, etc
    message_content TEXT,
    media_url TEXT,
    is_from_customer BOOLEAN DEFAULT true,
    ai_analysis JSONB, -- AI analysis results
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto Reply Templates
CREATE TABLE IF NOT EXISTS marketing_reply_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    trigger_type VARCHAR(50), -- 'keyword', 'stage', 'package_code'
    trigger_value VARCHAR(255),
    template_content TEXT NOT NULL,
    variables JSONB, -- {package_name, price, etc}
    priority INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing Flow Rules
CREATE TABLE IF NOT EXISTS marketing_flow_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    from_stage VARCHAR(20),
    to_stage VARCHAR(20),
    conditions JSONB, -- {has_package: true, asked_price: true, etc}
    actions JSONB, -- {send_template: 'booking_info', set_reminder: true}
    priority INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing Statistics View
CREATE OR REPLACE VIEW marketing_statistics AS
WITH date_ranges AS (
    SELECT 
        DATE_TRUNC('year', CURRENT_DATE) as year_start,
        DATE_TRUNC('month', CURRENT_DATE) as month_start,
        CURRENT_DATE as today,
        CURRENT_DATE - INTERVAL '1 day' as yesterday
)
SELECT 
    -- Yearly stats
    COUNT(DISTINCT CASE 
        WHEN mc.first_contact_at >= dr.year_start THEN mc.id 
    END) as leads_this_year,
    
    -- Monthly stats
    COUNT(DISTINCT CASE 
        WHEN mc.first_contact_at >= dr.month_start THEN mc.id 
    END) as leads_this_month,
    
    -- Daily stats
    COUNT(DISTINCT CASE 
        WHEN DATE(mc.first_contact_at) = dr.today THEN mc.id 
    END) as leads_today,
    
    COUNT(DISTINCT CASE 
        WHEN DATE(mc.first_contact_at) = dr.yesterday THEN mc.id 
    END) as leads_yesterday,
    
    -- Closing stats
    COUNT(DISTINCT CASE 
        WHEN mc.pipeline_stage = 'booked' 
        AND mc.booking_date >= dr.month_start THEN mc.id 
    END) as closings_this_month,
    
    COUNT(DISTINCT CASE 
        WHEN mc.pipeline_stage = 'booked' 
        AND DATE(mc.booking_date) = dr.today THEN mc.id 
    END) as closings_today,
    
    -- Pipeline breakdown
    COUNT(DISTINCT CASE 
        WHEN mc.pipeline_stage = 'leads' 
        AND mc.first_contact_at >= dr.year_start THEN mc.id 
    END) as year_leads_count,
    
    COUNT(DISTINCT CASE 
        WHEN mc.pipeline_stage = 'interest' 
        AND mc.first_contact_at >= dr.year_start THEN mc.id 
    END) as year_interest_count,
    
    COUNT(DISTINCT CASE 
        WHEN mc.pipeline_stage = 'booked' 
        AND mc.first_contact_at >= dr.year_start THEN mc.id 
    END) as year_booked_count
FROM marketing_customers mc
CROSS JOIN date_ranges dr;

-- Indexes for performance
CREATE INDEX idx_marketing_customers_phone ON marketing_customers(phone_number);
CREATE INDEX idx_marketing_customers_stage ON marketing_customers(pipeline_stage);
CREATE INDEX idx_marketing_customers_dates ON marketing_customers(first_contact_at, last_contact_at);
CREATE INDEX idx_marketing_conversations_customer ON marketing_conversations(customer_id);
CREATE INDEX idx_marketing_conversations_created ON marketing_conversations(created_at);

-- Trigger to update last_contact_at
CREATE OR REPLACE FUNCTION update_customer_last_contact()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE marketing_customers 
    SET 
        last_contact_at = NEW.created_at,
        last_message_from = CASE 
            WHEN NEW.is_from_customer THEN 'customer' 
            ELSE 'agent' 
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.customer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_contact
AFTER INSERT ON marketing_conversations
FOR EACH ROW
EXECUTE FUNCTION update_customer_last_contact();