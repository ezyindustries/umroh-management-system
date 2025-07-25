#!/bin/bash

# Production deployment script for Umroh Management System

set -e

echo "🚀 Starting Umroh Management System Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    echo "Please create .env file from .env.example and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Validate required environment variables
required_vars=("DB_NAME" "DB_USER" "DB_PASSWORD" "JWT_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set!"
        exit 1
    fi
done

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads logs backups nginx/ssl frontend

# Copy frontend files to nginx serving directory
print_status "Preparing frontend files..."
cp -r *.html shared frontend/

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build images
print_status "Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# Start services
print_status "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check if database is ready
print_status "Checking database connection..."
docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U $DB_USER

# Run database setup
print_status "Setting up database..."
docker-compose -f docker-compose.prod.yml exec -T app node backend/scripts/setup-database.js

# Check application health
print_status "Checking application health..."
sleep 5
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health)

if [ $response -eq 200 ]; then
    print_status "Application is healthy!"
else
    print_error "Application health check failed!"
    echo "Response code: $response"
    echo "Checking logs..."
    docker-compose -f docker-compose.prod.yml logs app | tail -20
    exit 1
fi

# Create initial backup
print_status "Creating initial backup..."
docker-compose -f docker-compose.prod.yml exec -T backup /backup.sh

# Show running containers
print_status "Running containers:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📌 Access Points:"
echo "   - Application: http://localhost"
echo "   - API: http://localhost/api"
echo ""
echo "👤 Default Admin:"
echo "   - Username: admin"
echo "   - Password: admin123"
echo ""
echo "📊 View logs:"
echo "   - All services: docker-compose -f docker-compose.prod.yml logs -f"
echo "   - App only: docker-compose -f docker-compose.prod.yml logs -f app"
echo ""
echo "🛑 Stop services:"
echo "   - docker-compose -f docker-compose.prod.yml down"
echo ""

# Setup cron job for backups
print_status "Setting up backup cron job..."
cat > /tmp/backup-cron << EOF
# Daily backup at 2 AM
0 2 * * * cd $(pwd) && docker-compose -f docker-compose.prod.yml exec -T backup /backup.sh >> logs/backup.log 2>&1
EOF

# Install cron job
crontab -l 2>/dev/null | grep -v "umroh_backup" | cat - /tmp/backup-cron | crontab -
rm /tmp/backup-cron

print_status "Backup cron job installed"

# SSL Certificate reminder
print_warning "SSL certificates not configured!"
echo "To enable HTTPS:"
echo "1. Obtain SSL certificates (Let's Encrypt recommended)"
echo "2. Place certificates in nginx/ssl/"
echo "3. Update nginx/nginx.prod.conf to enable SSL"
echo "4. Restart nginx: docker-compose -f docker-compose.prod.yml restart nginx"