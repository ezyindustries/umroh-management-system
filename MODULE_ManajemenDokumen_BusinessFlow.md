# MODULE: Manajemen Dokumen - Business Flow Documentation

## Overview
Modul ini mengelola seluruh dokumen jamaah dengan sistem versioning, verifikasi multi-user, tracking expired date untuk paspor, dan export capabilities. Tidak ada batasan format, ukuran, atau penamaan file.

## Actors & Roles
### Primary Actors:
- **All Roles**: Upload, view, verify dokumen
- **Admin**: Monitor kelengkapan dokumen
- **Visa Officer**: Focus pada dokumen visa/paspor
- **Ground Handling**: Check dokumen kesehatan

### System Actor:
- **System**: Auto-flag expired passports, track document versions

## Data Flow Diagram

### 1. Document Upload Flow
```
Upload Document → Save to System → Set as Latest Version → Hide Previous Version
                                            ↓
                                    Available for Verification
```

### 2. Verification Flow
```
View Document → Mark as Verified → Log Verifier Info → Update Status
                      ↓ (if rejected)
                Request Reupload → Keep Old Version Hidden
```

### 3. Completeness Check Flow
```
System Check Documents → Generate Alert List → Sort/Filter Incomplete → Manual Follow Up
                                    ↓
                            Export to Excel for Processing
```

## Validation & Error Handling

### Document Rules:
1. **File Requirements**:
   - No file size limit
   - No naming convention
   - All formats accepted
   - Multiple versions allowed

2. **Passport Specific**:
   - Auto-check expiry date
   - Flag if < 8 months validity
   - Alert on dashboard

3. **Version Control**:
   - Old versions kept but hidden
   - Only latest version shown
   - Full history available in logs

## Business Rules

### Document Types:
1. **Identity Documents**:
   - KTP (WNI)
   - Passport (required for all)
   - KK (Kartu Keluarga)
   - Birth Certificate (for infant/child)

2. **Photo Requirements**:
   - Foto 4x6 white background
   - Foto 3x4 white background
   - Multiple photos may be needed

3. **Health Documents**:
   - Surat Kesehatan
   - Vaccination Certificate (Meningitis, COVID-19)
   - Special medical needs documentation

4. **Other Documents**:
   - Visa (when obtained)
   - Travel Insurance
   - Additional permits if needed

### Verification Process:
- Any role can verify
- Verification is per document
- Must log:
  - Who verified
  - When verified
  - Verification status
- Can un-verify if needed

### Passport Expiry Rules:
- System calculates months to expiry
- Status flags:
  - ✅ Valid: > 8 months
  - ⚠️ Warning: 6-8 months
  - ❌ Critical: < 6 months
- Dashboard shows expiry alerts

### Document Completeness:
- No automatic blocking
- Manual tracking via alerts
- Sorting/filtering options:
  - By missing document type
  - By jamaah name
  - By package
  - By days to departure

### Document Rejection:
- Verifier can reject with reason
- Common reasons:
  - Blurry image
  - Wrong document type
  - Expired document
  - Incomplete information
- Jamaah must reupload
- Old document becomes hidden

### Export Functionality:
- Export document list to Excel
- Includes:
  - Jamaah info
  - Document types
  - Upload status
  - Verification status
  - Expiry dates

## API Contracts

### GET /api/documents/jamaah/{jamaah_id}
**Response:**
```json
{
  "jamaah": {
    "id": 1,
    "name": "Hajah Fatimah",
    "nik": "3301234567890123"
  },
  "documents": [
    {
      "id": 101,
      "type": "passport",
      "filename": "scan_paspor.jpg",
      "upload_date": "2025-01-15",
      "uploaded_by": "admin",
      "is_verified": true,
      "verified_by": "supervisor",
      "verified_date": "2025-01-16",
      "expiry_date": "2025-10-20",
      "validity_months": 7,
      "validity_status": "warning",
      "is_latest": true,
      "file_url": "/documents/101/download"
    }
  ],
  "completeness": {
    "required_documents": ["ktp", "passport", "foto_4x6", "health_cert", "vaccine"],
    "uploaded_documents": ["ktp", "passport", "foto_4x6"],
    "missing_documents": ["health_cert", "vaccine"],
    "is_complete": false
  }
}
```

### POST /api/documents/upload
**Request (multipart/form-data):**
```
jamaah_id: 1
document_type: passport
file: [binary]
expiry_date: 2025-10-20 (optional, for passport)
notes: "Updated passport after renewal"
```

### PUT /api/documents/{id}/verify
**Request Body:**
```json
{
  "is_verified": true,
  "verification_notes": "Document clear and valid"
}
```

### PUT /api/documents/{id}/reject
**Request Body:**
```json
{
  "is_verified": false,
  "rejection_reason": "Image too blurry, please rescan"
}
```

### GET /api/documents/incomplete
**Query Parameters:**
- `package_id`: Filter by package
- `document_type`: Filter by missing document type
- `days_to_departure`: Filter by urgency

**Response:**
```json
{
  "summary": {
    "total_incomplete": 45,
    "by_document_type": {
      "health_cert": 30,
      "vaccine": 25,
      "foto_4x6": 10
    }
  },
  "jamaah_list": [
    {
      "id": 1,
      "name": "Hajah Fatimah",
      "phone": "081234567890",
      "package": "Umroh Ramadhan 2025",
      "departure_date": "2025-03-15",
      "days_to_departure": 45,
      "missing_documents": ["health_cert", "vaccine"],
      "whatsapp_link": "https://wa.me/6281234567890"
    }
  ]
}
```

### GET /api/documents/expiring-passports
**Response:**
```json
{
  "critical": [
    {
      "jamaah_id": 1,
      "name": "Ahmad Fauzi",
      "passport_number": "A1234567",
      "expiry_date": "2025-05-15",
      "months_remaining": 4,
      "package": "Umroh Ramadhan 2025",
      "departure_date": "2025-03-15"
    }
  ],
  "warning": [
    {
      "jamaah_id": 2,
      "name": "Siti Aminah",
      "passport_number": "B2345678",
      "expiry_date": "2025-09-20",
      "months_remaining": 7,
      "package": "Umroh Mei 2025",
      "departure_date": "2025-05-01"
    }
  ]
}
```

### POST /api/documents/export
**Request Body:**
```json
{
  "package_id": 1,
  "include_verification_status": true,
  "include_expiry_info": true
}
```
**Response:** Excel file download

## Edge Cases Handled

1. **Simultaneous Uploads**:
   - Multiple users uploading same document type
   - Last upload becomes latest version
   - All versions preserved in history

2. **Verification Conflicts**:
   - Document verified then rejected by another user
   - Last action wins
   - Full audit trail maintained

3. **Passport Expiry During Process**:
   - Passport valid at upload but expires before departure
   - System continues monitoring
   - Alerts escalate as departure approaches

4. **Missing Document Types**:
   - New document requirements added
   - System handles gracefully
   - No breaking of existing records

5. **Large File Handling**:
   - No size limit but practical considerations
   - Timeout handling for slow connections
   - Resume capability for failed uploads

6. **Document Privacy**:
   - Medical documents contain sensitive info
   - Access logged but not restricted
   - Export includes access audit

## Integration Points

1. **With Jamaah Module**:
   - Link documents to jamaah
   - Update document completeness status

2. **With Package Module**:
   - Check document deadlines vs departure
   - Priority sorting by departure date

3. **With Notification Module**:
   - Alert for missing documents
   - Passport expiry warnings

4. **With Reporting Module**:
   - Document completeness reports
   - Verification performance metrics

## Audit Trail Requirements
Every document action must log:
- Upload: who, when, what
- Verification: who verified/rejected, when, why
- Access: who viewed/downloaded
- Version changes: full history
- Export: who exported what data