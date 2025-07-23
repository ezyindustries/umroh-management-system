const { setupDatabase, query } = require('../config/database');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing PostgreSQL connection...');
  console.log('Connection details:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.DB_PORT || 5432}`);
  console.log(`  Database: ${process.env.DB_NAME || 'umroh_management'}`);
  console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
  console.log(`  Using DATABASE_URL: ${!!process.env.DATABASE_URL}`);
  
  try {
    // Test database connection
    await setupDatabase();
    console.log('✅ Database connection successful!');
    
    // Test simple query
    const result = await query('SELECT 1 as test');
    console.log('✅ Simple query test passed:', result.rows[0]);
    
    // Test current timestamp
    const timeResult = await query('SELECT NOW() as current_time');
    console.log('✅ Timestamp query test passed:', timeResult.rows[0].current_time);
    
    // Check if tables exist
    const tablesResult = await query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
      LIMIT 5
    `);
    
    console.log('✅ Found tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.tablename}`);
    });
    
    // Test placeholder conversion
    const placeholderTest = await query(
      'SELECT $1 as first, $2 as second', 
      ['test1', 'test2']
    );
    console.log('✅ Placeholder conversion test passed:', placeholderTest.rows[0]);
    
    console.log('\n🎉 All tests passed! PostgreSQL is properly configured.');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Connection test failed!');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testConnection();