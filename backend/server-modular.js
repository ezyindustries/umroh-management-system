// Modular API Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { checkConnection, shutdown } = require('./config/database-modular');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Rate limiting per module
const createLimiter = (max = 100) => rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: max,
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
    const dbHealthy = await checkConnection();
    res.status(dbHealthy ? 200 : 503).json({
        status: dbHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
            database: dbHealthy,
            cache: true, // Add Redis check if implemented
        }
    });
});

// Module routes with specific rate limits
app.use('/api/jamaah', createLimiter(200), require('./apps/jamaah/routes'));
app.use('/api/payment', createLimiter(150), require('./apps/payment/routes'));
app.use('/api/flight', createLimiter(150), require('./apps/flight/routes'));
app.use('/api/hotel', createLimiter(100), require('./apps/hotel/routes'));
app.use('/api/inventory', createLimiter(100), require('./apps/inventory/routes'));
app.use('/api/reports', createLimiter(50), require('./apps/reports/routes'));

// Core services (auth, packages, etc)
app.use('/api/auth', createLimiter(20), require('./apps/core/auth'));
app.use('/api/packages', createLimiter(100), require('./apps/core/packages'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Server startup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Modular API Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`${signal} received. Starting graceful shutdown...`);
    
    server.close(async () => {
        console.log('HTTP server closed');
        await shutdown();
        console.log('Database connections closed');
        process.exit(0);
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('Forced shutdown');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));