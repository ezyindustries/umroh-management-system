# Dashboard Feature Documentation

## Overview
Dashboard adalah halaman utama yang menampilkan ringkasan data dan statistik sistem manajemen umroh secara real-time. Dashboard dirancang dengan tampilan glassmorphism yang modern dan informatif.

## Features

### 1. Statistics Cards
Menampilkan 4 kartu statistik utama dengan animasi gradient dan real-time updates:

#### a. Total Jamaah
- **Icon**: people
- **Color**: Blue gradient (#3B82F6)
- **Data**: Total jamaah terdaftar
- **Animation**: Pulse effect on hover
- **Update**: Real-time dari database

#### b. Total Paket
- **Icon**: card_travel  
- **Color**: Orange gradient (#F59E0B)
- **Data**: Jumlah paket umroh aktif
- **Animation**: Glow effect
- **Update**: Auto-refresh setiap data change

#### c. Pembayaran Bulan Ini
- **Icon**: payment
- **Color**: Purple gradient (#8B5CF6)
- **Data**: Total pembayaran dalam rupiah
- **Format**: Currency IDR
- **Period**: Current month

#### d. Keberangkatan Minggu Ini
- **Icon**: flight_takeoff
- **Color**: Green gradient (#10B981)
- **Data**: Jumlah keberangkatan
- **Period**: Current week (7 days)

### 2. Recent Activities Section
Menampilkan 10 aktivitas terakhir dalam sistem:

#### Activity Types:
- **Pendaftaran Jamaah Baru**: Badge hijau
- **Pembayaran**: Badge biru
- **Upload Dokumen**: Badge kuning
- **Update Status**: Badge ungu

#### Activity Display:
- User role yang melakukan aksi
- Timestamp (relative time)
- Activity description
- Target entity (jamaah name, package, etc.)

### 3. Quick Actions
Tombol aksi cepat untuk fitur yang sering digunakan:
- Tambah Jamaah Baru
- Input Pembayaran
- Upload Dokumen
- Buat Laporan

### 4. Notifications Panel (Planned)
Area untuk menampilkan notifikasi penting:
- Pembayaran jatuh tempo
- Dokumen expired
- Keberangkatan H-7
- System alerts

## Technical Implementation

### Frontend Components

#### HTML Structure:
```html
<div id="dashboard" class="page active">
    <div class="glass-card">
        <h2>Dashboard Umroh</h2>
        <div class="stats-grid">
            <!-- Statistics cards -->
        </div>
        <div class="dashboard-content">
            <!-- Recent activities -->
            <!-- Quick actions -->
        </div>
    </div>
</div>
```

#### CSS Classes:
- `.stats-grid`: Grid layout untuk statistics cards
- `.stat-card`: Individual statistic card dengan glassmorphism
- `.stat-icon`: Icon container dengan gradient background
- `.stat-value`: Large number display
- `.stat-label`: Description text
- `.activity-list`: Scrollable activity feed
- `.activity-item`: Individual activity entry

### Backend API

#### Endpoints:
1. `GET /api/dashboard/stats`
   - Returns: {totalJamaah, totalPackages, monthlyPayments, weeklyDepartures}
   
2. `GET /api/dashboard/activities`
   - Query params: limit (default: 10)
   - Returns: Array of activity objects

3. `GET /api/dashboard/notifications` (Planned)
   - Returns: Pending notifications

### Database Queries

#### Statistics Queries:
```sql
-- Total Jamaah
SELECT COUNT(*) FROM jamaah WHERE deleted_at IS NULL;

-- Monthly Payments
SELECT SUM(amount) FROM payments 
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
AND status = 'completed';

-- Weekly Departures
SELECT COUNT(DISTINCT group_id) FROM groups
WHERE departure_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days';
```

## UI/UX Features

### Visual Design:
1. **Glassmorphism Effects**:
   - Semi-transparent backgrounds
   - Backdrop blur filters
   - Gradient borders
   - Soft shadows

2. **Animations**:
   - Fade-in on page load
   - Hover effects on cards
   - Smooth transitions
   - Loading skeletons

3. **Responsive Design**:
   - Grid auto-adjusts for mobile
   - Touch-friendly interactions
   - Optimized for tablets

### Accessibility:
- Proper ARIA labels
- Keyboard navigation support
- High contrast mode compatible
- Screen reader friendly

## Performance Optimizations

1. **Data Loading**:
   - Lazy loading for activities
   - Caching statistics for 60 seconds
   - Batch API requests

2. **Rendering**:
   - Virtual scrolling for long activity lists
   - Debounced updates
   - RequestAnimationFrame for animations

## Future Enhancements

### Planned Features:
1. **Interactive Charts**:
   - Monthly revenue chart
   - Jamaah growth timeline
   - Package popularity graph
   - Payment status pie chart

2. **Customizable Widgets**:
   - Drag-and-drop layout
   - User preference saving
   - Widget size options
   - Custom date ranges

3. **Real-time Updates**:
   - WebSocket integration
   - Live activity feed
   - Push notifications
   - Auto-refresh toggles

4. **Export Capabilities**:
   - Dashboard snapshot PDF
   - Statistics CSV export
   - Scheduled reports
   - Email summaries

### Suggested Improvements:
1. Add data comparison (vs last month/year)
2. Implement predictive analytics
3. Add weather widget for Makkah/Madinah
4. Include currency exchange rates
5. Add prayer time display
6. Implement goal tracking
7. Add team performance metrics
8. Include customer satisfaction scores

## Configuration

### Settings:
```javascript
const dashboardConfig = {
    refreshInterval: 60000, // 1 minute
    activityLimit: 10,
    animationDuration: 300,
    enableNotifications: true,
    chartType: 'line', // line, bar, pie
    dateFormat: 'relative' // relative, absolute
};
```

## Error Handling

### Common Issues:
1. **Stats Loading Failed**:
   - Show cached data if available
   - Display error message
   - Retry after 5 seconds

2. **Activity Feed Error**:
   - Show placeholder message
   - Log error to console
   - Fallback to static content

## Security Considerations

1. **Data Access**:
   - Role-based statistics filtering
   - Activity log privacy
   - Sensitive data masking

2. **API Security**:
   - Rate limiting on endpoints
   - JWT token validation
   - CORS configuration

## Testing

### Test Scenarios:
1. Statistics accuracy verification
2. Real-time update testing
3. Error state handling
4. Performance benchmarking
5. Cross-browser compatibility
6. Mobile responsiveness
7. Accessibility compliance

### Test Data:
- Minimum: 100 jamaah records
- Recommended: 1000+ records
- Stress test: 50000 records