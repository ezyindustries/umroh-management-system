// Simple auth bypass middleware for development/testing
// WARNING: DO NOT USE IN PRODUCTION

function authBypass(req, res, next) {
  // Set dummy user for development
  req.user = {
    id: 1,
    username: 'demo',
    role: 'admin'
  };
  
  console.log('Auth bypassed for:', req.path);
  next();
}

module.exports = { authBypass };