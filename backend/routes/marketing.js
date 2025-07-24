const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const marketingController = require('../controllers/marketingController');

// All marketing routes require authentication
router.use(authenticate);

// Marketing dashboard statistics
router.get('/statistics', 
  authorize(['Admin', 'Marketing']), 
  marketingController.getStatistics
);

// Customer management
router.get('/customers', 
  authorize(['Admin', 'Marketing']), 
  marketingController.getCustomers
);

router.get('/customers/:id', 
  authorize(['Admin', 'Marketing']), 
  marketingController.getCustomer
);

router.patch('/customers/:id/stage', 
  authorize(['Admin', 'Marketing']), 
  marketingController.updateCustomerStage
);

router.post('/customers/:id/message', 
  authorize(['Admin', 'Marketing']), 
  marketingController.sendMessage
);

// Package templates
router.get('/packages', 
  authorize(['Admin', 'Marketing']), 
  marketingController.getPackageTemplates
);

router.post('/packages', 
  authorize(['Admin']), 
  marketingController.createPackageTemplate
);

// WAHA webhook endpoint (no auth required for webhook)
router.post('/webhook/waha', marketingController.handleWAHAWebhook);

module.exports = router;