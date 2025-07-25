# MODULE: Manajemen Paket Umroh - Business Flow Documentation

## Overview
Modul ini mengelola paket-paket umroh dengan sistem yang fleksibel untuk nama dan konfigurasi paket. Mendukung manajemen kuota otomatis, variasi harga, tracking perubahan jadwal, dan mekanisme duplikasi paket untuk efisiensi.

## Actors & Roles
### Primary Actors:
- **Admin**: Create, edit, duplicate paket
- **Marketing**: View & promote paket published
- **Finance**: Adjust harga khusus per jamaah
- **Operations**: Update jadwal & fasilitas

### System Actor:
- **System**: Auto-update status based on quota & date

## Data Flow Diagram

### 1. Package Creation Flow
```
Create New Package → Set Details → Save as DRAFT → Review → PUBLISH
        ↑                                              ↓
        └─────── Duplicate from Existing ←─────────────┘
```

### 2. Status Transition Flow
```
DRAFT → PUBLISHED → FULL → PUBLISHED → FULL → ... → CLOSED
                     ↓         ↑                        ↑
                     └─────────┘                        │
                  (Auto on quota changes)        (On departure date)
```

### 3. Quota Management Flow
```
Available Quota → Jamaah Pays DP → Reduce Quota → Check if Full
                                          ↓
                  Jamaah Cancels ← Return Quota ← Update Status
```

## Validation & Error Handling

### Package Validation Rules:
1. **Basic Info**:
   - Package name: Free text (Hemat, Flash Sale, Diamond, etc.)
   - Departure date must be future date
   - Return date must be after departure date
   - Duration auto-calculated from dates

2. **Quota Management**:
   - Max quota must be > 0
   - Available quota ≤ Max quota
   - Cannot modify quota if status is CLOSED

3. **Pricing**:
   - Base price required
   - Special prices tracked as notes
   - Additional costs as free text list

### Status Rules:
| Status | Description | Trigger |
|--------|-------------|---------|
| DRAFT | Package in planning | Initial creation |
| PUBLISHED | Open for registration | Manual publish |
| FULL | Quota exhausted | Auto when available quota = 0 |
| CLOSED | Package departed | Auto when current date ≥ departure date |

### Automatic Status Changes:
- PUBLISHED → FULL: When available quota reaches 0
- FULL → PUBLISHED: When cancellation returns quota
- Any → CLOSED: When departure date is reached

## Business Rules

### Package Types & Flexibility:
- No fixed categories, fully customizable names
- Examples: Hemat, Flash Sale, Diamond, Exclusive, Ramadhan Special
- Each package can have unique combination of:
  - Hotel stars & location
  - Airlines & routes
  - Duration (9, 12, 15 days)
  - Additional facilities

### Pricing Structure:
1. **Base Price**: Standard package price
2. **Special Discounts**:
   - Infant pricing (based on airline/hotel discount)
   - Friends & family discount
   - Early bird pricing
   - Group discounts
3. **Additional Costs**:
   - Room upgrade
   - Extra baggage
   - Special services

**Note**: All special pricing recorded as free text notes, final amount calculated manually by Finance team

### Quota Rules:
- Quota decreases on DP payment (not on registration)
- Quota returns automatically on cancellation
- Waiting list not automated (handled manually)
- Overbooking not allowed by system

### Package Changes & Notifications:
1. **Change Tracking**:
   - All edits must include reason
   - Reasons: Airline schedule, Government regulation, Force majeure, etc.
   - Change history maintained

2. **Notification Process**:
   - System generates WhatsApp links (wa.me/62xxxx)
   - Manual notification by team
   - Bulk notification support (open multiple WA tabs)

### Package Duplication:
- Clone all package details except:
  - Dates (must be updated)
  - Status (reset to DRAFT)
  - Quota usage (reset to 0)
- Speeds up creation of recurring packages

## API Contracts

### GET /api/packages
**Query Parameters:**
- `status`: Filter by status
- `year`: Filter by departure year
- `month`: Filter by departure month
- `search`: Search by package name

**Response:**
```json
{
  "data": [{
    "id": 1,
    "name": "Ramadhan Flash Sale 2025",
    "departure_date": "2025-03-15",
    "return_date": "2025-03-27",
    "duration_days": 12,
    "airline": "Garuda Indonesia",
    "route": "CGK-JED / MED-CGK",
    "makkah_hotel": "Hilton Makkah",
    "madinah_hotel": "Movenpick Madinah",
    "base_price": 35000000,
    "max_quota": 45,
    "available_quota": 12,
    "status": "published",
    "special_notes": [
      "Infant price: Rp 5,000,000",
      "Early bird discount: 5% until Jan 31",
      "Friends/family: Special rate available"
    ],
    "additional_costs": [
      "Room upgrade to suite: Rp 5,000,000",
      "Extra baggage 10kg: Rp 500,000",
      "Wheelchair service: Free"
    ],
    "change_history": [{
      "date": "2025-01-15",
      "reason": "Airline schedule change",
      "details": "Departure time changed from 09:00 to 14:00",
      "changed_by": "admin"
    }]
  }],
  "pagination": {...}
}
```

### POST /api/packages
**Request Body:**
```json
{
  "name": "Umroh Hemat Maret 2025",
  "departure_date": "2025-03-01",
  "return_date": "2025-03-10",
  "duration_days": 9,
  "airline": "Saudia",
  "route": "CGK-JED / JED-CGK",
  "makkah_hotel": "Anjum Hotel",
  "madinah_hotel": "Saja Hotel",
  "base_price": 25000000,
  "max_quota": 100,
  "facilities": "Hotel *4, Bus AC, Makan 3x",
  "special_notes": [],
  "additional_costs": []
}
```

### POST /api/packages/{id}/duplicate
**Response:**
```json
{
  "id": 15,
  "name": "Umroh Hemat Maret 2025 (Copy)",
  "status": "draft",
  "message": "Package duplicated successfully. Please update dates."
}
```

### PUT /api/packages/{id}
**Request Body:**
```json
{
  "departure_date": "2025-03-20",
  "change_reason": "Airline schedule change",
  "change_details": "Garuda moved flight to next week"
}
```

### GET /api/packages/{id}/jamaah-contacts
**Response:**
```json
{
  "package_name": "Ramadhan Flash Sale 2025",
  "jamaah_list": [{
    "id": 1,
    "name": "Hajah Fatimah",
    "phone": "081234567890",
    "whatsapp_link": "https://wa.me/6281234567890",
    "payment_status": "paid"
  }]
}
```

## Edge Cases Handled

1. **Quota Edge Cases**:
   - Multiple simultaneous DP payments near full capacity
   - System locks quota during payment processing
   - Race condition handled with transactions

2. **Date Changes**:
   - Cannot change to past dates
   - If departure date changed to today, status → CLOSED
   - Return date must always be after departure

3. **Pricing Conflicts**:
   - Multiple special prices for same jamaah
   - Finance team has final say via manual adjustment
   - All price history tracked

4. **Status Conflicts**:
   - Cannot publish package with past dates
   - Cannot edit CLOSED packages except for notes
   - Full packages can still be edited (except quota)

5. **Duplicate Package Issues**:
   - Duplicate names allowed but warned
   - Old package references not copied
   - Jamaah registrations never copied

6. **Notification Failures**:
   - WhatsApp link might be invalid (number changed)
   - System shows last successful contact date
   - Alternative contact methods available

## Integration Points

1. **With Jamaah Module**:
   - Validate no date overlap for multi-package registration
   - Update jamaah status based on package dates

2. **With Payment Module**:
   - Trigger quota reduction on DP
   - Return quota on payment cancellation

3. **With Notification Module**:
   - Generate WhatsApp links
   - Track notification history

4. **With Reporting Module**:
   - Package performance reports
   - Quota utilization analytics