# MODULE: Manajemen Rombongan - Business Flow Documentation

## Overview
Modul ini mengelola pembentukan rombongan, sub-group, alokasi transportasi, meeting point, dan absensi keberangkatan. Semua pembentukan dilakukan manual dengan fleksibilitas tinggi untuk mengakomodasi kondisi pasar dan kebutuhan operasional.

## Actors & Roles
### Primary Actors:
- **Operations Team**: Bentuk rombongan, sub-group, alokasi bus
- **Group Coordinator**: Kelola sub-group, absensi
- **Ground Handling**: Koordinasi meeting point, bagasi
- **Admin**: Monitor dan update data rombongan

### System Actor:
- **System**: Track attendance, generate manifest reports

## Data Flow Diagram

### 1. Group Formation Flow
```
Select Package → Create Main Group → Create Sub-Groups → Assign Jamaah
                                            ↓
                                    Set Group Leader
                                            ↓
                                    Configure Meeting Points
```

### 2. Transportation Allocation Flow
```
Count Total Jamaah → Determine Bus Needs → Manual Assignment → Generate Seating List
                                                    ↓
                                            Assign to Meeting Points
```

### 3. Departure Attendance Flow
```
Meeting Point Check-in → Search Jamaah → Mark Present → Record Baggage
                                              ↓
                                        Update Manifest
                                              ↓
                                     Mark No-Shows (if any)
```

## Validation & Error Handling

### Group Formation Rules:
1. **Flexible Structure**:
   - One package can have multiple sub-groups
   - Sub-groups can be based on:
     - City of origin
     - Market conditions
     - Special arrangements
     - Family groupings

2. **Price Variations**:
   - Base package price for default city
   - Additional accommodation fees for other cities
   - Managed per sub-group

3. **Leadership Assignment**:
   - Group leader: Manual selection
   - Sub-group coordinators: Manual selection
   - No automatic assignment

## Business Rules

### Sub-Group Management:
1. **Creation Triggers**:
   - Package not full from primary city
   - Open for secondary cities (SBY, JOG, etc.)
   - Different pricing tiers
   - Special arrangements

2. **Sub-Group Attributes**:
   - Name (e.g., "Jakarta Group", "Surabaya Group")
   - Base city
   - Additional costs
   - Coordinator assignment
   - Meeting point

### Transportation Planning:
1. **Bus Allocation**:
   - Manual assignment per jamaah
   - No automatic distribution
   - Considerations:
     - Family groups together
     - Medical needs (front seats)
     - City-based grouping
     - Special requests

2. **Capacity Planning**:
   - Standard bus: 45-50 seats
   - Consider guide/coordinator seats
   - Buffer for last-minute changes

### Meeting Point System:
1. **Configuration**:
   - Multiple points per city possible
   - Pre-assigned per jamaah
   - Time slots if needed

2. **Information Required**:
   - Location name & address
   - Gathering time
   - Contact person
   - Transportation to airport

### Attendance & Baggage Tracking:
1. **Check-in Process**:
   - Search jamaah by name/phone
   - Mark attendance status:
     - Present
     - No-show
   - Record baggage:
     - Large suitcases count
     - Small bags count
     - Special items (wheelchair, stroller)

2. **Special Notes**:
   - Free text field per jamaah
   - Examples:
     - "Needs wheelchair assistance"
     - "Traveling with oxygen tank"
     - "Request aisle seat"
     - "Family seating with ID 123, 124"

### PNR Management:
- Ensure correct PNR assignment
- No seat number tracking (except special cases)
- Airline handles seat assignment at check-in
- Special requests noted for airline staff

### No-Show Handling:
- No waiting time policy
- Mark as no-show in system
- Appears in manifest with status
- Financial implications handled separately

## API Contracts

### POST /api/groups
**Request Body:**
```json
{
  "package_id": 1,
  "name": "Umroh Ramadhan 2025 - Batch 1",
  "departure_date": "2025-03-15",
  "notes": "Combined Jakarta-Surabaya group"
}
```

### POST /api/groups/{group_id}/subgroups
**Request Body:**
```json
{
  "name": "Surabaya Sub-Group",
  "base_city": "Surabaya",
  "additional_cost": 1500000,
  "coordinator_jamaah_id": 45,
  "meeting_point": {
    "location": "Masjid Al-Akbar Surabaya",
    "address": "Jl. Masjid Al-Akbar Timur No.1",
    "gathering_time": "2025-03-15 04:00",
    "contact_person": "Pak Ahmad",
    "contact_phone": "081234567890"
  }
}
```

### POST /api/groups/{group_id}/assign-jamaah
**Request Body:**
```json
{
  "assignments": [
    {
      "jamaah_id": 1,
      "subgroup_id": 1,
      "bus_number": 1,
      "meeting_point_id": 1,
      "special_notes": "Needs wheelchair assistance at airport"
    },
    {
      "jamaah_id": 2,
      "subgroup_id": 1,
      "bus_number": 1,
      "meeting_point_id": 1,
      "special_notes": "Traveling with infant, need bassinet"
    }
  ]
}
```

### POST /api/attendance/checkin
**Request Body:**
```json
{
  "group_id": 1,
  "meeting_point_id": 1,
  "jamaah_id": 1,
  "status": "present",
  "check_in_time": "2025-03-15 04:30",
  "baggage": {
    "large_suitcases": 2,
    "small_bags": 1,
    "special_items": [
      {
        "type": "wheelchair",
        "count": 1,
        "notes": "Foldable wheelchair"
      }
    ]
  },
  "checked_in_by": "coordinator_user_id"
}
```

### GET /api/attendance/search
**Query Parameters:**
- `q`: Search query (name or phone)
- `group_id`: Filter by group
- `meeting_point_id`: Filter by meeting point

**Response:**
```json
{
  "results": [
    {
      "jamaah_id": 1,
      "name": "Hajah Fatimah",
      "phone": "081234567890",
      "subgroup": "Jakarta Group",
      "bus_number": 1,
      "meeting_point": "Masjid Istiqlal",
      "attendance_status": null,
      "special_notes": "Wheelchair assistance needed"
    }
  ]
}
```

### GET /api/groups/{group_id}/manifest
**Response:**
```json
{
  "group": {
    "name": "Umroh Ramadhan 2025 - Batch 1",
    "departure_date": "2025-03-15",
    "total_jamaah": 100,
    "total_present": 98,
    "total_no_show": 2
  },
  "by_bus": [
    {
      "bus_number": 1,
      "capacity": 50,
      "assigned": 48,
      "present": 47,
      "no_show": 1,
      "jamaah_list": [
        {
          "seat_no": "1A",
          "name": "Hajah Fatimah",
          "status": "present",
          "baggage": "2L, 1S",
          "special_items": "Wheelchair"
        }
      ]
    }
  ],
  "by_pnr": [
    {
      "pnr": "ABC123",
      "flight": "GA123",
      "total_pax": 100,
      "confirmed_pax": 98,
      "no_show_pax": 2
    }
  ],
  "no_shows": [
    {
      "jamaah_id": 99,
      "name": "Ahmad Latief",
      "phone": "081234567899",
      "subgroup": "Surabaya Group",
      "reason": "No-show at meeting point"
    }
  ]
}
```

### POST /api/groups/{group_id}/export-manifest
**Request Body:**
```json
{
  "format": "excel",
  "include_attendance": true,
  "include_baggage": true,
  "include_special_notes": true
}
```
**Response:** Excel file download

## Edge Cases Handled

1. **Last-Minute Group Changes**:
   - Jamaah switch between sub-groups
   - Bus reallocation needed
   - System allows quick updates

2. **Multi-City Coordination**:
   - Different time zones
   - Staggered meeting times
   - Central monitoring dashboard

3. **Family Group Splits**:
   - System warns but allows
   - Notes for coordination
   - Manual override available

4. **Baggage Anomalies**:
   - Excess baggage tracking
   - Special equipment logging
   - Cost implications noted

5. **No-Show Complications**:
   - Spouse present but one no-show
   - Baggage already loaded
   - Quick decision support

6. **PNR Mismatches**:
   - Wrong PNR assignment
   - Name differences with passport
   - Quick correction mechanism

## Integration Points

1. **With Jamaah Module**:
   - Pull jamaah data for assignment
   - Update travel status

2. **With Package Module**:
   - Link groups to packages
   - Check departure dates

3. **With Document Module**:
   - Verify travel documents complete
   - Flag missing documents

4. **With Transportation Module**:
   - Coordinate with bus vendors
   - Track vehicle assignments

5. **With Notification Module**:
   - Send meeting point reminders
   - No-show alerts

## Audit Trail Requirements
Every action must log:
- Group/subgroup creation and modifications
- Jamaah assignments and changes
- Attendance records with timestamp
- Baggage details
- No-show marking with reason
- All manual overrides