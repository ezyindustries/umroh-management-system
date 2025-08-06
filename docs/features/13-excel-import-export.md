# Excel Import/Export Feature Documentation

## Overview
Fitur Excel import/export memungkinkan pengelolaan data jamaah secara massal melalui file Excel, mendukung import data baru dan export data existing untuk berbagai keperluan operasional dan pelaporan.

## Current Implementation Status
✅ **Implemented** - Basic import/export functionality available

## Import Features

### Supported Import Types
1. **Jamaah Data Import**
   - Bulk registration
   - Update existing data
   - Family relations
   - Document status

2. **Payment Import**
   - Bulk payment entry
   - Bank reconciliation
   - Payment schedules
   - Receipt generation

3. **Package Assignment**
   - Mass assignment
   - Transfer between packages
   - Waitlist management

### Import Workflow
```javascript
const importWorkflow = {
    steps: [
        "Upload Excel file",
        "Validate format",
        "Preview data",
        "Map columns",
        "Validate data",
        "Review errors",
        "Confirm import",
        "Process data",
        "Generate report"
    ],
    validation: {
        format: ["xlsx", "xls", "csv"],
        size: "Max 10MB",
        rows: "Max 5000 per import"
    }
};
```

## Excel Templates

### Jamaah Import Template
```
| Column | Field Name | Type | Required | Format | Example |
|--------|-----------|------|----------|---------|---------|
| A | nama_lengkap | Text | Yes | - | Ahmad Ibrahim |
| B | nik | Text | Yes | 16 digits | 3201234567890123 |
| C | tempat_lahir | Text | Yes | - | Jakarta |
| D | tanggal_lahir | Date | Yes | DD/MM/YYYY | 15/05/1985 |
| E | jenis_kelamin | Text | Yes | L/P | L |
| F | no_telepon | Text | Yes | - | 081234567890 |
| G | email | Text | No | Email | ahmad@email.com |
| H | alamat | Text | Yes | - | Jl. Sudirman No. 123 |
| I | provinsi | Text | No | - | DKI Jakarta |
| J | kabupaten | Text | No | - | Jakarta Pusat |
| K | kecamatan | Text | No | - | Tanah Abang |
| L | kelurahan | Text | No | - | Bendungan Hilir |
| M | status_pernikahan | Text | No | kawin/belum/cerai | kawin |
| N | pendidikan | Text | No | - | S1 |
| O | pekerjaan | Text | No | - | Pegawai Swasta |
| P | nama_paspor | Text | No | - | AHMAD IBRAHIM |
| Q | no_paspor | Text | No | - | A1234567 |
| R | tgl_terbit_paspor | Date | No | DD/MM/YYYY | 15/01/2020 |
| S | tgl_kadaluarsa_paspor | Date | No | DD/MM/YYYY | 15/01/2030 |
| T | kode_paket | Text | No | - | PKG-2024-001 |
| U | status_keluarga | Text | Yes | - | kepala_keluarga |
| V | referensi_keluarga | Text | No | NIK | 3201234567890124 |
```

### Payment Import Template
```
| Column | Field Name | Type | Required | Format | Example |
|--------|-----------|------|----------|---------|---------|
| A | nik_jamaah | Text | Yes | 16 digits | 3201234567890123 |
| B | payment_type | Text | Yes | DP/Cicilan/Pelunasan | DP |
| C | amount | Number | Yes | - | 12500000 |
| D | payment_date | Date | Yes | DD/MM/YYYY | 15/01/2024 |
| E | payment_method | Text | Yes | Transfer/Cash | Transfer |
| F | bank_name | Text | No | - | BCA |
| G | reference_number | Text | No | - | TRF123456 |
| H | notes | Text | No | - | DP 50% |
```

## Import Validation

### Data Validation Rules
```javascript
const validationRules = {
    jamaah: {
        nik: {
            required: true,
            length: 16,
            numeric: true,
            unique: true
        },
        nama_lengkap: {
            required: true,
            minLength: 3,
            pattern: /^[a-zA-Z\s'.,-]+$/
        },
        tanggal_lahir: {
            required: true,
            date: true,
            maxAge: 90,
            minAge: 2
        },
        no_telepon: {
            required: true,
            pattern: /^(\+62|0)[0-9]{9,13}$/
        },
        email: {
            required: false,
            email: true
        }
    },
    relationships: {
        validateMahram: true,
        validateFamilyStructure: true,
        crossCheckNIK: true
    }
};
```

### Error Handling
```javascript
const errorHandling = {
    types: {
        format: "Invalid file format",
        structure: "Missing required columns",
        validation: "Data validation failed",
        duplicate: "Duplicate entry found",
        reference: "Invalid reference"
    },
    response: {
        summary: {
            total: 100,
            success: 95,
            failed: 5
        },
        errors: [
            {
                row: 15,
                column: "B",
                field: "nik",
                value: "320123456789012",
                error: "NIK must be 16 digits",
                suggestion: "Add one more digit"
            }
        ]
    }
};
```

## Export Features

### Export Types
1. **Jamaah Data Export**
   - All jamaah
   - By package
   - By status
   - Custom filters

2. **Financial Reports**
   - Payment summary
   - Outstanding balances
   - Transaction history
   - Revenue reports

3. **Operational Reports**
   - Manifest
   - Rooming list
   - Document checklist
   - Contact sheets

4. **Custom Exports**
   - User-defined columns
   - Multiple filters
   - Calculated fields
   - Pivot tables

### Export Formats
```javascript
const exportFormats = {
    excel: {
        extension: ".xlsx",
        features: ["formatting", "formulas", "multiple_sheets", "charts"],
        maxRows: 1048576
    },
    csv: {
        extension: ".csv",
        features: ["simple", "universal", "lightweight"],
        maxRows: "unlimited"
    },
    pdf: {
        extension: ".pdf",
        features: ["printable", "formatted", "headers_footers", "page_numbers"],
        orientation: ["portrait", "landscape"]
    }
};
```

## Technical Implementation

### Import Processing
```javascript
class ExcelImporter {
    constructor() {
        this.parser = new ExcelParser();
        this.validator = new DataValidator();
        this.processor = new BatchProcessor();
    }
    
    async importFile(file, type) {
        try {
            // 1. Parse Excel file
            const data = await this.parser.parse(file);
            
            // 2. Validate structure
            const structure = await this.validator.validateStructure(data, type);
            if (!structure.valid) {
                return { success: false, errors: structure.errors };
            }
            
            // 3. Map columns
            const mapped = this.mapColumns(data, type);
            
            // 4. Validate data
            const validation = await this.validator.validateData(mapped, type);
            
            // 5. Preview results
            const preview = {
                total: mapped.length,
                valid: validation.valid.length,
                errors: validation.errors,
                sample: mapped.slice(0, 5)
            };
            
            // 6. Process valid records
            if (validation.valid.length > 0) {
                const results = await this.processor.process(validation.valid, type);
                return { success: true, results, preview };
            }
            
            return { success: false, preview };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async validateUniqueness(records, field) {
        const values = records.map(r => r[field]);
        const existing = await this.checkExisting(values, field);
        return records.map(record => ({
            ...record,
            isDuplicate: existing.includes(record[field])
        }));
    }
}
```

### Export Generation
```javascript
class ExcelExporter {
    constructor() {
        this.workbook = new ExcelJS.Workbook();
        this.styles = new ExcelStyles();
    }
    
    async exportData(type, filters, format) {
        // 1. Fetch data
        const data = await this.fetchData(type, filters);
        
        // 2. Create workbook
        const wb = this.createWorkbook(type);
        
        // 3. Add data
        const ws = wb.addWorksheet('Data');
        this.addHeaders(ws, type);
        this.addData(ws, data);
        this.applyStyles(ws);
        
        // 4. Add summary sheet
        if (type === 'financial') {
            this.addSummarySheet(wb, data);
        }
        
        // 5. Generate file
        const buffer = await wb.xlsx.writeBuffer();
        return {
            filename: this.generateFilename(type),
            buffer: buffer,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
    }
    
    applyStyles(worksheet) {
        // Header styling
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF3B82F6' }
        };
        
        // Auto-fit columns
        worksheet.columns.forEach(column => {
            column.width = Math.max(column.header.length + 2, 15);
        });
        
        // Freeze panes
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    }
}
```

## UI Components

### Import Modal
```html
<div class="import-modal glass-modal">
    <div class="modal-header">
        <h3>Import Data Excel</h3>
    </div>
    
    <div class="import-steps">
        <div class="step active">
            <span class="step-number">1</span>
            <span class="step-name">Upload</span>
        </div>
        <div class="step">
            <span class="step-number">2</span>
            <span class="step-name">Preview</span>
        </div>
        <div class="step">
            <span class="step-number">3</span>
            <span class="step-name">Import</span>
        </div>
    </div>
    
    <div class="step-content">
        <!-- Step 1: Upload -->
        <div class="upload-section">
            <div class="drop-zone">
                <i class="material-icons">cloud_upload</i>
                <p>Drag & drop Excel file here</p>
                <input type="file" accept=".xlsx,.xls,.csv" hidden>
                <button class="glass-button">Choose File</button>
            </div>
            
            <div class="template-download">
                <p>Need a template?</p>
                <button class="download-template">
                    <i class="material-icons">download</i>
                    Download Template
                </button>
            </div>
        </div>
        
        <!-- Step 2: Preview -->
        <div class="preview-section" style="display:none;">
            <div class="import-summary">
                <div class="summary-card success">
                    <h4>Valid Records</h4>
                    <p class="count">95</p>
                </div>
                <div class="summary-card error">
                    <h4>Errors</h4>
                    <p class="count">5</p>
                </div>
            </div>
            
            <div class="preview-table">
                <table class="glass-table">
                    <!-- Preview data -->
                </table>
            </div>
            
            <div class="error-list">
                <h4>Errors Found</h4>
                <!-- Error details -->
            </div>
        </div>
    </div>
</div>
```

### Export Configuration
```html
<div class="export-config glass-card">
    <h3>Export Data</h3>
    
    <div class="export-options">
        <div class="option-group">
            <label>Data Type</label>
            <select class="glass-select">
                <option>All Jamaah</option>
                <option>Jamaah by Package</option>
                <option>Payment Summary</option>
                <option>Custom Report</option>
            </select>
        </div>
        
        <div class="option-group">
            <label>Filters</label>
            <div class="filter-tags">
                <span class="filter-tag">Package: Ramadhan 2024</span>
                <span class="filter-tag">Status: Active</span>
                <button class="add-filter">+ Add Filter</button>
            </div>
        </div>
        
        <div class="option-group">
            <label>Columns</label>
            <div class="column-selector">
                <!-- Checkbox list of columns -->
            </div>
        </div>
        
        <div class="option-group">
            <label>Format</label>
            <div class="format-options">
                <label class="radio-option">
                    <input type="radio" name="format" value="excel" checked>
                    <span>Excel (.xlsx)</span>
                </label>
                <label class="radio-option">
                    <input type="radio" name="format" value="csv">
                    <span>CSV (.csv)</span>
                </label>
                <label class="radio-option">
                    <input type="radio" name="format" value="pdf">
                    <span>PDF (.pdf)</span>
                </label>
            </div>
        </div>
    </div>
    
    <div class="export-actions">
        <button class="glass-button">
            <i class="material-icons">download</i>
            Export
        </button>
    </div>
</div>
```

## Best Practices

### For Import
1. **Always use templates**
   - Reduces errors
   - Ensures consistency
   - Speeds up process

2. **Validate before import**
   - Check duplicates
   - Verify references
   - Review errors

3. **Import in batches**
   - 500-1000 records per batch
   - Monitor performance
   - Handle errors gracefully

4. **Backup before import**
   - Create restore point
   - Document changes
   - Test with small dataset

### For Export
1. **Optimize queries**
   - Use pagination
   - Limit columns
   - Add indexes

2. **Format appropriately**
   - Headers and footers
   - Consistent styling
   - Clear labeling

3. **Security considerations**
   - Remove sensitive data
   - Add watermarks
   - Track downloads

## Advanced Features

### Column Mapping
```javascript
const columnMapping = {
    auto: {
        detection: "Smart header matching",
        suggestions: "Based on data patterns",
        learning: "Remember user preferences"
    },
    manual: {
        dragDrop: "Visual mapping interface",
        preview: "Live data preview",
        validation: "Real-time checking"
    },
    templates: {
        save: "Save mapping templates",
        share: "Share with team",
        versioning: "Track changes"
    }
};
```

### Data Transformation
```javascript
const transformations = {
    cleaning: [
        "Trim whitespace",
        "Remove special characters",
        "Standardize formats"
    ],
    enrichment: [
        "Add calculated fields",
        "Lookup references",
        "Apply business rules"
    ],
    validation: [
        "Cross-field validation",
        "Business rule checking",
        "Duplicate detection"
    ]
};
```

## Performance Optimization

### Large File Handling
```javascript
const largeFileStrategy = {
    streaming: "Process file in chunks",
    pagination: "Load data progressively",
    background: "Process asynchronously",
    caching: "Store processed results",
    compression: "Reduce file size"
};
```

### Export Optimization
- Query optimization
- Lazy loading
- Streaming writes
- Memory management
- Progress tracking

## Error Recovery

### Import Rollback
```javascript
class ImportRollback {
    async createCheckpoint() {
        // Save current state
        return await this.backup.create();
    }
    
    async rollback(checkpointId) {
        // Restore to checkpoint
        return await this.backup.restore(checkpointId);
    }
    
    async partialRollback(recordIds) {
        // Rollback specific records only
        return await this.backup.restoreRecords(recordIds);
    }
}
```

## Integration Points

### With Other Modules
1. **Jamaah Management**
   - Direct import
   - Update existing
   - Family linking

2. **Payment System**
   - Bulk payments
   - Reconciliation
   - Receipt generation

3. **Document Management**
   - Status updates
   - Bulk verification
   - Missing documents

4. **Reporting**
   - Custom exports
   - Scheduled reports
   - Data feeds

## Future Enhancements

### 1. AI-Powered Import
- Intelligent mapping
- Error prediction
- Auto-correction
- Pattern learning

### 2. Real-time Collaboration
- Multi-user imports
- Conflict resolution
- Change tracking
- Approval workflow

### 3. Advanced Analytics
- Import statistics
- Error patterns
- Performance metrics
- Usage analytics

### 4. API Integration
- Direct bank imports
- Government databases
- Third-party systems
- Cloud storage