const { query } = require('../config/database');

async function createHotelBookingsFromPackages() {
  try {
    // Get all packages with hotel info
    const packagesResult = await query(`
      SELECT id, kode_paket as code, nama_paket as name, 
             hotel_makkah as makkah_hotel, hotel_madinah as madinah_hotel,
             lama_makkah as makkah_nights, lama_madinah as madinah_nights,
             tanggal_berangkat as departure_date, tanggal_pulang as return_date
      FROM core.packages 
      WHERE hotel_makkah IS NOT NULL 
         OR hotel_madinah IS NOT NULL
      LIMIT 10
    `);
    
    console.log('Found', packagesResult.rows.length, 'packages with hotel info');
    
    let createdCount = 0;
    
    for (const pkg of packagesResult.rows) {
      // Check if bookings already exist for this package
      const existing = await query(
        'SELECT COUNT(*) FROM hotel_bookings WHERE package_id = $1',
        [pkg.id]
      );
      
      if (existing.rows[0].count > 0) {
        console.log('Bookings already exist for package:', pkg.code);
        continue;
      }
      
      // Create Makkah booking if hotel exists
      if (pkg.makkah_hotel) {
        const checkInMakkah = new Date(pkg.departure_date);
        checkInMakkah.setDate(checkInMakkah.getDate() + 1); // Next day after arrival
        
        const checkOutMakkah = new Date(checkInMakkah);
        checkOutMakkah.setDate(checkOutMakkah.getDate() + (pkg.makkah_nights || 7));
        
        // Generate a booking reference
        const bookingRefMakkah = `MKH-${pkg.code}-${Date.now()}`.substring(0, 50);
        
        await query(`
          INSERT INTO hotel_bookings (
            package_id, hotel_name, hotel_city, booking_reference,
            nights, check_in_date, check_out_date, 
            booking_status, payment_status, 
            total_rooms, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          pkg.id, pkg.makkah_hotel, 'makkah', bookingRefMakkah,
          pkg.makkah_nights || 7, checkInMakkah, checkOutMakkah, 
          'confirmed', 'paid', 
          20, 1
        ]);
        
        console.log('Created Makkah booking for package:', pkg.code);
        createdCount++;
      }
      
      // Create Madinah booking if hotel exists
      if (pkg.madinah_hotel) {
        const checkInMadinah = new Date(pkg.departure_date);
        checkInMadinah.setDate(checkInMadinah.getDate() + (pkg.makkah_nights || 7) + 2);
        
        const checkOutMadinah = new Date(checkInMadinah);
        checkOutMadinah.setDate(checkOutMadinah.getDate() + (pkg.madinah_nights || 6));
        
        // Generate a booking reference
        const bookingRefMadinah = `MDH-${pkg.code}-${Date.now()}`.substring(0, 50);
        
        await query(`
          INSERT INTO hotel_bookings (
            package_id, hotel_name, hotel_city, booking_reference,
            nights, check_in_date, check_out_date, 
            booking_status, payment_status, 
            total_rooms, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          pkg.id, pkg.madinah_hotel, 'madinah', bookingRefMadinah,
          pkg.madinah_nights || 6, checkInMadinah, checkOutMadinah, 
          'confirmed', 'paid', 
          20, 1
        ]);
        
        console.log('Created Madinah booking for package:', pkg.code);
        createdCount++;
      }
    }
    
    console.log(`\nSummary: Created ${createdCount} hotel bookings successfully`);
    
    // Show current hotel bookings
    const hotelStats = await query(`
      SELECT 
        hotel_city,
        COUNT(*) as total_bookings,
        COUNT(DISTINCT hotel_name) as unique_hotels
      FROM hotel_bookings
      GROUP BY hotel_city
    `);
    
    console.log('\nCurrent hotel bookings by city:');
    hotelStats.rows.forEach(stat => {
      console.log(`- ${stat.hotel_city}: ${stat.total_bookings} bookings in ${stat.unique_hotels} hotels`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createHotelBookingsFromPackages();