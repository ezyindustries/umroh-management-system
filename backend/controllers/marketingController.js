const pool = require('../config/database').pool;
const logger = require('../config/logging').logger;
const OpenAI = require('openai');
const axios = require('axios');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// WAHA API configuration
const WAHA_API_URL = process.env.WAHA_API_URL || 'http://localhost:3000';
const WAHA_SESSION = process.env.WAHA_SESSION || 'default';

class MarketingController {
    // Get marketing statistics
    async getStatistics(req, res) {
        try {
            const stats = await pool.query('SELECT * FROM marketing_statistics');
            res.json(stats.rows[0] || {});
        } catch (error) {
            logger.error('Error getting marketing statistics:', error);
            res.status(500).json({ error: 'Failed to get statistics' });
        }
    }

    // Get customers list with filters
    async getCustomers(req, res) {
        try {
            const { stage, search, limit = 50, offset = 0 } = req.query;
            
            let query = `
                SELECT 
                    mc.*,
                    p.name as package_name,
                    COUNT(conv.id) as message_count,
                    MAX(conv.created_at) as last_message_time
                FROM marketing_customers mc
                LEFT JOIN packages p ON mc.package_id = p.id
                LEFT JOIN marketing_conversations conv ON mc.id = conv.customer_id
                WHERE 1=1
            `;
            
            const params = [];
            
            if (stage) {
                params.push(stage);
                query += ` AND mc.pipeline_stage = $${params.length}`;
            }
            
            if (search) {
                params.push(`%${search}%`);
                query += ` AND (mc.phone_number LIKE $${params.length} OR mc.name ILIKE $${params.length})`;
            }
            
            query += ` GROUP BY mc.id, p.id ORDER BY mc.last_contact_at DESC`;
            query += ` LIMIT ${limit} OFFSET ${offset}`;
            
            const result = await pool.query(query, params);
            
            res.json({
                customers: result.rows,
                total: result.rowCount
            });
        } catch (error) {
            logger.error('Error getting customers:', error);
            res.status(500).json({ error: 'Failed to get customers' });
        }
    }

    // Get single customer with conversation history
    async getCustomer(req, res) {
        try {
            const { id } = req.params;
            
            const customerQuery = await pool.query(
                'SELECT * FROM marketing_customers WHERE id = $1',
                [id]
            );
            
            if (customerQuery.rows.length === 0) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            
            const conversationsQuery = await pool.query(
                'SELECT * FROM marketing_conversations WHERE customer_id = $1 ORDER BY created_at ASC',
                [id]
            );
            
            res.json({
                customer: customerQuery.rows[0],
                conversations: conversationsQuery.rows
            });
        } catch (error) {
            logger.error('Error getting customer:', error);
            res.status(500).json({ error: 'Failed to get customer' });
        }
    }

    // Update customer pipeline stage
    async updateCustomerStage(req, res) {
        try {
            const { id } = req.params;
            const { stage, notes } = req.body;
            
            const result = await pool.query(
                `UPDATE marketing_customers 
                SET pipeline_stage = $1, 
                    summary = COALESCE(summary, '') || E'\n' || $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $3 
                RETURNING *`,
                [stage, notes || `Stage updated to ${stage}`, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            
            // If booked, set payment due date to H-40
            if (stage === 'booked') {
                const packageQuery = await pool.query(
                    'SELECT departure_date FROM packages WHERE id = $1',
                    [result.rows[0].package_id]
                );
                
                if (packageQuery.rows.length > 0 && packageQuery.rows[0].departure_date) {
                    const departureDate = new Date(packageQuery.rows[0].departure_date);
                    const dueDate = new Date(departureDate);
                    dueDate.setDate(dueDate.getDate() - 40);
                    
                    await pool.query(
                        'UPDATE marketing_customers SET payment_due_date = $1 WHERE id = $2',
                        [dueDate, id]
                    );
                }
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            logger.error('Error updating customer stage:', error);
            res.status(500).json({ error: 'Failed to update stage' });
        }
    }

    // Handle WAHA webhook
    async handleWAHAWebhook(req, res) {
        try {
            const { event, session, payload } = req.body;
            
            if (event !== 'message' || !payload.from) {
                return res.status(200).json({ status: 'ignored' });
            }
            
            const phoneNumber = payload.from.replace('@c.us', '');
            const messageContent = payload.body || '';
            
            // Get or create customer
            let customer = await this.getOrCreateCustomer(phoneNumber);
            
            // Save conversation
            await pool.query(
                `INSERT INTO marketing_conversations 
                (customer_id, message_id, from_number, to_number, message_type, message_content, is_from_customer)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [customer.id, payload.id, phoneNumber, session, payload.type || 'text', messageContent, true]
            );
            
            // Analyze message with AI
            const analysis = await this.analyzeMessage(messageContent, customer);
            
            // Update customer based on analysis
            if (analysis.extractedInfo) {
                await this.updateCustomerFromAnalysis(customer.id, analysis.extractedInfo);
            }
            
            // Generate and send auto-reply
            if (analysis.suggestedReply) {
                await this.sendAutoReply(phoneNumber, analysis.suggestedReply, customer.id);
            }
            
            res.status(200).json({ status: 'processed' });
        } catch (error) {
            logger.error('Error handling WAHA webhook:', error);
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    }

    // Get or create customer
    async getOrCreateCustomer(phoneNumber) {
        const existing = await pool.query(
            'SELECT * FROM marketing_customers WHERE phone_number = $1',
            [phoneNumber]
        );
        
        if (existing.rows.length > 0) {
            return existing.rows[0];
        }
        
        const newCustomer = await pool.query(
            'INSERT INTO marketing_customers (phone_number) VALUES ($1) RETURNING *',
            [phoneNumber]
        );
        
        return newCustomer.rows[0];
    }

    // Analyze message with AI
    async analyzeMessage(message, customer) {
        try {
            const systemPrompt = `You are analyzing WhatsApp messages for an Umrah travel agency.
            Current customer stage: ${customer.pipeline_stage}
            Customer has package code: ${customer.package_code || 'none'}
            
            Analyze the message and extract:
            1. Customer name if mentioned
            2. Package code if mentioned (format: UMRxxxx)
            3. Number of people (pax count)
            4. Preferred month for travel
            5. Questions about price, facilities, terms
            6. Intent level (just asking, interested, ready to book)
            
            Also suggest appropriate stage transition:
            - leads: First contact, general inquiry
            - interest: Asking specific questions, discussing details
            - booked: Confirmed booking or payment
            
            Provide a suggested reply based on the stage and context.`;
            
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                response_format: { type: "json_object" }
            });
            
            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            logger.error('AI analysis error:', error);
            return {
                extractedInfo: {},
                suggestedReply: "Terima kasih telah menghubungi kami. Tim kami akan segera membantu Anda."
            };
        }
    }

    // Update customer from AI analysis
    async updateCustomerFromAnalysis(customerId, extractedInfo) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        
        if (extractedInfo.name) {
            updates.push(`name = $${paramCount++}`);
            values.push(extractedInfo.name);
        }
        
        if (extractedInfo.packageCode) {
            updates.push(`package_code = $${paramCount++}`);
            values.push(extractedInfo.packageCode);
            
            // Find package by code
            const packageResult = await pool.query(
                'SELECT id FROM packages WHERE code = $1',
                [extractedInfo.packageCode]
            );
            
            if (packageResult.rows.length > 0) {
                updates.push(`package_id = $${paramCount++}`);
                values.push(packageResult.rows[0].id);
            }
        }
        
        if (extractedInfo.paxCount) {
            updates.push(`pax_count = $${paramCount++}`);
            values.push(extractedInfo.paxCount);
        }
        
        if (extractedInfo.preferredMonth) {
            updates.push(`preferred_month = $${paramCount++}`);
            values.push(extractedInfo.preferredMonth);
        }
        
        if (extractedInfo.suggestedStage) {
            updates.push(`pipeline_stage = $${paramCount++}`);
            values.push(extractedInfo.suggestedStage);
        }
        
        if (updates.length > 0) {
            values.push(customerId);
            await pool.query(
                `UPDATE marketing_customers SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`,
                values
            );
        }
    }

    // Send auto-reply via WAHA
    async sendAutoReply(phoneNumber, message, customerId) {
        try {
            const response = await axios.post(
                `${WAHA_API_URL}/api/sendText`,
                {
                    session: WAHA_SESSION,
                    phone: phoneNumber,
                    text: message
                }
            );
            
            // Save sent message
            await pool.query(
                `INSERT INTO marketing_conversations 
                (customer_id, message_id, from_number, to_number, message_type, message_content, is_from_customer)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [customerId, response.data.id, WAHA_SESSION, phoneNumber, 'text', message, false]
            );
            
            return response.data;
        } catch (error) {
            logger.error('Error sending auto-reply:', error);
            throw error;
        }
    }

    // Get reply templates
    async getTemplates(req, res) {
        try {
            const templates = await pool.query(
                'SELECT * FROM marketing_reply_templates WHERE is_active = true ORDER BY priority DESC'
            );
            res.json(templates.rows);
        } catch (error) {
            logger.error('Error getting templates:', error);
            res.status(500).json({ error: 'Failed to get templates' });
        }
    }

    // Create/update template
    async saveTemplate(req, res) {
        try {
            const { id, name, trigger_type, trigger_value, template_content, variables, priority } = req.body;
            
            let result;
            if (id) {
                result = await pool.query(
                    `UPDATE marketing_reply_templates 
                    SET name = $1, trigger_type = $2, trigger_value = $3, 
                        template_content = $4, variables = $5, priority = $6, 
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $7 RETURNING *`,
                    [name, trigger_type, trigger_value, template_content, variables, priority, id]
                );
            } else {
                result = await pool.query(
                    `INSERT INTO marketing_reply_templates 
                    (name, trigger_type, trigger_value, template_content, variables, priority)
                    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                    [name, trigger_type, trigger_value, template_content, variables, priority]
                );
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            logger.error('Error saving template:', error);
            res.status(500).json({ error: 'Failed to save template' });
        }
    }
}

module.exports = new MarketingController();