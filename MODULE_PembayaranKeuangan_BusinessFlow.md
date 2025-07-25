# MODULE: Pembayaran & Keuangan - Business Flow Documentation

## Overview
Modul ini mengelola seluruh transaksi keuangan jamaah dari DP hingga pelunasan, termasuk pembayaran tambahan, verifikasi manual, penanganan pengecualian, dan refund. Sistem mendukung pembayaran bertahap dengan invoice detail per transaksi.

## Actors & Roles
### Primary Actors:
- **Finance Team**: Verifikasi pembayaran, generate invoice
- **All Roles**: Input pembayaran dengan bukti
- **Pimpinan**: Approve pengecualian DP/pelunasan & refund
- **Admin**: Monitor status pembayaran

### System Actor:
- **System**: Calculate H-days, generate alerts, track payment history

## Data Flow Diagram

### 1. Payment Flow
```
Input Payment → Upload Bukti → Submit to Finance → Manual Verification → Update Status
                                                            ↓
                                                    Generate Invoice
```

### 2. Exception Flow
```
Request Exception → Input Reason → Upload Approval → Process Payment
       ↓                                    ↑
   (DP < 5jt or                     Pimpinan Approval
   Pelunasan > H-40)                   (Outside System)
```

### 3. Refund Flow
```
Request Refund → Check Airline Policy → Get Pimpinan Approval → Process Refund
                        ↓                         ↑
                  Calculate Amount          Upload Proof
                  (Manual by Finance)
```

## Validation & Error Handling

### Payment Rules:
1. **DP Requirements**:
   - Standard: Minimum Rp 5,000,000
   - Exception: Can be less with approval
   - Must include reason & approval proof

2. **Payment Schedule**:
   - Standard: Full payment H-40
   - Exception: Can be later with approval
   - System tracks days to departure

3. **Payment Methods**:
   - Cash
   - Bank Transfer
   - Credit Card
   - All require manual verification

### Verification Requirements:
- Mandatory upload proof (image/PDF)
- Finance team manual check
- Update quota only after verification

## Business Rules

### Payment Types:
1. **Down Payment (DP)**:
   - Triggers quota reduction
   - Minimum Rp 5,000,000 (with exceptions)
   - Activates jamaah registration

2. **Installments**:
   - Flexible amounts
   - No fixed schedule
   - Tracked individually

3. **Final Payment**:
   - Due H-40 (with exceptions)
   - Includes all additional costs
   - Completes financial obligation

4. **Additional Costs**:
   - Room upgrades
   - Extra baggage
   - Special services
   - Combined in package payment

### Exception Handling:
1. **DP Exception**:
   - Amount < Rp 5,000,000
   - Requires: Reason + Pimpinan approval proof
   - Example: "Family package deal - approved by Pak Haji"

2. **Late Payment Exception**:
   - Payment after H-40
   - Requires: Reason + Pimpinan approval proof
   - Example: "Waiting for loan approval - approved by Bu Hajjah"

### Invoice Generation:
- One invoice per payment transaction
- Multiple invoices for installment payments
- Detailed breakdown:
  - Package base price
  - Additional services
  - Payment received
  - Outstanding balance
  - Next payment reminder

### Refund Policy:
- Percentage depends on airline policy
- Not predetermined in system
- Process:
  1. Check airline cancellation terms
  2. Get Pimpinan approval for amount
  3. Upload approval proof
  4. Process refund with detailed notes

### System Alerts & Reminders:
1. **Dashboard Alerts**:
   - H-60: Early warning
   - H-40: Payment due alert
   - H-30: Critical warning
   - Shows count of unpaid jamaah

2. **Manual Actions**:
   - Generate WhatsApp links for reminder
   - No automatic messages
   - Team manually contacts jamaah

## API Contracts

### POST /api/payments
**Request Body:**
```json
{
  "jamaah_id": 1,
  "package_id": 1,
  "payment_type": "dp",
  "amount": 3000000,
  "payment_method": "transfer",
  "payment_date": "2025-01-15",
  "bank_name": "BCA",
  "account_number": "1234567890",
  "reference_number": "TRF123456",
  "is_exception": true,
  "exception_reason": "Family package discount",
  "exception_approval": "file_upload_id_123",
  "additional_items": [
    {
      "description": "Room upgrade to suite",
      "amount": 5000000
    }
  ],
  "notes": "Paid via mobile banking",
  "proof_document": "file_upload_id_456"
}
```

### PUT /api/payments/{id}/verify
**Request Body:**
```json
{
  "verified": true,
  "verified_by": "finance_user_id",
  "verification_notes": "Amount confirmed in bank statement"
}
```

### POST /api/payments/{id}/refund
**Request Body:**
```json
{
  "refund_amount": 15000000,
  "refund_percentage": 50,
  "refund_reason": "Visa rejected",
  "airline_policy": "50% refund for visa rejection",
  "approval_document": "file_upload_id_789",
  "approval_notes": "Approved by Pak Haji on 2025-01-15"
}
```

### GET /api/payments/alerts
**Response:**
```json
{
  "summary": {
    "h_60_unpaid": 45,
    "h_40_unpaid": 12,
    "h_30_unpaid": 3,
    "total_outstanding": 450000000
  },
  "details": [
    {
      "jamaah_id": 1,
      "name": "Hajah Fatimah",
      "phone": "081234567890",
      "whatsapp_link": "https://wa.me/6281234567890",
      "package_name": "Umroh Ramadhan",
      "departure_date": "2025-03-15",
      "days_to_departure": 38,
      "outstanding_amount": 20000000,
      "last_payment_date": "2025-01-10"
    }
  ]
}
```

### GET /api/payments/invoice/{payment_id}
**Response:**
```json
{
  "invoice_number": "INV/2025/01/0001",
  "invoice_date": "2025-01-15",
  "jamaah": {
    "name": "Hajah Fatimah",
    "nik": "3301234567890123",
    "address": "Jakarta"
  },
  "package": {
    "name": "Umroh Ramadhan 2025",
    "base_price": 35000000
  },
  "payment_details": {
    "payment_type": "installment",
    "amount_paid": 10000000,
    "payment_method": "transfer",
    "payment_date": "2025-01-15"
  },
  "additional_items": [
    {
      "description": "Room upgrade",
      "amount": 5000000
    }
  ],
  "summary": {
    "total_package": 40000000,
    "total_paid": 25000000,
    "outstanding": 15000000,
    "next_payment_due": "H-40 (2025-02-03)"
  }
}
```

## Edge Cases Handled

1. **Concurrent Payment Entry**:
   - Multiple users entering payment for same jamaah
   - Last verification wins
   - All entries logged

2. **Exception Documentation**:
   - Missing approval document
   - System requires re-upload
   - Tracks all approval history

3. **Refund Complications**:
   - Partial refund scenarios
   - Multiple refund requests
   - Refund exceeds payment

4. **Payment Verification Delays**:
   - Payment made on weekend
   - Bank system downtime
   - Provisional status available

5. **Invoice Corrections**:
   - Wrong amount entered
   - Additional items missed
   - Regenerate invoice with version tracking

6. **Near-Deadline Scenarios**:
   - Payment at H-39
   - System still shows alert until verified
   - Priority verification queue

## Integration Points

1. **With Jamaah Module**:
   - Update payment status
   - Block incomplete payments from departure

2. **With Package Module**:
   - Reduce quota on DP verification
   - Return quota on refund

3. **With Notification Module**:
   - Generate payment reminders
   - Send invoice via WhatsApp

4. **With Reporting Module**:
   - Financial reports
   - Outstanding payment reports
   - Refund analysis

## Audit Trail Requirements
Every financial transaction must log:
- Amount and payment details
- Verification status and by whom
- Exception approvals
- Refund authorizations
- All document uploads
- Timestamp for each action