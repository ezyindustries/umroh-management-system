#!/bin/bash

# Initialize admin user
SERVER="ezyindustries@103.181.143.223"
SSHPASS="!ndomi3 Halal"

echo "📝 Initializing admin user..."

# Function to run SSH command
ssh_cmd() {
    sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

# Create admin user via API endpoint
echo "Creating admin user via container..."
ssh_cmd "docker exec umroh-management-staging node -e \"
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function createAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Check if admin exists
    const check = await pool.query('SELECT COUNT(*) FROM users WHERE username = \\\$1', ['admin']);
    
    if (parseInt(check.rows[0].count) === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(
        'INSERT INTO users (username, email, password_hash, full_name, role_name, phone) VALUES (\\\$1, \\\$2, \\\$3, \\\$4, \\\$5, \\\$6)',
        ['admin', 'admin@umroh.com', hashedPassword, 'Administrator', 'Admin', '081234567890']
      );
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
\""

echo ""
echo "✅ Admin initialization completed!"
echo "Try login with: username=admin, password=admin123"