#!/bin/bash

# Script to run on server directly
echo "🚀 Deploying Umroh Management..."

# Remove old container
docker stop umroh-management-staging 2>/dev/null || true
docker rm umroh-management-staging 2>/dev/null || true

# Deploy new container
docker run -d \
    --name umroh-management-staging \
    --network infrastructure_platform-network \
    --restart=unless-stopped \
    --label traefik.enable=true \
    --label traefik.http.services.umroh-management-staging.loadbalancer.server.port=5000 \
    --label traefik.http.routers.umroh-management-staging.entrypoints=websecure \
    --label traefik.http.routers.umroh-management-staging.tls.certresolver=letsencrypt \
    --label 'traefik.http.routers.umroh-management-staging.rule=Host(`dev-umroh-management.ezyindustries.my.id`)' \
    --label traefik.http.routers.umroh-management-staging-http.entrypoints=web \
    --label traefik.http.routers.umroh-management-staging-http.middlewares=redirect-to-https \
    --label 'traefik.http.routers.umroh-management-staging-http.rule=Host(`dev-umroh-management.ezyindustries.my.id`)' \
    -e NODE_ENV=staging \
    -e PORT=5000 \
    -e DATABASE_URL='postgresql://platform_admin:ezyindustries_db_2025@postgres-platform:5432/umroh_management_staging' \
    -e JWT_SECRET=umroh-jwt-secret-2025 \
    -e REDIS_URL=redis://redis-platform:6379 \
    umroh-management-main:latest

echo "Waiting for container to start..."
sleep 10

echo "Container status:"
docker ps | grep umroh

echo ""
echo "Container logs:"
docker logs umroh-management-staging --tail 30

echo ""
echo "✅ Deployment completed!
URL: https://dev-umroh-management.ezyindustries.my.id"