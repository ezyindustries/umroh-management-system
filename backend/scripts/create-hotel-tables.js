const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        // Read the SQL file
        const sqlPath = path.join(__dirname, '../migrations/create_hotel_bookings_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Running hotel bookings table migration...');
        
        // Execute the SQL
        await pool.query(sql);
        
        console.log('✅ Hotel bookings table created successfully!');
        
        // Verify the table was created
        const checkTable = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'hotel_bookings'
        `);
        
        if (checkTable.rows.length > 0) {
            console.log('✅ Verified: hotel_bookings table exists');
            
            // Check columns
            const checkColumns = await pool.query(`
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'hotel_bookings' 
                ORDER BY ordinal_position
            `);
            
            console.log('\nTable columns:');
            checkColumns.rows.forEach(col => {
                console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

runMigration();