const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'umroh_management',
    user: 'platform_admin',
    password: 'ezyindustries_db_2025'
});

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, '../migrations/add_pnr_additional_fields.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await pool.query(sql);
        console.log('Migration completed successfully');
        console.log('Added fields: payment_due_date, insert_name_deadline, ticket_total_price, ticket_paid_amount');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

runMigration();