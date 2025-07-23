#!/bin/bash

# Force rebuild and deploy script
SERVER="ezyindustries@103.181.143.223"
SSHPASS="!ndomi3 Halal"

echo "🔨 Force rebuild and deploy..."

# Function to run SSH command
ssh_cmd() {
    sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

# Remove old images
echo "1. Removing old images..."
ssh_cmd "docker images | grep umroh-management | awk '{print \$3}' | xargs docker rmi -f 2>/dev/null || true"

# Upload latest code
echo "2. Uploading latest code..."
export SSHPASS="$SSHPASS"
sshpass -e rsync -avz --progress \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude '*.log' \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./ "$SERVER:/home/ezyindustries/deployments/umroh-management/"

# Build image with no cache
echo "3. Building Docker image (no cache)..."
ssh_cmd "cd /home/ezyindustries/deployments/umroh-management && docker build --no-cache -t umroh-management-main:latest . 2>&1 | tail -50"

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
    -e NODE_ENV=staging \
    -e APP_ENV=staging \
    -e PORT=5000 \
    -e DATABASE_URL='postgresql://umroh_management_staging_user:ezyindustries_db_2025@postgres-platform:5432/umroh_management_staging' \
    -e DB_HOST=postgres-platform \
    -e DB_PORT=5432 \
    -e DB_USER=umroh_management_staging_user \
    -e DB_PASSWORD=ezyindustries_db_2025 \
    -e DB_NAME=umroh_management_staging \
    -e JWT_SECRET=umroh-jwt-secret-2025 \
    -e REDIS_URL=redis://redis-platform:6379 \
    umroh-management-main:latest"

echo ""
echo "5. Checking deployment..."
sleep 10
ssh_cmd "docker ps | grep umroh"
echo ""
ssh_cmd "docker logs umroh-management-staging --tail 20"

echo ""
echo "✅ Force rebuild completed!"
echo "Check: https://dev-umroh-management.ezyindustries.my.id"