# Port Registry - Umroh Management System

Last Updated: 2025-07-26 23:49

## Active Ports

| Port | Service | Description | Status | Process |
|------|---------|-------------|--------|---------|
| 3000 | WAHA (WhatsApp HTTP API) | WhatsApp Web API service for messaging | Active | Docker container (waha) - Container ID: 0cb6b56604ca |
| 5000 | Backend API Server | Node.js Express API server | Active | node server.js (PID: 1091104) |
| 8080 | Frontend Dev Server | React development server (if running) | Not Active | npm start / serve |
| 8888 | Static File Server | Serving HTML files and demo | Active | python3 (PID: 938284) - HTTP server |

## Port Usage Guidelines

1. **Before using a new port:**
   - Check this file first
   - Run `lsof -i :PORT` or `netstat -tlnp | grep PORT` to verify availability
   - Update this file immediately after allocating a new port

2. **Reserved Port Ranges:**
   - 3000-3999: Third-party services (WAHA, etc.)
   - 5000-5999: Backend services
   - 8000-8999: Frontend/static servers
   - 9000-9999: Development tools

3. **Common Issues:**
   - Port 5000: Sometimes occupied by other services, kill with `lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs -r kill -9`
   - Port 3000: Used by WAHA, don't use for other services

## Service Details

### WAHA (Port 3000)
- **Start Command**: `docker run -it --rm -p 3000:3000/tcp --name waha devlikeapro/waha`
- **API Base URL**: http://localhost:3000
- **External Access**: http://103.181.143.223:3000

### Backend API (Port 5000)
- **Start Command**: `cd backend && node server.js`
- **API Base URL**: http://localhost:5000/api
- **External Access**: http://103.181.143.223:5000/api
- **Main Endpoints**:
  - `/api/whatsapp/*` - WhatsApp integration
  - `/api/jamaah/*` - Jamaah management
  - `/api/packages/*` - Package management
  - `/api/auth/*` - Authentication

### Frontend (Port 8888)
- **Files Served**: Static HTML files including:
  - `/demo-complete-umroh-app.html` - Main application
  - `/whatsapp-chat.html` - WhatsApp chat manager
  - `/display-whatsapp-chats.html` - WhatsApp conversations viewer

## Port Check Commands

```bash
# Check all listening ports
sudo netstat -tlnp

# Check specific port
lsof -i :PORT

# Kill process on port
lsof -i :PORT | grep LISTEN | awk '{print $2}' | xargs -r kill -9

# Check if port is accessible externally
nc -zv 103.181.143.223 PORT
```

## History Log

- 2025-07-26: Initial port registry created
- Port 3000: Allocated to WAHA
- Port 5000: Allocated to Backend API Server
- Port 8888: Already in use for static file serving