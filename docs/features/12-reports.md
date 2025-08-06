# Reports & Analytics Feature Documentation

## Overview
Sistem pelaporan dan analitik komprehensif untuk memberikan insights operasional, finansial, dan performa bisnis umroh dengan visualisasi data yang informatif dan actionable.

## Current Implementation Status
⚠️ **Basic Implementation** - Simple report views available, advanced analytics pending

## Report Categories

### 1. Operational Reports
Real-time dan historical data operasional

#### Jamaah Reports
```javascript
const jamaahReports = {
    "Master Jamaah": {
        filters: ["package", "status", "date_range"],
        columns: ["name", "nik", "package", "payment_status", "document_status"],
        export: ["pdf", "excel", "csv"]
    },
    "Jamaah by Package": {
        groupBy: "package",
        metrics: ["total", "paid", "pending", "documents_complete"],
        visualization: "bar_chart"
    },
    "Jamaah Demographics": {
        breakdowns: ["age", "gender", "region", "occupation"],
        visualization: "pie_chart",
        insights: true
    }
};
```

#### Departure Reports
- Manifest keberangkatan
- Rooming list
- Bus allocation
- Emergency contacts
- Special needs summary

### 2. Financial Reports
Comprehensive financial tracking and analysis

#### Revenue Reports
```javascript
const revenueReports = {
    "Payment Summary": {
        period: "daily|weekly|monthly|yearly",
        breakdown: ["cash", "transfer", "credit"],
        metrics: ["total", "average", "growth"]
    },
    "Outstanding Payments": {
        aging: ["0-30", "31-60", "61-90", "90+"],
        actions: ["send_reminder", "export_list"],
        forecast: true
    },
    "Cash Flow": {
        projection: "next_3_months",
        scenarios: ["best_case", "worst_case", "realistic"],
        visualization: "line_chart"
    }
};
```

#### Package Performance
- Revenue per package
- Profit margins
- Occupancy rates
- Cost analysis
- ROI calculations

### 3. Marketing Reports
Track marketing effectiveness and customer acquisition

#### Lead Analysis
- Source tracking
- Conversion rates
- Campaign ROI
- Channel performance
- Customer journey

#### Sales Pipeline
```javascript
const salesPipeline = {
    stages: ["inquiry", "quotation", "negotiation", "booking", "payment"],
    metrics: {
        volume: "Number of leads per stage",
        value: "Total potential revenue",
        velocity: "Average time in stage",
        conversion: "Stage-to-stage conversion rate"
    }
};
```

### 4. Executive Dashboard
High-level KPIs for management

#### Key Metrics
```javascript
const executiveDashboard = {
    realtime: {
        "Total Jamaah": { current: 12453, target: 50000, growth: "+15%" },
        "Monthly Revenue": { current: 4.5, target: 5.0, unit: "billion" },
        "Package Utilization": { current: 87, target: 95, unit: "%" },
        "Customer Satisfaction": { current: 4.6, target: 4.5, unit: "/5" }
    },
    trends: {
        period: "last_12_months",
        comparisons: "year_over_year",
        projections: "next_quarter"
    }
};
```

## Technical Implementation

### Database Views
```sql
-- Materialized view for performance
CREATE MATERIALIZED VIEW reports.jamaah_summary AS
SELECT 
    p.nama_paket,
    p.tanggal_keberangkatan,
    COUNT(j.id) as total_jamaah,
    COUNT(CASE WHEN ps.status = 'lunas' THEN 1 END) as jamaah_lunas,
    SUM(COALESCE(ps.total_paid, 0)) as total_revenue,
    AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, j.tanggal_lahir))) as avg_age
FROM core.packages p
LEFT JOIN jamaah.jamaah_data j ON j.package_id = p.id
LEFT JOIN finance.payment_summary ps ON ps.jamaah_id = j.id
WHERE j.deleted_at IS NULL
GROUP BY p.id, p.nama_paket, p.tanggal_keberangkatan;

-- Index for fast queries
CREATE INDEX idx_summary_package_date ON reports.jamaah_summary(tanggal_keberangkatan);

-- Refresh schedule
CREATE OR REPLACE FUNCTION refresh_report_summaries()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY reports.jamaah_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY reports.financial_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY reports.operational_metrics;
END;
$$ LANGUAGE plpgsql;
```

### Report Generation Engine
```javascript
class ReportEngine {
    constructor() {
        this.generators = {
            pdf: new PDFGenerator(),
            excel: new ExcelGenerator(),
            csv: new CSVGenerator()
        };
        this.cache = new ReportCache();
    }
    
    async generateReport(reportType, params) {
        // Check cache first
        const cached = await this.cache.get(reportType, params);
        if (cached && !params.force) return cached;
        
        // Generate new report
        const data = await this.fetchData(reportType, params);
        const processed = await this.processData(data, params);
        const report = await this.formatReport(processed, params);
        
        // Cache result
        await this.cache.set(reportType, params, report);
        
        return report;
    }
    
    async scheduleReport(reportType, params, schedule) {
        // Create cron job for scheduled reports
        const job = new CronJob(schedule, async () => {
            const report = await this.generateReport(reportType, params);
            await this.distributeReport(report, params.recipients);
        });
        
        job.start();
        return job;
    }
}
```

### API Endpoints (To Be Implemented)
```javascript
// Report Generation
GET /api/reports/types
GET /api/reports/generate/:type
POST /api/reports/generate
GET /api/reports/download/:id

// Scheduled Reports
GET /api/reports/scheduled
POST /api/reports/schedule
PUT /api/reports/schedule/:id
DELETE /api/reports/schedule/:id

// Analytics
GET /api/analytics/dashboard
GET /api/analytics/metrics/:metric
POST /api/analytics/custom-query
GET /api/analytics/insights

// Export
POST /api/reports/export/:type
GET /api/reports/export/:id/status
GET /api/reports/export/:id/download
```

## UI Components

### Report Dashboard
```html
<div class="reports-dashboard">
    <div class="report-filters glass-card">
        <h3>Report Filters</h3>
        <div class="filter-grid">
            <div class="filter-group">
                <label>Report Type</label>
                <select class="glass-select">
                    <option>Jamaah Summary</option>
                    <option>Financial Overview</option>
                    <option>Package Performance</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Date Range</label>
                <input type="date" class="glass-input">
                <input type="date" class="glass-input">
            </div>
            <div class="filter-group">
                <label>Package</label>
                <select class="glass-select" multiple>
                    <!-- Package options -->
                </select>
            </div>
        </div>
        <div class="filter-actions">
            <button class="glass-button">Generate Report</button>
            <button class="glass-button-secondary">Reset</button>
        </div>
    </div>
    
    <div class="report-content glass-card">
        <div class="report-header">
            <h2>Jamaah Summary Report</h2>
            <div class="export-options">
                <button class="icon-btn"><i class="material-icons">picture_as_pdf</i></button>
                <button class="icon-btn"><i class="material-icons">table_chart</i></button>
                <button class="icon-btn"><i class="material-icons">print</i></button>
            </div>
        </div>
        
        <div class="report-summary">
            <div class="summary-card">
                <h4>Total Jamaah</h4>
                <p class="metric">12,453</p>
                <span class="growth positive">+15%</span>
            </div>
            <!-- More summary cards -->
        </div>
        
        <div class="report-visualization">
            <canvas id="reportChart"></canvas>
        </div>
        
        <div class="report-table">
            <table class="glass-table">
                <!-- Report data -->
            </table>
        </div>
    </div>
</div>
```

### Analytics Widget
```html
<div class="analytics-widget glass-card">
    <div class="widget-header">
        <h4>Revenue Trend</h4>
        <select class="period-selector">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 12 months</option>
        </select>
    </div>
    <div class="widget-content">
        <canvas id="trendChart"></canvas>
    </div>
    <div class="widget-insights">
        <div class="insight">
            <i class="material-icons">trending_up</i>
            <p>Revenue up 23% compared to last period</p>
        </div>
    </div>
</div>
```

## Report Types

### 1. Operational Reports

#### Daily Operations Report
```javascript
{
    sections: [
        "Today's Departures",
        "Arrivals",
        "Active Services",
        "Issues & Resolutions",
        "Tomorrow's Schedule"
    ],
    distribution: ["ops_team", "management"],
    schedule: "daily @ 18:00"
}
```

#### Document Status Report
- Pending verifications
- Expired documents
- Missing documents by jamaah
- Verification timeline

#### Group Manifest
- Complete member list
- Room assignments
- Bus allocations
- Contact sheets

### 2. Financial Reports

#### Payment Aging Report
```javascript
const agingReport = {
    buckets: ["Current", "1-30", "31-60", "61-90", "90+"],
    metrics: {
        count: "Number of jamaah",
        amount: "Total outstanding",
        percentage: "% of total"
    },
    actions: ["Send reminders", "Export for collection"]
};
```

#### Revenue Recognition
- Accrual basis accounting
- Deferred revenue
- Recognized revenue
- Projections

### 3. Compliance Reports

#### Visa Status Report
- Application progress
- Pending submissions
- Approval rates
- Processing times

#### Insurance Coverage
- Active policies
- Claims status
- Coverage gaps
- Renewal schedule

### 4. Custom Reports

#### Report Builder Interface
```javascript
const customReportBuilder = {
    dataSources: ["jamaah", "payments", "packages", "documents"],
    fields: "drag_and_drop_selection",
    filters: "visual_query_builder",
    aggregations: ["sum", "count", "avg", "min", "max"],
    grouping: "multiple_levels",
    sorting: "multi_column",
    visualization: ["table", "chart", "pivot", "map"]
};
```

## Visualization Options

### Chart Types
1. **Bar Charts** - Comparisons
2. **Line Charts** - Trends
3. **Pie Charts** - Distributions
4. **Heat Maps** - Patterns
5. **Gauge Charts** - KPIs
6. **Funnel Charts** - Conversions
7. **Geographic Maps** - Regional data

### Interactive Features
- Drill-down capability
- Filter on click
- Export chart as image
- Real-time updates
- Responsive design

## Performance Optimization

### Caching Strategy
```javascript
const cacheStrategy = {
    levels: {
        memory: "Hot data - 5 minutes",
        redis: "Warm data - 1 hour",
        database: "Materialized views - 6 hours"
    },
    invalidation: {
        event_based: "On data changes",
        time_based: "TTL expiration",
        manual: "Force refresh option"
    }
};
```

### Query Optimization
- Pre-aggregated data
- Indexed columns
- Partitioned tables
- Parallel processing
- Async generation

## Distribution & Scheduling

### Email Reports
```javascript
const emailTemplate = {
    subject: "{{reportName}} - {{date}}",
    body: {
        summary: "Key highlights",
        charts: "Inline images",
        tables: "Top 10 items",
        link: "Full report link"
    },
    attachments: ["PDF", "Excel"],
    recipients: {
        to: ["management@umroh.com"],
        cc: ["finance@umroh.com"],
        schedule: "Every Monday 8 AM"
    }
};
```

### WhatsApp Reports
- Daily summary messages
- Alert notifications
- Payment reminders
- Performance updates

## Security & Access Control

### Report Permissions
```javascript
const permissions = {
    roles: {
        admin: ["all_reports"],
        finance: ["financial_reports", "payment_reports"],
        operations: ["operational_reports", "manifests"],
        marketing: ["lead_reports", "campaign_reports"]
    },
    data_filtering: {
        by_branch: true,
        by_package: true,
        by_date_range: true
    },
    export_restrictions: {
        watermark: true,
        audit_trail: true,
        approval_required: ["financial_reports"]
    }
};
```

## Future Enhancements

### 1. AI-Powered Insights
- Anomaly detection
- Predictive analytics
- Natural language queries
- Automated recommendations
- Trend forecasting

### 2. Real-time Dashboards
- WebSocket updates
- Live KPI tracking
- Alert systems
- Mobile dashboards
- TV display mode

### 3. Advanced Analytics
- Cohort analysis
- Customer lifetime value
- Churn prediction
- Sentiment analysis
- Market basket analysis

### 4. Integration Hub
- Google Analytics
- Social media metrics
- Email campaign data
- Call center logs
- IoT sensor data

## Best Practices

### For Report Design
1. Keep it simple and focused
2. Use consistent formatting
3. Highlight key insights
4. Provide context for numbers
5. Make it actionable

### For Performance
1. Schedule heavy reports off-peak
2. Use incremental updates
3. Implement proper indexing
4. Archive old data
5. Monitor query performance

### For Users
1. Define clear objectives
2. Choose appropriate visualizations
3. Verify data accuracy
4. Document assumptions
5. Share insights, not just data