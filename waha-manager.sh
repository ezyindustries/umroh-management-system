#!/bin/bash

# WAHA Manager Script
# Script untuk mengelola WAHA (WhatsApp HTTP API)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="waha"
IMAGE_NAME="devlikeapro/waha"
PORT="3000"
DATA_DIR="./waha_data"

# Functions
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker tidak terinstall!"
        exit 1
    fi
}

status() {
    if docker ps | grep -q $CONTAINER_NAME; then
        print_status "WAHA sedang berjalan"
        docker ps | grep $CONTAINER_NAME
    else
        print_warning "WAHA tidak berjalan"
    fi
}

start() {
    if docker ps | grep -q $CONTAINER_NAME; then
        print_warning "WAHA sudah berjalan!"
        return
    fi
    
    # Create data directory if not exists
    mkdir -p $DATA_DIR
    
    print_status "Memulai WAHA..."
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:3000 \
        -v $(pwd)/$DATA_DIR:/app/data \
        --restart unless-stopped \
        $IMAGE_NAME
    
    if [ $? -eq 0 ]; then
        print_status "WAHA berhasil dijalankan di port $PORT"
        print_status "Akses WAHA API di: http://localhost:$PORT"
    else
        print_error "Gagal menjalankan WAHA"
    fi
}

stop() {
    if ! docker ps | grep -q $CONTAINER_NAME; then
        print_warning "WAHA tidak sedang berjalan"
        return
    fi
    
    print_status "Menghentikan WAHA..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
    print_status "WAHA berhasil dihentikan"
}

restart() {
    print_status "Merestart WAHA..."
    stop
    sleep 2
    start
}

logs() {
    print_status "Menampilkan log WAHA..."
    docker logs -f $CONTAINER_NAME
}

session_info() {
    print_status "Mengecek session WhatsApp..."
    curl -s http://localhost:$PORT/api/sessions | jq .
}

clear_session() {
    print_warning "Menghapus semua session WhatsApp..."
    echo "Session akan direset. Anda harus scan ulang QR code."
    read -p "Lanjutkan? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        stop
        rm -rf $DATA_DIR/*
        start
        print_status "Session berhasil direset"
    else
        print_status "Pembatalan reset session"
    fi
}

# Main script
check_docker

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    session)
        session_info
        ;;
    clear)
        clear_session
        ;;
    *)
        echo "WAHA Manager - Pengelola WhatsApp HTTP API"
        echo ""
        echo "Penggunaan: $0 {start|stop|restart|status|logs|session|clear}"
        echo ""
        echo "Commands:"
        echo "  start    - Menjalankan WAHA"
        echo "  stop     - Menghentikan WAHA"
        echo "  restart  - Restart WAHA"
        echo "  status   - Cek status WAHA"
        echo "  logs     - Lihat log WAHA"
        echo "  session  - Lihat info session WhatsApp"
        echo "  clear    - Hapus session (perlu scan QR ulang)"
        echo ""
        exit 1
        ;;
esac