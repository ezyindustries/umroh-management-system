# MODULE: Manajemen Penerbangan - Business Flow Documentation

## Overview
Modul ini mengelola data penerbangan berbasis PNR sebagai core identifier untuk paket umroh. Sistem fokus pada tracking PNR, passenger allocation, dan monitoring status keberangkatan dengan fleksibilitas input manual untuk semua detail penerbangan termasuk multi-segment dan transit.

## Actors & Roles
### Primary Actors:
- **Admin/Operations**: Input flight details, manage PNR
- **Ticketing Officer**: Allocate jamaah to PNR
- **Ground Handling**: Export manifest for check-in
- **Marketing**: Monitor seat availability

### System Actor:
- **System**: Track PNR capacity, calculate days to departure

## Data Flow Diagram

### 1. PNR Creation Flow
```
Create Package → Input PNR → Set Capacity → Input Flight Details
                                   ↓
                           Available for Jamaah Assignment
```

### 2. Jamaah Allocation Flow
```
Select PNR → Check Available Seats → Assign Jamaah → Update Count
                                           ↓
                                   Monitor Fill Rate
```

### 3. Flight Change Flow
```
Receive Change Notice → Update Flight Info → Log Changes → Manual Notify
                                    ↓
                            Update Dashboard Display
```

## Validation & Error Handling

### PNR Management Rules:
1. **Core Principle**:
   - 1 PNR = 1 Package = 1 Departure
   - PNR is unique identifier
   - Package created based on PNR

2. **Capacity Tracking**:
   - Total PAX per PNR
   - Filled PAX count
   - Remaining seats
   - No overbooking allowed

3. **Flight Information**:
   - Free text input for flexibility
   - Handles multi-segment
   - Handles transit info

## Business Rules

### PNR Structure:
1. **PNR Attributes**:
   - PNR code (unique)
   - Total capacity (PAX)
   - Associated package
   - Flight details (free form)
   - Departure date/time
   - Route (origin-destination)

2. **Flight Details Format** (Manual Input):
   ```
   Example format:
   GA 123 | 15 MAR | CGK-JED | 09:00-14:00
   GA 456 | 15 MAR | JED-MED | 16:00-17:00
   [Transit 2 hours in Jeddah]
   ```

3. **Capacity Management**:
   - Set total PAX on creation
   - Auto-calculate filled/remaining
   - Alert when nearly full
   - Block when full

### Jamaah Assignment:
1. **Assignment Rules**:
   - One jamaah → one PNR only
   - Check availability first
   - Update count immediately
   - Name as per passport

2. **Tracking Information**:
   - Jamaah name + passport name
   - Assignment date
   - Days to departure
   - Special notes (if any)

### Change Management:
1. **Allowed Changes**:
   - Flight schedule updates
   - Route modifications
   - Aircraft changes
   - All changes logged

2. **Change Documentation**:
   - Old value → New value
   - Change date/time
   - Changed by whom
   - Reason (free text)

### Manifest Export:
- Uses existing manifest export feature
- Includes all assigned jamaah
- Groups by PNR
- Formats for airline/ground handling

## API Contracts

### POST /api/flights/pnr
**Request Body:**
```json
{
  "pnr_code": "ABC123",
  "package_id": 1,
  "total_pax": 150,
  "flight_details": "GA 890 | 15 MAR | CGK-JED | 09:00-14:00 | Boeing 777\nGA 891 | 23 MAR | MED-CGK | 23:00-08:00+1",
  "departure_date": "2025-03-15",
  "departure_time": "09:00",
  "departure_city": "Jakarta (CGK)",
  "arrival_city": "Jeddah (JED)",
  "notes": "Direct flight, meal included"
}
```

### GET /api/flights/pnr/{pnr_code}
**Response:**
```json
{
  "pnr": {
    "code": "ABC123",
    "package": "Umroh Ramadhan 2025",
    "status": "active",
    "capacity": {
      "total": 150,
      "filled": 145,
      "remaining": 5,
      "percentage": 96.7
    },
    "flight_details": "GA 890 | 15 MAR | CGK-JED | 09:00-14:00",
    "departure": {
      "date": "2025-03-15",
      "time": "09:00",
      "city": "Jakarta (CGK)",
      "days_remaining": 45
    },
    "passengers": [
      {
        "jamaah_id": 1,
        "name": "Ahmad Yusuf",
        "passport_name": "AHMAD YUSUF",
        "assigned_date": "2025-01-20"
      }
    ]
  }
}
```

### POST /api/flights/pnr/{pnr_code}/assign
**Request Body:**
```json
{
  "jamaah_ids": [1, 2, 3],
  "notes": "Family group, request sit together"
}
```

**Response:**
```json
{
  "success": true,
  "assigned": 3,
  "remaining_seats": 2,
  "warnings": []
}
```

### PUT /api/flights/pnr/{pnr_code}
**Request Body:**
```json
{
  "flight_details": "GA 890 | 15 MAR | CGK-JED | 11:00-16:00 | Boeing 777 [UPDATED TIME]",
  "change_reason": "Schedule change by airline",
  "notification_sent": false
}
```

### DELETE /api/flights/pnr/{pnr_code}/passengers/{jamaah_id}
**Response:**
```json
{
  "success": true,
  "removed_passenger": "Ahmad Yusuf",
  "remaining_filled": 144,
  "new_available": 6
}
```

### GET /api/flights/dashboard
**Response:**
```json
{
  "upcoming_departures": [
    {
      "pnr": "ABC123",
      "package": "Umroh Ramadhan 2025",
      "departure_date": "2025-03-15",
      "days_remaining": 45,
      "fill_status": {
        "total": 150,
        "filled": 145,
        "percentage": 96.7,
        "status": "almost_full"
      }
    }
  ],
  "pnr_summary": {
    "total_active": 10,
    "departing_this_month": 3,
    "seats_available": 45,
    "seats_filled": 1455
  }
}
```

### GET /api/flights/pnr/{pnr_code}/changes
**Response:**
```json
{
  "changes": [
    {
      "id": 1,
      "change_date": "2025-02-01 14:30",
      "changed_by": "admin",
      "field": "flight_details",
      "old_value": "GA 890 | 15 MAR | CGK-JED | 09:00-14:00",
      "new_value": "GA 890 | 15 MAR | CGK-JED | 11:00-16:00",
      "reason": "Schedule change by airline"
    }
  ]
}
```

## Edge Cases Handled

1. **PNR Capacity Changes**:
   - Airline reduces seats
   - Need to reassign passengers
   - System prevents overbooking

2. **Name Mismatches**:
   - Passport name vs booking name
   - System stores both
   - Export uses passport name

3. **Flight Cancellations**:
   - PNR becomes invalid
   - Move passengers to new PNR
   - Track in change history

4. **Split PNR Scenarios**:
   - Large group split across PNRs
   - System tracks relationships
   - Manifest shows grouping

5. **Last-Minute Additions**:
   - Check seat availability
   - Quick assignment process
   - Update manifest export

6. **Multi-Segment Complexity**:
   - Different flight numbers
   - Transit information
   - Free text handles all cases

## Integration Points

1. **With Package Module**:
   - PNR creates package
   - Share departure info

2. **With Jamaah Module**:
   - Assign jamaah to PNR
   - Pull passport names

3. **With Manifest Export**:
   - Generate airline format
   - Include all PNR data

4. **With Ground Handling**:
   - Special requests noted
   - Coordinate services

5. **With Dashboard**:
   - Departure countdown
   - Fill rate monitoring

## Monitoring Features

### Key Metrics:
1. **PNR Fill Rate**:
   - Visual indicators
   - Alert thresholds
   - Trend analysis

2. **Departure Timeline**:
   - Days remaining
   - Critical deadlines
   - Action reminders

3. **Change Frequency**:
   - Track airline reliability
   - Pattern detection
   - Impact analysis

## Audit Trail Requirements
Every action must log:
- PNR creation and modifications
- Passenger assignments/removals
- Flight detail changes with reasons
- Capacity adjustments
- All manual inputs with timestamps
- Export/access history