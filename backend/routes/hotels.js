const express = require('express');
const router = express.Router();
const HotelController = require('../controllers/hotelController');
const { authBypass } = require('../middleware/auth-bypass');

// Apply auth bypass middleware for testing
router.use(authBypass);

// Get hotel statistics
router.get('/statistics', HotelController.getStatistics);

// Get upcoming check-ins
router.get('/upcoming-checkins', HotelController.getUpcomingCheckIns);

// Get bookings by package
router.get('/package/:packageId', HotelController.getByPackage);

// CRUD operations
router.get('/', HotelController.getAll);
router.get('/:id', HotelController.getById);
router.post('/', HotelController.create);
router.put('/:id', HotelController.update);
router.delete('/:id', HotelController.delete);

module.exports = router;