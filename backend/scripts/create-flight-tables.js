require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

async function runFlightMigration() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'umroh_management',
    user: process.env.DB_USER || 'platform_admin',
    password: process.env.DB_PASSWORD || 'ezyindustries_db_2025',
  });

  try {
    console.log('Running flight management migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/create_flight_management_tables.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    // Execute the entire migration as one query
    await pool.query(migrationSQL);
    
    console.log('Flight management tables created successfully!');
    
    // Verify tables were created
    const verifyQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'flight'
      ORDER BY table_name;
    `;
    
    const result = await pool.query(verifyQuery);
    console.log('\nCreated tables:');
    result.rows.forEach(row => {
      console.log(`- flight.${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
runFlightMigration();