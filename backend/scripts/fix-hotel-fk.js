const { query } = require('../config/database');

async function fixForeignKey() {
  try {
    // Drop the existing constraint
    await query(`
      ALTER TABLE hotel_bookings 
      DROP CONSTRAINT IF EXISTS hotel_bookings_package_id_fkey
    `);
    console.log('Dropped existing foreign key constraint');
    
    // Add the new constraint with correct schema
    await query(`
      ALTER TABLE hotel_bookings 
      ADD CONSTRAINT hotel_bookings_package_id_fkey 
      FOREIGN KEY (package_id) 
      REFERENCES core.packages(id) 
      ON DELETE CASCADE
    `);
    console.log('Added new foreign key constraint with core schema');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixForeignKey();