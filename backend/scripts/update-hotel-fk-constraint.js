const { query } = require('../config/database');

async function updateForeignKeyConstraint() {
  try {
    console.log('Starting foreign key constraint update...');
    
    // First, check if the constraint exists
    const constraintCheck = await query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'hotel_bookings' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'hotel_bookings_package_id_fkey'
    `);
    
    if (constraintCheck.rows.length > 0) {
      // Drop the existing constraint
      console.log('Dropping existing foreign key constraint...');
      await query(`
        ALTER TABLE hotel_bookings 
        DROP CONSTRAINT hotel_bookings_package_id_fkey
      `);
      console.log('✓ Dropped existing foreign key constraint');
    }
    
    // Add the new constraint with correct schema reference
    console.log('Adding new foreign key constraint with core.packages reference...');
    await query(`
      ALTER TABLE hotel_bookings 
      ADD CONSTRAINT hotel_bookings_package_id_fkey 
      FOREIGN KEY (package_id) 
      REFERENCES core.packages(id) 
      ON DELETE CASCADE
    `);
    console.log('✓ Added new foreign key constraint successfully');
    
    // Verify the constraint
    const verification = await query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'hotel_bookings'
        AND tc.constraint_name = 'hotel_bookings_package_id_fkey'
    `);
    
    if (verification.rows.length > 0) {
      const fk = verification.rows[0];
      console.log('\n✅ Foreign key constraint verified:');
      console.log(`   - Constraint: ${fk.constraint_name}`);
      console.log(`   - Table: ${fk.table_name}.${fk.column_name}`);
      console.log(`   - References: ${fk.foreign_table_schema}.${fk.foreign_table_name}.${fk.foreign_column_name}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating foreign key constraint:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

updateForeignKeyConstraint();