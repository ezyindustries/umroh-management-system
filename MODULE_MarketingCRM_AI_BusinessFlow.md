# MODULE: Marketing & CRM dengan AI - Business Flow Documentation

## Overview
Modul ini mengotomasi customer journey dari leads hingga booking menggunakan AI WhatsApp chatbot. Sistem terintegrasi dengan Meta Ads tracking code, mengelola percakapan otomatis, kategorisasi fase customer, dan handover ke admin saat customer siap booking.

## Actors & Roles
### Primary Actors:
- **AI Chatbot**: Handle percakapan otomatis, kategorisasi fase
- **Marketing Admin**: Update prompt, monitor performance, handle escalation
- **Sales Admin**: Follow up customer di fase booking
- **System Admin**: Manage integration, update content

### System Actor:
- **System**: Track metrics, generate reports, manage handover

## Data Flow Diagram

### 1. Lead Generation Flow
```
Meta Ads → Click with Code → WhatsApp Message → AI Identifies Code → Send Package Info
                                                           ↓
                                                   Track as LEADS Phase
```

### 2. Customer Journey Flow
```
LEADS → AI Conversation → INTEREST → More Details → BOOKING → Handover to Admin
   ↓                          ↓                         ↓
Send Package List      Send Brochure/Itinerary    Dashboard Alert
```

### 3. Escalation Flow
```
Unknown Question → AI Can't Answer → Flag for Admin → Add to Dashboard
                                            ↓
                                    Admin Takes Over
```

## Validation & Error Handling

### AI Conversation Rules:
1. **Code Recognition**:
   - Valid code → Send specific package
   - No code → Ask preferences
   - Invalid code → Fallback to general

2. **Phase Transitions**:
   - Clear triggers for phase change
   - Automatic categorization
   - No backward movement

3. **Handover Criteria**:
   - Payment intent detected
   - Complex questions
   - Customer request
   - AI confidence low

## Business Rules

### Campaign Code Management:
1. **Code Structure**:
   - Linked to package in database
   - Format: PKG_MONTH_YEAR_TYPE
   - Example: UMR_MAR_2025_HEMAT

2. **Code Tracking**:
   - Source: Meta Ads Campaign
   - Click timestamp
   - Conversion tracking

### AI Response Framework:

#### Phase 1: LEADS
1. **With Code**:
   ```
   Customer: UMR_MAR_2025_HEMAT
   
   AI: Assalamualaikum! Terima kasih telah tertarik dengan 
   Paket Umroh Maret 2025 Hemat kami 🕋
   
   [Send package image]
   
   Harga: Rp 25.000.000
   Keberangkatan: 15 Maret 2025
   Durasi: 9 hari
   
   Apakah Bapak/Ibu ingin mengetahui detail fasilitasnya?
   ```

2. **Without Code**:
   ```
   AI: Assalamualaikum! Selamat datang di [Company Name] 🕋
   
   Untuk membantu memberikan rekomendasi terbaik:
   1. Berapa orang yang akan berangkat?
   2. Bulan apa yang Bapak/Ibu inginkan?
   
   Berikut jadwal umroh kami musim ini:
   [List of available packages]
   ```

#### Phase 2: INTEREST
- Customer asks about details
- AI sends:
  - Digital brochure
  - Detailed itinerary
  - Hotel information
  - Inclusions/exclusions
  - Payment terms

#### Phase 3: BOOKING
- Customer shows payment intent
- Triggers:
  - "Cara bayar?"
  - "DP berapa?"
  - "Mau daftar"
- AI creates lead in dashboard
- Notifies admin

### Content Management:
1. **Package Database Fields**:
   - Package code (for AI)
   - Package name
   - Price
   - Departure date
   - Quota status
   - Brochure image URL
   - Itinerary document
   - Key features list

2. **AI Access Rights**:
   - Read package data
   - Check quota status
   - Retrieve media files
   - Log conversations

### Prompt Engineering:
1. **Admin Capabilities**:
   - Update AI personality
   - Add FAQ responses
   - Modify conversation flow
   - Set escalation triggers

2. **Prompt Structure**:
   ```
   Base prompt + 
   Company info + 
   Package data access + 
   Conversation rules + 
   Escalation criteria
   ```

### WhatsApp Integration (WAHA):
1. **Capabilities**:
   - Send/receive messages
   - Send images
   - Send documents
   - Typing indicators
   - Read receipts

2. **Media Handling**:
   - Images from package DB
   - PDF brochures
   - Location maps
   - Video testimonials

## API Contracts

### POST /api/whatsapp/webhook
**WhatsApp Incoming Message:**
```json
{
  "from": "6281234567890",
  "body": "UMR_MAR_2025_HEMAT",
  "timestamp": "2025-01-25 10:30:00",
  "message_id": "wamid.xxx"
}
```

### POST /api/ai/process-message
**Request Body:**
```json
{
  "phone": "6281234567890",
  "message": "UMR_MAR_2025_HEMAT",
  "conversation_id": "conv_123",
  "current_phase": "leads"
}
```

**Response:**
```json
{
  "response_text": "Assalamualaikum! Terima kasih...",
  "media_to_send": [
    {
      "type": "image",
      "url": "https://example.com/package_image.jpg"
    }
  ],
  "new_phase": "leads",
  "confidence": 0.95,
  "should_escalate": false
}
```

### POST /api/marketing/leads
**AI Creates Lead:**
```json
{
  "phone": "6281234567890",
  "name": "From WhatsApp",
  "phase": "booking",
  "interested_package": "UMR_MAR_2025_HEMAT",
  "conversation_summary": "Customer interested in March package, asking about payment",
  "source": "meta_ads_campaign_123",
  "ai_confidence": 0.85
}
```

### GET /api/marketing/dashboard
**Response:**
```json
{
  "active_conversations": 45,
  "phase_distribution": {
    "leads": 120,
    "interest": 35,
    "booking": 12
  },
  "pending_handover": [
    {
      "id": 1,
      "phone": "6281234567890",
      "phase": "booking",
      "last_message": "Bagaimana cara pembayaran DP?",
      "interested_package": "Umroh Maret 2025",
      "conversation_url": "/api/conversations/conv_123",
      "ai_notes": "High intent, asking about payment"
    }
  ],
  "escalated_conversations": 5
}
```

### PUT /api/ai/prompts
**Request Body:**
```json
{
  "prompt_type": "base",
  "content": "You are a helpful umroh travel consultant...",
  "version": "2.0",
  "updated_by": "marketing_admin"
}
```

### GET /api/marketing/analytics
**Response:**
```json
{
  "conversion_metrics": {
    "total_leads": 500,
    "leads_to_interest": 150,
    "interest_to_booking": 45,
    "booking_to_paid": 40,
    "conversion_rate": "8%"
  },
  "campaign_performance": [
    {
      "campaign_code": "UMR_MAR_2025_HEMAT",
      "clicks": 200,
      "conversations": 180,
      "bookings": 15,
      "conversion": "7.5%"
    }
  ],
  "ai_performance": {
    "avg_response_time": "3 seconds",
    "successful_conversations": "85%",
    "escalation_rate": "15%",
    "satisfaction_score": 4.5
  },
  "common_questions": [
    {
      "question_pattern": "hotel dekat haram",
      "frequency": 125,
      "ai_success_rate": "92%"
    }
  ],
  "drop_off_analysis": {
    "leads_to_interest": "30%",
    "interest_to_booking": "70%",
    "booking_to_payment": "11%"
  }
}
```

### POST /api/conversations/handover
**Request Body:**
```json
{
  "conversation_id": "conv_123",
  "assigned_to": "sales_admin_1",
  "handover_notes": "Customer ready to pay DP, needs bank details"
}
```

## Edge Cases Handled

1. **Multiple Codes in Message**:
   - Process first valid code
   - Ignore subsequent codes
   - Log for analysis

2. **Returning Customers**:
   - Check conversation history
   - Continue from last phase
   - Merge duplicate leads

3. **AI Confusion**:
   - Low confidence triggers
   - Automatic escalation
   - Admin notification

4. **Rapid Messages**:
   - Queue processing
   - Maintain context
   - Prevent duplicate responses

5. **Mixed Languages**:
   - Detect language
   - Respond accordingly
   - Default to Bahasa

6. **Payment Questions Early**:
   - Soft redirect to info
   - Note high intent
   - Fast track to admin

## Integration Points

1. **With Package Module**:
   - Real-time quota check
   - Package details
   - Pricing updates

2. **With Jamaah Module**:
   - Create preliminary record
   - Link conversations

3. **With WhatsApp/WAHA**:
   - Message queue
   - Media delivery
   - Status tracking

4. **With Dashboard**:
   - Live metrics
   - Admin alerts
   - Performance KPIs

5. **With Analytics**:
   - Conversion tracking
   - ROI calculation
   - Campaign optimization

## AI Learning & Improvement

### Continuous Improvement:
1. **Prompt Updates**:
   - Based on failed conversations
   - New FAQ patterns
   - Seasonal adjustments

2. **Success Metrics**:
   - Conversation completion
   - Escalation reduction
   - Conversion improvement

3. **A/B Testing**:
   - Response variations
   - Media effectiveness
   - Call-to-action optimization

## Audit Trail Requirements
Every interaction must log:
- All messages in/out with timestamps
- Phase transitions
- AI confidence scores
- Escalation triggers
- Media sent
- Campaign source tracking
- Handover events
- Prompt version used