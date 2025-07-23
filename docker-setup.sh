#!/bin/bash

# Docker Setup Script untuk Aplikasi Umroh Management
echo "🚀 Setting up Aplikasi Umroh dengan Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker belum terinstall. Silakan install Docker terlebih dahulu."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose belum terinstall. Silakan install Docker Compose terlebih dahulu."
    exit 1
fi

# Create environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.docker .env
    echo "✅ .env file created. Silakan edit jika perlu."
else
    echo "ℹ️  .env file sudah ada."
fi

# Create required directories
echo "📁 Creating required directories..."
mkdir -p uploads logs backups temp

# Build and start services
echo "🏗️  Building Docker images..."
docker-compose build --no-cache

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

# Test database connection
echo "🔗 Testing database connection..."
docker-compose exec mysql mysql -u umroh_user -pumroh_password_2024 -e "SELECT 'Database connection OK' as status;"

echo "🎉 Setup completed!"
echo ""
echo "📋 Service URLs:"
echo "   • Main Application: http://localhost:5000"
echo "   • MySQL Database: localhost:3306"
echo "   • Redis Cache: localhost:6379"
echo "   • Nginx Proxy: http://localhost:80"
echo ""
echo "🔧 Useful commands:"
echo "   • View logs: docker-compose logs -f"
echo "   • Stop services: docker-compose down"
echo "   • Rebuild: docker-compose build --no-cache"
echo "   • Database backup: docker-compose exec mysql mysqldump -u root -p umroh_management > backup.sql"
echo ""
echo "⚠️  Jangan lupa edit .env file untuk production!"
