# MODULE: Dashboard & Analytics - Business Flow Documentation

## Overview
Modul ini menyediakan dashboard terpusat dengan informasi operasional, KPI bisnis, dan monitoring aktivitas. Dashboard sama untuk semua role dengan auto-refresh setiap 30 detik, menampilkan perbandingan periode dan drill-down capability untuk setiap metrik.

## Actors & Roles
### Primary Actors:
- **All Roles**: View comprehensive dashboard
- **System**: Calculate metrics and aggregations
- **Analytics Engine**: Process comparative data

### System Actor:
- **Dashboard Service**: Auto-refresh, data aggregation

## Data Flow Diagram

### 1. Dashboard Load Flow
```
User Access → Load All Widgets → Calculate Metrics → Display Numbers → Auto-Refresh (30s)
                                        ↓
                              Apply Period Filter (Day/Month)
```

### 2. Comparison Flow
```
Current Period Data → Calculate Metrics → Get Previous Period → Calculate Difference
                                                    ↓
                                          Show Comparison (↑↓ %)
```

### 3. Drill-down Flow
```
Click Metric → Load Detail View → Show Breakdown → Enable Actions
                                        ↓
                              Link to Relevant Module
```

## Validation & Error Handling

### Dashboard Rules:
1. **Data Freshness**:
   - Real-time queries
   - 30-second refresh
   - Loading indicators

2. **Period Consistency**:
   - Same period comparison
   - Handle incomplete months
   - Today vs yesterday

3. **Access Control**:
   - Same view all roles
   - Data based on permissions
   - No filtering needed

## Business Rules

### Dashboard Sections:

#### 1. Operational Summary
```
JAMAAH MANAGEMENT
┌─────────────────────────────────┐
│ Total Jamaah Aktif              │
│ 1,245                    ↑ 12%  │
│ Click for details →             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Jamaah Baru (Period)            │
│ 156                      ↑ 23%  │
│ Click for details →             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Dokumen Belum Lengkap           │
│ 45                       ↓ 10%  │
│ Click for details →             │
└─────────────────────────────────┘
```

#### 2. Package Metrics
```
┌─────────────────────────────────┐
│ Paket Aktif                     │
│ 12                       → 0%   │
│ Click for details →             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Seat Tersedia                   │
│ 245                      ↓ 15%  │
│ Click for details →             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Keberangkatan (Period)          │
│ 3                        ↑ 50%  │
│ Click for details →             │
└─────────────────────────────────┘
```

#### 3. Financial Overview
```
┌─────────────────────────────────┐
│ Total Revenue (Period)          │
│ Rp 3.2 Milyar           ↑ 18%  │
│ Click for details →             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Outstanding Payment             │
│ Rp 450 Juta             ↓ 5%   │
│ Click for details →             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Pembayaran Hari Ini             │
│ Rp 125 Juta             ↑ 30%  │
│ Click for details →             │
└─────────────────────────────────┘
```

#### 4. Activity Monitoring
```
┌─────────────────────────────────┐
│ User Aktif Hari Ini             │
│ 18                       ↑ 5%   │
│ Click for details →             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Total Transaksi (Period)        │
│ 342                      ↑ 15%  │
│ Click for details →             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Task Pending                    │
│ 23                       ↓ 8%   │
│ Click for details →             │
└─────────────────────────────────┘
```

#### 5. Marketing Performance
```
┌─────────────────────────────────┐
│ Leads Generated                 │
│ 450                      ↑ 25%  │
│ Click for details →             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Conversion Rate                 │
│ 12.5%                    ↑ 2%   │
│ Click for details →             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ WhatsApp Interactions           │
│ 1,250                    ↑ 30%  │
│ Click for details →             │
└─────────────────────────────────┘
```

### Period Filters:
1. **Day View**:
   - Today's data
   - Compare with yesterday
   - Hourly breakdown available

2. **Month View**:
   - Current month
   - Compare with last month
   - Daily breakdown available

### Comparison Display:
```
Format: [Current Value] [↑↓→] [Percentage]

↑ = Increase (green)
↓ = Decrease (red)
→ = No change (gray)
```

### Drill-down Behavior:
1. **Click Action**:
   - Opens detail modal/page
   - Shows breakdown data
   - Links to module

2. **Detail Levels**:
   - Summary → List → Individual
   - Maintain context
   - Back navigation

## API Contracts

### GET /api/dashboard/summary
**Query Parameters:**
- `period`: "day" | "month"
- `date`: "2025-01-25" (for specific date)

**Response:**
```json
{
  "period": "month",
  "current_period": "2025-01",
  "comparison_period": "2024-12",
  "metrics": {
    "operational": {
      "total_jamaah": {
        "current": 1245,
        "previous": 1112,
        "change_percent": 12,
        "change_direction": "up",
        "drill_down_url": "/api/dashboard/detail/jamaah"
      },
      "new_jamaah": {
        "current": 156,
        "previous": 127,
        "change_percent": 23,
        "change_direction": "up"
      },
      "incomplete_documents": {
        "current": 45,
        "previous": 50,
        "change_percent": -10,
        "change_direction": "down"
      }
    },
    "packages": {
      "active_packages": {
        "current": 12,
        "previous": 12,
        "change_percent": 0,
        "change_direction": "same"
      },
      "available_seats": {
        "current": 245,
        "previous": 288,
        "change_percent": -15,
        "change_direction": "down"
      }
    },
    "financial": {
      "total_revenue": {
        "current": 3200000000,
        "previous": 2710000000,
        "change_percent": 18,
        "change_direction": "up",
        "formatted_current": "Rp 3.2 Milyar",
        "formatted_previous": "Rp 2.71 Milyar"
      }
    }
  },
  "last_updated": "2025-01-25 14:30:00",
  "next_refresh": 30
}
```

### GET /api/dashboard/detail/{metric_type}
**Response Example for Jamaah Detail:**
```json
{
  "metric": "total_jamaah",
  "breakdown": {
    "by_status": {
      "active": 1000,
      "pending": 200,
      "completed": 45
    },
    "by_package": [
      {
        "package_name": "Umroh Maret 2025",
        "count": 150,
        "percentage": 12
      }
    ],
    "recent_additions": [
      {
        "id": 1,
        "name": "Ahmad Yusuf",
        "added_date": "2025-01-25",
        "package": "Umroh Maret 2025"
      }
    ]
  }
}
```

### GET /api/dashboard/activity-log
**Response:**
```json
{
  "recent_activities": [
    {
      "timestamp": "2025-01-25 14:25:00",
      "user": "admin_user",
      "action": "create_jamaah",
      "details": "Added Ahmad Yusuf"
    },
    {
      "timestamp": "2025-01-25 14:20:00",
      "user": "finance_user",
      "action": "payment_received",
      "details": "Rp 5,000,000 from Fatimah"
    }
  ]
}
```

### GET /api/dashboard/quick-stats
**Real-time Statistics:**
```json
{
  "online_users": 18,
  "active_sessions": 22,
  "pending_tasks": 23,
  "unread_notifications": 5,
  "system_health": "good"
}
```

## Edge Cases Handled

1. **Period Boundaries**:
   - Month transitions
   - Year transitions
   - Incomplete periods
   - Future dates

2. **No Previous Data**:
   - New system
   - First month
   - Show N/A
   - Hide comparison

3. **Large Numbers**:
   - Format millions/billions
   - Abbreviate appropriately
   - Maintain precision

4. **Refresh Conflicts**:
   - Queue updates
   - Prevent flicker
   - Smooth transitions

5. **Slow Queries**:
   - Show loading state
   - Progressive loading
   - Cache when possible

6. **Zero Values**:
   - Handle division by zero
   - Show meaningful message
   - Differentiate from null

## Integration Points

1. **With All Modules**:
   - Pull summary data
   - Link drill-downs
   - Respect permissions

2. **With Cache Layer**:
   - Cache calculations
   - Invalidate on change
   - Reduce DB load

3. **With Real-time System**:
   - WebSocket updates
   - Push notifications
   - Live counters

4. **With Analytics Engine**:
   - Complex calculations
   - Trend analysis
   - Forecasting

5. **With UI Framework**:
   - Responsive grid
   - Mobile optimized
   - Touch friendly

## Performance Optimization

### Strategies:
1. **Query Optimization**:
   - Indexed aggregations
   - Materialized views
   - Batch queries

2. **Caching Strategy**:
   - Widget-level cache
   - TTL 30 seconds
   - Background refresh

3. **Progressive Loading**:
   - Critical metrics first
   - Lazy load details
   - Prioritize visible

## UI/UX Guidelines

### Layout:
1. **Grid System**:
   - Responsive columns
   - Card-based widgets
   - Consistent spacing

2. **Visual Hierarchy**:
   - Large numbers prominent
   - Comparison secondary
   - Actions subtle

3. **Color Coding**:
   - Green: Positive change
   - Red: Negative change
   - Blue: Neutral/info

### Interactions:
1. **Hover States**:
   - Highlight clickable
   - Show tooltip
   - Cursor change

2. **Loading States**:
   - Skeleton screens
   - Progress indicators
   - Prevent layout shift

## Audit Trail Requirements
Every dashboard access must log:
- User access times
- Widget interactions
- Drill-down paths
- Export attempts (if added)
- Performance metrics
- Error conditions