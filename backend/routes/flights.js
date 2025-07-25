const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// PNR routes
router.get('/pnrs', flightController.getAllPNRs);
router.get('/pnrs/:id', flightController.getPNRById);
router.post('/pnrs', flightController.createPNR);
router.put('/pnrs/:id', flightController.updatePNR);

// Jamaah assignment routes
router.post('/pnrs/:id/assign-jamaah', flightController.assignJamaah);
router.delete('/pnrs/:id/jamaah/:jamaahId', flightController.removeJamaah);
router.get('/packages/:packageId/available-jamaah', flightController.getAvailableJamaah);

// Payment routes
router.put('/pnrs/:id/payments/:paymentId', flightController.updatePayment);

module.exports = router;