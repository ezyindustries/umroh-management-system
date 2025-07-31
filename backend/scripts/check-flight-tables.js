require('dotenv').config();
const { Pool } = require('pg');

async function checkFlightTables() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'umroh_management',
    user: process.env.DB_USER || 'platform_admin',
    password: process.env.DB_PASSWORD || 'ezyindustries_db_2025',
  });

  try {
    // Check if flight schema exists
    const schemaQuery = `
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'flight';
    `;
    
    const schemaResult = await pool.query(schemaQuery);
    
    if (schemaResult.rows.length === 0) {
      console.log('Flight schema does not exist.');
      return;
    }
    
    console.log('Flight schema exists.');
    
    // Check tables in flight schema
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'flight'
      ORDER BY table_name;
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    
    console.log('\nTables in flight schema:');
    tablesResult.rows.forEach(row => {
      console.log(`- flight.${row.table_name}`);
    });
    
    // Check columns for each table
    for (const row of tablesResult.rows) {
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'flight' AND table_name = $1
        ORDER BY ordinal_position;
      `;
      
      const columnsResult = await pool.query(columnsQuery, [row.table_name]);
      
      console.log(`\nColumns in flight.${row.table_name}:`);
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
checkFlightTables();