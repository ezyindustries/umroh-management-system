const Hotel = require('../models/Hotel');

class HotelController {
  // Get all hotel bookings
  static async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      
      const filters = {};
      if (req.query.hotel_city) filters.hotel_city = req.query.hotel_city;
      if (req.query.booking_status) filters.booking_status = req.query.booking_status;
      if (req.query.payment_status) filters.payment_status = req.query.payment_status;
      if (req.query.package_id) filters.package_id = req.query.package_id;
      if (req.query.search) filters.search = req.query.search;

      const result = await Hotel.findAll(filters, page, limit);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // Get hotel booking by ID
  static async getById(req, res, next) {
    try {
      const booking = await Hotel.findById(req.params.id);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Hotel booking not found'
        });
      }

      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new hotel booking
  static async create(req, res, next) {
    try {
      const userId = req.user?.id || 1; // Default to 1 if no auth
      const booking = await Hotel.create(req.body, userId);
      
      res.status(201).json({
        success: true,
        message: 'Hotel booking created successfully',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  // Update hotel booking
  static async update(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const booking = await Hotel.update(req.params.id, req.body, userId);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Hotel booking not found'
        });
      }

      res.json({
        success: true,
        message: 'Hotel booking updated successfully',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete hotel booking
  static async delete(req, res, next) {
    try {
      await Hotel.delete(req.params.id);
      
      res.json({
        success: true,
        message: 'Hotel booking deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get statistics
  static async getStatistics(req, res, next) {
    try {
      const stats = await Hotel.getStatistics();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bookings by package
  static async getByPackage(req, res, next) {
    try {
      const bookings = await Hotel.getByPackageId(req.params.packageId);
      
      res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
      next(error);
    }
  }

  // Get upcoming check-ins
  static async getUpcomingCheckIns(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 7;
      const bookings = await Hotel.getUpcomingCheckIns(days);
      
      res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HotelController;