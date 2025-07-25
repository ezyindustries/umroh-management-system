const pool = require('../config/database');

const flightController = {
    // Get all PNRs with summary
    async getAllPNRs(req, res) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
                    ps.*,
                    fr.route,
                    fr.total_segments,
                    fr.transit_count,
                    ARRAY_AGG(
                        DISTINCT jsonb_build_object(
                            'id', fs.id,
                            'flight_number', fs.flight_number,
                            'departure_city', fs.departure_city,
                            'departure_airport', fs.departure_airport,
                            'departure_date', fs.departure_date,
                            'departure_time', fs.departure_time,
                            'arrival_city', fs.arrival_city,
                            'arrival_airport', fs.arrival_airport,
                            'arrival_date', fs.arrival_date,
                            'arrival_time', fs.arrival_time,
                            'is_transit', fs.is_transit
                        ) ORDER BY fs.segment_order
                    ) as segments
                FROM pnr_summary ps
                LEFT JOIN flight_routes fr ON ps.id = fr.pnr_id
                LEFT JOIN flight_segments fs ON ps.id = fs.pnr_id
                GROUP BY ps.id, ps.pnr_code, ps.package_id, ps.package_name, 
                         ps.package_departure, ps.airline, ps.total_pax, ps.filled_pax,
                         ps.remaining_pax, ps.status, ps.created_at, ps.created_by_name,
                         ps.total_amount, ps.total_paid, ps.total_outstanding,
                         ps.next_payment_date, ps.next_payment_amount, ps.days_until_payment,
                         fr.route, fr.total_segments, fr.transit_count
                ORDER BY ps.created_at DESC
            `;
            
            const result = await client.query(query);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching PNRs:', error);
            res.status(500).json({ error: 'Failed to fetch PNRs' });
        } finally {
            client.release();
        }
    },

    // Get single PNR with full details
    async getPNRById(req, res) {
        const client = await pool.connect();
        try {
            const { id } = req.params;
            
            // Get PNR details
            const pnrQuery = `
                SELECT 
                    p.*,
                    ps.*,
                    fr.route
                FROM flight_pnrs p
                JOIN pnr_summary ps ON p.id = ps.id
                LEFT JOIN flight_routes fr ON p.id = fr.pnr_id
                WHERE p.id = $1
            `;
            const pnrResult = await client.query(pnrQuery, [id]);
            
            if (pnrResult.rows.length === 0) {
                return res.status(404).json({ error: 'PNR not found' });
            }
            
            const pnr = pnrResult.rows[0];
            
            // Get segments
            const segmentsQuery = `
                SELECT * FROM flight_segments 
                WHERE pnr_id = $1 
                ORDER BY segment_order
            `;
            const segmentsResult = await client.query(segmentsQuery, [id]);
            
            // Get payment schedule
            const paymentsQuery = `
                SELECT * FROM pnr_payment_schedule 
                WHERE pnr_id = $1 
                ORDER BY due_date
            `;
            const paymentsResult = await client.query(paymentsQuery, [id]);
            
            // Get assigned jamaah
            const jamaahQuery = `
                SELECT 
                    pja.*,
                    j.name,
                    j.nik,
                    j.passport_number,
                    j.phone,
                    u.name as assigned_by_name
                FROM pnr_jamaah_assignments pja
                JOIN jamaah j ON pja.jamaah_id = j.id
                LEFT JOIN users u ON pja.assigned_by = u.id
                WHERE pja.pnr_id = $1
                ORDER BY j.name
            `;
            const jamaahResult = await client.query(jamaahQuery, [id]);
            
            res.json({
                ...pnr,
                segments: segmentsResult.rows,
                payment_schedule: paymentsResult.rows,
                assigned_jamaah: jamaahResult.rows
            });
        } catch (error) {
            console.error('Error fetching PNR details:', error);
            res.status(500).json({ error: 'Failed to fetch PNR details' });
        } finally {
            client.release();
        }
    },

    // Create new PNR
    async createPNR(req, res) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const {
                pnr_code,
                package_id,
                airline,
                total_pax,
                segments,
                payment_schedule
            } = req.body;
            
            // Create PNR
            const pnrQuery = `
                INSERT INTO flight_pnrs (
                    pnr_code, package_id, airline, total_pax, created_by
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const pnrResult = await client.query(pnrQuery, [
                pnr_code,
                package_id,
                airline,
                total_pax,
                req.user.id
            ]);
            
            const pnrId = pnrResult.rows[0].id;
            
            // Create segments
            if (segments && segments.length > 0) {
                for (let i = 0; i < segments.length; i++) {
                    const segment = segments[i];
                    const segmentQuery = `
                        INSERT INTO flight_segments (
                            pnr_id, segment_order, flight_number,
                            departure_city, departure_airport, departure_date, departure_time,
                            arrival_city, arrival_airport, arrival_date, arrival_time,
                            is_transit
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    `;
                    await client.query(segmentQuery, [
                        pnrId,
                        i + 1,
                        segment.flight_number,
                        segment.departure_city,
                        segment.departure_airport,
                        segment.departure_date,
                        segment.departure_time,
                        segment.arrival_city,
                        segment.arrival_airport,
                        segment.arrival_date,
                        segment.arrival_time,
                        segment.is_transit || false
                    ]);
                }
            }
            
            // Create payment schedule
            if (payment_schedule && payment_schedule.length > 0) {
                for (const payment of payment_schedule) {
                    const paymentQuery = `
                        INSERT INTO pnr_payment_schedule (
                            pnr_id, payment_type, amount, due_date, notes
                        ) VALUES ($1, $2, $3, $4, $5)
                    `;
                    await client.query(paymentQuery, [
                        pnrId,
                        payment.payment_type,
                        payment.amount,
                        payment.due_date,
                        payment.notes
                    ]);
                }
            }
            
            await client.query('COMMIT');
            
            // Return the created PNR with details
            const result = await this.getPNRById({ params: { id: pnrId } }, res);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating PNR:', error);
            res.status(500).json({ error: 'Failed to create PNR' });
        } finally {
            client.release();
        }
    },

    // Update PNR
    async updatePNR(req, res) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { id } = req.params;
            const {
                pnr_code,
                airline,
                total_pax,
                status,
                segments,
                payment_schedule
            } = req.body;
            
            // Update PNR
            const updateQuery = `
                UPDATE flight_pnrs 
                SET pnr_code = $1, airline = $2, total_pax = $3, status = $4, updated_at = CURRENT_TIMESTAMP
                WHERE id = $5
                RETURNING *
            `;
            await client.query(updateQuery, [pnr_code, airline, total_pax, status, id]);
            
            // Update segments if provided
            if (segments) {
                // Delete existing segments
                await client.query('DELETE FROM flight_segments WHERE pnr_id = $1', [id]);
                
                // Insert new segments
                for (let i = 0; i < segments.length; i++) {
                    const segment = segments[i];
                    const segmentQuery = `
                        INSERT INTO flight_segments (
                            pnr_id, segment_order, flight_number,
                            departure_city, departure_airport, departure_date, departure_time,
                            arrival_city, arrival_airport, arrival_date, arrival_time,
                            is_transit
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    `;
                    await client.query(segmentQuery, [
                        id,
                        i + 1,
                        segment.flight_number,
                        segment.departure_city,
                        segment.departure_airport,
                        segment.departure_date,
                        segment.departure_time,
                        segment.arrival_city,
                        segment.arrival_airport,
                        segment.arrival_date,
                        segment.arrival_time,
                        segment.is_transit || false
                    ]);
                }
            }
            
            await client.query('COMMIT');
            res.json({ message: 'PNR updated successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error updating PNR:', error);
            res.status(500).json({ error: 'Failed to update PNR' });
        } finally {
            client.release();
        }
    },

    // Assign jamaah to PNR
    async assignJamaah(req, res) {
        const client = await pool.connect();
        try {
            const { id } = req.params;
            const { jamaah_ids, seat_numbers } = req.body;
            
            await client.query('BEGIN');
            
            // Check PNR capacity
            const capacityQuery = `
                SELECT total_pax, filled_pax FROM flight_pnrs WHERE id = $1
            `;
            const capacityResult = await client.query(capacityQuery, [id]);
            
            if (capacityResult.rows.length === 0) {
                return res.status(404).json({ error: 'PNR not found' });
            }
            
            const { total_pax, filled_pax } = capacityResult.rows[0];
            const remaining = total_pax - filled_pax;
            
            if (jamaah_ids.length > remaining) {
                return res.status(400).json({ 
                    error: `Cannot assign ${jamaah_ids.length} jamaah. Only ${remaining} seats remaining.` 
                });
            }
            
            // Assign jamaah
            for (let i = 0; i < jamaah_ids.length; i++) {
                const assignQuery = `
                    INSERT INTO pnr_jamaah_assignments (
                        pnr_id, jamaah_id, seat_number, assigned_by
                    ) VALUES ($1, $2, $3, $4)
                    ON CONFLICT (pnr_id, jamaah_id) 
                    DO UPDATE SET seat_number = $3, assigned_date = CURRENT_TIMESTAMP
                `;
                await client.query(assignQuery, [
                    id,
                    jamaah_ids[i],
                    seat_numbers ? seat_numbers[i] : null,
                    req.user.id
                ]);
            }
            
            await client.query('COMMIT');
            res.json({ message: 'Jamaah assigned successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error assigning jamaah:', error);
            res.status(500).json({ error: 'Failed to assign jamaah' });
        } finally {
            client.release();
        }
    },

    // Remove jamaah from PNR
    async removeJamaah(req, res) {
        const client = await pool.connect();
        try {
            const { id, jamaahId } = req.params;
            
            const deleteQuery = `
                DELETE FROM pnr_jamaah_assignments 
                WHERE pnr_id = $1 AND jamaah_id = $2
            `;
            const result = await client.query(deleteQuery, [id, jamaahId]);
            
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Assignment not found' });
            }
            
            res.json({ message: 'Jamaah removed from PNR successfully' });
        } catch (error) {
            console.error('Error removing jamaah:', error);
            res.status(500).json({ error: 'Failed to remove jamaah' });
        } finally {
            client.release();
        }
    },

    // Update payment
    async updatePayment(req, res) {
        const client = await pool.connect();
        try {
            const { id, paymentId } = req.params;
            const { paid_amount, paid_date, notes } = req.body;
            
            const updateQuery = `
                UPDATE pnr_payment_schedule
                SET 
                    paid_amount = $1,
                    paid_date = $2,
                    payment_status = CASE 
                        WHEN $1 >= amount THEN 'paid'
                        WHEN $1 > 0 THEN 'partial'
                        ELSE 'pending'
                    END,
                    notes = $3
                WHERE id = $4 AND pnr_id = $5
                RETURNING *
            `;
            
            const result = await client.query(updateQuery, [
                paid_amount,
                paid_date,
                notes,
                paymentId,
                id
            ]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Payment not found' });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating payment:', error);
            res.status(500).json({ error: 'Failed to update payment' });
        } finally {
            client.release();
        }
    },

    // Get available jamaah for PNR assignment
    async getAvailableJamaah(req, res) {
        const client = await pool.connect();
        try {
            const { packageId } = req.params;
            
            const query = `
                SELECT 
                    j.id,
                    j.name,
                    j.nik,
                    j.passport_number,
                    j.phone,
                    p.name as package_name
                FROM jamaah j
                JOIN packages p ON j.package_id = p.id
                WHERE j.package_id = $1
                AND j.id NOT IN (
                    SELECT jamaah_id FROM pnr_jamaah_assignments
                )
                ORDER BY j.name
            `;
            
            const result = await client.query(query, [packageId]);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching available jamaah:', error);
            res.status(500).json({ error: 'Failed to fetch available jamaah' });
        } finally {
            client.release();
        }
    }
};

module.exports = flightController;