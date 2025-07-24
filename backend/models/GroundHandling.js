const { query } = require('../config/database');

class GroundHandling {
  static async create(data) {
    const sql = `
      INSERT INTO ground_handling (
        package_id, group_id, flight_code, airline, route, terminal,
        departure_datetime, arrival_datetime, pic_team, pic_phone,
        total_pax, total_baggage, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    
    const values = [
      data.package_id, data.group_id, data.flight_code, data.airline,
      data.route, data.terminal, data.departure_datetime, data.arrival_datetime,
      data.pic_team, data.pic_phone, data.total_pax || 0, data.total_baggage || 0,
      data.status || 'scheduled', data.created_by
    ];
    
    const result = await query(sql, values);
    return result.rows[0];
  }

  static async findById(id) {
    const sql = `
      SELECT gh.*, 
             p.name as package_name,
             g.name as group_name,
             EXTRACT(DAY FROM (gh.departure_datetime - CURRENT_TIMESTAMP)) as days_until_departure
      FROM ground_handling gh
      LEFT JOIN packages p ON gh.package_id = p.id
      LEFT JOIN groups g ON gh.group_id = g.id
      WHERE gh.id = $1
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async getUpcoming(filters = {}) {
    let sql = `
      SELECT gh.*, 
             p.name as package_name,
             g.name as group_name,
             EXTRACT(DAY FROM (gh.departure_datetime - CURRENT_TIMESTAMP)) as days_until_departure,
             CASE 
               WHEN gh.departure_datetime < CURRENT_TIMESTAMP THEN 'past'
               WHEN gh.departure_datetime <= CURRENT_TIMESTAMP + INTERVAL '3 days' THEN 'urgent'
               WHEN gh.departure_datetime <= CURRENT_TIMESTAMP + INTERVAL '7 days' THEN 'soon'
               ELSE 'upcoming'
             END as urgency_level,
             COUNT(DISTINCT ghl.id) as lounge_count,
             COUNT(DISTINCT ghh.id) as hotel_count,
             COUNT(DISTINCT ghm.id) as meal_count,
             COUNT(DISTINCT ghr.id) as request_count
      FROM ground_handling gh
      LEFT JOIN packages p ON gh.package_id = p.id
      LEFT JOIN groups g ON gh.group_id = g.id
      LEFT JOIN ground_handling_lounges ghl ON gh.id = ghl.ground_handling_id
      LEFT JOIN ground_handling_hotels ghh ON gh.id = ghh.ground_handling_id
      LEFT JOIN ground_handling_meals ghm ON gh.id = ghm.ground_handling_id
      LEFT JOIN ground_handling_requests ghr ON gh.id = ghr.ground_handling_id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      sql += ` AND gh.status = $${paramCount}`;
      values.push(filters.status);
    }

    if (filters.urgency) {
      switch(filters.urgency) {
        case 'urgent':
          sql += ` AND gh.departure_datetime <= CURRENT_TIMESTAMP + INTERVAL '3 days'`;
          break;
        case 'soon':
          sql += ` AND gh.departure_datetime > CURRENT_TIMESTAMP + INTERVAL '3 days' 
                   AND gh.departure_datetime <= CURRENT_TIMESTAMP + INTERVAL '7 days'`;
          break;
        case 'upcoming':
          sql += ` AND gh.departure_datetime > CURRENT_TIMESTAMP + INTERVAL '7 days'`;
          break;
      }
    }

    if (filters.search) {
      paramCount++;
      sql += ` AND (gh.flight_code ILIKE $${paramCount} OR gh.route ILIKE $${paramCount} 
               OR p.name ILIKE $${paramCount} OR g.name ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
    }

    sql += ` GROUP BY gh.id, p.id, g.id ORDER BY gh.departure_datetime ASC`;

    if (filters.limit) {
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    const result = await query(sql, values);
    return result.rows;
  }

  static async update(id, data) {
    const fields = Object.keys(data).filter(key => key !== 'id');
    const values = fields.map((field, index) => `${field} = $${index + 2}`);
    
    const sql = `
      UPDATE ground_handling 
      SET ${values.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const params = [id, ...fields.map(field => data[field])];
    const result = await query(sql, params);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const sql = `
      UPDATE ground_handling 
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [id, status]);
    return result.rows[0];
  }

  static async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_count,
        COUNT(*) FILTER (WHERE status = 'preparing') as preparing_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE departure_datetime <= CURRENT_TIMESTAMP + INTERVAL '3 days' 
                          AND status != 'completed') as urgent_count,
        COUNT(*) FILTER (WHERE departure_datetime > CURRENT_TIMESTAMP + INTERVAL '3 days' 
                          AND departure_datetime <= CURRENT_TIMESTAMP + INTERVAL '7 days'
                          AND status != 'completed') as soon_count
      FROM ground_handling
    `;
    
    const result = await query(sql);
    return result.rows[0];
  }
}

class GroundHandlingLounge {
  static async create(data) {
    const sql = `
      INSERT INTO ground_handling_lounges (
        ground_handling_id, lounge_type, lounge_name, location,
        booking_reference, pax_count, booking_time, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      data.ground_handling_id, data.lounge_type, data.lounge_name,
      data.location, data.booking_reference, data.pax_count || 0,
      data.booking_time, data.notes
    ];
    
    const result = await query(sql, values);
    return result.rows[0];
  }

  static async findByGroundHandlingId(groundHandlingId) {
    const sql = `SELECT * FROM ground_handling_lounges WHERE ground_handling_id = $1 ORDER BY booking_time`;
    const result = await query(sql, [groundHandlingId]);
    return result.rows;
  }
}

class GroundHandlingHotel {
  static async create(data) {
    const sql = `
      INSERT INTO ground_handling_hotels (
        ground_handling_id, hotel_name, location, booking_reference,
        check_in_date, check_out_date, room_count, pax_count, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      data.ground_handling_id, data.hotel_name, data.location,
      data.booking_reference, data.check_in_date, data.check_out_date,
      data.room_count || 0, data.pax_count || 0, data.notes
    ];
    
    const result = await query(sql, values);
    return result.rows[0];
  }

  static async findByGroundHandlingId(groundHandlingId) {
    const sql = `SELECT * FROM ground_handling_hotels WHERE ground_handling_id = $1 ORDER BY check_in_date`;
    const result = await query(sql, [groundHandlingId]);
    return result.rows;
  }
}

class GroundHandlingMeal {
  static async create(data) {
    const sql = `
      INSERT INTO ground_handling_meals (
        ground_handling_id, meal_type, meal_time, quantity,
        vendor_name, delivery_time, price_per_unit, total_price, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      data.ground_handling_id, data.meal_type, data.meal_time,
      data.quantity, data.vendor_name, data.delivery_time,
      data.price_per_unit, data.total_price, data.notes
    ];
    
    const result = await query(sql, values);
    return result.rows[0];
  }

  static async findByGroundHandlingId(groundHandlingId) {
    const sql = `SELECT * FROM ground_handling_meals WHERE ground_handling_id = $1 ORDER BY delivery_time`;
    const result = await query(sql, [groundHandlingId]);
    return result.rows;
  }
}

class GroundHandlingSchedule {
  static async create(data) {
    const sql = `
      INSERT INTO ground_handling_schedules (
        ground_handling_id, schedule_type, scheduled_time,
        location, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      data.ground_handling_id, data.schedule_type, data.scheduled_time,
      data.location, data.notes, data.status || 'pending'
    ];
    
    const result = await query(sql, values);
    return result.rows[0];
  }

  static async findByGroundHandlingId(groundHandlingId) {
    const sql = `SELECT * FROM ground_handling_schedules WHERE ground_handling_id = $1 ORDER BY scheduled_time`;
    const result = await query(sql, [groundHandlingId]);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const sql = `UPDATE ground_handling_schedules SET status = $2 WHERE id = $1 RETURNING *`;
    const result = await query(sql, [id, status]);
    return result.rows[0];
  }
}

class GroundHandlingRequest {
  static async create(data) {
    const sql = `
      INSERT INTO ground_handling_requests (
        ground_handling_id, jamaah_id, request_type,
        request_details, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      data.ground_handling_id, data.jamaah_id, data.request_type,
      data.request_details, data.status || 'pending', data.notes
    ];
    
    const result = await query(sql, values);
    return result.rows[0];
  }

  static async findByGroundHandlingId(groundHandlingId) {
    const sql = `
      SELECT ghr.*, j.full_name as jamaah_name, j.phone as jamaah_phone
      FROM ground_handling_requests ghr
      LEFT JOIN jamaah j ON ghr.jamaah_id = j.id
      WHERE ghr.ground_handling_id = $1 
      ORDER BY ghr.created_at DESC
    `;
    const result = await query(sql, [groundHandlingId]);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const sql = `UPDATE ground_handling_requests SET status = $2 WHERE id = $1 RETURNING *`;
    const result = await query(sql, [id, status]);
    return result.rows[0];
  }
}

class GroundHandlingDocument {
  static async create(data) {
    const sql = `
      INSERT INTO ground_handling_documents (
        ground_handling_id, document_type, file_name,
        file_path, file_size, uploaded_by, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      data.ground_handling_id, data.document_type, data.file_name,
      data.file_path, data.file_size, data.uploaded_by, data.notes
    ];
    
    const result = await query(sql, values);
    return result.rows[0];
  }

  static async findByGroundHandlingId(groundHandlingId) {
    const sql = `
      SELECT ghd.*, u.full_name as uploaded_by_name
      FROM ground_handling_documents ghd
      LEFT JOIN users u ON ghd.uploaded_by = u.id
      WHERE ghd.ground_handling_id = $1 
      ORDER BY ghd.created_at DESC
    `;
    const result = await query(sql, [groundHandlingId]);
    return result.rows;
  }

  static async delete(id) {
    const sql = `DELETE FROM ground_handling_documents WHERE id = $1 RETURNING *`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

module.exports = {
  GroundHandling,
  GroundHandlingLounge,
  GroundHandlingHotel,
  GroundHandlingMeal,
  GroundHandlingSchedule,
  GroundHandlingRequest,
  GroundHandlingDocument
};