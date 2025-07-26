const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'umroh_management',
    user: process.env.DB_USER || 'platform_admin',
    password: process.env.DB_PASSWORD || 'ezyindustries_db_2025'
});

async function runMigration() {
    try {
        console.log('Starting database migration...');
        
        // Read migration file
        const migrationPath = path.join(__dirname, 'database', 'create-jamaah-schema.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Run migration
        await pool.query(migrationSQL);
        
        console.log('Migration completed successfully!');
        
        // Check created tables
        const tablesResult = await pool.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema IN ('core', 'jamaah', 'finance')
            ORDER BY table_schema, table_name
        `);
        
        console.log('\nCreated tables:');
        tablesResult.rows.forEach(row => {
            console.log(`- ${row.table_schema}.${row.table_name}`);
        });
        
        // Check sample data
        const packagesResult = await pool.query('SELECT id, name, departure_date FROM core.packages');
        console.log('\nSample packages:');
        packagesResult.rows.forEach(pkg => {
            console.log(`- ${pkg.name} (${pkg.departure_date})`);
        });
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();