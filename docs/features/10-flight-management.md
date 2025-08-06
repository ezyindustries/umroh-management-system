# Flight Management Feature Documentation

## Overview
Sistem manajemen penerbangan untuk mengelola booking pesawat, alokasi kursi, tracking PNR, dan koordinasi keberangkatan/kepulangan jamaah umroh.

## Current Implementation Status
⚠️ **UI Implemented** - Backend functionality pending

## User Interface

### Flight Management Page
Halaman modern dengan glassmorphism design untuk manajemen penerbangan.

#### Key Features
1. **Flight Cards Display**
   - Departure & return flight info
   - Real-time countdown (H-XX)
   - PNR tracking
   - Seat allocation progress

2. **PNR Management**
   - Add/Edit PNR codes
   - Track booking status
   - Link to jamaah groups
   - Airline confirmation

3. **Seat Allocation**
   - Visual seat map
   - Drag & drop assignment
   - Family seating preferences
   - Special needs marking

4. **Flight Timeline**
   - Departure schedule
   - Check-in windows
   - Boarding times
   - Gate information

## Flight Booking Workflow

### 1. Initial Booking
```javascript
1. Create flight record for package
2. Input flight details:
   - Airline & flight number
   - Departure/arrival times
   - Airport codes
   - Aircraft type
3. Set total seats needed
4. Generate booking reference
```

### 2. PNR Management
```javascript
1. Receive PNR from airline
2. Input PNR code
3. Validate with airline API
4. Map to jamaah groups
5. Track payment status
6. Monitor changes
```

### 3. Seat Assignment
```javascript
1. Get seat map from airline
2. Apply constraints:
   - Families together
   - Mahram requirements
   - Special needs (wheelchair, etc.)
3. Auto-assign or manual
4. Generate seat manifest
5. Confirm with airline
```

## Technical Implementation

### Database Schema
```sql
CREATE TABLE flights.flight_bookings (
    id SERIAL PRIMARY KEY,
    booking_reference VARCHAR(50) UNIQUE,
    package_id INTEGER REFERENCES core.packages(id),
    flight_type VARCHAR(20) CHECK (flight_type IN ('departure', 'return')),
    
    -- Flight details
    airline VARCHAR(100) NOT NULL,
    flight_number VARCHAR(20) NOT NULL,
    aircraft_type VARCHAR(50),
    departure_airport VARCHAR(10) NOT NULL,
    arrival_airport VARCHAR(10) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    
    -- Booking details
    total_seats INTEGER NOT NULL,
    confirmed_seats INTEGER DEFAULT 0,
    pnr_codes TEXT[],
    booking_class VARCHAR(20),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    confirmed_at TIMESTAMP,
    confirmed_by INTEGER,
    
    -- Financial
    total_cost DECIMAL(12,2),
    paid_amount DECIMAL(12,2) DEFAULT 0,
    payment_deadline DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

CREATE TABLE flights.seat_assignments (
    id SERIAL PRIMARY KEY,
    flight_booking_id INTEGER REFERENCES flights.flight_bookings(id),
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id),
    seat_number VARCHAR(10),
    seat_type VARCHAR(50), -- window, middle, aisle
    special_service TEXT[], -- wheelchair, bassinet, extra_legroom
    confirmed BOOLEAN DEFAULT FALSE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by INTEGER,
    UNIQUE(flight_booking_id, seat_number)
);

CREATE TABLE flights.pnr_records (
    id SERIAL PRIMARY KEY,
    flight_booking_id INTEGER REFERENCES flights.flight_bookings(id),
    pnr_code VARCHAR(20) NOT NULL,
    airline_reference VARCHAR(50),
    seats_count INTEGER,
    jamaah_ids INTEGER[],
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    notes TEXT
);

CREATE TABLE flights.flight_changes (
    id SERIAL PRIMARY KEY,
    flight_booking_id INTEGER REFERENCES flights.flight_bookings(id),
    change_type VARCHAR(50), -- schedule, gate, aircraft, cancelled
    old_value TEXT,
    new_value TEXT,
    notified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints (To Be Implemented)
```javascript
// Flight CRUD
GET /api/flights
POST /api/flights
GET /api/flights/:id
PUT /api/flights/:id
DELETE /api/flights/:id

// PNR Management
POST /api/flights/:id/pnr
PUT /api/flights/pnr/:pnrId
DELETE /api/flights/pnr/:pnrId
GET /api/flights/pnr/validate/:code

// Seat Management
GET /api/flights/:id/seatmap
POST /api/flights/:id/seats/assign
PUT /api/flights/seats/:seatId
POST /api/flights/:id/seats/auto-assign
GET /api/flights/:id/manifest

// Flight Operations
POST /api/flights/:id/check-in
GET /api/flights/:id/boarding-pass
POST /api/flights/:id/confirm
GET /api/flights/schedule/today
```

## UI Components

### Flight Card Component
```html
<div class="flight-card glass-card">
    <div class="flight-header">
        <div class="flight-route">
            <span class="airport">CGK</span>
            <i class="material-icons">flight_takeoff</i>
            <span class="airport">JED</span>
        </div>
        <div class="countdown-badge">H-15</div>
    </div>
    
    <div class="flight-details">
        <div class="airline-info">
            <img src="airline-logo.png" class="airline-logo">
            <div>
                <p class="flight-number">GA 980</p>
                <p class="aircraft">Boeing 777-300ER</p>
            </div>
        </div>
        
        <div class="time-info">
            <div class="departure">
                <p class="time">23:45</p>
                <p class="date">15 Mar 2024</p>
            </div>
            <div class="duration">
                <p>9h 30m</p>
                <i class="material-icons">arrow_forward</i>
            </div>
            <div class="arrival">
                <p class="time">06:15+1</p>
                <p class="date">16 Mar 2024</p>
            </div>
        </div>
    </div>
    
    <div class="pnr-section">
        <div class="pnr-list">
            <span class="pnr-badge">ABC123</span>
            <span class="pnr-badge">XYZ789</span>
            <button class="add-pnr-btn">
                <i class="material-icons">add</i>
            </button>
        </div>
    </div>
    
    <div class="seat-progress">
        <div class="progress-info">
            <span>Seats Assigned</span>
            <span>38/45</span>
        </div>
        <div class="progress-bar">
            <div class="progress" style="width: 84%"></div>
        </div>
    </div>
    
    <div class="flight-actions">
        <button class="glass-button-small">Manage Seats</button>
        <button class="glass-button-small">View Manifest</button>
    </div>
</div>
```

### Seat Map Interface
```html
<div class="seat-map-modal glass-modal">
    <div class="aircraft-layout">
        <div class="seat-map-header">
            <h3>GA 980 - Boeing 777-300ER</h3>
            <div class="seat-legend">
                <span><i class="seat available"></i> Available</span>
                <span><i class="seat selected"></i> Selected</span>
                <span><i class="seat occupied"></i> Occupied</span>
                <span><i class="seat special"></i> Special Needs</span>
            </div>
        </div>
        
        <div class="aircraft-body">
            <div class="seat-grid">
                <!-- Dynamic seat generation -->
                <div class="seat-row">
                    <span class="row-number">12</span>
                    <div class="seats">
                        <div class="seat available" data-seat="12A">A</div>
                        <div class="seat available" data-seat="12B">B</div>
                        <div class="seat available" data-seat="12C">C</div>
                        <div class="aisle"></div>
                        <div class="seat occupied" data-seat="12D">D</div>
                        <div class="seat occupied" data-seat="12E">E</div>
                        <div class="seat occupied" data-seat="12F">F</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="jamaah-assignment">
        <h4>Assign Jamaah</h4>
        <div class="jamaah-list">
            <!-- Draggable jamaah cards -->
        </div>
    </div>
</div>
```

## Features to Implement

### 1. Airline Integration
- Direct API connectivity
- Real-time availability
- Automated booking
- Price tracking
- Schedule changes

### 2. Check-in Management
- Online check-in automation
- Boarding pass generation
- Seat selection sync
- Document verification
- Special services

### 3. Advanced Seat Allocation
- AI-powered optimization
- Family grouping algorithm
- Mahram compliance
- Medical needs consideration
- Preference learning

### 4. Flight Tracking
- Real-time flight status
- Delay notifications
- Gate changes
- Weather impacts
- Alternative flights

### 5. Document Generation
- E-tickets
- Boarding passes
- Manifest reports
- Customs declarations
- Special service forms

## Integration Points

### With Package Management
- Auto-create flights with package
- Sync departure dates
- Update availability
- Cost calculations

### With Group Management
- Seat by groups
- Keep groups together
- Group check-in
- Manifest by group

### With Payment System
- Track flight payments
- Payment deadlines
- Refund management
- Cost breakdown

### With Notifications
- Booking confirmations
- Schedule changes
- Check-in reminders
- Departure alerts

## Flight Operations

### Pre-Departure Checklist
```javascript
const preDepartureChecklist = {
    "H-30": [
        "Confirm all PNRs",
        "Finalize seat assignments",
        "Verify passport validity",
        "Send flight details to jamaah"
    ],
    "H-7": [
        "Reconfirm with airline",
        "Check schedule changes",
        "Prepare manifest",
        "Brief group leaders"
    ],
    "H-3": [
        "Online check-in",
        "Generate boarding passes",
        "Final headcount",
        "Special services confirm"
    ],
    "H-1": [
        "Final briefing",
        "Document check",
        "Emergency contacts",
        "Airport coordination"
    ]
};
```

### Special Services Handling
- Wheelchair assistance
- Unaccompanied minors
- Medical equipment
- Special meals
- Extra baggage
- Bassinet requests

## Reporting & Analytics

### Operational Reports
1. **Flight Manifest**
   - Complete passenger list
   - Seat assignments
   - Special services
   - Contact information

2. **Check-in Status**
   - Checked-in passengers
   - Pending check-ins
   - No-shows
   - Seat changes

3. **Financial Summary**
   - Total flight costs
   - Payment status
   - Refunds/changes
   - Airline invoices

### Analytics Dashboard
- On-time performance
- Seat utilization
- Popular routes
- Cost per passenger
- Airline comparison

## Mobile Features (Future)

### Mobile Check-in
- Barcode scanning
- Digital boarding pass
- Seat selection
- Real-time updates

### Flight Tracking
- Live flight status
- Gate information
- Delay alerts
- Baggage tracking

## Contingency Planning

### Flight Disruptions
```javascript
const disruptionProtocol = {
    delay: {
        notify: "All affected jamaah",
        update: "New departure time",
        arrange: "Meals if > 4 hours",
        document: "Delay reasons"
    },
    cancellation: {
        immediate: "Contact airline",
        options: "Alternative flights",
        notify: "All stakeholders",
        arrange: "Accommodation if needed"
    },
    overbooking: {
        priority: "Elderly and families first",
        negotiate: "Volunteer compensation",
        document: "All decisions",
        followup: "Affected passengers"
    }
};
```

## Best Practices

### For Booking Management
1. Book early for better rates
2. Maintain airline relationships
3. Always have backup options
4. Document all communications
5. Keep PNRs organized

### For Operations
1. Start check-in early
2. Have contingency plans
3. Brief team thoroughly
4. Maintain calm during issues
5. Communicate proactively

## Future Enhancements

### 1. Predictive Analytics
- Delay predictions
- Optimal booking times
- Price forecasting
- Demand planning

### 2. Automation
- Auto check-in
- Seat optimization AI
- Document generation
- Status monitoring

### 3. Enhanced Integration
- Multiple airline APIs
- Airport systems
- Immigration pre-clearance
- Baggage tracking systems