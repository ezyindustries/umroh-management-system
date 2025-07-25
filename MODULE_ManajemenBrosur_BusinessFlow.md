# MODULE: Manajemen Brosur - Business Flow Documentation

## Overview
Modul ini mengelola template brosur digital berupa gambar dan text untuk setiap paket umroh. Brosur akan dikirim otomatis oleh AI melalui WhatsApp saat calon jamaah mengirim kode paket dari Meta Ads. Admin dapat update brosur kapan saja tanpa versioning.

## Actors & Roles
### Primary Actors:
- **Admin/Marketing**: Upload dan manage brosur per paket
- **AI Marketing Bot**: Retrieve dan kirim brosur via WhatsApp
- **System**: Store dan serve brosur content

### System Actor:
- **Storage Service**: Manage image files dan text templates

## Data Flow Diagram

### 1. Brosur Upload Flow
```
Admin Select Package → Upload Images → Set Image Order → Add Text Template → Save
                              ↓                              ↓
                      Multiple Images OK            WhatsApp Message Template
```

### 2. AI Retrieval Flow
```
AI Receives Code → Identify Package → Get Brosur Data → Send Images in Order → Send Text
                                              ↓
                                      Via Special AI Access
```

### 3. Update Flow
```
Admin Edit Package → Replace Images/Text → Old Version Overwritten → Immediate Effect
```

## Validation & Error Handling

### Brosur Rules:
1. **Image Requirements**:
   - Multiple images allowed
   - Order must be defined
   - Common formats (JPG, PNG)
   - No size limit specified

2. **Text Template**:
   - WhatsApp message format
   - Sent after all images
   - Plain text (with emoji support)

3. **Package Association**:
   - One brosur set per package
   - Required for AI to function
   - Linked via package code

## Business Rules

### Brosur Structure:
1. **Components per Package**:
   - Multiple images (ordered)
   - One text template
   - Package code identifier
   - No personalization

2. **Image Management**:
   - Sequential ordering (1, 2, 3...)
   - Drag-drop to reorder
   - Delete and replace allowed
   - Auto-compress for WhatsApp

3. **Text Template Format**:
   ```
   Example template:
   
   🕋 *PAKET UMROH MARET 2025* 🕋
   
   ✅ Berangkat: 15 Maret 2025
   ✅ Durasi: 9 Hari
   ✅ Hotel: Bintang 4 (Dekat Masjid)
   
   *FASILITAS:*
   • Visa Umroh
   • Tiket Pesawat PP
   • Hotel + Makan 3x
   • Bus AC Pariwisata
   • Tour Leader Berpengalaman
   
   💰 *Harga: Rp 25.000.000*
   📱 Info lebih lanjut? Kami siap membantu!
   ```

### Content Guidelines:
1. **Image Best Practices**:
   - High quality but optimized
   - Clear package information
   - Consistent branding
   - Mobile-friendly dimensions

2. **Text Guidelines**:
   - Concise and informative
   - Include key details
   - Call-to-action
   - WhatsApp formatting

### AI Access Configuration:
1. **Special Endpoint**:
   - Direct brosur access
   - No authentication overhead
   - Optimized for speed

2. **Data Provided**:
   - Image URLs in order
   - Text template
   - Package identification
   - Send instructions

## API Contracts

### POST /api/brochures/package/{package_id}
**Request (multipart/form-data):**
```
images[]: [binary] (multiple files)
image_order: [1,2,3,4]
text_template: "🕋 *PAKET UMROH MARET 2025*..."
```

**Response:**
```json
{
  "success": true,
  "brochure": {
    "package_id": 1,
    "package_code": "UMR_MAR_2025_HEMAT",
    "images": [
      {
        "order": 1,
        "url": "/storage/brochures/pkg1_1.jpg",
        "size": "1.2MB"
      },
      {
        "order": 2,
        "url": "/storage/brochures/pkg1_2.jpg",
        "size": "950KB"
      }
    ],
    "text_template": "🕋 *PAKET UMROH MARET 2025*...",
    "last_updated": "2025-01-25 14:00:00"
  }
}
```

### GET /api/brochures/package/{package_id}
**Response:**
```json
{
  "brochure": {
    "package_id": 1,
    "package_name": "Umroh Maret 2025 Hemat",
    "package_code": "UMR_MAR_2025_HEMAT",
    "images": [
      {
        "id": 101,
        "order": 1,
        "filename": "cover.jpg",
        "url": "/storage/brochures/pkg1_1.jpg",
        "size": "1.2MB",
        "dimensions": "1080x1080"
      },
      {
        "id": 102,
        "order": 2,
        "filename": "itinerary.jpg",
        "url": "/storage/brochures/pkg1_2.jpg",
        "size": "950KB",
        "dimensions": "1080x1350"
      }
    ],
    "text_template": "🕋 *PAKET UMROH MARET 2025*...",
    "has_brochure": true
  }
}
```

### PUT /api/brochures/package/{package_id}/reorder
**Request Body:**
```json
{
  "image_order": [
    {"image_id": 102, "new_order": 1},
    {"image_id": 101, "new_order": 2}
  ]
}
```

### DELETE /api/brochures/package/{package_id}/image/{image_id}
**Response:**
```json
{
  "success": true,
  "message": "Image deleted",
  "remaining_images": 3
}
```

### PUT /api/brochures/package/{package_id}/text
**Request Body:**
```json
{
  "text_template": "Updated WhatsApp message template..."
}
```

### GET /api/brochures/ai/{package_code}
**AI Special Access Endpoint**
**Response:**
```json
{
  "package_code": "UMR_MAR_2025_HEMAT",
  "whatsapp_content": {
    "images": [
      {
        "order": 1,
        "url": "https://system.com/storage/brochures/pkg1_1.jpg",
        "caption": null
      },
      {
        "order": 2,
        "url": "https://system.com/storage/brochures/pkg1_2.jpg",
        "caption": null
      }
    ],
    "text_message": "🕋 *PAKET UMROH MARET 2025*...",
    "send_instructions": {
      "delay_between_images": 2,
      "send_text_after_images": true
    }
  }
}
```

### GET /api/brochures/packages-without-brochure
**Response:**
```json
{
  "packages": [
    {
      "id": 5,
      "name": "Umroh April 2025",
      "code": "UMR_APR_2025_REG",
      "created_date": "2025-01-20"
    }
  ],
  "total": 2
}
```

## Edge Cases Handled

1. **Missing Brochure**:
   - AI fallback to generic message
   - Alert admin to upload
   - Package still functional

2. **Large Image Files**:
   - Auto-compression
   - WhatsApp size limits
   - Quality preservation

3. **Upload Failures**:
   - Partial upload handling
   - Rollback mechanism
   - Clear error messages

4. **Broken Images**:
   - Validation on upload
   - AI skip broken images
   - Admin notification

5. **Text Template Errors**:
   - Character limit check
   - WhatsApp format validation
   - Preview capability

6. **Multiple Admins Editing**:
   - Last update wins
   - No locking mechanism
   - Activity logging

## Integration Points

1. **With Package Module**:
   - Package code linkage
   - Package details sync
   - Status awareness

2. **With AI Marketing**:
   - Direct API access
   - Code-based retrieval
   - Send orchestration

3. **With Storage System**:
   - Image file management
   - CDN integration ready
   - Backup included

4. **With Admin Panel**:
   - Upload interface
   - Preview capability
   - Bulk operations

5. **With WhatsApp/WAHA**:
   - Format compatibility
   - Size optimization
   - Delivery tracking

## Admin Interface Features

### Brochure Manager:
1. **Upload Section**:
   - Drag-drop images
   - Multiple selection
   - Progress indicators
   - Order arrangement

2. **Preview Mode**:
   - See as WhatsApp user
   - Image sequence
   - Text formatting
   - Mobile view

3. **Quick Actions**:
   - Replace single image
   - Edit text inline
   - Clear all content
   - Copy from package

## Storage Optimization

### Strategies:
1. **Image Processing**:
   - Auto-resize for WhatsApp
   - Format conversion
   - Compression levels
   - Thumbnail generation

2. **Cleanup Policy**:
   - Remove orphaned images
   - No version history
   - Immediate deletion
   - Storage monitoring

## Audit Trail Requirements
Every brochure action must log:
- Upload/delete operations
- Text template changes
- Image reordering
- Package associations
- AI access frequency
- Admin activities with timestamp