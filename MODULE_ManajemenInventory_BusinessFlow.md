# MODULE: Manajemen Inventory - Business Flow Documentation

## Overview
Modul ini mengelola stok perlengkapan umroh, tracking distribusi ke jamaah, dan monitoring inventory levels. Sistem mendukung setting perlengkapan berbeda per paket, pencatatan manual dengan bukti foto, dan alert untuk stok rendah.

## Actors & Roles
### Primary Actors:
- **Admin Inventory**: Kelola stok, input penerimaan, distribusi
- **Admin Package**: Setting perlengkapan per paket
- **Operations**: Monitor pengambilan perlengkapan
- **Finance**: Track inventory loss/damage claims

### System Actor:
- **System**: Auto-alert low stock, track distribution status

## Data Flow Diagram

### 1. Inventory Setup Flow
```
Create Item Type → Set Initial Stock → Set Alert Threshold → Monitor Level
                                                    ↓
                                            Auto Alert if < 50
```

### 2. Package Equipment Setting Flow
```
Create/Edit Package → Define Equipment List → Save Template → Apply to Jamaah
                              ↓
                    (e.g., 1 koper besar, 2 seragam)
```

### 3. Distribution Flow
```
Jamaah Data → Check Package Equipment → Record Distribution → Upload Proof
                                                    ↓
                                            Update Stock & Status
```

## Validation & Error Handling

### Inventory Rules:
1. **Stock Management**:
   - No negative stock allowed
   - Alert when below 50 units
   - Manual adjustment with reason

2. **Distribution Tracking**:
   - One record per jamaah
   - Photo proof required
   - Can't distribute if no stock

3. **Package Equipment**:
   - Flexible configuration
   - No validation on quantities
   - Can be changed anytime

## Business Rules

### Inventory Types:
1. **Standard Items**:
   - Koper Besar
   - Koper Kecil
   - Seragam (with sizes)
   - Buku Panduan
   - Others (customizable)

2. **Item Attributes**:
   - Name
   - Current stock
   - Alert threshold (default 50)
   - Unit type (pcs, set, etc.)

### Stock In Management:
1. **Receiving Goods**:
   - Date received
   - Quantity received
   - Item details
   - Notes (supplier, PO, etc.)

2. **Stock Adjustments**:
   - Damage returns to supplier
   - Lost items (paid by admin)
   - Manual corrections
   - Reason required

### Package Equipment Configuration:
1. **Setting per Package**:
   ```
   Example configurations:
   
   Paket Hemat:
   - Koper Kecil: 1
   - Seragam: 1
   - Buku Panduan: 1
   
   Paket VIP:
   - Koper Besar: 1
   - Koper Kecil: 1
   - Seragam: 2
   - Buku Panduan: 1
   - Tas Exclusive: 1
   ```

2. **Flexibility**:
   - Can add custom items
   - Quantities configurable
   - Optional items marked

### Distribution Process:
1. **Recording Methods**:
   - Direct pickup at office
   - Delivery to address
   - Group distribution
   - Event distribution

2. **Proof Requirements**:
   - Photo of items
   - Delivery receipt
   - Pickup form
   - WhatsApp screenshot
   - Any image format

3. **Status Tracking**:
   - Not yet distributed
   - Partially distributed
   - Fully distributed
   - Special notes

### Alert System:
1. **Low Stock Alert**:
   - Triggers when < 50
   - Shows on dashboard
   - Item name and current stock

2. **Distribution Alert**:
   - Count pending distribution
   - List by package/departure date
   - Jamaah contact info

## API Contracts

### POST /api/inventory/items
**Request Body:**
```json
{
  "name": "Koper Besar",
  "unit": "pcs",
  "current_stock": 200,
  "alert_threshold": 50,
  "description": "Koper ukuran besar warna hitam"
}
```

### POST /api/inventory/stock-in
**Request Body:**
```json
{
  "item_id": 1,
  "quantity": 100,
  "date_received": "2025-03-01",
  "notes": "PO#12345 dari CV Koper Jaya",
  "recorded_by": "admin_inventory"
}
```

### POST /api/packages/{id}/equipment
**Request Body:**
```json
{
  "equipment_list": [
    {
      "item_id": 1,
      "item_name": "Koper Besar",
      "quantity": 1
    },
    {
      "item_id": 3,
      "item_name": "Seragam",
      "quantity": 2,
      "notes": "Size akan ditanya saat distribution"
    }
  ]
}
```

### POST /api/inventory/distribution
**Request (multipart/form-data):**
```
jamaah_id: 1
package_id: 1
distribution_date: 2025-03-10
distribution_method: pickup
proof_image: [binary]
notes: "Diambil langsung di kantor oleh yang bersangkutan"
items_distributed: [
  {"item_id": 1, "quantity": 1},
  {"item_id": 3, "quantity": 2, "details": "Size L"}
]
```

### GET /api/inventory/dashboard
**Response:**
```json
{
  "low_stock_alerts": [
    {
      "item_id": 1,
      "item_name": "Koper Besar",
      "current_stock": 45,
      "alert_threshold": 50,
      "last_stock_in": "2025-02-15"
    }
  ],
  "pending_distribution": {
    "total_jamaah": 25,
    "by_package": [
      {
        "package_id": 1,
        "package_name": "Umroh Ramadhan 2025",
        "departure_date": "2025-03-15",
        "pending_count": 15,
        "days_to_departure": 10
      }
    ]
  },
  "stock_summary": [
    {
      "item_name": "Koper Besar",
      "in_stock": 45,
      "distributed_this_month": 155,
      "pending_distribution": 25
    }
  ]
}
```

### GET /api/inventory/pending-distribution
**Query Parameters:**
- `package_id`: Filter by package
- `days_to_departure`: Urgency filter

**Response:**
```json
{
  "pending_list": [
    {
      "jamaah_id": 1,
      "name": "Ahmad Yusuf",
      "phone": "081234567890",
      "package": "Umroh Ramadhan 2025",
      "departure_date": "2025-03-15",
      "equipment_entitled": [
        {"item": "Koper Besar", "quantity": 1},
        {"item": "Seragam", "quantity": 2}
      ],
      "distribution_status": "not_distributed",
      "whatsapp_link": "https://wa.me/6281234567890"
    }
  ]
}
```

### POST /api/inventory/adjustment
**Request Body:**
```json
{
  "item_id": 1,
  "adjustment_type": "damage_return",
  "quantity": -5,
  "reason": "Koper rusak dikembalikan ke supplier",
  "reference": "Return Note #RN123"
}
```

### GET /api/inventory/distribution-history/{jamaah_id}
**Response:**
```json
{
  "distributions": [
    {
      "id": 101,
      "distribution_date": "2025-03-10",
      "method": "pickup",
      "items": [
        {"name": "Koper Besar", "quantity": 1},
        {"name": "Seragam Size L", "quantity": 2}
      ],
      "proof_url": "/api/files/distribution_101.jpg",
      "recorded_by": "admin_inventory",
      "notes": "Diambil langsung di kantor"
    }
  ]
}
```

## Edge Cases Handled

1. **Partial Distribution**:
   - Some items available, others not
   - Record what's given
   - Flag for completion later

2. **Size Variations**:
   - Seragam sizes (S, M, L, XL, XXL)
   - Record in notes/details
   - Track per size if needed

3. **Lost/Damaged Claims**:
   - Admin pays for lost items
   - Document with adjustment
   - Financial tracking needed

4. **Rush Distribution**:
   - Last-minute before departure
   - Bulk distribution events
   - Quick recording methods

5. **Custom Requests**:
   - Extra items beyond package
   - Paid additions
   - Special arrangements

6. **Multiple Distributions**:
   - Jamaah receives in stages
   - Track each transaction
   - Cumulative view available

## Integration Points

1. **With Package Module**:
   - Equipment configuration
   - Package assignment

2. **With Jamaah Module**:
   - Distribution tracking
   - Contact information

3. **With Finance Module**:
   - Lost item payments
   - Additional item charges

4. **With Dashboard**:
   - Low stock alerts
   - Distribution progress

5. **With Notification Module**:
   - Stock alerts
   - Pickup reminders

## Reporting Features

### Available Reports:
1. **Stock Movement**:
   - In/out summary
   - Period comparisons
   - Forecast needs

2. **Distribution Status**:
   - By package
   - By departure date
   - Completion rates

3. **Loss Report**:
   - Damaged items
   - Lost items
   - Financial impact

## Audit Trail Requirements
Every action must log:
- All stock movements with reasons
- Distribution records with proof
- Adjustment entries with authorization
- Package equipment configurations
- User actions with timestamps
- Image uploads linked to transactions