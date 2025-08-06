# Hotel Management Feature Documentation

## Overview
Hotel Management mengelola seluruh aspek akomodasi jamaah di Makkah dan Madinah, termasuk booking otomatis, room allocation, dan koordinasi dengan hotel. Sistem terintegrasi dengan package management untuk auto-booking.

## Features

### 1. Hotel Dashboard
Modern glassmorphism dashboard dengan statistik real-time:

#### Hero Section:
- Gradient background dengan pattern islami
- Animated statistics cards
- Quick action buttons
- Search functionality

#### Statistics Cards:
1. **Total Bookings**:
   - Icon: hotel
   - Color: Blue gradient
   - Shows: Active bookings count
   - Animation: Counter animation

2. **Occupied Rooms**:
   - Icon: meeting_room
   - Color: Green gradient
   - Shows: Currently occupied
   - Animation: Pulse effect

3. **Total Nights**:
   - Icon: nightlight
   - Color: Purple gradient
   - Shows: Total booked nights
   - Animation: Gradient shift

4. **Pending Confirmations**:
   - Icon: pending_actions
   - Color: Orange gradient
   - Shows: Awaiting confirmation
   - Animation: Bounce effect

### 2. Booking Cards Grid
Modern card design dengan glassmorphism:

#### Card Layout:
- **Size**: Perfect square (aspect-ratio: 1)
- **Grid**: 3 cards per row (desktop), responsive
- **Style**: Glass morphism with blur effect
- **Animation**: Smooth hover transitions

#### Card Information:
- **Header Section**:
  - City badge (Makkah/Madinah)
  - Days countdown (H-XX)
  - Status indicator

- **Hotel Details**:
  - Hotel name (prominent)
  - Star rating display
  - Distance to Haram
  - Room type icons

- **Booking Info**:
  - Check-in/out dates
  - Number of nights
  - Total rooms
  - Guest capacity

- **Financial Status**:
  - Total amount
  - Paid amount
  - Balance with percentage

- **Action Buttons**:
  - View details
  - Edit booking
  - Print voucher

### 3. Add Hotel Booking Modal
Comprehensive booking form:

#### Form Sections:
1. **Package Selection**:
   - Dynamic dropdown from packages
   - Auto-fill hotel suggestions
   - Package details preview

2. **City Selection**:
   - Radio buttons (Makkah/Madinah)
   - City-specific hotel list
   - Distance information

3. **Hotel Information**:
   - Hotel name input/dropdown
   - Star rating (1-5)
   - Distance to Haram
   - Hotel contact info

4. **Booking Details**:
   - Check-in date
   - Check-out date
   - Number of nights (auto-calculated)
   - Total rooms needed
   - Room types available

5. **Guest Information**:
   - Lead guest name
   - Total guests
   - Special requests
   - Dietary requirements

6. **Provider Details**:
   - Booking provider (Booking.com, Direct, etc.)
   - Confirmation number
   - Contact person
   - Phone number

7. **Financial Information**:
   - Total amount
   - Paid amount
   - Payment status
   - Payment deadline

8. **Additional Notes**:
   - Special arrangements
   - Transportation notes
   - Hotel policies

### 4. Edit Hotel Booking Modal
Similar to add modal with:
- Pre-filled current data
- Change history tracking
- Cancellation options
- Amendment fees

### 5. Hotel Room Allocation
Visual room management:

#### Room Grid View:
- Floor plan layout
- Room status colors
- Drag-drop allocation
- Bulk assignment

#### Room Types:
- Quad (4 persons)
- Triple (3 persons)
- Double (2 persons)
- Single (special cases)

#### Allocation Rules:
- Family grouping
- Gender separation
- Mahram requirements
- Special needs priority

### 6. Hotel Reports
Comprehensive reporting:

#### Report Types:
1. **Rooming List**: By hotel and date
2. **Occupancy Report**: Utilization rates
3. **Financial Summary**: Payments by hotel
4. **Check-in Schedule**: Daily arrivals
5. **Special Requests**: Dietary, accessibility

## Technical Implementation

### Frontend Components

#### JavaScript Functions:
```javascript
// Main functions
loadHotelDashboard()      // Initialize dashboard
loadHotelBookings()       // Load booking cards
openModal(modalId)        // Open add/edit modal
saveHotelBooking(event)   // Save booking data
editHotelBooking(id)      // Load booking for edit
updateBookingStatus(id)   // Change booking status
generateRoomingList(id)   // Create rooming document

// Utility functions
calculateNights()         // Auto-calculate duration
calculateRoomCount()      // Estimate rooms needed
updateDaysCountdown()     // Real-time countdown
formatHotelPrice()        // Currency formatting
validateDates()           // Check-in/out validation
searchHotels()            // Filter hotel list
```

#### Card Component Structure:
```html
<div class="hotel-card">
    <div class="card-header">
        <span class="city-badge">Makkah</span>
        <span class="countdown">H-15</span>
    </div>
    <div class="card-body">
        <h3 class="hotel-name">Swissotel Al Maqam</h3>
        <div class="hotel-details">
            <span class="stars">★★★★★</span>
            <span class="distance">50m from Haram</span>
        </div>
        <div class="booking-info">
            <!-- Dates and rooms -->
        </div>
        <div class="financial-status">
            <!-- Payment progress -->
        </div>
    </div>
    <div class="card-footer">
        <button class="btn-view">View</button>
        <button class="btn-edit">Edit</button>
    </div>
</div>
```

### Backend API

#### Endpoints:

1. **GET /api/hotels/dashboard**
   - Returns: Statistics and summary

2. **GET /api/hotels/bookings**
   - Query: city, status, dateRange
   - Returns: Booking list

3. **GET /api/hotels/bookings/:id**
   - Returns: Complete booking details

4. **POST /api/hotels/bookings**
   - Body: Booking data
   - Process:
     - Validate availability
     - Calculate pricing
     - Create booking record
   - Returns: Created booking

5. **PUT /api/hotels/bookings/:id**
   - Body: Updated data
   - Process:
     - Check modification rules
     - Update records
     - Log changes
   - Returns: Updated booking

6. **POST /api/hotels/bookings/:id/confirm**
   - Body: Confirmation details
   - Returns: Confirmed status

7. **GET /api/hotels/rooms/:bookingId**
   - Returns: Room allocation data

8. **POST /api/hotels/rooms/allocate**
   - Body: Room assignments
   - Returns: Allocation result

### Database Schema

#### Main Table: hotels.hotel_bookings
```sql
CREATE TABLE hotels.hotel_bookings (
    id SERIAL PRIMARY KEY,
    booking_reference VARCHAR(100) UNIQUE,
    package_id INTEGER REFERENCES core.packages(id),
    city VARCHAR(50) NOT NULL, -- Makkah/Madinah
    hotel_name VARCHAR(255) NOT NULL,
    star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
    distance_to_haram VARCHAR(100),
    -- Booking details
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INTEGER GENERATED ALWAYS AS (
        check_out_date - check_in_date
    ) STORED,
    total_rooms INTEGER NOT NULL,
    room_type VARCHAR(50),
    total_guests INTEGER,
    -- Provider information
    booking_provider VARCHAR(100),
    confirmation_number VARCHAR(100),
    contact_person VARCHAR(255),
    phone_number VARCHAR(50),
    -- Financial
    total_amount DECIMAL(12,2),
    paid_amount DECIMAL(12,2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_deadline DATE,
    -- Status
    booking_status VARCHAR(50) DEFAULT 'pending',
    confirmed_at TIMESTAMP,
    confirmed_by INTEGER,
    -- Notes
    special_requests TEXT,
    hotel_notes TEXT,
    internal_notes TEXT,
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
-- Room allocations
CREATE TABLE hotels.room_allocations (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES hotels.hotel_bookings(id),
    room_number VARCHAR(50),
    room_type VARCHAR(50),
    floor_number INTEGER,
    jamaah_ids INTEGER[],
    capacity INTEGER,
    occupied INTEGER,
    special_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Hotel master data
CREATE TABLE hotels.hotel_master (
    id SERIAL PRIMARY KEY,
    hotel_name VARCHAR(255) NOT NULL,
    city VARCHAR(50) NOT NULL,
    star_rating INTEGER,
    distance_meters INTEGER,
    distance_description VARCHAR(100),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    contact_person VARCHAR(255),
    facilities JSONB,
    room_types JSONB,
    meal_options JSONB,
    policies TEXT,
    images JSONB,
    active BOOLEAN DEFAULT TRUE
);

-- Booking amendments
CREATE TABLE hotels.booking_amendments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES hotels.hotel_bookings(id),
    amendment_type VARCHAR(50),
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    amendment_fee DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER
);
```

### Auto-Booking System

When a package is created, the system automatically:

```javascript
async function createAutoHotelBookings(package) {
    const bookings = [];
    
    // Makkah booking
    if (package.hotel_makkah) {
        const makkahBooking = await createHotelBooking({
            package_id: package.id,
            city: 'Makkah',
            hotel_name: package.hotel_makkah,
            star_rating: package.bintang_makkah,
            check_in_date: package.tanggal_keberangkatan,
            check_out_date: addDays(package.tanggal_keberangkatan, package.malam_makkah),
            nights: package.malam_makkah,
            total_rooms: Math.ceil(package.kuota / 4),
            booking_status: 'auto_created'
        });
        bookings.push(makkahBooking);
    }
    
    // Madinah booking
    if (package.hotel_madinah) {
        const madinahCheckIn = addDays(package.tanggal_keberangkatan, package.malam_makkah);
        const madinahBooking = await createHotelBooking({
            package_id: package.id,
            city: 'Madinah',
            hotel_name: package.hotel_madinah,
            star_rating: package.bintang_madinah,
            check_in_date: madinahCheckIn,
            check_out_date: addDays(madinahCheckIn, package.malam_madinah),
            nights: package.malam_madinah,
            total_rooms: Math.ceil(package.kuota / 4),
            booking_status: 'auto_created'
        });
        bookings.push(madinahBooking);
    }
    
    return bookings;
}
```

## UI/UX Features

### Visual Design:

1. **Card Design**:
   - Glassmorphism effect
   - Gradient borders
   - Smooth animations
   - Status indicators
   - Progress bars

2. **Color Coding**:
   - Blue: Makkah bookings
   - Green: Madinah bookings
   - Orange: Pending confirmation
   - Red: Urgent/overdue
   - Purple: Completed

3. **Responsive Layout**:
   - Mobile: 1 card per row
   - Tablet: 2 cards per row
   - Desktop: 3 cards per row
   - Auto-adjust spacing

### Interactive Features:

1. **Quick Actions**:
   - One-click status update
   - Inline editing
   - Drag-drop room allocation
   - Bulk operations

2. **Real-time Updates**:
   - Live countdown
   - Status changes
   - Payment updates
   - Notification badges

3. **Smart Filters**:
   - By city
   - By status
   - By date range
   - By hotel
   - By payment status

## Room Allocation System

### Allocation Algorithm:
```javascript
function allocateRooms(bookingId, jamaahList) {
    const families = groupByFamily(jamaahList);
    const rooms = [];
    
    // Allocate family rooms first
    families.forEach(family => {
        if (family.requestSameRoom) {
            rooms.push({
                type: determineRoomType(family.members.length),
                jamaahIds: family.members.map(m => m.id),
                familyRoom: true
            });
        }
    });
    
    // Allocate remaining by gender and preference
    const unallocated = getUnallocatedJamaah(jamaahList, rooms);
    const males = unallocated.filter(j => j.gender === 'male');
    const females = unallocated.filter(j => j.gender === 'female');
    
    // Group by room preference
    allocateByPreference(males, rooms, 'male');
    allocateByPreference(females, rooms, 'female');
    
    return rooms;
}
```

### Room Management Features:
1. Visual room grid
2. Drag-drop interface
3. Capacity indicators
4. Gender validation
5. Family grouping
6. Special needs flags

## Integration Points

### 1. Package Management:
- Auto-booking on package creation
- Hotel info synchronization
- Room requirement calculation

### 2. Jamaah Management:
- Guest list compilation
- Room preference tracking
- Special requirements

### 3. Payment System:
- Hotel payment tracking
- Deposit management
- Balance monitoring

### 4. Document System:
- Hotel voucher generation
- Rooming list export
- Confirmation letters

### 5. Group Management:
- Group-based allocation
- Collective check-in
- Group transportation

## Reports & Documents

### Generated Documents:
1. **Hotel Voucher**: For hotel check-in
2. **Rooming List**: Room assignments
3. **Special Requests**: Dietary, accessibility
4. **Payment Confirmation**: For hotels
5. **Amendment Notice**: Changes notification

### Report Features:
- PDF generation
- Excel export
- Email distribution
- Multi-language support
- QR code verification

## Performance Optimization

1. **Dashboard Loading**:
   - Cached statistics
   - Lazy loading cards
   - Progressive rendering
   - Background updates

2. **Search Optimization**:
   - Indexed hotel names
   - Cached search results
   - Debounced input
   - Fuzzy matching

3. **Bulk Operations**:
   - Batch processing
   - Queue system
   - Progress tracking
   - Error recovery

## Future Enhancements

### Planned Features:
1. **Hotel API Integration**:
   - Real-time availability
   - Direct booking API
   - Rate comparison
   - Instant confirmation

2. **Advanced Room Management**:
   - 3D floor plans
   - Virtual tours
   - Room photos
   - Amenity tracking

3. **Mobile Features**:
   - Mobile check-in
   - Digital room keys
   - In-app concierge
   - Location services

4. **Analytics**:
   - Occupancy trends
   - Price optimization
   - Preference analysis
   - Satisfaction scores

### Suggested Improvements:
1. Add hotel rating system
2. Implement room upgrade management
3. Create hotel comparison tool
4. Add meal plan management
5. Implement shuttle schedule coordination
6. Add room inspection checklist
7. Create incident reporting system
8. Add lost & found management
9. Implement wake-up call scheduling
10. Add prayer time notifications by room