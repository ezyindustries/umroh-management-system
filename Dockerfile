# Multi-stage build for React + Node.js application
FROM node:18-alpine AS frontend

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source and build
COPY frontend/ ./

# Build React app for production
ARG REACT_APP_API_URL=http://localhost/api
ARG REACT_APP_WS_URL=http://localhost
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL

RUN npm run build

# Backend stage  
FROM node:18-alpine AS backend

WORKDIR /app/backend

# Install system dependencies for backend
RUN apk add --no-cache python3 make g++ git

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies (production only)
RUN npm install --production

# Copy backend source
COPY backend/ ./

# Final production stage
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache curl

# Copy backend from backend stage
COPY --from=backend /app/backend ./backend

# Copy React build from frontend stage
COPY --from=frontend /app/frontend/build ./frontend/build

# Copy other necessary files
COPY demo-complete-umroh-app.html ./
COPY database/ ./database/

# Create necessary directories
RUN mkdir -p uploads/documents uploads/temp logs backups

# Set proper permissions
RUN chmod -R 755 uploads logs backups frontend

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the backend application
CMD ["node", "backend/server.js"]