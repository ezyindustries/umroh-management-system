const { db } = require('../config/database');

async function addDocuments() {
    try {
        console.log('Adding documents for Yordan Yasin...');
        
        // Find Yordan's ID
        const jamaahResult = await db.query(
            "SELECT id FROM jamaah.jamaah_data WHERE name = 'Yordan Yasin'"
        );
        
        if (jamaahResult.rows.length === 0) {
            console.log('Jamaah not found!');
            process.exit(1);
        }
        
        const jamaahId = jamaahResult.rows[0].id;
        console.log('Found Jamaah ID:', jamaahId);
        
        // Check if documents table exists with correct structure
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
        
        console.log('Documents added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

addDocuments();