#!/bin/bash

# Final deployment with proper build
SERVER="ezyindustries@103.181.143.223"
SSHPASS="!ndomi3 Halal"

echo "🚀 Final deployment with proper build..."

# Function to run SSH command
ssh_cmd() {
    sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

# Stop and remove old containers
echo "1. Cleaning up old containers..."
ssh_cmd "docker stop umroh-management-staging 2>/dev/null || true"
ssh_cmd "docker rm umroh-management-staging 2>/dev/null || true"

# Remove old images
echo "2. Removing old images..."
ssh_cmd "docker rmi umroh-management-main:latest 2>/dev/null || true"
ssh_cmd "docker rmi umroh-management_umroh_app:latest 2>/dev/null || true"

# Wait for any builds to finish
echo "3. Waiting for builds to finish..."
ssh_cmd "while pgrep -f 'docker build' > /dev/null; do echo 'Waiting for build...'; sleep 5; done"

# Check if new image exists
echo "4. Checking for new image..."
ssh_cmd "docker images | grep umroh"

# Deploy container
echo "5. Deploying container..."
ssh_cmd "docker run -d \
    --name umroh-management-staging \
    --network infrastructure_platform-network \
    --restart=unless-stopped \
    --label traefik.enable=true \
    --label traefik.http.services.umroh-management-staging.loadbalancer.server.port=5000 \
    --label traefik.http.routers.umroh-management-staging.entrypoints=websecure \
    --label traefik.http.routers.umroh-management-staging.tls.certresolver=letsencrypt \
    --label 'traefik.http.routers.umroh-management-staging.rule=Host(\`dev-umroh-management.ezyindustries.my.id\`)' \
    --label traefik.http.routers.umroh-management-staging-http.entrypoints=web \
    --label traefik.http.routers.umroh-management-staging-http.middlewares=redirect-to-https \
    --label 'traefik.http.routers.umroh-management-staging-http.rule=Host(\`dev-umroh-management.ezyindustries.my.id\`)' \
    -e NODE_ENV=production \
    -e PORT=5000 \
    -e DATABASE_URL='postgresql://platform_admin:ezyindustries_db_2025@postgres-platform:5432/umroh_management_staging' \
    -e DB_HOST=postgres-platform \
    -e DB_PORT=5432 \
    -e DB_USER=platform_admin \
    -e DB_PASSWORD=ezyindustries_db_2025 \
    -e DB_NAME=umroh_management_staging \
    -e JWT_SECRET=umroh-jwt-secret-2025 \
    umroh-management-main:latest"

echo ""
echo "6. Checking deployment..."
sleep 15
ssh_cmd "docker ps | grep umroh"
echo ""
ssh_cmd "docker logs umroh-management-staging --tail 20"

echo ""
echo "✅ Final deployment completed!"
echo "URL: https://dev-umroh-management.ezyindustries.my.id"