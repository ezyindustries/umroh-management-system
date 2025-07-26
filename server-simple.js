const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
try {
  // Use the new jamaah routes
  app.use('/api/jamaah', require('./backend/routes/jamaah-new'));
  
  // Use simple packages routes
  app.use('/api/packages', require('./backend/routes/packages-simple'));
  
  // Other routes (will add later)
  // app.use('/api/auth', require('./routes/auth'));
  // app.use('/api/payments', require('./routes/payments'));
  // app.use('/api/documents', require('./routes/documents'));
  // app.use('/api/users', require('./routes/users'));
} catch (error) {
  console.error('Error loading routes:', error.message);
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
});