# MASTER Business Requirements Document
## Sistem Manajemen Umroh Terpadu

### Executive Summary
Sistem Manajemen Umroh adalah platform terpadu untuk mengelola seluruh aspek operasional travel umroh dengan target kapasitas 50,000 jamaah per tahun. Sistem ini dirancang untuk menggantikan proses manual yang rentan error dengan solusi digital yang efisien, akurat, dan kolaboratif.

### Business Objectives
1. **Efisiensi Operasional**
   - Input data jamaah < 3 menit per entry
   - Import massal via Excel dengan success rate > 95%
   - Automasi proses rutin dan reminder

2. **Akurasi Data**
   - Duplikasi data < 0.5%
   - Validasi otomatis semua field kritis
   - Audit trail lengkap untuk setiap perubahan

3. **Kolaborasi Tim**
   - Multi-role access dengan permission berbasis kepercayaan
   - Real-time data sharing antar departemen
   - Centralized communication via notes

4. **Skalabilitas**
   - Support 50,000 jamaah/tahun
   - Modular architecture untuk ekspansi
   - Performance optimization built-in

### Core Business Processes

#### 1. Customer Journey Management
- **Lead Generation**: AI-powered WhatsApp bot terintegrasi Meta Ads
- **Lead Nurturing**: Automated conversation dengan fase LEADS → INTEREST → BOOKING
- **Registration**: Multi-channel (form, Excel import, WhatsApp)
- **Document Collection**: Flexible upload dengan versioning
- **Payment Processing**: DP dan pelunasan dengan exception handling
- **Pre-Departure**: Perlengkapan, dokumen, group formation
- **Travel Execution**: Manifest, handling, accommodation
- **Post-Travel**: Status update, feedback collection

#### 2. Operational Management
- **Package Creation**: Berdasarkan PNR dengan sub-paket hotel
- **Inventory Control**: Perlengkapan dengan alert system
- **Group Formation**: Manual dengan smart suggestions
- **Document Verification**: Multi-user dengan tracking
- **Financial Reconciliation**: Payment tracking dengan invoice

#### 3. Support Functions
- **Backup & Recovery**: Auto 12-hour dengan manual restore
- **Monitoring**: Comprehensive metrics dan alerting
- **Reporting**: Real-time dashboard dengan drill-down
- **Communication**: WhatsApp integration untuk customer dan internal

### System Architecture Overview

#### Technology Stack
- **Frontend**: React.js dengan responsive design
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL dengan audit tables
- **Storage**: MinIO/S3-compatible untuk documents
- **Integration**: WAHA untuk WhatsApp
- **Deployment**: Docker dengan cloud-ready architecture

#### Security & Compliance
- JWT-based authentication
- Role-based access control (trust-based)
- Complete audit logging
- Soft-delete dengan history
- Data encryption at rest dan in transit

#### Scalability Design
- Horizontal scaling capability
- Database optimization dengan indexing
- Caching layer untuk performance
- Modular microservices architecture
- API-first design

### Module Summary

#### Developed Modules (20)
1. **Authentication & User Management**: Multi-role dengan manual assignment
2. **Jamaah Management**: Core data dengan age categories dan special needs
3. **Package Management**: Flexible dengan sub-packages dan auto status
4. **Payment & Finance**: Exception handling dengan manual verification
5. **Document Management**: Versioning dengan passport expiry tracking
6. **Group Management**: Manual formation dengan family grouping
7. **Import/Export Excel**: Manifest dan Siskopatuh format support
8. **Family Relations**: Manual grouping untuk room assignment
9. **Hotel Management**: Sub-packages dengan confirmation tracking
10. **Flight Management**: PNR-based dengan capacity tracking
11. **Ground Handling**: Note-based coordination system
12. **Inventory Management**: Stock control dengan distribution proof
13. **Distribution**: Integrated dengan inventory
14. **AI Marketing**: WhatsApp bot dengan Meta Ads integration
15. **Reporting & Analytics**: Real-time problem monitoring
16. **Backup & Recovery**: Automated dengan manual restore
17. **Monitoring & Performance**: Comprehensive metrics
18. **Notification System**: Visual flags per user
19. **Brochure Management**: Digital assets untuk AI bot
20. **Dashboard & Analytics**: Unified view dengan comparisons

#### Pending Modules (4)
21. **Visa/Immigration**: Tracking dan document management
22. **Travel Insurance**: Policy management dan claims
23. **Complaint Handling**: Customer service ticketing
24. **Agent/Partner Management**: B2B portal dan commission

### Key Business Rules

#### Data Management
- NIK sebagai primary key untuk WNI
- Passport number untuk non-WNI
- No hard delete, only soft delete
- Complete audit trail mandatory
- Manual override dengan documentation

#### Financial Rules
- DP default: Rp 5,000,000 (flexible)
- Pelunasan: H-40 (flexible)
- Exception requires reason + proof
- Invoice per transaction
- Refund manual dengan approval

#### Operational Rules
- Package based on PNR
- 1 PNR = 1 Package = 1 Departure
- Manual group formation
- Document deadline: H-40
- No automatic cancellation

#### Communication Rules
- All notes timestamped dengan author
- WhatsApp untuk external
- Dashboard flags untuk internal
- Manual coordination preferred
- Trust-based operations

### Success Metrics

#### Operational KPIs
- Data entry time: < 3 minutes
- Import success rate: > 95%
- Document completion: Before H-40
- Payment collection: Before H-40
- System uptime: > 99.5%

#### Business KPIs
- Lead conversion: > 10%
- Customer satisfaction: > 4.5/5
- Operational cost reduction: > 30%
- Error rate reduction: > 80%
- Team productivity: +50%

### Implementation Roadmap

#### Phase 1: Foundation (Completed)
- Core modules development
- Basic integrations
- User training materials
- Initial deployment

#### Phase 2: Enhancement (Next)
- Visa/Immigration module
- Insurance integration
- Advanced analytics
- Mobile optimization

#### Phase 3: Expansion (Future)
- B2B agent portal
- Multi-branch support
- Advanced AI features
- International scaling

### Risk Mitigation

#### Technical Risks
- Regular backups dengan offsite storage
- Monitoring dengan alerting
- Graceful degradation
- Disaster recovery plan

#### Business Risks
- Change management program
- Phased rollout approach
- Parallel run period
- Comprehensive training

#### Compliance Risks
- Data protection measures
- Audit trail completeness
- Regular security updates
- Legal review process

### Conclusion
This system represents a comprehensive digital transformation of umroh travel operations, designed with flexibility, scalability, and user-friendliness at its core. The trust-based approach with complete audit trails enables efficient operations while maintaining accountability.