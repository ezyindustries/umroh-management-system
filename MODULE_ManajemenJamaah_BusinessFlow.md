# MODULE: Manajemen Jamaah - Business Flow Documentation

## Overview
Modul ini mengelola data lengkap jamaah umroh dari pendaftaran hingga kepulangan, termasuk data personal, dokumen, status pembayaran, kondisi kesehatan, dan kebutuhan khusus. Mendukung pendaftaran multi-paket dengan validasi jadwal.

## Actors & Roles
### Primary Actors:
- **Admin/Operator**: Input, verifikasi, dan update data jamaah
- **Marketing**: View data untuk follow up
- **Hotel**: View data untuk arrangement kamar
- **Ground Handling**: View data untuk special handling
- **Finance**: View data untuk tracking pembayaran

### System Actor:
- **System**: Auto-update status completed berdasarkan tanggal

## Data Flow Diagram

### 1. Registration Flow
```
Input Data → Validasi NIK/Paspor → Cek Duplikasi → Save Data (Status: Pending)
                                         ↓ (if exists)
                                   Cek Status Cancelled → Reactivate
```

### 2. Status Transition Flow
```
PENDING → (Manual Verification Dokumen) → ACTIVE → (Auto by Date) → COMPLETED
    ↓                                         ↓
    └────────────→ CANCELLED ←────────────────┘
          (Pembatalan + Refund)
```

### 3. Multi-Package Registration
```
Select Package → Check Date Overlap → Register to Package
                        ↓ (if overlap)
                    Show Error Message
```

## Validation & Error Handling

### Data Validation Rules:
1. **NIK (WNI)**:
   - Must be 16 digits
   - Unique in system
   - Cannot be changed after registration

2. **Passport (WNA)**:
   - Used as primary key for non-WNI
   - Must be unique
   - Expiry date must be > 6 months from departure

3. **Phone Number**:
   - Indonesian format validation
   - Primary search key (along with name)
   - Can have multiple numbers

4. **Age Category** (Auto-calculated from birth date):
   - Infant: 0-2 years
   - Child: 2-11 years  
   - Adult: 12-59 years
   - Senior: 60+ years

### Package Registration Rules:
- One jamaah can register to multiple packages
- Package dates must not overlap (departure date of package A must be after return date of package B)
- No buffer time required between packages

### Status Rules:
| Status | Description | Trigger |
|--------|-------------|---------|
| PENDING | Data incomplete, documents not verified | Initial registration |
| ACTIVE | Documents verified, payment complete | Manual by admin after verification |
| CANCELLED | Jamaah cancelled after payment | Manual by admin/finance |
| COMPLETED | Jamaah has returned | Auto by system when current date > return date |

## Business Rules

### Identity Management:
- **WNI**: NIK as primary identifier
- **WNA**: Passport number as primary identifier
- Cancelled jamaah data retained for reactivation
- No hard delete, only soft delete with history

### Search Priority:
1. Phone number (most used)
2. Name (second most used)
3. NIK/Passport

### Special Flags & Markers:
1. **Age Category Flag**: Auto-generated from birth date
2. **Medical Condition Flag**: Critical conditions requiring extra attention
3. **Special Needs**: Free text field for wheelchair, special diet, etc.
4. **Additional Requests**: Free text field for room preferences, etc.

### Document Requirements:
- KTP/Passport (mandatory)
- Passport with 6+ months validity (mandatory for umroh)
- Photo 4x6 (mandatory)
- Birth certificate (for infant/child)
- Health certificate (for senior/special conditions)
- Vaccination records (mandatory)

### Data Access by Role:
| Role | Can View | Can Edit | Special Access |
|------|----------|----------|----------------|
| Admin | All jamaah data | All fields | Status changes |
| Marketing | Basic + contact info | None | Pipeline status |
| Hotel | Basic + special needs | None | Room requirements |
| Ground Handling | Basic + medical info | None | Special handling needs |
| Finance | Basic + payment status | Payment fields | Financial data |

## API Contracts

### GET /api/jamaah
**Query Parameters:**
- `search`: Search by name or phone
- `nik`: Search by NIK
- `status`: Filter by status
- `package_id`: Filter by package
- `age_category`: Filter by age group
- `has_special_needs`: Boolean flag

**Response:**
```json
{
  "data": [{
    "id": 1,
    "nik": "3301234567890123",
    "name": "Hajah Fatimah",
    "phone": "081234567890",
    "birth_date": "1960-01-01",
    "age_category": "senior",
    "status": "active",
    "packages": [
      {"id": 1, "name": "Umroh Maret 2025"},
      {"id": 3, "name": "Umroh Ramadhan 2025"}
    ],
    "medical_flag": true,
    "medical_conditions": "Diabetes, requires insulin",
    "special_needs": "Wheelchair assistance required",
    "additional_requests": "Room near elevator please"
  }],
  "pagination": {...}
}
```

### POST /api/jamaah
**Request Body:**
```json
{
  "nik": "3301234567890123",
  "passport_number": null,
  "name": "Hajah Fatimah",
  "birth_place": "Jakarta",
  "birth_date": "1960-01-01",
  "gender": "female",
  "address": "Jl. Merdeka No. 1",
  "phone": "081234567890",
  "phone_secondary": "081234567891",
  "emergency_contact": "Anak - Budi",
  "emergency_phone": "081234567892",
  "medical_conditions": "Diabetes, requires insulin",
  "special_needs": "Wheelchair assistance required",
  "additional_requests": "Room near elevator please",
  "package_ids": [1, 3]
}
```

### PUT /api/jamaah/{id}/status
**Request Body:**
```json
{
  "status": "active",
  "notes": "All documents verified"
}
```

### POST /api/jamaah/check-overlap
**Request Body:**
```json
{
  "jamaah_id": 1,
  "package_id": 5
}
```
**Response:**
```json
{
  "can_register": false,
  "reason": "Date overlap with Umroh Ramadhan 2025 (2025-03-15 to 2025-03-30)"
}
```

## Edge Cases Handled

1. **Duplicate Registration**: 
   - System checks NIK/Passport uniqueness
   - For cancelled jamaah, offer reactivation

2. **Package Date Overlap**:
   - Validation prevents registration to overlapping packages
   - Clear error message showing conflicting package

3. **Age Category Changes**:
   - Infant becomes child during waiting period
   - System auto-updates category based on departure date

4. **Document Expiry**:
   - Passport expires before departure
   - System alerts admin 3 months before expiry

5. **Multiple Phone Numbers**:
   - Primary and secondary phone numbers
   - Search works on both numbers

6. **WNI/WNA Handling**:
   - Toggle between NIK/Passport as primary key
   - Different document requirements

7. **Special Handling Cascade**:
   - Medical flag visible to all permitted roles
   - Automatic notification to relevant departments

## Audit Trail Requirements
Every change must log:
- Changed fields (before/after values)
- User who made the change
- Timestamp
- Reason for status changes
- IP address and device info