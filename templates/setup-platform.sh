#!/bin/bash

# Complete platform setup script
# This script sets up the entire EzyIndustries platform infrastructure

set -e

echo "🚀 Setting up EzyIndustries Platform Infrastructure"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Navigate to infrastructure directory
cd "$(dirname "$0")/../infrastructure"

echo "📋 Platform Setup Steps:"
echo "1. 🐳 Starting Docker infrastructure (Traefik + PostgreSQL + GitLab Runner)"
echo "2. ⏳ Waiting for services to be ready"
echo "3. 🔧 Setting up database"
echo "4. ✅ Platform ready for deployments"

# Start the infrastructure
echo ""
echo "🐳 Starting Docker infrastructure..."
docker-compose up -d

echo "⏳ Waiting for services to start up..."
sleep 15

# Check if Traefik is running
if docker ps --format "table {{.Names}}" | grep -q "traefik"; then
    echo "✅ Traefik reverse proxy is running"
else
    echo "❌ Traefik failed to start"
    exit 1
fi

# Check if PostgreSQL is running
if docker ps --format "table {{.Names}}" | grep -q "postgres-platform"; then
    echo "✅ PostgreSQL database is running"
else
    echo "❌ PostgreSQL failed to start"
    exit 1
fi

# Check if GitLab Runner is running
if docker ps --format "table {{.Names}}" | grep -q "gitlab-runner"; then
    echo "✅ GitLab Runner is running"
else
    echo "❌ GitLab Runner failed to start"
    exit 1
fi

echo ""
echo "🎉 Platform setup completed successfully!"
echo ""
echo "📋 Platform Status:"
echo "   🌐 Traefik Dashboard: http://localhost:8080"
echo "   🗄️  PostgreSQL: localhost:5432 (user: platform_admin)"
echo "   🏃 GitLab Runner: Ready for CI/CD pipelines"
echo ""
echo "🔧 Next Steps:"
echo "   1. Configure GitLab Runner token: export GITLAB_RUNNER_TOKEN=your_token"
echo "   2. Run: ./setup-gitlab-runner.sh"
echo "   3. Deploy your first app: ./deploy-app.sh my-app staging"
echo ""
echo "📖 Documentation: See docs/ directory for detailed guides"