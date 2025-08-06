# Equipment/Inventory Management Feature Documentation

## Overview
Sistem manajemen inventaris dan perlengkapan umroh untuk tracking, distribusi, dan pengelolaan seluruh item yang diberikan kepada jamaah seperti koper, tas, mukena, kain ihram, dan perlengkapan lainnya.

## Current Implementation Status
⚠️ **UI Only** - Backend functionality not implemented

## User Interface

### Equipment Management Dashboard
Halaman utama untuk mengelola inventaris perlengkapan umroh.

#### Key Features
1. **Inventory Overview**
   - Stock levels visualization
   - Low stock alerts
   - Category breakdown
   - Value tracking

2. **Item Management**
   - Add/edit items
   - Barcode/QR generation
   - Photo management
   - Specification tracking

3. **Distribution Tracking**
   - Assign to jamaah
   - Bulk distribution
   - Return processing
   - Loss reporting

4. **Supplier Management**
   - Vendor database
   - Purchase orders
   - Delivery tracking
   - Quality ratings

## Equipment Categories

### 1. Standard Package Items
Items included in every package

```javascript
const standardPackage = {
    luggage: {
        items: ["Koper kabin", "Koper bagasi", "Tas selempang"],
        specifications: {
            koper_kabin: { size: "20 inch", weight: "2.5kg", color: "options" },
            koper_bagasi: { size: "28 inch", weight: "4kg", color: "options" }
        }
    },
    clothing: {
        male: ["Kain ihram 2 set", "Sabuk ihram", "Sandal"],
        female: ["Mukena", "Bergo", "Inner", "Sandal"]
    },
    accessories: [
        "Tas paspor",
        "Money belt",
        "ID card holder",
        "Luggage tag",
        "Dzikir counter"
    ],
    documentation: [
        "Buku panduan umroh",
        "Doa dan dzikir",
        "Peta Makkah-Madinah"
    ]
};
```

### 2. Optional Items
Additional items available for purchase/rent

```javascript
const optionalItems = {
    comfort: [
        "Bantal leher",
        "Sleeping mask",
        "Ear plugs",
        "Portable fan"
    ],
    health: [
        "First aid kit",
        "Wheelchair",
        "Walking stick",
        "Oxygen concentrator"
    ],
    technology: [
        "Power bank rental",
        "Universal adapter",
        "Portable WiFi"
    ]
};
```

## Inventory Workflow

### Item Lifecycle
```javascript
const itemLifecycle = {
    procurement: {
        steps: ["Request", "Approval", "PO Creation", "Delivery", "QC Check"],
        tracking: ["vendor", "PO_number", "expected_date", "actual_date"]
    },
    storage: {
        location: ["warehouse", "zone", "rack", "bin"],
        conditions: ["temperature", "humidity", "security"]
    },
    distribution: {
        preparation: "Package assignment",
        allocation: "Jamaah assignment", 
        delivery: "Distribution event",
        documentation: "Receipt signature"
    },
    return: {
        inspection: "Condition check",
        cleaning: "Sanitization if needed",
        repair: "Fix if damaged",
        restock: "Return to inventory"
    },
    disposal: {
        reasons: ["damaged", "obsolete", "lost", "stolen"],
        process: ["documentation", "approval", "disposal method"]
    }
};
```

## Technical Implementation

### Database Schema
```sql
CREATE TABLE inventory.categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    parent_id INTEGER REFERENCES inventory.categories(id),
    description TEXT,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE inventory.items (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES inventory.categories(id),
    
    -- Specifications
    brand VARCHAR(100),
    model VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(50),
    weight DECIMAL(10,2),
    material VARCHAR(100),
    
    -- Inventory
    quantity_total INTEGER DEFAULT 0,
    quantity_available INTEGER DEFAULT 0,
    quantity_distributed INTEGER DEFAULT 0,
    quantity_damaged INTEGER DEFAULT 0,
    reorder_level INTEGER,
    reorder_quantity INTEGER,
    
    -- Financial
    unit_cost DECIMAL(10,2),
    rental_price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    
    -- Media
    images JSONB,
    specifications JSONB,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE inventory.stock_locations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100),
    warehouse VARCHAR(100),
    zone VARCHAR(50),
    rack VARCHAR(50),
    bin VARCHAR(50),
    capacity INTEGER,
    current_items INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE inventory.stock_items (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES inventory.items(id),
    location_id INTEGER REFERENCES inventory.stock_locations(id),
    quantity INTEGER NOT NULL,
    batch_number VARCHAR(100),
    expiry_date DATE,
    condition VARCHAR(50) DEFAULT 'good',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inventory.distributions (
    id SERIAL PRIMARY KEY,
    distribution_number VARCHAR(50) UNIQUE,
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id),
    package_id INTEGER REFERENCES core.packages(id),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    distributed_date DATE,
    distributed_by INTEGER,
    received_by VARCHAR(255),
    
    -- Return
    expected_return_date DATE,
    actual_return_date DATE,
    returned_to INTEGER,
    return_condition VARCHAR(50),
    
    -- Documentation
    distribution_notes TEXT,
    return_notes TEXT,
    signature_url TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inventory.distribution_items (
    id SERIAL PRIMARY KEY,
    distribution_id INTEGER REFERENCES inventory.distributions(id),
    item_id INTEGER REFERENCES inventory.items(id),
    quantity INTEGER NOT NULL,
    serial_numbers TEXT[],
    condition_out VARCHAR(50) DEFAULT 'good',
    condition_return VARCHAR(50),
    notes TEXT
);

CREATE TABLE inventory.suppliers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    
    -- Ratings
    quality_rating DECIMAL(3,2),
    delivery_rating DECIMAL(3,2),
    price_rating DECIMAL(3,2),
    
    -- Terms
    payment_terms VARCHAR(100),
    delivery_terms VARCHAR(100),
    minimum_order DECIMAL(10,2),
    
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints (To Be Implemented)
```javascript
// Item Management
GET /api/inventory/items
POST /api/inventory/items
GET /api/inventory/items/:id
PUT /api/inventory/items/:id
DELETE /api/inventory/items/:id

// Stock Management
GET /api/inventory/stock
POST /api/inventory/stock/add
POST /api/inventory/stock/transfer
POST /api/inventory/stock/adjust
GET /api/inventory/stock/movements

// Distribution
GET /api/inventory/distributions
POST /api/inventory/distributions
GET /api/inventory/distributions/:id
PUT /api/inventory/distributions/:id/return
GET /api/inventory/distributions/jamaah/:jamaahId

// Suppliers
GET /api/inventory/suppliers
POST /api/inventory/suppliers
PUT /api/inventory/suppliers/:id
GET /api/inventory/suppliers/:id/orders

// Reports
GET /api/inventory/reports/stock-levels
GET /api/inventory/reports/distribution-summary
GET /api/inventory/reports/damaged-items
GET /api/inventory/reports/valuation
```

## UI Components

### Item Card
```html
<div class="item-card glass-card">
    <div class="item-image">
        <img src="item-photo.jpg" alt="Koper Kabin">
        <div class="stock-badge low">Low Stock</div>
    </div>
    
    <div class="item-details">
        <h4>Koper Kabin 20"</h4>
        <p class="sku">SKU: KPR-20-BLU</p>
        
        <div class="stock-info">
            <div class="stock-stat">
                <span class="label">Available</span>
                <span class="value">23</span>
            </div>
            <div class="stock-stat">
                <span class="label">Distributed</span>
                <span class="value">127</span>
            </div>
            <div class="stock-stat">
                <span class="label">Total</span>
                <span class="value">150</span>
            </div>
        </div>
        
        <div class="progress-bar">
            <div class="progress" style="width: 15%"></div>
        </div>
    </div>
    
    <div class="item-actions">
        <button class="icon-btn"><i class="material-icons">edit</i></button>
        <button class="icon-btn"><i class="material-icons">qr_code</i></button>
        <button class="icon-btn"><i class="material-icons">assignment</i></button>
    </div>
</div>
```

### Distribution Form
```html
<div class="distribution-modal glass-modal">
    <div class="modal-header">
        <h3>Distribute Equipment</h3>
    </div>
    
    <div class="modal-body">
        <div class="jamaah-selection">
            <label>Select Jamaah</label>
            <select class="glass-select" id="jamaahSelect">
                <!-- Jamaah options -->
            </select>
        </div>
        
        <div class="package-items">
            <h4>Package Items</h4>
            <div class="item-checklist">
                <label class="checkbox-item">
                    <input type="checkbox" checked>
                    <span>Koper Kabin 20"</span>
                    <select class="item-options">
                        <option>Blue</option>
                        <option>Black</option>
                        <option>Red</option>
                    </select>
                </label>
                <!-- More items -->
            </div>
        </div>
        
        <div class="additional-items">
            <h4>Additional Items</h4>
            <button class="add-item-btn">
                <i class="material-icons">add</i> Add Item
            </button>
        </div>
        
        <div class="signature-pad">
            <label>Recipient Signature</label>
            <canvas id="signaturePad" class="signature-canvas"></canvas>
            <button class="clear-signature">Clear</button>
        </div>
    </div>
    
    <div class="modal-footer">
        <button class="glass-button">Distribute</button>
        <button class="glass-button-secondary">Cancel</button>
    </div>
</div>
```

## Features to Implement

### 1. Barcode/QR System
- Generate unique codes
- Mobile scanning app
- Quick lookup
- Batch printing
- Track item history

### 2. Automated Reordering
- Low stock alerts
- Supplier integration
- PO generation
- Approval workflow
- Delivery tracking

### 3. Package Builder
- Drag-drop interface
- Template creation
- Cost calculation
- Availability check
- Bulk assignment

### 4. Quality Control
- Inspection checklists
- Photo documentation
- Defect tracking
- Supplier feedback
- Warranty management

### 5. Analytics Dashboard
- Stock turnover
- Popular items
- Damage rates
- Cost analysis
- Forecasting

## Integration Points

### With Package Management
- Auto-create item lists
- Package templates
- Cost calculations
- Availability sync

### With Jamaah Management
- Distribution history
- Preferences tracking
- Size information
- Special requirements

### With Financial System
- Cost tracking
- Rental income
- Damage charges
- Supplier payments

### With Reporting
- Inventory reports
- Distribution logs
- Financial impact
- Supplier performance

## Mobile Features

### Warehouse App
- Barcode scanning
- Stock counting
- Location updates
- Pick lists
- Quality checks

### Distribution App
- Jamaah lookup
- Item scanning
- Signature capture
- Photo documentation
- Offline mode

## Best Practices

### For Inventory Management
1. Regular stock counts
2. Proper labeling
3. FIFO rotation
4. Damage documentation
5. Supplier diversification

### For Distribution
1. Verify jamaah identity
2. Check item condition
3. Get signatures
4. Document everything
5. Follow up returns

### For Storage
1. Climate control
2. Security measures
3. Organized layout
4. Regular cleaning
5. Pest control

## Quality Assurance

### Inspection Process
```javascript
const inspectionProcess = {
    incoming: {
        checks: ["quantity", "quality", "specifications", "documentation"],
        actions: ["accept", "reject", "partial_accept"],
        documentation: ["photos", "reports", "supplier_feedback"]
    },
    outgoing: {
        checks: ["completeness", "condition", "cleanliness", "functionality"],
        actions: ["approve", "replace", "repair"],
        documentation: ["checklist", "jamaah_confirmation"]
    },
    returns: {
        checks: ["condition", "completeness", "damage", "cleanliness"],
        actions: ["restock", "repair", "clean", "dispose"],
        documentation: ["condition_report", "charges_if_any"]
    }
};
```

## Reporting & Analytics

### Key Reports
1. **Stock Level Report**
   - Current quantities
   - Location breakdown
   - Reorder alerts
   - Value analysis

2. **Distribution Report**
   - Items per jamaah
   - Package breakdown
   - Timeline analysis
   - Return status

3. **Supplier Performance**
   - Delivery times
   - Quality scores
   - Price comparisons
   - Issue tracking

4. **Financial Impact**
   - Inventory value
   - Rental income
   - Damage costs
   - ROI analysis

## Future Enhancements

### 1. IoT Integration
- RFID tracking
- Smart shelves
- Environmental sensors
- Automated counting
- Real-time location

### 2. AI Optimization
- Demand forecasting
- Optimal stocking
- Predictive maintenance
- Quality prediction
- Supplier selection

### 3. Blockchain
- Supply chain transparency
- Authenticity verification
- Smart contracts
- Audit trail
- Cross-border tracking