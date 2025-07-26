require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function updateFlightInfo() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Update the Umroh + Turki package with flight details
        const result = await client.query(
            `UPDATE core.packages SET 
                departure_city = $1,
                transit_city_departure = $2,
                arrival_city = $3,
                return_departure_city = $4,
                transit_city_return = $5,
                return_arrival_city = $6,
                flight_info = $7,
                updated_at = CURRENT_TIMESTAMP
            WHERE code = $8
            RETURNING *`,
            [
                'Jakarta',           // departure_city
                'Istanbul',          // transit_city_departure (Turkish Airlines biasanya transit di Istanbul)
                'Madinah',          // arrival_city (dari WhatsApp: "landing Madinah")
                'Jeddah',           // return_departure_city (standard untuk pulang)
                'Istanbul',         // transit_city_return
                'Jakarta',          // return_arrival_city
                'Penerbangan dengan Turkish Airlines. Berangkat dari Jakarta dengan transit di Istanbul, landing di Madinah. Pulang dari Jeddah transit Istanbul kembali ke Jakarta. Sudah termasuk bagasi sesuai ketentuan maskapai.',
                'UMR-TUR-OCT-2025'
            ]
        );
        
        await client.query('COMMIT');
        
        if (result.rows.length > 0) {
            console.log('\n=== FLIGHT INFO UPDATED SUCCESSFULLY ===');
            console.log('\nPackage:', result.rows[0].name);
            console.log('\nDeparture Flight:');
            console.log('- From:', result.rows[0].departure_city);
            console.log('- Transit:', result.rows[0].transit_city_departure);
            console.log('- To:', result.rows[0].arrival_city);
            console.log('\nReturn Flight:');
            console.log('- From:', result.rows[0].return_departure_city);
            console.log('- Transit:', result.rows[0].transit_city_return);
            console.log('- To:', result.rows[0].return_arrival_city);
            console.log('\nNotes:', result.rows[0].flight_info);
            console.log('\n=====================================');
        }
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating flight info:', error);
    } finally {
        client.release();
        process.exit();
    }
}

updateFlightInfo();