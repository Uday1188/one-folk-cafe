-- Admins Table
CREATE TABLE admins (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);

-- Customers Table
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    image VARCHAR(255)
);

-- Products Table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    table_number VARCHAR(10),
    status VARCHAR(20) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Initial Admin (Password is 'admin' hashed with BCrypt)
INSERT INTO admins (username, password, role) VALUES 
('admin', '$2a$10$r9kM8gN1L1U4Uv8iCq2R1uQZqH.p/e2G5L/B.K8x6P2.T9n3zF6zO', 'ADMIN');

-- Initial Categories
INSERT INTO categories (name, image) VALUES 
('Hot Beverages', 'hot_beverages.jpg'),
('Cold Beverages', 'cold_beverages.jpg'),
('Starters & Sides', 'starters.jpg'),
('Pizza', 'pizza.jpg'),
('Burgers & Sandwiches', 'burgers.jpg'),
('Pastas & Nachos', 'pastas.jpg'),
('Fries', 'fries.jpg'),
('Maggi', 'maggi.jpg'),
('Milk Shakes', 'milk_shakes.jpg'),
('Drinks - Mocktails', 'mocktails.jpg');

-- Initial Products (Sample based on menu)
INSERT INTO products (name, description, price, category_id, available) VALUES 
('Hot Coffee', '', 39.00, 1, true),
('Black Coffee', '', 39.00, 1, true),
('Hot Chocolate', '', 59.00, 1, true),
('Lemon Tea', '', 29.00, 1, true),
('Honey Tea', '', 29.00, 1, true),

('Thick Cold Coffee', '', 59.00, 2, true),
('Thick Cold Coffee with Icecream', '', 79.00, 2, true),
('Lemon Ice Tea', '', 69.00, 2, true),
('Peach Ice Tea', '', 69.00, 2, true),

('Cheese Garlic Bread', '', 79.00, 3, true),

('Cheese Pizza', 'Cheese Extra Cheese Tomato Puree', 119.00, 4, true),
('Margherita Pizza', 'Cheese + Tomato + Dry Basil', 99.00, 4, true),
('Spicy Delight Pizza', 'Cheese + Onion + Capsicum', 119.00, 4, true),
('Tandoori Paneer Pizza', 'Cheese + Onion + Capsicum + Tandoori Paneer', 149.00, 4, true),
('Original Veggie Pizza', 'Cheese + Onion + Capsicum + Sweet Corn + Tomato', 149.00, 4, true),
('Paneer Tikka Pizza', 'Cheese + Onion + Capsicum + Tomato + Paneer + Tikka Masala + Coriander', 149.00, 4, true),
('One Folk Special Pizza (Combo)', 'Mozzarella Cheese + Paneer + Vegetable Toppings + Corn + Extra Cheese + 1 Cold Coffee / Lemon Ice Tea', 199.00, 4, true),

('Veg Burger', '', 79.00, 5, true),
('Veg Cheese Burger', '', 89.00, 5, true),
('Tandoori Burger', '', 89.00, 5, true),
('Tandoori Cheese Burger', '', 99.00, 5, true),
('Paneer Burger', '', 119.00, 5, true),
('Veg Cheese Grill Sandwich', '', 79.00, 5, true),
('Chilly Sandwich', '', 99.00, 5, true),
('Peri Peri Grill Sandwich', '', 99.00, 5, true),

('Red Sauce Pasta', '', 149.00, 6, true),
('White Sauce Pasta', '', 149.00, 6, true),
('Alfredo Pasta', '', 179.00, 6, true),
('Cheese Nachos', '', 99.00, 6, true),
('Tandoori Nachos', '', 119.00, 6, true),
('Peri Peri Cheese Nachos', '', 119.00, 6, true),

('Peri Peri French Fries', '', 109.00, 7, true),
('French Fries', '', 89.00, 7, true),
('Cheese Fries', '', 89.00, 7, true),
('Double Cheese Fries', '', 109.00, 7, true),

('Masala Maggi', '', 59.00, 8, true),
('Cheese Maggi', '', 69.00, 8, true),
('Veggie Maggi', '', 69.00, 8, true),
('Schezwan Maggi', '', 79.00, 8, true),

('Rose Shake', '', 99.00, 9, true),
('Oreo Shake', '', 99.00, 9, true),
('Kit Kat Shake', '', 99.00, 9, true),
('Strawberry Shake', '', 99.00, 9, true),

('Blue Lagoon', '', 69.00, 10, true),
('Green Apple', '', 69.00, 10, true),
('Watermelon', '', 69.00, 10, true),
('Cranberry', '', 69.00, 10, true),
('Mint Mojito', '', 79.00, 10, true);
