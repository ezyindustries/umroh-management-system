# Payment Management Feature Documentation

## Overview
Payment Management mengelola seluruh transaksi pembayaran jamaah, termasuk cicilan, tracking pembayaran, validasi, dan laporan keuangan. Sistem mendukung multiple payment methods dan installment plans.

## Features

### 1. Payment Dashboard
Overview pembayaran dengan statistik:

#### Statistics Cards:
- **Total Pemasukan**: Semua pembayaran masuk
- **Pembayaran Hari Ini**: Real-time update
- **Outstanding Balance**: Total piutang
- **Overdue Payments**: Pembayaran terlambat

#### Charts & Graphs:
- Payment trend (monthly)
- Payment method distribution
- Collection rate
- Aging analysis

### 2. Payment List View
Tabel pembayaran dengan fitur lengkap:

#### Display Columns:
- Transaction ID
- Jamaah Name
- Package
- Amount
- Payment Date
- Method
- Status
- Receipt
- Actions

#### Filter Options:
- Date range
- Payment status
- Payment method
- Package
- Amount range
- Overdue only

#### Bulk Actions:
- Export selected
- Print receipts
- Send reminders
- Mark as verified

### 3. Add Payment Modal
Form input pembayaran dengan validasi:

#### Payment Information:
- **Jamaah**: Searchable dropdown
- **Package**: Auto-filled from jamaah
- **Payment Type**: DP/Cicilan/Pelunasan
- **Amount**: Currency input
- **Payment Date**: Date picker
- **Payment Method**: 
  - Bank Transfer
  - Cash
  - Credit Card
  - Virtual Account
  - QRIS

#### Bank Transfer Details:
- **Bank Name**: Dropdown
- **Account Number**: From account
- **Reference Number**: Unique
- **Transfer Receipt**: Image upload

#### Additional Fields:
- **Notes**: Optional notes
- **Verified By**: Auto-filled
- **Verification Date**: Timestamp

### 4. Payment Plans
Flexible installment management:

#### Plan Types:
1. **Standard Plan**:
   - 50% DP
   - 3x cicilan
   - Pelunasan H-30

2. **Easy Plan**:
   - 30% DP
   - 5x cicilan
   - Pelunasan H-14

3. **Custom Plan**:
   - Flexible DP
   - Custom installments
   - Negotiable terms

#### Plan Features:
- Auto-calculate installments
- Payment reminders
- Overdue notifications
- Penalty calculations

### 5. Payment Verification
Multi-level verification process:

#### Verification Steps:
1. **Receipt Upload**: Jamaah/agent uploads
2. **Initial Check**: Admin verifies
3. **Bank Reconciliation**: Match with statement
4. **Final Approval**: Finance manager
5. **System Update**: Auto-update status

#### Verification Features:
- Receipt preview
- Bank statement matching
- Duplicate detection
- Amount validation
- Auto-notification

## Technical Implementation

### Frontend Components

#### JavaScript Functions:
```javascript
// Main functions
loadPayments()           // Load payment list
addPayment()            // Open payment modal
savePayment(event)      // Save payment data
verifyPayment(id)       // Verify payment
viewReceipt(id)         // Show receipt modal
printReceipt(id)        // Generate PDF receipt
exportPayments()        // Export to Excel

// Utility functions
calculateBalance()       // Calculate remaining
formatPaymentAmount()    // Format currency
validatePayment()        // Check payment rules
generateReceiptNumber()  // Auto receipt number
sendPaymentNotification() // Send WhatsApp/Email
checkDuplicatePayment()  // Prevent duplicates
```

#### Payment Form Structure:
```html
<div class="payment-modal">
    <form id="paymentForm">
        <div class="payment-header">
            <h3>Input Pembayaran</h3>
            <span class="receipt-number">RCP-2024-0001</span>
        </div>
        <div class="payment-body">
            <!-- Jamaah selection -->
            <!-- Payment details -->
            <!-- Bank information -->
            <!-- Receipt upload -->
        </div>
        <div class="payment-footer">
            <button type="submit">Simpan Pembayaran</button>
        </div>
    </form>
</div>
```

### Backend API

#### Endpoints:

1. **GET /api/payments**
   - Query params: filters, pagination
   - Returns: Payment list

2. **GET /api/payments/:id**
   - Returns: Payment details with jamaah info

3. **POST /api/payments**
   - Body: Payment data
   - Process: 
     - Validate amount
     - Check duplicates
     - Update jamaah balance
     - Generate receipt
   - Returns: Payment with receipt

4. **PUT /api/payments/:id/verify**
   - Body: Verification data
   - Process:
     - Update status
     - Log verification
     - Send notification
   - Returns: Updated payment

5. **GET /api/payments/statistics**
   - Query: date range
   - Returns: Payment analytics

6. **POST /api/payments/reminder**
   - Body: Jamaah IDs
   - Send: Payment reminders
   - Returns: Send status

7. **GET /api/payments/export**
   - Query: filters
   - Returns: Excel file

### Database Schema

#### Main Table: finance.payments
```sql
CREATE TABLE finance.payments (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id),
    package_id INTEGER REFERENCES core.packages(id),
    payment_type VARCHAR(50) NOT NULL, -- DP, Cicilan, Pelunasan
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    -- Bank details
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_holder VARCHAR(255),
    reference_number VARCHAR(100),
    -- Verification
    status VARCHAR(50) DEFAULT 'pending',
    verified_by INTEGER,
    verified_at TIMESTAMP,
    verification_notes TEXT,
    -- Receipt
    receipt_url TEXT,
    receipt_uploaded_at TIMESTAMP,
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER,
    updated_at TIMESTAMP,
    updated_by INTEGER,
    deleted_at TIMESTAMP
);
```

#### Related Tables:
```sql
-- Payment plans
CREATE TABLE finance.payment_plans (
    id SERIAL PRIMARY KEY,
    jamaah_id INTEGER REFERENCES jamaah.jamaah_data(id),
    package_id INTEGER REFERENCES core.packages(id),
    total_amount DECIMAL(12,2) NOT NULL,
    dp_amount DECIMAL(12,2) NOT NULL,
    dp_percentage INTEGER,
    installment_count INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payment schedules
CREATE TABLE finance.payment_schedules (
    id SERIAL PRIMARY KEY,
    payment_plan_id INTEGER REFERENCES finance.payment_plans(id),
    installment_number INTEGER,
    due_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    paid_date DATE,
    payment_id INTEGER REFERENCES finance.payments(id)
);

-- Payment reminders
CREATE TABLE finance.payment_reminders (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES finance.payment_schedules(id),
    reminder_type VARCHAR(50), -- SMS, WhatsApp, Email
    sent_at TIMESTAMP,
    response_status VARCHAR(50),
    next_reminder DATE
);
```

## Payment Calculations

### Balance Calculation:
```javascript
function calculateJamaahBalance(jamaahId) {
    const package = getJamaahPackage(jamaahId);
    const payments = getJamaahPayments(jamaahId);
    
    const totalPrice = package.harga;
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalPrice - totalPaid;
    
    return {
        totalPrice,
        totalPaid,
        balance,
        percentage: (totalPaid / totalPrice) * 100,
        status: balance === 0 ? 'Lunas' : 'Belum Lunas'
    };
}
```

### Installment Calculation:
```javascript
function calculateInstallments(totalAmount, dpPercentage, installmentCount) {
    const dpAmount = totalAmount * (dpPercentage / 100);
    const remaining = totalAmount - dpAmount;
    const installmentAmount = remaining / installmentCount;
    
    return {
        dp: dpAmount,
        installments: Array(installmentCount).fill(installmentAmount),
        total: totalAmount
    };
}
```

## Payment Methods Integration

### 1. Bank Transfer:
- Manual verification
- Bank statement import
- Auto-reconciliation

### 2. Virtual Account:
- Auto-generate VA number
- Real-time notification
- Auto-verification

### 3. QRIS:
- Generate QR code
- Instant payment notification
- Auto-receipt generation

### 4. Credit Card:
- Payment gateway integration
- 3D Secure validation
- Installment options

## Receipt Management

### Receipt Generation:
```javascript
async function generateReceipt(paymentId) {
    const payment = await getPayment(paymentId);
    const receiptData = {
        number: payment.receipt_number,
        date: payment.payment_date,
        jamaah: payment.jamaah_name,
        amount: payment.amount,
        method: payment.payment_method,
        package: payment.package_name
    };
    
    const pdf = await generatePDF('receipt-template', receiptData);
    return uploadToStorage(pdf);
}
```

### Receipt Features:
- QR code verification
- Digital signature
- Watermark
- Auto-email
- Print-ready format

## Financial Reports

### Report Types:
1. **Daily Collection Report**
2. **Payment Method Summary**
3. **Outstanding Balance Report**
4. **Overdue Payment Report**
5. **Cash Flow Projection**
6. **Revenue by Package**
7. **Collection Performance**

### Report Features:
- Real-time generation
- Multiple export formats
- Scheduled reports
- Email distribution
- Dashboard widgets

## Security & Compliance

### Security Measures:
1. **Encryption**: Payment data encryption
2. **Audit Trail**: All payment changes logged
3. **Access Control**: Role-based permissions
4. **Verification**: Multi-level approval
5. **Backup**: Daily payment data backup

### Compliance:
- PCI DSS compliance ready
- Tax reporting support
- Shariah compliance tracking
- Financial audit trail
- Regulatory reporting

## Notifications System

### Notification Types:
1. **Payment Confirmation**: To jamaah
2. **Payment Reminder**: Before due date
3. **Overdue Notice**: After due date
4. **Receipt Delivery**: After verification
5. **Balance Update**: After each payment

### Channels:
- WhatsApp (primary)
- SMS
- Email
- In-app notification
- Push notification (mobile)

## Integration Points

### 1. Jamaah Management:
- Payment history in profile
- Balance display
- Payment status badge

### 2. Package Management:
- Package price reference
- Payment terms
- Discount application

### 3. Document Management:
- Payment completion requirement
- Document release trigger

### 4. Group Management:
- Group payment tracking
- Collective reminders

### 5. Reports:
- Financial dashboards
- Revenue analytics
- Collection metrics

## Performance Optimization

1. **Query Optimization**:
   - Indexed payment searches
   - Cached balance calculations
   - Optimized report queries

2. **Real-time Updates**:
   - WebSocket for live data
   - Incremental updates
   - Background processing

3. **Bulk Operations**:
   - Batch payment import
   - Bulk verification
   - Mass reminder sending

## Future Enhancements

### Planned Features:
1. **Payment Gateway Integration**:
   - Multiple gateway support
   - Auto-reconciliation
   - Refund management
   - Chargeback handling

2. **Advanced Analytics**:
   - Payment prediction
   - Default risk scoring
   - Revenue forecasting
   - Customer lifetime value

3. **Automation**:
   - Auto-payment collection
   - Smart reminder scheduling
   - Dunning management
   - Collection optimization

4. **Mobile Payment**:
   - Mobile app integration
   - NFC payment support
   - Digital wallet integration
   - Biometric authentication

### Suggested Improvements:
1. Implement partial payment support
2. Add payment plan templates
3. Create payment voucher system
4. Add multi-currency support
5. Implement early payment discounts
6. Add payment insurance option
7. Create payment reward system
8. Add family payment grouping
9. Implement payment guarantee/collateral
10. Add crowdfunding option for payments