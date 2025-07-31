const { query } = require('../config/database');
const Joi = require('joi');

class FlightPayment {
  
  static getValidationSchema() {
    return Joi.object({
      // Required fields
      pnr_id: Joi.number().integer().required(),
      payment_date: Joi.date().required(),
      amount: Joi.number().min(0).required(),
      payment_method: Joi.string().max(50).required(),
      
      // Optional fields
      payment_reference: Joi.string().max(100).allow('', null),
      payment_proof: Joi.string().allow('', null), // Base64 or URL
      bank_name: Joi.string().max(100).allow('', null),
      account_number: Joi.string().max(50).allow('', null),
      account_name: Joi.string().max(100).allow('', null),
      notes: Joi.string().allow('', null),
      status: Joi.string().valid('pending', 'verified', 'rejected').default('verified')
    });
  }

  // Create new payment
  static async create(paymentData, createdBy) {
    const { error, value } = this.getValidationSchema().validate(paymentData);
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    // Check if PNR exists
    const pnrCheck = await query(
      'SELECT id, total_price, paid_amount FROM flight.pnr WHERE id = $1',
      [value.pnr_id]
    );

    if (pnrCheck.rows.length === 0) {
      throw new Error('PNR tidak ditemukan');
    }

    const pnr = pnrCheck.rows[0];

    // Check if payment would exceed total price
    const totalPaidAfter = parseFloat(pnr.paid_amount) + parseFloat(value.amount);
    if (totalPaidAfter > parseFloat(pnr.total_price)) {
      const remaining = parseFloat(pnr.total_price) - parseFloat(pnr.paid_amount);
      throw new Error(`Pembayaran melebihi total. Sisa yang harus dibayar: Rp ${remaining.toLocaleString('id-ID')}`);
    }

    value.created_by = createdBy;
    if (value.status === 'verified') {
      value.verified_by = createdBy;
      value.verified_at = new Date();
    }

    const columns = Object.keys(value).join(', ');
    const placeholders = Object.keys(value).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(value);

    const result = await query(
      `INSERT INTO flight.pnr_payments (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    return result.rows[0];
  }

  // Get payment by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM flight.pnr_payments WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Get payments by PNR ID
  static async findByPNR(pnrId) {
    const result = await query(
      `SELECT 
        p.*,
        CASE 
          WHEN p.status = 'verified' THEN 'Verified'
          WHEN p.status = 'pending' THEN 'Pending'
          WHEN p.status = 'rejected' THEN 'Rejected'
        END as status_text
      FROM flight.pnr_payments p
      WHERE p.pnr_id = $1
      ORDER BY p.payment_date DESC, p.created_at DESC`,
      [pnrId]
    );
    
    return result.rows;
  }

  // Update payment
  static async update(id, updateData, updatedBy) {
    const payment = await this.findById(id);
    if (!payment) {
      throw new Error('Payment tidak ditemukan');
    }

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.pnr_id;
    delete updateData.created_at;
    delete updateData.created_by;

    // If status is being changed to verified
    if (updateData.status === 'verified' && payment.status !== 'verified') {
      updateData.verified_by = updatedBy;
      updateData.verified_at = new Date();
    }

    const { error, value } = this.getValidationSchema().validate({
      ...payment,
      ...updateData
    });
    
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    for (const [key, val] of Object.entries(updateData)) {
      paramCount++;
      updateFields.push(`${key} = $${paramCount}`);
      updateValues.push(val);
    }

    if (updateFields.length === 0) {
      return payment;
    }

    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date());

    paramCount++;
    updateValues.push(id);

    const updateQuery = `
      UPDATE flight.pnr_payments 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);
    return result.rows[0];
  }

  // Delete payment
  static async delete(id) {
    const payment = await this.findById(id);
    if (!payment) {
      throw new Error('Payment tidak ditemukan');
    }

    if (payment.status === 'verified') {
      throw new Error('Tidak dapat menghapus pembayaran yang sudah diverifikasi');
    }

    await query('DELETE FROM flight.pnr_payments WHERE id = $1', [id]);
    return { success: true, message: 'Payment berhasil dihapus' };
  }

  // Get payment summary by PNR
  static async getSummaryByPNR(pnrId) {
    const result = await query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) FILTER (WHERE status = 'verified') as total_verified,
        SUM(amount) FILTER (WHERE status = 'pending') as total_pending,
        SUM(amount) FILTER (WHERE status = 'rejected') as total_rejected,
        MAX(payment_date) FILTER (WHERE status = 'verified') as last_payment_date,
        STRING_AGG(DISTINCT payment_method, ', ' ORDER BY payment_method) FILTER (WHERE status = 'verified') as payment_methods
      FROM flight.pnr_payments
      WHERE pnr_id = $1
    `, [pnrId]);

    return result.rows[0];
  }

  // Get all payments with filters
  static async findAll(filters = {}, page = 1, limit = 50) {
    let whereConditions = ['1=1'];
    let values = [];
    let paramCount = 0;

    if (filters.pnr_id) {
      paramCount++;
      whereConditions.push(`p.pnr_id = $${paramCount}`);
      values.push(filters.pnr_id);
    }

    if (filters.status) {
      paramCount++;
      whereConditions.push(`p.status = $${paramCount}`);
      values.push(filters.status);
    }

    if (filters.payment_method) {
      paramCount++;
      whereConditions.push(`p.payment_method = $${paramCount}`);
      values.push(filters.payment_method);
    }

    if (filters.date_from) {
      paramCount++;
      whereConditions.push(`p.payment_date >= $${paramCount}`);
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      paramCount++;
      whereConditions.push(`p.payment_date <= $${paramCount}`);
      values.push(filters.date_to);
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM flight.pnr_payments p WHERE ${whereClause}`;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get data with pagination
    paramCount++;
    values.push(limit);
    paramCount++;
    values.push(offset);

    const dataQuery = `
      SELECT 
        p.*,
        pnr.pnr_code,
        pnr.airline,
        pnr.departure_date,
        pnr.total_price as pnr_total_price
      FROM flight.pnr_payments p
      JOIN flight.pnr pnr ON p.pnr_id = pnr.id
      WHERE ${whereClause}
      ORDER BY p.payment_date DESC, p.created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const dataResult = await query(dataQuery, values);

    return {
      data: dataResult.rows,
      pagination: {
        current_page: page,
        per_page: limit,
        total: total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = FlightPayment;