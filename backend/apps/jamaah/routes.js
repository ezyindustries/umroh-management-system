// Jamaah Module Routes
const express = require('express');
const router = express.Router();
const { db } = require('../../config/database-modular');

// Middleware for this module
router.use((req, res, next) => {
    req.moduleDb = db.jamaah;
    next();
});

// GET /api/jamaah
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', package_id } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT 
                j.id,
                j.nik,
                j.name,
                j.passport_number,
                j.phone,
                j.status,
                p.name as package_name
            FROM jamaah_data j
            LEFT JOIN core.packages p ON j.package_id = p.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 0;
        
        if (search) {
            paramCount++;
            query += ` AND (j.name ILIKE $${paramCount} OR j.nik ILIKE $${paramCount} OR j.passport_number ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }
        
        if (package_id) {
            paramCount++;
            query += ` AND j.package_id = $${paramCount}`;
            params.push(package_id);
        }
        
        // Get total count
        const countResult = await req.moduleDb.query(
            `SELECT COUNT(*) FROM (${query}) as counted`,
            params,
            true // Use readonly
        );
        
        // Get paginated data
        paramCount++;
        query += ` ORDER BY j.created_at DESC LIMIT $${paramCount}`;
        params.push(limit);
        
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        params.push(offset);
        
        const result = await req.moduleDb.query(query, params, true);
        
        res.json({
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(countResult.rows[0].count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/jamaah/:id
router.get('/:id', async (req, res) => {
    try {
        const result = await req.moduleDb.query(
            `SELECT 
                j.*,
                p.name as package_name,
                u.name as created_by_name
            FROM jamaah_data j
            LEFT JOIN core.packages p ON j.package_id = p.id
            LEFT JOIN core.users u ON j.created_by = u.id
            WHERE j.id = $1`,
            [req.params.id],
            true
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Jamaah not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/jamaah
router.post('/', async (req, res) => {
    try {
        const result = await req.moduleDb.transaction(async (client) => {
            // Insert jamaah
            const insertResult = await client.query(
                `INSERT INTO jamaah_data 
                (nik, name, passport_number, phone, package_id, status, created_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [
                    req.body.nik,
                    req.body.name,
                    req.body.passport_number,
                    req.body.phone,
                    req.body.package_id,
                    'active',
                    req.user.id
                ]
            );
            
            // Log activity
            await client.query(
                `INSERT INTO core.audit_logs 
                (user_id, action, entity_type, entity_id, details)
                VALUES ($1, $2, $3, $4, $5)`,
                [
                    req.user.id,
                    'CREATE',
                    'jamaah',
                    insertResult.rows[0].id,
                    JSON.stringify({ nik: req.body.nik, name: req.body.name })
                ]
            );
            
            return insertResult.rows[0];
        });
        
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/jamaah/:id
router.put('/:id', async (req, res) => {
    try {
        const result = await req.moduleDb.transaction(async (client) => {
            // Update jamaah
            const updateResult = await client.query(
                `UPDATE jamaah_data 
                SET name = $2, passport_number = $3, phone = $4, updated_at = NOW()
                WHERE id = $1
                RETURNING *`,
                [
                    req.params.id,
                    req.body.name,
                    req.body.passport_number,
                    req.body.phone
                ]
            );
            
            if (updateResult.rows.length === 0) {
                throw new Error('Jamaah not found');
            }
            
            // Log activity
            await client.query(
                `INSERT INTO core.audit_logs 
                (user_id, action, entity_type, entity_id, details)
                VALUES ($1, $2, $3, $4, $5)`,
                [
                    req.user.id,
                    'UPDATE',
                    'jamaah',
                    req.params.id,
                    JSON.stringify(req.body)
                ]
            );
            
            return updateResult.rows[0];
        });
        
        res.json(result);
    } catch (error) {
        res.status(error.message === 'Jamaah not found' ? 404 : 500)
            .json({ error: error.message });
    }
});

// Export for bulk operations
router.get('/export/excel', async (req, res) => {
    try {
        const result = await req.moduleDb.query(
            `SELECT 
                j.nik,
                j.name,
                j.passport_number,
                j.phone,
                j.address,
                p.name as package_name,
                j.status,
                j.created_at
            FROM jamaah_data j
            LEFT JOIN core.packages p ON j.package_id = p.id
            ORDER BY j.created_at DESC`,
            [],
            true
        );
        
        res.json({
            data: result.rows,
            filename: `jamaah_export_${new Date().toISOString().split('T')[0]}.xlsx`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;