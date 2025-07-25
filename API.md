# Umroh Management System API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.umroh.com/api`

## Authentication
All API endpoints except login require JWT authentication.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### POST /api/auth/login
Login to the system

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Administrator",
    "role": "admin"
  }
}
```

#### POST /api/auth/logout
Logout from the system

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me
Get current user information

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "name": "Administrator",
  "email": "admin@umroh.com",
  "role": "admin"
}
```

### Jamaah Management

#### GET /api/jamaah
Get list of all jamaah with pagination

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10)
- `search` (string): Search by name, NIK, or passport
- `package_id` (integer): Filter by package
- `status` (string): Filter by status (active, deleted)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "nik": "3175012101700001",
      "name": "Ahmad Fauzi",
      "birth_place": "Jakarta",
      "birth_date": "1970-01-21",
      "gender": "male",
      "phone": "081234567890",
      "passport_number": "A1234567",
      "package_name": "Ramadhan Plus",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 150,
    "totalPages": 15
  }
}
```

#### GET /api/jamaah/:id
Get single jamaah details

**Response:**
```json
{
  "id": 1,
  "nik": "3175012101700001",
  "name": "Ahmad Fauzi",
  "birth_place": "Jakarta",
  "birth_date": "1970-01-21",
  "gender": "male",
  "address": "Jl. Merdeka No. 123",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "phone": "081234567890",
  "email": "ahmad@email.com",
  "passport_number": "A1234567",
  "passport_issued_date": "2020-01-15",
  "passport_expired_date": "2025-01-15",
  "package_id": 1,
  "package_name": "Ramadhan Plus",
  "documents": [],
  "family_relations": []
}
```

#### POST /api/jamaah
Create new jamaah

**Request Body:**
```json
{
  "nik": "3175012101700001",
  "name": "Ahmad Fauzi",
  "birth_place": "Jakarta",
  "birth_date": "1970-01-21",
  "gender": "male",
  "address": "Jl. Merdeka No. 123",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "postal_code": "12345",
  "phone": "081234567890",
  "email": "ahmad@email.com",
  "passport_number": "A1234567",
  "passport_issued_date": "2020-01-15",
  "passport_expired_date": "2025-01-15",
  "marital_status": "married",
  "education": "S1",
  "occupation": "Wiraswasta",
  "emergency_contact": "Siti Fatimah",
  "emergency_phone": "081234567891",
  "package_id": 1,
  "notes": ""
}
```

#### PUT /api/jamaah/:id
Update jamaah data

**Request Body:** Same as create, but all fields are optional

#### DELETE /api/jamaah/:id
Soft delete jamaah

**Response:**
```json
{
  "message": "Jamaah deleted successfully"
}
```

#### POST /api/jamaah/import
Import jamaah from Excel

**Request Body:**
```json
{
  "data": [
    {
      "nik": "3175012101700001",
      "name": "Ahmad Fauzi",
      "birth_place": "Jakarta",
      "birth_date": "1970-01-21",
      "gender": "male",
      "phone": "081234567890",
      "package_id": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": 45,
  "failed": 5,
  "errors": [
    {
      "row": 3,
      "error": "NIK already registered",
      "data": {...}
    }
  ]
}
```

### Package Management

#### GET /api/packages
Get all packages

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `type` (string): Filter by type (regular, plus, vip, exclusive)
- `status` (string): Filter by status (draft, published, full, closed)
- `year` (integer): Filter by departure year
- `month` (integer): Filter by departure month

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Ramadhan Plus 2025",
      "type": "plus",
      "departure_date": "2025-03-15",
      "return_date": "2025-03-30",
      "duration_days": 15,
      "airline": "Garuda Indonesia",
      "price": 35000000,
      "max_quota": 100,
      "available_quota": 45,
      "registered_jamaah": 55,
      "occupancy_rate": 55.00,
      "status": "published"
    }
  ],
  "pagination": {...}
}
```

#### GET /api/packages/available
Get available packages for registration

#### GET /api/packages/:id
Get single package with jamaah list

#### POST /api/packages
Create new package

**Request Body:**
```json
{
  "name": "Ramadhan Plus 2025",
  "type": "plus",
  "departure_date": "2025-03-15",
  "return_date": "2025-03-30",
  "duration_days": 15,
  "airline": "Garuda Indonesia",
  "flight_route": "CGK-JED / MED-CGK",
  "makkah_hotel": "Hilton Makkah",
  "madinah_hotel": "Movenpick Madinah",
  "price": 35000000,
  "max_quota": 100,
  "facilities": "Hotel bintang 5, bus AC, makan 3x sehari",
  "notes": "",
  "status": "draft"
}
```

#### PUT /api/packages/:id
Update package

#### PUT /api/packages/:id/status
Update package status only

**Request Body:**
```json
{
  "status": "published"
}
```

#### DELETE /api/packages/:id
Delete package (only if no jamaah registered)

### Payment Management

#### GET /api/payments
Get all payments

**Query Parameters:**
- `page`, `limit`: Pagination
- `jamaah_id`: Filter by jamaah
- `package_id`: Filter by package
- `payment_type`: Filter by type (dp, installment, full, refund)
- `status`: Filter by status (pending, verified, cancelled)
- `date_from`, `date_to`: Date range filter

#### GET /api/payments/summary/:jamaah_id
Get payment summary for jamaah

**Response:**
```json
{
  "summary": {
    "id": 1,
    "name": "Ahmad Fauzi",
    "package_price": 35000000,
    "total_paid": 15000000,
    "pending_amount": 5000000,
    "remaining_amount": 15000000,
    "payment_status": "partial"
  },
  "history": [
    {
      "id": 1,
      "payment_type": "dp",
      "amount": 10000000,
      "payment_date": "2024-01-15",
      "payment_method": "transfer",
      "status": "verified"
    }
  ]
}
```

#### POST /api/payments
Create new payment

**Request Body:**
```json
{
  "jamaah_id": 1,
  "package_id": 1,
  "payment_type": "dp",
  "amount": 10000000,
  "payment_method": "transfer",
  "payment_date": "2024-01-15",
  "reference_number": "TRF123456",
  "bank_name": "BCA",
  "account_number": "1234567890",
  "notes": ""
}
```

#### PUT /api/payments/:id/verify
Verify payment

#### PUT /api/payments/:id/cancel
Cancel payment

**Request Body:**
```json
{
  "reason": "Wrong transfer amount"
}
```

#### GET /api/payments/report
Get payment reports

**Query Parameters:**
- `report_type`: daily, by_package, by_method
- `date_from`, `date_to`: Date range
- `package_id`: Filter by package

### Document Management

#### GET /api/documents/jamaah/:jamaah_id
Get all documents for a jamaah

#### GET /api/documents/:id
Get document details

#### GET /api/documents/:id/download
Download document file

#### POST /api/documents/upload/:jamaah_id
Upload new document

**Form Data:**
- `document` (file): The file to upload
- `document_type` (string): ktp, passport, kk, foto, visa, medical, other
- `document_name` (string): Document name
- `description` (string): Description
- `expiry_date` (date): Expiry date (optional)

#### PUT /api/documents/:id
Update document metadata

#### DELETE /api/documents/:id
Delete document

#### GET /api/documents/stats/summary
Get document statistics

#### GET /api/documents/expiring
Get expiring documents

**Query Parameters:**
- `days` (integer): Days until expiry (default: 30)

### Reports

#### GET /api/reports/dashboard
Get dashboard statistics

**Response:**
```json
{
  "jamaah": {
    "total_jamaah": 1285,
    "active_jamaah": 1200,
    "new_jamaah_30_days": 85,
    "new_jamaah_7_days": 12
  },
  "packages": {
    "total_packages": 24,
    "active_packages": 18,
    "upcoming_packages": 15,
    "departing_soon": 3
  },
  "payments": {
    "total_transactions": 3420,
    "verified_amount": 45000000000,
    "pending_amount": 5000000000,
    "transactions_30_days": 220
  },
  "monthly_revenue": [...],
  "top_packages": [...]
}
```

#### GET /api/reports/jamaah
Get jamaah report

**Query Parameters:**
- `package_id`: Filter by package
- `status`: Filter by status
- `city`: Filter by city
- `date_from`, `date_to`: Registration date range
- `format`: json, excel, pdf

#### GET /api/reports/financial-summary
Get financial summary report

**Query Parameters:**
- `year`: Filter by year
- `month`: Filter by month

#### GET /api/reports/package-occupancy
Get package occupancy report

#### GET /api/reports/activity-log
Get user activity log

**Query Parameters:**
- `user_id`: Filter by user
- `action`: Filter by action type
- `entity_type`: Filter by entity
- `date_from`, `date_to`: Date range
- `limit`: Maximum results (default: 100)

### User Management

#### GET /api/users
Get all users (Admin only)

**Query Parameters:**
- `page`, `limit`: Pagination
- `role`: Filter by role
- `is_active`: Filter by active status
- `search`: Search by name, username, email

#### GET /api/users/me
Get current user info

#### GET /api/users/:id
Get user details

#### POST /api/users
Create new user (Admin only)

**Request Body:**
```json
{
  "username": "operator1",
  "password": "password123",
  "name": "Operator Satu",
  "email": "operator1@umroh.com",
  "phone": "081234567890",
  "role": "operator",
  "is_active": true
}
```

#### PUT /api/users/:id
Update user

#### PUT /api/users/:id/password
Change password

**Request Body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword"
}
```

#### PUT /api/users/:id/toggle-status
Toggle user active status (Admin only)

#### DELETE /api/users/:id
Deactivate user (Admin only)

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## Rate Limiting

API endpoints are rate limited:
- General endpoints: 100 requests per 15 minutes per IP
- Login endpoint: 5 requests per minute per IP

## File Upload Limits

- Maximum file size: 10MB
- Allowed file types: 
  - Images: JPEG, JPG, PNG, GIF
  - Documents: PDF, DOC, DOCX

## Pagination

All list endpoints support pagination with the following parameters:
- `page`: Page number (starts from 1)
- `limit`: Items per page (max: 100)

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 150,
    "totalPages": 15
  }
}
```