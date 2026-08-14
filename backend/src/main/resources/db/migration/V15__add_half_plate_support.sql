-- Add pricing columns to products table
ALTER TABLE products ADD COLUMN full_plate_price numeric(10, 2);
ALTER TABLE products ADD COLUMN half_plate_price numeric(10, 2);
ALTER TABLE products ADD COLUMN half_plate_available boolean DEFAULT false NOT NULL;

-- Migrate existing product prices to full_plate_price
UPDATE products SET full_plate_price = price;

-- We can drop the old price column safely now
ALTER TABLE products DROP COLUMN price;

-- Add serving_type column to order_items table
ALTER TABLE order_items ADD COLUMN serving_type varchar(10) DEFAULT 'FULL' NOT NULL;
