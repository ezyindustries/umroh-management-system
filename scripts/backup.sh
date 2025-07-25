#!/bin/sh

# Backup script for Umroh Management System
# This script runs daily via cron in the backup container

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/umroh_backup_$TIMESTAMP.sql.gz"
RETENTION_DAYS=7

echo "[$(date)] Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform database backup
pg_dump -h $PGHOST -U $PGUSER -d $PGDATABASE | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup successful: $BACKUP_FILE"
    
    # Get file size
    SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo "[$(date)] Backup size: $SIZE"
    
    # Remove old backups
    echo "[$(date)] Removing backups older than $RETENTION_DAYS days..."
    find $BACKUP_DIR -name "umroh_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    # List remaining backups
    echo "[$(date)] Current backups:"
    ls -lh $BACKUP_DIR/umroh_backup_*.sql.gz
else
    echo "[$(date)] Backup failed!"
    exit 1
fi

echo "[$(date)] Backup process completed."