const express = require('express');
const router = express.Router();
const equipmentDistributionController = require('../controllers/equipmentDistributionController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Distribution routes
router.get('/distributions', equipmentDistributionController.getDistributions);
router.get('/distributions/jamaah/:jamaahId', equipmentDistributionController.getDistributionByJamaah);
router.post('/distributions', equipmentDistributionController.saveDistribution);
router.delete('/distributions/:distributionId/items/:itemId', equipmentDistributionController.removeItem);

// Summary and reporting
router.get('/summary/groups', equipmentDistributionController.getGroupSummary);
router.get('/receipt/:distributionId', equipmentDistributionController.printReceipt);

// Template
router.get('/template', equipmentDistributionController.getChecklistTemplate);

module.exports = router;