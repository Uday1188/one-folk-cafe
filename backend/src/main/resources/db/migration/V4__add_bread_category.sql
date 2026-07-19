-- Insert Bread category if it does not exist
INSERT INTO categories (name, image) 
VALUES ('Bread', 'bread.jpg')
ON CONFLICT (name) DO NOTHING;

-- Update Cheese Garlic Bread to use the new Bread category
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Bread')
WHERE name = 'Cheese Garlic Bread';
