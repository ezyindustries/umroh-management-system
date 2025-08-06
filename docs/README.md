# Umroh Management System - Documentation

## Overview
Umroh Management System adalah aplikasi manajemen komprehensif untuk mengelola seluruh aspek perjalanan umroh, mulai dari pendaftaran jamaah hingga laporan akhir. Sistem ini dirancang untuk menangani 50.000 jamaah per tahun dengan efisiensi tinggi.

## Table of Contents

### 1. Features Documentation
- [Dashboard](/docs/features/01-dashboard.md)
- [Jamaah Management](/docs/features/02-jamaah-management.md)
- [Package Management](/docs/features/03-package-management.md)
- [Payment Management](/docs/features/04-payment-management.md)
- [Document Management](/docs/features/05-document-management.md)
- [Group Management](/docs/features/06-group-management.md)
- [Marketing](/docs/features/07-marketing.md)
- [Hotel Management](/docs/features/08-hotel-management.md)
- [Equipment Management](/docs/features/09-equipment-management.md)
- [Flight Management](/docs/features/10-flight-management.md)
- [Ground Handling](/docs/features/11-ground-handling.md)
- [Reports & Analytics](/docs/features/12-reports.md)
- [Excel Import/Export](/docs/features/13-excel-import-export.md)

### 2. API Documentation
- [RESTful API Endpoints](/docs/api/endpoints.md)
- [Authentication & Authorization](/docs/api/authentication.md)
- [API Response Formats](/docs/api/responses.md)
- [Error Handling](/docs/api/errors.md)

### 3. Database Documentation
- [Database Schema](/docs/database/schema.md)
- [Tables & Relationships](/docs/database/tables.md)
- [Migrations](/docs/database/migrations.md)
- [Data Dictionary](/docs/database/data-dictionary.md)

### 4. UI Components
- [Glassmorphism Design System](/docs/ui-components/design-system.md)
- [Modal Components](/docs/ui-components/modals.md)
- [Form Components](/docs/ui-components/forms.md)
- [Card Components](/docs/ui-components/cards.md)
- [Navigation](/docs/ui-components/navigation.md)

### 5. Development Suggestions
- [Unimplemented Features](/docs/suggestions/unimplemented-features.md)
- [Performance Optimizations](/docs/suggestions/performance.md)
- [Security Enhancements](/docs/suggestions/security.md)
- [UX Improvements](/docs/suggestions/ux-improvements.md)

## Quick Start

### Prerequisites
- Node.js v14+
- PostgreSQL 12+
- MinIO or S3-compatible storage

### Installation
```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Setup database
npm run migrate

# Start server
npm start
```

### Environment Variables
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=umroh_management
DB_USER=platform_admin
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
```

## Architecture Overview

### Technology Stack
- **Frontend**: HTML5, CSS3 (Glassmorphism), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with multiple schemas
- **Storage**: MinIO/S3 for documents
- **Authentication**: JWT-based

### Design Patterns
- MVC Architecture
- RESTful API Design
- Schema-based Multi-tenancy
- Event-driven Logging
- Soft Delete Pattern

## Key Features

1. **Multi-role Access System**
   - Admin, Marketing, Keuangan, Operator, Tim Visa, Tim Ticketing, Tim Hotel

2. **Comprehensive Data Management**
   - Jamaah profiles with family relationships
   - Package management with auto-pricing
   - Payment tracking with installments
   - Document management with versioning

3. **Automation Features**
   - Auto hotel booking on package creation
   - Auto flight assignment
   - Auto document generation
   - Auto notification system

4. **Reporting & Analytics**
   - Real-time dashboards
   - Financial reports
   - Operational reports
   - Export capabilities

## Security Features
- JWT-based authentication
- Role-based access control
- Audit logging for all actions
- Soft delete for data retention
- Input validation and sanitization

## Performance Targets
- Handle 50,000 jamaah/year
- Response time < 5 seconds
- Data entry < 3 minutes
- Excel import success rate > 95%
- System uptime > 99.9%

## Support & Maintenance
For technical support, please contact the development team or refer to the troubleshooting guide in the documentation.