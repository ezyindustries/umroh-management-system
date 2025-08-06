# API Endpoints Documentation

## Overview
RESTful API untuk Umroh Management System dengan authentication JWT dan response format yang konsisten.

## Base URL
```
Production: https://api.umroh-management.com/api
Development: http://localhost:3000/api
```

## Authentication
Semua endpoint memerlukan JWT token kecuali login:
```
Authorization: Bearer <token>
```

## Response Format
### Success Response
```json
{
    "success": true,
    "data": {},
    "message": "Operation successful",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Error description",
        "details": {}
    },
    "timestamp": "2024-01-15T10:30:00Z"
}
```

## API Endpoints

### Authentication

#### POST /auth/login
Login user dan mendapatkan token.

**Request Body:**
```json
{
    "username": "admin@umroh.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIs...",
        "user": {
            "id": 1,
            "name": "Admin User",
            "email": "admin@umroh.com",
            "role": "admin"
        },
        "expiresIn": "24h"
    }
}
```

#### POST /auth/refresh
Refresh JWT token.

**Headers:**
```
Authorization: Bearer <old-token>
```

**Response:**
```json
{
    "success": true,
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIs...",
        "expiresIn": "24h"
    }
}
```

#### POST /auth/logout
Logout dan invalidate token.

**Response:**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

### Dashboard

#### GET /dashboard/stats
Get dashboard statistics.

**Query Parameters:**
- `period`: string (today|week|month|year) - default: month

**Response:**
```json
{
    "success": true,
    "data": {
        "totalJamaah": 1250,
        "totalPackages": 15,
        "monthlyPayments": 450000000,
        "weeklyDepartures": 3,
        "stats": {
            "jamaahGrowth": "+12%",
            "paymentGrowth": "+8%",
            "popularPackage": "Umroh Ramadhan"
        }
    }
}
```

#### GET /dashboard/activities
Get recent activities.

**Query Parameters:**
- `limit`: number (default: 10)
- `offset`: number (default: 0)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "type": "jamaah_registration",
            "description": "Jamaah baru terdaftar: Ahmad Ibrahim",
            "user": "Admin",
            "timestamp": "2024-01-15T10:30:00Z",
            "metadata": {
                "jamaahId": 123,
                "packageId": 5
            }
        }
    ]
}
```

### Jamaah Management

#### GET /jamaah
Get jamaah list with pagination and filters.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `search`: string - Search by name, NIK, phone
- `package_id`: number - Filter by package
- `status`: string - Filter by status
- `sort`: string - Sort field (name|created_at|status)
- `order`: string - Sort order (asc|desc)

**Response:**
```json
{
    "success": true,
    "data": {
        "items": [
            {
                "id": 1,
                "nama_lengkap": "Ahmad Ibrahim",
                "nik": "3201234567890123",
                "no_telepon": "081234567890",
                "package": {
                    "id": 5,
                    "nama_paket": "Umroh Ramadhan"
                },
                "status_pembayaran": "lunas",
                "created_at": "2024-01-15T10:30:00Z"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 150,
            "totalPages": 15
        }
    }
}
```

#### GET /jamaah/:id
Get detailed jamaah information.

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "nama_lengkap": "Ahmad Ibrahim",
        "nik": "3201234567890123",
        "tanggal_lahir": "1985-05-15",
        "tempat_lahir": "Jakarta",
        "jenis_kelamin": "male",
        "no_telepon": "081234567890",
        "email": "ahmad@email.com",
        "alamat": "Jl. Sudirman No. 123",
        "provinsi": "DKI Jakarta",
        "kabupaten": "Jakarta Pusat",
        "kecamatan": "Tanah Abang",
        "kelurahan": "Bendungan Hilir",
        "status_pernikahan": "kawin",
        "pendidikan_terakhir": "s1",
        "pekerjaan": "Pegawai Swasta",
        "status_dalam_keluarga": "kepala_keluarga",
        "preferensi_kamar": "quad",
        "passport": {
            "nama_paspor": "AHMAD IBRAHIM",
            "no_paspor": "A1234567",
            "kota_penerbitan": "Jakarta",
            "tanggal_penerbitan": "2020-01-15",
            "tanggal_kadaluarsa": "2030-01-15"
        },
        "package": {
            "id": 5,
            "nama_paket": "Umroh Ramadhan",
            "harga": 25000000
        },
        "payment_status": {
            "total_bayar": 25000000,
            "sisa": 0,
            "status": "lunas"
        },
        "documents": [
            {
                "type": "ktp",
                "status": "verified"
            },
            {
                "type": "passport",
                "status": "verified"
            }
        ],
        "family_members": [
            {
                "id": 2,
                "nama_lengkap": "Fatimah",
                "relation": "istri"
            }
        ]
    }
}
```

#### POST /jamaah
Create new jamaah.

**Request Body:**
```json
{
    "nama_lengkap": "Ahmad Ibrahim",
    "nik": "3201234567890123",
    "tanggal_lahir": "19850515",
    "tempat_lahir": "Jakarta",
    "jenis_kelamin": "male",
    "no_telepon": "081234567890",
    "email": "ahmad@email.com",
    "alamat": "Jl. Sudirman No. 123",
    "package_id": 5,
    "status_dalam_keluarga": "kepala_keluarga",
    "preferensi_kamar": "quad"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "nama_lengkap": "Ahmad Ibrahim",
        "registration_number": "REG-2024-0001"
    },
    "message": "Jamaah berhasil didaftarkan"
}
```

#### PUT /jamaah/:id
Update jamaah data.

**Request Body:**
```json
{
    "email": "ahmad.new@email.com",
    "no_telepon": "081234567899"
}
```

#### DELETE /jamaah/:id
Soft delete jamaah.

**Response:**
```json
{
    "success": true,
    "message": "Jamaah berhasil dihapus"
}
```

#### POST /jamaah/import
Import jamaah from Excel.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Excel file

**Response:**
```json
{
    "success": true,
    "data": {
        "total": 100,
        "success": 95,
        "failed": 5,
        "errors": [
            {
                "row": 15,
                "error": "NIK sudah terdaftar",
                "data": {"nik": "3201234567890123"}
            }
        ]
    }
}
```

### Package Management

#### GET /packages
Get package list.

**Query Parameters:**
- `status`: string (active|inactive|full)
- `departure_from`: date
- `departure_to`: date

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "kode_paket": "PKG-2024-001",
            "nama_paket": "Umroh Ramadhan 2024",
            "harga": 25000000,
            "tanggal_keberangkatan": "2024-03-15",
            "tanggal_kembali": "2024-03-24",
            "durasi_hari": 9,
            "kuota": 45,
            "kuota_terpakai": 40,
            "status": "active",
            "hotel_makkah": "Swissotel Al Maqam",
            "hotel_madinah": "Ritz Carlton",
            "maskapai": "Garuda Indonesia"
        }
    ]
}
```

#### GET /packages/:id
Get package details.

#### POST /packages
Create new package.

**Request Body:**
```json
{
    "nama_paket": "Umroh Ramadhan 2024",
    "kode_paket": "PKG-2024-001",
    "harga": 25000000,
    "tanggal_keberangkatan": "2024-03-15",
    "tanggal_kembali": "2024-03-24",
    "kuota": 45,
    "hotel_makkah": "Swissotel Al Maqam",
    "bintang_makkah": 5,
    "malam_makkah": 4,
    "hotel_madinah": "Ritz Carlton",
    "bintang_madinah": 5,
    "malam_madinah": 4,
    "maskapai": "Garuda Indonesia",
    "fasilitas": {
        "transport": ["Bus AC", "Kereta Haramain"],
        "meals": ["3x Sehari", "Prasmanan"],
        "others": ["Visa", "Asuransi", "Perlengkapan"]
    }
}
```

#### PUT /packages/:id
Update package.

#### DELETE /packages/:id
Archive package.

### Payment Management

#### GET /payments
Get payment list.

**Query Parameters:**
- `jamaah_id`: number
- `package_id`: number
- `status`: string (pending|verified|cancelled)
- `date_from`: date
- `date_to`: date
- `method`: string

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "receipt_number": "RCP-2024-0001",
            "jamaah": {
                "id": 1,
                "nama_lengkap": "Ahmad Ibrahim"
            },
            "amount": 12500000,
            "payment_type": "dp",
            "payment_date": "2024-01-15",
            "payment_method": "transfer",
            "status": "verified",
            "verified_by": "Finance Admin",
            "verified_at": "2024-01-15T14:00:00Z"
        }
    ]
}
```

#### GET /payments/:id
Get payment details.

#### POST /payments
Create new payment.

**Request Body:**
```json
{
    "jamaah_id": 1,
    "payment_type": "dp",
    "amount": 12500000,
    "payment_date": "2024-01-15",
    "payment_method": "transfer",
    "bank_name": "BCA",
    "account_number": "1234567890",
    "reference_number": "TRF123456",
    "notes": "DP 50%"
}
```

#### PUT /payments/:id/verify
Verify payment.

**Request Body:**
```json
{
    "status": "verified",
    "verification_notes": "Sudah dicek dengan mutasi bank"
}
```

#### GET /payments/statistics
Get payment statistics.

**Query Parameters:**
- `period`: string (daily|weekly|monthly|yearly)
- `date_from`: date
- `date_to`: date

### Hotel Management

#### GET /hotels/bookings
Get hotel booking list.

**Query Parameters:**
- `city`: string (Makkah|Madinah)
- `status`: string
- `check_in_from`: date
- `check_in_to`: date

#### GET /hotels/bookings/:id
Get booking details.

#### POST /hotels/bookings
Create hotel booking.

**Request Body:**
```json
{
    "package_id": 1,
    "city": "Makkah",
    "hotel_name": "Swissotel Al Maqam",
    "star_rating": 5,
    "check_in_date": "2024-03-15",
    "check_out_date": "2024-03-19",
    "total_rooms": 12,
    "booking_provider": "Direct",
    "total_amount": 50000000
}
```

#### PUT /hotels/bookings/:id
Update booking.

#### POST /hotels/bookings/:id/confirm
Confirm booking.

**Request Body:**
```json
{
    "confirmation_number": "HTL123456",
    "confirmed_amount": 50000000
}
```

#### GET /hotels/rooms/:bookingId
Get room allocations.

#### POST /hotels/rooms/allocate
Allocate rooms to jamaah.

**Request Body:**
```json
{
    "booking_id": 1,
    "allocations": [
        {
            "room_number": "301",
            "jamaah_ids": [1, 2, 3, 4],
            "room_type": "quad"
        }
    ]
}
```

### Document Management

#### GET /documents
Get document list.

**Query Parameters:**
- `jamaah_id`: number
- `type`: string (ktp|passport|foto|vaksin|etc)
- `status`: string

#### POST /documents/upload
Upload document.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: 
  - file: Document file
  - jamaah_id: number
  - document_type: string

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "filename": "passport_ahmad.pdf",
        "url": "/storage/documents/passport_ahmad.pdf",
        "size": 1024000,
        "type": "passport"
    }
}
```

#### GET /documents/:id/download
Download document file.

#### DELETE /documents/:id
Delete document.

### Reports

#### GET /reports/jamaah
Generate jamaah report.

**Query Parameters:**
- `format`: string (pdf|excel)
- `package_id`: number
- `status`: string

#### GET /reports/financial
Generate financial report.

**Query Parameters:**
- `period`: string
- `date_from`: date
- `date_to`: date
- `format`: string

#### GET /reports/operational
Generate operational report.

**Query Parameters:**
- `type`: string (departure|arrival|hotel|flight)
- `date`: date
- `format`: string

### Group Management

#### GET /groups
Get group list.

#### GET /groups/:id
Get group details with member list.

#### POST /groups
Create new group.

**Request Body:**
```json
{
    "nama_grup": "Al-Barokah 1",
    "package_id": 1,
    "tanggal_keberangkatan": "2024-03-15",
    "leader_id": 1,
    "member_ids": [1, 2, 3, 4, 5]
}
```

#### PUT /groups/:id
Update group.

#### POST /groups/:id/members
Add members to group.

#### DELETE /groups/:id/members/:jamaahId
Remove member from group.

## Error Codes

| Code | Description |
|------|-------------|
| AUTH_FAILED | Authentication failed |
| TOKEN_EXPIRED | JWT token expired |
| TOKEN_INVALID | Invalid JWT token |
| UNAUTHORIZED | User not authorized |
| NOT_FOUND | Resource not found |
| VALIDATION_ERROR | Validation failed |
| DUPLICATE_ENTRY | Duplicate data |
| SERVER_ERROR | Internal server error |
| RATE_LIMIT | Too many requests |

## Rate Limiting

API implements rate limiting:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated endpoints

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642329600
```

## Pagination

Standard pagination parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination metadata:
```json
{
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 150,
        "totalPages": 15,
        "hasNext": true,
        "hasPrev": false
    }
}
```

## Filtering & Sorting

Most list endpoints support:
- Multiple filters via query parameters
- Sorting via `sort` and `order` parameters
- Full-text search via `search` parameter

## Webhooks

System can send webhooks for events:
- Payment received
- Document uploaded
- Status changed
- Departure reminder

Configure webhook URL in settings.