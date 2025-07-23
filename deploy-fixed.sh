#!/bin/bash

# Fixed deployment script
SERVER="ezyindustries@103.181.143.223"
SSHPASS="!ndomi3 Halal"

echo "🚀 Deploying with fixed role_id references..."

# Function to run SSH command
ssh_cmd() {
    sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

# Stop and remove old container
echo "1. Stopping old container..."
ssh_cmd "docker stop umroh-management-staging 2>/dev/null || true"
ssh_cmd "docker rm umroh-management-staging 2>/dev/null || true"

# Deploy new container with platform_admin user
echo "2. Deploying new container..."
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
    -e NODE_ENV=staging \
    -e APP_ENV=staging \
    -e PORT=5000 \
    -e DATABASE_URL='postgresql://platform_admin:ezyindustries_db_2025@postgres-platform:5432/umroh_management_staging' \
    -e DB_HOST=postgres-platform \
    -e DB_PORT=5432 \
    -e DB_USER=platform_admin \
    -e DB_PASSWORD=ezyindustries_db_2025 \
    -e DB_NAME=umroh_management_staging \
    -e JWT_SECRET=umroh-jwt-secret-2025 \
    -e JWT_EXPIRES_IN=24h \
    -e REDIS_URL=redis://redis-platform:6379 \
    umroh-management-main:latest"

# Check deployment
echo ""
echo "3. Checking deployment..."
sleep 10
ssh_cmd "docker ps | grep umroh"

echo ""
echo "4. Checking logs..."
ssh_cmd "docker logs umroh-management-staging --tail 30"

echo ""
echo "✅ Deployment completed!"
echo "Check: https://dev-umroh-management.ezyindustries.my.id"