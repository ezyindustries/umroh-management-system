const { query, transaction } = require('../config/database');
const Joi = require('joi');

class Package {
  
  static getValidationSchema() {
    return Joi.object({
      // Required fields
      kode_paket: Joi.string().max(50).required(),
      nama_paket: Joi.string().max(255).required(),
      tanggal_berangkat: Joi.date().required(),
      tanggal_pulang: Joi.date().required(),
      kuota: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required(),
      hotel_makkah: Joi.string().max(255).required(),
      hotel_madinah: Joi.string().max(255).required(),
      maskapai: Joi.string().max(100).required(),
      malam_makkah: Joi.number().integer().min(1).required(),
      malam_madinah: Joi.number().integer().min(1).required(),
      
      // Optional fields
      deskripsi_singkat: Joi.string().max(2000).allow('', null),
      informasi_detail: Joi.string().allow('', null),
      gambar_utama: Joi.string().allow('', null),
      gambar_tambahan: Joi.array().items(Joi.string()).allow(null),
      
      // Flight details
      kota_keberangkatan: Joi.string().max(100).allow('', null),
      transit_berangkat: Joi.string().max(100).allow('', null),
      kota_tiba: Joi.string().max(100).allow('', null),
      nomor_penerbangan_berangkat: Joi.string().max(50).allow('', null),
      kota_pulang_dari: Joi.string().max(100).allow('', null),
      transit_pulang: Joi.string().max(100).allow('', null),
      kota_tiba_pulang: Joi.string().max(100).allow('', null),
      nomor_penerbangan_pulang: Joi.string().max(50).allow('', null),
      catatan_penerbangan: Joi.string().allow('', null)
    });
  }

  // Generate automatic package code
  static generateKodePaket(tahun, jumlahHari, kotaAsal, bulanTanggal) {
    const kotaCode = kotaAsal.substring(0, 3).toUpperCase();
    return `#${tahun}_${jumlahHari}H_${kotaCode}_${bulanTanggal}`;
  }

  // Create new package
  static async create(packageData, createdBy) {
    console.log('Package.create - Input data:', packageData);
    console.log('Package.create - Created by:', createdBy);
    
    const { error, value } = this.getValidationSchema().validate(packageData);
    if (error) {
      console.error('Package.create - Validation error:', error.details[0].message);
      throw new Error(`Validation error: ${error.details[0].message}`);
    }
    
    console.log('Package.create - Validated data:', value);

    // First create the schema if it doesn't exist
    await query(`CREATE SCHEMA IF NOT EXISTS core`);
    
    // Then create the table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS core.packages (
        id SERIAL PRIMARY KEY,
        kode_paket VARCHAR(50) UNIQUE NOT NULL,
        nama_paket VARCHAR(255) NOT NULL,
        jumlah_hari INTEGER,
        kota_asal VARCHAR(100),
        maskapai VARCHAR(100),
        kota_transit VARCHAR(100),
        jumlah_malam_transit INTEGER DEFAULT 0,
        hotel_makkah VARCHAR(255),
        jumlah_malam_makkah INTEGER,
        hotel_medina VARCHAR(255),
        jumlah_malam_medina INTEGER,
        kereta_cepat BOOLEAN DEFAULT false,
        thaif BOOLEAN DEFAULT false,
        jumlah_seat_total INTEGER,
        sisa_seat INTEGER,
        price DECIMAL(15,2),
        description TEXT,
        departure_date DATE,
        return_date DATE,
        max_capacity INTEGER,
        current_capacity INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Calculate duration days
    const departureDate = new Date(value.tanggal_berangkat);
    const returnDate = new Date(value.tanggal_pulang);
    const duration = Math.ceil((returnDate - departureDate) / (1000 * 60 * 60 * 24)) + 1;

    const result = await query(
      `INSERT INTO core.packages (
        code, name, price, description, departure_date, 
        return_date, quota, makkah_hotel, madinah_hotel,
        makkah_nights, madinah_nights, airline, status,
        departure_city, transit_city_departure, arrival_city, departure_flight_number,
        return_departure_city, transit_city_return, return_arrival_city, return_flight_number,
        flight_info, brochure_image, package_info, package_images
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *`,
      [
        value.kode_paket,
        value.nama_paket,
        value.price,
        value.deskripsi_singkat || '',
        value.tanggal_berangkat,
        value.tanggal_pulang,
        value.kuota,
        value.hotel_makkah,
        value.hotel_madinah || value.hotel_medina,
        value.malam_makkah || 0,
        value.malam_madinah || value.malam_medina || 0,
        value.maskapai,
        'active',
        value.kota_keberangkatan || null,
        value.transit_berangkat || null,
        value.kota_tiba || null,
        value.nomor_penerbangan_berangkat || null,
        value.kota_pulang_dari || null,
        value.transit_pulang || null,
        value.kota_tiba_pulang || null,
        value.nomor_penerbangan_pulang || null,
        value.catatan_penerbangan || null,
        value.gambar_utama || null,
        value.informasi_detail || null,
        JSON.stringify(value.gambar_tambahan || [])
      ]
    );

    return result.rows[0];
  }

  // Get package by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM core.packages WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Get all packages with filters
  static async findAll(filters = {}, page = 1, limit = 50) {
    let whereConditions = ['1=1'];
    let values = [];
    let paramCount = 0;

    if (filters.is_active !== undefined) {
      paramCount++;
      whereConditions.push(`is_active = $${paramCount}`);
      values.push(filters.is_active);
    }

    if (filters.search) {
      paramCount++;
      whereConditions.push(`(kode_paket ILIKE $${paramCount} OR nama_paket ILIKE $${paramCount} OR kota_asal ILIKE $${paramCount} OR maskapai ILIKE $${paramCount})`);
      values.push(`%${filters.search}%`);
    }

    if (filters.available_only) {
      whereConditions.push('sisa_seat > 0');
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM core.packages WHERE ${whereClause}`;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get data with pagination
    paramCount++;
    values.push(limit);
    paramCount++;
    values.push(offset);

    const dataQuery = `
      SELECT p.*
      FROM core.packages p
      WHERE ${whereClause}
      ORDER BY p.departure_date ASC, p.name ASC
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

  // Update package
  static async update(id, updateData) {
    const packageData = await this.findById(id);
    if (!packageData) {
      throw new Error('Package tidak ditemukan');
    }

    const { error, value } = this.getValidationSchema().validate(updateData);
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    // Map frontend fields to database columns
    const fieldMapping = {
      'kode_paket': 'code',
      'nama_paket': 'name',
      'tanggal_berangkat': 'departure_date',
      'tanggal_pulang': 'return_date',
      'kuota': 'quota',
      'hotel_makkah': 'makkah_hotel',
      'hotel_madinah': 'madinah_hotel',
      'malam_makkah': 'makkah_nights',
      'malam_madinah': 'madinah_nights',
      'maskapai': 'airline',
      'deskripsi_singkat': 'description',
      'informasi_detail': 'package_info',
      'gambar_utama': 'brochure_image',
      'gambar_tambahan': 'package_images',
      'kota_keberangkatan': 'departure_city',
      'transit_berangkat': 'transit_city_departure',
      'kota_tiba': 'arrival_city',
      'nomor_penerbangan_berangkat': 'departure_flight_number',
      'kota_pulang_dari': 'return_departure_city',
      'transit_pulang': 'transit_city_return',
      'kota_tiba_pulang': 'return_arrival_city',
      'nomor_penerbangan_pulang': 'return_flight_number',
      'catatan_penerbangan': 'flight_info'
    };

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    for (const [key, val] of Object.entries(value)) {
      const dbField = fieldMapping[key] || key;
      paramCount++;
      updateFields.push(`${dbField} = $${paramCount}`);
      
      // Handle special cases
      if (key === 'gambar_tambahan') {
        updateValues.push(JSON.stringify(val || []));
      } else {
        updateValues.push(val);
      }
    }

    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date());

    paramCount++;
    updateValues.push(id);

    const updateQuery = `
      UPDATE core.packages 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);
    return result.rows[0];
  }

  // Delete package (only if no jamaah assigned)
  static async delete(id) {
    const packageData = await this.findById(id);
    if (!packageData) {
      throw new Error('Package tidak ditemukan');
    }

    // Check if any jamaah is assigned to this package
    const jamaahCount = await query(
      'SELECT COUNT(*) as count FROM jamaah WHERE package_id = $1 AND is_deleted = false',
      [id]
    );

    if (parseInt(jamaahCount.rows[0].count) > 0) {
      throw new Error('Package tidak dapat dihapus karena masih ada jamaah yang terdaftar');
    }

    await query('DELETE FROM core.packages WHERE id = $1', [id]);
    return { success: true };
  }

  // Get package statistics
  static async getStatistics() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_packages,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_packages,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_packages,
        AVG(price) as average_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        SUM(max_capacity) as total_capacity,
        SUM(current_capacity) as total_occupied
      FROM core.packages
    `);

    return result.rows[0];
  }

  // Get package with jamaah details
  static async getWithJamaah(id) {
    const packageData = await this.findById(id);
    if (!packageData) {
      throw new Error('Package tidak ditemukan');
    }

    const jamaahResult = await query(
      `SELECT id, full_name, nik, phone, jamaah_status, payment_status
       FROM jamaah 
       WHERE package_id = $1 AND is_deleted = false
       ORDER BY full_name`,
      [id]
    );

    return {
      ...packageData,
      jamaah_list: jamaahResult.rows
    };
  }

  // Get available packages (not full)
  static async getAvailable() {
    const result = await query(`
      SELECT p.*, (p.max_capacity - p.current_capacity) as available_capacity
      FROM core.packages p
      WHERE p.is_active = true 
        AND p.current_capacity < p.max_capacity
        AND (p.departure_date IS NULL OR p.departure_date >= CURRENT_DATE)
      ORDER BY p.departure_date ASC, p.name ASC
    `);

    return result.rows;
  }

  // Update package seat availability (called when jamaah is assigned/removed)
  static async updateSeatAvailability(id) {
    const result = await query(`
      UPDATE core.packages 
      SET sisa_seat = jumlah_seat_total - (
        SELECT COUNT(*) 
        FROM jamaah 
        WHERE package_id = $1 AND is_deleted = false
      ),
      current_capacity = (
        SELECT COUNT(*) 
        FROM jamaah 
        WHERE package_id = $1 AND is_deleted = false
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);

    return result.rows[0];
  }

  // Check if package has available seats
  static async hasAvailableSeats(id, requestedSeats = 1) {
    const packageData = await this.findById(id);
    if (!packageData) {
      return false;
    }

    return packageData.sisa_seat >= requestedSeats;
  }

  // Get package by code
  static async findByCode(kode_paket) {
    const result = await query(
      'SELECT * FROM core.packages WHERE kode_paket = $1',
      [kode_paket]
    );
    return result.rows[0];
  }

  // Get packages by departure date range
  static async findByDateRange(startDate, endDate) {
    const result = await query(`
      SELECT p.*, 
             (p.max_capacity - p.current_capacity) as available_capacity
      FROM core.packages p
      WHERE p.departure_date BETWEEN $1 AND $2
        AND p.is_active = true
      ORDER BY p.departure_date ASC
    `, [startDate, endDate]);

    return result.rows;
  }

  // Get package occupancy report
  static async getOccupancyReport() {
    const result = await query(`
      SELECT 
        p.id,
        p.name,
        p.max_capacity,
        p.current_capacity,
        p.departure_date,
        p.price,
        (p.current_capacity::float / p.max_capacity * 100) as occupancy_percentage,
        (p.max_capacity - p.current_capacity) as available_spots
      FROM core.packages p
      WHERE p.is_active = true
      ORDER BY p.departure_date ASC
    `);

    return result.rows;
  }

  // Check if package has capacity for new jamaah
  static async hasCapacity(id, count = 1) {
    const packageData = await this.findById(id);
    if (!packageData) {
      return false;
    }

    return (packageData.current_capacity + count) <= packageData.max_capacity;
  }

  // Get popular packages (most jamaah registered)
  static async getPopular(limit = 5) {
    const result = await query(`
      SELECT p.*, 
             COUNT(j.id) as jamaah_count,
             (p.current_capacity::float / p.max_capacity * 100) as occupancy_percentage
      FROM core.packages p
      LEFT JOIN jamaah.jamaah_data j ON p.id = j.id AND j.status != 'cancelled'
      WHERE p.is_active = true
      GROUP BY p.id
      ORDER BY jamaah_count DESC, p.created_at DESC
      LIMIT $1
    `, [limit]);

    return result.rows;
  }

  // Get package with brochure images
  static async getWithBrosur(id) {
    const packageData = await this.findById(id);
    if (!packageData) {
      throw new Error('Package tidak ditemukan');
    }

    const brosurResult = await query(`
      SELECT * FROM package_brosur 
      WHERE package_id = $1 
      ORDER BY image_order ASC, created_at ASC
    `, [id]);

    return {
      ...packageData,
      brosur_images: brosurResult.rows
    };
  }

  // Get packages with primary brochure images
  static async findAllWithPrimaryImage(filters = {}, page = 1, limit = 50) {
    let whereConditions = ['1=1'];
    let values = [];
    let paramCount = 0;

    if (filters.is_active !== undefined) {
      paramCount++;
      whereConditions.push(`p.is_active = $${paramCount}`);
      values.push(filters.is_active);
    }

    if (filters.search) {
      paramCount++;
      whereConditions.push(`(p.kode_paket ILIKE $${paramCount} OR p.nama_paket ILIKE $${paramCount} OR p.kota_asal ILIKE $${paramCount} OR p.maskapai ILIKE $${paramCount})`);
      values.push(`%${filters.search}%`);
    }

    if (filters.available_only) {
      whereConditions.push('p.sisa_seat > 0');
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM core.packages p WHERE ${whereClause}`;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get data with pagination and primary brochure image
    paramCount++;
    values.push(limit);
    paramCount++;
    values.push(offset);

    const dataQuery = `
      SELECT p.*, 
             p.sisa_seat as available_capacity,
             (p.jumlah_seat_total - p.sisa_seat) as occupied_seats,
             COUNT(j.id) as jamaah_count,
             ROUND((p.jumlah_seat_total - p.sisa_seat)::decimal / p.jumlah_seat_total * 100, 2) as occupancy_percentage,
             pb.image_url as primary_image_url,
             pb.image_filename as primary_image_filename,
             pb.alt_text as primary_image_alt
      FROM core.packages p
      LEFT JOIN jamaah.jamaah_data j ON p.id = j.id AND j.status != 'cancelled'
      LEFT JOIN package_brosur pb ON p.id = pb.package_id AND pb.is_primary = true
      WHERE ${whereClause}
      GROUP BY p.id, pb.image_url, pb.image_filename, pb.alt_text
      ORDER BY p.departure_date ASC, p.kode_paket ASC
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

  // Update package
  static async update(id, data) {
    // Remove fields that shouldn't be updated
    delete data.id;
    delete data.created_at;
    delete data.created_by;
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    if (fields.length === 0) {
      return this.findById(id);
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    values.push(id);
    
    const updateQuery = `
      UPDATE core.packages 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length}
      RETURNING *
    `;
    
    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      throw new Error('Package not found');
    }
    
    return result.rows[0];
  }

  // Update flight information
  static async updateFlightInfo(id, flightData) {
    const { 
      pnr_code, 
      ticket_vendor, 
      ticket_number, 
      flight_payment_status, 
      flight_notes,
      payment_due_date,
      insert_name_deadline,
      ticket_total_price,
      ticket_paid_amount
    } = flightData;
    
    const updateQuery = `
      UPDATE core.packages 
      SET 
        pnr_code = $1,
        ticket_vendor = $2,
        ticket_number = $3,
        flight_payment_status = $4,
        flight_notes = $5,
        payment_due_date = $6,
        insert_name_deadline = $7,
        ticket_total_price = $8,
        ticket_paid_amount = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;
    
    const result = await query(updateQuery, [
      pnr_code,
      ticket_vendor,
      ticket_number,
      flight_payment_status,
      flight_notes,
      payment_due_date || null,
      insert_name_deadline || null,
      ticket_total_price || null,
      ticket_paid_amount || null,
      id
    ]);
    
    if (result.rows.length === 0) {
      throw new Error('Package not found');
    }
    
    return result.rows[0];
  }

  // Delete package
  static async delete(id) {
    // Check if package has jamaah
    const jamaahCheck = await query(
      'SELECT COUNT(*) as count FROM jamaah.jamaah_data WHERE package_id = $1',
      [id]
    );
    
    if (parseInt(jamaahCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete package with registered jamaah');
    }
    
    const deleteQuery = 'DELETE FROM core.packages WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Package not found');
    }
    
    return result.rows[0];
  }
}

module.exports = Package;