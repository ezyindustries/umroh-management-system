#!/bin/bash

# Complete cleanup and fresh deployment script
SERVER="ezyindustries@103.181.143.223"
SSHPASS="!ndomi3 Halal"

echo "🧹 Complete cleanup and fresh deployment..."

# Function to run SSH command with retry
ssh_cmd() {
    local cmd="$1"
    local max_retries=3
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no \
            -o ServerAliveInterval=60 \
            -o ServerAliveCountMax=3 \
            -o ConnectTimeout=10 \
            -o ConnectionAttempts=3 \
            "$SERVER" "$cmd"; then
            return 0
        else
            retry_count=$((retry_count + 1))
            echo "⚠️  SSH command failed. Retrying ($retry_count/$max_retries)..."
            sleep 2
        fi
    done
    
    echo "❌ SSH command failed after $max_retries attempts"
    return 1
}

# 1. Stop and remove ALL umroh-related containers
echo "1. Removing ALL umroh-related containers..."
ssh_cmd "docker ps -a | grep umroh | awk '{print \$1}' | xargs docker stop 2>/dev/null || true"
ssh_cmd "docker ps -a | grep umroh | awk '{print \$1}' | xargs docker rm 2>/dev/null || true"

# 2. Remove ALL umroh-related images
echo "2. Removing ALL umroh-related images..."
ssh_cmd "docker images | grep umroh | awk '{print \$3}' | xargs docker rmi -f 2>/dev/null || true"

# 3. Kill any ongoing builds
echo "3. Killing any ongoing builds..."
ssh_cmd "pkill -f 'docker build.*umroh' 2>/dev/null || true"

# 4. Clean up deployment directory
echo "4. Cleaning deployment directory..."
ssh_cmd "rm -rf /home/ezyindustries/deployments/umroh-management* 2>/dev/null || true"

# 5. Upload code with retry
echo "5. Uploading code..."
export SSHPASS="$SSHPASS"
ssh_cmd "mkdir -p /home/ezyindustries/deployments/umroh-management"

# Rsync with retry
retry_count=0
max_retries=3
while [ $retry_count -lt $max_retries ]; do
    if sshpass -e rsync -avz --delete --progress \
        --exclude '.git' \
        --exclude 'node_modules' \
        --exclude '.env' \
        --exclude '*.log' \
        --exclude 'frontend/build' \
        -e "ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -o ServerAliveCountMax=3" \
        ./ "$SERVER:/home/ezyindustries/deployments/umroh-management/"; then
        echo "✅ Code uploaded successfully"
        break
    else
        retry_count=$((retry_count + 1))
        echo "⚠️  Rsync failed. Retrying ($retry_count/$max_retries)..."
        sleep 2
    fi
done

# 6. Build Docker image with timeout to prevent hanging
echo "6. Building Docker image (this may take a while)..."
echo "   To monitor build progress, run in another terminal:"
echo "   ssh ezyindustries@103.181.143.223 'docker logs -f \$(docker ps -q -f ancestor=buildkit/buildkit)'"
echo ""
ssh_cmd "cd /home/ezyindustries/deployments/umroh-management && timeout 600 docker build --no-cache -t umroh-management-main:latest . || echo 'Build timed out after 10 minutes'"

# 7. Create new database (skip if postgres not accessible)
echo "7. Creating new database..."
ssh_cmd "docker exec postgres-platform psql -U platform_admin -d postgres -c 'DROP DATABASE IF EXISTS umroh_management_staging;' 2>/dev/null || echo 'Database drop skipped'"
ssh_cmd "docker exec postgres-platform psql -U platform_admin -d postgres -c 'CREATE DATABASE umroh_management_staging;' 2>/dev/null || echo 'Database creation skipped'"

# 8. Check if image was built successfully
echo "8. Checking if image exists..."
if ! ssh_cmd "docker images | grep -q umroh-management-main"; then
    echo "❌ Image not found. Build may have failed."
    echo "   Checking for available images..."
    ssh_cmd "docker images | grep -E 'node|umroh' | head -10"
    exit 1
fi

# 9. Deploy container
echo "9. Deploying container..."
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
echo "10. Checking deployment status..."
sleep 10
ssh_cmd "docker ps | grep umroh"

echo ""
echo "11. Initial data population will happen automatically when container starts"
echo ""
echo "✅ Deployment script completed!"
echo ""
echo "If build failed, you can:"
echo "1. Check build logs: ssh ezyindustries@103.181.143.223 'docker logs \$(docker ps -aq -f status=exited -n=1)'"
echo "2. Use existing image: ssh ezyindustries@103.181.143.223 'docker images | grep umroh'"
echo ""
echo "URL: https://dev-umroh-management.ezyindustries.my.id"