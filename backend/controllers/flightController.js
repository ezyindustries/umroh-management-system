const FlightPNR = require('../models/FlightPNR');
const FlightPayment = require('../models/FlightPayment');

const flightController = {
  // PNR Management
  
  // Get all PNRs with filters
  async getAllPNRs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const filters = {
        status: req.query.status,
        airline: req.query.airline,
        search: req.query.search,
        departure_date_from: req.query.departure_date_from,
        departure_date_to: req.query.departure_date_to
      };

      const result = await FlightPNR.findAll(filters, page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error fetching PNRs:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single PNR with details
  async getPNRById(req, res) {
    try {
      const { id } = req.params;
      const pnr = await FlightPNR.getDetailWithPackages(id);
      res.json(pnr);
    } catch (error) {
      console.error('Error fetching PNR details:', error);
      res.status(404).json({ error: error.message });
    }
  },

  // Create new PNR
  async createPNR(req, res) {
    try {
      const userId = req.user?.id || 1; // Get from auth middleware
      const pnr = await FlightPNR.create(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'PNR berhasil dibuat',
        data: pnr
      });
    } catch (error) {
      console.error('Error creating PNR:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Update PNR
  async updatePNR(req, res) {
    try {
      const { id } = req.params;
      const pnr = await FlightPNR.update(id, req.body);
      res.json({
        success: true,
        message: 'PNR berhasil diupdate',
        data: pnr
      });
    } catch (error) {
      console.error('Error updating PNR:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Delete PNR
  async deletePNR(req, res) {
    try {
      const { id } = req.params;
      const result = await FlightPNR.delete(id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting PNR:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Package Management

  // Get packages without PNR
  async getPackagesWithoutPNR(req, res) {
    try {
      const packages = await FlightPNR.getPackagesWithoutPNR();
      res.json({
        success: true,
        count: packages.length,
        data: packages
      });
    } catch (error) {
      console.error('Error fetching packages without PNR:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Assign PNR to package
  async assignPackageToPNR(req, res) {
    try {
      const { id } = req.params; // PNR ID
      const { package_id, seats_allocated } = req.body;
      const userId = req.user?.id || 1;
      
      const result = await FlightPNR.assignToPackage(id, package_id, seats_allocated, userId);
      res.json(result);
    } catch (error) {
      console.error('Error assigning package to PNR:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Remove package from PNR
  async removePackageFromPNR(req, res) {
    try {
      const { id, packageId } = req.params;
      const result = await FlightPNR.removePackageAssignment(id, packageId);
      res.json(result);
    } catch (error) {
      console.error('Error removing package from PNR:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Payment Management

  // Get all payments for a PNR
  async getPNRPayments(req, res) {
    try {
      const { id } = req.params;
      const payments = await FlightPayment.findByPNR(id);
      const summary = await FlightPayment.getSummaryByPNR(id);
      
      res.json({
        success: true,
        summary,
        payments
      });
    } catch (error) {
      console.error('Error fetching PNR payments:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create payment
  async createPayment(req, res) {
    try {
      const userId = req.user?.id || 1;
      const payment = await FlightPayment.create(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Pembayaran berhasil dicatat',
        data: payment
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Update payment
  async updatePayment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 1;
      const payment = await FlightPayment.update(id, req.body, userId);
      res.json({
        success: true,
        message: 'Pembayaran berhasil diupdate',
        data: payment
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Delete payment
  async deletePayment(req, res) {
    try {
      const { id } = req.params;
      const result = await FlightPayment.delete(id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting payment:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Get all payments with filters
  async getAllPayments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const filters = {
        pnr_id: req.query.pnr_id,
        status: req.query.status,
        payment_method: req.query.payment_method,
        date_from: req.query.date_from,
        date_to: req.query.date_to
      };

      const result = await FlightPayment.findAll(filters, page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Dashboard & Stats

  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      const stats = await FlightPNR.getDashboardStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = flightController;