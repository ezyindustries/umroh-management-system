# MODULE: Backup & Recovery - Business Flow Documentation

## Overview
Modul ini mengelola backup otomatis setiap 12 jam, restore manual per database table, dan mendorong download backup rutin oleh semua role. Sistem mencakup backup database dan files dengan verification, retry mechanism, dan testing schedule untuk memastikan data dapat dipulihkan.

## Actors & Roles
### Primary Actors:
- **Super Admin**: Full access backup/restore, configure settings
- **All Roles**: Download backup files, view backup status
- **System**: Automated backup execution
- **Operations**: Monitor backup health

### System Actor:
- **Backup Service**: Execute scheduled backups, verify integrity

## Data Flow Diagram

### 1. Automated Backup Flow
```
Schedule Trigger (02:00/14:00) → Create Snapshot → Backup DB & Files → Verify
                                         ↓                                ↓
                                  Set Cutoff Time                    Store Locally
                                         ↓                                ↓
                                  Log Success/Fail              Retry if Failed
```

### 2. Manual Download Flow
```
User Request → Generate Backup Archive → Compress → Download → Log Activity
                                                         ↓
                                                 Track Last Download Date
```

### 3. Restore Flow
```
Super Admin → Select Backup → Choose Tables → Verify → Execute Restore → Log
                                    ↓
                            Preview Affected Data
```

## Validation & Error Handling

### Backup Rules:
1. **Schedule Enforcement**:
   - Hard cutoff at 02:00:00 and 14:00:00
   - Data after cutoff → next backup
   - No partial timestamps

2. **Retry Mechanism**:
   - Failed backup → retry after 10 minutes
   - Keep retrying until success
   - Alert admin of failures

3. **Verification Process**:
   - Check file integrity
   - Verify row counts
   - Test sample restoration

## Business Rules

### Backup Configuration:
1. **Schedule**:
   - Every 12 hours
   - 02:00:00 WIB (night backup)
   - 14:00:00 WIB (afternoon backup)
   - Server timezone based

2. **Backup Contents**:
   - Full database dump
   - All uploaded files
   - System configurations
   - Audit logs

3. **Retention Policy**:
   ```
   - Hourly: Keep last 24 hours (if needed)
   - Daily: Keep 7 days
   - Weekly: Keep 4 weeks  
   - Monthly: Keep 12 months
   - Yearly: Keep indefinitely
   ```

### Backup Storage Structure:
```
/backup/
├── scheduled/
│   ├── 2025-01-25_02-00-00/
│   │   ├── database/
│   │   │   ├── full_dump.sql
│   │   │   └── tables/
│   │   │       ├── jamaah.sql
│   │   │       ├── packages.sql
│   │   │       └── ...
│   │   ├── files/
│   │   │   ├── documents/
│   │   │   ├── images/
│   │   │   └── uploads/
│   │   └── backup_manifest.json
│   └── 2025-01-25_14-00-00/
├── manual/
└── test_restore/
```

### Download Requirements:
1. **Access Rights**:
   - All roles can download
   - Tracked per user
   - Size limits per role

2. **Reminder System**:
   - Alert if no download > 3 days
   - Dashboard notification
   - Email/WhatsApp option

3. **Download Tracking**:
   - Who downloaded
   - When downloaded
   - Which backup version
   - File size

### Restore Capabilities:
1. **Granularity Options**:
   - Full database restore
   - Per table restore
   - Date range restore
   - Specific records (advanced)

2. **Safety Measures**:
   - Preview affected rows
   - Backup before restore
   - Confirmation required
   - Rollback capability

### Testing Schedule:
1. **Automated Tests**:
   - Weekly: Restore to test DB
   - Verify data integrity
   - Check file accessibility
   - Report results

2. **Manual Tests**:
   - Monthly: Full restore drill
   - Document time taken
   - Verify completeness
   - Update procedures

## API Contracts

### GET /api/backup/status
**Response:**
```json
{
  "last_backup": {
    "id": "backup_2025-01-25_14-00-00",
    "timestamp": "2025-01-25 14:00:00",
    "status": "success",
    "size": {
      "database": "1.2 GB",
      "files": "15.3 GB",
      "total": "16.5 GB"
    },
    "duration": "12 minutes",
    "cutoff_time": "2025-01-25 14:00:00",
    "next_scheduled": "2025-01-26 02:00:00"
  },
  "backup_health": {
    "consecutive_failures": 0,
    "last_failure": null,
    "success_rate_7d": "100%"
  },
  "user_download_status": {
    "last_download": "2025-01-24 10:30:00",
    "days_since_download": 1,
    "reminder_active": false
  }
}
```

### POST /api/backup/download
**Request Body:**
```json
{
  "backup_id": "backup_2025-01-25_14-00-00",
  "type": "full",
  "compress": true
}
```

**Response:**
```json
{
  "download_url": "/api/backup/download/token_abc123",
  "expires_in": 3600,
  "file_size": "16.5 GB",
  "estimated_time": "45 minutes"
}
```

### GET /api/backup/download-history
**Response:**
```json
{
  "downloads": [
    {
      "user": "admin_user",
      "role": "admin",
      "backup_id": "backup_2025-01-25_02-00-00",
      "download_time": "2025-01-25 09:15:00",
      "file_size": "16.2 GB",
      "download_duration": "42 minutes"
    }
  ],
  "reminder_status": {
    "users_need_reminder": [
      {
        "user": "marketing_user",
        "last_download": "2025-01-20 14:00:00",
        "days_overdue": 2
      }
    ]
  }
}
```

### POST /api/backup/restore (Super Admin Only)
**Request Body:**
```json
{
  "backup_id": "backup_2025-01-25_02-00-00",
  "restore_type": "partial",
  "tables": ["jamaah", "payments"],
  "create_restore_point": true,
  "preview_only": true
}
```

**Response (Preview):**
```json
{
  "preview": {
    "affected_tables": ["jamaah", "payments"],
    "row_counts": {
      "jamaah": {
        "current": 5000,
        "backup": 4950,
        "difference": -50
      },
      "payments": {
        "current": 8000,
        "backup": 7900,
        "difference": -100
      }
    },
    "warnings": [
      "50 jamaah records will be removed",
      "100 payment records will be removed"
    ],
    "restore_point_created": "restore_2025-01-25_15-30-00"
  }
}
```

### POST /api/backup/restore/execute
**Request Body:**
```json
{
  "restore_id": "restore_2025-01-25_15-30-00",
  "confirmation": "CONFIRM_RESTORE",
  "notify_users": true
}
```

### GET /api/backup/test-results
**Response:**
```json
{
  "last_test": {
    "date": "2025-01-20",
    "type": "automated_weekly",
    "status": "success",
    "details": {
      "database_restore": "success",
      "file_restore": "success",
      "integrity_check": "passed",
      "time_taken": "45 minutes"
    }
  },
  "test_schedule": {
    "next_automated": "2025-01-27",
    "next_manual": "2025-02-01",
    "overdue": false
  }
}
```

### POST /api/backup/manual
**Request Body:**
```json
{
  "type": "full",
  "reason": "Before major update",
  "include_files": true
}
```

## Edge Cases Handled

1. **Backup During High Activity**:
   - Non-blocking backup
   - Transaction consistency
   - Minimal performance impact

2. **Large File Handling**:
   - Chunked downloads
   - Resume capability
   - Compression options

3. **Concurrent Restores**:
   - Lock mechanism
   - Queue system
   - Conflict prevention

4. **Corrupted Backups**:
   - Verification failure handling
   - Skip and alert
   - Use previous good backup

5. **Storage Full**:
   - Auto-cleanup old backups
   - Alert before critical
   - Reserve emergency space

6. **Network Interruptions**:
   - Resume downloads
   - Retry uploads
   - Partial file handling

## Integration Points

1. **With All Modules**:
   - Data consistency
   - Foreign key preservation
   - File reference integrity

2. **With Notification Module**:
   - Backup failure alerts
   - Download reminders
   - Test results

3. **With Settings Module**:
   - Backup configuration
   - Restore permissions
   - Schedule management

4. **With Audit Module**:
   - Log all operations
   - Track restore actions
   - Compliance records

5. **With Dashboard**:
   - Backup status widget
   - Download reminders
   - Health indicators

## Monitoring & Alerts

### Key Metrics:
1. **Backup Health**:
   - Success rate
   - Average duration
   - Size growth trend

2. **Download Compliance**:
   - Users downloading regularly
   - Average days between downloads
   - Reminder effectiveness

3. **Storage Usage**:
   - Current usage
   - Growth rate
   - Cleanup effectiveness

### Alert Conditions:
- Backup failure (immediate)
- No download > 3 days
- Storage > 80% full
- Test restore failure
- Unusual backup size

## Security Considerations

### Access Control:
- Backup files encrypted
- Download tokens expire
- Restore requires 2FA
- Audit all actions

### Data Protection:
- Sensitive data masked
- Secure transmission
- Verified integrity
- Compliance ready

## Audit Trail Requirements
Every action must log:
- All backup executions with results
- Download activities by user
- Restore operations with details
- Configuration changes
- Test results and findings
- Failed attempts and retries