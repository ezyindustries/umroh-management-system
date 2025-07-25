# API Contracts Complete Documentation
## Sistem Manajemen Umroh - Full API Reference

### API Overview
Base URL: `https://api.umroh-system.com/api`  
Version: 1.0  
Authentication: Bearer Token (JWT)

### Table of Contents
1. [Authentication & User Management](#1-authentication--user-management)
2. [Jamaah Management](#2-jamaah-management)
3. [Package Management](#3-package-management)
4. [Payment & Finance](#4-payment--finance)
5. [Document Management](#5-document-management)
6. [Group Management](#6-group-management)
7. [Import/Export Excel](#7-importexport-excel)
8. [Family Relations](#8-family-relations)
9. [Hotel Management](#9-hotel-management)
10. [Flight Management](#10-flight-management)
11. [Ground Handling](#11-ground-handling)
12. [Inventory Management](#12-inventory-management)
13. [AI Marketing](#13-ai-marketing)
14. [Reporting & Analytics](#14-reporting--analytics)
15. [Backup & Recovery](#15-backup--recovery)
16. [Monitoring & Performance](#16-monitoring--performance)
17. [Notification System](#17-notification-system)
18. [Brochure Management](#18-brochure-management)
19. [Dashboard & Analytics](#19-dashboard--analytics)

---

## 1. Authentication & User Management

### POST /api/auth/login
Login user dengan username dan password.

**Request Body:**
```json
{
  "username": "admin_user",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin_user",
    "nama": "Administrator",
    "roles": ["admin", "finance", "marketing"],
    "last_login": "2025-01-25 10:00:00"
  },
  "expires_in": 86400
}
```

### POST /api/auth/logout
Logout user dan invalidate token.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/users
Get list of all users (Admin only).

**Query Parameters:**
- `role`: Filter by role
- `status`: active/inactive
- `page`: Page number
- `limit`: Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "admin_user",
        "nama": "Administrator",
        "roles": ["admin", "finance"],
        "status": "active",
        "created_at": "2025-01-01",
        "last_login": "2025-01-25"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

### POST /api/users
Create new user (Admin only).

**Request Body:**
```json
{
  "username": "new_user",
  "password": "initial_password",
  "nama": "New User",
  "roles": ["marketing", "operations"]
}
```

### PUT /api/users/{id}/roles
Update user roles (Admin only).

**Request Body:**
```json
{
  "roles": ["admin", "finance", "marketing"]
}
```

### POST /api/users/{id}/reset-password
Admin reset user password.

**Request Body:**
```json
{
  "new_password": "temporary_password"
}
```

---

## 2. Jamaah Management

### GET /api/jamaah
Get list of jamaah with filters.

**Query Parameters:**
- `search`: Search by name, NIK, phone
- `status`: active/pending/cancelled/completed
- `package_id`: Filter by package
- `has_incomplete_docs`: true/false
- `page`, `limit`: Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jamaah": [
      {
        "id": 1,
        "nik": "3301234567890123",
        "nama": "Ahmad Yusuf",
        "phone": "081234567890",
        "email": "ahmad@email.com",
        "status": "active",
        "package_id": 1,
        "package_name": "Umroh Maret 2025",
        "is_infant": false,
        "is_child": false,
        "is_senior": false,
        "has_special_needs": false,
        "created_at": "2025-01-15"
      }
    ],
    "pagination": {
      "total": 1245,
      "page": 1,
      "limit": 50
    }
  }
}
```

### POST /api/jamaah
Create new jamaah.

**Request Body:**
```json
{
  "nik": "3301234567890123",
  "nama": "Ahmad Yusuf",
  "nama_paspor": "AHMAD YUSUF",
  "tempat_lahir": "Jakarta",
  "tanggal_lahir": "1980-05-15",
  "jenis_kelamin": "L",
  "alamat": "Jl. Merdeka No. 123",
  "kota": "Jakarta",
  "phone": "081234567890",
  "email": "ahmad@email.com",
  "paspor_nomor": "A1234567",
  "paspor_issued": "2020-01-15",
  "paspor_expired": "2030-01-15",
  "package_id": 1,
  "is_wni": true,
  "special_needs": "",
  "emergency_contact": {
    "nama": "Fatimah",
    "phone": "081234567891",
    "hubungan": "Istri"
  }
}
```

### PUT /api/jamaah/{id}
Update jamaah data.

### GET /api/jamaah/{id}
Get single jamaah detail.

**Response includes:**
- Basic information
- Package details
- Payment status
- Document status
- Family relations

### POST /api/jamaah/{id}/activate-old-data
Reactivate cancelled jamaah.

### PUT /api/jamaah/{id}/special-flags
Update special flags (infant, child, senior, special needs).

**Request Body:**
```json
{
  "is_infant": false,
  "is_child": true,
  "is_senior": false,
  "special_needs": "Requires wheelchair assistance"
}
```

---

## 3. Package Management

### GET /api/packages
Get all packages with filters.

**Query Parameters:**
- `status`: draft/published/full/closed
- `year`: Filter by year
- `month`: Filter by month
- `has_seats`: true/false

### POST /api/packages
Create new package based on PNR.

**Request Body:**
```json
{
  "nama": "Umroh Ramadhan 2025 - 12 Hari",
  "pnr_code": "ABC123",
  "departure_date": "2025-03-15",
  "return_date": "2025-03-27",
  "duration_days": 12,
  "quota": 150,
  "base_price": 25000000,
  "description": "Paket umroh Ramadhan dengan hotel bintang 4",
  "itinerary": "Day 1: Jakarta - Jeddah...",
  "status": "draft"
}
```

### POST /api/packages/{id}/sub-packages
Create hotel sub-packages.

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
  ]
}
```

### PUT /api/packages/{id}/status
Update package status (auto rules apply).

### POST /api/packages/{id}/duplicate
Duplicate package for quick creation.

---

## 4. Payment & Finance

### GET /api/payments
Get payment list with filters.

**Query Parameters:**
- `jamaah_id`: Filter by jamaah
- `package_id`: Filter by package
- `status`: pending/verified/failed
- `type`: dp/pelunasan/lainnya
- `date_from`, `date_to`: Date range

### POST /api/payments
Record new payment.

**Request Body:**
```json
{
  "jamaah_id": 1,
  "package_id": 1,
  "amount": 5000000,
  "type": "dp",
  "payment_method": "transfer",
  "payment_date": "2025-01-25",
  "notes": "DP standard",
  "exception": {
    "has_exception": false
  }
}
```

### POST /api/payments/{id}/verify
Verify payment with proof.

**Request (multipart/form-data):**
```
status: verified
proof_file: [binary]
verified_notes: "Transfer confirmed, matches bank statement"
```

### POST /api/payments/{id}/exception
Create payment exception.

**Request Body:**
```json
{
  "exception_type": "reduced_dp",
  "exception_amount": 3000000,
  "reason": "Repeat customer discount",
  "approved_by": "Pimpinan",
  "proof_image": "base64_encoded_image"
}
```

### POST /api/refunds
Process refund with manual approval.

**Request Body:**
```json
{
  "payment_id": 123,
  "refund_amount": 4500000,
  "refund_percentage": 90,
  "reason": "Pembatalan karena sakit",
  "approval_notes": "Disetujui pimpinan via WA",
  "approval_proof": "base64_image"
}
```

### GET /api/invoices/{jamaah_id}
Get all invoices for a jamaah.

### POST /api/invoices/generate
Generate new invoice for payments.

---

## 5. Document Management

### GET /api/documents/jamaah/{jamaah_id}
Get all documents for a jamaah.

**Response includes:**
- Document list with versions
- Verification status
- Expiry warnings
- Completeness check

### POST /api/documents/upload
Upload new document.

**Request (multipart/form-data):**
```
jamaah_id: 1
document_type: passport
file: [binary]
expiry_date: 2030-01-15 (for passport)
notes: "Passport renewal"
```

### PUT /api/documents/{id}/verify
Verify or reject document.

**Request Body:**
```json
{
  "is_verified": true,
  "verification_notes": "Clear and valid"
}
```

### GET /api/documents/incomplete
Get jamaah with incomplete documents.

**Query Parameters:**
- `package_id`: Filter by package
- `document_type`: Filter by missing type
- `days_to_departure`: Urgency filter

### GET /api/documents/expiring-passports
Get passports expiring soon.

---

## 6. Group Management

### POST /api/groups
Create new group for package.

**Request Body:**
```json
{
  "package_id": 1,
  "name": "Umroh Ramadhan 2025 - Batch 1",
  "departure_date": "2025-03-15",
  "notes": "Combined Jakarta-Surabaya"
}
```

### POST /api/groups/{id}/subgroups
Create sub-groups for different cities.

### POST /api/groups/{id}/assign-jamaah
Assign jamaah to groups and buses.

**Request Body:**
```json
{
  "assignments": [
    {
      "jamaah_id": 1,
      "subgroup_id": 1,
      "bus_number": 1,
      "meeting_point_id": 1,
      "special_notes": "Needs wheelchair"
    }
  ]
}
```

### POST /api/attendance/checkin
Record attendance at departure.

**Request Body:**
```json
{
  "group_id": 1,
  "jamaah_id": 1,
  "status": "present",
  "baggage": {
    "large_suitcases": 2,
    "small_bags": 1,
    "special_items": [
      {
        "type": "wheelchair",
        "count": 1
      }
    ]
  }
}
```

### GET /api/groups/{id}/manifest
Get complete manifest with attendance.

---

## 7. Import/Export Excel

### GET /api/excel/templates
Get available import templates.

### POST /api/excel/import
Import jamaah data from Excel.

**Request (multipart/form-data):**
```
file: [Excel file]
format: basic/siskopatuh
mode: create/update/upsert/overwrite
package_id: 1
dry_run: false
```

**Response includes:**
- Success/failure counts
- Detailed error report
- Download link for errors

### POST /api/excel/export/manifest
Export flight manifest.

### POST /api/excel/export/siskopatuh
Export in Siskopatuh format.

### GET /api/excel/validation-lists
Get dropdown values for Siskopatuh.

### PUT /api/excel/validation-lists/{list_name}
Update validation list items.

---

## 8. Family Relations

### POST /api/family-groups
Create family group.

**Request Body:**
```json
{
  "name": "Keluarga Pak Ahmad",
  "package_id": 1,
  "room_preference": "must_together"
}
```

### POST /api/family-groups/{id}/members
Add members to family.

### POST /api/room-assignment/auto-suggest
Get AI suggestions for room assignment.

**Request Body:**
```json
{
  "package_id": 1,
  "room_config": {
    "total_quad": 25,
    "total_triple": 5,
    "total_double": 10
  }
}
```

### PUT /api/room-assignment/manual
Manual room assignment changes.

---

## 9. Hotel Management

### POST /api/hotels
Add new hotel to database.

### POST /api/packages/{id}/sub-packages
Create hotel sub-packages with pricing.

### POST /api/hotels/{id}/confirmations
Upload booking confirmation.

**Request (multipart/form-data):**
```
package_id: 1
file: [PDF/image]
confirmation_number: "HTL-2025-001"
notes: "Confirmed 25 rooms"
```

### PUT /api/hotels/{id}
Update hotel info (with change notes).

---

## 10. Flight Management

### POST /api/flights/pnr
Create PNR record.

**Request Body:**
```json
{
  "pnr_code": "ABC123",
  "package_id": 1,
  "total_pax": 150,
  "flight_details": "GA 890 | 15 MAR | CGK-JED | 09:00-14:00",
  "departure_date": "2025-03-15"
}
```

### POST /api/flights/pnr/{code}/assign
Assign jamaah to PNR.

### PUT /api/flights/pnr/{code}
Update flight details (with change log).

### GET /api/flights/dashboard
Flight operation dashboard.

---

## 11. Ground Handling

### POST /api/ground-handling
Create handling schedule.

**Request Body:**
```json
{
  "pnr_code": "ABC123",
  "handling_type": "departure",
  "airport": "CGK",
  "scheduled_date": "2025-03-15",
  "scheduled_time": "06:00",
  "notes": "5 wheelchair needed"
}
```

### PUT /api/ground-handling/{id}/notes
Update handling notes.

### POST /api/ground-handling/{id}/complete
Mark handling as completed.

---

## 12. Inventory Management

### POST /api/inventory/items
Create inventory item.

### POST /api/inventory/stock-in
Record stock receipt.

### POST /api/inventory/distribution
Record item distribution.

**Request (multipart/form-data):**
```
jamaah_id: 1
items_distributed: [{"item_id": 1, "quantity": 1}]
proof_image: [binary]
```

### GET /api/inventory/dashboard
Inventory status and alerts.

---

## 13. AI Marketing

### POST /api/whatsapp/webhook
WhatsApp incoming message webhook.

### POST /api/ai/process-message
Process message through AI.

### POST /api/marketing/leads
AI creates new lead.

### GET /api/marketing/dashboard
Marketing performance dashboard.

### PUT /api/ai/prompts
Update AI prompts.

---

## 14. Reporting & Analytics

### GET /api/reports/dashboard
Get real-time issue reports.

**Response includes:**
- Issues by category
- Urgency levels
- Detailed problems
- WhatsApp links

### GET /api/reports/settings
Get report thresholds.

### PUT /api/reports/settings
Update thresholds.

---

## 15. Backup & Recovery

### GET /api/backup/status
Current backup status.

### POST /api/backup/download
Download backup file.

### POST /api/backup/restore
Restore from backup (Super Admin).

**Request Body:**
```json
{
  "backup_id": "backup_2025-01-25_02-00-00",
  "restore_type": "partial",
  "tables": ["jamaah", "payments"]
}
```

---

## 16. Monitoring & Performance

### GET /api/monitoring/dashboard
System health dashboard.

### GET /api/monitoring/metrics/{type}
Get specific metrics.

**Query Parameters:**
- `from`, `to`: Time range
- `interval`: 1m/5m/1h/1d
- `aggregation`: avg/max/min

### POST /api/monitoring/alerts/config
Configure alert thresholds.

---

## 17. Notification System

### GET /api/notifications/flags
Get user's notification flags.

### POST /api/notifications/flags/mark-read
Mark notifications as read.

### GET /api/notifications/entity-flags/{type}/{id}
Get flags for specific entity.

---

## 18. Brochure Management

### POST /api/brochures/package/{id}
Upload brochure images and text.

**Request (multipart/form-data):**
```
images[]: [multiple image files]
image_order: [1,2,3]
text_template: "WhatsApp message template"
```

### GET /api/brochures/ai/{package_code}
AI access endpoint for brochures.

### PUT /api/brochures/package/{id}/reorder
Reorder brochure images.

---

## 19. Dashboard & Analytics

### GET /api/dashboard/summary
Main dashboard metrics.

**Query Parameters:**
- `period`: day/month
- `date`: Specific date

**Response includes:**
- Operational metrics
- Financial summary
- Activity stats
- Comparisons

### GET /api/dashboard/detail/{metric}
Drill-down into specific metric.

### GET /api/dashboard/activity-log
Recent system activities.

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "metadata": {
    "timestamp": "2025-01-25T10:00:00Z",
    "request_id": "uuid"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "metadata": {
    "timestamp": "2025-01-25T10:00:00Z",
    "request_id": "uuid"
  }
}
```

### Pagination Format
```json
{
  "pagination": {
    "total": 1000,
    "page": 1,
    "limit": 50,
    "pages": 20,
    "has_next": true,
    "has_prev": false
  }
}
```

## Rate Limiting

All endpoints have rate limiting:
- Standard endpoints: 100 requests/minute
- Search endpoints: 30 requests/minute
- Export endpoints: 10 requests/minute
- AI endpoints: 50 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhook Endpoints

### WhatsApp Webhook
`POST /webhooks/whatsapp`
- Receives WhatsApp messages
- Validates webhook signature
- Processes through AI

### Payment Gateway Webhook
`POST /webhooks/payment/{provider}`
- Payment confirmations
- Webhook validation
- Auto-update payment status

## API Versioning

Current version: v1
Version in URL: `/api/v1/...`

Deprecation policy:
- 6 months notice
- Sunset headers
- Migration guide

## Security Headers

Required headers:
```
Authorization: Bearer {token}
Content-Type: application/json
X-Request-ID: {uuid}
```

Optional headers:
```
X-Client-Version: 1.0.0
X-Device-ID: {device_uuid}
Accept-Language: id-ID
```