-- Add payment status to orders
ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'UNPAID' NOT NULL;
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(20);
ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP;
