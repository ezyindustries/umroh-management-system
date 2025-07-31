const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// PNR Management Routes
router.get('/pnrs', flightController.getAllPNRs);
router.get('/pnrs/:id', flightController.getPNRById);
router.post('/pnrs', flightController.createPNR);
router.put('/pnrs/:id', flightController.updatePNR);
router.delete('/pnrs/:id', flightController.deletePNR);

// Package Management Routes
router.get('/packages/without-pnr', flightController.getPackagesWithoutPNR);
router.post('/pnrs/:id/assign-package', flightController.assignPackageToPNR);
router.delete('/pnrs/:id/package/:packageId', flightController.removePackageFromPNR);

// Payment Management Routes
router.get('/pnrs/:id/payments', flightController.getPNRPayments);
router.get('/payments', flightController.getAllPayments);
router.post('/payments', flightController.createPayment);
router.put('/payments/:id', flightController.updatePayment);
router.delete('/payments/:id', flightController.deletePayment);

// Dashboard & Stats
router.get('/dashboard/stats', flightController.getDashboardStats);

module.exports = router;