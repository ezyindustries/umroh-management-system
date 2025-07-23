#!/bin/bash

# Temporary script untuk check unit testing di server
SERVER="ezyindustries@103.181.143.223"
SSHPASS="!ndomi3 Halal"

echo "🧪 Checking unit tests on server..."

# Function to run SSH command with password
ssh_cmd() {
    sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

echo "1️⃣ Testing if container has Jest installed..."
ssh_cmd "docker exec umroh-management-staging npm list jest --prefix /app/backend || echo 'Jest not found'"

echo ""
echo "2️⃣ Running unit tests in container..."
ssh_cmd "docker exec umroh-management-staging npm test --prefix /app/backend || echo 'Test failed'"

echo ""
echo "3️⃣ Checking test files exist..."
ssh_cmd "docker exec umroh-management-staging ls -la /app/backend/tests/unit/"

echo ""
echo "4️⃣ Checking test setup..."
ssh_cmd "docker exec umroh-management-staging ls -la /app/backend/tests/setup.js"

echo ""
echo "✅ Test check completed!"