const { db } = require('../config/database');

async function checkUsersTable() {
    try {
        // Check table structure
        const result = await db.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'core' AND table_name = 'users'
            ORDER BY ordinal_position
        `);
        
        console.log('Core.users table structure:');
        console.log(result.rows);
        
        process.exit(0);
    } catch (error) {
        console.error('Error checking table:', error);
        process.exit(1);
    }
}

checkUsersTable();