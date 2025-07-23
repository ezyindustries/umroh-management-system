const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  let client;
  
  try {
    console.log('🚀 Starting PostgreSQL database initialization...');
    
    // Connect to PostgreSQL server (to postgres database first)
    const connectionConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: 'postgres' // Connect to default database first
    };
    
    client = new Client(connectionConfig);
    await client.connect();
    
    console.log('✅ Connected to PostgreSQL server');
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'umroh_management';
    
    // Check if database exists
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const dbExists = await client.query(checkDbQuery, [dbName]);
    
    if (dbExists.rows.length === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created`);
    } else {
      console.log(`✅ Database "${dbName}" already exists`);
    }
    
    // Disconnect and reconnect to the new database
    await client.end();
    
    connectionConfig.database = dbName;
    client = new Client(connectionConfig);
    await client.connect();
    
    console.log(`✅ Connected to database "${dbName}"`);
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, '../../database/schema-postgres.sql');
    const schemaSQL = await fs.readFile(schemaPath, 'utf8');
    
    // Execute the entire schema at once (PostgreSQL can handle it)
    try {
      await client.query(schemaSQL);
      console.log('✅ Schema created successfully');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Some tables already exist, continuing...');
      } else {
        throw error;
      }
    }
    
    // Verify tables were created
    const tablesQuery = `
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;
    const tables = await client.query(tablesQuery);
    console.log(`✅ Found ${tables.rows.length} tables:`);
    tables.rows.forEach(table => {
      console.log(`   - ${table.tablename}`);
    });
    
    // Check if admin user exists
    const adminQuery = 'SELECT COUNT(*) as count FROM users WHERE role_name = $1';
    const adminResult = await client.query(adminQuery, ['Admin']);
    
    if (parseInt(adminResult.rows[0].count) === 0) {
      console.log('⚠️  No admin user found, creating default admin...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const insertAdminQuery = `
        INSERT INTO users (username, email, password_hash, full_name, role_name, phone) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      
      await client.query(insertAdminQuery, [
        'admin', 
        'admin@umroh.com', 
        hashedPassword, 
        'Administrator', 
        'Admin', 
        '081234567890'
      ]);
      
      console.log('✅ Default admin user created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Email: admin@umroh.com');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Insert sample data if requested
    if (process.argv.includes('--with-sample-data')) {
      console.log('\n📋 Inserting sample data...');
      await insertSampleData(client);
    }
    
    console.log('\n🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

async function insertSampleData(client) {
  try {
    // Insert sample packages
    const packageQuery = `
      INSERT INTO packages (name, departure_date, return_date, duration, price, quota, makkah_hotel, madinah_hotel, makkah_nights, madinah_nights, airline, description, status)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13),
        ($14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      ON CONFLICT DO NOTHING
    `;
    
    const packageValues = [
      // Package 1
      'Umroh Reguler Ramadhan 2025',
      '2025-03-15',
      '2025-03-24',
      9,
      25000000,
      100,
      'Hilton Makkah',
      'Movenpick Madinah',
      5,
      4,
      'Garuda Indonesia',
      'Paket umroh reguler dengan fasilitas hotel bintang 5',
      'active',
      // Package 2
      'Umroh Plus Istanbul 2025',
      '2025-04-10',
      '2025-04-22',
      12,
      35000000,
      50,
      'Swissotel Makkah',
      'Intercontinental Madinah',
      5,
      4,
      'Turkish Airlines',
      'Paket umroh plus wisata Istanbul dengan fasilitas premium',
      'active'
    ];
    
    await client.query(packageQuery, packageValues);
    console.log('✅ Sample packages inserted');
    
    // Insert sample jamaah
    const jamaahQuery = `
      INSERT INTO jamaah (full_name, nik, birth_date, birth_place, gender, phone, email, address, city, province, package_id)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11),
        ($12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      ON CONFLICT (nik) DO NOTHING
    `;
    
    const jamaahValues = [
      // Jamaah 1
      'Ahmad Sulaiman',
      '3171234567890001',
      '1980-05-15',
      'Jakarta',
      'L',
      '081234567890',
      'ahmad.sulaiman@email.com',
      'Jl. Kebon Jeruk No. 123',
      'Jakarta Barat',
      'DKI Jakarta',
      1,
      // Jamaah 2
      'Fatimah Zahra',
      '3171234567890002',
      '1985-08-20',
      'Bandung',
      'P',
      '081234567891',
      'fatimah.zahra@email.com',
      'Jl. Dago No. 456',
      'Bandung',
      'Jawa Barat',
      1
    ];
    
    await client.query(jamaahQuery, jamaahValues);
    console.log('✅ Sample jamaah data inserted');
    
  } catch (error) {
    console.error('⚠️  Error inserting sample data:', error.message);
  }
}

// Run initialization
initializeDatabase();