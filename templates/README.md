# EzyIndustries Platform - Deployment Guide

## Quick Start

### 1. Install Dependencies
```bash
# Linux/Mac
./scripts/install-deps.sh

# Windows (PowerShell)
PowerShell -ExecutionPolicy Bypass -File scripts/install-deps.ps1
```

### 2. Copy Templates to Your Project
```bash
# Copy config templates
cp templates/deployment.yml ./my-project/
cp templates/server-config.yml ./my-project/
```

### 3. Configure Your Project

#### Edit `deployment.yml` in your project:
```yaml
app:
  name: "my-project"  # Change this to your app name

service:
  port: 3000          # Your app's port

database:
  required: true      # Set to false if no database needed
```

#### Edit `server-config.yml` in your project:
```yaml
server:
  ip: "your-server-ip"        # Your VPS IP address
  user: "root"                # SSH username
  ssh_key: "~/.ssh/id_rsa"    # Path to your SSH key

platform:
  domain: "ezyindustries.my.id"  # Your domain
```

### 4. Make Sure Your Project Has:
- ✅ `Dockerfile` - Docker build instructions
- ✅ Health check endpoint (default: `/health`)
- ✅ App listening on configured port

### 5. Deploy
```bash
# Deploy to staging
./scripts/deploy.sh staging ./my-project

# Deploy to production  
./scripts/deploy.sh production ./my-project
```

## Configuration Details

### Single Service App (Simple)
```yaml
# deployment.yml
app:
  name: "my-blog"

service:
  port: 3000
  health_endpoint: "/health"    # Optional, defaults to /health

database:
  required: true
```

**Result:**
- Staging: `https://dev-my-blog.ezyindustries.my.id`
- Production: `https://my-blog.ezyindustries.my.id`

### Multi-Service App (Fullstack)
```yaml
# deployment.yml  
app:
  name: "my-fullstack"

services:
  frontend:
    port: 3000
    path: "/"                   # Handles all routes except /api

  backend:
    port: 3001  
    path: "/api"                # Handles /api/* routes
    health_endpoint: "/api/health"

database:
  required: true
```

**Result:**
- Frontend: `https://my-fullstack.ezyindustries.my.id/`
- Backend: `https://my-fullstack.ezyindustries.my.id/api/`

### Server Connection Options

#### SSH Key (Recommended)
```yaml
server:
  ip: "123.456.789.10"
  user: "root" 
  ssh_key: "~/.ssh/my-server-key"
```

#### Password Authentication
```yaml
server:
  ip: "123.456.789.10"
  user: "root"
  password: "your-server-password"  # Less secure
```

## Pre-Deployment Checklist

### Your Application Must Have:
- [ ] **Dockerfile** that builds successfully
- [ ] **Health check endpoint** (responds with 200 OK)
- [ ] **Port configuration** matches deployment.yml
- [ ] **Environment variable support** (NODE_ENV, DATABASE_URL)

### Server Setup Required:
- [ ] **Domain DNS** pointing to server IP
- [ ] **Platform infrastructure** running: `./scripts/setup-platform.sh`
- [ ] **Ports 80/443** open and accessible
- [ ] **SSH access** configured (key or password)

### Example Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Example Health Check Endpoint:
```javascript
// Express.js
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

## Deployment Process

### What Happens During Deployment:
1. **Validation** - Check files, SSH connection, platform status
2. **Config Parsing** - Read deployment.yml and server-config.yml  
3. **Image Build** - Build Docker image on server
4. **Database Setup** - Create database if required
5. **Container Deploy** - Start new container with Traefik routing
6. **Health Check** - Verify application is responding
7. **Rollback** - Restore previous version if health check fails

### Automatic Features:
- ✅ **SSL certificates** (Let's Encrypt)
- ✅ **Subdomain routing** (staging vs production)
- ✅ **Database isolation** (separate DBs per app/environment)
- ✅ **Zero-downtime deployment** (blue-green strategy)
- ✅ **Automatic rollback** on failure
- ✅ **Health monitoring** with timeout

## URLs After Deployment

### Staging (develop branch)
- Single service: `https://dev-{app-name}.ezyindustries.my.id`
- Frontend: `https://dev-{app-name}.ezyindustries.my.id/`
- Backend: `https://dev-{app-name}.ezyindustries.my.id/api/`

### Production (main branch)
- Single service: `https://{app-name}.ezyindustries.my.id`
- Frontend: `https://{app-name}.ezyindustries.my.id/`
- Backend: `https://{app-name}.ezyindustries.my.id/api/`

## Troubleshooting

### Deployment Fails?
```bash
# Check server connection
ssh -i ~/.ssh/id_rsa user@server-ip

# Check platform status
docker ps
docker logs traefik
docker logs postgres-platform
```

### App Not Accessible?
```bash
# Check container status
docker ps | grep your-app-name
docker logs your-app-name-staging

# Check Traefik routing
curl -H "Host: dev-your-app.ezyindustries.my.id" http://localhost
```

### SSL Certificate Issues?
```bash
# Check DNS pointing to server
nslookup dev-your-app.ezyindustries.my.id

# Check Traefik logs
docker logs traefik | grep -i certificate
```

### Database Connection Issues?
```bash
# Check database exists
docker exec postgres-platform psql -U platform_admin -d platform -c "\l"

# Test database connection
docker exec postgres-platform psql -U platform_admin -d your_app_staging
```

## Management Commands

### View Application Logs
```bash
docker logs your-app-staging -f
```

### Restart Application
```bash
docker restart your-app-staging
```

### Access Database
```bash
docker exec -it postgres-platform psql -U platform_admin -d your_app_staging
```

### Monitor Platform
- Traefik Dashboard: `http://your-server-ip:8080`
- Container Stats: `docker stats`

## Advanced Configuration

### Custom Health Check Timeout
```yaml
# deployment.yml
health_check:
  timeout: 60  # seconds (default: 30)
```

### Custom Environment Variables
```yaml
# deployment.yml
env_vars:
  staging:
    DEBUG: "true"
    API_URL: "https://api-staging.example.com"
  production:
    DEBUG: "false"
    API_URL: "https://api.example.com"
```

### Database Migration
```yaml
# deployment.yml
database:
  required: true
  migration_command: "npm run migrate"  # Run after deployment
```