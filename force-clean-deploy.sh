#!/bin/bash

# Force clean deployment
SERVER="ezyindustries@103.181.143.223"
SSHPASS="!ndomi3 Halal"

echo "🧹 Force clean deployment..."

# Function to run SSH command
ssh_cmd() {
    sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

# Stop and remove container
echo "1. Stopping and removing old container..."
ssh_cmd "docker stop umroh-management-staging 2>/dev/null || true"
ssh_cmd "docker rm umroh-management-staging 2>/dev/null || true"

# Remove old images to force rebuild
echo "2. Removing old Docker images..."
ssh_cmd "docker rmi umroh-management-main:latest 2>/dev/null || true"
ssh_cmd "docker system prune -f"

# Upload latest code
echo "3. Uploading latest code..."
export SSHPASS="$SSHPASS"
sshpass -e rsync -avz --delete --progress \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude 'frontend/build' \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./ "$SERVER:/home/ezyindustries/deployments/umroh-management-clean/"

# Build with no cache
echo "4. Building Docker image with no cache..."
ssh_cmd "cd /home/ezyindustries/deployments/umroh-management-clean && docker build --no-cache -t umroh-management-main:latest ."

# Deploy new container
echo "5. Deploying new container..."
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
    umroh-management-main:latest"

echo ""
echo "6. Checking deployment..."
sleep 15
ssh_cmd "docker ps | grep umroh"
echo ""
ssh_cmd "docker logs umroh-management-staging --tail 20"

echo ""
echo "✅ Clean deployment completed!"