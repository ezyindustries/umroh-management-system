# MODULE: Import/Export Excel - Business Flow Documentation

## Overview
Modul ini mengelola import data jamaah dan export berbagai laporan dalam format Excel. Mendukung format Manifest penerbangan dan Siskopatuh dengan validation list yang dapat di-maintain. Import bersifat partial success dengan logging detail.

## Actors & Roles
### Primary Actors:
- **Admin/Operator**: Import bulk data, export reports
- **Finance**: Export payment reports
- **Operations**: Export manifest, rooming list
- **All Roles**: Download templates, export filtered data

### System Actor:
- **System**: Validate data, generate logs, maintain validation lists

## Data Flow Diagram

### 1. Import Flow
```
Download Template → Fill Data → Upload Excel → Parse & Validate → Process Row by Row
                                                        ↓
                                              Success → Save to DB
                                              Failed → Log Error
                                                        ↓
                                                Generate Import Report
```

### 2. Export Flow
```
Select Export Type → Apply Filters → Generate Excel → Add Formatting → Download
                            ↓
                    Include Validation Sheets (if Siskopatuh)
```

### 3. Validation List Management
```
Admin Menu → Manage Lists → Add/Edit/Delete Items → Update System → Reflect in Exports
```

## Validation & Error Handling

### Import Validation Rules:
1. **Data Format Validation**:
   - NIK: 16 digits (skip if invalid)
   - Phone: Indonesian format (skip if invalid)
   - Dates: yyyy-mm-dd format (skip if invalid)
   - Email: Valid format (skip if invalid)

2. **Business Logic Validation**:
   - NIK uniqueness (skip if duplicate)
   - Passport expiry > 6 months (warning only)
   - Required fields check (skip if incomplete)

3. **Error Handling**:
   - Continue processing other rows
   - Log each error with row number
   - Provide detailed error report

### Import Overwrite Rules:
- If NIK exists and overwrite mode ON:
  - Update existing record
  - Log as "updated" not "created"
- If overwrite mode OFF:
  - Skip duplicate NIK
  - Log as "skipped - duplicate"

## Business Rules

### Template Management:
1. **Import Templates**:
   - Basic Jamaah Import (simplified)
   - Siskopatuh Format Import (comprehensive)
   - Must include sample data row
   - Column headers in Indonesian

2. **Template Fields Mapping**:
   - System fields → Excel columns
   - Handle name variations
   - Case-insensitive matching

### Siskopatuh Additional Fields:
Database extensions needed:
- Nama Ayah (father's name)
- Jenis Identitas (ID type)
- Kota Paspor (passport city)
- Provider Visa
- Insurance details (company, policy number, dates)
- BPJS number
- Address breakdown (Provinsi, Kabupaten, Kecamatan, Kelurahan)

### Validation Lists (Maintainable):
1. **Title**: TUAN, NYONYA, NONA
2. **Jenis Identitas**: NIK, KITAS, KITAP
3. **Kewarganegaraan**: WNI, WNA
4. **Status Pernikahan**: BELUM MENIKAH, MENIKAH, JANDA/DUDA
5. **Pendidikan**: TIDAK SEKOLAH, SD/MI, SMP/MTS, SMA/MA, D3, D4/S1, S2, S3
6. **Pekerjaan**: PNS, PEG. SWASTA, WIRAUSAHA, IBU RUMAH TANGGA, PELAJAR, etc.
7. **Provider Visa**: B2C, PT companies list
8. **Asuransi**: Insurance companies list
9. **Provinsi/Kabupaten**: Indonesian regions

### Export Formats:

#### 1. Manifest Export:
- Header section:
  - Company name & logo area
  - Program/Package name
  - Flight details (multiple segments)
- Passenger section:
  - Sequential numbering
  - Name, Passport, Gender, Age
  - Room allocation
  - Special notes
- Footer section:
  - Total passengers
  - Officer signatures area

#### 2. Siskopatuh Export:
- Sheet 1: Main Data (32 columns)
- Sheet 2: Validation Lists
- Sheet 3: Province/Regency data
- Includes all extended fields
- Maintains data types (dates as Excel dates)

#### 3. Other Exports:
- Payment Summary
- Document Checklist
- Room Allocation
- Bus Manifest
- Insurance List

### Import Processing:
1. **Pre-processing**:
   - Detect file type (.xlsx, .xlsm, .csv)
   - Identify format (basic or Siskopatuh)
   - Map columns to fields

2. **Row Processing**:
   - Validate each field
   - Check business rules
   - Attempt save/update
   - Log result per row

3. **Post-processing**:
   - Generate summary report
   - Create error detail file
   - Send notification

### Import Modes:
1. **Create Only**: Skip existing NIK
2. **Update Only**: Skip new NIK
3. **Upsert**: Create new, update existing
4. **Overwrite**: Replace all data for existing

## API Contracts

### GET /api/excel/templates
**Response:**
```json
{
  "templates": [
    {
      "id": "basic_import",
      "name": "Template Import Jamaah Basic",
      "description": "Format sederhana untuk import data jamaah",
      "file_url": "/api/excel/download-template/basic_import"
    },
    {
      "id": "siskopatuh_import",
      "name": "Template Import Siskopatuh",
      "description": "Format lengkap sesuai sistem Siskopatuh",
      "file_url": "/api/excel/download-template/siskopatuh_import"
    }
  ]
}
```

### POST /api/excel/import
**Request (multipart/form-data):**
```
file: [Excel file]
format: "basic" | "siskopatuh"
mode: "create" | "update" | "upsert" | "overwrite"
package_id: 1 (optional)
dry_run: false (optional - validate only)
```

**Response:**
```json
{
  "summary": {
    "total_rows": 150,
    "successful": 145,
    "failed": 5,
    "skipped": 3,
    "updated": 2,
    "processing_time": "5.2s"
  },
  "errors": [
    {
      "row": 15,
      "nik": "3301234567890123",
      "name": "Ahmad",
      "errors": ["NIK already exists", "Phone format invalid"],
      "action": "skipped"
    }
  ],
  "import_log_id": "import_20250125_143022",
  "download_error_report": "/api/excel/import-report/import_20250125_143022"
}
```

### POST /api/excel/export/manifest
**Request Body:**
```json
{
  "package_id": 1,
  "include_no_show": false,
  "grouping": "bus",
  "language": "id"
}
```

### POST /api/excel/export/siskopatuh
**Request Body:**
```json
{
  "package_id": 1,
  "include_validation_sheets": true,
  "include_insurance": true,
  "include_visa": true
}
```

### GET /api/excel/validation-lists
**Response:**
```json
{
  "lists": {
    "title": ["TUAN", "NYONYA", "NONA"],
    "jenis_identitas": ["NIK", "KITAS", "KITAP"],
    "pekerjaan": ["PNS", "PEG. SWASTA", "WIRAUSAHA", ...],
    "pendidikan": ["TIDAK SEKOLAH", "SD/MI", ...],
    "provider_visa": ["B2C", "PT VISA INDO", ...],
    "asuransi": ["PT ASURANSI JASINDO", ...]
  }
}
```

### PUT /api/excel/validation-lists/{list_name}
**Request Body:**
```json
{
  "items": ["TUAN", "NYONYA", "NONA", "ANANDA"]
}
```

### GET /api/excel/import-history
**Response:**
```json
{
  "imports": [
    {
      "id": "import_20250125_143022",
      "timestamp": "2025-01-25 14:30:22",
      "user": "admin",
      "filename": "jamaah_batch_1.xlsx",
      "format": "siskopatuh",
      "summary": {
        "total": 150,
        "success": 145,
        "failed": 5
      },
      "status": "completed",
      "error_report_url": "/api/excel/import-report/import_20250125_143022"
    }
  ]
}
```

## Edge Cases Handled

1. **Large File Processing**:
   - Chunk processing for files > 1000 rows
   - Progress tracking via websocket
   - Timeout prevention

2. **Encoding Issues**:
   - Handle various character encodings
   - Special characters in names
   - RTL text support

3. **Formula Cells**:
   - Evaluate formulas to values
   - Handle formula errors
   - Preserve calculated results

4. **Merged Cells**:
   - Detect and handle properly
   - Maintain formatting in exports
   - Unmerge for imports

5. **Data Type Mismatches**:
   - Dates stored as text
   - Numbers with thousand separators
   - Phone numbers with various formats

6. **Validation List Updates**:
   - Handle list items in use
   - Cascade updates to existing data
   - Version control for lists

7. **Concurrent Imports**:
   - Queue system for large imports
   - Prevent duplicate processing
   - User notification on completion

## Integration Points

1. **With Jamaah Module**:
   - Create/update jamaah records
   - Validate against existing data

2. **With Package Module**:
   - Link imported jamaah to packages
   - Check package capacity

3. **With Document Module**:
   - Flag missing documents post-import
   - Generate document checklist

4. **With Payment Module**:
   - Export payment status
   - Import payment records

5. **With Notification Module**:
   - Import completion alerts
   - Error report notifications

## Import/Export Logging
Every operation must log:
- User who initiated
- Timestamp start/end
- File details (name, size, rows)
- Processing summary
- Error details with row numbers
- Success/failure records
- Download history for exports