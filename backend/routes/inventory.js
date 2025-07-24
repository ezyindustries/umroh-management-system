const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const inventoryController = require('../controllers/inventoryController');

// All routes require authentication
router.use(authenticate);

// Inventory items
router.get('/items', 
    authorize(['Admin', 'Marketing', 'Operator Keberangkatan']), 
    inventoryController.getInventoryItems.bind(inventoryController)
);

router.post('/items', 
    authorize(['Admin']), 
    inventoryController.createInventoryItem.bind(inventoryController)
);

// Transactions
router.get('/transactions', 
    authorize(['Admin', 'Marketing', 'Operator Keberangkatan']), 
    inventoryController.getTransactions.bind(inventoryController)
);

router.post('/transactions', 
    authorize(['Admin', 'Operator Keberangkatan']), 
    inventoryController.recordTransaction.bind(inventoryController)
);

// Alerts
router.get('/alerts', 
    authorize(['Admin', 'Marketing', 'Operator Keberangkatan']), 
    inventoryController.getAlerts.bind(inventoryController)
);

// Slayer colors
router.get('/slayer-colors', 
    authorize(['Admin', 'Marketing', 'Operator Keberangkatan']), 
    inventoryController.getSlayerColors.bind(inventoryController)
);

router.post('/slayer-colors', 
    authorize(['Admin']), 
    inventoryController.createSlayerColor.bind(inventoryController)
);

router.post('/slayer-assignments', 
    authorize(['Admin', 'Operator Keberangkatan']), 
    inventoryController.assignSlayerToGroup.bind(inventoryController)
);

// Earphone mappings
router.get('/earphone-mappings', 
    authorize(['Admin', 'Marketing', 'Operator Keberangkatan']), 
    inventoryController.getEarphoneMappings.bind(inventoryController)
);

router.post('/earphone-mappings', 
    authorize(['Admin', 'Operator Keberangkatan']), 
    inventoryController.mapEarphoneToGroup.bind(inventoryController)
);

// Checklists
router.post('/jamaah-checklist', 
    authorize(['Admin', 'Operator Keberangkatan']), 
    inventoryController.updateJamaahChecklist.bind(inventoryController)
);

router.post('/tl-checklist', 
    authorize(['Admin', 'Operator Keberangkatan']), 
    inventoryController.updateTLChecklist.bind(inventoryController)
);

// Sales recap
router.get('/sales-recap', 
    authorize(['Admin', 'Marketing', 'Keuangan']), 
    inventoryController.getSalesRecap.bind(inventoryController)
);

module.exports = router;