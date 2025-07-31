-- Add additional PNR-related fields to packages table
ALTER TABLE core.packages 
ADD COLUMN IF NOT EXISTS payment_due_date DATE,
ADD COLUMN IF NOT EXISTS insert_name_deadline DATE,
ADD COLUMN IF NOT EXISTS ticket_total_price DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS ticket_paid_amount DECIMAL(15, 2);

-- Add comments for clarity
COMMENT ON COLUMN core.packages.payment_due_date IS 'Tanggal jatuh tempo pelunasan tiket';
COMMENT ON COLUMN core.packages.insert_name_deadline IS 'Batas waktu terakhir insert name penumpang';
COMMENT ON COLUMN core.packages.ticket_total_price IS 'Total harga tiket pesawat';
COMMENT ON COLUMN core.packages.ticket_paid_amount IS 'Jumlah yang sudah dibayar untuk tiket';