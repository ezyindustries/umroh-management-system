const { query, transaction } = require('../config/database');

class Hotel {
  // Get all hotel bookings with filters
  static async findAll(filters = {}, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];
    let paramCount = 1;

    // Build WHERE conditions
    if (filters.hotel_city) {
      conditions.push(`hb.hotel_city = $${paramCount}`);
      params.push(filters.hotel_city);
      paramCount++;
    }

    if (filters.booking_status) {
      conditions.push(`hb.booking_status = $${paramCount}`);
      params.push(filters.booking_status);
      paramCount++;
    }

    if (filters.payment_status) {
      conditions.push(`hb.payment_status = $${paramCount}`);
      params.push(filters.payment_status);
      paramCount++;
    }

    if (filters.package_id) {
      conditions.push(`hb.package_id = $${paramCount}`);
      params.push(filters.package_id);
      paramCount++;
    }

    if (filters.search) {
      conditions.push(`(
        hb.hotel_name ILIKE $${paramCount} OR 
        hb.booking_reference ILIKE $${paramCount} OR 
        hb.hotel_provider ILIKE $${paramCount} OR
        p.nama_paket ILIKE $${paramCount}
      )`);
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) 
      FROM hotel_bookings hb
      LEFT JOIN core.packages p ON hb.package_id = p.id
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    params.push(limit, offset);
    const dataQuery = `
      SELECT 
        hb.*,
        p.kode_paket as package_code,
        p.nama_paket as package_name,
        p.tanggal_berangkat as package_departure_date,
        p.tanggal_pulang as package_return_date,
        CASE 
          WHEN hb.check_in_date IS NOT NULL THEN 
            hb.check_in_date - CURRENT_DATE
          ELSE NULL
        END as days_until_checkin
      FROM hotel_bookings hb
      LEFT JOIN core.packages p ON hb.package_id = p.id
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN hb.check_in_date IS NOT NULL THEN hb.check_in_date
          ELSE p.tanggal_berangkat
        END ASC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    const result = await query(dataQuery, params);

    return {
      data: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Get hotel booking by ID
  static async findById(id) {
    const result = await query(
      `SELECT 
        hb.*,
        p.kode_paket as package_code,
        p.nama_paket as package_name,
        p.tanggal_berangkat as package_departure_date,
        p.tanggal_pulang as package_return_date
      FROM hotel_bookings hb
      LEFT JOIN core.packages p ON hb.package_id = p.id
      WHERE hb.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Create new hotel booking
  static async create(bookingData, createdBy) {
    const {
      package_id,
      hotel_name,
      hotel_city,
      booking_reference,
      check_in_date,
      check_out_date,
      nights,
      total_rooms,
      room_types,
      booking_status,
      payment_status,
      hotel_provider,
      contact_person,
      phone_number,
      total_amount,
      paid_amount,
      notes
    } = bookingData;

    const result = await query(
      `INSERT INTO hotel_bookings (
        package_id, hotel_name, hotel_city, booking_reference,
        check_in_date, check_out_date, nights, total_rooms,
        room_types, booking_status, payment_status, hotel_provider,
        contact_person, phone_number, total_amount, paid_amount,
        notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        package_id, hotel_name, hotel_city, booking_reference,
        check_in_date, check_out_date, nights, total_rooms,
        JSON.stringify(room_types || {}), booking_status || 'pending', 
        payment_status || 'unpaid', hotel_provider,
        contact_person, phone_number, total_amount || 0, paid_amount || 0,
        notes, createdBy
      ]
    );

    return result.rows[0];
  }

  // Update hotel booking
  static async update(id, bookingData, updatedBy) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic UPDATE query
    Object.keys(bookingData).forEach(key => {
      if (bookingData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        if (key === 'room_types' && typeof bookingData[key] === 'object') {
          values.push(JSON.stringify(bookingData[key]));
        } else {
          values.push(bookingData[key]);
        }
        paramCount++;
      }
    });

    // Add updated_by
    fields.push(`updated_by = $${paramCount}`);
    values.push(updatedBy);
    paramCount++;

    // Add id for WHERE clause
    values.push(id);

    const result = await query(
      `UPDATE hotel_bookings 
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  // Delete hotel booking
  static async delete(id) {
    await query('DELETE FROM hotel_bookings WHERE id = $1', [id]);
  }

  // Get statistics
  static async getStatistics() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(DISTINCT hotel_name) as total_hotels,
        COUNT(CASE WHEN booking_status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN booking_status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_bookings,
        SUM(total_rooms) as total_rooms_booked,
        SUM(total_amount) as total_booking_value,
        SUM(paid_amount) as total_paid_amount
      FROM hotel_bookings
    `);

    const cityStats = await query(`
      SELECT 
        hotel_city,
        COUNT(*) as bookings_count,
        SUM(total_rooms) as rooms_count
      FROM hotel_bookings
      GROUP BY hotel_city
    `);

    return {
      ...result.rows[0],
      by_city: cityStats.rows
    };
  }

  // Get bookings by package
  static async getByPackageId(packageId) {
    const result = await query(
      `SELECT * FROM hotel_bookings 
       WHERE package_id = $1 
       ORDER BY hotel_city`,
      [packageId]
    );
    return result.rows;
  }

  // Get upcoming check-ins
  static async getUpcomingCheckIns(days = 7) {
    const result = await query(
      `SELECT 
        hb.*,
        p.kode_paket as package_code,
        p.nama_paket as package_name,
        hb.check_in_date - CURRENT_DATE as days_until_checkin
      FROM hotel_bookings hb
      LEFT JOIN core.packages p ON hb.package_id = p.id
      WHERE hb.check_in_date >= CURRENT_DATE
        AND hb.check_in_date <= CURRENT_DATE + INTERVAL '${days} days'
        AND hb.booking_status != 'cancelled'
      ORDER BY hb.check_in_date ASC`,
      []
    );
    return result.rows;
  }
}

module.exports = Hotel;