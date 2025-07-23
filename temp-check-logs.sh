#!/bin/bash

# Temporary script untuk check container logs
SERVER="ezyindustries@103.181.143.223"
SSHPASS="!ndomi3 Halal"

echo "🔍 Checking container logs..."

# Function to run SSH command with password
ssh_cmd() {
    sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

echo "1️⃣ Container status..."
ssh_cmd "docker ps | grep umroh"

echo ""
echo "2️⃣ Container logs (last 20 lines)..."
ssh_cmd "docker logs umroh-management-staging --tail 20"

echo ""
echo "3️⃣ Check if container is accessible internally..."
ssh_cmd "curl -f http://localhost:5000/api/health 2>/dev/null || echo 'Internal health check failed'"

echo ""
echo "4️⃣ Check if Jest is in production build..."
ssh_cmd "docker exec umroh-management-staging ls -la /app/backend/node_modules/.bin/ | grep jest || echo 'Jest not in production'"

echo ""
echo "✅ Log check completed!"