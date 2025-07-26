# Panduan Penggunaan WhatsApp Integration

## Apa itu WAHA?

WAHA (WhatsApp HTTP API) adalah service yang memungkinkan aplikasi Umroh Management terhubung dengan WhatsApp. Dengan WAHA, Anda bisa:
- Menerima pesan WhatsApp otomatis sebagai leads
- Mengirim pesan broadcast ke jamaah
- Auto-reply 24/7 untuk calon jamaah

## Status WAHA Saat Ini

✅ **WAHA sudah berjalan dan siap digunakan!**

## Cara Menggunakan WhatsApp Integration

### 1. Sambungkan WhatsApp

1. Buka aplikasi di: http://103.181.143.223:8888/demo-complete-umroh-app.html
2. Masuk ke halaman **Marketing**
3. Klik tombol **"Sambung ke WhatsApp"**
4. QR Code akan muncul di layar

### 2. Scan QR Code

1. Buka WhatsApp di HP Anda
2. Tap menu (⋮) atau Settings
3. Pilih **"Linked Devices"** atau **"Perangkat Tertaut"**
4. Tap **"Link a Device"** atau **"Tautkan Perangkat"**
5. Scan QR code yang muncul di layar komputer

### 3. Setelah Terhubung

- Status akan berubah menjadi **"Terhubung"**
- Nomor WhatsApp yang terhubung akan ditampilkan
- Sistem siap menerima pesan masuk
- Auto-reply akan aktif otomatis

## Mengelola WAHA (Untuk Admin)

Kami sudah menyediakan script `waha-manager.sh` untuk memudahkan pengelolaan:

### Cek Status WAHA
```bash
./waha-manager.sh status
```

### Restart WAHA (jika ada masalah)
```bash
./waha-manager.sh restart
```

### Lihat Log WAHA
```bash
./waha-manager.sh logs
```

### Reset Session (scan QR ulang)
```bash
./waha-manager.sh clear
```

## Troubleshooting

### QR Code tidak muncul?
1. Cek status WAHA: `./waha-manager.sh status`
2. Jika tidak jalan, start WAHA: `./waha-manager.sh start`
3. Refresh halaman browser

### Koneksi WhatsApp terputus?
1. WhatsApp Web memiliki timeout jika HP tidak online
2. Pastikan HP tetap terhubung internet
3. Jangan logout WhatsApp dari HP
4. Klik "Sambung ke WhatsApp" lagi untuk reconnect

### Session expired?
1. Jalankan: `./waha-manager.sh restart`
2. Scan QR code ulang

### Auto-reply tidak bekerja?
1. Pastikan WhatsApp terhubung (status: Terhubung)
2. Cek log untuk error: `./waha-manager.sh logs`

## Fitur yang Tersedia

### 1. Terima Pesan Otomatis
- Semua pesan masuk akan tersimpan sebagai leads
- Bisa dilihat di halaman Marketing

### 2. Auto-Reply
- Aktif 24/7
- Balas otomatis dengan pesan sambutan
- Dapat dikustomisasi

### 3. Broadcast Message (Coming Soon)
- Kirim pesan ke banyak jamaah sekaligus
- Template pesan tersedia

### 4. Lead Management
- Track semua pesan masuk
- Konversi lead menjadi jamaah
- History percakapan tersimpan

## Tips Penggunaan

1. **Gunakan nomor WhatsApp khusus** untuk bisnis, bukan nomor pribadi
2. **Jangan logout** dari HP setelah scan QR
3. **Backup data WAHA** secara berkala di folder `waha_data`
4. **Monitor log** untuk memastikan sistem berjalan baik

## Keamanan

- Session WhatsApp tersimpan lokal di server
- Tidak ada pihak ketiga yang bisa akses
- Data encrypted dan aman
- Backup rutin dianjurkan

---

**Catatan**: WAHA adalah tool resmi dan aman untuk WhatsApp Business integration. Gunakan sesuai dengan kebijakan WhatsApp.