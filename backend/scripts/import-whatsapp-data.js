const { db } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function importWhatsAppData() {
    console.log('Starting WhatsApp data import...\n');
    
    try {
        // 1. Create Package first
        console.log('1. Creating Package: Umroh + Turki 12 Hari');
        
        const packageData = {
            code: 'UMR-TUR-OCT-2025',
            name: 'Umroh + Turki 12 Hari by Turkish Airlines',
            description: 'Paket Umroh Plus Turki dengan Turkish Airlines, termasuk city tour dan berbagai fasilitas',
            price: 32900000,
            departure_date: '2025-10-04',
            return_date: '2025-10-15', // 12 days from departure
            quota: 50,
            makkah_hotel: 'Le Meridien Tower',
            madinah_hotel: 'Durrat Al Eiman',
            makkah_nights: 4,
            madinah_nights: 3,
            airline: 'Turkish Airlines',
            status: 'active'
        };
        
        const packageResult = await db.query(
            `INSERT INTO core.packages (
                code, name, description, price, departure_date, return_date,
                quota, makkah_hotel, madinah_hotel, makkah_nights, madinah_nights,
                airline, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (code) DO UPDATE SET
                name = EXCLUDED.name,
                price = EXCLUDED.price
            RETURNING *`,
            [
                packageData.code, packageData.name, packageData.description,
                packageData.price, packageData.departure_date, packageData.return_date,
                packageData.quota, packageData.makkah_hotel, packageData.madinah_hotel,
                packageData.makkah_nights, packageData.madinah_nights,
                packageData.airline, packageData.status
            ]
        );
        
        const packageId = packageResult.rows[0].id;
        console.log('✓ Package created with ID:', packageId);
        console.log('  Price: Rp', packageData.price.toLocaleString('id-ID'));
        console.log('  Departure:', packageData.departure_date);
        console.log('  Hotels:', packageData.makkah_hotel, '&', packageData.madinah_hotel);
        
        // 2. Create Jamaah
        console.log('\n2. Creating Jamaah: Yordan Yasin');
        
        const jamaahData = {
            name: 'Yordan Yasin',
            nik: '3174051234567890', // Dummy NIK for demo, real would come from KTP
            phone: '085610487550', // Normalized from +62 856-1048-755
            birth_date: '1990-01-01', // Estimated, not provided in chat
            birth_place: 'Jakarta', // Estimated
            gender: 'male', // Based on name
            status: 'pending', // Has paid DP
            created_by: 1 // Admin user
        };
        
        const jamaahResult = await db.query(
            `INSERT INTO jamaah.jamaah_data (
                name, nik, phone, birth_date, birth_place, gender, status, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                jamaahData.name, jamaahData.nik, jamaahData.phone, jamaahData.birth_date,
                jamaahData.birth_place, jamaahData.gender, jamaahData.status,
                jamaahData.created_by
            ]
        );
        
        const jamaahId = jamaahResult.rows[0].id;
        console.log('✓ Jamaah created with ID:', jamaahId);
        console.log('  Phone:', jamaahData.phone);
        console.log('  Status:', jamaahData.status);
        
        // 3. Register Jamaah to Package
        console.log('\n3. Registering Jamaah to Package');
        
        const registrationResult = await db.query(
            `INSERT INTO jamaah.package_registrations (jamaah_id, package_id, created_by)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [jamaahId, packageId, 1]
        );
        
        console.log('✓ Registration created:', registrationResult.rows[0].registration_number);
        
        // 4. Create Payment Record
        console.log('\n4. Creating Payment Record');
        
        const paymentData = {
            jamaah_id: jamaahId,
            package_id: packageId,
            amount: 5000000, // DP amount
            payment_type: 'dp',
            payment_date: '2025-07-24',
            payment_method: 'transfer',
            notes: 'DP untuk paket Umroh + Turki Oktober 2025',
            status: 'verified',
            created_by: 1
        };
        
        // First create payments table if not exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS finance.payments (
                id SERIAL PRIMARY KEY,
                jamaah_id INTEGER NOT NULL REFERENCES jamaah.jamaah_data(id),
                package_id INTEGER NOT NULL REFERENCES core.packages(id),
                amount DECIMAL(12,2) NOT NULL,
                payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('dp', 'pelunasan', 'tambahan')),
                payment_date DATE NOT NULL,
                payment_method VARCHAR(50),
                bank_name VARCHAR(100),
                account_number VARCHAR(50),
                reference_number VARCHAR(100),
                notes TEXT,
                status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
                verified_by INTEGER REFERENCES core.users(id),
                verified_at TIMESTAMP,
                created_by INTEGER NOT NULL REFERENCES core.users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        const paymentResult = await db.query(
            `INSERT INTO finance.payments (
                jamaah_id, package_id, amount, payment_type, payment_date,
                payment_method, notes, status, verified_by, verified_at, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, $10)
            RETURNING *`,
            [
                paymentData.jamaah_id, paymentData.package_id, paymentData.amount,
                paymentData.payment_type, paymentData.payment_date, paymentData.payment_method,
                paymentData.notes, paymentData.status, 1, paymentData.created_by
            ]
        );
        
        console.log('✓ Payment created with ID:', paymentResult.rows[0].id);
        console.log('  Amount: Rp', paymentData.amount.toLocaleString('id-ID'));
        console.log('  Type:', paymentData.payment_type);
        console.log('  Status:', paymentData.status);
        
        // 5. Document References
        console.log('\n5. Document References');
        console.log('Available documents in WhatsApp folder:');
        console.log('  - KTP: 00000034-PHOTO-2025-07-24-10-59-31.jpg');
        console.log('  - Bukti Transfer: 00000031-PHOTO-2025-07-24-10-58-47.jpg');
        console.log('  - Syarat & Ketentuan: SYARAT DAN KETENTUAN UMROH FINAL REV.pdf');
        
        // Create documents references
        await db.query(`
            CREATE TABLE IF NOT EXISTS jamaah.documents (
                id SERIAL PRIMARY KEY,
                jamaah_id INTEGER NOT NULL REFERENCES jamaah.jamaah_data(id),
                document_type VARCHAR(50) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500),
                file_size INTEGER,
                uploaded_by INTEGER REFERENCES core.users(id),
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                verified_by INTEGER REFERENCES core.users(id),
                verified_at TIMESTAMP,
                notes TEXT
            )
        `);
        
        // Insert document records
        const documents = [
            {
                type: 'ktp',
                file_name: '00000034-PHOTO-2025-07-24-10-59-31.jpg',
                file_path: '/whatsapp_chat/00000034-PHOTO-2025-07-24-10-59-31.jpg',
                file_size: 520197
            },
            {
                type: 'bukti_transfer',
                file_name: '00000031-PHOTO-2025-07-24-10-58-47.jpg',
                file_path: '/whatsapp_chat/00000031-PHOTO-2025-07-24-10-58-47.jpg',
                file_size: 55702
            }
        ];
        
        for (const doc of documents) {
            await db.query(
                `INSERT INTO jamaah.documents (
                    jamaah_id, document_type, file_name, file_path, file_size,
                    uploaded_by, verified_by, verified_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
                [jamaahId, doc.type, doc.file_name, doc.file_path, doc.file_size, 1, 1]
            );
            console.log(`✓ Document ${doc.type} recorded`);
        }
        
        // 6. Summary
        console.log('\n=== IMPORT SUMMARY ===');
        console.log('Package: Umroh + Turki (ID:', packageId, ')');
        console.log('Jamaah: Yordan Yasin (ID:', jamaahId, ')');
        console.log('Payment: DP Rp 5.000.000 (Verified)');
        console.log('Documents: 2 files recorded');
        console.log('Status: Jamaah registered and waiting for pelunasan (H-40)');
        
        process.exit(0);
    } catch (error) {
        console.error('Error during import:', error);
        process.exit(1);
    }
}

importWhatsAppData();