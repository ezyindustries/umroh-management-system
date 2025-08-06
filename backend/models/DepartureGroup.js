const { query, transaction } = require('../config/database');

class DepartureGroup {
  // Create new departure group
  static async create(groupData, createdBy = 1) {
    const {
      package_id,
      name,
      code,
      max_members,
      departure_date,
      bus_number,
      meeting_time,
      meeting_point,
      tour_leader,
      tour_leader_phone,
      status = 'planning',
      notes
    } = groupData;

    const result = await query(
      `INSERT INTO departure_groups (
        package_id, name, code, max_members, current_members,
        departure_date, bus_number, meeting_time, meeting_point,
        tour_leader, tour_leader_phone, status, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        package_id, name, code, max_members, 0,
        departure_date, bus_number, meeting_time, meeting_point,
        tour_leader, tour_leader_phone, status, notes, createdBy
      ]
    );

    return result.rows[0];
  }

  // Get all departure groups with filters
  static async findAll(filters = {}, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];
    let paramCount = 1;

    // Build WHERE conditions
    if (filters.package_id) {
      conditions.push(`dg.package_id = $${paramCount}`);
      params.push(filters.package_id);
      paramCount++;
    }

    if (filters.status) {
      conditions.push(`dg.status = $${paramCount}`);
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      conditions.push(`(
        dg.name ILIKE $${paramCount} OR 
        dg.code ILIKE $${paramCount} OR 
        dg.tour_leader ILIKE $${paramCount} OR
        p.name ILIKE $${paramCount}
      )`);
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) 
      FROM departure_groups dg
      LEFT JOIN core.packages p ON dg.package_id = p.id
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    params.push(limit, offset);
    const dataQuery = `
      SELECT 
        dg.*,
        p.name as package_name,
        p.code as package_code,
        p.departure_date as package_departure_date,
        p.return_date as package_return_date,
        p.quota as package_quota,
        (SELECT COUNT(*) FROM group_members WHERE group_id = dg.id) as actual_members,
        (SELECT COUNT(*) FROM departure_sub_groups WHERE group_id = dg.id) as sub_groups_count
      FROM departure_groups dg
      LEFT JOIN core.packages p ON dg.package_id = p.id
      ${whereClause}
      ORDER BY dg.departure_date DESC, dg.created_at DESC
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

  // Get departure group by ID
  static async findById(id) {
    const result = await query(
      `SELECT 
        dg.*,
        p.name as package_name,
        p.code as package_code,
        p.departure_date as package_departure_date,
        p.return_date as package_return_date,
        p.quota as package_quota,
        (SELECT COUNT(*) FROM group_members WHERE group_id = dg.id) as actual_members
      FROM departure_groups dg
      LEFT JOIN core.packages p ON dg.package_id = p.id
      WHERE dg.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }

    // Get sub groups
    const subGroupsResult = await query(
      `SELECT * FROM departure_sub_groups WHERE group_id = $1 ORDER BY id`,
      [id]
    );

    // Get members
    const membersResult = await query(
      `SELECT 
        gm.*,
        jd.name as jamaah_name,
        jd.phone as jamaah_phone,
        jd.passport_number
      FROM group_members gm
      LEFT JOIN jamaah.jamaah_data jd ON gm.jamaah_id = jd.id
      WHERE gm.group_id = $1
      ORDER BY gm.sub_group_id, gm.seat_number`,
      [id]
    );

    const group = result.rows[0];
    group.sub_groups = subGroupsResult.rows;
    group.members = membersResult.rows;

    return group;
  }

  // Update departure group
  static async update(id, updateData, updatedBy = 1) {
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.created_by;
    
    // Add updated_by
    updateData.updated_by = updatedBy;
    
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    if (fields.length === 0) {
      return this.findById(id);
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    values.push(id);
    
    const updateQuery = `
      UPDATE departure_groups 
      SET ${setClause}
      WHERE id = $${values.length}
      RETURNING *
    `;
    
    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      throw new Error('Departure group not found');
    }
    
    return result.rows[0];
  }

  // Delete departure group
  static async delete(id) {
    const deleteQuery = 'DELETE FROM departure_groups WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Departure group not found');
    }
    
    return result.rows[0];
  }

  // Add member to group
  static async addMember(groupId, jamaahId, data = {}, createdBy = 1) {
    const {
      sub_group_id,
      role = 'member',
      seat_number,
      room_number,
      notes
    } = data;

    const result = await query(
      `INSERT INTO group_members (
        group_id, sub_group_id, jamaah_id, role,
        seat_number, room_number, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        groupId, sub_group_id, jamaahId, role,
        seat_number, room_number, notes, createdBy
      ]
    );

    // Update current_members count
    await this.updateMemberCount(groupId);
    
    return result.rows[0];
  }

  // Remove member from group
  static async removeMember(groupId, jamaahId) {
    const result = await query(
      'DELETE FROM group_members WHERE group_id = $1 AND jamaah_id = $2 RETURNING *',
      [groupId, jamaahId]
    );

    if (result.rows.length > 0) {
      // Update current_members count
      await this.updateMemberCount(groupId);
    }

    return result.rows[0];
  }

  // Update member count
  static async updateMemberCount(groupId) {
    await query(
      `UPDATE departure_groups 
      SET current_members = (
        SELECT COUNT(*) FROM group_members WHERE group_id = $1
      )
      WHERE id = $1`,
      [groupId]
    );
  }

  // Create sub group
  static async createSubGroup(groupId, subGroupData) {
    const {
      name,
      hotel_makkah,
      hotel_madinah,
      max_members,
      notes
    } = subGroupData;

    const result = await query(
      `INSERT INTO departure_sub_groups (
        group_id, name, hotel_makkah, hotel_madinah,
        max_members, current_members, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        groupId, name, hotel_makkah, hotel_madinah,
        max_members, 0, notes
      ]
    );

    return result.rows[0];
  }

  // Get groups by package
  static async findByPackageId(packageId) {
    const result = await query(
      `SELECT 
        dg.*,
        (SELECT COUNT(*) FROM group_members WHERE group_id = dg.id) as actual_members,
        (SELECT COUNT(*) FROM departure_sub_groups WHERE group_id = dg.id) as sub_groups_count
      FROM departure_groups dg
      WHERE dg.package_id = $1
      ORDER BY dg.created_at`,
      [packageId]
    );

    return result.rows;
  }

  // Generate group code
  static async generateCode(packageCode, sequenceNumber = 1) {
    const letter = String.fromCharCode(64 + sequenceNumber); // A, B, C, etc.
    return `${packageCode}-${letter}`;
  }

  // Get statistics
  static async getStatistics() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_groups,
        COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning_groups,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_groups,
        COUNT(CASE WHEN status = 'departed' THEN 1 END) as departed_groups,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_groups,
        SUM(current_members) as total_members,
        SUM(max_members) as total_capacity
      FROM departure_groups
    `);

    return result.rows[0];
  }
}

module.exports = DepartureGroup;