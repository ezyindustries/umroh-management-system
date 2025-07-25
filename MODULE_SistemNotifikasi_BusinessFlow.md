# MODULE: Sistem Notifikasi - Business Flow Documentation

## Overview
Modul ini menyediakan visual notification system berupa flags dan badges di dashboard untuk menandai perubahan data, deadline, dan item yang perlu perhatian. Setiap user memiliki tracking sendiri untuk item yang sudah dilihat, dengan indikator yang muncul di menu, card, dan data row.

## Actors & Roles
### Primary Actors:
- **All Users**: View and clear flags based on role access
- **System**: Generate flags on data changes
- **Dashboard**: Display visual indicators

### System Actor:
- **Flag Service**: Track changes, manage user-specific flags

## Data Flow Diagram

### 1. Flag Generation Flow
```
Data Change Event → Create Flag Record → Link to Users → Display on Dashboard
                           ↓
                    Set Flag Type & Context
```

### 2. Flag Display Flow
```
User Login → Load User Flags → Check Access Rights → Show on Relevant Items
                                        ↓
                                Red Dots + Badge Numbers
```

### 3. Flag Clearing Flow
```
User Views Item → Mark Flag as Seen → Update Badge Count → Remove Visual Indicator
                          ↓
                  Record Timestamp
```

## Validation & Error Handling

### Flag Rules:
1. **User-Specific Tracking**:
   - Each user has own flag status
   - Based on role permissions
   - No cross-user interference

2. **Persistence**:
   - Flags remain until viewed
   - No auto-expiry
   - Survive user logout

3. **Access Control**:
   - Only show flags for accessible items
   - Role-based filtering
   - No unauthorized notifications

## Business Rules

### Flag Triggers:
1. **Data Changes**:
   - New record created
   - Existing record updated
   - Status changes
   - Document uploaded

2. **Deadline Alerts**:
   - Payment approaching (H-40)
   - Document deadline (H-40)
   - Departure approaching
   - Task overdue

3. **System Events**:
   - Import completed
   - Bulk update finished
   - New assignment
   - Approval needed

### Flag Types:
```
CREATE: New item added
UPDATE: Existing item modified
DEADLINE: Time-sensitive alert
STATUS: Status change occurred
SYSTEM: System event notification
```

### Visual Indicators:

#### 1. Menu Level
```
Dashboard (3)     <- Badge with count
├─ Jamaah (1)    <- Red dot
├─ Payment •     <- Red dot (no count)
└─ Documents
```

#### 2. Card Level
```
┌─────────────────────┐
│ Package Card     •  │  <- Red dot corner
│ Umroh March 2025    │
│ Updates: 2 new      │
└─────────────────────┘
```

#### 3. Row Level
```
│ Name        │ Status    │ Action │
│ Ahmad    •  │ Active    │ View   │  <- Red dot
│ Fatimah  2  │ Pending   │ View   │  <- Badge
```

### Flag Management:

#### 1. Creation Rules
- One flag per item per user
- Aggregate similar changes
- Batch within time window (5 min)
- Store context data

#### 2. Display Rules
- Red dot for single notification
- Number badge for multiple (max 99+)
- Most recent first
- Consistent positioning

#### 3. Clearing Rules
- Clear on direct view
- Clear on action taken
- Bulk clear option
- Keep history log

## API Contracts

### GET /api/notifications/flags
**Response:**
```json
{
  "summary": {
    "total_unread": 15,
    "by_module": {
      "jamaah": 5,
      "payment": 3,
      "documents": 7
    }
  },
  "menu_flags": [
    {
      "menu": "jamaah",
      "count": 5,
      "has_urgent": false
    },
    {
      "menu": "payment",
      "count": 3,
      "has_urgent": true
    }
  ]
}
```

### GET /api/notifications/flags/{module}
**Response:**
```json
{
  "module": "jamaah",
  "flags": [
    {
      "id": "flag_123",
      "type": "CREATE",
      "entity_type": "jamaah",
      "entity_id": 101,
      "message": "New jamaah registered",
      "created_at": "2025-01-25 14:00:00",
      "context": {
        "jamaah_name": "Ahmad Yusuf",
        "package": "Umroh March 2025"
      }
    },
    {
      "id": "flag_124",
      "type": "UPDATE",
      "entity_type": "jamaah",
      "entity_id": 102,
      "message": "Document uploaded",
      "created_at": "2025-01-25 13:30:00"
    }
  ]
}
```

### POST /api/notifications/flags/mark-read
**Request Body:**
```json
{
  "flag_ids": ["flag_123", "flag_124"],
  "mark_all": false
}
```

**Response:**
```json
{
  "marked_count": 2,
  "remaining_unread": 13
}
```

### GET /api/notifications/entity-flags/{entity_type}/{entity_id}
**Response:**
```json
{
  "flags": [
    {
      "type": "UPDATE",
      "field": "payment_status",
      "old_value": "pending",
      "new_value": "paid",
      "changed_by": "finance_user",
      "changed_at": "2025-01-25 10:00:00"
    }
  ]
}
```

### POST /api/notifications/flags/bulk-clear
**Request Body:**
```json
{
  "module": "payment",
  "clear_all": true
}
```

### GET /api/notifications/history
**Query Parameters:**
- `from_date`: Start date
- `to_date`: End date
- `type`: Flag type filter

**Response:**
```json
{
  "history": [
    {
      "flag_id": "flag_123",
      "type": "CREATE",
      "entity": "jamaah:101",
      "viewed_at": "2025-01-25 14:05:00",
      "time_to_view": "5 minutes"
    }
  ]
}
```

## Edge Cases Handled

1. **High Volume Changes**:
   - Batch similar notifications
   - Prevent badge overflow (99+)
   - Efficient queries

2. **Concurrent Updates**:
   - Handle race conditions
   - Consistent flag state
   - Proper locking

3. **Role Changes**:
   - Update flag visibility
   - Remove invalid flags
   - Recalculate counts

4. **Bulk Operations**:
   - Single flag for bulk import
   - Aggregate related changes
   - Clear performance

5. **Stale Flags**:
   - Validate entity exists
   - Clean orphaned flags
   - Archive old flags

6. **Performance**:
   - Lazy loading
   - Caching strategy
   - Pagination support

## Integration Points

1. **With All Modules**:
   - Trigger on data changes
   - Respect module permissions
   - Link to source

2. **With User Module**:
   - User-specific tracking
   - Role-based filtering
   - Login state

3. **With Dashboard**:
   - Real-time updates
   - Visual components
   - Click handlers

4. **With Audit Module**:
   - Change tracking
   - View history
   - User actions

5. **With Frontend**:
   - WebSocket updates
   - Component library
   - State management

## UI/UX Guidelines

### Visual Design:
1. **Red Dot**:
   - Size: 8px diameter
   - Color: #FF0000
   - Position: Top-right
   - Animation: Subtle pulse

2. **Number Badge**:
   - Background: #FF0000
   - Text: White
   - Min width: 20px
   - Border radius: 10px

3. **Placement**:
   - Consistent positioning
   - Non-blocking
   - Mobile responsive

### Interaction:
1. **Click Behavior**:
   - Direct navigation
   - Auto-clear on view
   - Loading states

2. **Bulk Actions**:
   - Mark all as read
   - Filter by type
   - Sort options

## Performance Optimization

### Strategies:
1. **Query Efficiency**:
   - Index on user_id, seen_at
   - Batch fetching
   - Connection pooling

2. **Caching**:
   - Redis for counts
   - Session storage
   - Invalidation strategy

3. **Real-time Updates**:
   - WebSocket for live flags
   - Debounced updates
   - Delta sync only

## Audit Trail Requirements
Every flag action must log:
- Flag creation with trigger
- User view/clear actions
- Bulk operations
- System cleanups
- Performance metrics
- Error conditions