const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const groundHandlingController = require('../controllers/groundHandlingController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/ground-handling/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gh-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Statistics
router.get('/statistics', 
  authorize(['Admin', 'Operator Keberangkatan', 'Team Ticketing']), 
  groundHandlingController.getStatistics
);

// Calendar events
router.get('/calendar', 
  authorize(['Admin', 'Operator Keberangkatan', 'Team Ticketing']), 
  groundHandlingController.getCalendarEvents
);

// Main ground handling
router.get('/', 
  authorize(['Admin', 'Operator Keberangkatan', 'Team Ticketing']), 
  groundHandlingController.getUpcomingHandlings
);

router.post('/', 
  authorize(['Admin', 'Operator Keberangkatan']), 
  groundHandlingController.createGroundHandling
);

router.get('/:id', 
  authorize(['Admin', 'Operator Keberangkatan', 'Team Ticketing']), 
  groundHandlingController.getGroundHandling
);

router.put('/:id', 
  authorize(['Admin', 'Operator Keberangkatan']), 
  groundHandlingController.updateGroundHandling
);

router.patch('/:id/status', 
  authorize(['Admin', 'Operator Keberangkatan']), 
  groundHandlingController.updateGroundHandlingStatus
);

// Lounge management
router.post('/lounges', 
  authorize(['Admin', 'Operator Keberangkatan']), 
  groundHandlingController.addLounge
);

// Hotel management
router.post('/hotels', 
  authorize(['Admin', 'Operator Keberangkatan']), 
  groundHandlingController.addHotel
);

// Meal management
router.post('/meals', 
  authorize(['Admin', 'Operator Keberangkatan']), 
  groundHandlingController.addMeal
);

// Schedule management
router.post('/schedules', 
  authorize(['Admin', 'Operator Keberangkatan']), 
  groundHandlingController.addSchedule
);

router.patch('/schedules/:id/status', 
  authorize(['Admin', 'Operator Keberangkatan']), 
  groundHandlingController.updateScheduleStatus
);

// Request management
router.post('/requests', 
  authorize(['Admin', 'Operator Keberangkatan']), 
  groundHandlingController.addRequest
);

router.patch('/requests/:id/status', 
  authorize(['Admin', 'Operator Keberangkatan']), 
  groundHandlingController.updateRequestStatus
);

// Document management
router.post('/documents', 
  authorize(['Admin', 'Operator Keberangkatan']),
  upload.single('document'),
  groundHandlingController.uploadDocument
);

router.delete('/documents/:id', 
  authorize(['Admin', 'Operator Keberangkatan']), 
  groundHandlingController.deleteDocument
);

module.exports = router;