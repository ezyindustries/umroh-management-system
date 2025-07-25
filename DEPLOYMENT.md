# Umroh Management System - Deployment Guide

## Prerequisites

- Ubuntu 20.04 LTS or newer
- Docker 20.10+ and Docker Compose 2.0+
- Git
- Domain name with DNS configured
- SSL certificates (or use Let's Encrypt)
- Minimum 2GB RAM, 20GB disk space

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd umroh-management
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

Edit the following required variables:
```env
# Database
DB_NAME=umroh_production
DB_USER=umroh_user
DB_PASSWORD=<strong-password>

# Security
JWT_SECRET=<random-64-character-string>

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-specific-password
```

### 3. Run Deployment Script

```bash
chmod +x deploy-prod.sh
./deploy-prod.sh
```

This script will:
- Validate configuration
- Build Docker images
- Start all services
- Run database migrations
- Set up automatic backups

## Manual Deployment Steps

### 1. Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Prepare Server

```bash
# Create directories
mkdir -p ~/umroh-management
cd ~/umroh-management

# Clone repository
git clone <repository-url> .

# Create required directories
mkdir -p uploads logs backups nginx/ssl frontend

# Set permissions
chmod -R 755 uploads
chmod -R 755 logs
```

### 3. Configure Application

```bash
# Create environment file
cp .env.example .env

# Edit configuration
nano .env
```

### 4. SSL Certificate Setup

#### Option A: Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
```

#### Option B: Self-Signed (Development)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Umroh/CN=localhost"
```

### 5. Update Nginx Configuration

Edit `nginx/nginx.prod.conf` to enable SSL:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... rest of configuration
}
```

### 6. Deploy Application

```bash
# Copy frontend files
cp -r *.html shared frontend/

# Build and start services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 7. Initialize Database

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec app node backend/scripts/setup-database.js

# Verify database
docker-compose -f docker-compose.prod.yml exec postgres psql -U umroh_user -d umroh_production -c "\dt"
```

## Post-Deployment

### 1. Set Up Backups

The deployment script automatically sets up daily backups. To manually configure:

```bash
# Edit crontab
crontab -e

# Add backup job (daily at 2 AM)
0 2 * * * cd /home/user/umroh-management && docker-compose -f docker-compose.prod.yml exec -T backup /backup.sh >> logs/backup.log 2>&1
```

### 2. Configure Firewall

```bash
# Install ufw
sudo apt install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Set Up Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop ncdu

# Monitor resources
htop  # CPU and memory
iotop # Disk I/O
docker stats # Container resources
```

### 4. Configure Log Rotation

Create `/etc/logrotate.d/umroh`:

```
/home/user/umroh-management/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 user user
}
```

## Maintenance

### Daily Tasks

1. Check application health:
```bash
curl https://your-domain.com/api/health
```

2. Monitor logs:
```bash
docker-compose -f docker-compose.prod.yml logs --tail=100 app
```

3. Check disk space:
```bash
df -h
du -sh uploads/ backups/
```

### Weekly Tasks

1. Review backups:
```bash
ls -lh backups/
```

2. Check for updates:
```bash
git pull origin main
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

3. Database maintenance:
```bash
# Vacuum and analyze
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U umroh_user -d umroh_production -c "VACUUM ANALYZE;"
```

### Restore from Backup

```bash
# List available backups
ls -lh backups/

# Restore specific backup
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U umroh_user -d umroh_production < backups/umroh_backup_20250125_020000.sql.gz
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs app

# Check container status
docker ps -a

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Database Connection Issues

```bash
# Test database connection
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_isready -h localhost -p 5432 -U umroh_user

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres
```

### High Resource Usage

```bash
# Check container resources
docker stats

# Limit container resources (edit docker-compose.prod.yml)
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
```

### SSL Certificate Renewal

```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Copy new certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## Security Recommendations

1. **Change default credentials immediately**
2. **Use strong passwords** (minimum 16 characters)
3. **Enable firewall** and only allow necessary ports
4. **Keep system updated** with security patches
5. **Monitor logs** for suspicious activity
6. **Use HTTPS** with valid SSL certificates
7. **Regular backups** stored offsite
8. **Limit database access** to application only
9. **Use environment variables** for sensitive data
10. **Enable rate limiting** on API endpoints

## Support

For issues or questions:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Review documentation in `/docs`
3. Submit issues to repository issue tracker