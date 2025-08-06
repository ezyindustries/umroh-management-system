# Package Management System Documentation

## Overview
Sistem manajemen paket umroh yang komprehensif untuk mengelola semua aspek paket perjalanan umroh, termasuk jadwal, akomodasi, penerbangan, harga, dan kapasitas. Sistem ini terintegrasi dengan modul Jamaah, Hotel, dan Flight Management.

## Table of Contents
1. [Features](#features)
2. [Frontend Implementation](#frontend-implementation)
3. [Backend API](#backend-api)
4. [Database Structure](#database-structure)
5. [Integration Points](#integration-points)
6. [User Interface](#user-interface)
7. [Technical Details](#technical-details)

## Features

### Core Features
1. **Package CRUD Operations**
   - Create new packages with comprehensive details
   - Edit existing packages
   - Delete packages (with jamaah validation)
   - Duplicate packages for quick creation

2. **Package Information Management**
   - Basic info (name, code, description)
   - Schedule (departure/return dates)
   - Pricing and payment terms
   - Capacity and availability tracking
   - Hotel details (Makkah & Madinah)
   - Flight information and PNR tracking

3. **Advanced Features**
   - Auto-generation of package codes
   - Real-time capacity tracking
   - Integration with hotel booking system
   - Flight/PNR management
   - Multiple image uploads
   - Package statistics and reports

## Frontend Implementation

### JavaScript Functions

#### 1. Display Functions
```javascript
// Load and display all packages in grid view
async function loadPackageCards() {
    const container = document.getElementById('packageGrid');
    container.innerHTML = '<div>Loading packages...</div>';
    
    try {
        const response = await fetch(getApiBaseUrl() + '/api/packages');
        const result = await response.json();
        
        if (result.success) {
            displayPackageCards(result.data);
        }
    } catch (error) {
        console.error('Error loading packages:', error);
    }
}

// View detailed package information
async function viewPackageDetails(id) {
    const response = await fetch(getApiBaseUrl() + `/api/packages/${id}`);
    const package = await response.json();
    // Display in modal
}
```

#### 2. CRUD Operations
```javascript
// Open modal for creating new package
function openPackageModal() {
    clearPackageForm();
    loadPackageFormData(); // Load saved draft if any
    $('#packageModal').modal('show');
}

// Save package (create or update)
async function savePackage(event) {
    event.preventDefault();
    
    const packageData = {
        kode_paket: document.getElementById('packageCode').value,
        nama_paket: document.getElementById('packageName').value,
        price: document.getElementById('packagePrice').value,
        tanggal_berangkat: document.getElementById('packageDeparture').value,
        tanggal_pulang: document.getElementById('packageReturn').value,
        kuota: document.getElementById('packageQuota').value,
        hotel_makkah: document.getElementById('packageMakkahHotel').value,
        hotel_madinah: document.getElementById('packageMadinahHotel').value,
        // ... other fields
    };
    
    const url = editingPackageId 
        ? `/api/packages/${editingPackageId}`
        : '/api/packages';
    
    const method = editingPackageId ? 'PUT' : 'POST';
    
    const response = await fetch(getApiBaseUrl() + url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageData)
    });
}

// Edit existing package
async function editPackage(id) {
    const response = await fetch(getApiBaseUrl() + `/api/packages/${id}`);
    const package = await response.json();
    
    // Populate form fields
    document.getElementById('packageName').value = package.name;
    document.getElementById('packageCode').value = package.code;
    // ... populate other fields
    
    editingPackageId = id;
    $('#packageModal').modal('show');
}

// Delete package
async function deletePackage(id) {
    if (confirm('Yakin ingin menghapus paket ini?')) {
        const response = await fetch(getApiBaseUrl() + `/api/packages/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Paket berhasil dihapus', 'success');
            loadPackageCards();
        }
    }
}
```

#### 3. Form Management
```javascript
// Save form data to localStorage (auto-save draft)
function savePackageFormData() {
    const formData = {
        packageName: document.getElementById('packageName').value,
        packageCode: document.getElementById('packageCode').value,
        // ... all other fields
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('packageFormData', JSON.stringify(formData));
}

// Load saved form data
function loadPackageFormData() {
    const savedData = localStorage.getItem('packageFormData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        document.getElementById('packageName').value = formData.packageName || '';
        // ... restore other fields
    }
}

// Clear form data
function clearPackageFormData() {
    if (confirm('Hapus semua data yang telah diisi?')) {
        clearPackageForm();
        localStorage.removeItem('packageFormData');
    }
}
```

#### 4. Flight Management Integration
```javascript
// Load packages for flight management
async function loadSimpleFlightPackages() {
    const container = document.getElementById('flight-package-list');
    const response = await fetch(getApiBaseUrl() + '/api/packages');
    const packages = await response.json();
    
    // Display packages with PNR focus
    packages.data.forEach(pkg => {
        const hasPNR = pkg.pnr_code ? true : false;
        // Create flight-focused package cards
    });
}

// Edit PNR information
async function editPackagePNR(packageId) {
    const response = await fetch(getApiBaseUrl() + `/api/packages/${packageId}`);
    const package = await response.json();
    
    // Open PNR edit modal
    document.getElementById('pnrCode').value = package.pnr_code || '';
    document.getElementById('ticketVendor').value = package.ticket_vendor || '';
    // ... other PNR fields
}
```

#### 5. Integration Functions
```javascript
// Load packages for other modules
async function loadPackagesForJamaahForm() {
    const response = await fetch(getApiBaseUrl() + '/api/packages');
    const result = await response.json();
    
    const select = document.getElementById('jamaahPackage');
    select.innerHTML = '<option value="">Pilih paket umroh</option>';
    
    result.data.forEach(pkg => {
        const option = document.createElement('option');
        option.value = pkg.id;
        option.textContent = pkg.kode_paket || pkg.code;
        select.appendChild(option);
    });
}

// Load packages for hotel booking
function loadPackagesForHotelForm() {
    // Similar implementation for hotel module
}
```

#### 6. Utility Functions
```javascript
// Generate package code
function generateKodePaket(tahun, jumlahHari, kotaAsal, bulanTanggal) {
    const kotaCode = kotaAsal.substring(0, 3).toUpperCase();
    return `#${tahun}_${jumlahHari}H_${kotaCode}_${bulanTanggal}`;
}

// Handle city selection changes
function handleCitySelectChange(select, type) {
    if (select.value === 'add_new') {
        const newCity = prompt('Masukkan nama kota baru:');
        if (newCity) {
            const option = document.createElement('option');
            option.value = newCity;
            option.textContent = newCity;
            select.insertBefore(option, select.lastElementChild);
            select.value = newCity;
        }
    }
}
```

## Backend API

### API Endpoints

#### 1. Package Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/packages` | Get all packages with filters |
| GET | `/api/packages/:id` | Get package by ID |
| POST | `/api/packages` | Create new package |
| PUT | `/api/packages/:id` | Update package |
| DELETE | `/api/packages/:id` | Delete package |

#### 2. Package Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/packages/statistics` | Get package statistics |
| GET | `/api/packages/available` | Get available packages |
| GET | `/api/packages/popular` | Get popular packages |
| GET | `/api/packages/occupancy-report` | Get occupancy report |
| GET | `/api/packages/date-range` | Get packages by date range |
| GET | `/api/packages/:id/jamaah` | Get package with jamaah list |
| GET | `/api/packages/:id/capacity` | Check package capacity |
| POST | `/api/packages/:id/duplicate` | Duplicate a package |
| PATCH | `/api/packages/:id/toggle-status` | Toggle package status |
| PATCH | `/api/packages/:id/update-capacity` | Update capacity |
| PUT | `/api/packages/:id/flight-info` | Update flight information |

### Request/Response Examples

#### Create Package
```javascript
// Request
POST /api/packages
{
    "kode_paket": "#2024_12H_JKT_1505",
    "nama_paket": "Umroh Ramadhan 12 Hari",
    "price": 35000000,
    "tanggal_berangkat": "2024-05-15",
    "tanggal_pulang": "2024-05-27",
    "kuota": 45,
    "hotel_makkah": "Hilton Suites Makkah",
    "hotel_madinah": "Anwar Al Madinah Movenpick",
    "malam_makkah": 7,
    "malam_madinah": 4,
    "maskapai": "Saudi Airlines",
    "kota_keberangkatan": "Jakarta",
    "kota_tiba": "Madinah",
    "deskripsi_singkat": "Paket umroh premium Ramadhan"
}

// Response
{
    "success": true,
    "message": "Paket berhasil dibuat",
    "data": {
        "id": 1,
        "code": "#2024_12H_JKT_1505",
        "name": "Umroh Ramadhan 12 Hari",
        // ... other fields
    }
}
```

#### Get Packages with Filters
```javascript
// Request
GET /api/packages?search=ramadhan&is_active=true&page=1&limit=10

// Response
{
    "success": true,
    "data": [...],
    "pagination": {
        "current_page": 1,
        "per_page": 10,
        "total": 25,
        "total_pages": 3
    }
}
```

## Database Structure

### core.packages Table
```sql
CREATE TABLE IF NOT EXISTS core.packages (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Basic Information
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    description TEXT,
    
    -- Schedule
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    
    -- Capacity Management
    quota INT NOT NULL DEFAULT 0,
    max_capacity INTEGER,
    current_capacity INTEGER DEFAULT 0,
    
    -- Accommodation Details
    makkah_hotel VARCHAR(255),
    madinah_hotel VARCHAR(255),
    makkah_nights INT DEFAULT 0,
    madinah_nights INT DEFAULT 0,
    
    -- Flight Information
    airline VARCHAR(100),
    departure_city VARCHAR(100),
    transit_city_departure VARCHAR(100),
    arrival_city VARCHAR(100),
    departure_flight_number VARCHAR(50),
    return_departure_city VARCHAR(100),
    transit_city_return VARCHAR(100),
    return_arrival_city VARCHAR(100),
    return_flight_number VARCHAR(50),
    flight_info TEXT,
    
    -- PNR/Ticket Management
    pnr_code VARCHAR(50),
    ticket_vendor VARCHAR(100),
    ticket_number VARCHAR(100),
    flight_payment_status VARCHAR(50),
    flight_notes TEXT,
    payment_due_date DATE,
    insert_name_deadline DATE,
    ticket_total_price DECIMAL(15,2),
    ticket_paid_amount DECIMAL(15,2),
    
    -- Media
    brochure_image VARCHAR(255),
    package_info TEXT,
    package_images JSONB,
    
    -- Status & Metadata
    status VARCHAR(20) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_packages_departure_date ON core.packages(departure_date);
CREATE INDEX idx_packages_status ON core.packages(status);
CREATE INDEX idx_packages_code ON core.packages(code);
```

### Related Tables

#### hotel_bookings (Auto-created)
```sql
CREATE TABLE hotel_bookings (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES core.packages(id),
    hotel_name VARCHAR(255),
    hotel_city VARCHAR(50), -- 'makkah' or 'madinah'
    nights INTEGER,
    check_in_date DATE,
    check_out_date DATE,
    booking_status VARCHAR(50),
    payment_status VARCHAR(50),
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Integration Points

### 1. Jamaah Management Integration
- Packages are referenced in jamaah registration
- Package capacity is automatically updated when jamaah is added/removed
- Package dropdown in Jamaah form shows only package codes

### 2. Hotel Management Integration
- When a package is created, hotel bookings are automatically created
- Hotel bookings reference the package_id
- Hotel information is stored in both package and hotel_bookings tables

### 3. Flight Management Integration
- PNR tracking integrated into package management
- Flight statistics dashboard shows packages with/without PNR
- Dedicated flight info update endpoint

### 4. Payment Integration
- Package price is used for payment calculations
- Payment status affects package availability

## User Interface

### 1. Package Grid View
- Glassmorphism card design
- Shows key information: name, dates, price, capacity
- Quick actions: View, Edit, Delete
- Visual capacity indicator

### 2. Package Modal
- Multi-section form with organized layout
- Sections: Basic Info, Hotel & Accommodation, Flight Details, Media
- Auto-save functionality
- Clear form button
- Validation on all required fields

### 3. Package Detail View
- Comprehensive information display
- Jamaah list associated with package
- Flight and hotel booking status
- Action buttons for management

### 4. Flight Management View
- Simplified view focused on PNR tracking
- Quick PNR edit functionality
- Filter by PNR status
- Bulk PNR update capability

## Technical Details

### Model Methods (Package.js)

#### CRUD Operations
```javascript
class Package {
    // Create package with validation
    static async create(packageData, createdBy) {
        const { error, value } = this.getValidationSchema().validate(packageData);
        if (error) throw new Error(`Validation error: ${error.details[0].message}`);
        
        // Insert package
        const result = await query(`INSERT INTO core.packages...`);
        
        // Auto-create hotel bookings
        await this.createHotelBookings(result.rows[0].id, value);
        
        return result.rows[0];
    }
    
    // Find with filters and pagination
    static async findAll(filters = {}, page = 1, limit = 50) {
        let whereConditions = ['1=1'];
        let values = [];
        
        if (filters.search) {
            whereConditions.push(`(code ILIKE $1 OR name ILIKE $1)`);
            values.push(`%${filters.search}%`);
        }
        
        // Build query with pagination
        const result = await query(sql, values);
        return { data: result.rows, pagination: {...} };
    }
    
    // Update with validation
    static async update(id, updateData) {
        const package = await this.findById(id);
        if (!package) throw new Error('Package not found');
        
        const { error, value } = this.getValidationSchema().validate(updateData);
        if (error) throw new Error(`Validation error: ${error.details[0].message}`);
        
        // Update package
        const result = await query(`UPDATE core.packages SET...`);
        return result.rows[0];
    }
}
```

#### Specialized Methods
```javascript
// Get package statistics
static async getStatistics() {
    const result = await query(`
        SELECT 
            COUNT(*) as total_packages,
            COUNT(CASE WHEN is_active = true THEN 1 END) as active_packages,
            AVG(price) as average_price,
            SUM(max_capacity) as total_capacity,
            SUM(current_capacity) as total_occupied
        FROM core.packages
    `);
    return result.rows[0];
}

// Update seat availability
static async updateSeatAvailability(id) {
    const result = await query(`
        UPDATE core.packages 
        SET current_capacity = (
            SELECT COUNT(*) FROM jamaah.jamaah_data 
            WHERE package_id = $1 AND status != 'cancelled'
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
    `, [id]);
    return result.rows[0];
}
```

### Validation Schema
```javascript
static getValidationSchema() {
    return Joi.object({
        // Required fields
        kode_paket: Joi.string().max(50).required(),
        nama_paket: Joi.string().max(255).required(),
        tanggal_berangkat: Joi.date().required(),
        tanggal_pulang: Joi.date().required(),
        kuota: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required(),
        hotel_makkah: Joi.string().max(255).required(),
        hotel_madinah: Joi.string().max(255).required(),
        maskapai: Joi.string().max(100).required(),
        malam_makkah: Joi.number().integer().min(1).required(),
        malam_madinah: Joi.number().integer().min(1).required(),
        
        // Optional fields
        deskripsi_singkat: Joi.string().max(2000).allow('', null),
        informasi_detail: Joi.string().allow('', null),
        gambar_utama: Joi.string().allow('', null),
        gambar_tambahan: Joi.array().items(Joi.string()).allow(null),
        
        // Flight details (optional)
        kota_keberangkatan: Joi.string().max(100).allow('', null),
        transit_berangkat: Joi.string().max(100).allow('', null),
        kota_tiba: Joi.string().max(100).allow('', null),
        // ... other optional fields
    });
}
```

### Security & Best Practices

1. **Input Validation**
   - All inputs validated using Joi schema
   - SQL injection prevention through parameterized queries
   - XSS prevention through proper escaping

2. **Error Handling**
   - Comprehensive try-catch blocks
   - Meaningful error messages
   - Proper HTTP status codes

3. **Performance Optimization**
   - Database indexes on frequently queried fields
   - Pagination for large datasets
   - Efficient query construction

4. **Data Integrity**
   - Foreign key constraints
   - Capacity validation
   - Soft delete for audit trail

## Future Enhancements

1. **Package Templates**
   - Save package as template
   - Quick creation from templates
   - Template categories

2. **Advanced Pricing**
   - Dynamic pricing based on demand
   - Early bird discounts
   - Group pricing

3. **Package Comparison**
   - Side-by-side comparison
   - Feature matrix
   - Price comparison

4. **Analytics Dashboard**
   - Revenue analytics
   - Occupancy trends
   - Popular routes
   - Seasonal patterns

5. **API Enhancements**
   - GraphQL endpoint
   - Webhook notifications
   - Bulk operations
   - Export capabilities