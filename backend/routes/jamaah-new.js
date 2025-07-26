const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authenticate } = require('../middleware/auth-simple');
const Joi = require('joi');

// Apply auth middleware to all routes
router.use(authenticate);

// Validation schema based on business flow
const jamaahSchema = Joi.object({
    // Identity - either NIK or passport required
    nik: Joi.string().length(16).optional(),
    passport_number: Joi.string().optional(),
    
    // Personal Information
    name: Joi.string().min(3).max(255).required(),
    birth_place: Joi.string().max(100),
    birth_date: Joi.date().required(),
    gender: Joi.string().valid('male', 'female').required(),
    
    // Contact Information
    address: Joi.string(),
    city: Joi.string().max(100),
    province: Joi.string().max(100),
    postal_code: Joi.string().max(10),
    phone: Joi.string().max(20).required(),
    phone_secondary: Joi.string().max(20).allow('', null),
    email: Joi.string().email().allow('', null),
    
    // Emergency Contact
    emergency_contact: Joi.string().max(255),
    emergency_phone: Joi.string().max(20),
    
    // Medical & Special Needs
    medical_conditions: Joi.string().allow('', null),
    special_needs: Joi.string().allow('', null),
    additional_requests: Joi.string().allow('', null),
    
    // Package Registration
    package_ids: Joi.array().items(Joi.number().integer()).min(1)
}).custom((value, helpers) => {
    // Ensure either NIK or passport is provided
    if (!value.nik && !value.passport_number) {
        return helpers.error('any.invalid', { message: 'Either NIK or Passport Number is required' });
    }
    return value;
});

// GET /api/jamaah - List all jamaah with filters
router.get('/', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            nik,
            status,
            package_id,
            age_category,
            has_special_needs
        } = req.query;
        
        const offset = (page - 1) * limit;

        let countQuery = 'SELECT COUNT(*) FROM jamaah.jamaah_data j WHERE 1=1';
        let dataQuery = `
            SELECT 
                j.*,
                ARRAY_AGG(
                    DISTINCT jsonb_build_object(
                        'id', p.id,
                        'name', p.name,
                        'departure_date', p.departure_date,
                        'return_date', p.return_date
                    )
                ) FILTER (WHERE p.id IS NOT NULL) as packages
            FROM jamaah.jamaah_data j
            LEFT JOIN jamaah.package_registrations pr ON j.id = pr.jamaah_id AND pr.status = 'active'
            LEFT JOIN core.packages p ON pr.package_id = p.id
            WHERE 1=1
        `;

        const params = [];
        let paramCount = 0;

        // Search filter (by name or phone)
        if (search) {
            paramCount++;
            const searchCondition = ` AND (
                j.name ILIKE $${paramCount} OR 
                j.phone ILIKE $${paramCount} OR 
                j.phone_secondary ILIKE $${paramCount}
            )`;
            countQuery += searchCondition;
            dataQuery += searchCondition;
            params.push(`%${search}%`);
        }

        // NIK filter
        if (nik) {
            paramCount++;
            const nikCondition = ` AND j.nik = $${paramCount}`;
            countQuery += nikCondition;
            dataQuery += nikCondition;
            params.push(nik);
        }

        // Status filter
        if (status) {
            paramCount++;
            const statusCondition = ` AND j.status = $${paramCount}`;
            countQuery += statusCondition;
            dataQuery += statusCondition;
            params.push(status);
        }

        // Package filter
        if (package_id) {
            paramCount++;
            const packageCondition = ` AND EXISTS (
                SELECT 1 FROM jamaah.package_registrations pr2 
                WHERE pr2.jamaah_id = j.id 
                AND pr2.package_id = $${paramCount}
                AND pr2.status = 'active'
            )`;
            countQuery += packageCondition;
            dataQuery += packageCondition;
            params.push(package_id);
        }

        // Age category filter
        if (age_category) {
            paramCount++;
            const ageCondition = ` AND j.age_category = $${paramCount}`;
            countQuery += ageCondition;
            dataQuery += ageCondition;
            params.push(age_category);
        }

        // Special needs filter
        if (has_special_needs === 'true') {
            const specialNeedsCondition = ` AND (j.medical_flag = true OR j.special_needs IS NOT NULL)`;
            countQuery += specialNeedsCondition;
            dataQuery += specialNeedsCondition;
        }

        // Get total count
        const countResult = await db.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count);

        // Add grouping and ordering
        dataQuery += ' GROUP BY j.id ORDER BY j.created_at DESC';
        
        // Add pagination
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

// GET /api/jamaah/:id - Get single jamaah with full details
router.get('/:id', async (req, res) => {
    try {
        // Get jamaah data with packages
        const jamaahResult = await db.query(
            `SELECT 
                j.*,
                json_build_object(
                    'id', u.id,
                    'nama', u.nama
                ) as created_by_user
            FROM jamaah.jamaah_data j
            LEFT JOIN core.users u ON j.created_by = u.id
            WHERE j.id = $1`,
            [req.params.id]
        );

        if (jamaahResult.rows.length === 0) {
            return res.status(404).json({ error: 'Jamaah not found' });
        }

        const jamaah = jamaahResult.rows[0];

        // Get packages
        const packagesResult = await db.query(
            `SELECT 
                p.*,
                pr.registration_number,
                pr.registration_date
            FROM jamaah.package_registrations pr
            JOIN core.packages p ON pr.package_id = p.id
            WHERE pr.jamaah_id = $1 AND pr.status = 'active'
            ORDER BY p.departure_date`,
            [req.params.id]
        );

        // Get documents
        const documentsResult = await db.query(
            `SELECT 
                d.*,
                u.nama as uploaded_by_name
            FROM jamaah.documents d
            LEFT JOIN core.users u ON d.uploaded_by = u.id
            WHERE d.jamaah_id = $1
            ORDER BY d.uploaded_at DESC`,
            [req.params.id]
        );

        // Get audit trail
        const auditResult = await db.query(
            `SELECT 
                a.*,
                u.nama as user_name
            FROM jamaah.audit_trail a
            LEFT JOIN core.users u ON a.user_id = u.id
            WHERE a.jamaah_id = $1
            ORDER BY a.created_at DESC
            LIMIT 20`,
            [req.params.id]
        );

        jamaah.packages = packagesResult.rows;
        jamaah.documents = documentsResult.rows;
        jamaah.audit_trail = auditResult.rows;

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

        // Start transaction
        const result = await db.transaction(async (client) => {
            // Check if NIK already exists (including cancelled)
            if (req.body.nik) {
                const nikCheck = await client.query(
                    'SELECT id, status FROM jamaah.jamaah_data WHERE nik = $1',
                    [req.body.nik]
                );

                if (nikCheck.rows.length > 0) {
                    if (nikCheck.rows[0].status === 'cancelled') {
                        return { 
                            error: 'NIK already registered but cancelled. Would you like to reactivate?',
                            jamaah_id: nikCheck.rows[0].id,
                            action_required: 'reactivate'
                        };
                    }
                    throw new Error('NIK already registered');
                }
            }

            // Check if passport already exists
            if (req.body.passport_number) {
                const passportCheck = await client.query(
                    'SELECT id, status FROM jamaah.jamaah_data WHERE passport_number = $1',
                    [req.body.passport_number]
                );

                if (passportCheck.rows.length > 0) {
                    if (passportCheck.rows[0].status === 'cancelled') {
                        return { 
                            error: 'Passport already registered but cancelled. Would you like to reactivate?',
                            jamaah_id: passportCheck.rows[0].id,
                            action_required: 'reactivate'
                        };
                    }
                    throw new Error('Passport number already registered');
                }
            }

            // Set medical flag if medical conditions exist
            const medical_flag = !!req.body.medical_conditions;

            // Insert jamaah
            const insertResult = await client.query(
                `INSERT INTO jamaah.jamaah_data (
                    nik, passport_number, name, birth_place, birth_date, gender,
                    address, city, province, postal_code, phone, phone_secondary,
                    email, emergency_contact, emergency_phone,
                    medical_flag, medical_conditions, special_needs, additional_requests,
                    created_by
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
                    $13, $14, $15, $16, $17, $18, $19, $20
                ) RETURNING *`,
                [
                    req.body.nik, req.body.passport_number, req.body.name,
                    req.body.birth_place, req.body.birth_date, req.body.gender,
                    req.body.address, req.body.city, req.body.province,
                    req.body.postal_code, req.body.phone, req.body.phone_secondary,
                    req.body.email, req.body.emergency_contact, req.body.emergency_phone,
                    medical_flag, req.body.medical_conditions, req.body.special_needs,
                    req.body.additional_requests, req.user.id
                ]
            );

            const jamaahId = insertResult.rows[0].id;

            // Register to packages with overlap check
            if (req.body.package_ids && req.body.package_ids.length > 0) {
                for (const packageId of req.body.package_ids) {
                    // Check overlap
                    const overlapCheck = await client.query(
                        'SELECT * FROM check_package_overlap($1, $2)',
                        [jamaahId, packageId]
                    );

                    if (!overlapCheck.rows[0].can_register) {
                        throw new Error(overlapCheck.rows[0].reason);
                    }

                    // Register to package
                    await client.query(
                        `INSERT INTO jamaah.package_registrations (jamaah_id, package_id, created_by)
                        VALUES ($1, $2, $3)`,
                        [jamaahId, packageId, req.user.id]
                    );
                }
            }

            // Log activity
            await client.query(
                `INSERT INTO core.activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    req.user.id, 'CREATE', 'jamaah', jamaahId,
                    JSON.stringify({ nik: req.body.nik, name: req.body.name }),
                    req.ip, req.get('user-agent')
                ]
            );

            // Log audit trail
            await client.query(
                `INSERT INTO jamaah.audit_trail (jamaah_id, action, user_id, user_ip, user_agent)
                VALUES ($1, $2, $3, $4, $5)`,
                [jamaahId, 'create', req.user.id, req.ip, req.get('user-agent')]
            );

            return insertResult.rows[0];
        });

        // Handle reactivation case
        if (result.action_required === 'reactivate') {
            return res.status(409).json(result);
        }

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating jamaah:', error);
        
        if (error.message.includes('already registered')) {
            return res.status(409).json({ error: error.message });
        }
        if (error.message.includes('overlap')) {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to create jamaah' });
    }
});

// PUT /api/jamaah/:id - Update jamaah
router.put('/:id', async (req, res) => {
    try {
        // Remove fields that shouldn't be updated
        delete req.body.id;
        delete req.body.age_category;
        delete req.body.created_at;
        delete req.body.created_by;
        delete req.body.package_ids; // Packages managed separately

        // Start transaction
        const result = await db.transaction(async (client) => {
            // Get current data for audit
            const current = await client.query(
                'SELECT * FROM jamaah.jamaah_data WHERE id = $1',
                [req.params.id]
            );

            if (current.rows.length === 0) {
                throw new Error('Jamaah not found');
            }

            // Build update query dynamically
            const updateFields = [];
            const values = [];
            let paramCount = 1;

            Object.keys(req.body).forEach(key => {
                if (req.body[key] !== undefined && req.body[key] !== current.rows[0][key]) {
                    updateFields.push(`${key} = $${paramCount}`);
                    values.push(req.body[key]);
                    paramCount++;
                }
            });

            if (updateFields.length === 0) {
                return current.rows[0]; // No changes
            }

            // Add updated_by
            updateFields.push(`updated_by = $${paramCount}`);
            values.push(req.user.id);
            paramCount++;

            // Add id for WHERE clause
            values.push(req.params.id);

            const updateResult = await client.query(
                `UPDATE jamaah.jamaah_data 
                SET ${updateFields.join(', ')}
                WHERE id = $${paramCount}
                RETURNING *`,
                values
            );

            // Log activity
            await client.query(
                `INSERT INTO core.activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    req.user.id, 'UPDATE', 'jamaah', req.params.id,
                    JSON.stringify(req.body),
                    req.ip, req.get('user-agent')
                ]
            );

            return updateResult.rows[0];
        });

        res.json(result);
    } catch (error) {
        if (error.message === 'Jamaah not found') {
            return res.status(404).json({ error: error.message });
        }
        console.error('Error updating jamaah:', error);
        res.status(500).json({ error: 'Failed to update jamaah' });
    }
});

// PUT /api/jamaah/:id/status - Update jamaah status
router.put('/:id/status', async (req, res) => {
    try {
        const { status, notes } = req.body;
        
        if (!['pending', 'active', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await db.transaction(async (client) => {
            const updateResult = await client.query(
                `UPDATE jamaah.jamaah_data 
                SET status = $1, 
                    status_notes = $2,
                    status_changed_by = $3,
                    status_changed_at = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING *`,
                [status, notes, req.user.id, req.params.id]
            );

            if (updateResult.rows.length === 0) {
                throw new Error('Jamaah not found');
            }

            // Log activity
            await client.query(
                `INSERT INTO core.activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    req.user.id, 'STATUS_CHANGE', 'jamaah', req.params.id,
                    JSON.stringify({ status, notes }),
                    req.ip, req.get('user-agent')
                ]
            );

            return updateResult.rows[0];
        });

        res.json(result);
    } catch (error) {
        if (error.message === 'Jamaah not found') {
            return res.status(404).json({ error: error.message });
        }
        console.error('Error updating jamaah status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// POST /api/jamaah/:id/reactivate - Reactivate cancelled jamaah
router.post('/:id/reactivate', async (req, res) => {
    try {
        const result = await db.transaction(async (client) => {
            // Check current status
            const current = await client.query(
                'SELECT status FROM jamaah.jamaah_data WHERE id = $1',
                [req.params.id]
            );

            if (current.rows.length === 0) {
                throw new Error('Jamaah not found');
            }

            if (current.rows[0].status !== 'cancelled') {
                throw new Error('Can only reactivate cancelled jamaah');
            }

            // Reactivate
            const updateResult = await client.query(
                `UPDATE jamaah.jamaah_data 
                SET status = 'pending',
                    status_notes = 'Reactivated',
                    status_changed_by = $1,
                    status_changed_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *`,
                [req.user.id, req.params.id]
            );

            // Log activity
            await client.query(
                `INSERT INTO core.activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    req.user.id, 'REACTIVATE', 'jamaah', req.params.id,
                    JSON.stringify({ from_status: 'cancelled', to_status: 'pending' }),
                    req.ip, req.get('user-agent')
                ]
            );

            return updateResult.rows[0];
        });

        res.json(result);
    } catch (error) {
        if (error.message === 'Jamaah not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Can only reactivate cancelled jamaah') {
            return res.status(400).json({ error: error.message });
        }
        console.error('Error reactivating jamaah:', error);
        res.status(500).json({ error: 'Failed to reactivate jamaah' });
    }
});

// POST /api/jamaah/check-overlap - Check package date overlap
router.post('/check-overlap', async (req, res) => {
    try {
        const { jamaah_id, package_id } = req.body;
        
        if (!jamaah_id || !package_id) {
            return res.status(400).json({ error: 'jamaah_id and package_id are required' });
        }

        const result = await db.query(
            'SELECT * FROM check_package_overlap($1, $2)',
            [jamaah_id, package_id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error checking overlap:', error);
        res.status(500).json({ error: 'Failed to check overlap' });
    }
});

// POST /api/jamaah/:id/packages - Add jamaah to package
router.post('/:id/packages', async (req, res) => {
    try {
        const { package_id } = req.body;
        const jamaah_id = req.params.id;

        const result = await db.transaction(async (client) => {
            // Check overlap
            const overlapCheck = await client.query(
                'SELECT * FROM check_package_overlap($1, $2)',
                [jamaah_id, package_id]
            );

            if (!overlapCheck.rows[0].can_register) {
                throw new Error(overlapCheck.rows[0].reason);
            }

            // Register to package
            const registration = await client.query(
                `INSERT INTO jamaah.package_registrations (jamaah_id, package_id, created_by)
                VALUES ($1, $2, $3)
                RETURNING *`,
                [jamaah_id, package_id, req.user.id]
            );

            // Log activity
            await client.query(
                `INSERT INTO core.activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    req.user.id, 'PACKAGE_REGISTRATION', 'jamaah', jamaah_id,
                    JSON.stringify({ package_id }),
                    req.ip, req.get('user-agent')
                ]
            );

            return registration.rows[0];
        });

        res.status(201).json(result);
    } catch (error) {
        if (error.message.includes('overlap')) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Error adding package:', error);
        res.status(500).json({ error: 'Failed to add package' });
    }
});

// DELETE /api/jamaah/:id/packages/:packageId - Remove jamaah from package
router.delete('/:id/packages/:packageId', async (req, res) => {
    try {
        const result = await db.transaction(async (client) => {
            const deleteResult = await client.query(
                `UPDATE jamaah.package_registrations 
                SET status = 'cancelled'
                WHERE jamaah_id = $1 AND package_id = $2 AND status = 'active'
                RETURNING *`,
                [req.params.id, req.params.packageId]
            );

            if (deleteResult.rows.length === 0) {
                throw new Error('Registration not found');
            }

            // Log activity
            await client.query(
                `INSERT INTO core.activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    req.user.id, 'PACKAGE_CANCELLATION', 'jamaah', req.params.id,
                    JSON.stringify({ package_id: req.params.packageId }),
                    req.ip, req.get('user-agent')
                ]
            );

            return deleteResult.rows[0];
        });

        res.json({ message: 'Package registration cancelled', data: result });
    } catch (error) {
        if (error.message === 'Registration not found') {
            return res.status(404).json({ error: error.message });
        }
        console.error('Error cancelling package:', error);
        res.status(500).json({ error: 'Failed to cancel package registration' });
    }
});

module.exports = router;