# MODULE: Ground Handling - Business Flow Documentation

## Overview
Modul ini mengelola koordinasi ground handling untuk keberangkatan dan kepulangan jamaah di bandara. Sistem fokus pada pencatatan informasi handling, special request, konfirmasi vendor, dan komunikasi antar tim melalui catatan text bebas dengan audit trail lengkap.

## Actors & Roles
### Primary Actors:
- **Admin Handling**: Input jadwal, update status, catat special request
- **Operations Team**: Monitor jadwal handling
- **Ground Staff**: Akses informasi di lapangan
- **Team Coordinator**: Baca catatan untuk koordinasi

### System Actor:
- **System**: Track schedule, log all activities

## Data Flow Diagram

### 1. Handling Schedule Creation Flow
```
PNR Data → Create Handling Schedule → Add Details → Save with Notes
                                           ↓
                                   Available for Team Access
```

### 2. Vendor Confirmation Flow
```
View Schedule → Contact Vendor → Update Confirmation Status → Add Notes
                                            ↓
                                    Log User & Timestamp
```

### 3. Special Request Flow
```
Identify Special Needs → Add to Handling Notes → Communicate to Vendor → Track in System
                                    ↓
                            Free Text Documentation
```

## Validation & Error Handling

### Handling Rules:
1. **Schedule Based on PNR**:
   - Auto-populate from flight data
   - Departure and arrival handling
   - Manual adjustment allowed

2. **Note System**:
   - No character limit
   - Support multi-line text
   - Always track author & time

3. **Update Flexibility**:
   - Any admin handling can update
   - All changes logged
   - Previous notes preserved

## Business Rules

### Handling Information:
1. **Core Data**:
   - Airport location
   - Date and time
   - Flight number
   - PAX count
   - Package name
   - Type (departure/arrival)

2. **Additional Details**:
   - Meeting point
   - Handler contact (in notes)
   - Special arrangements
   - Team communication

### Special Request Management:
1. **Common Requests** (via notes):
   - Wheelchair assistance
   - Porter service
   - Oxygen support
   - Elderly assistance
   - Medical equipment
   - Fast track service

2. **Documentation Format**:
   ```
   Example note:
   "5 wheelchair needed:
   - Hajah Fatimah (seat 12A)
   - Pak Ahmad (seat 15C)
   - 3 others from Surabaya group
   
   2 oxygen support:
   - Details with medical team
   
   Vendor confirmed by Pak Budi 081234567890"
   ```

### Vendor Coordination:
1. **Confirmation Process**:
   - Manual contact vendor
   - Update status in system
   - Add confirmation details
   - Include vendor contact

2. **Status Options**:
   - Scheduled
   - Vendor Contacted
   - Confirmed
   - Completed
   - Issues (with notes)

### Change Management:
1. **Flight Changes**:
   - Update schedule manually
   - Add reason in notes
   - Previous schedule visible in logs

2. **Last-Minute Requests**:
   - Add to existing notes
   - Alert vendor separately
   - Track who added request

### Team Communication:
- Notes serve as communication board
- All team members can read
- Only admin handling can write
- Real-time updates
- Mobile-friendly for field access

## API Contracts

### POST /api/ground-handling
**Request Body:**
```json
{
  "pnr_code": "ABC123",
  "package_id": 1,
  "handling_type": "departure",
  "airport": "Soekarno-Hatta (CGK)",
  "scheduled_date": "2025-03-15",
  "scheduled_time": "06:00",
  "flight_number": "GA 890",
  "pax_count": 150,
  "notes": "Meeting point: Terminal 3, Counter 1\nSpecial request: 5 wheelchair\nVendor: PT Ground Handle"
}
```

### GET /api/ground-handling
**Query Parameters:**
- `date_from`: Filter from date
- `date_to`: Filter to date
- `handling_type`: departure/arrival
- `status`: Filter by status

**Response:**
```json
{
  "schedules": [
    {
      "id": 1,
      "pnr_code": "ABC123",
      "package_name": "Umroh Ramadhan 2025",
      "handling_type": "departure",
      "airport": "CGK",
      "scheduled_datetime": "2025-03-15 06:00",
      "flight_number": "GA 890",
      "pax_count": 150,
      "status": "confirmed",
      "last_updated": "2025-03-01 10:30",
      "updated_by": "admin_handling",
      "notes": "Meeting point: Terminal 3...",
      "days_remaining": 14
    }
  ]
}
```

### PUT /api/ground-handling/{id}/notes
**Request Body:**
```json
{
  "notes": "UPDATE 2/3: Flight delayed to 08:00\nVendor notified via WA\nAll wheelchair arrangements confirmed\n\nPREVIOUS NOTES:\nMeeting point: Terminal 3, Counter 1\nSpecial request: 5 wheelchair",
  "status": "confirmed"
}
```

### GET /api/ground-handling/{id}/history
**Response:**
```json
{
  "history": [
    {
      "timestamp": "2025-03-01 10:30",
      "user": "admin_handling",
      "action": "status_change",
      "old_value": "scheduled",
      "new_value": "confirmed",
      "notes": "Vendor confirmed availability"
    },
    {
      "timestamp": "2025-03-02 15:45",
      "user": "admin_handling",
      "action": "notes_update",
      "notes_added": "Flight delayed to 08:00..."
    }
  ]
}
```

### POST /api/ground-handling/{id}/complete
**Request Body:**
```json
{
  "completion_notes": "Handling completed successfully\nAll special requests fulfilled\nNo issues reported",
  "actual_time": "2025-03-15 08:15"
}
```

### GET /api/ground-handling/dashboard
**Response:**
```json
{
  "upcoming_7_days": [
    {
      "date": "2025-03-15",
      "schedules": [
        {
          "time": "06:00",
          "type": "departure",
          "package": "Umroh Ramadhan",
          "pax": 150,
          "status": "confirmed",
          "has_special_requests": true
        },
        {
          "time": "23:00",
          "type": "arrival",
          "package": "Umroh Februari",
          "pax": 100,
          "status": "scheduled"
        }
      ]
    }
  ],
  "pending_confirmation": 3,
  "total_pax_this_week": 850
}
```

## Edge Cases Handled

1. **Simultaneous Updates**:
   - Multiple users viewing
   - Last update wins
   - Full history preserved
   - Clear timestamp/user tracking

2. **Extended/Early Returns**:
   - Rare but handled via notes
   - Special coordination needed
   - Extra documentation required

3. **Split Arrivals**:
   - Group arrives on different flights
   - Separate handling records
   - Cross-reference in notes

4. **Emergency Handling**:
   - Medical emergencies
   - Quick note updates
   - Contact info readily available

5. **Vendor Changes**:
   - Last-minute vendor swap
   - Document in notes
   - Maintain continuity

6. **Multi-Airport Handling**:
   - Transit passengers
   - Different airports noted
   - Coordination via notes

## Integration Points

1. **With Flight/PNR Module**:
   - Auto-populate flight data
   - Sync schedule changes

2. **With Package Module**:
   - Link to package info
   - Get passenger counts

3. **With Jamaah Module**:
   - Reference special needs
   - Not direct integration

4. **With Dashboard**:
   - Weekly overview
   - Status monitoring

5. **With Notification Module**:
   - Alert for pending tasks
   - Schedule reminders

## Communication Features

### Note System Best Practices:
1. **Structure**:
   - Date/time stamps in notes
   - Clear sections
   - Contact information
   - Status updates

2. **Updates**:
   - Append new info on top
   - Keep previous notes
   - Clear attribution

3. **Mobile Access**:
   - Read on phones
   - Quick status checks
   - Field team coordination

## Audit Trail Requirements
Every action must log:
- Schedule creation and modifications
- All note updates with full text
- Status changes with reasons
- User and timestamp for everything
- Completion records
- Access logs for sensitive handling