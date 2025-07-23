#!/bin/bash

# Manual rsync deployment script
SERVER="ezyindustries@103.181.143.223"
SSHPASS="!ndomi3 Halal"
REMOTE_DIR="/home/ezyindustries/deployments/umroh-management"

echo "📤 Uploading files to server using rsync..."

# Create remote directory
sshpass -p "$SSHPASS" ssh -o StrictHostKeyChecking=no "$SERVER" "mkdir -p $REMOTE_DIR"

# Rsync all files
export SSHPASS="$SSHPASS"
sshpass -e rsync -avz --progress \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude 'temp-*' \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./ "$SERVER:$REMOTE_DIR/"

echo ""
echo "✅ Files uploaded to: $REMOTE_DIR"
echo ""
echo "Next steps:"
echo "1. SSH to server: ssh $SERVER"
echo "2. Go to directory: cd $REMOTE_DIR"
echo "3. Build Docker image: docker build -t umroh-management-main:latest ."
echo "4. Run container with manual-deploy.sh"