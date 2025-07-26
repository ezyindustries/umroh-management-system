const { db } = require('../config/database');

async function checkConstraints() {
    try {
        // Check document type constraint
        const result = await db.query(`
            SELECT conname, consrc 
            FROM pg_constraint 
            WHERE conname LIKE '%document_type%'
        `);
        
        console.log('Document type constraints:');
        console.log(result.rows);
        
        // Also check table columns
        const columns = await db.query(`
            SELECT column_name, data_type, character_maximum_length, column_default
            FROM information_schema.columns
            WHERE table_schema = 'jamaah' AND table_name = 'documents'
            ORDER BY ordinal_position
        `);
        
        console.log('\nDocuments table structure:');
        console.log(columns.rows);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkConstraints();