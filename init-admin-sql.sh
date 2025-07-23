#!/bin/bash

# Initialize admin user using SQL
SERVER="ezyindustries@103.181.143.223"
SSHPASS="!ndomi3 Halal"

echo "📝 Initializing admin user via SQL..."

# Function to run SSH command
ssh_cmd() {
    sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

# Create admin user with pre-hashed password
# Password: admin123 hashed with bcrypt
HASHED_PASSWORD='$2a$10$ZjJhMjYwNzEtNmI2ZC00ODM5LWJmNjQtNGE4MTA3MzE3$w9DZxR.ebkCSmRKLXfPuue56HHiJckNzktNqH2qWcW2'

echo "Creating admin user in database..."
ssh_cmd "docker exec umroh-management-staging psql -U platform_admin -d umroh_management_staging -h postgres-platform -c \"
INSERT INTO users (username, email, password_hash, full_name, role_name, phone) 
VALUES ('admin', 'admin@umroh.com', '\$2a\$10\$J.KlOydBCJNmlyFQ0OYCh.2oR0SwzK6UNzU4gZdS5nFJSUbmCo7gO', 'Administrator', 'Admin', '081234567890')
ON CONFLICT (username) DO NOTHING;
\""

echo ""
echo "✅ Admin user created!"
echo "Try login with: username=admin, password=admin123"