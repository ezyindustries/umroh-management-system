const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authenticate } = require('../middleware/auth-simple');

// Apply auth middleware to all routes
router.use(authenticate);

// GET /api/packages - List all packages
router.get('/', async (req, res) => {
    try {
        const { status = 'active' } = req.query;
        
        let query = 'SELECT * FROM core.packages';
        const params = [];
        
        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }
        
        query += ' ORDER BY departure_date ASC';
        
        const result = await db.query(query, params);
        
        // Calculate booked count for each package
        const packagesWithBooking = await Promise.all(
            result.rows.map(async (pkg) => {
                const bookingCount = await db.query(
                    `SELECT COUNT(*) as booked 
                     FROM jamaah.package_registrations 
                     WHERE package_id = $1 AND status = 'active'`,
                    [pkg.id]
                );
                
                return {
                    ...pkg,
                    package_images: typeof pkg.package_images === 'string' ? JSON.parse(pkg.package_images) : pkg.package_images || [],
                    booked: parseInt(bookingCount.rows[0].booked) || 0,
                    available: pkg.quota - (parseInt(bookingCount.rows[0].booked) || 0)
                };
            })
        );
        
        res.json(packagesWithBooking);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ error: 'Failed to fetch packages' });
    }
});

// GET /api/packages/:id - Get single package
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM core.packages WHERE id = $1',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }
        
        const pkg = result.rows[0];
        
        // Get booking count
        const bookingCount = await db.query(
            `SELECT COUNT(*) as booked 
             FROM jamaah.package_registrations 
             WHERE package_id = $1 AND status = 'active'`,
            [pkg.id]
        );
        
        // Get list of jamaah in this package
        const jamaahList = await db.query(
            `SELECT j.id, j.name, j.nik, j.phone, pr.registration_number, pr.registration_date
             FROM jamaah.jamaah_data j
             JOIN jamaah.package_registrations pr ON j.id = pr.jamaah_id
             WHERE pr.package_id = $1 AND pr.status = 'active'
             ORDER BY pr.registration_date ASC`,
            [pkg.id]
        );
        
        res.json({
            ...pkg,
            package_images: typeof pkg.package_images === 'string' ? JSON.parse(pkg.package_images) : pkg.package_images || [],
            booked: parseInt(bookingCount.rows[0].booked) || 0,
            available: pkg.quota - (parseInt(bookingCount.rows[0].booked) || 0),
            jamaah_list: jamaahList.rows
        });
    } catch (error) {
        console.error('Error fetching package:', error);
        res.status(500).json({ error: 'Failed to fetch package' });
    }
});

// POST /api/packages - Create new package
router.post('/', async (req, res) => {
    try {
        const {
            name, code, description, price, departure_date, return_date,
            quota, makkah_hotel, madinah_hotel, makkah_nights, madinah_nights,
            airline, brochure_image, package_info, package_images,
            // Flight details
            departure_city, transit_city_departure, arrival_city, departure_flight_number,
            return_departure_city, transit_city_return, return_arrival_city, return_flight_number,
            flight_info
        } = req.body;
        
        // Validate required fields
        if (!name || !price || !departure_date || !return_date || !quota) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['name', 'price', 'departure_date', 'return_date', 'quota']
            });
        }
        
        // Generate code if not provided
        const packageCode = code || `PKG-${Date.now()}`;
        
        const result = await db.query(
            `INSERT INTO core.packages (
                name, code, description, price, departure_date, return_date,
                quota, makkah_hotel, madinah_hotel, makkah_nights, madinah_nights,
                airline, brochure_image, package_info, package_images, status,
                departure_city, transit_city_departure, arrival_city, departure_flight_number,
                return_departure_city, transit_city_return, return_arrival_city, return_flight_number,
                flight_info
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
            RETURNING *`,
            [
                name, packageCode, description, price, departure_date, return_date,
                quota, makkah_hotel, madinah_hotel, makkah_nights || 0, madinah_nights || 0,
                airline, brochure_image, package_info, JSON.stringify(package_images || []), 'active',
                departure_city, transit_city_departure, arrival_city, departure_flight_number,
                return_departure_city, transit_city_return, return_arrival_city, return_flight_number,
                flight_info
            ]
        );
        
        // Log activity
        await db.query(
            `INSERT INTO core.activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                req.user.id, 'CREATE', 'package', result.rows[0].id,
                JSON.stringify({ name, price }),
                req.ip, req.get('user-agent')
            ]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating package:', error);
        res.status(500).json({ error: 'Failed to create package' });
    }
});

// PUT /api/packages/:id - Update package
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Remove fields that shouldn't be updated
        delete updates.id;
        delete updates.created_at;
        delete updates.updated_at;
        
        // Build update query
        const updateFields = [];
        const values = [];
        let paramCount = 1;
        
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                updateFields.push(`${key} = $${paramCount}`);
                values.push(updates[key]);
                paramCount++;
            }
        });
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        // Add updated_at
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        
        // Add id for WHERE clause
        values.push(id);
        
        const result = await db.query(
            `UPDATE core.packages 
             SET ${updateFields.join(', ')}
             WHERE id = $${paramCount}
             RETURNING *`,
            values
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }
        
        // Log activity
        await db.query(
            `INSERT INTO core.activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                req.user.id, 'UPDATE', 'package', id,
                JSON.stringify(updates),
                req.ip, req.get('user-agent')
            ]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating package:', error);
        res.status(500).json({ error: 'Failed to update package' });
    }
});

// DELETE /api/packages/:id - Soft delete package
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if package has active registrations
        const registrations = await db.query(
            'SELECT COUNT(*) FROM jamaah.package_registrations WHERE package_id = $1 AND status = $2',
            [id, 'active']
        );
        
        if (parseInt(registrations.rows[0].count) > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete package with active registrations',
                active_registrations: registrations.rows[0].count
            });
        }
        
        // Soft delete by changing status
        const result = await db.query(
            `UPDATE core.packages 
             SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }
        
        // Log activity
        await db.query(
            `INSERT INTO core.activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                req.user.id, 'DELETE', 'package', id,
                JSON.stringify({ status: 'inactive' }),
                req.ip, req.get('user-agent')
            ]
        );
        
        res.json({ message: 'Package deleted successfully', data: result.rows[0] });
    } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({ error: 'Failed to delete package' });
    }
});

module.exports = router;