const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const hotelController = require('../controllers/hotelController');

// All routes require authentication
router.use(authenticate);

// Hotel CRUD operations
router.get('/', 
    authorize(['Admin', 'Marketing', 'Tim Hotel', 'Operator Keberangkatan']), 
    hotelController.getHotels.bind(hotelController)
);

router.get('/:id', 
    authorize(['Admin', 'Marketing', 'Tim Hotel', 'Operator Keberangkatan']), 
    hotelController.getHotel.bind(hotelController)
);

router.post('/', 
    authorize(['Admin', 'Tim Hotel']), 
    hotelController.createHotel.bind(hotelController)
);

router.put('/:id', 
    authorize(['Admin', 'Tim Hotel']), 
    hotelController.updateHotel.bind(hotelController)
);

router.delete('/:id', 
    authorize(['Admin']), 
    hotelController.deleteHotel.bind(hotelController)
);

// Document management
router.post('/:id/documents', 
    authorize(['Admin', 'Tim Hotel']), 
    hotelController.uploadDocument.bind(hotelController)
);

// Payment management
router.post('/:id/payments', 
    authorize(['Admin', 'Tim Hotel', 'Keuangan']), 
    hotelController.recordPayment.bind(hotelController)
);

// Get hotels by package
router.get('/package/:packageId', 
    authorize(['Admin', 'Marketing', 'Tim Hotel', 'Operator Keberangkatan']), 
    hotelController.getHotelsByPackage.bind(hotelController)
);

module.exports = router;