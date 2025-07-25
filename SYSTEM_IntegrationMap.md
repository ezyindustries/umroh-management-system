# SYSTEM Integration Map
## Sistem Manajemen Umroh - Module Interconnections

### Overview
This document maps all integration points between modules, showing data flow, dependencies, and communication patterns across the system.

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    External Integrations                     │
│  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌──────────────┐  │
│  │Meta Ads │  │   WAHA   │  │ MinIO  │  │Email Service │  │
│  └────┬────┘  └─────┬────┘  └───┬────┘  └──────┬───────┘  │
└───────┼─────────────┼───────────┼──────────────┼───────────┘
        │             │           │              │
┌───────┼─────────────┼───────────┼──────────────┼───────────┐
│       ▼             ▼           ▼              ▼           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Core System Modules                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Module Dependency Matrix

| Module | Depends On | Used By | Integration Type |
|--------|-----------|---------|------------------|
| Authentication | - | ALL | Security Layer |
| Jamaah | Auth, Package | Payment, Document, Group, Family, Export | Data Provider |
| Package | Auth, Hotel, Flight | Jamaah, Payment, Group, Marketing | Configuration |
| Payment | Auth, Jamaah, Package | Finance, Reports | Transaction |
| Document | Auth, Jamaah | Reports, Export | File Management |
| Group | Auth, Jamaah, Package, Family | Export, Flight | Organization |
| Import/Export | ALL | - | Data Exchange |
| Family | Auth, Jamaah | Group, Hotel | Relationship |
| Hotel | Auth, Package | Group, Reports | Accommodation |
| Flight | Auth, Package | Group, Export, Handling | Transportation |
| Ground Handling | Auth, Flight, Package | Reports | Service |
| Inventory | Auth, Package | Distribution | Stock |
| AI Marketing | Package, WAHA | Jamaah, Dashboard | Customer Acquisition |
| Reports | ALL | Dashboard | Analytics |
| Backup | ALL | - | System |
| Monitoring | ALL | Dashboard, Notification | System |
| Notification | ALL | - | UI/UX |
| Brochure | Package | AI Marketing | Content |
| Dashboard | ALL | - | Visualization |

### Core Integration Patterns

#### 1. Authentication Integration
```
Every Module → Auth Module → Verify Token → Allow/Deny Access
                    ↓
              Check User Role
                    ↓
              Log Activity
```

**Integration Points:**
- All API endpoints require valid JWT
- User context passed to all modules
- Activity logging for audit trail
- Session management

#### 2. Jamaah-Centric Integration
```
Jamaah Module ← → Package Assignment
      ↓           ← → Payment Records
      ↓           ← → Document Upload
      ↓           ← → Family Grouping
      ↓           ← → Group Formation
      ↓
Central Data Hub
```

**Key Integrations:**
- Primary entity for most operations
- Referenced by: payments, documents, groups
- Status affected by: payments, documents
- Exported to: Excel, WhatsApp

#### 3. Package-Based Organization
```
Package (PNR) → Flight Details
      ↓      → Hotel Options
      ↓      → Pricing Tiers
      ↓      → Brochure Content
      ↓
Jamaah Assignment
```

**Integration Flow:**
- Package defines travel product
- Links to operational details
- Drives marketing content
- Controls capacity

#### 4. Financial Flow Integration
```
Jamaah → Payment → Invoice Generation
              ↓
        Finance Module
              ↓
        Status Update → Jamaah Status
                     → Package Capacity
                     → Reports
```

**Process Integration:**
- Payment affects jamaah status
- Updates package availability
- Triggers notifications
- Feeds analytics

#### 5. Document Workflow
```
Jamaah → Upload Document → Version Control
                        → Verification
                        → Status Update
                        → Completeness Check
```

**System Integration:**
- Storage via MinIO/S3
- Metadata in PostgreSQL
- Status affects reports
- Passport expiry monitoring

#### 6. Group Management Integration
```
Package → Group Creation → Family Assignment
                       → Room Allocation
                       → Bus Assignment
                       → Manifest Generation
```

**Complex Integration:**
- Pulls from family relationships
- Considers payment status
- Affects hotel arrangements
- Feeds ground handling

#### 7. WhatsApp AI Integration
```
Meta Ads → Click → WhatsApp (WAHA) → AI Bot
                                   ↓
                            Package Lookup
                                   ↓
                            Send Brochure
                                   ↓
                            Lead Creation → Dashboard
```

**External Integration:**
- Meta Ads provides tracking codes
- WAHA handles messaging
- AI accesses package data
- Creates leads in system

#### 8. Export/Import Integration
```
All Modules → Data Collection → Format Conversion → Excel Export
                              → Validation       ← Excel Import
                              → Manifest Format
                              → Siskopatuh Format
```

**Bidirectional Integration:**
- Reads from all modules
- Writes to jamaah, payments
- Validates against existing data
- Maintains referential integrity

#### 9. Monitoring & Performance
```
All Modules → Metrics Collection → Aggregation → Dashboard
           → Error Logging      → Alerting   → WhatsApp/Email
           → Performance Data   → Analysis   → Recommendations
```

**System-Wide Integration:**
- Hooks into all operations
- Non-blocking collection
- Real-time processing
- Predictive analytics

#### 10. Backup & Recovery Integration
```
All Modules → Data Snapshot → Compression → Storage
                           → Verification → Ready for Restore
                                        ← Restore Process
```

**Critical Integration:**
- Captures all databases
- Includes uploaded files
- Maintains consistency
- Supports partial restore

### API Integration Standards

#### RESTful Patterns
```
GET    /api/{module}          - List with filters
GET    /api/{module}/{id}     - Single entity
POST   /api/{module}          - Create new
PUT    /api/{module}/{id}     - Full update
PATCH  /api/{module}/{id}     - Partial update
DELETE /api/{module}/{id}     - Soft delete
```

#### Common Headers
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
X-User-ID: {user_id}
X-Request-ID: {uuid}
```

#### Standard Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "metadata": {
    "timestamp": "2025-01-25T10:00:00Z",
    "version": "1.0"
  }
}
```

### Data Flow Patterns

#### 1. Create Flow
```
User Input → Validation → Business Rules → Database → Audit Log
                                                   → Notification
                                                   → Cache Update
```

#### 2. Update Flow
```
Fetch Current → Compare Changes → Validate → Update → Log Changes
                                                   → Notify Users
                                                   → Sync Related
```

#### 3. Query Flow
```
Request → Auth Check → Build Query → Cache Check → Database
                                  ↓            → Response
                                  → Cache Hit → Response
```

### Integration Security

#### API Security
- JWT tokens with expiry
- Role-based permissions
- Rate limiting per endpoint
- Request signing for webhooks

#### Data Security
- Encryption in transit (HTTPS)
- Encryption at rest (database)
- Sensitive data masking
- Audit trail encryption

### Integration Monitoring

#### Health Checks
```
/api/health           - Overall system
/api/health/database  - Database connection
/api/health/storage   - File storage
/api/health/external  - External services
```

#### Integration Metrics
- API response times
- Integration success rates
- Data sync delays
- Error frequencies

### Error Handling

#### Integration Failures
1. **Graceful Degradation**
   - Continue with available services
   - Queue failed operations
   - Retry with backoff

2. **Circuit Breaker**
   - Prevent cascade failures
   - Auto-recovery detection
   - Fallback mechanisms

3. **Error Propagation**
   - Consistent error format
   - Meaningful error messages
   - Correlation IDs

### Future Integration Points

#### Planned Integrations
1. **E-Visa System**
   - API for visa status
   - Document submission
   - Status tracking

2. **Insurance Providers**
   - Policy creation API
   - Claims submission
   - Document exchange

3. **Payment Gateways**
   - Multiple provider support
   - Automatic reconciliation
   - Refund automation

4. **Airline Systems**
   - Real-time flight updates
   - Seat selection
   - Check-in integration

### Integration Best Practices

1. **Loose Coupling**
   - Modules communicate via APIs
   - No direct database access
   - Event-driven where applicable

2. **Data Consistency**
   - Transactional boundaries
   - Eventual consistency accepted
   - Compensation patterns

3. **Performance**
   - Batch operations supported
   - Pagination mandatory
   - Caching strategies

4. **Maintainability**
   - Versioned APIs
   - Backward compatibility
   - Deprecation notices

### Conclusion
The integration architecture ensures seamless data flow while maintaining module independence. The trust-based security model with comprehensive audit trails enables efficient operations without compromising accountability.