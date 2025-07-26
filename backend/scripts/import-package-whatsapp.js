require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function importPackageFromWhatsApp() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Read brochure image
        const brochurePath = path.join(__dirname, '../../whatsapp_extract/00000026-PHOTO-2025-07-24-10-38-09.jpg');
        const brochureBuffer = fs.readFileSync(brochurePath);
        const brochureBase64 = `data:image/jpeg;base64,${brochureBuffer.toString('base64')}`;
        
        // Package data extracted from WhatsApp chat
        const packageData = {
            name: 'Umroh + Turki 12 Hari by Turkish Airlines',
            code: 'UMR-TUR-OCT-2025',
            description: 'Paket Umroh Plus Turki dengan Turkish Airlines, termasuk city tour dan berbagai fasilitas',
            price: 32900000,
            departure_date: '2025-10-04',
            return_date: '2025-10-15', // 12 hari dari tanggal keberangkatan
            quota: 50, // Estimasi
            makkah_hotel: 'Le Meridien Tower',
            madinah_hotel: 'Durrat Al Eiman',
            makkah_nights: 4,
            madinah_nights: 3,
            airline: 'Turkish Airlines',
            brochure_image: brochureBase64,
            package_info: `
PAKET UMROH + TURKI 12 HARI
Keberangkatan: 4 Oktober 2025

HARGA: Rp. 32.900.000 ALL IN (tanpa ada tambahan biaya apapun)

FASILITAS TERMASUK:
✈️ Tiket pesawat PP starting Jakarta by Turkish Airlines landing Madinah
🏨 Hotel Makkah: Le Meridien Tower 4 malam (pakai shuttle bus turun di terminal belakang zam-zam Tower, 2 menit jalan kaki)
🏨 Hotel Madinah: Durrat Al Eiman 3 Malam
🏨 Hotel Istanbul: 2 Malam

BONUS & FASILITAS:
🚢 Free Bosphorus Cruise Turki
🚄 Free kereta cepat Madinah - Makkah
🚌 City tour Makkah dan Madinah
🚌 Free city tour Thaif
🕌 Bimbingan 2x umroh
🍽️ Makan 3x1 hari sesuai Program
📋 Visa umroh
✈️ Handling airport Jakarta
🛋️ Lounge Jakarta
🛡️ Asuransi
📚 Manasik 3x
✈️ Handling Saudi

CATATAN PENTING:
- Harga tertera adalah harga untuk satu kamar ber-4 untuk di Makkah dan Madinah
- Tersedia pilihan upgrade kamar:
  • Double +3.000.000/pax
  • Triple +2.000.000/pax

PERLENGKAPAN (OPSIONAL):
Paket di atas tidak termasuk perlengkapan. Jamaah hanya mendapatkan:
- ID card
- Buku do'a
- Slayer penanda dari Travel

Tambahan perlengkapan Rp. 755.000/pax:
- Koper bagasi 24inch
- Ihrom/mukena
- Slayer
- ID card
- Buku doa
- Seragam batik
- Tas tenteng

SYARAT PENDAFTARAN:
1. Mengisi klausul pendaftaran
2. Mengirim scan pasport (2 suku kata)
3. Minimal masa berlaku atau expired 8 bulan terhitung dari bulan keberangkatan
4. Mengirim scan KTP
5. Foto setengah badan bebas (tidak menggunakan aksesoris spt kacamata/peci/topi dan soflen, menghadap ke kamera, tidak bermakeup tebal)
6. Mengirim bukti transfer DP min 5.000.000/pax
7. Pelunasan H-40 hari sebelum keberangkatan, atau DP hangus

Contact: 08-55555-44-000
By: PT. VAUZA TAMMA ABADI
`,
            status: 'active'
        };
        
        // Check if package already exists
        const checkResult = await client.query(
            'SELECT id FROM core.packages WHERE code = $1',
            [packageData.code]
        );
        
        if (checkResult.rows.length > 0) {
            console.log('Package already exists, updating with complete data...');
            
            // Update existing package with complete data
            const updateResult = await client.query(
                `UPDATE core.packages SET 
                    name = $1, description = $2, price = $3, 
                    departure_date = $4, return_date = $5, quota = $6,
                    makkah_hotel = $7, madinah_hotel = $8, 
                    makkah_nights = $9, madinah_nights = $10,
                    airline = $11, brochure_image = $12, package_info = $13,
                    updated_at = CURRENT_TIMESTAMP
                WHERE code = $14
                RETURNING *`,
                [
                    packageData.name,
                    packageData.description,
                    packageData.price,
                    packageData.departure_date,
                    packageData.return_date,
                    packageData.quota,
                    packageData.makkah_hotel,
                    packageData.madinah_hotel,
                    packageData.makkah_nights,
                    packageData.madinah_nights,
                    packageData.airline,
                    packageData.brochure_image,
                    packageData.package_info,
                    packageData.code
                ]
            );
            
            await client.query('COMMIT');
            
            console.log('\n=== PACKAGE UPDATED SUCCESSFULLY ===');
            console.log('\nPackage Details:');
            console.log('- ID:', updateResult.rows[0].id);
            console.log('- Name:', packageData.name);
            console.log('- Code:', packageData.code);
            console.log('- Price: Rp', packageData.price.toLocaleString('id-ID'));
            console.log('- Departure:', packageData.departure_date);
            console.log('- Return:', packageData.return_date);
            console.log('- Duration: 12 days');
            console.log('- Airline:', packageData.airline);
            console.log('- Hotels:');
            console.log('  • Makkah:', packageData.makkah_hotel, '(' + packageData.makkah_nights + ' nights)');
            console.log('  • Madinah:', packageData.madinah_hotel, '(' + packageData.madinah_nights + ' nights)');
            console.log('  • Istanbul: 2 nights');
            console.log('- Quota:', packageData.quota, 'seats');
            console.log('- Brochure: Updated from WhatsApp image');
            console.log('- Package Info: Complete details added');
            console.log('\n=====================================');
            
            client.release();
            process.exit();
            return;
        }
        
        // Insert package
        const result = await client.query(
            `INSERT INTO core.packages (
                name, code, description, price, departure_date, return_date,
                quota, makkah_hotel, madinah_hotel, makkah_nights, madinah_nights,
                airline, brochure_image, package_info, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *`,
            [
                packageData.name,
                packageData.code,
                packageData.description,
                packageData.price,
                packageData.departure_date,
                packageData.return_date,
                packageData.quota,
                packageData.makkah_hotel,
                packageData.madinah_hotel,
                packageData.makkah_nights,
                packageData.madinah_nights,
                packageData.airline,
                packageData.brochure_image,
                packageData.package_info,
                packageData.status
            ]
        );
        
        await client.query('COMMIT');
        
        console.log('\n=== PACKAGE IMPORTED SUCCESSFULLY ===');
        console.log('\nPackage Details:');
        console.log('- ID:', result.rows[0].id);
        console.log('- Name:', packageData.name);
        console.log('- Code:', packageData.code);
        console.log('- Price: Rp', packageData.price.toLocaleString('id-ID'));
        console.log('- Departure:', packageData.departure_date);
        console.log('- Return:', packageData.return_date);
        console.log('- Duration: 12 days');
        console.log('- Airline:', packageData.airline);
        console.log('- Hotels:');
        console.log('  • Makkah:', packageData.makkah_hotel, '(' + packageData.makkah_nights + ' nights)');
        console.log('  • Madinah:', packageData.madinah_hotel, '(' + packageData.madinah_nights + ' nights)');
        console.log('  • Istanbul: 2 nights');
        console.log('- Quota:', packageData.quota, 'seats');
        console.log('- Brochure: Imported from WhatsApp image');
        console.log('\nSpecial Features:');
        console.log('- Free Bosphorus Cruise');
        console.log('- Free high-speed train Madinah-Makkah');
        console.log('- City tours included');
        console.log('- Airport lounge access');
        console.log('- 2x umroh guidance');
        console.log('- 3 meals per day');
        console.log('\n=====================================');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error importing package:', error);
    } finally {
        client.release();
        process.exit();
    }
}

importPackageFromWhatsApp();