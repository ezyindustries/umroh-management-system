# Document Management Feature Documentation

## Overview
Sistem manajemen dokumen untuk menyimpan, memverifikasi, dan mengelola semua dokumen jamaah seperti KTP, paspor, foto, sertifikat vaksin, dan dokumen pendukung lainnya.

## Current Implementation Status
⚠️ **Partially Implemented** - Basic UI tersedia, backend belum lengkap

## User Interface

### Document Management Page
Halaman utama untuk mengelola semua dokumen jamaah.

#### Features
1. **Document Upload**
   - Drag & drop file upload
   - Multiple file selection
   - Progress indicators
   - File type validation

2. **Document List View**
   - Grid/list toggle view
   - Filter by document type
   - Filter by status
   - Search by jamaah name

3. **Document Preview**
   - Modal preview for images
   - PDF viewer integration
   - Download option
   - Print functionality

4. **Document Verification**
   - Approve/reject documents
   - Add verification notes
   - Batch verification
   - Status tracking

## Document Types

### Required Documents
1. **KTP** (Kartu Tanda Penduduk)
   - Format: JPG, PNG, PDF
   - Max size: 5MB
   - Required for all jamaah

2. **Passport**
   - Format: JPG, PNG, PDF
   - Max size: 5MB
   - Page with photo and biodata

3. **Pas Foto**
   - Format: JPG, PNG
   - Max size: 2MB
   - Requirements: 4x6, white background

4. **Sertifikat Vaksin**
   - Format: PDF, JPG, PNG
   - Max size: 5MB
   - Meningitis vaccine certificate

### Optional Documents
1. **Akta Nikah** (Marriage Certificate)
2. **Akta Lahir** (Birth Certificate)
3. **Surat Mahram** (Mahram Letter)
4. **Surat Kesehatan** (Health Certificate)

## Workflow

### Document Upload Flow
```javascript
1. User selects jamaah
2. Choose document type
3. Upload file(s)
4. System validates:
   - File format
   - File size
   - Image quality
5. Generate thumbnail
6. Store in MinIO/S3
7. Create database record
8. Send notification
```

### Verification Flow
```javascript
1. Admin reviews document
2. Check requirements:
   - Clarity
   - Completeness
   - Validity
3. Approve or reject
4. Add notes if rejected
5. Update status
6. Notify jamaah
```

## Technical Implementation

### Database Schema
```sql
-- documents.document_types (implemented)
-- documents.jamaah_documents (implemented)

-- Additional tables needed:
CREATE TABLE documents.verification_logs (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents.jamaah_documents(id),
    action VARCHAR(50),
    notes TEXT,
    verified_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents.document_templates (
    id SERIAL PRIMARY KEY,
    type_id INTEGER REFERENCES documents.document_types(id),
    template_url TEXT,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints (To Be Implemented)
```javascript
// Upload document
POST /api/documents/upload
Body: FormData with file and metadata

// Get documents by jamaah
GET /api/documents/jamaah/:jamaahId

// Get document details
GET /api/documents/:id

// Download document
GET /api/documents/:id/download

// Verify document
PUT /api/documents/:id/verify
Body: { status: 'approved', notes: '' }

// Delete document
DELETE /api/documents/:id
```

### File Storage Structure
```
/storage/documents/
  ├── 2024/
  │   ├── 01/
  │   │   ├── ktp/
  │   │   ├── passport/
  │   │   ├── foto/
  │   │   └── vaksin/
  │   └── 02/
  └── thumbnails/
```

## UI Components

### Document Upload Modal
```html
<div class="glass-modal">
    <div class="modal-header">
        <h3>Upload Dokumen</h3>
    </div>
    <div class="modal-body">
        <div class="form-group">
            <label>Pilih Jamaah</label>
            <select class="glass-select">
                <!-- Jamaah options -->
            </select>
        </div>
        <div class="form-group">
            <label>Jenis Dokumen</label>
            <select class="glass-select">
                <option>KTP</option>
                <option>Paspor</option>
                <option>Pas Foto</option>
                <option>Sertifikat Vaksin</option>
            </select>
        </div>
        <div class="drop-zone">
            <i class="material-icons">cloud_upload</i>
            <p>Drag & drop files here or click to browse</p>
        </div>
    </div>
</div>
```

### Document Card
```html
<div class="document-card glass-card">
    <div class="document-preview">
        <img src="thumbnail.jpg" alt="Document">
        <div class="document-type-badge">KTP</div>
    </div>
    <div class="document-info">
        <h4>Ahmad Ibrahim</h4>
        <p class="document-name">KTP_ahmad_ibrahim.jpg</p>
        <p class="upload-date">15 Jan 2024</p>
        <div class="status-badge verified">Verified</div>
    </div>
    <div class="document-actions">
        <button class="icon-btn"><i class="material-icons">visibility</i></button>
        <button class="icon-btn"><i class="material-icons">download</i></button>
        <button class="icon-btn"><i class="material-icons">delete</i></button>
    </div>
</div>
```

## Features to Implement

### 1. OCR Integration
- Auto-extract data from KTP
- Passport data extraction
- Validate against jamaah data
- Auto-fill forms

### 2. Document Templates
- Provide downloadable templates
- Sample documents
- Photo requirements guide
- Size/format guidelines

### 3. Bulk Operations
- Bulk upload via ZIP
- Batch verification
- Bulk download
- Mass status update

### 4. Document Expiry Tracking
- Passport expiry alerts
- Vaccine validity period
- Auto-notifications
- Renewal reminders

### 5. Integration Features
- WhatsApp document request
- Email notifications
- SMS alerts
- Mobile app upload

## Security Considerations

### Access Control
- Role-based document access
- Audit trail for all actions
- Watermark sensitive documents
- Prevent unauthorized downloads

### Data Protection
- Encrypt documents at rest
- Secure transmission (HTTPS)
- Regular backups
- GDPR compliance

## Performance Optimization

### Image Processing
- Generate thumbnails on upload
- Compress large images
- Lazy load in gallery view
- CDN integration

### Caching Strategy
- Cache thumbnails
- Browser caching headers
- Redis for metadata
- Optimize queries

## Monitoring & Analytics

### Metrics to Track
- Upload success rate
- Verification turnaround time
- Storage usage per jamaah
- Document types distribution
- Rejection reasons analysis

### Alerts
- Storage quota warnings
- Failed upload notifications
- Pending verification count
- Expired document alerts

## Future Enhancements

### 1. AI-Powered Features
- Auto-categorization
- Quality assessment
- Face matching
- Document fraud detection

### 2. Advanced Workflows
- Multi-stage approval
- Department routing
- Conditional requirements
- Custom workflows

### 3. Integration Expansions
- Cloud storage providers
- Third-party verification
- Government APIs
- Biometric systems

## Best Practices

### For Users
1. Upload clear, high-quality scans
2. Check file size before upload
3. Use correct document types
4. Follow naming conventions

### For Administrators
1. Regular verification checks
2. Clear rejection reasons
3. Timely processing
4. Maintain templates updated

## Troubleshooting

### Common Issues
1. **Upload Failures**
   - Check file size limits
   - Verify file formats
   - Check internet connection
   - Clear browser cache

2. **Verification Delays**
   - Review pending queue
   - Check admin notifications
   - Verify workflow settings
   - Monitor system performance

3. **Storage Issues**
   - Monitor disk usage
   - Clean old documents
   - Compress images
   - Archive completed packages