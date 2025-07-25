# MODULE: Manajemen Hotel - Business Flow Documentation

## Overview
Modul ini mengelola data hotel, sub paket hotel dengan harga berbeda dalam satu paket umroh, konfirmasi booking, dan rooming list. Sistem fokus pada fleksibilitas pengelolaan manual dengan dokumentasi bukti konfirmasi dan tracking perubahan hotel.

## Actors & Roles
### Primary Actors:
- **Admin/Marketing**: Negosiasi dan create sub paket hotel
- **Hotel Officer**: Upload konfirmasi, kelola rooming list
- **Operations**: Monitor status konfirmasi hotel
- **Finance**: Track harga per sub paket

### System Actor:
- **System**: Store hotel data, track confirmations

## Data Flow Diagram

### 1. Hotel Master Data Flow
```
Input Hotel Data → Save to Database → Available for Package Selection
                                              ↓
                                      Reusable across Packages
```

### 2. Sub Package Creation Flow
```
Jamaah Request → Marketing Negotiation → Create Sub Package → Set Hotel & Price
                                                    ↓
                                            Assign Jamaah to Sub Package
```

### 3. Hotel Confirmation Flow
```
Generate Rooming List → Send to Hotel → Receive Confirmation → Upload Proof
                                                    ↓
                                            Update Status to Confirmed
```

## Validation & Error Handling

### Hotel Data Rules:
1. **Master Data**:
   - Hotel can be reused across packages
   - No duplicate validation needed
   - Can edit anytime (affects future use only)

2. **Sub Package Rules**:
   - Multiple sub packages per main package
   - Same schedule, different hotels/prices
   - Manual quota management

3. **Confirmation Rules**:
   - Any format accepted (image, PDF)
   - No automated validation
   - Manual verification by team

## Business Rules

### Hotel Management:
1. **Hotel Master Data**:
   - Name, location (Makkah/Madinah)
   - Star rating (optional)
   - Address (optional)
   - Notes/description

2. **Sub Package Structure**:
   - Main package: Fixed schedule (nights in each city)
   - Sub packages: Different hotel options
   - Example:
     - Sub A: Hotel Bintang 3 - 25jt
     - Sub B: Hotel Bintang 4 - 30jt
     - Sub C: Hotel Bintang 5 - 35jt

3. **Assignment Process**:
   - Jamaah negotiates with marketing
   - Admin creates/assigns sub package
   - Price difference tracked
   - Manual quota control

### Rooming List Generation:
1. **Standard Information**:
   - Guest name (as per passport)
   - Room type (based on upgrade)
   - Check-in/out dates
   - Special requests (if any)

2. **Export Format**:
   - Simple Excel format
   - Grouped by room type
   - Include package/sub package info

### Confirmation Management:
1. **Confirmation Upload**:
   - Upload proof (image/PDF)
   - Add confirmation notes
   - Mark status as confirmed
   - No specific format required

2. **Change Handling**:
   - Direct edit hotel information
   - Add change notification (free text)
   - Timing affects communication:
     - Early change: Simple notification
     - Late change: Detailed explanation
   - Manual WhatsApp to affected jamaah

## API Contracts

### POST /api/hotels
**Request Body:**
```json
{
  "name": "Hilton Makkah Convention",
  "city": "Makkah",
  "star_rating": 5,
  "address": "King Abdul Aziz Road",
  "distance_to_haram": "500m",
  "notes": "Connected to mall, good breakfast"
}
```

### GET /api/hotels
**Response:**
```json
{
  "hotels": [
    {
      "id": 1,
      "name": "Hilton Makkah Convention",
      "city": "Makkah",
      "star_rating": 5,
      "usage_count": 15,
      "last_used": "2025-01-15"
    }
  ]
}
```

### POST /api/packages/{package_id}/sub-packages
**Request Body:**
```json
{
  "name": "Paket Premium - Hotel Bintang 5",
  "price": 35000000,
  "hotels": [
    {
      "city": "Makkah",
      "hotel_id": 1,
      "nights": 4
    },
    {
      "city": "Madinah", 
      "hotel_id": 5,
      "nights": 4
    }
  ],
  "notes": "Upgrade hotel bintang 5 both cities"
}
```

### PUT /api/jamaah/{jamaah_id}/sub-package
**Request Body:**
```json
{
  "sub_package_id": 3,
  "negotiated_by": "marketing_user_id",
  "notes": "Upgrade request after family discussion"
}
```

### GET /api/packages/{package_id}/rooming-list
**Query Parameters:**
- `sub_package_id`: Filter by sub package
- `hotel_id`: Filter by specific hotel

**Response:**
```json
{
  "package": "Umroh Ramadhan 2025",
  "total_jamaah": 100,
  "by_hotel": [
    {
      "hotel": "Hilton Makkah",
      "city": "Makkah",
      "check_in": "2025-03-15",
      "check_out": "2025-03-19",
      "rooms_summary": {
        "quad": 20,
        "triple": 5,
        "double": 10
      },
      "jamaah_list": [
        {
          "room_type": "double",
          "jamaah": [
            {
              "name": "Ahmad Yusuf",
              "passport": "A1234567"
            },
            {
              "name": "Fatimah Ahmad",
              "passport": "B2345678"
            }
          ]
        }
      ]
    }
  ]
}
```

### POST /api/hotels/{hotel_id}/confirmations
**Request (multipart/form-data):**
```
package_id: 1
sub_package_id: 2
confirmation_type: booking
file: [binary]
notes: "Confirmed 25 rooms for March 15-19"
confirmation_number: "HTL-2025-0315"
```

### GET /api/packages/{package_id}/hotel-status
**Response:**
```json
{
  "confirmations": [
    {
      "sub_package": "Paket Premium",
      "hotel": "Hilton Makkah",
      "status": "confirmed",
      "confirmation_date": "2025-01-20",
      "confirmed_by": "hotel_officer",
      "proof_url": "/api/files/confirmation_123.pdf",
      "notes": "All rooms confirmed"
    },
    {
      "sub_package": "Paket Hemat",
      "hotel": "Ibis Madinah",
      "status": "pending",
      "last_update": "2025-01-19"
    }
  ]
}
```

### PUT /api/hotels/{hotel_id}
**Request Body:**
```json
{
  "name": "Pullman Zamzam Makkah",
  "change_notes": "Hotel berganti nama dari Hilton ke Pullman, fasilitas sama"
}
```

### POST /api/packages/{package_id}/hotel-changes
**Request Body:**
```json
{
  "affected_sub_packages": [1, 2],
  "old_hotel_id": 1,
  "new_hotel_id": 8,
  "change_reason": "Hotel overbooked, moved to similar category",
  "change_date": "2025-02-01",
  "notification_text": "Mohon maaf, ada perubahan hotel di Makkah dari Hilton ke Pullman karena overbook. Hotel tetap bintang 5 dengan fasilitas setara."
}
```

## Edge Cases Handled

1. **Last-Minute Hotel Changes**:
   - System allows quick edit
   - Free text for explanation
   - Manual notification process
   - History tracked in logs

2. **Multiple Sub Packages**:
   - Jamaah may request custom combination
   - System supports unlimited sub packages
   - Price can be manually adjusted

3. **Split Hotel Stays**:
   - Different hotels in same city
   - E.g., 2 nights Hotel A, 2 nights Hotel B
   - Manual tracking needed

4. **Confirmation Delays**:
   - Pending status clearly shown
   - Multiple follow-ups tracked
   - Partial confirmations handled

5. **Room Type Mismatches**:
   - Requested vs confirmed differences
   - Manual resolution required
   - Notes field for explanations

6. **Hotel Fully Booked**:
   - Quick switch to alternate hotel
   - Bulk reassignment capability
   - Communication template provided

## Integration Points

1. **With Package Module**:
   - Sub packages linked to main package
   - Share schedule information

2. **With Jamaah Module**:
   - Assign jamaah to sub packages
   - Track individual choices

3. **With Payment Module**:
   - Different prices per sub package
   - Track payment status

4. **With Room Assignment**:
   - Generate rooming based on selection
   - Consider family groups

5. **With Document Module**:
   - Store confirmation proofs
   - Link to package documentation

## Reporting Features

### Available Reports:
1. **Hotel Utilization**:
   - Which hotels used most
   - Seasonal patterns
   - Cost analysis

2. **Confirmation Status**:
   - Pending confirmations
   - Days to departure alerts
   - Missing confirmations

3. **Rooming Summary**:
   - Room type distribution
   - Occupancy rates
   - Special requests

## Audit Trail Requirements
Every action must log:
- Hotel data changes
- Sub package creation/modification
- Jamaah assignments to sub packages
- Confirmation uploads
- Hotel change notifications
- All manual adjustments with reasons