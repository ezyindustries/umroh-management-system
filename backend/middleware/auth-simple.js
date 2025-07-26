// Simple authentication middleware for testing
const authenticate = (req, res, next) => {
    // For testing, simulate logged in admin user
    req.user = {
        id: 1,
        username: 'admin',
        nama: 'Administrator',
        roles: ['admin']
    };
    
    // Add IP address
    req.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
    
    next();
};

// Check if user has required role
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const hasRole = req.user.roles.some(role => roles.includes(role));
        if (!hasRole) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        next();
    };
};

module.exports = {
    authenticate,
    authorize
};