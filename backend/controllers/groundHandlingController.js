const {
  GroundHandling,
  GroundHandlingLounge,
  GroundHandlingHotel,
  GroundHandlingMeal,
  GroundHandlingSchedule,
  GroundHandlingRequest,
  GroundHandlingDocument
} = require('../models/GroundHandling');
const ApiError = require('../utils/ApiError');
const fs = require('fs').promises;
const path = require('path');

// Main ground handling CRUD
exports.createGroundHandling = async (req, res, next) => {
  try {
    const groundHandling = await GroundHandling.create({
      ...req.body,
      created_by: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: groundHandling
    });
  } catch (error) {
    next(error);
  }
};

exports.getGroundHandling = async (req, res, next) => {
  try {
    const { id } = req.params;
    const groundHandling = await GroundHandling.findById(id);
    
    if (!groundHandling) {
      throw new ApiError(404, 'Ground handling not found');
    }

    // Get related data
    const [lounges, hotels, meals, schedules, requests, documents] = await Promise.all([
      GroundHandlingLounge.findByGroundHandlingId(id),
      GroundHandlingHotel.findByGroundHandlingId(id),
      GroundHandlingMeal.findByGroundHandlingId(id),
      GroundHandlingSchedule.findByGroundHandlingId(id),
      GroundHandlingRequest.findByGroundHandlingId(id),
      GroundHandlingDocument.findByGroundHandlingId(id)
    ]);

    res.json({
      success: true,
      data: {
        ...groundHandling,
        lounges,
        hotels,
        meals,
        schedules,
        requests,
        documents
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUpcomingHandlings = async (req, res, next) => {
  try {
    const { status, urgency, search, limit = 50 } = req.query;
    
    const groundHandlings = await GroundHandling.getUpcoming({
      status,
      urgency,
      search,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: groundHandlings
    });
  } catch (error) {
    next(error);
  }
};

exports.updateGroundHandling = async (req, res, next) => {
  try {
    const { id } = req.params;
    const groundHandling = await GroundHandling.update(id, req.body);
    
    if (!groundHandling) {
      throw new ApiError(404, 'Ground handling not found');
    }

    res.json({
      success: true,
      data: groundHandling
    });
  } catch (error) {
    next(error);
  }
};

exports.updateGroundHandlingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const groundHandling = await GroundHandling.updateStatus(id, status);
    
    if (!groundHandling) {
      throw new ApiError(404, 'Ground handling not found');
    }

    res.json({
      success: true,
      data: groundHandling
    });
  } catch (error) {
    next(error);
  }
};

exports.getStatistics = async (req, res, next) => {
  try {
    const stats = await GroundHandling.getStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// Lounge management
exports.addLounge = async (req, res, next) => {
  try {
    const lounge = await GroundHandlingLounge.create(req.body);
    
    res.status(201).json({
      success: true,
      data: lounge
    });
  } catch (error) {
    next(error);
  }
};

// Hotel management
exports.addHotel = async (req, res, next) => {
  try {
    const hotel = await GroundHandlingHotel.create(req.body);
    
    res.status(201).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    next(error);
  }
};

// Meal management
exports.addMeal = async (req, res, next) => {
  try {
    const meal = await GroundHandlingMeal.create(req.body);
    
    res.status(201).json({
      success: true,
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

// Schedule management
exports.addSchedule = async (req, res, next) => {
  try {
    const schedule = await GroundHandlingSchedule.create(req.body);
    
    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

exports.updateScheduleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const schedule = await GroundHandlingSchedule.updateStatus(id, status);
    
    if (!schedule) {
      throw new ApiError(404, 'Schedule not found');
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

// Request management
exports.addRequest = async (req, res, next) => {
  try {
    const request = await GroundHandlingRequest.create(req.body);
    
    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const request = await GroundHandlingRequest.updateStatus(id, status);
    
    if (!request) {
      throw new ApiError(404, 'Request not found');
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// Document management
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    const document = await GroundHandlingDocument.create({
      ground_handling_id: req.body.ground_handling_id,
      document_type: req.body.document_type,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_size: req.file.size,
      uploaded_by: req.user.id,
      notes: req.body.notes
    });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await GroundHandlingDocument.delete(id);
    
    if (!document) {
      throw new ApiError(404, 'Document not found');
    }

    // Delete physical file
    try {
      await fs.unlink(document.file_path);
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Calendar view
exports.getCalendarEvents = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    // This would fetch all ground handling events within the date range
    // and format them for calendar display
    const events = await GroundHandling.getUpcoming({
      start_date,
      end_date
    });

    const calendarEvents = events.map(event => ({
      id: event.id,
      title: `${event.flight_code} - ${event.route}`,
      start: event.departure_datetime,
      end: event.arrival_datetime,
      color: event.urgency_level === 'urgent' ? '#EF4444' : 
             event.urgency_level === 'soon' ? '#F59E0B' : '#3B82F6',
      extendedProps: {
        airline: event.airline,
        terminal: event.terminal,
        package: event.package_name,
        group: event.group_name,
        pax: event.total_pax,
        status: event.status
      }
    }));

    res.json({
      success: true,
      data: calendarEvents
    });
  } catch (error) {
    next(error);
  }
};