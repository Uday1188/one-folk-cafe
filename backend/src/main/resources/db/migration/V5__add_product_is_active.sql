ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
UPDATE products SET is_active = true WHERE is_active IS NULL;
ALTER TABLE products ALTER COLUMN is_active SET NOT NULL;
