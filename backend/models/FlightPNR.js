const { query, transaction } = require('../config/database');
const Joi = require('joi');

class FlightPNR {
  
  static getValidationSchema() {
    return Joi.object({
      // Required fields
      pnr_code: Joi.string().max(20).required(),
      airline: Joi.string().max(100).required(),
      departure_city: Joi.string().max(100).required(),
      arrival_city: Joi.string().max(100).required(),
      departure_date: Joi.date().required(),
      total_seats: Joi.number().integer().min(1).required(),
      price_per_seat: Joi.number().min(0).required(),
      
      // Optional fields
      airline_code: Joi.string().max(10).allow('', null),
      departure_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow('', null),
      arrival_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow('', null),
      return_date: Joi.date().allow(null),
      return_departure_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow('', null),
      return_arrival_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow('', null),
      flight_number: Joi.string().max(50).allow('', null),
      return_flight_number: Joi.string().max(50).allow('', null),
      booking_date: Joi.date().allow(null),
      payment_due_date: Joi.date().allow(null),
      notes: Joi.string().allow('', null),
      status: Joi.string().valid('pending', 'partial_paid', 'paid', 'cancelled').default('pending')
    });
  }

  // Create new PNR
  static async create(pnrData, createdBy) {
    const { error, value } = this.getValidationSchema().validate(pnrData);
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    // Calculate total price
    value.total_price = value.total_seats * value.price_per_seat;
    value.used_seats = 0;
    value.paid_amount = 0;
    value.created_by = createdBy;

    const columns = Object.keys(value).join(', ');
    const placeholders = Object.keys(value).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(value);

    const result = await query(
      `INSERT INTO flight.pnr (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    return result.rows[0];
  }

  // Get PNR by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM flight.pnr WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Get all PNRs with filters
  static async findAll(filters = {}, page = 1, limit = 50) {
    let whereConditions = ['1=1'];
    let values = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      whereConditions.push(`status = $${paramCount}`);
      values.push(filters.status);
    }

    if (filters.airline) {
      paramCount++;
      whereConditions.push(`airline ILIKE $${paramCount}`);
      values.push(`%${filters.airline}%`);
    }

    if (filters.search) {
      paramCount++;
      whereConditions.push(`(pnr_code ILIKE $${paramCount} OR airline ILIKE $${paramCount})`);
      values.push(`%${filters.search}%`);
    }

    if (filters.departure_date_from) {
      paramCount++;
      whereConditions.push(`departure_date >= $${paramCount}`);
      values.push(filters.departure_date_from);
    }

    if (filters.departure_date_to) {
      paramCount++;
      whereConditions.push(`departure_date <= $${paramCount}`);
      values.push(filters.departure_date_to);
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM flight.pnr WHERE ${whereClause}`;
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
        COALESCE(p.total_seats - p.used_seats, 0) as available_seats,
        CASE 
          WHEN p.paid_amount >= p.total_price THEN 'Lunas'
          WHEN p.paid_amount > 0 THEN 'Partial (' || ROUND((p.paid_amount / p.total_price * 100)::numeric, 0) || '%)'
          ELSE 'Belum Bayar'
        END as payment_status,
        COUNT(DISTINCT pp.package_id) as package_count,
        STRING_AGG(DISTINCT pkg.name, ', ' ORDER BY pkg.name) as package_names
      FROM flight.pnr p
      LEFT JOIN flight.package_pnr pp ON p.id = pp.pnr_id
      LEFT JOIN core.packages pkg ON pp.package_id = pkg.id
      WHERE ${whereClause}
      GROUP BY p.id
      ORDER BY p.departure_date ASC, p.pnr_code ASC
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

  // Update PNR
  static async update(id, updateData) {
    const pnrData = await this.findById(id);
    if (!pnrData) {
      throw new Error('PNR tidak ditemukan');
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.used_seats;
    delete updateData.paid_amount;
    delete updateData.created_at;
    delete updateData.created_by;

    const { error, value } = this.getValidationSchema().validate({
      ...pnrData,
      ...updateData
    });
    
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    // Recalculate total price if seats or price changed
    if (updateData.total_seats || updateData.price_per_seat) {
      value.total_price = (value.total_seats || pnrData.total_seats) * (value.price_per_seat || pnrData.price_per_seat);
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
      return pnrData;
    }

    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date());

    paramCount++;
    updateValues.push(id);

    const updateQuery = `
      UPDATE flight.pnr 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);
    return result.rows[0];
  }

  // Delete PNR (only if no packages assigned)
  static async delete(id) {
    const pnrData = await this.findById(id);
    if (!pnrData) {
      throw new Error('PNR tidak ditemukan');
    }

    // Check if any package is assigned
    const assignmentCheck = await query(
      'SELECT COUNT(*) as count FROM flight.package_pnr WHERE pnr_id = $1',
      [id]
    );

    if (parseInt(assignmentCheck.rows[0].count) > 0) {
      throw new Error('Tidak dapat menghapus PNR yang sudah memiliki paket terkait');
    }

    await query('DELETE FROM flight.pnr WHERE id = $1', [id]);
    return { success: true, message: 'PNR berhasil dihapus' };
  }

  // Get packages without PNR
  static async getPackagesWithoutPNR() {
    const result = await query(`
      SELECT 
        p.id,
        p.code,
        p.name,
        p.departure_date,
        p.return_date,
        p.departure_city,
        p.arrival_city,
        p.airline,
        p.quota,
        p.departure_flight_number,
        p.return_flight_number,
        CASE 
          WHEN p.departure_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'urgent'
          WHEN p.departure_date <= CURRENT_DATE + INTERVAL '60 days' THEN 'soon'
          ELSE 'normal'
        END as urgency
      FROM core.packages p
      LEFT JOIN flight.package_pnr pp ON p.id = pp.package_id
      WHERE pp.id IS NULL
      AND p.status = 'active'
      AND p.departure_date > CURRENT_DATE
      ORDER BY p.departure_date ASC
    `);
    
    return result.rows;
  }

  // Assign PNR to package
  static async assignToPackage(pnrId, packageId, seatsAllocated, assignedBy) {
    // Check if PNR exists
    const pnr = await this.findById(pnrId);
    if (!pnr) {
      throw new Error('PNR tidak ditemukan');
    }

    // Check if package exists
    const packageCheck = await query(
      'SELECT id, name, quota FROM core.packages WHERE id = $1',
      [packageId]
    );
    
    if (packageCheck.rows.length === 0) {
      throw new Error('Paket tidak ditemukan');
    }

    const packageData = packageCheck.rows[0];

    // Check if seats available
    if (pnr.available_seats < seatsAllocated) {
      throw new Error(`Seats tidak mencukupi. Tersedia: ${pnr.available_seats}`);
    }

    // Check if already assigned
    const existingCheck = await query(
      'SELECT id FROM flight.package_pnr WHERE package_id = $1 AND pnr_id = $2',
      [packageId, pnrId]
    );

    if (existingCheck.rows.length > 0) {
      throw new Error('Paket sudah terdaftar pada PNR ini');
    }

    // Insert assignment
    const result = await query(
      `INSERT INTO flight.package_pnr (package_id, pnr_id, seats_allocated, assigned_by) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [packageId, pnrId, seatsAllocated, assignedBy]
    );

    return {
      success: true,
      message: `Paket ${packageData.name} berhasil ditambahkan ke PNR ${pnr.pnr_code}`,
      data: result.rows[0]
    };
  }

  // Remove package assignment
  static async removePackageAssignment(pnrId, packageId) {
    const result = await query(
      'DELETE FROM flight.package_pnr WHERE pnr_id = $1 AND package_id = $2 RETURNING *',
      [pnrId, packageId]
    );

    if (result.rows.length === 0) {
      throw new Error('Assignment tidak ditemukan');
    }

    return {
      success: true,
      message: 'Paket berhasil dihapus dari PNR'
    };
  }

  // Get PNR details with packages
  static async getDetailWithPackages(id) {
    const pnr = await this.findById(id);
    if (!pnr) {
      throw new Error('PNR tidak ditemukan');
    }

    // Get assigned packages
    const packagesResult = await query(`
      SELECT 
        pp.*,
        p.code as package_code,
        p.name as package_name,
        p.departure_date as package_departure_date,
        p.quota as package_quota
      FROM flight.package_pnr pp
      JOIN core.packages p ON pp.package_id = p.id
      WHERE pp.pnr_id = $1
      ORDER BY p.departure_date
    `, [id]);

    // Get payment history
    const paymentsResult = await query(`
      SELECT * FROM flight.pnr_payments 
      WHERE pnr_id = $1 
      ORDER BY payment_date DESC
    `, [id]);

    return {
      ...pnr,
      packages: packagesResult.rows,
      payments: paymentsResult.rows,
      available_seats: pnr.total_seats - pnr.used_seats,
      payment_percentage: pnr.total_price > 0 ? Math.round((pnr.paid_amount / pnr.total_price) * 100) : 0
    };
  }

  // Get dashboard statistics
  static async getDashboardStats() {
    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'partial_paid') as partial_paid_count,
        COUNT(*) FILTER (WHERE status = 'paid') as paid_count,
        COUNT(*) as total_pnr,
        SUM(total_price) as total_value,
        SUM(paid_amount) as total_paid,
        SUM(total_price - paid_amount) as total_outstanding,
        COUNT(*) FILTER (WHERE departure_date <= CURRENT_DATE + INTERVAL '7 days' AND departure_date > CURRENT_DATE) as departing_soon,
        COUNT(*) FILTER (WHERE payment_due_date <= CURRENT_DATE + INTERVAL '7 days' AND payment_due_date > CURRENT_DATE AND status != 'paid') as payment_due_soon
      FROM flight.pnr
      WHERE status != 'cancelled'
    `);

    const packagesWithoutPNR = await query(`
      SELECT COUNT(*) as count
      FROM core.packages p
      LEFT JOIN flight.package_pnr pp ON p.id = pp.package_id
      WHERE pp.id IS NULL
      AND p.status = 'active'
      AND p.departure_date > CURRENT_DATE
    `);

    return {
      ...result.rows[0],
      packages_without_pnr: parseInt(packagesWithoutPNR.rows[0].count)
    };
  }
}

module.exports = FlightPNR;