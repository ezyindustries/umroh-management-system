const { db } = require('../config/database');

async function checkPackages() {
    try {
        console.log('=== CHECKING PACKAGES TABLE ===\n');
        
        // 1. Check if packages table exists
        const tableCheck = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'core' 
                AND table_name = 'packages'
            );
        `);
        
        console.log('1. Table exists:', tableCheck.rows[0].exists);
        
        if (!tableCheck.rows[0].exists) {
            console.log('   ❌ Table core.packages does not exist!');
            process.exit(1);
        }
        
        // 2. Check table structure
        const columns = await db.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'core' AND table_name = 'packages'
            ORDER BY ordinal_position;
        `);
        
        console.log('\n2. Table structure:');
        columns.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
        });
        
        // 3. Check existing packages
        const packages = await db.query('SELECT * FROM core.packages ORDER BY id');
        
        console.log(`\n3. Existing packages: ${packages.rows.length} found`);
        packages.rows.forEach(pkg => {
            console.log(`   - ID: ${pkg.id}, Name: ${pkg.name}`);
            console.log(`     Price: Rp ${parseInt(pkg.price).toLocaleString('id-ID')}`);
            console.log(`     Date: ${pkg.departure_date} to ${pkg.return_date}`);
            console.log(`     Quota: ${pkg.quota}, Status: ${pkg.status}`);
            console.log('');
        });
        
        // 4. Check if API routes exist
        console.log('4. Checking API routes...');
        
        // Check if packages routes file exists
        const fs = require('fs');
        const routesPath = './routes/packages.js';
        
        if (fs.existsSync(routesPath)) {
            console.log('   ✓ Routes file exists');
        } else {
            console.log('   ❌ Routes file NOT found at', routesPath);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkPackages();