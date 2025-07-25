const pool = require('../config/database');

const equipmentDistributionController = {
    // Get all distributions with filters
    async getDistributions(req, res) {
        const client = await pool.connect();
        try {
            const { group_id, status, search } = req.query;
            
            let query = `
                SELECT 
                    jes.*,
                    json_build_object(
                        'id', j.id,
                        'name', j.name,
                        'nik', j.nik,
                        'phone', j.phone,
                        'package_name', p.name
                    ) as jamaah_info,
                    COALESCE(
                        json_agg(
                            DISTINCT jsonb_build_object(
                                'id', jei.id,
                                'item_id', jei.item_id,
                                'item_name', i.name,
                                'category', i.category,
                                'quantity', jei.quantity,
                                'size', jei.size,
                                'color', jei.color,
                                'serial_number', jei.serial_number,
                                'received_date', jei.received_date,
                                'received_by', jei.received_by
                            )
                        ) FILTER (WHERE jei.id IS NOT NULL), 
                        '[]'::json
                    ) as items
                FROM jamaah_equipment_status jes
                JOIN jamaah j ON jes.jamaah_id = j.id
                LEFT JOIN packages p ON j.package_id = p.id
                LEFT JOIN jamaah_equipment_distribution jed ON jes.distribution_id = jed.id
                LEFT JOIN jamaah_equipment_items jei ON jed.id = jei.distribution_id
                LEFT JOIN inventory_items i ON jei.item_id = i.id
                WHERE 1=1
            `;
            
            const params = [];
            let paramCount = 0;
            
            if (group_id) {
                paramCount++;
                query += ` AND j.group_id = $${paramCount}`;
                params.push(group_id);
            }
            
            if (status) {
                paramCount++;
                query += ` AND (jes.distribution_status = $${paramCount} OR (jes.distribution_status IS NULL AND $${paramCount} = 'pending'))`;
                params.push(status);
            }
            
            if (search) {
                paramCount++;
                query += ` AND (j.name ILIKE $${paramCount} OR j.nik ILIKE $${paramCount} OR j.phone ILIKE $${paramCount})`;
                params.push(`%${search}%`);
            }
            
            query += ` GROUP BY jes.jamaah_id, jes.jamaah_name, jes.nik, jes.phone, 
                      jes.group_name, jes.departure_date, jes.distribution_id, 
                      jes.distribution_status, jes.distribution_date, jes.items_received,
                      jes.items_list, jes.status_text, j.id, j.name, j.nik, j.phone, p.name
                      ORDER BY jes.group_name, jes.jamaah_name`;
            
            const result = await client.query(query, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching distributions:', error);
            res.status(500).json({ error: 'Failed to fetch distributions' });
        } finally {
            client.release();
        }
    },

    // Get distribution by jamaah ID
    async getDistributionByJamaah(req, res) {
        const client = await pool.connect();
        try {
            const { jamaahId } = req.params;
            
            const query = `
                SELECT 
                    jed.*,
                    json_build_object(
                        'id', j.id,
                        'name', j.name,
                        'nik', j.nik,
                        'phone', j.phone,
                        'group_name', g.name,
                        'package_name', p.name
                    ) as jamaah_info,
                    COALESCE(
                        json_agg(
                            DISTINCT jsonb_build_object(
                                'id', jei.id,
                                'item_id', jei.item_id,
                                'item_name', i.name,
                                'category', i.category,
                                'quantity', jei.quantity,
                                'size', jei.size,
                                'color', jei.color,
                                'serial_number', jei.serial_number,
                                'received_date', jei.received_date,
                                'received_by', jei.received_by,
                                'notes', jei.notes
                            )
                        ) FILTER (WHERE jei.id IS NOT NULL), 
                        '[]'::json
                    ) as items,
                    u.name as created_by_name
                FROM jamaah j
                LEFT JOIN jamaah_equipment_distribution jed ON j.id = jed.jamaah_id
                LEFT JOIN jamaah_equipment_items jei ON jed.id = jei.distribution_id
                LEFT JOIN inventory_items i ON jei.item_id = i.id
                LEFT JOIN groups g ON j.group_id = g.id
                LEFT JOIN packages p ON j.package_id = p.id
                LEFT JOIN users u ON jed.created_by = u.id
                WHERE j.id = $1
                GROUP BY jed.id, j.id, j.name, j.nik, j.phone, g.name, p.name, u.name
            `;
            
            const result = await client.query(query, [jamaahId]);
            
            if (result.rows.length === 0) {
                return res.json({
                    jamaah_id: jamaahId,
                    distribution_id: null,
                    status: 'pending',
                    items: []
                });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching jamaah distribution:', error);
            res.status(500).json({ error: 'Failed to fetch distribution' });
        } finally {
            client.release();
        }
    },

    // Create or update distribution
    async saveDistribution(req, res) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { jamaah_id, group_id, items } = req.body;
            let distributionId;
            
            // Check if distribution exists
            const existingQuery = `
                SELECT id FROM jamaah_equipment_distribution 
                WHERE jamaah_id = $1
            `;
            const existing = await client.query(existingQuery, [jamaah_id]);
            
            if (existing.rows.length > 0) {
                distributionId = existing.rows[0].id;
                
                // Update distribution
                await client.query(`
                    UPDATE jamaah_equipment_distribution 
                    SET updated_at = CURRENT_TIMESTAMP
                    WHERE id = $1
                `, [distributionId]);
            } else {
                // Create new distribution
                const insertResult = await client.query(`
                    INSERT INTO jamaah_equipment_distribution 
                    (jamaah_id, group_id, status, created_by)
                    VALUES ($1, $2, 'pending', $3)
                    RETURNING id
                `, [jamaah_id, group_id, req.user.id]);
                
                distributionId = insertResult.rows[0].id;
            }
            
            // Process items
            for (const item of items) {
                // Check availability
                const availableCheck = await client.query(
                    'SELECT check_equipment_availability($1, $2) as available',
                    [item.item_id, item.quantity]
                );
                
                if (!availableCheck.rows[0].available) {
                    throw new Error(`Stok tidak mencukupi untuk item ID ${item.item_id}`);
                }
                
                // Insert or update item
                await client.query(`
                    INSERT INTO jamaah_equipment_items 
                    (distribution_id, item_id, quantity, size, color, serial_number, 
                     received_date, received_by, notes)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (distribution_id, item_id)
                    DO UPDATE SET
                        quantity = $3,
                        size = $4,
                        color = $5,
                        serial_number = $6,
                        received_date = $7,
                        received_by = $8,
                        notes = $9
                `, [
                    distributionId,
                    item.item_id,
                    item.quantity,
                    item.size,
                    item.color,
                    item.serial_number,
                    item.received_date || new Date(),
                    item.received_by || null,
                    item.notes
                ]);
            }
            
            // Update distribution status
            const statusQuery = `
                UPDATE jamaah_equipment_distribution 
                SET status = CASE 
                    WHEN (
                        SELECT COUNT(*) FROM equipment_checklist_template 
                        WHERE is_required = true
                    ) <= (
                        SELECT COUNT(DISTINCT item_id) 
                        FROM jamaah_equipment_items 
                        WHERE distribution_id = $1
                    ) THEN 'complete'
                    ELSE 'partial'
                END
                WHERE id = $1
            `;
            await client.query(statusQuery, [distributionId]);
            
            await client.query('COMMIT');
            
            res.json({ 
                message: 'Distribution saved successfully',
                distribution_id: distributionId 
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error saving distribution:', error);
            res.status(500).json({ error: error.message || 'Failed to save distribution' });
        } finally {
            client.release();
        }
    },

    // Remove item from distribution
    async removeItem(req, res) {
        const client = await pool.connect();
        try {
            const { distributionId, itemId } = req.params;
            
            await client.query(`
                DELETE FROM jamaah_equipment_items 
                WHERE distribution_id = $1 AND item_id = $2
            `, [distributionId, itemId]);
            
            res.json({ message: 'Item removed successfully' });
        } catch (error) {
            console.error('Error removing item:', error);
            res.status(500).json({ error: 'Failed to remove item' });
        } finally {
            client.release();
        }
    },

    // Get group distribution summary
    async getGroupSummary(req, res) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT * FROM group_equipment_summary
                ORDER BY departure_date DESC
            `;
            
            const result = await client.query(query);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching group summary:', error);
            res.status(500).json({ error: 'Failed to fetch summary' });
        } finally {
            client.release();
        }
    },

    // Get checklist template
    async getChecklistTemplate(req, res) {
        const client = await pool.connect();
        try {
            const { package_type } = req.query;
            
            let query = `
                SELECT 
                    ect.*,
                    i.name as item_name,
                    i.category,
                    i.current_stock
                FROM equipment_checklist_template ect
                JOIN inventory_items i ON ect.item_id = i.id
                WHERE 1=1
            `;
            
            const params = [];
            if (package_type) {
                query += ` AND ect.package_type = $1`;
                params.push(package_type);
            }
            
            query += ` ORDER BY i.category, i.name`;
            
            const result = await client.query(query, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching checklist template:', error);
            res.status(500).json({ error: 'Failed to fetch template' });
        } finally {
            client.release();
        }
    },

    // Print distribution receipt
    async printReceipt(req, res) {
        const client = await pool.connect();
        try {
            const { distributionId } = req.params;
            
            const query = `
                SELECT 
                    jed.*,
                    j.name as jamaah_name,
                    j.nik,
                    j.phone,
                    g.name as group_name,
                    g.departure_date,
                    json_agg(
                        json_build_object(
                            'item_name', i.name,
                            'category', i.category,
                            'quantity', jei.quantity,
                            'size', jei.size,
                            'color', jei.color,
                            'serial_number', jei.serial_number
                        )
                    ) as items,
                    u.name as created_by_name
                FROM jamaah_equipment_distribution jed
                JOIN jamaah j ON jed.jamaah_id = j.id
                JOIN groups g ON jed.group_id = g.id
                JOIN jamaah_equipment_items jei ON jed.id = jei.distribution_id
                JOIN inventory_items i ON jei.item_id = i.id
                LEFT JOIN users u ON jed.created_by = u.id
                WHERE jed.id = $1
                GROUP BY jed.id, j.name, j.nik, j.phone, g.name, g.departure_date, u.name
            `;
            
            const result = await client.query(query, [distributionId]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Distribution not found' });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching receipt data:', error);
            res.status(500).json({ error: 'Failed to fetch receipt' });
        } finally {
            client.release();
        }
    }
};

module.exports = equipmentDistributionController;