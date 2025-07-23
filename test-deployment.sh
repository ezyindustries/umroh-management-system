#!/bin/bash

echo "🧪 Testing Docker Deployment untuk Aplikasi Umroh"
echo "================================================="

# Fungsi untuk check service health
check_service() {
    local service=$1
    local port=$2
    echo "🔍 Checking $service on port $port..."
    
    for i in {1..30}; do
        if curl -f -s http://localhost:$port > /dev/null 2>&1; then
            echo "✅ $service is healthy!"
            return 0
        fi
        echo "   Waiting for $service... ($i/30)"
        sleep 5
    done
    
    echo "❌ $service failed to start"
    return 1
}

# Step 1: Build images
echo "🏗️  Step 1: Building Docker images..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Stopping test."
    exit 1
fi

# Step 2: Start database services
echo "🗄️  Step 2: Starting database services..."
docker-compose up -d mysql redis

# Wait for databases
echo "⏳ Waiting for databases to be ready..."
sleep 30

# Step 3: Start main application
echo "🚀 Step 3: Starting main application..."
docker-compose up -d umroh_app

# Step 4: Start nginx
echo "🌐 Step 4: Starting nginx proxy..."
docker-compose up -d nginx

# Step 5: Run health checks
echo "🔍 Step 5: Running health checks..."

check_service "MySQL" 3306
check_service "Redis" 6379
check_service "App Backend" 5000
check_service "Nginx Proxy" 80

# Step 6: Show status
echo "📊 Step 6: Service status:"
docker-compose ps

echo ""
echo "🎉 Deployment test completed!"
echo ""
echo "📋 Access URLs:"
echo "   • Main Application: http://localhost"
echo "   • Direct Backend: http://localhost:5000"
echo "   • MySQL: localhost:3306"
echo "   • Redis: localhost:6379"
echo ""
echo "🔧 Useful commands:"
echo "   • View logs: docker-compose logs -f"
echo "   • Stop all: docker-compose down"
echo "   • Restart: docker-compose restart"