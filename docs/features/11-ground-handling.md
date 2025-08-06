# Ground Handling Feature Documentation

## Overview
Sistem manajemen ground handling untuk koordinasi layanan darat di bandara, transportasi lokal, dan logistik perjalanan jamaah umroh dari kedatangan hingga keberangkatan.

## Current Implementation Status
⚠️ **UI Only** - Backend functionality not implemented

## User Interface

### Ground Handling Dashboard
Halaman utama untuk mengelola semua aspek ground handling.

#### Key Features
1. **Service Management**
   - Airport assistance
   - Transportation coordination
   - Luggage handling
   - VIP services

2. **Schedule Overview**
   - Daily operations timeline
   - Service assignments
   - Staff allocation
   - Vehicle tracking

3. **Real-time Monitoring**
   - Live GPS tracking
   - Service status updates
   - Issue reporting
   - Communication hub

4. **Resource Allocation**
   - Bus fleet management
   - Driver assignments
   - Guide scheduling
   - Equipment tracking

## Service Categories

### 1. Airport Services
```javascript
const airportServices = {
    arrival: [
        "Meet & greet",
        "Immigration assistance",
        "Baggage claim help",
        "Customs clearance",
        "Welcome refreshments",
        "SIM card distribution"
    ],
    departure: [
        "Check-in assistance",
        "Baggage handling",
        "Security fast-track",
        "Lounge access",
        "Boarding assistance",
        "Special needs support"
    ]
};
```

### 2. Transportation Services
- Airport transfers
- Hotel shuttles
- Ziarah transportation
- Emergency vehicles
- VIP transportation
- Luggage trucks

### 3. Local Coordination
- Makkah operations
- Madinah operations
- Inter-city transfers
- Local guide services
- Emergency support

## Operational Workflow

### Arrival Processing
```javascript
1. Pre-arrival preparation
   - Flight tracking
   - Staff briefing
   - Vehicle positioning
   - Welcome setup

2. Arrival execution
   - Meet at gate
   - Guide to immigration
   - Assist with baggage
   - Load buses
   - Brief on schedule

3. Transfer to hotel
   - Headcount verification
   - Route navigation
   - Rest stop management
   - Hotel check-in assist

4. Post-arrival
   - Missing luggage follow-up
   - Special requests
   - Issue resolution
   - Report completion
```

### Daily Operations Flow
```javascript
const dailyOperations = {
    morning: {
        "05:00": "Fajr prayer transport",
        "07:00": "Breakfast service",
        "08:30": "Ziarah departure",
        "09:00": "Shopping tours"
    },
    afternoon: {
        "12:30": "Dhuhr prayer transport",
        "13:00": "Lunch service",
        "15:00": "Rest period",
        "15:30": "Asr prayer transport"
    },
    evening: {
        "18:00": "Maghrib prayer transport",
        "19:30": "Dinner service",
        "20:00": "Isha prayer transport",
        "21:00": "Optional programs"
    }
};
```

## Technical Implementation

### Database Schema
```sql
CREATE TABLE ground_handling.service_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100),
    category VARCHAR(50),
    description TEXT,
    standard_duration INTEGER, -- minutes
    requires_vehicle BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE ground_handling.service_requests (
    id SERIAL PRIMARY KEY,
    request_number VARCHAR(50) UNIQUE,
    package_id INTEGER REFERENCES core.packages(id),
    group_id INTEGER REFERENCES groups.departure_groups(id),
    service_type_id INTEGER REFERENCES ground_handling.service_types(id),
    
    -- Schedule
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    
    -- Location
    pickup_location VARCHAR(255),
    destination VARCHAR(255),
    route_details TEXT,
    
    -- Resources
    vehicle_id INTEGER,
    driver_id INTEGER,
    guide_id INTEGER,
    assistant_ids INTEGER[],
    
    -- Status
    status VARCHAR(50) DEFAULT 'scheduled',
    priority VARCHAR(20) DEFAULT 'normal',
    
    -- Details
    passenger_count INTEGER,
    special_requirements TEXT,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER,
    updated_at TIMESTAMP,
    completed_by INTEGER
);

CREATE TABLE ground_handling.vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_code VARCHAR(50) UNIQUE,
    vehicle_type VARCHAR(50), -- bus, van, car, truck
    brand VARCHAR(100),
    model VARCHAR(100),
    plate_number VARCHAR(50) UNIQUE,
    capacity INTEGER,
    
    -- Features
    has_ac BOOLEAN DEFAULT TRUE,
    has_wifi BOOLEAN DEFAULT FALSE,
    has_wheelchair_access BOOLEAN DEFAULT FALSE,
    luggage_capacity INTEGER,
    
    -- Status
    status VARCHAR(50) DEFAULT 'available',
    current_location VARCHAR(255),
    last_maintenance DATE,
    next_maintenance DATE,
    
    -- Tracking
    gps_device_id VARCHAR(100),
    last_position POINT,
    last_position_time TIMESTAMP,
    
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ground_handling.staff (
    id SERIAL PRIMARY KEY,
    employee_code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50), -- driver, guide, coordinator
    phone VARCHAR(20),
    license_number VARCHAR(50),
    license_expiry DATE,
    
    -- Qualifications
    languages TEXT[],
    certifications JSONB,
    experience_years INTEGER,
    
    -- Availability
    status VARCHAR(50) DEFAULT 'available',
    current_assignment INTEGER,
    
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ground_handling.service_logs (
    id SERIAL PRIMARY KEY,
    service_request_id INTEGER REFERENCES ground_handling.service_requests(id),
    event_type VARCHAR(50),
    event_time TIMESTAMP DEFAULT NOW(),
    location POINT,
    description TEXT,
    reported_by INTEGER,
    photos TEXT[]
);
```

### API Endpoints (To Be Implemented)
```javascript
// Service Management
GET /api/ground-handling/services
POST /api/ground-handling/services
GET /api/ground-handling/services/:id
PUT /api/ground-handling/services/:id
DELETE /api/ground-handling/services/:id

// Schedule Management
GET /api/ground-handling/schedule
POST /api/ground-handling/schedule
GET /api/ground-handling/schedule/conflicts
POST /api/ground-handling/schedule/optimize

// Vehicle Management
GET /api/ground-handling/vehicles
POST /api/ground-handling/vehicles
PUT /api/ground-handling/vehicles/:id
GET /api/ground-handling/vehicles/:id/tracking
POST /api/ground-handling/vehicles/:id/assign

// Staff Management
GET /api/ground-handling/staff
POST /api/ground-handling/staff
PUT /api/ground-handling/staff/:id
GET /api/ground-handling/staff/available
POST /api/ground-handling/staff/:id/assign

// Real-time Operations
GET /api/ground-handling/live-tracking
POST /api/ground-handling/services/:id/start
POST /api/ground-handling/services/:id/complete
POST /api/ground-handling/services/:id/issue
GET /api/ground-handling/services/:id/timeline
```

## UI Components

### Service Card
```html
<div class="service-card glass-card">
    <div class="service-header">
        <div class="service-info">
            <h4>Airport Transfer - Arrival</h4>
            <p class="service-code">GH-2024-0156</p>
        </div>
        <div class="status-badge in-progress">In Progress</div>
    </div>
    
    <div class="service-details">
        <div class="detail-item">
            <i class="material-icons">flight_land</i>
            <div>
                <p class="label">Flight</p>
                <p class="value">GA 980</p>
            </div>
        </div>
        <div class="detail-item">
            <i class="material-icons">schedule</i>
            <div>
                <p class="label">ETA</p>
                <p class="value">14:30</p>
            </div>
        </div>
        <div class="detail-item">
            <i class="material-icons">people</i>
            <div>
                <p class="label">Passengers</p>
                <p class="value">45</p>
            </div>
        </div>
    </div>
    
    <div class="assigned-resources">
        <div class="resource">
            <img src="driver-photo.jpg" class="resource-avatar">
            <div>
                <p class="name">Ahmad Driver</p>
                <p class="role">Driver</p>
            </div>
        </div>
        <div class="resource">
            <div class="vehicle-icon">
                <i class="material-icons">directions_bus</i>
            </div>
            <div>
                <p class="name">Bus 01</p>
                <p class="role">45 Seats</p>
            </div>
        </div>
    </div>
    
    <div class="service-actions">
        <button class="glass-button-small">Track</button>
        <button class="glass-button-small">Update</button>
    </div>
</div>
```

### Live Tracking Interface
```html
<div class="tracking-dashboard">
    <div class="map-container">
        <!-- Interactive map with vehicle positions -->
        <div id="live-map" class="glass-map"></div>
    </div>
    
    <div class="tracking-sidebar">
        <h3>Active Services</h3>
        <div class="active-services-list">
            <div class="tracking-item">
                <div class="vehicle-info">
                    <span class="vehicle-id">Bus 01</span>
                    <span class="route">Airport → Hilton Makkah</span>
                </div>
                <div class="tracking-status">
                    <div class="progress-line">
                        <div class="progress" style="width: 60%"></div>
                    </div>
                    <span class="eta">ETA: 15:45</span>
                </div>
            </div>
        </div>
    </div>
</div>
```

## Features to Implement

### 1. GPS Integration
- Real-time vehicle tracking
- Route optimization
- Traffic consideration
- Geofencing alerts
- Historical playback

### 2. Communication System
- Driver app integration
- Two-way messaging
- Emergency broadcast
- Multi-language support
- Voice communication

### 3. Automated Scheduling
- AI-based optimization
- Conflict resolution
- Resource balancing
- Predictive scheduling
- Dynamic adjustments

### 4. Quality Control
- Service rating system
- Performance metrics
- Issue tracking
- Customer feedback
- Improvement analytics

### 5. Integration Hub
- Airport APIs
- Traffic data
- Weather services
- Hotel systems
- Emergency services

## Operational Scenarios

### Emergency Handling
```javascript
const emergencyProtocols = {
    medical: {
        immediate: "Stop vehicle safely",
        assess: "Evaluate situation",
        contact: "Emergency services + coordinator",
        assist: "Provide first aid if trained",
        document: "Complete incident report"
    },
    breakdown: {
        safety: "Move to safe location",
        notify: "Operations center",
        arrange: "Replacement vehicle",
        transfer: "Passengers safely",
        repair: "Coordinate maintenance"
    },
    accident: {
        safety: "Ensure passenger safety",
        police: "Contact authorities",
        document: "Photos and details",
        medical: "Check injuries",
        report: "Insurance and management"
    }
};
```

### Service Standards
- Punctuality: 95% on-time
- Cleanliness: Daily inspection
- Safety: Zero tolerance policy
- Communication: Multi-lingual
- Comfort: AC, water, WiFi

## Reporting & Analytics

### Operational Reports
1. **Daily Operations Report**
   - Services completed
   - On-time performance
   - Issues encountered
   - Resource utilization

2. **Vehicle Utilization**
   - Mileage tracking
   - Fuel consumption
   - Maintenance schedule
   - Cost per service

3. **Staff Performance**
   - Services handled
   - Customer ratings
   - Punctuality record
   - Training needs

### KPI Dashboard
- Service completion rate
- Average delay time
- Customer satisfaction score
- Cost per passenger
- Safety incidents

## Mobile Applications

### Driver App
- Daily schedule view
- Navigation integration
- Passenger manifest
- Issue reporting
- Communication tools

### Coordinator App
- Live tracking overview
- Resource management
- Emergency handling
- Performance monitoring
- Report generation

## Integration Points

### With Flight Management
- Automatic service scheduling
- Real-time flight updates
- Delay adjustments
- Gate information

### With Hotel Management
- Room readiness sync
- Special requirements
- Group arrivals
- Luggage coordination

### With Group Management
- Group-wise transportation
- Leader communication
- Headcount verification
- Special needs tracking

## Best Practices

### For Service Delivery
1. Always arrive 15 minutes early
2. Verify passenger counts
3. Brief passengers on schedule
4. Maintain vehicle cleanliness
5. Document all services

### For Emergency Situations
1. Passenger safety first
2. Clear communication
3. Quick decision making
4. Proper documentation
5. Follow-up actions

## Future Enhancements

### 1. IoT Integration
- Vehicle sensors
- Passenger counting
- Temperature monitoring
- Fuel tracking
- Predictive maintenance

### 2. AI Optimization
- Route optimization
- Demand prediction
- Resource allocation
- Anomaly detection
- Performance prediction

### 3. Blockchain Integration
- Service verification
- Transparent billing
- Smart contracts
- Audit trail
- Partner settlements