const { db } = require('../config/database');

async function deleteAllPackages() {
    try {
        console.log('⚠️  WARNING: This will delete ALL packages from the database!');
        console.log('Starting deletion process...\n');
        
        // First, get count of packages to be deleted
        const countResult = await db.query('SELECT COUNT(*) as total FROM core.packages');
        const totalPackages = countResult.rows[0].total;
        
        console.log(`Found ${totalPackages} packages to delete.`);
        
        if (totalPackages > 0) {
            // First delete related payments
            const deletePayments = await db.query('DELETE FROM finance.payments WHERE package_id IS NOT NULL');
            console.log(`✅ Successfully deleted ${deletePayments.rowCount} payments related to packages.`);
            
            // Delete related package registrations
            const deleteRegistrations = await db.query('DELETE FROM jamaah.package_registrations');
            console.log(`✅ Successfully deleted ${deleteRegistrations.rowCount} package registrations.`);
            
            // Finally delete all packages
            const deleteResult = await db.query('DELETE FROM core.packages');
            console.log(`✅ Successfully deleted ${deleteResult.rowCount} packages.`);
        } else {
            console.log('No packages found in database.');
        }
        
        console.log('\n✨ Database cleanup completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error deleting packages:', error);
        process.exit(1);
    }
}

// Add confirmation prompt
console.log('======================================');
console.log('  DELETE ALL PACKAGES FROM DATABASE');
console.log('======================================');
console.log('\nThis action will permanently delete:');
console.log('- All packages from core.packages table');
console.log('- All related package registrations');
console.log('\nThis action cannot be undone!');
console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n');

setTimeout(() => {
    deleteAllPackages();
}, 5000);