# MODULE: Relasi Keluarga/Mahram - Business Flow Documentation

## Overview
Modul ini mengelola pengelompokan keluarga jamaah untuk keperluan koordinasi perjalanan, penempatan kamar hotel, dan pengaturan tempat duduk. Sistem berfokus pada fleksibilitas pengelompokan manual dengan fitur auto-assign kamar sebagai saran awal yang dapat dimodifikasi.

## Actors & Roles
### Primary Actors:
- **Admin/Operator**: Membuat dan mengelola kelompok keluarga
- **Finance Team**: Input info upgrade saat pendaftaran
- **Hotel Officer**: Menggunakan data untuk room assignment
- **Operations**: Koordinasi keluarga saat keberangkatan

### System Actor:
- **System**: Generate auto-assign suggestions untuk kamar

## Data Flow Diagram

### 1. Family Group Creation Flow
```
Select Jamaah → Create Family Group → Add Members → Save Group
                                           ↓
                                    Set Room Preferences
```

### 2. Room Assignment Flow
```
View Package Jamaah → Run Auto-Assign → Review Suggestions → Manual Adjust
                              ↓                                    ↓
                    Based on: Family, Gender, Upgrade        Save Final Assignment
```

### 3. Family Management Flow
```
Search Family → View Members → Add/Remove Members → Update Preferences
                                      ↓
                              Update Room Requirements
```

## Validation & Error Handling

### Family Group Rules:
1. **Membership Constraints**:
   - One jamaah = one family group only
   - No duplicate membership
   - Can be removed and added to different family

2. **Group Formation**:
   - Fully manual process
   - No automatic detection
   - No validation for actual family relations

3. **Room Preference Validation**:
   - Check upgrade status matches room type
   - Verify gender compatibility
   - Alert for special cases

## Business Rules

### Family Group Management:
1. **Creation**:
   - Manual selection of members
   - No minimum/maximum member limit
   - Name/label for easy identification
   - Active for specific package

2. **Room Preferences**:
   - Must stay together (upgraded room)
   - Can be separated (standard/random)
   - Mixed based on availability

3. **Upgrade Information**:
   - Recorded per jamaah (not per family)
   - Types: Quad to Triple, Quad to Double, etc.
   - Affects room assignment logic

### Room Assignment Logic:
1. **Auto-Assign Criteria**:
   - Priority 1: Keep families together (if required)
   - Priority 2: Gender segregation
   - Priority 3: Upgrade status
   - Priority 4: Fill rooms efficiently

2. **Room Types & Capacity**:
   - Quad: 4 persons (standard)
   - Triple: 3 persons (upgrade)
   - Double: 2 persons (upgrade)
   - Single: 1 person (special upgrade)

3. **Special Cases**:
   - Incomplete quad rooms (filled with 2-3 only)
   - Mixed upgrade within family
   - Large families needing multiple rooms

### Manual Override:
- All auto-assignments are suggestions
- Can move jamaah between rooms freely
- No system restrictions on manual changes
- Changes tracked in audit log

## API Contracts

### POST /api/family-groups
**Request Body:**
```json
{
  "name": "Keluarga Pak Ahmad",
  "package_id": 1,
  "notes": "Keluarga besar dari Jakarta",
  "room_preference": "must_together"
}
```

### POST /api/family-groups/{id}/members
**Request Body:**
```json
{
  "jamaah_ids": [1, 2, 3, 4],
  "primary_contact_id": 1
}
```

### GET /api/family-groups
**Query Parameters:**
- `package_id`: Filter by package
- `jamaah_id`: Find family of specific jamaah

**Response:**
```json
{
  "family_groups": [
    {
      "id": 1,
      "name": "Keluarga Pak Ahmad",
      "package": "Umroh Ramadhan 2025",
      "member_count": 4,
      "room_preference": "must_together",
      "members": [
        {
          "jamaah_id": 1,
          "name": "Ahmad Yusuf",
          "gender": "L",
          "age": 45,
          "upgrade_status": "double",
          "is_primary_contact": true
        },
        {
          "jamaah_id": 2,
          "name": "Fatimah Ahmad",
          "gender": "P",
          "age": 40,
          "upgrade_status": "double"
        }
      ]
    }
  ]
}
```

### POST /api/room-assignment/auto-suggest
**Request Body:**
```json
{
  "package_id": 1,
  "room_config": {
    "total_quad": 25,
    "total_triple": 5,
    "total_double": 10
  },
  "respect_family_groups": true
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "room_number": "101",
      "room_type": "quad",
      "occupancy": 4,
      "assigned_jamaah": [
        {
          "jamaah_id": 1,
          "name": "Ahmad Yusuf",
          "family_group": "Keluarga Pak Ahmad",
          "reason": "Family group - must together"
        }
      ]
    }
  ],
  "unassigned": [
    {
      "jamaah_id": 50,
      "name": "Budi Santoso",
      "reason": "No compatible room available"
    }
  ],
  "statistics": {
    "total_jamaah": 100,
    "assigned": 98,
    "unassigned": 2,
    "families_kept_together": 15,
    "families_separated": 2
  }
}
```

### PUT /api/room-assignment/manual
**Request Body:**
```json
{
  "moves": [
    {
      "jamaah_id": 1,
      "from_room": "101",
      "to_room": "205",
      "reason": "Family request"
    }
  ]
}
```

### DELETE /api/family-groups/{id}/members/{jamaah_id}
**Response:**
```json
{
  "success": true,
  "message": "Jamaah removed from family group",
  "affected_room_assignments": ["101", "102"]
}
```

## Edge Cases Handled

1. **Split Family Upgrades**:
   - Parents upgrade to double
   - Children stay in quad
   - System suggests adjacent rooms

2. **Large Family Groups**:
   - 10+ members needing multiple rooms
   - Auto-assign keeps in same floor/area
   - Manual adjustment for preferences

3. **Last-Minute Family Changes**:
   - Member cancellation
   - New member addition
   - Room reassignment needed

4. **Gender Imbalance**:
   - Odd number of males/females in family
   - System suggests best compromise
   - Manual resolution required

5. **Incomplete Rooms**:
   - Family of 3 in quad room
   - System flags for potential addition
   - Cost implications tracked

6. **Room Type Shortage**:
   - Not enough upgraded rooms
   - Priority rules for allocation
   - Manual negotiation needed

## Integration Points

1. **With Jamaah Module**:
   - Pull jamaah data for grouping
   - Read upgrade status
   - Update room assignment

2. **With Payment Module**:
   - Verify upgrade payment
   - Track room cost differences

3. **With Hotel Module**:
   - Export room assignments
   - Coordinate with hotel system

4. **With Reporting Module**:
   - Family statistics
   - Room utilization reports

5. **With Notification Module**:
   - Room assignment confirmations
   - Change notifications

## Auto-Assignment Algorithm

### Phase 1: Family Group Processing
```
1. Sort families by size (largest first)
2. For each family with "must_together":
   - Find suitable room(s) based on upgrade status
   - Assign all members together if possible
   - Flag if split required
```

### Phase 2: Individual Assignment
```
1. Group remaining by gender
2. Sort by upgrade status
3. Fill rooms optimally:
   - Upgraded individuals first
   - Standard quad filling
   - Minimize empty spaces
```

### Phase 3: Optimization
```
1. Review assignments for:
   - Adjacent rooms for split families
   - Same floor/area grouping
   - Special needs proximity
2. Generate suggestion report
```

## Audit Trail Requirements
Every action must log:
- Family group creation/modification
- Member additions/removals
- Room assignment changes
- Auto-suggest runs and results
- Manual overrides with reasons
- User making changes with timestamp