# Marketing Feature with AI & WhatsApp Integration

## Overview
Fitur marketing dengan integrasi WhatsApp via WAHA dan AI untuk otomasi pipeline management.

## Features

### 1. Pipeline Management
- **Leads**: Chat masuk pertama kali, AI akan reply dengan brosur/info paket
- **Interest**: Customer bertanya detail (harga, fasilitas, syarat)
- **Booked**: Customer melakukan pembayaran

### 2. AI Auto-Reply
- Analisis pesan masuk dengan OpenAI
- Extract informasi: nama, kode paket, jumlah orang, bulan keberangkatan
- Auto-reply berdasarkan stage dan konteks
- Template management untuk berbagai skenario

### 3. Dashboard Statistics
- Leads tahun ini, bulan ini, hari ini, kemarin
- Closing bulan ini dan hari ini
- Pipeline overview dengan conversion rate
- Customer list dengan search dan filter

### 4. WhatsApp Integration
- Webhook endpoint: `/api/marketing/webhook/waha`
- Auto-save semua conversation
- Click to WhatsApp direct link
- Track last message (from customer/agent)

### 5. Reminder System
- Auto set payment due date H-40 untuk booked customers
- Notification untuk follow up

## Setup

### 1. Environment Variables
```env
# WhatsApp Integration (WAHA)
WAHA_API_URL=http://localhost:3000
WAHA_SESSION=default

# AI Integration (OpenAI)
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. WAHA Configuration
1. Install WAHA: https://github.com/devlikeapro/waha
2. Start WAHA server
3. Configure webhook to: `https://your-domain.com/api/marketing/webhook/waha`

### 3. Database Migration
```bash
cd backend
npm run migrate
```

## API Endpoints

### Public (No Auth)
- `POST /api/marketing/webhook/waha` - WAHA webhook endpoint

### Protected (Auth Required)
- `GET /api/marketing/statistics` - Dashboard statistics
- `GET /api/marketing/customers` - Customer list with filters
- `GET /api/marketing/customers/:id` - Customer detail with conversations
- `PATCH /api/marketing/customers/:id/stage` - Update pipeline stage
- `GET /api/marketing/templates` - Get auto-reply templates
- `POST /api/marketing/templates` - Create/update template

## Auto-Reply Flow

### Leads Stage
1. Customer kirim pesan pertama
2. AI analisis: ada kode paket?
   - Ya: Reply template paket spesifik
   - Tidak: Reply brosur umum + tanya berapa orang & bulan
3. Update customer data

### Interest Stage
1. Customer tanya detail (harga, hotel, dll)
2. AI reply dengan info lengkap
3. Track pertanyaan untuk personalisasi

### Booked Stage
1. Customer konfirmasi booking
2. Set payment due date H-40
3. Send payment instructions
4. Create reminder

## Template Variables
Templates support these variables:
- `{customer_name}` - Nama customer
- `{package_name}` - Nama paket
- `{package_price}` - Harga paket
- `{departure_date}` - Tanggal keberangkatan
- `{payment_due}` - Tanggal jatuh tempo

## Security
- Webhook endpoint public (untuk WAHA)
- Semua endpoint lain require authentication
- Role-based access (Admin, Marketing)
- All conversations logged