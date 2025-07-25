#!/bin/bash

echo "🚀 Starting Umroh Management System Setup..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Start services
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database setup
echo "🗄️ Setting up database..."
docker-compose exec app node backend/scripts/setup-database.js

echo "✅ Setup complete!"
echo ""
echo "📌 Access Points:"
echo "   - API: http://localhost:5000"
echo "   - Frontend: http://localhost:8888"
echo ""
echo "👤 Default Admin:"
echo "   - Username: admin"
echo "   - Password: admin123"
echo ""
echo "📊 View logs: docker-compose logs -f app"
echo "🛑 Stop services: docker-compose down"