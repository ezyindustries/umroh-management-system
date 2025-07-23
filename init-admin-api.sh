#!/bin/bash

# Initialize admin via API
echo "📝 Creating admin user via deployment script..."

# Use curl to trigger schema initialization
echo "1. Triggering health check to ensure schema is initialized..."
curl -s https://dev-umroh-management.ezyindustries.my.id/api/health

# Create a temporary script to run inside container
SERVER="ezyindustries@103.181.143.223"
SSHPASS="!ndomi3 Halal"

# Function to run SSH command
ssh_cmd() {
    sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

echo ""
echo "2. Running admin creation from backend directory..."
ssh_cmd "docker exec -w /app/backend umroh-management-staging node -e \"
const bcrypt = require('bcryptjs');
const { query } = require('./config/database');

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await query(
      'INSERT INTO users (username, email, password_hash, full_name, role_name, phone) VALUES (\\\$1, \\\$2, \\\$3, \\\$4, \\\$5, \\\$6) ON CONFLICT (username) DO NOTHING',
      ['admin', 'admin@umroh.com', hashedPassword, 'Administrator', 'Admin', '081234567890']
    );
    
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Setup database first
const { setupDatabase } = require('./config/database');
setupDatabase().then(() => {
  createAdmin();
}).catch(console.error);
\""

echo ""
echo "✅ Admin initialization completed!"
echo "Try login at: https://dev-umroh-management.ezyindustries.my.id"