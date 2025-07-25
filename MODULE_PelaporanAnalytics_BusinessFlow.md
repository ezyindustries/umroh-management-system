# MODULE: Pelaporan & Analytics - Business Flow Documentation

## Overview
Modul ini menyediakan dashboard real-time untuk monitoring masalah yang mendekati deadline keberangkatan. Sistem menampilkan kewajiban yang belum selesai dalam format card/list yang informatif, dikelompokkan berdasarkan segmen masalah dengan prioritas days to departure.

## Actors & Roles
### Primary Actors:
- **All Roles**: View reports, monitor issues
- **Admin**: Configure threshold settings
- **Team Leaders**: Coordinate problem resolution
- **Operations**: Act on urgent items

### System Actor:
- **System**: Calculate deadlines, categorize urgency, generate reports

## Data Flow Diagram

### 1. Report Generation Flow
```
Check All Packages → Calculate Days to Departure → Identify Issues → Group by Category
                                                            ↓
                                                    Sort by Urgency → Display
```

### 2. Issue Detection Flow
```
Payment Status + Document Status + PNR Status → Compare with Thresholds → Flag Issues
                                                            ↓
                                                    Create Report Cards
```

### 3. Problem Resolution Flow
```
View Issue Card → Click for Details → See Problem List → Take Action → Refresh Report
```

## Validation & Error Handling

### Reporting Rules:
1. **Real-time Data**:
   - No caching delays
   - Live database queries
   - Instant updates

2. **Threshold Validation**:
   - Configurable per category
   - Default H-40 for all
   - Must be positive numbers

3. **Access Control**:
   - All roles can view
   - Only admin configures
   - No data filtering by role

## Business Rules

### Issue Categories:
1. **Payment Issues**:
   - Not paid DP
   - Not fully paid (pelunasan)
   - Default threshold: H-40

2. **Document Issues**:
   - Missing required documents
   - Unverified documents
   - Passport expiry warnings
   - Default threshold: H-40

3. **PNR/Seat Issues**:
   - PNR not full
   - Seats unassigned
   - Capacity problems
   - Default threshold: H-40

4. **Operational Issues**:
   - Hotel not confirmed
   - Ground handling not arranged
   - Visa processing delays

### Urgency Calculation:
1. **Priority Levels**:
   ```
   CRITICAL: H-7 or less
   URGENT: H-14 or less
   WARNING: H-30 or less
   NORMAL: More than H-30
   ```

2. **Sorting Order**:
   - Days to departure (ascending)
   - Issue severity
   - Package size (PAX count)

### Card Display Format:
1. **Summary Card**:
   ```
   Package: Umroh Ramadhan 2025
   Departure: 15 March 2025 (H-10)
   Status: URGENT
   
   Issues Found: 5
   - Payment: 3 jamaah
   - Documents: 2 jamaah
   [Click to expand]
   ```

2. **Detailed Modal**:
   ```
   PAYMENT ISSUES (3):
   1. Ahmad Yusuf - Belum bayar pelunasan (Sisa: 20jt)
      📱 081234567890 [WhatsApp]
   
   2. Fatimah - Belum bayar DP
      📱 081234567891 [WhatsApp]
   
   DOCUMENT ISSUES (2):
   1. Budi Santoso - Missing: Surat Kesehatan, Vaccine
      📱 081234567892 [WhatsApp]
   ```

### Configuration Settings:
1. **Threshold Settings**:
   - Payment deadline (days before departure)
   - Document deadline (days before departure)
   - PNR full deadline (days before departure)
   - Each configurable independently

2. **Display Settings**:
   - Cards per page
   - Auto-refresh interval
   - Color coding preferences

## API Contracts

### GET /api/reports/dashboard
**Response:**
```json
{
  "summary": {
    "total_issues": 45,
    "critical_count": 5,
    "urgent_count": 15,
    "warning_count": 25
  },
  "issues_by_package": [
    {
      "package_id": 1,
      "package_name": "Umroh Ramadhan 2025",
      "departure_date": "2025-03-15",
      "days_remaining": 10,
      "urgency_level": "URGENT",
      "total_jamaah": 150,
      "issues": {
        "payment": {
          "count": 3,
          "details": [
            {
              "jamaah_id": 1,
              "name": "Ahmad Yusuf",
              "phone": "081234567890",
              "issue_type": "unpaid_balance",
              "amount_due": 20000000,
              "whatsapp_link": "https://wa.me/6281234567890"
            }
          ]
        },
        "documents": {
          "count": 2,
          "details": [
            {
              "jamaah_id": 2,
              "name": "Budi Santoso",
              "phone": "081234567892",
              "missing_docs": ["health_certificate", "vaccine"],
              "whatsapp_link": "https://wa.me/6281234567892"
            }
          ]
        },
        "pnr": {
          "count": 1,
          "details": [
            {
              "pnr_code": "ABC123",
              "capacity": 150,
              "filled": 145,
              "remaining": 5
            }
          ]
        }
      }
    }
  ]
}
```

### GET /api/reports/settings
**Response:**
```json
{
  "thresholds": {
    "payment_deadline_days": 40,
    "document_deadline_days": 40,
    "pnr_full_deadline_days": 40,
    "hotel_confirmation_days": 30,
    "visa_processing_days": 45
  },
  "display": {
    "auto_refresh_seconds": 300,
    "items_per_page": 20
  }
}
```

### PUT /api/reports/settings
**Request Body:**
```json
{
  "thresholds": {
    "payment_deadline_days": 35,
    "document_deadline_days": 45
  }
}
```

### GET /api/reports/history
**Query Parameters:**
- `package_id`: Filter by package
- `issue_type`: Filter by type
- `date_from`: Start date

**Response:**
```json
{
  "historical_issues": [
    {
      "id": 1,
      "package": "Umroh Februari 2025",
      "issue_date": "2025-01-05",
      "issue_type": "payment",
      "description": "15 jamaah belum lunas H-35",
      "resolution_date": "2025-01-20",
      "days_before_departure": 35
    }
  ]
}
```

### GET /api/reports/issue-details/{package_id}
**Response:**
```json
{
  "package_details": {
    "name": "Umroh Ramadhan 2025",
    "departure": "2025-03-15 09:00",
    "return": "2025-03-23 23:00",
    "days_remaining": 10
  },
  "categorized_issues": {
    "payment": {
      "threshold_days": 40,
      "is_past_threshold": true,
      "severity": "URGENT",
      "items": [
        {
          "jamaah_id": 1,
          "name": "Ahmad Yusuf",
          "phone": "081234567890",
          "email": "ahmad@email.com",
          "payment_status": "partial",
          "paid_amount": 5000000,
          "total_amount": 25000000,
          "remaining": 20000000,
          "last_payment_date": "2025-01-15",
          "notes": "Promised to pay by next week"
        }
      ]
    },
    "documents": {
      "threshold_days": 40,
      "is_past_threshold": true,
      "severity": "URGENT",
      "items": [
        {
          "jamaah_id": 2,
          "name": "Fatimah",
          "required_docs": 5,
          "uploaded_docs": 3,
          "missing": ["health_cert", "vaccine"],
          "unverified": ["passport"],
          "passport_expiry_warning": false
        }
      ]
    }
  }
}
```

## Edge Cases Handled

1. **Multiple Issues per Jamaah**:
   - Show in each category
   - Highlight in summary
   - Priority to most urgent

2. **Last-Minute Packages**:
   - Created close to departure
   - All thresholds triggered
   - Special handling logic

3. **Threshold Changes**:
   - Apply to future checks
   - Don't affect history
   - Immediate recalculation

4. **Large Groups**:
   - Pagination in modals
   - Summary counts
   - Bulk action options

5. **Resolved Issues**:
   - Remove from active report
   - Keep in history
   - Track resolution time

6. **Partial Problems**:
   - Some paid, some not
   - Mixed document status
   - Clear indication

## Integration Points

1. **With Payment Module**:
   - Check payment status
   - Calculate outstanding

2. **With Document Module**:
   - Document completeness
   - Verification status

3. **With PNR Module**:
   - Seat availability
   - Fill status

4. **With Package Module**:
   - Departure dates
   - Package details

5. **With WhatsApp**:
   - Quick contact links
   - Pre-filled messages

## Visual Design Guidelines

### Card States:
1. **CRITICAL** (Red):
   - H-7 or less
   - Animated border
   - Top of list

2. **URGENT** (Orange):
   - H-14 or less
   - Bold display
   - High visibility

3. **WARNING** (Yellow):
   - H-30 or less
   - Standard display
   - Monitoring needed

4. **NORMAL** (Blue):
   - Information only
   - Bottom of list
   - No immediate action

### Interactive Elements:
- Click card to expand
- WhatsApp icons for quick contact
- Refresh button per card
- Select multiple for bulk actions

## Audit Trail Requirements
Every report access must log:
- Who viewed which reports
- Settings changes with user/timestamp
- Issue resolution tracking
- Export/print actions (if added)
- Bulk action operations