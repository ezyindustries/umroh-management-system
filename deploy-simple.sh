#!/bin/bash

# Simple deployment with existing image
SERVER="ezyindustries@103.181.143.223"
SSHPASS="!ndomi3 Halal"

echo "🚀 Simple deployment with existing image..."

# Function to run SSH command
ssh_cmd() {
    sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

# Stop old container
ssh_cmd "docker stop umroh-management-staging 2>/dev/null || true"
ssh_cmd "docker rm umroh-management-staging 2>/dev/null || true"

# Deploy with existing image
echo "Deploying container..."
ssh_cmd "docker run -d \
    --name umroh-management-staging \
    --network infrastructure_platform-network \
    --restart=unless-stopped \
    --label traefik.enable=true \
    --label traefik.http.services.umroh-management-staging.loadbalancer.server.port=5000 \
    --label traefik.http.routers.umroh-management-staging.entrypoints=websecure \
    --label traefik.http.routers.umroh-management-staging.tls.certresolver=letsencrypt \
    --label 'traefik.http.routers.umroh-management-staging.rule=Host(\`dev-umroh-management.ezyindustries.my.id\`)' \
    -e NODE_ENV=production \
    -e PORT=5000 \
    -e DATABASE_URL='postgresql://platform_admin:ezyindustries_db_2025@postgres-platform:5432/umroh_management_staging' \
    -e JWT_SECRET=umroh-jwt-secret-2025 \
    umroh-management-main:latest"

echo ""
echo "Checking..."
sleep 5
ssh_cmd "docker ps | grep umroh"

echo ""
echo "✅ Done!
URL: https://dev-umroh-management.ezyindustries.my.id"