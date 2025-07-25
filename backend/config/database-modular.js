// Modular Database Configuration
const { Pool } = require('pg');

// Database connection pools per module
const pools = {
    // Main pool for core data
    core: new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'umroh_management',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        max: 20, // Maximum connections
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    }),
    
    // Can add separate pools for read replicas if needed
    readonly: new Pool({
        host: process.env.DB_READONLY_HOST || process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'umroh_management',
        user: process.env.DB_READONLY_USER || process.env.DB_USER || 'postgres',
        password: process.env.DB_READONLY_PASSWORD || process.env.DB_PASSWORD,
        max: 30,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    })
};

// Query helper with automatic schema selection
const query = async (schema, text, params, useReadonly = false) => {
    const pool = useReadonly ? pools.readonly : pools.core;
    const client = await pool.connect();
    
    try {
        // Set search path to specific schema
        await client.query(`SET search_path TO ${schema}, core, public`);
        const result = await client.query(text, params);
        return result;
    } catch (error) {
        console.error(`Database error in schema ${schema}:`, error);
        throw error;
    } finally {
        client.release();
    }
};

// Transaction helper
const transaction = async (schema, callback) => {
    const client = await pools.core.connect();
    
    try {
        await client.query('BEGIN');
        await client.query(`SET search_path TO ${schema}, core, public`);
        
        const result = await callback(client);
        
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Module-specific query helpers
const db = {
    // Core module
    core: {
        query: (text, params, readonly = false) => query('core', text, params, readonly),
        transaction: (callback) => transaction('core', callback)
    },
    
    // Jamaah module
    jamaah: {
        query: (text, params, readonly = false) => query('jamaah', text, params, readonly),
        transaction: (callback) => transaction('jamaah', callback)
    },
    
    // Payment module
    payment: {
        query: (text, params, readonly = false) => query('payment', text, params, readonly),
        transaction: (callback) => transaction('payment', callback)
    },
    
    // Flight module
    flight: {
        query: (text, params, readonly = false) => query('flight', text, params, readonly),
        transaction: (callback) => transaction('flight', callback)
    },
    
    // Hotel module
    hotel: {
        query: (text, params, readonly = false) => query('hotel', text, params, readonly),
        transaction: (callback) => transaction('hotel', callback)
    },
    
    // Inventory module
    inventory: {
        query: (text, params, readonly = false) => query('inventory', text, params, readonly),
        transaction: (callback) => transaction('inventory', callback)
    },
    
    // Reports can query across schemas
    reports: {
        query: async (text, params) => {
            const client = await pools.readonly.connect();
            try {
                // Reports have access to all schemas
                await client.query('SET search_path TO reports, jamaah, payment, flight, hotel, inventory, core, public');
                const result = await client.query(text, params);
                return result;
            } finally {
                client.release();
            }
        }
    }
};

// Connection health check
const checkConnection = async () => {
    try {
        await pools.core.query('SELECT NOW()');
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
};

// Graceful shutdown
const shutdown = async () => {
    await Promise.all([
        pools.core.end(),
        pools.readonly.end()
    ]);
};

module.exports = {
    db,
    checkConnection,
    shutdown
};