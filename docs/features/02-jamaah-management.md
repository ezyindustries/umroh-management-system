# Jamaah Management Feature Documentation

## Overview
Jamaah Management adalah fitur inti untuk mengelola data jamaah umroh, termasuk informasi pribadi, keluarga, dokumen, dan status perjalanan. Fitur ini mendukung input manual dan import Excel dengan validasi komprehensif.

## Features

### 1. Jamaah List View
Menampilkan daftar jamaah dalam format tabel dengan fitur:

#### Display Columns:
- Nama Lengkap
- NIK
- No. Telepon
- Paket Umroh
- Status Pembayaran
- Actions (View, Edit, Delete)

#### Features:
- **Search**: Real-time search by nama, NIK, atau telepon
- **Filter**: By paket, status pembayaran, status dokumen
- **Sort**: By nama, tanggal daftar, status
- **Pagination**: 10/25/50/100 items per page
- **Export**: Download filtered data as Excel

### 2. Add/Edit Jamaah Modal
Modal form dengan glassmorphism design, organized dalam sections:

#### a. Data Utama (Main Data)
- **Nama Lengkap**: Required, text
- **NIK**: Required, 16 digits validation
- **Tanggal Lahir**: ddmmyyyy format
- **Tempat Lahir**: Required, text
- **Jenis Kelamin**: Select (Laki-laki/Perempuan)
- **No. Telepon**: Required, phone validation
- **Email**: Optional, email validation
- **Paket Umroh**: Required, dynamic dropdown
- **Alamat Lengkap**: Required, textarea

#### b. Data Regional (Optional)
- **Provinsi**: Dropdown 38 provinsi Indonesia
- **Kabupaten/Kota**: Text input
- **Kecamatan**: Text input
- **Kelurahan**: Text input

#### c. Data Personal (Optional)
- **Status Pernikahan**: Select (Belum Kawin/Kawin/Cerai)
- **Pendidikan Terakhir**: Select (SD to S3)
- **Pekerjaan**: Text input

#### d. Data Keluarga
- **Status dalam Keluarga**: Required (Kepala Keluarga/Istri/Anak/Individu)
- **Main Family**: Conditional dropdown
- **Preferensi Kamar**: Required (Quad/Triple/Double)
- **Request 1 Kamar**: Checkbox for family room

#### e. Data Paspor
- **Nama di Paspor**: With "same as KTP" checkbox
- **No. Paspor**: Text, passport format
- **Kota Penerbitan**: Text input
- **Tanggal Penerbitan**: ddmmyyyy format
- **Tanggal Kadaluarsa**: ddmmyyyy format
- **Upload Foto Paspor**: Image upload with preview

### 3. Jamaah Detail View
Comprehensive view showing:
- Personal information card
- Family relationships diagram
- Payment history timeline
- Document checklist
- Activity log
- Notes section

### 4. Family Management
Visual family tree showing:
- Main family (kepala keluarga)
- Spouse relationships
- Children connections
- Room allocation status
- Mahram validation

### 5. Bulk Operations
- Select multiple jamaah
- Bulk status update
- Bulk document request
- Bulk export
- Bulk delete (soft)

## Technical Implementation

### Frontend Components

#### JavaScript Functions:
```javascript
// Main functions
loadJamaahData()          // Load jamaah list
openModal('jamaahModal')  // Open add/edit modal
saveJamaah(event)        // Save jamaah data
editJamaah(id)           // Load jamaah for editing
deleteJamaah(id)         // Soft delete jamaah
viewJamaah(id)           // View detail page

// Utility functions
validateNIK(nik)         // Validate 16-digit NIK
formatDateDisplay(date)   // Format date for display
toggleFamilyFields()     // Show/hide family selector
togglePassportName()     // Copy name to passport
previewPassportImage()   // Show image preview
```

#### Modal Structure:
```html
<div class="custom-modal" id="jamaahModal">
    <div class="modal-dialog">
        <div class="modal-header">
            <h3>Tambah/Edit Jamaah</h3>
            <button class="close-btn">×</button>
        </div>
        <div class="modal-body-scroll">
            <form id="jamaahForm">
                <!-- Form sections -->
            </form>
        </div>
    </div>
</div>
```

### Backend API

#### Endpoints:

1. **GET /api/jamaah**
   - Query params: search, filter, sort, page, limit
   - Returns: Paginated jamaah list

2. **GET /api/jamaah/:id**
   - Returns: Complete jamaah details with relations

3. **POST /api/jamaah**
   - Body: Jamaah data object
   - Returns: Created jamaah with ID

4. **PUT /api/jamaah/:id**
   - Body: Updated jamaah data
   - Returns: Updated jamaah object

5. **DELETE /api/jamaah/:id**
   - Soft delete implementation
   - Returns: Success message

6. **GET /api/jamaah/:id/family**
   - Returns: Family tree data

7. **POST /api/jamaah/import**
   - Body: Excel file
   - Returns: Import results

### Database Schema

#### Main Table: jamaah.jamaah_data
```sql
CREATE TABLE jamaah.jamaah_data (
    id SERIAL PRIMARY KEY,
    nama_lengkap VARCHAR(255) NOT NULL,
    nik VARCHAR(16) UNIQUE NOT NULL,
    tanggal_lahir DATE NOT NULL,
    tempat_lahir VARCHAR(100) NOT NULL,
    jenis_kelamin VARCHAR(20) NOT NULL,
    no_telepon VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    alamat TEXT NOT NULL,
    -- Regional data
    provinsi VARCHAR(100),
    kabupaten VARCHAR(100),
    kecamatan VARCHAR(100),
    kelurahan VARCHAR(100),
    -- Personal data
    status_pernikahan VARCHAR(50),
    pendidikan_terakhir VARCHAR(50),
    pekerjaan VARCHAR(100),
    -- Family data
    status_dalam_keluarga VARCHAR(50) NOT NULL,
    main_family_id INTEGER REFERENCES jamaah.jamaah_data(id),
    preferensi_kamar VARCHAR(20) NOT NULL DEFAULT 'quad',
    request_satu_kamar BOOLEAN DEFAULT FALSE,
    -- Passport data
    nama_paspor VARCHAR(255),
    no_paspor VARCHAR(50),
    kota_penerbitan_paspor VARCHAR(100),
    tanggal_penerbitan_paspor DATE,
    tanggal_kadaluarsa_paspor DATE,
    foto_paspor_url TEXT,
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER
);
```

#### Indexes:
```sql
CREATE INDEX idx_jamaah_nik ON jamaah.jamaah_data(nik);
CREATE INDEX idx_jamaah_nama ON jamaah.jamaah_data(nama_lengkap);
CREATE INDEX idx_jamaah_telepon ON jamaah.jamaah_data(no_telepon);
CREATE INDEX idx_jamaah_family ON jamaah.jamaah_data(main_family_id);
CREATE INDEX idx_jamaah_deleted ON jamaah.jamaah_data(deleted_at);
```

## Validation Rules

### NIK Validation:
- Must be exactly 16 digits
- Must be unique in system
- Format: PPKKTTDDMMYYSSSS
  - PP: Province code
  - KK: City code  
  - TT: District code
  - DD: Day (+40 for female)
  - MM: Month
  - YY: Year
  - SSSS: Sequence

### Date Validations:
- Birth date: Must be past date
- Passport issue: Must be past date
- Passport expiry: Must be future date
- Age validation: 18-80 years for umroh

### Family Rules:
- Kepala keluarga: Can't select main family
- Istri/Anak: Must select existing kepala keluarga
- Mahram validation for female jamaah
- Room allocation based on gender and family

## UI/UX Features

### Form Design:
1. **Progressive Disclosure**:
   - Required fields first
   - Optional sections collapsible
   - Smart defaults

2. **Input Helpers**:
   - Format hints
   - Real-time validation
   - Auto-formatting
   - Dropdown search

3. **Visual Feedback**:
   - Loading states
   - Success animations
   - Error highlighting
   - Progress indicators

### Accessibility:
- Tab navigation
- Screen reader labels
- Error announcements
- Keyboard shortcuts

## Excel Import/Export

### Import Format:
```
| Nama Lengkap | NIK | Tanggal Lahir | Tempat Lahir | ... |
|--------------|-----|---------------|--------------|-----|
| John Doe     | ... | 15051985      | Jakarta      | ... |
```

### Import Features:
- Template download
- Validation preview
- Error reporting by row
- Partial import option
- Rollback capability

### Export Options:
- Current view
- All data
- Custom columns
- Multiple formats (XLSX, CSV)

## Performance Optimizations

1. **List View**:
   - Virtual scrolling
   - Lazy loading
   - Indexed search
   - Cached filters

2. **Form Optimization**:
   - Debounced validation
   - Async dropdown loading
   - Image compression
   - Form data persistence

3. **Database**:
   - Proper indexing
   - Query optimization
   - Connection pooling
   - Result caching

## Security Features

1. **Data Protection**:
   - NIK masking in logs
   - Encrypted passport storage
   - Audit trail for all changes
   - Role-based field access

2. **Input Security**:
   - XSS prevention
   - SQL injection protection
   - File upload validation
   - Rate limiting

## Error Handling

### Validation Errors:
- Field-level messages
- Summary at top
- Clear correction hints
- Preserve valid data

### System Errors:
- User-friendly messages
- Auto-retry for network
- Fallback options
- Error logging

## Future Enhancements

### Planned Features:
1. **Biometric Integration**:
   - Fingerprint capture
   - Face recognition
   - Digital signature

2. **Document OCR**:
   - Auto-extract passport data
   - KTP scanning
   - Form auto-fill

3. **Mobile App**:
   - Offline capability
   - Camera integration
   - Push notifications

4. **Advanced Search**:
   - Fuzzy matching
   - Similar name detection
   - Duplicate prevention

5. **Automation**:
   - Auto-assign mahram
   - Smart room allocation
   - Document reminders
   - Payment follow-up

### Suggested Improvements:
1. Add photo capture for jamaah
2. Implement medical history section
3. Add emergency contact fields
4. Create QR code for each jamaah
5. Add vaccination records
6. Implement travel insurance data
7. Add dietary restrictions
8. Create companion preferences
9. Add previous umroh history
10. Implement special needs tracking