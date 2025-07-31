require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function addFlightFields() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'umroh_management',
    user: process.env.DB_USER || 'platform_admin',
    password: process.env.DB_PASSWORD || 'ezyindustries_db_2025',
  });

  try {
    console.log('Adding flight fields to packages table...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/add_flight_fields_to_packages.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('Flight fields added successfully!');
    
    // Verify the columns were added
    const verifyQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'core' 
      AND table_name = 'packages' 
      AND column_name IN ('pnr_code', 'ticket_vendor', 'ticket_number', 'flight_payment_status', 'flight_notes')
      ORDER BY column_name;
    `;
    
    const result = await pool.query(verifyQuery);
    console.log('\nAdded columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type})`);
    });
    
  } catch (error) {
    console.error('Error adding flight fields:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
addFlightFields();