const { query } = require('../config/database');

class MarketingCustomer {
  static async create(data) {
    const sql = `
      INSERT INTO marketing_customers 
      (phone_number, name, package_code, package_name, pax_count, preferred_month)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      data.phone_number,
      data.name || null,
      data.package_code || null,
      data.package_name || null,
      data.pax_count || 1,
      data.preferred_month || null
    ];
    const result = await query(sql, values);
    return result.rows[0];
  }

  static async findByPhone(phoneNumber) {
    const sql = 'SELECT * FROM marketing_customers WHERE phone_number = $1';
    const result = await query(sql, [phoneNumber]);
    return result.rows[0];
  }

  static async findById(id) {
    const sql = 'SELECT * FROM marketing_customers WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async updateStage(id, stage, additionalData = {}) {
    let sql = 'UPDATE marketing_customers SET pipeline_stage = $1';
    const values = [stage];
    let paramCount = 1;

    // Add additional fields based on stage
    if (stage === 'interest' && additionalData.agreed_price) {
      paramCount++;
      sql += `, agreed_price = $${paramCount}`;
      values.push(additionalData.agreed_price);
    }

    if (stage === 'booked' && additionalData.payment_status) {
      paramCount++;
      sql += `, payment_status = $${paramCount}`;
      values.push(additionalData.payment_status);
    }

    paramCount++;
    sql += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    const result = await query(sql, values);
    return result.rows[0];
  }

  static async getAll(filters = {}) {
    let sql = `
      SELECT 
        mc.*,
        mcs.summary,
        mcs.last_message_from,
        mcs.total_messages,
        mcs.unread_count
      FROM marketing_customers mc
      LEFT JOIN marketing_conversation_summaries mcs ON mc.id = mcs.customer_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (filters.pipeline_stage) {
      paramCount++;
      sql += ` AND mc.pipeline_stage = $${paramCount}`;
      values.push(filters.pipeline_stage);
    }

    if (filters.search) {
      paramCount++;
      sql += ` AND (mc.phone_number ILIKE $${paramCount} OR mc.name ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
    }

    sql += ' ORDER BY mc.last_contact_at DESC';

    if (filters.limit) {
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      paramCount++;
      sql += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
    }

    const result = await query(sql, values);
    return result.rows;
  }

  static async getStatistics() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const stats = await query(`
      SELECT 
        -- Yearly stats
        (SELECT COUNT(*) FROM marketing_customers 
         WHERE EXTRACT(YEAR FROM first_contact_at) = $1) as yearly_leads,
        (SELECT COUNT(*) FROM marketing_customers 
         WHERE EXTRACT(YEAR FROM first_contact_at) = $1 
         AND pipeline_stage = 'booked') as yearly_closings,
        
        -- Monthly stats
        (SELECT COUNT(*) FROM marketing_customers 
         WHERE EXTRACT(MONTH FROM first_contact_at) = $2 
         AND EXTRACT(YEAR FROM first_contact_at) = $1) as monthly_leads,
        (SELECT COUNT(*) FROM marketing_customers 
         WHERE EXTRACT(MONTH FROM first_contact_at) = $2 
         AND EXTRACT(YEAR FROM first_contact_at) = $1 
         AND pipeline_stage = 'booked') as monthly_closings,
        
        -- Today stats
        (SELECT COUNT(*) FROM marketing_customers 
         WHERE DATE(first_contact_at) = $3) as today_leads,
        (SELECT COUNT(*) FROM marketing_customers 
         WHERE DATE(booked_at) = $3) as today_closings,
        
        -- Yesterday stats
        (SELECT COUNT(*) FROM marketing_customers 
         WHERE DATE(first_contact_at) = $4) as yesterday_leads,
        
        -- Pipeline breakdown
        (SELECT COUNT(*) FROM marketing_customers 
         WHERE pipeline_stage = 'leads') as total_leads,
        (SELECT COUNT(*) FROM marketing_customers 
         WHERE pipeline_stage = 'interest') as total_interest,
        (SELECT COUNT(*) FROM marketing_customers 
         WHERE pipeline_stage = 'booked') as total_booked
    `, [thisYear, thisMonth + 1, today, yesterday]);

    return stats.rows[0];
  }
}

class MarketingConversation {
  static async create(data) {
    const sql = `
      INSERT INTO marketing_conversations 
      (customer_id, message_id, sender_type, message_type, message_content, media_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      data.customer_id,
      data.message_id || null,
      data.sender_type,
      data.message_type || 'text',
      data.message_content,
      data.media_url || null
    ];
    const result = await query(sql, values);
    return result.rows[0];
  }

  static async getByCustomerId(customerId, limit = 50) {
    const sql = `
      SELECT * FROM marketing_conversations 
      WHERE customer_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await query(sql, [customerId, limit]);
    return result.rows.reverse(); // Return in chronological order
  }

  static async markAsRead(customerId) {
    const sql = `
      UPDATE marketing_conversations 
      SET is_read = TRUE 
      WHERE customer_id = $1 AND sender_type = 'customer' AND is_read = FALSE
    `;
    await query(sql, [customerId]);
    
    // Reset unread count in summary
    await query(`
      UPDATE marketing_conversation_summaries 
      SET unread_count = 0 
      WHERE customer_id = $1
    `, [customerId]);
  }
}

class MarketingConversationSummary {
  static async upsert(customerId, summary, lastMessageFrom) {
    const sql = `
      INSERT INTO marketing_conversation_summaries 
      (customer_id, summary, last_message_from)
      VALUES ($1, $2, $3)
      ON CONFLICT (customer_id)
      DO UPDATE SET 
        summary = $2,
        last_message_from = $3,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await query(sql, [customerId, summary, lastMessageFrom]);
    return result.rows[0];
  }
}

class MarketingPackageTemplate {
  static async create(data) {
    const sql = `
      INSERT INTO marketing_package_templates 
      (package_code, package_name, template_message, price_range_min, price_range_max)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      data.package_code,
      data.package_name,
      data.template_message,
      data.price_range_min || null,
      data.price_range_max || null
    ];
    const result = await query(sql, values);
    return result.rows[0];
  }

  static async findByCode(packageCode) {
    const sql = 'SELECT * FROM marketing_package_templates WHERE package_code = $1 AND is_active = TRUE';
    const result = await query(sql, [packageCode]);
    return result.rows[0];
  }

  static async getAll() {
    const sql = 'SELECT * FROM marketing_package_templates WHERE is_active = TRUE ORDER BY package_name';
    const result = await query(sql);
    return result.rows;
  }
}

class MarketingAutoReplyRule {
  static async findMatchingRule(message) {
    const sql = `
      SELECT * FROM marketing_auto_reply_rules 
      WHERE is_active = TRUE 
      AND (
        trigger_keyword IS NULL 
        OR LOWER($1) LIKE '%' || LOWER(trigger_keyword) || '%'
      )
      ORDER BY priority DESC, id
      LIMIT 1
    `;
    const result = await query(sql, [message]);
    return result.rows[0];
  }

  static async getAll() {
    const sql = 'SELECT * FROM marketing_auto_reply_rules ORDER BY priority DESC, id';
    const result = await query(sql);
    return result.rows;
  }
}

module.exports = {
  MarketingCustomer,
  MarketingConversation,
  MarketingConversationSummary,
  MarketingPackageTemplate,
  MarketingAutoReplyRule
};