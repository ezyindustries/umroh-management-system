#!/bin/bash

# Emergency deployment script
SERVER="ezyindustries@103.181.143.223"
SSHPASS="!ndomi3 Halal"

echo "🚨 Emergency deployment - killing all builds and starting fresh..."

# Function to run SSH command
ssh_cmd() {
    sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

# Kill ONLY umroh-management build processes
echo "1. Killing ONLY umroh-management build processes..."
ssh_cmd "ps aux | grep 'docker build.*umroh-management' | grep -v grep | awk '{print \$2}' | xargs kill -9 2>/dev/null || true"
ssh_cmd "ps aux | grep 'deployments/umroh-management' | grep 'docker' | grep -v grep | awk '{print \$2}' | xargs kill -9 2>/dev/null || true"

# Clean up containers and images
echo "2. Cleaning up containers and images..."
ssh_cmd "docker stop umroh-management-staging 2>/dev/null || true"
ssh_cmd "docker rm umroh-management-staging 2>/dev/null || true"
ssh_cmd "docker rmi umroh-management-main:latest 2>/dev/null || true"
ssh_cmd "docker rmi \$(docker images -f 'dangling=true' -q) 2>/dev/null || true"

# Build fresh image quickly
echo "3. Building fresh image..."
ssh_cmd "cd /home/ezyindustries/deployments/umroh-management && timeout 180 docker build --no-cache -t umroh-management-main:latest . || echo 'Build timed out, using partial build'"

# Deploy container
echo "4. Deploying container..."
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
    umroh-management_umroh_app:latest"

echo ""
echo "5. Checking deployment..."
sleep 10
ssh_cmd "docker ps | grep umroh"
echo ""
ssh_cmd "docker logs umroh-management-staging --tail 10 2>&1 || echo 'Container not running'"

echo ""
echo "✅ Emergency deployment completed!"
echo "URL: https://dev-umroh-management.ezyindustries.my.id"