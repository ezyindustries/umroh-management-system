#!/bin/bash

# Port Check Script for Umroh Management System
# This script checks the status of all registered ports

echo "======================================"
echo "Port Status Check - Umroh Management"
echo "======================================"
echo ""

# Define ports to check
declare -A ports=(
    ["3000"]="WAHA (WhatsApp API)"
    ["5000"]="Backend API Server"
    ["8080"]="Frontend Dev Server"
    ["8888"]="Static File Server"
)

# Function to check port
check_port() {
    local port=$1
    local service=$2
    
    echo "Checking Port $port - $service:"
    
    # Check if port is listening
    if lsof -i :$port > /dev/null 2>&1 || ss -tlnp 2>/dev/null | grep -q ":$port "; then
        echo "  Status: ACTIVE"
        # Get process info
        lsof -i :$port 2>/dev/null | grep LISTEN | while read line; do
            process=$(echo $line | awk '{print $1}')
            pid=$(echo $line | awk '{print $2}')
            echo "  Process: $process (PID: $pid)"
        done
        
        # Special check for Docker containers
        if [ "$port" = "3000" ]; then
            docker_info=$(docker ps | grep ":$port->" | head -1)
            if [ ! -z "$docker_info" ]; then
                container_id=$(echo $docker_info | awk '{print $1}')
                container_name=$(echo $docker_info | awk '{print $NF}')
                echo "  Docker: $container_name (ID: $container_id)"
            fi
        fi
    else
        echo "  Status: NOT ACTIVE"
    fi
    echo ""
}

# Check all ports
for port in "${!ports[@]}"; do
    check_port $port "${ports[$port]}"
done

echo "======================================"
echo "Quick Commands:"
echo "  Kill process on port: lsof -i :PORT | grep LISTEN | awk '{print \$2}' | xargs -r kill -9"
echo "  Start WAHA: docker run -it --rm -p 3000:3000/tcp --name waha devlikeapro/waha"
echo "  Start Backend: cd backend && node server.js"
echo "======================================"