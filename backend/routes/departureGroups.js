const express = require('express');
const router = express.Router();
const DepartureGroupController = require('../controllers/departureGroupController');
const { authBypass } = require('../middleware/auth-bypass');

// Apply auth bypass middleware for testing
router.use(authBypass);

// Get statistics
router.get('/statistics', DepartureGroupController.getStatistics);

// Get groups by package
router.get('/package/:packageId', DepartureGroupController.getByPackage);

// CRUD operations
router.get('/', DepartureGroupController.getAll);
router.get('/:id', DepartureGroupController.getById);
router.post('/', DepartureGroupController.create);
router.put('/:id', DepartureGroupController.update);
router.delete('/:id', DepartureGroupController.delete);

// Member management
router.post('/:id/members', DepartureGroupController.addMember);
router.delete('/:id/members/:jamaahId', DepartureGroupController.removeMember);

// Sub group management
router.post('/:id/sub-groups', DepartureGroupController.createSubGroup);

module.exports = router;