const { db } = require('../config/database');
const bcrypt = require('bcrypt');

async function createAdminUser() {
    try {
        // Generate password hash
        const password = 'admin123'; // Default password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Create admin user
        const result = await db.query(
            `INSERT INTO core.users (username, password, nama, roles, status) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (username) DO UPDATE 
             SET password = EXCLUDED.password,
                 nama = EXCLUDED.nama,
                 roles = EXCLUDED.roles,
                 status = EXCLUDED.status
             RETURNING *`,
            ['admin', passwordHash, 'Administrator', ['admin'], 'active']
        );
        
        console.log('Admin user created successfully:', result.rows[0]);
        console.log('Login credentials:');
        console.log('Username: admin');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();