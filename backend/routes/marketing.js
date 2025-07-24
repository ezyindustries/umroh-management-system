const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const marketingController = require('../controllers/marketingController');

// Public webhook endpoint (no auth)
router.post('/webhook/waha', marketingController.handleWAHAWebhook.bind(marketingController));

// All other routes require authentication
router.use(authenticate);

// Marketing dashboard statistics
router.get('/statistics', 
    authorize(['Admin', 'Marketing']), 
    marketingController.getStatistics.bind(marketingController)
);

// Customer management
router.get('/customers', 
    authorize(['Admin', 'Marketing']), 
    marketingController.getCustomers.bind(marketingController)
);

router.get('/customers/:id', 
    authorize(['Admin', 'Marketing']), 
    marketingController.getCustomer.bind(marketingController)
);

router.patch('/customers/:id/stage', 
    authorize(['Admin', 'Marketing']), 
    marketingController.updateCustomerStage.bind(marketingController)
);

// Template management
router.get('/templates', 
    authorize(['Admin', 'Marketing']), 
    marketingController.getTemplates.bind(marketingController)
);

router.post('/templates', 
    authorize(['Admin']), 
    marketingController.saveTemplate.bind(marketingController)
);

module.exports = router;