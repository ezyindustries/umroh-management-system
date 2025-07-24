-- Marketing Tables for WAHA WhatsApp Integration
-- =============================================

-- 1. Marketing Customers Table
CREATE TABLE IF NOT EXISTS marketing_customers (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    pipeline_stage VARCHAR(20) DEFAULT 'leads' CHECK (pipeline_stage IN ('leads', 'interest', 'booked')),
    package_code VARCHAR(50),
    package_name VARCHAR(255),
    pax_count INTEGER DEFAULT 1,
    adult_count INTEGER,
    child_count INTEGER,
    preferred_month VARCHAR(20),
    room_type VARCHAR(50),
    agreed_price DECIMAL(12, 2),
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    first_contact_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_contact_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stage_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    booked_at TIMESTAMP,
    payment_reminder_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Marketing Conversations Table
CREATE TABLE IF NOT EXISTS marketing_conversations (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES marketing_customers(id) ON DELETE CASCADE,
    message_id VARCHAR(100),
    sender_type VARCHAR(20) CHECK (sender_type IN ('customer', 'system', 'agent')),
    message_type VARCHAR(20) CHECK (message_type IN ('text', 'image', 'document', 'audio', 'video')),
    message_content TEXT,
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Marketing Conversation Summary Table
CREATE TABLE IF NOT EXISTS marketing_conversation_summaries (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER UNIQUE REFERENCES marketing_customers(id) ON DELETE CASCADE,
    summary TEXT,
    last_message_from VARCHAR(20) CHECK (last_message_from IN ('customer', 'system', 'agent')),
    total_messages INTEGER DEFAULT 0,
    unread_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Marketing Statistics Table (for caching daily stats)
CREATE TABLE IF NOT EXISTS marketing_statistics (
    id SERIAL PRIMARY KEY,
    stat_date DATE UNIQUE NOT NULL,
    leads_count INTEGER DEFAULT 0,
    interest_count INTEGER DEFAULT 0,
    booked_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Marketing Package Templates Table (for auto-reply)
CREATE TABLE IF NOT EXISTS marketing_package_templates (
    id SERIAL PRIMARY KEY,
    package_code VARCHAR(50) UNIQUE NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    template_message TEXT NOT NULL,
    price_range_min DECIMAL(12, 2),
    price_range_max DECIMAL(12, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Marketing Auto Reply Rules Table
CREATE TABLE IF NOT EXISTS marketing_auto_reply_rules (
    id SERIAL PRIMARY KEY,
    trigger_keyword VARCHAR(100),
    reply_template TEXT NOT NULL,
    rule_type VARCHAR(20) CHECK (rule_type IN ('greeting', 'package_inquiry', 'price_inquiry', 'booking_info', 'general')),
    priority INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_marketing_customers_phone ON marketing_customers(phone_number);
CREATE INDEX idx_marketing_customers_stage ON marketing_customers(pipeline_stage);
CREATE INDEX idx_marketing_customers_dates ON marketing_customers(first_contact_at, last_contact_at);
CREATE INDEX idx_marketing_conversations_customer ON marketing_conversations(customer_id);
CREATE INDEX idx_marketing_conversations_created ON marketing_conversations(created_at);
CREATE INDEX idx_marketing_statistics_date ON marketing_statistics(stat_date);

-- Trigger to update last_contact_at
CREATE OR REPLACE FUNCTION update_last_contact_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE marketing_customers 
    SET last_contact_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.customer_id;
    
    -- Update conversation summary
    UPDATE marketing_conversation_summaries
    SET last_message_from = NEW.sender_type,
        total_messages = total_messages + 1,
        unread_count = CASE 
            WHEN NEW.sender_type = 'customer' THEN unread_count + 1
            ELSE unread_count
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE customer_id = NEW.customer_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_contact
    AFTER INSERT ON marketing_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_last_contact_at();

-- Trigger to update stage timestamp
CREATE OR REPLACE FUNCTION update_stage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.pipeline_stage != OLD.pipeline_stage THEN
        NEW.stage_updated_at = CURRENT_TIMESTAMP;
        
        -- If moved to booked, set booked_at and payment reminder
        IF NEW.pipeline_stage = 'booked' THEN
            NEW.booked_at = CURRENT_TIMESTAMP;
            -- Set payment reminder to H-40 (40 days before departure)
            -- This will be calculated based on package departure date
            NEW.payment_reminder_date = CURRENT_DATE + INTERVAL '40 days';
        END IF;
    END IF;
    
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stage
    BEFORE UPDATE ON marketing_customers
    FOR EACH ROW
    EXECUTE FUNCTION update_stage_timestamp();

-- Function to get marketing statistics
CREATE OR REPLACE FUNCTION get_marketing_stats(
    p_period VARCHAR DEFAULT 'all',
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    period VARCHAR,
    leads_count BIGINT,
    interest_count BIGINT,
    booked_count BIGINT,
    total_customers BIGINT,
    conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_period::VARCHAR as period,
        COUNT(*) FILTER (WHERE pipeline_stage = 'leads') as leads_count,
        COUNT(*) FILTER (WHERE pipeline_stage = 'interest') as interest_count,
        COUNT(*) FILTER (WHERE pipeline_stage = 'booked') as booked_count,
        COUNT(*) as total_customers,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE pipeline_stage = 'booked')::NUMERIC / COUNT(*) * 100), 2)
            ELSE 0
        END as conversion_rate
    FROM marketing_customers
    WHERE 
        CASE p_period
            WHEN 'today' THEN DATE(first_contact_at) = p_date
            WHEN 'yesterday' THEN DATE(first_contact_at) = p_date - 1
            WHEN 'month' THEN DATE_TRUNC('month', first_contact_at) = DATE_TRUNC('month', p_date)
            WHEN 'year' THEN DATE_TRUNC('year', first_contact_at) = DATE_TRUNC('year', p_date)
            ELSE TRUE
        END;
END;
$$ LANGUAGE plpgsql;

-- Insert default auto-reply templates
INSERT INTO marketing_auto_reply_rules (trigger_keyword, reply_template, rule_type, priority) VALUES
('halo', 'Assalamualaikum, terima kasih telah menghubungi kami. Ada yang bisa kami bantu untuk perjalanan umroh Anda?', 'greeting', 100),
('paket', 'Kami memiliki berbagai paket umroh yang bisa disesuaikan dengan kebutuhan Anda. Silakan sebutkan kode paket jika sudah tahu, atau beritahu kami berapa orang yang akan berangkat dan bulan keberangkatan yang diinginkan.', 'package_inquiry', 90),
('harga', 'Untuk informasi harga, bisa kami tahu untuk berapa orang dan kapan rencana keberangkatannya?', 'price_inquiry', 85),
('bayar', 'Pembayaran bisa dilakukan dengan DP minimal 30% dan pelunasan H-40 sebelum keberangkatan. Kami menerima transfer bank dan pembayaran tunai.', 'booking_info', 80);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_marketing_customers_updated_at BEFORE UPDATE ON marketing_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_marketing_statistics_updated_at BEFORE UPDATE ON marketing_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();