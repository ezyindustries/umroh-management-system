const DepartureGroup = require('../models/DepartureGroup');

class DepartureGroupController {
  // Get all departure groups
  static async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      
      const filters = {};
      if (req.query.package_id) filters.package_id = req.query.package_id;
      if (req.query.status) filters.status = req.query.status;
      if (req.query.search) filters.search = req.query.search;

      const result = await DepartureGroup.findAll(filters, page, limit);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // Get departure group by ID
  static async getById(req, res, next) {
    try {
      const group = await DepartureGroup.findById(req.params.id);
      
      if (!group) {
        return res.status(404).json({
          success: false,
          error: 'Departure group not found'
        });
      }

      res.json({
        success: true,
        data: group
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new departure group
  static async create(req, res, next) {
    try {
      const userId = req.user?.id || 1; // Default to 1 if no auth
      const group = await DepartureGroup.create(req.body, userId);
      
      res.status(201).json({
        success: true,
        message: 'Departure group created successfully',
        data: group
      });
    } catch (error) {
      next(error);
    }
  }

  // Update departure group
  static async update(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const group = await DepartureGroup.update(req.params.id, req.body, userId);
      
      res.json({
        success: true,
        message: 'Departure group updated successfully',
        data: group
      });
    } catch (error) {
      if (error.message === 'Departure group not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  // Delete departure group
  static async delete(req, res, next) {
    try {
      await DepartureGroup.delete(req.params.id);
      
      res.json({
        success: true,
        message: 'Departure group deleted successfully'
      });
    } catch (error) {
      if (error.message === 'Departure group not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  // Get groups by package
  static async getByPackage(req, res, next) {
    try {
      const groups = await DepartureGroup.findByPackageId(req.params.packageId);
      
      res.json({
        success: true,
        data: groups
      });
    } catch (error) {
      next(error);
    }
  }

  // Add member to group
  static async addMember(req, res, next) {
    try {
      const userId = req.user?.id || 1;
      const { jamaah_id, ...memberData } = req.body;
      
      const member = await DepartureGroup.addMember(
        req.params.id,
        jamaah_id,
        memberData,
        userId
      );
      
      res.status(201).json({
        success: true,
        message: 'Member added to group successfully',
        data: member
      });
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({
          success: false,
          error: 'Member already exists in this group'
        });
      }
      next(error);
    }
  }

  // Remove member from group
  static async removeMember(req, res, next) {
    try {
      await DepartureGroup.removeMember(req.params.id, req.params.jamaahId);
      
      res.json({
        success: true,
        message: 'Member removed from group successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Create sub group
  static async createSubGroup(req, res, next) {
    try {
      const subGroup = await DepartureGroup.createSubGroup(req.params.id, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Sub group created successfully',
        data: subGroup
      });
    } catch (error) {
      next(error);
    }
  }

  // Get statistics
  static async getStatistics(req, res, next) {
    try {
      const stats = await DepartureGroup.getStatistics();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DepartureGroupController;