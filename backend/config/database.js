const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'umroh_management',
    user: process.env.DB_USER || 'platform_admin',
    password: process.env.DB_PASSWORD || 'ezyindustries_db_2025',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Helper functions
const db = {
    query: (text, params) => pool.query(text, params),
    
    // Get single row
    getOne: async (text, params) => {
        const result = await pool.query(text, params);
        return result.rows[0] || null;
    },
    
    // Get multiple rows
    getMany: async (text, params) => {
        const result = await pool.query(text, params);
        return result.rows;
    },
    
    // Transaction helper
    transaction: async (callback) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

// Setup database connection
const setupDatabase = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('Database connection established');
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
};

// Graceful shutdown
const closeDatabase = async () => {
    await pool.end();
    console.log('Database pool closed');
};

module.exports = {
    db,
    pool,
    setupDatabase,
    closeDatabase
};