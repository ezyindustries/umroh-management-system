const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const { setupDatabase } = require('./config/database');
const { authMiddleware } = require('./middleware/auth');
const securityConfig = require('./config/security');

// Import routes
const authRoutes = require('./routes/auth');
const jamaahRoutes = require('./routes/jamaah');
const packageRoutes = require('./routes/packages');
const paymentRoutes = require('./routes/payments');
const documentRoutes = require('./routes/documents');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const excelRoutes = require('./routes/excel');
const familyRoutes = require('./routes/family');
const groupRoutes = require('./routes/groups');
const backupRoutes = require('./routes/backup');
const exportImportRoutes = require('./routes/exportImport');
const monitoringRoutes = require('./routes/monitoring');
const metricsRoutes = require('./routes/metrics');
const docsRoutes = require('./routes/docs');
const whatsappRoutes = require('./routes/whatsapp');
const brosurRoutes = require('./routes/brosur');
const notificationsRoutes = require('./routes/notifications');
const marketingRoutes = require('./routes/marketing');
const hotelsRoutes = require('./routes/hotels');
const inventoryRoutes = require('./routes/inventory');
const equipmentDistributionRoutes = require('./routes/equipmentDistribution');
const flightsRoutes = require('./routes/flights');
const groundHandlingRoutes = require('./routes/groundHandling');

const app = express();
const server = http.createServer(app);

// Setup logging
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.simple()
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// Validate environment variables for security
try {
  securityConfig.validateEnvironment();
} catch (error) {
  logger.error('Security validation failed:', error.message);
  process.exit(1);
}

// Enhanced security middleware
app.use(helmet());
app.use(compression());

// Trust proxy for production deployments
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Request validation and sanitization
// app.use(validateRequest);
// app.use(sanitizeInput);

// Rate limiting - more permissive for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased from 100 to 1000
  message: { error: 'Too many requests from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and local requests in development
    if (process.env.NODE_ENV !== 'production') {
      return true; // Disable rate limiting in development
    }
    return req.path === '/health' || req.path === '/api/health';
  }
});
app.use(limiter);

// Enhanced CORS configuration
app.use(cors(securityConfig.getCorsConfig()));

// Performance optimization middleware
// app.use(requestTimer);
// app.use(memoryMonitor);
// app.use(optimizeQueryParams);
// app.use(collectMetrics);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database optimization middleware
// app.use(optimizeDatabase);

// Audit logging middleware
// app.use(auditLogger);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Serve React build files
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jamaah', jamaahRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/data', exportImportRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/brosur', brosurRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/equipment-distribution', equipmentDistributionRoutes);
app.use('/api/flights', flightsRoutes);
app.use('/api/ground-handling', groundHandlingRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Catch-all route for React SPA (must be after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Global error handler
// app.use(errorHandler);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await setupDatabase();
    logger.info('Database connection established');
    
    // Initialize performance service
    // await performanceService.initialize();
    // logger.info('Performance service initialized');
    
    // Initialize WebSocket service
    // websocketService.initialize(server);
    // logger.info('WebSocket service initialized');
    
    // Cleanup expired notifications on startup
    // await notificationService.cleanupExpiredNotifications();
    
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`WebSocket server ready for real-time connections`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  // await performanceService.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  // await performanceService.shutdown();
  process.exit(0);
});

startServer();

module.exports = app;