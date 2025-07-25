#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const setupDatabase = async () => {
    console.log('🚀 Starting database setup...\n');

    // Connect to postgres database first
    const adminPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
    });

    try {
        // Check if database exists
        const dbCheck = await adminPool.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [process.env.DB_NAME]
        );

        if (dbCheck.rows.length === 0) {
            console.log(`📦 Creating database: ${process.env.DB_NAME}`);
            await adminPool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log('✅ Database created successfully\n');
        } else {
            console.log(`ℹ️  Database ${process.env.DB_NAME} already exists\n`);
        }

        await adminPool.end();

        // Connect to the application database
        const appPool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD,
        });

        // Run migrations
        console.log('🔄 Running migrations...\n');
        const migrationsDir = path.join(__dirname, '../migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        for (const file of migrationFiles) {
            console.log(`  📄 Running migration: ${file}`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            
            try {
                await appPool.query(sql);
                console.log(`  ✅ ${file} completed\n`);
            } catch (error) {
                console.error(`  ❌ Error in ${file}:`, error.message);
                throw error;
            }
        }

        console.log('✅ All migrations completed successfully\n');

        // Create default admin user
        console.log('👤 Creating default admin user...');
        const bcrypt = require('bcryptjs');
        const adminPassword = await bcrypt.hash('admin123', 10);

        await appPool.query(`
            INSERT INTO core.users (username, email, password, name, role)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (username) DO NOTHING
        `, ['admin', 'admin@umroh.com', adminPassword, 'Administrator', 'admin']);

        console.log('✅ Default admin user created (username: admin, password: admin123)\n');
        console.log('⚠️  IMPORTANT: Change the admin password after first login!\n');

        await appPool.end();
        console.log('🎉 Database setup completed successfully!');

    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;