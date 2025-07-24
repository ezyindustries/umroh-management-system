const pool = require('../config/database').pool;
const logger = require('../config/logging').logger;

class InventoryController {
    // Get all inventory items with current stock
    async getInventoryItems(req, res) {
        try {
            const { category, low_stock } = req.query;
            
            let query = `
                SELECT 
                    ii.*,
                    CASE 
                        WHEN ii.current_stock < ii.minimum_stock THEN 'critical'
                        WHEN ii.current_stock < (ii.minimum_stock * 1.5) THEN 'warning'
                        ELSE 'ok'
                    END as stock_status
                FROM inventory_items ii
                WHERE 1=1
            `;
            
            const params = [];
            
            if (category) {
                params.push(category);
                query += ` AND ii.category = $${params.length}`;
            }
            
            if (low_stock === 'true') {
                query += ` AND ii.current_stock < ii.minimum_stock`;
            }
            
            query += ` ORDER BY ii.category, ii.name`;
            
            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (error) {
            logger.error('Error getting inventory items:', error);
            res.status(500).json({ error: 'Failed to get inventory items' });
        }
    }

    // Create new inventory item
    async createInventoryItem(req, res) {
        try {
            const { name, category, unit, minimum_stock, last_purchase_price, selling_price, description } = req.body;
            
            const result = await pool.query(
                `INSERT INTO inventory_items 
                (name, category, unit, minimum_stock, last_purchase_price, selling_price, description)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [name, category, unit || 'pcs', minimum_stock || 50, last_purchase_price, selling_price, description]
            );
            
            res.status(201).json(result.rows[0]);
        } catch (error) {
            logger.error('Error creating inventory item:', error);
            res.status(500).json({ error: 'Failed to create inventory item' });
        }
    }

    // Record inventory transaction
    async recordTransaction(req, res) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const {
                item_id,
                transaction_type,
                quantity,
                reference_type,
                reference_id,
                price_per_unit,
                notes
            } = req.body;
            
            // Check stock availability for 'out' transactions
            if (transaction_type === 'out') {
                const stockCheck = await client.query(
                    'SELECT current_stock FROM inventory_items WHERE id = $1',
                    [item_id]
                );
                
                if (stockCheck.rows[0].current_stock < quantity) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ error: 'Insufficient stock' });
                }
            }
            
            const total_amount = (price_per_unit || 0) * quantity;
            
            const result = await client.query(
                `INSERT INTO inventory_transactions 
                (item_id, transaction_type, quantity, reference_type, reference_id, 
                 price_per_unit, total_amount, notes, created_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *`,
                [item_id, transaction_type, quantity, reference_type, reference_id,
                 price_per_unit, total_amount, notes, req.user.id]
            );
            
            await client.query('COMMIT');
            
            res.json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error recording transaction:', error);
            res.status(500).json({ error: 'Failed to record transaction' });
        } finally {
            client.release();
        }
    }

    // Get transaction history
    async getTransactions(req, res) {
        try {
            const { item_id, transaction_type, start_date, end_date, limit = 100 } = req.query;
            
            let query = `
                SELECT 
                    it.*,
                    ii.name as item_name,
                    ii.category,
                    u.full_name as created_by_name
                FROM inventory_transactions it
                JOIN inventory_items ii ON it.item_id = ii.id
                LEFT JOIN users u ON it.created_by = u.id
                WHERE 1=1
            `;
            
            const params = [];
            
            if (item_id) {
                params.push(item_id);
                query += ` AND it.item_id = $${params.length}`;
            }
            
            if (transaction_type) {
                params.push(transaction_type);
                query += ` AND it.transaction_type = $${params.length}`;
            }
            
            if (start_date) {
                params.push(start_date);
                query += ` AND it.transaction_date >= $${params.length}`;
            }
            
            if (end_date) {
                params.push(end_date);
                query += ` AND it.transaction_date <= $${params.length}`;
            }
            
            query += ` ORDER BY it.created_at DESC LIMIT ${limit}`;
            
            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (error) {
            logger.error('Error getting transactions:', error);
            res.status(500).json({ error: 'Failed to get transactions' });
        }
    }

    // Get inventory alerts
    async getAlerts(req, res) {
        try {
            const result = await pool.query('SELECT * FROM inventory_alerts ORDER BY shortage_quantity DESC');
            res.json(result.rows);
        } catch (error) {
            logger.error('Error getting alerts:', error);
            res.status(500).json({ error: 'Failed to get alerts' });
        }
    }

    // Slayer color management
    async getSlayerColors(req, res) {
        try {
            const result = await pool.query('SELECT * FROM slayer_colors ORDER BY color_name');
            res.json(result.rows);
        } catch (error) {
            logger.error('Error getting slayer colors:', error);
            res.status(500).json({ error: 'Failed to get slayer colors' });
        }
    }

    async createSlayerColor(req, res) {
        try {
            const { color_name, color_code, current_stock } = req.body;
            
            const result = await pool.query(
                'INSERT INTO slayer_colors (color_name, color_code, current_stock) VALUES ($1, $2, $3) RETURNING *',
                [color_name, color_code, current_stock || 0]
            );
            
            res.status(201).json(result.rows[0]);
        } catch (error) {
            logger.error('Error creating slayer color:', error);
            res.status(500).json({ error: 'Failed to create slayer color' });
        }
    }

    // Assign slayer to group
    async assignSlayerToGroup(req, res) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const { group_id, slayer_color_id, quantity_assigned, notes } = req.body;
            
            // Check available stock
            const stockCheck = await client.query(
                'SELECT current_stock FROM slayer_colors WHERE id = $1',
                [slayer_color_id]
            );
            
            if (stockCheck.rows[0].current_stock < quantity_assigned) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Insufficient slayer stock for this color' });
            }
            
            const result = await client.query(
                `INSERT INTO group_slayer_assignments 
                (group_id, slayer_color_id, quantity_assigned, notes, assigned_by)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [group_id, slayer_color_id, quantity_assigned, notes, req.user.id]
            );
            
            await client.query('COMMIT');
            
            res.json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error assigning slayer:', error);
            res.status(500).json({ error: 'Failed to assign slayer' });
        } finally {
            client.release();
        }
    }

    // Earphone mapping
    async mapEarphoneToGroup(req, res) {
        try {
            const { group_id, quantity, serial_numbers, distribution_date, notes } = req.body;
            
            const result = await pool.query(
                `INSERT INTO earphone_mappings 
                (group_id, quantity, serial_numbers, distribution_date, notes, created_by)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [group_id, quantity, serial_numbers, distribution_date, notes, req.user.id]
            );
            
            res.json(result.rows[0]);
        } catch (error) {
            logger.error('Error mapping earphone:', error);
            res.status(500).json({ error: 'Failed to map earphone' });
        }
    }

    async getEarphoneMappings(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    em.*,
                    g.name as group_name,
                    g.departure_date
                FROM earphone_mappings em
                JOIN groups g ON em.group_id = g.id
                WHERE em.status = 'distributed'
                ORDER BY g.departure_date DESC
            `);
            
            res.json(result.rows);
        } catch (error) {
            logger.error('Error getting earphone mappings:', error);
            res.status(500).json({ error: 'Failed to get earphone mappings' });
        }
    }

    // Jamaah equipment checklist
    async updateJamaahChecklist(req, res) {
        try {
            const { jamaah_id, item_id, quantity, is_received, is_sold, sale_price, notes } = req.body;
            
            const result = await pool.query(
                `INSERT INTO jamaah_equipment_checklist 
                (jamaah_id, item_id, quantity, is_received, is_sold, sale_price, notes, checked_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (jamaah_id, item_id) 
                DO UPDATE SET 
                    quantity = $3,
                    is_received = $4,
                    is_sold = $5,
                    sale_price = $6,
                    notes = $7,
                    checked_by = $8,
                    received_date = CASE WHEN $4 THEN CURRENT_DATE ELSE NULL END
                RETURNING *`,
                [jamaah_id, item_id, quantity, is_received, is_sold, sale_price, notes, req.user.id]
            );
            
            res.json(result.rows[0]);
        } catch (error) {
            logger.error('Error updating jamaah checklist:', error);
            res.status(500).json({ error: 'Failed to update checklist' });
        }
    }

    // TL equipment checklist
    async updateTLChecklist(req, res) {
        try {
            const { group_id, checklist_type, checklist_data, is_completed, notes } = req.body;
            
            const existing = await pool.query(
                'SELECT id FROM tl_equipment_checklist WHERE group_id = $1 AND checklist_type = $2',
                [group_id, checklist_type]
            );
            
            let result;
            if (existing.rows.length > 0) {
                result = await pool.query(
                    `UPDATE tl_equipment_checklist 
                    SET checklist_data = $1, is_completed = $2, notes = $3, 
                        updated_by = $4, updated_at = CURRENT_TIMESTAMP,
                        completed_date = CASE WHEN $2 THEN CURRENT_DATE ELSE NULL END
                    WHERE id = $5
                    RETURNING *`,
                    [checklist_data, is_completed, notes, req.user.id, existing.rows[0].id]
                );
            } else {
                result = await pool.query(
                    `INSERT INTO tl_equipment_checklist 
                    (group_id, checklist_type, checklist_data, is_completed, notes, created_by, completed_date)
                    VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $4 THEN CURRENT_DATE ELSE NULL END)
                    RETURNING *`,
                    [group_id, checklist_type, checklist_data, is_completed, notes, req.user.id]
                );
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            logger.error('Error updating TL checklist:', error);
            res.status(500).json({ error: 'Failed to update TL checklist' });
        }
    }

    // Sales recap
    async getSalesRecap(req, res) {
        try {
            const { start_date, end_date, category } = req.query;
            
            let query = `
                SELECT 
                    TO_CHAR(month, 'YYYY-MM') as month,
                    item_name,
                    category,
                    total_transactions,
                    total_quantity_sold,
                    total_revenue,
                    avg_price
                FROM sales_recap
                WHERE 1=1
            `;
            
            const params = [];
            
            if (start_date) {
                params.push(start_date);
                query += ` AND month >= $${params.length}`;
            }
            
            if (end_date) {
                params.push(end_date);
                query += ` AND month <= $${params.length}`;
            }
            
            if (category) {
                params.push(category);
                query += ` AND category = $${params.length}`;
            }
            
            query += ` ORDER BY month DESC, total_revenue DESC`;
            
            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (error) {
            logger.error('Error getting sales recap:', error);
            res.status(500).json({ error: 'Failed to get sales recap' });
        }
    }
}

module.exports = new InventoryController();