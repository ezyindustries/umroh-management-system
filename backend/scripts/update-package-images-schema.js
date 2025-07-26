const { db } = require('../config/database');

async function updateSchema() {
    try {
        await db.query(`
            ALTER TABLE core.packages 
            ADD COLUMN IF NOT EXISTS package_images JSON
        `);
        
        await db.query(`
            COMMENT ON COLUMN core.packages.package_images IS 'JSON array of package images URLs or base64 data'
        `);
        
        console.log('Successfully added package_images column');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();