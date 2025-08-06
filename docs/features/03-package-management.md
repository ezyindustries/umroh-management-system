# Package Management Feature Documentation

## Overview
Package Management mengelola paket-paket umroh yang ditawarkan, termasuk harga, fasilitas, jadwal keberangkatan, dan kuota. Sistem ini terintegrasi dengan hotel booking otomatis dan manajemen grup.

## Features

### 1. Package Grid View
Menampilkan paket dalam format card grid dengan:

#### Card Information:
- Package image/brochure
- Package name & code
- Price (formatted IDR)
- Departure & return dates
- Duration (days/nights)
- Available quota
- Hotel stars
- Airlines
- Status badge

#### Card Actions:
- View details
- Edit package
- Manage quota
- View bookings
- Duplicate package
- Archive/Delete

### 2. Add/Edit Package Modal
Comprehensive form dengan multiple sections:

#### a. Informasi Dasar
- **Nama Paket**: Required, unique
- **Kode Paket**: Auto-generated or manual
- **Harga**: Currency input with formatting
- **Tanggal Keberangkatan**: Date picker
- **Tanggal Kembali**: Date picker
- **Kuota**: Number input
- **Maskapai**: Dynamic select
- **Status**: Active/Inactive/Sold Out

#### b. Hotel & Akomodasi
- **Hotel Makkah**: 
  - Nama hotel
  - Bintang (1-5)
  - Jarak ke Masjidil Haram
  - Jumlah malam
- **Hotel Madinah**:
  - Nama hotel  
  - Bintang (1-5)
  - Jarak ke Masjid Nabawi
  - Jumlah malam

#### c. Fasilitas & Layanan
- **Transportasi**:
  - Bus AC/Non-AC
  - Kereta cepat Haramain
  - Private transfer
- **Makanan**:
  - 3x sehari
  - Prasmanan/Box
  - Menu Indonesia/Arab
- **Fasilitas Lain**:
  - Visa processing
  - Travel insurance
  - Perlengkapan ibadah
  - Tour guide
  - Ziarah tambahan

#### d. Jadwal & Itinerary
- **Kegiatan Harian**: 
  - Waktu dan aktivitas
  - Lokasi
  - Keterangan
- **Template**: Load from previous package

#### e. Syarat & Ketentuan
- **Persyaratan Dokumen**: Checklist
- **Ketentuan Pembayaran**: Text area
- **Kebijakan Pembatalan**: Text area
- **Catatan Khusus**: Text area

#### f. Media & Dokumen
- **Brosur/Gambar Utama**: Single image upload
- **Gambar Tambahan**: Multiple images
- **Video URL**: YouTube/Vimeo link
- **PDF Itinerary**: File upload

### 3. Package Detail Modal
Beautiful glassmorphism modal showing:
- Hero image with overlay info
- Price and date prominently displayed
- Facilities in icon grid
- Hotel information cards
- Itinerary timeline
- Terms & conditions
- Booking statistics
- Share buttons

### 4. Package Templates
Pre-defined templates for quick creation:
- Umroh Reguler 9 Hari
- Umroh Ramadhan 14 Hari
- Umroh Plus Turki
- Umroh VIP 12 Hari
- Custom template save

### 5. Quota Management
Real-time quota tracking:
- Total quota
- Booked seats
- Available seats
- Waiting list
- Visual seat map
- Auto-close when full

## Technical Implementation

### Frontend Components

#### JavaScript Functions:
```javascript
// Main functions
loadPackageCards()        // Load package grid
openPackageModal()        // Open add/edit modal
savePackage(event)        // Save package data
editPackage(id)          // Load package for editing
deletePackage(id)        // Archive package
viewPackageDetails(id)   // Show detail modal
duplicatePackage(id)     // Clone package

// Utility functions
calculateDuration()      // Auto-calculate days
formatCurrency()         // Format price display
validateDates()          // Check date logic
updateQuotaDisplay()     // Real-time quota
previewImages()          // Show image previews
generatePackageCode()    // Auto-generate code
```

#### Package Card Template:
```html
<div class="package-card glass-card">
    <div class="package-image">
        <img src="" alt="">
        <div class="package-badge">Best Seller</div>
    </div>
    <div class="package-content">
        <h3>Package Name</h3>
        <div class="package-price">Rp 25,000,000</div>
        <div class="package-info">
            <span><i class="material-icons">event</i> 15 Mar 2024</span>
            <span><i class="material-icons">schedule</i> 9 Hari</span>
            <span><i class="material-icons">airline_seat</i> 45/100</span>
        </div>
        <div class="package-facilities">
            <!-- Facility icons -->
        </div>
        <div class="package-actions">
            <button>View Details</button>
            <button>Edit</button>
        </div>
    </div>
</div>
```

### Backend API

#### Endpoints:

1. **GET /api/packages**
   - Query params: status, dateFrom, dateTo, search
   - Returns: Package list with basic info

2. **GET /api/packages/:id**
   - Returns: Complete package details

3. **POST /api/packages**
   - Body: Package data
   - Auto-creates: Hotel bookings
   - Returns: Created package

4. **PUT /api/packages/:id**
   - Body: Updated data
   - Updates: Related bookings
   - Returns: Updated package

5. **DELETE /api/packages/:id**
   - Soft delete with validation
   - Check: Active bookings
   - Returns: Success/error

6. **GET /api/packages/:id/bookings**
   - Returns: Jamaah list for package

7. **POST /api/packages/:id/duplicate**
   - Creates: New package copy
   - Returns: New package ID

### Database Schema

#### Main Table: core.packages
```sql
CREATE TABLE core.packages (
    id SERIAL PRIMARY KEY,
    kode_paket VARCHAR(50) UNIQUE NOT NULL,
    nama_paket VARCHAR(255) NOT NULL,
    harga DECIMAL(12,2) NOT NULL,
    tanggal_keberangkatan DATE NOT NULL,
    tanggal_kembali DATE NOT NULL,
    durasi_hari INTEGER GENERATED ALWAYS AS (
        tanggal_kembali - tanggal_keberangkatan + 1
    ) STORED,
    kuota INTEGER NOT NULL DEFAULT 45,
    kuota_terpakai INTEGER DEFAULT 0,
    maskapai VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    -- Hotel Information
    hotel_makkah VARCHAR(255),
    bintang_makkah INTEGER CHECK (bintang_makkah BETWEEN 1 AND 5),
    jarak_makkah VARCHAR(100),
    malam_makkah INTEGER,
    hotel_madinah VARCHAR(255),
    bintang_madinah INTEGER CHECK (bintang_madinah BETWEEN 1 AND 5),
    jarak_madinah VARCHAR(100),
    malam_madinah INTEGER,
    -- Media
    gambar_utama TEXT,
    gambar_tambahan JSONB,
    video_url TEXT,
    pdf_itinerary TEXT,
    -- Content
    fasilitas JSONB,
    itinerary JSONB,
    syarat_ketentuan TEXT,
    ketentuan_pembayaran TEXT,
    kebijakan_pembatalan TEXT,
    catatan_khusus TEXT,
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER,
    updated_by INTEGER,
    deleted_at TIMESTAMP
);
```

#### Related Tables:
```sql
-- Package facilities mapping
CREATE TABLE core.package_facilities (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES core.packages(id),
    facility_type VARCHAR(50),
    facility_name VARCHAR(255),
    facility_detail TEXT,
    is_included BOOLEAN DEFAULT TRUE
);

-- Package itinerary
CREATE TABLE core.package_itinerary (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES core.packages(id),
    day_number INTEGER,
    time VARCHAR(20),
    activity VARCHAR(255),
    location VARCHAR(255),
    notes TEXT,
    order_sequence INTEGER
);
```

### Auto Hotel Booking

When package is created, system automatically:
1. Creates hotel booking for Makkah
2. Creates hotel booking for Madinah
3. Links bookings to package
4. Sets check-in/out dates
5. Allocates room quota

```javascript
async function createHotelBookingsForPackage(package) {
    // Makkah booking
    if (package.hotel_makkah) {
        await createHotelBooking({
            package_id: package.id,
            city: 'Makkah',
            hotel_name: package.hotel_makkah,
            check_in: package.tanggal_keberangkatan,
            check_out: addDays(package.tanggal_keberangkatan, package.malam_makkah),
            nights: package.malam_makkah,
            total_rooms: Math.ceil(package.kuota / 4)
        });
    }
    // Similar for Madinah
}
```

## UI/UX Features

### Visual Design:
1. **Card Layout**:
   - Image-first design
   - Hover animations
   - Status indicators
   - Progress bars for quota

2. **Modal Design**:
   - Step-by-step sections
   - Collapsible panels
   - Visual previews
   - Drag-drop uploads

3. **Responsive**:
   - Mobile: 1 card per row
   - Tablet: 2 cards per row
   - Desktop: 3-4 cards per row

### Smart Features:
1. **Auto-calculations**:
   - Duration from dates
   - Price per day
   - Room requirements
   - Visa processing time

2. **Validations**:
   - Date logic checks
   - Quota vs bookings
   - Image size limits
   - Required facilities

## Package Templates System

### Template Structure:
```json
{
    "name": "Umroh Reguler 9 Hari",
    "duration": 9,
    "facilities": {
        "transport": ["Bus AC", "Haramain"],
        "meals": ["3x Sehari", "Prasmanan"],
        "others": ["Visa", "Asuransi", "Perlengkapan"]
    },
    "hotels": {
        "makkah": {
            "stars": 4,
            "distance": "300m",
            "nights": 4
        },
        "madinah": {
            "stars": 4,
            "distance": "200m", 
            "nights": 4
        }
    },
    "itinerary": [...]
}
```

## Pricing Management

### Dynamic Pricing Features:
1. **Base Price**: Standard package price
2. **Seasonal Adjustments**: Ramadhan premium
3. **Group Discounts**: Bulk booking rates
4. **Early Bird**: Advance booking discount
5. **Room Upgrades**: Double/Triple pricing

### Price Calculation:
```javascript
function calculateFinalPrice(package, options) {
    let price = package.harga;
    
    // Seasonal adjustment
    if (isRamadhan(package.tanggal_keberangkatan)) {
        price *= 1.3; // 30% premium
    }
    
    // Room type adjustment
    if (options.roomType === 'double') {
        price *= 1.2; // 20% extra
    }
    
    // Group discount
    if (options.groupSize >= 20) {
        price *= 0.95; // 5% discount
    }
    
    return price;
}
```

## Integration Points

### 1. Jamaah Management:
- Package selection in registration
- Quota updates on booking
- Package info display

### 2. Payment System:
- Package price reference
- Installment calculation
- Payment deadline from departure

### 3. Group Management:
- Auto-group creation
- Package-based grouping
- Departure management

### 4. Document System:
- Package-specific requirements
- Document checklist
- Visa timeline

### 5. Hotel Management:
- Auto-booking creation
- Room allocation
- Hotel info sync

## Performance Optimization

1. **Image Optimization**:
   - Lazy loading
   - WebP format
   - Thumbnail generation
   - CDN delivery

2. **Data Caching**:
   - Package list cache
   - Static content CDN
   - Redis for quotas
   - Browser cache

3. **Query Optimization**:
   - Indexed searches
   - Eager loading
   - Query result cache
   - Pagination

## Future Enhancements

### Planned Features:
1. **Dynamic Packaging**:
   - Mix-match hotels
   - Custom itinerary
   - À la carte pricing
   - Build your own

2. **Revenue Management**:
   - Demand forecasting
   - Dynamic pricing
   - Yield optimization
   - Competitor analysis

3. **Marketing Tools**:
   - Landing pages
   - Promo codes
   - Affiliate tracking
   - Social sharing

4. **Advanced Features**:
   - Virtual tours
   - 360° hotel views
   - Weather integration
   - Flight tracking
   - Currency converter

### Suggested Improvements:
1. Add package comparison tool
2. Implement wishlist feature
3. Create package reviews/ratings
4. Add photo gallery per package
5. Implement package availability calendar
6. Add cost breakdown transparency
7. Create package recommendation engine
8. Add multi-language descriptions
9. Implement package bundling options
10. Add seasonal package automation