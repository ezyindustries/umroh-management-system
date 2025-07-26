# WAHA (WhatsApp HTTP API) Setup Guide

## Instalasi WAHA

1. **Install WAHA menggunakan Docker:**
```bash
docker run -it --rm -p 3000:3000/tcp --name waha devlikeapro/waha
```

Atau dengan Docker Compose:
```yaml
version: '3.7'
services:
  waha:
    image: devlikeapro/waha
    container_name: waha
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - WAHA_API_KEY=your_secure_api_key
      - WAHA_BASE_URL=http://localhost:3000
    volumes:
      - ./waha_data:/app/data
```

2. **Konfigurasi Environment Variables:**

Edit file `.env` di root project:
```
WAHA_API_URL=http://localhost:3000
WAHA_API_KEY=your_secure_api_key
```

## Cara Menggunakan

1. **Buka halaman Marketing** di aplikasi Umroh Management
2. **Klik tombol "Sambung ke WhatsApp"**
3. **Scan QR Code** yang muncul dengan WhatsApp di HP Anda:
   - Buka WhatsApp
   - Tap titik tiga (⋮) atau Settings
   - Pilih "Linked Devices" atau "Perangkat Tertaut"
   - Tap "Link a Device" atau "Tautkan Perangkat"
   - Scan QR code

4. **Setelah terhubung**, Anda dapat:
   - Menerima pesan WhatsApp otomatis sebagai leads
   - Auto-reply akan aktif 24/7
   - Broadcast pesan ke banyak kontak
   - Tracking leads otomatis

## API Endpoints

### Check Status
```
GET /api/whatsapp/status
```

### Start Session
```
POST /api/whatsapp/start
```

### Get QR Code
```
GET /api/whatsapp/qr
```

### Disconnect
```
POST /api/whatsapp/stop
```

### Send Message
```
POST /api/whatsapp/send
{
  "to": "628123456789",
  "message": "Hello from Umroh Management"
}
```

## Troubleshooting

1. **QR Code tidak muncul:**
   - Pastikan WAHA container berjalan
   - Check logs: `docker logs waha`
   - Pastikan port 3000 tidak digunakan aplikasi lain

2. **Koneksi terputus:**
   - WhatsApp Web memiliki timeout
   - Pastikan HP tetap online
   - Jangan logout dari HP

3. **Auto-reply tidak bekerja:**
   - Check environment variable `WA_AUTO_REPLY=true`
   - Pastikan webhook URL dapat diakses oleh WAHA

## Security Notes

- Ganti `WAHA_API_KEY` dengan key yang kuat
- Jangan expose WAHA port ke internet tanpa authentication
- Backup folder `waha_data` secara berkala
- Monitor logs untuk aktivitas mencurigakan