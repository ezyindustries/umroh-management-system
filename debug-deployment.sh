#!/bin/bash

# Multi-purpose debug script untuk umroh management
ACTION=${1:-"status"}
echo "🔍 Umroh Debug - Action: $ACTION"

# Server credentials
SERVER="ezyindustries@103.181.143.223"
SSHPASS="!ndomi3 Halal"

# Function to run SSH command with password
ssh_cmd() {
    sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

case "$ACTION" in
    "status"|"")
        echo "1️⃣ Container status..."
        ssh_cmd "docker ps | grep umroh"
        
        echo ""
        echo "2️⃣ Container logs (last 20 lines)..."
        ssh_cmd "docker logs umroh-management-staging --tail 20"
        
        echo ""
        echo "3️⃣ Internal health check..."
        ssh_cmd "curl -f http://localhost:5000/api/health 2>/dev/null || echo 'Health check failed'"
        ;;
        
    "logs")
        echo "📋 Full container logs..."
        ssh_cmd "docker logs umroh-management-staging"
        ;;
        
    "restart")
        echo "🔄 Restarting container..."
        ssh_cmd "docker restart umroh-management-staging"
        echo "Waiting 10 seconds..."
        sleep 10
        ssh_cmd "docker ps | grep umroh"
        ;;
        
    "test")
        echo "🧪 Testing deployment..."
        ssh_cmd "docker exec umroh-management-staging ls -la /app/backend/node_modules/.bin/ | grep jest || echo 'Jest not in production'"
        ssh_cmd "docker exec umroh-management-staging npm list --prefix /app/backend | grep missing || echo 'All deps installed'"
        ;;
        
    "traefik")
        echo "🔀 Checking Traefik routes..."
        ssh_cmd "docker logs traefik 2>&1 | tail -10"
        ;;
        
    "traefik-logs")
        echo "📋 Checking Traefik logs for errors..."
        ssh_cmd "docker logs traefik 2>&1 | grep -E '(umroh|error|warn|platform-network)' | tail -20"
        ;;
        
    "labels")
        echo "🏷️ Checking container labels..."
        ssh_cmd "docker inspect umroh-management-staging | grep -A30 Labels"
        ;;
        
    "compare")
        echo "🔍 Comparing with hospital dashboard..."
        echo "=== UMROH LABELS ==="
        ssh_cmd "docker inspect umroh-management-staging | grep -A10 Labels"
        echo ""
        echo "=== HOSPITAL LABELS ==="
        ssh_cmd "docker inspect hospital-dashboard-frontend-staging | grep -A10 Labels"
        echo ""
        echo "=== NETWORK INFO ==="
        ssh_cmd "docker inspect umroh-management-staging | grep -A5 NetworkMode"
        ssh_cmd "docker inspect hospital-dashboard-frontend-staging | grep -A5 NetworkMode"
        ;;
        
    "network")
        echo "🌐 Checking network configuration..."
        ssh_cmd "docker network ls | grep platform"
        echo ""
        echo "Container networks:"
        ssh_cmd "docker ps --format 'table {{.Names}}\t{{.Networks}}' | grep -E 'umroh|hospital|traefik'"
        echo ""
        echo "Umroh network details:"
        ssh_cmd "docker inspect umroh-management-staging | grep -A20 Networks"
        ;;
        
    "fix")
        echo "🔧 Fixing deployment issue..."
        echo "1. Stop and remove current container..."
        ssh_cmd "docker stop umroh-management-staging && docker rm umroh-management-staging"
        echo ""
        echo "2. Get correct Traefik container..."
        ssh_cmd "docker ps | grep traefik"
        echo ""
        echo "3. Redeploy with correct network detection..."
        ssh_cmd "cd /tmp && ls -la | grep deploy-umroh | tail -1"
        ;;
        
    "routes")  
        echo "📍 Checking all Traefik HTTP routes..."
        ssh_cmd "curl -s http://localhost:8080/api/http/routers | python3 -m json.tool | grep -E '(rule|service)' || echo 'Failed to get routes'"
        ;;
        
    "containers")
        echo "📦 Listing all containers..."
        ssh_cmd "docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}' | head -15"
        echo ""
        echo "Looking for Traefik..."
        ssh_cmd "docker ps | grep -E '(80->80|443->443|8080->8080)'"
        ;;
        
    "start-traefik")
        echo "🚀 Starting Traefik..."
        ssh_cmd "cd /home/ezyindustries/infrastructure && docker-compose up -d traefik"
        sleep 5
        echo ""
        echo "Checking if Traefik is running..."
        ssh_cmd "docker ps | grep traefik"
        echo ""
        echo "Waiting for Traefik to be ready..."
        sleep 10
        echo "Checking routes now..."
        ssh_cmd "curl -s http://localhost:8080/api/http/routers 2>/dev/null | grep -o 'umroh' | head -1 || echo 'Umroh not detected yet'"
        ;;
        
    "inspect")
        echo "🔍 Inspecting container details..."
        echo "=== LABELS ==="
        ssh_cmd "docker inspect umroh-management-staging --format '{{json .Config.Labels}}' | python3 -m json.tool"
        echo ""
        echo "=== NETWORK ==="
        ssh_cmd "docker inspect umroh-management-staging --format '{{json .NetworkSettings.Networks}}' | python3 -m json.tool"
        echo ""
        echo "=== TRAEFIK DETECTION ==="
        ssh_cmd "curl -s http://localhost:8080/api/http/routers | grep -c umroh || echo '0 routes found'"
        ;;
        
    "traefik-config")
        echo "🔧 Checking Traefik configuration..."
        echo "=== Traefik labels ==="
        ssh_cmd "docker inspect traefik | grep -A20 Cmd"
        echo ""
        echo "=== All HTTP routers ==="
        ssh_cmd "curl -s http://localhost:8080/api/http/routers | python3 -c 'import json,sys; data=json.load(sys.stdin); print(\"\\n\".join([r[\"name\"] for r in data]))' 2>/dev/null || echo 'Failed to list routers'"
        ;;
        
    "hospital-check")
        echo "🏥 Checking hospital dashboard config..."
        echo "=== Hospital Frontend Labels ==="
        ssh_cmd "docker inspect hospital-dashboard-frontend-staging --format '{{json .Config.Labels}}' | grep traefik"
        echo ""
        echo "=== Comparing networks ==="
        echo "Hospital:"
        ssh_cmd "docker inspect hospital-dashboard-frontend-staging | grep NetworkMode"
        echo "Umroh:"
        ssh_cmd "docker inspect umroh-management-staging | grep NetworkMode"
        ;;
        
    "fix-network")
        echo "🔧 Fixing network issue..."
        echo "1. Checking all networks..."
        ssh_cmd "docker network ls | grep platform"
        echo ""
        echo "2. Creating platform-network if needed..."
        ssh_cmd "docker network create platform-network 2>/dev/null || echo 'Network already exists'"
        echo ""
        echo "3. Connecting Traefik to both networks..."
        ssh_cmd "docker network connect platform-network traefik 2>/dev/null || echo 'Already connected'"
        echo ""
        echo "4. Restarting Traefik..."
        ssh_cmd "docker restart traefik"
        sleep 5
        echo ""
        echo "5. Checking Traefik networks..."
        ssh_cmd "docker inspect traefik | grep -A10 Networks"
        ;;
        
    "cleanup")
        echo "🧹 Cleaning up container..."
        ssh_cmd "docker stop umroh-management-staging 2>/dev/null || echo 'Not running'"
        ssh_cmd "docker rm umroh-management-staging 2>/dev/null || echo 'Not found'"
        echo "✅ Cleanup done"
        ;;
        
    "update-traefik")
        echo "🔄 Updating Traefik to use correct network..."
        echo "1. Stop Traefik..."
        ssh_cmd "docker stop traefik"
        echo ""
        echo "2. Remove Traefik..."
        ssh_cmd "docker rm traefik"
        echo ""
        echo "3. Start Traefik with infrastructure network..."
        ssh_cmd "docker run -d --name traefik \
            --network infrastructure_platform-network \
            -p 80:80 -p 443:443 -p 8080:8080 \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v /home/ezyindustries/letsencrypt:/letsencrypt \
            --restart=unless-stopped \
            traefik:v2.10 \
            --api.dashboard=true \
            --api.debug=true \
            --log.level=DEBUG \
            --providers.docker=true \
            --providers.docker.exposedbydefault=false \
            --providers.docker.network=infrastructure_platform-network \
            --entrypoints.web.address=:80 \
            --entrypoints.websecure.address=:443 \
            --certificatesresolvers.letsencrypt.acme.email=admin@ezyindustries.my.id \
            --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json \
            --certificatesresolvers.letsencrypt.acme.httpchallenge=true \
            --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
        ;;
        
    *)
        echo "Usage: $0 [status|logs|restart|test|traefik]"
        echo "  status  - Show container status and recent logs (default)"
        echo "  logs    - Show full container logs"
        echo "  restart - Restart the container"
        echo "  test    - Check testing setup"
        echo "  traefik - Check Traefik routing"
        ;;
esac

echo ""
echo "✅ Debug completed!"