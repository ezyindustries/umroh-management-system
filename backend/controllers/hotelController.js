const pool = require('../config/database').pool;
const logger = require('../config/logging').logger;
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = 'uploads/hotels';
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'hotel-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, JPG, PNG, DOC, DOCX files are allowed'));
        }
    }
}).single('document');

class HotelController {
    // Get all hotels with filters
    async getHotels(req, res) {
        try {
            const { package_id, city, payment_status, visa_status, limit = 50, offset = 0 } = req.query;
            
            let query = `
                SELECT 
                    h.*,
                    p.name as package_name,
                    p.code as package_code,
                    p.departure_date as package_departure_date,
                    COUNT(DISTINCT hd.id) as document_count,
                    COUNT(DISTINCT hph.id) as payment_count
                FROM hotel_summary h
                LEFT JOIN packages p ON h.package_id = p.id
                LEFT JOIN hotel_documents hd ON h.id = hd.hotel_id
                LEFT JOIN hotel_payment_history hph ON h.id = hph.hotel_id
                WHERE 1=1
            `;
            
            const params = [];
            
            if (package_id) {
                params.push(package_id);
                query += ` AND h.package_id = $${params.length}`;
            }
            
            if (city) {
                params.push(`%${city}%`);
                query += ` AND h.city ILIKE $${params.length}`;
            }
            
            if (payment_status) {
                params.push(payment_status);
                query += ` AND h.payment_status = $${params.length}`;
            }
            
            if (visa_status) {
                params.push(visa_status);
                query += ` AND h.visa_approval_status = $${params.length}`;
            }
            
            query += ` GROUP BY h.id, p.id, h.package_name, h.package_code, h.package_departure_date, 
                      h.is_fully_paid, h.payment_percentage`;
            query += ` ORDER BY h.created_at DESC`;
            query += ` LIMIT ${limit} OFFSET ${offset}`;
            
            const result = await pool.query(query, params);
            
            res.json({
                hotels: result.rows,
                total: result.rowCount
            });
        } catch (error) {
            logger.error('Error getting hotels:', error);
            res.status(500).json({ error: 'Failed to get hotels' });
        }
    }

    // Get single hotel with details
    async getHotel(req, res) {
        try {
            const { id } = req.params;
            
            const hotelQuery = await pool.query(
                `SELECT h.*, p.name as package_name, p.code as package_code
                FROM hotels h
                LEFT JOIN packages p ON h.package_id = p.id
                WHERE h.id = $1`,
                [id]
            );
            
            if (hotelQuery.rows.length === 0) {
                return res.status(404).json({ error: 'Hotel not found' });
            }
            
            const documentsQuery = await pool.query(
                'SELECT * FROM hotel_documents WHERE hotel_id = $1 ORDER BY uploaded_at DESC',
                [id]
            );
            
            const paymentsQuery = await pool.query(
                'SELECT * FROM hotel_payment_history WHERE hotel_id = $1 ORDER BY payment_date DESC',
                [id]
            );
            
            res.json({
                hotel: hotelQuery.rows[0],
                documents: documentsQuery.rows,
                payments: paymentsQuery.rows
            });
        } catch (error) {
            logger.error('Error getting hotel:', error);
            res.status(500).json({ error: 'Failed to get hotel' });
        }
    }

    // Create new hotel
    async createHotel(req, res) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const {
                package_id,
                hotel_name,
                city,
                check_in_date,
                check_out_date,
                rooms_quad,
                rooms_double,
                rooms_triple,
                payment_amount,
                provider_name,
                provider_contact,
                meal_type,
                notes
            } = req.body;
            
            const result = await client.query(
                `INSERT INTO hotels (
                    package_id, hotel_name, city, check_in_date, check_out_date,
                    rooms_quad, rooms_double, rooms_triple, payment_amount,
                    provider_name, provider_contact, meal_type, notes, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *`,
                [
                    package_id, hotel_name, city, check_in_date, check_out_date,
                    rooms_quad || 0, rooms_double || 0, rooms_triple || 0, payment_amount || 0,
                    provider_name, provider_contact, meal_type, notes, req.user.id
                ]
            );
            
            await client.query('COMMIT');
            
            res.status(201).json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error creating hotel:', error);
            res.status(500).json({ error: 'Failed to create hotel' });
        } finally {
            client.release();
        }
    }

    // Update hotel
    async updateHotel(req, res) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const { id } = req.params;
            const {
                hotel_name,
                city,
                check_in_date,
                check_out_date,
                rooms_quad,
                rooms_double,
                rooms_triple,
                visa_approval_status,
                visa_approval_date,
                payment_amount,
                provider_name,
                provider_contact,
                meal_type,
                notes
            } = req.body;
            
            const result = await client.query(
                `UPDATE hotels SET
                    hotel_name = $1,
                    city = $2,
                    check_in_date = $3,
                    check_out_date = $4,
                    rooms_quad = $5,
                    rooms_double = $6,
                    rooms_triple = $7,
                    visa_approval_status = $8,
                    visa_approval_date = $9,
                    payment_amount = $10,
                    provider_name = $11,
                    provider_contact = $12,
                    meal_type = $13,
                    notes = $14,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $15
                RETURNING *`,
                [
                    hotel_name, city, check_in_date, check_out_date,
                    rooms_quad || 0, rooms_double || 0, rooms_triple || 0,
                    visa_approval_status, visa_approval_date, payment_amount || 0,
                    provider_name, provider_contact, meal_type, notes, id
                ]
            );
            
            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Hotel not found' });
            }
            
            await client.query('COMMIT');
            
            res.json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error updating hotel:', error);
            res.status(500).json({ error: 'Failed to update hotel' });
        } finally {
            client.release();
        }
    }

    // Upload document
    async uploadDocument(req, res) {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            
            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');
                
                const { id } = req.params;
                const { document_type } = req.body;
                
                // Save document record
                const documentResult = await client.query(
                    `INSERT INTO hotel_documents 
                    (hotel_id, document_type, document_name, document_url, file_size, uploaded_by)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *`,
                    [
                        id,
                        document_type || 'confirmation_letter',
                        req.file.originalname,
                        req.file.path,
                        req.file.size,
                        req.user.id
                    ]
                );
                
                // Update hotel if confirmation letter
                if (document_type === 'confirmation_letter') {
                    await client.query(
                        `UPDATE hotels 
                        SET confirmation_letter_url = $1, 
                            confirmation_letter_uploaded_at = CURRENT_TIMESTAMP
                        WHERE id = $2`,
                        [req.file.path, id]
                    );
                }
                
                await client.query('COMMIT');
                
                res.json(documentResult.rows[0]);
            } catch (error) {
                await client.query('ROLLBACK');
                logger.error('Error uploading document:', error);
                res.status(500).json({ error: 'Failed to upload document' });
            } finally {
                client.release();
            }
        });
    }

    // Record payment
    async recordPayment(req, res) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const { id } = req.params;
            const { payment_date, amount, payment_method, reference_number, notes } = req.body;
            
            const result = await client.query(
                `INSERT INTO hotel_payment_history 
                (hotel_id, payment_date, amount, payment_method, reference_number, notes, recorded_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [id, payment_date, amount, payment_method, reference_number, notes, req.user.id]
            );
            
            await client.query('COMMIT');
            
            res.json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error recording payment:', error);
            res.status(500).json({ error: 'Failed to record payment' });
        } finally {
            client.release();
        }
    }

    // Delete hotel
    async deleteHotel(req, res) {
        try {
            const { id } = req.params;
            
            const result = await pool.query(
                'DELETE FROM hotels WHERE id = $1 RETURNING id',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Hotel not found' });
            }
            
            res.json({ message: 'Hotel deleted successfully' });
        } catch (error) {
            logger.error('Error deleting hotel:', error);
            res.status(500).json({ error: 'Failed to delete hotel' });
        }
    }

    // Get hotels by package
    async getHotelsByPackage(req, res) {
        try {
            const { packageId } = req.params;
            
            const result = await pool.query(
                `SELECT h.*, 
                    COUNT(DISTINCT hd.id) as document_count,
                    COUNT(DISTINCT hph.id) as payment_count
                FROM hotels h
                LEFT JOIN hotel_documents hd ON h.id = hd.hotel_id
                LEFT JOIN hotel_payment_history hph ON h.id = hph.hotel_id
                WHERE h.package_id = $1
                GROUP BY h.id
                ORDER BY h.check_in_date`,
                [packageId]
            );
            
            res.json(result.rows);
        } catch (error) {
            logger.error('Error getting hotels by package:', error);
            res.status(500).json({ error: 'Failed to get hotels' });
        }
    }
}

module.exports = new HotelController();