const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const Joi = require('joi');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Validation schema
const jamaahSchema = Joi.object({
    nik: Joi.string().length(16).required(),
    name: Joi.string().min(3).max(255).required(),
    birth_place: Joi.string().max(100),
    birth_date: Joi.date().required(),
    gender: Joi.string().valid('male', 'female').required(),
    address: Joi.string(),
    city: Joi.string().max(100),
    province: Joi.string().max(100),
    postal_code: Joi.string().max(10),
    phone: Joi.string().max(20).required(),
    email: Joi.string().email().allow(''),
    passport_number: Joi.string().max(20).allow(''),
    passport_issued_date: Joi.date().allow(null),
    passport_expired_date: Joi.date().allow(null),
    marital_status: Joi.string().max(20),
    education: Joi.string().max(50),
    occupation: Joi.string().max(100),
    emergency_contact: Joi.string().max(255),
    emergency_phone: Joi.string().max(20),
    package_id: Joi.number().integer(),
    notes: Joi.string().allow('')
});

// GET /api/jamaah - List all jamaah with pagination
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', package_id, status } = req.query;
        const offset = (page - 1) * limit;

        let countQuery = 'SELECT COUNT(*) FROM jamaah.jamaah_data WHERE 1=1';
        let dataQuery = `
            SELECT 
                j.*,
                p.name as package_name,
                p.departure_date,
                p.return_date
            FROM jamaah.jamaah_data j
            LEFT JOIN core.packages p ON j.package_id = p.id
            WHERE 1=1
        `;

        const params = [];
        let paramCount = 0;

        // Search filter
        if (search) {
            paramCount++;
            const searchCondition = ` AND (j.name ILIKE $${paramCount} OR j.nik ILIKE $${paramCount} OR j.passport_number ILIKE $${paramCount})`;
            countQuery += searchCondition;
            dataQuery += searchCondition;
            params.push(`%${search}%`);
        }

        // Package filter
        if (package_id) {
            paramCount++;
            const packageCondition = ` AND j.package_id = $${paramCount}`;
            countQuery += packageCondition;
            dataQuery += packageCondition;
            params.push(package_id);
        }

        // Status filter
        if (status) {
            paramCount++;
            const statusCondition = ` AND j.status = $${paramCount}`;
            countQuery += statusCondition;
            dataQuery += statusCondition;
            params.push(status);
        }

        // Get total count
        const countResult = await db.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count);

        // Add ordering and pagination
        dataQuery += ' ORDER BY j.created_at DESC';
        paramCount++;
        dataQuery += ` LIMIT $${paramCount}`;
        params.push(limit);
        paramCount++;
        dataQuery += ` OFFSET $${paramCount}`;
        params.push(offset);

        // Get data
        const dataResult = await db.query(dataQuery, params);

        res.json({
            data: dataResult.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalItems,
                totalPages: Math.ceil(totalItems / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching jamaah:', error);
        res.status(500).json({ error: 'Failed to fetch jamaah data' });
    }
});

// GET /api/jamaah/:id - Get single jamaah
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT 
                j.*,
                p.name as package_name,
                p.departure_date,
                p.return_date,
                p.price as package_price,
                u.name as created_by_name
            FROM jamaah.jamaah_data j
            LEFT JOIN core.packages p ON j.package_id = p.id
            LEFT JOIN core.users u ON j.created_by = u.id
            WHERE j.id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Jamaah not found' });
        }

        // Get documents
        const documents = await db.query(
            'SELECT * FROM jamaah.documents WHERE jamaah_id = $1 ORDER BY uploaded_at DESC',
            [req.params.id]
        );

        // Get family relations
        const family = await db.query(
            `SELECT 
                fr.*,
                j.name as related_name,
                j.nik as related_nik
            FROM jamaah.family_relations fr
            JOIN jamaah.jamaah_data j ON fr.related_jamaah_id = j.id
            WHERE fr.jamaah_id = $1`,
            [req.params.id]
        );

        const jamaah = result.rows[0];
        jamaah.documents = documents.rows;
        jamaah.family_relations = family.rows;

        res.json(jamaah);
    } catch (error) {
        console.error('Error fetching jamaah:', error);
        res.status(500).json({ error: 'Failed to fetch jamaah data' });
    }
});

// POST /api/jamaah - Create new jamaah
router.post('/', async (req, res) => {
    try {
        // Validate input
        const { error } = jamaahSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                error: 'Validation error', 
                details: error.details[0].message 
            });
        }

        // Check if NIK already exists
        const nikCheck = await db.query(
            'SELECT id FROM jamaah.jamaah_data WHERE nik = $1',
            [req.body.nik]
        );

        if (nikCheck.rows.length > 0) {
            return res.status(409).json({ error: 'NIK already registered' });
        }

        // Check if passport already exists
        if (req.body.passport_number) {
            const passportCheck = await db.query(
                'SELECT id FROM jamaah.jamaah_data WHERE passport_number = $1',
                [req.body.passport_number]
            );

            if (passportCheck.rows.length > 0) {
                return res.status(409).json({ error: 'Passport number already registered' });
            }
        }

        // Insert jamaah
        const result = await db.transaction(async (client) => {
            const insertResult = await client.query(
                `INSERT INTO jamaah.jamaah_data (
                    nik, name, birth_place, birth_date, gender,
                    address, city, province, postal_code, phone,
                    email, passport_number, passport_issued_date, passport_expired_date,
                    marital_status, education, occupation,
                    emergency_contact, emergency_phone,
                    package_id, notes, created_by
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16, $17, $18, $19,
                    $20, $21, $22
                ) RETURNING *`,
                [
                    req.body.nik, req.body.name, req.body.birth_place,
                    req.body.birth_date, req.body.gender, req.body.address,
                    req.body.city, req.body.province, req.body.postal_code,
                    req.body.phone, req.body.email, req.body.passport_number,
                    req.body.passport_issued_date, req.body.passport_expired_date,
                    req.body.marital_status, req.body.education, req.body.occupation,
                    req.body.emergency_contact, req.body.emergency_phone,
                    req.body.package_id, req.body.notes, req.user.id
                ]
            );

            // Log activity
            await client.query(
                `INSERT INTO core.activity_logs (user_id, action, entity_type, entity_id, details)
                VALUES ($1, $2, $3, $4, $5)`,
                [req.user.id, 'CREATE', 'jamaah', insertResult.rows[0].id, { nik: req.body.nik, name: req.body.name }]
            );

            return insertResult.rows[0];
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating jamaah:', error);
        res.status(500).json({ error: 'Failed to create jamaah' });
    }
});

// PUT /api/jamaah/:id - Update jamaah
router.put('/:id', async (req, res) => {
    try {
        // Remove fields that shouldn't be updated
        delete req.body.id;
        delete req.body.registration_number;
        delete req.body.created_at;
        delete req.body.created_by;

        // Validate input
        const { error } = jamaahSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                error: 'Validation error', 
                details: error.details[0].message 
            });
        }

        // Check if jamaah exists
        const existing = await db.query(
            'SELECT id FROM jamaah.jamaah_data WHERE id = $1',
            [req.params.id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Jamaah not found' });
        }

        // Update jamaah
        const result = await db.transaction(async (client) => {
            const updateResult = await client.query(
                `UPDATE jamaah.jamaah_data SET
                    name = $2, birth_place = $3, birth_date = $4, gender = $5,
                    address = $6, city = $7, province = $8, postal_code = $9, phone = $10,
                    email = $11, passport_number = $12, passport_issued_date = $13, passport_expired_date = $14,
                    marital_status = $15, education = $16, occupation = $17,
                    emergency_contact = $18, emergency_phone = $19,
                    package_id = $20, notes = $21, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *`,
                [
                    req.params.id, req.body.name, req.body.birth_place,
                    req.body.birth_date, req.body.gender, req.body.address,
                    req.body.city, req.body.province, req.body.postal_code,
                    req.body.phone, req.body.email, req.body.passport_number,
                    req.body.passport_issued_date, req.body.passport_expired_date,
                    req.body.marital_status, req.body.education, req.body.occupation,
                    req.body.emergency_contact, req.body.emergency_phone,
                    req.body.package_id, req.body.notes
                ]
            );

            // Log activity
            await client.query(
                `INSERT INTO core.activity_logs (user_id, action, entity_type, entity_id, details)
                VALUES ($1, $2, $3, $4, $5)`,
                [req.user.id, 'UPDATE', 'jamaah', req.params.id, req.body]
            );

            return updateResult.rows[0];
        });

        res.json(result);
    } catch (error) {
        console.error('Error updating jamaah:', error);
        res.status(500).json({ error: 'Failed to update jamaah' });
    }
});

// DELETE /api/jamaah/:id - Soft delete jamaah
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.transaction(async (client) => {
            // Check if jamaah exists
            const existing = await client.query(
                'SELECT id, name, nik FROM jamaah.jamaah_data WHERE id = $1',
                [req.params.id]
            );

            if (existing.rows.length === 0) {
                throw new Error('Jamaah not found');
            }

            // Soft delete
            await client.query(
                `UPDATE jamaah.jamaah_data 
                SET status = 'deleted', updated_at = CURRENT_TIMESTAMP 
                WHERE id = $1`,
                [req.params.id]
            );

            // Log activity
            await client.query(
                `INSERT INTO core.activity_logs (user_id, action, entity_type, entity_id, details)
                VALUES ($1, $2, $3, $4, $5)`,
                [req.user.id, 'DELETE', 'jamaah', req.params.id, existing.rows[0]]
            );

            return existing.rows[0];
        });

        res.json({ message: 'Jamaah deleted successfully', data: result });
    } catch (error) {
        if (error.message === 'Jamaah not found') {
            return res.status(404).json({ error: error.message });
        }
        console.error('Error deleting jamaah:', error);
        res.status(500).json({ error: 'Failed to delete jamaah' });
    }
});

// POST /api/jamaah/import - Import from Excel
router.post('/import', async (req, res) => {
    try {
        const { data } = req.body;
        
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ error: 'No data to import' });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            
            try {
                // Validate row
                const { error } = jamaahSchema.validate(row);
                if (error) {
                    results.failed++;
                    results.errors.push({
                        row: i + 1,
                        error: error.details[0].message,
                        data: row
                    });
                    continue;
                }

                // Insert jamaah
                await db.query(
                    `INSERT INTO jamaah.jamaah_data (
                        nik, name, birth_place, birth_date, gender,
                        address, city, province, postal_code, phone,
                        email, passport_number, package_id, created_by
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    ON CONFLICT (nik) DO NOTHING`,
                    [
                        row.nik, row.name, row.birth_place, row.birth_date,
                        row.gender, row.address, row.city, row.province,
                        row.postal_code, row.phone, row.email, row.passport_number,
                        row.package_id, req.user.id
                    ]
                );

                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    row: i + 1,
                    error: error.message,
                    data: row
                });
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Error importing jamaah:', error);
        res.status(500).json({ error: 'Failed to import data' });
    }
});

module.exports = router;