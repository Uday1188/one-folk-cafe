-- SQLite Initial Migration for One Folk Cafe
-- Consolidates V1 through V16 into a clean SQLite schema

-- Admins Table
CREATE TABLE admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);

-- Customers Table
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    image TEXT
);

-- Products Table
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    full_plate_price DECIMAL(10, 2),
    half_plate_price DECIMAL(10, 2),
    half_plate_available BOOLEAN NOT NULL DEFAULT 0,
    image_url TEXT,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    available BOOLEAN NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    table_number VARCHAR(10),
    status VARCHAR(20) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    payment_method VARCHAR(20),
    paid_at TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    serving_type VARCHAR(10) NOT NULL DEFAULT 'FULL',
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Cafe Settings Table
CREATE TABLE cafe_settings (
    id BIGINT PRIMARY KEY,
    cafe_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    open_time VARCHAR(20) NOT NULL,
    close_time VARCHAR(20) NOT NULL,
    instagram_link VARCHAR(255),
    description TEXT,
    our_story_image TEXT
);

-- Settings Featured Products
CREATE TABLE settings_featured_products (
    settings_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    CONSTRAINT fk_settings_featured_products_settings FOREIGN KEY (settings_id) REFERENCES cafe_settings(id)
);

-- Settings Gallery Items
CREATE TABLE settings_gallery_items (
    settings_id BIGINT NOT NULL,
    src TEXT,
    title VARCHAR(255),
    category VARCHAR(255),
    CONSTRAINT fk_settings_gallery_items_settings FOREIGN KEY (settings_id) REFERENCES cafe_settings(id)
);

-- Notifications Table
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message VARCHAR(255) NOT NULL,
    order_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cafe Tables
CREATE TABLE cafe_tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number VARCHAR(50) NOT NULL UNIQUE,
    capacity INT DEFAULT 4,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Admins (admin / admin and adminroshan)
INSERT INTO admins (username, password, role) VALUES 
('admin', '$2a$10$r9kM8gN1L1U4Uv8iCq2R1uQZqH.p/e2G5L/B.K8x6P2.T9n3zF6zO', 'ADMIN'),
('adminroshan', '$2a$10$YisGVH5dP9A7DYH30/kmuOK5HA3Z0ZUEtpjMZ1LZ300qrDAjQYR5W', 'ADMIN');

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
('Drinks - Mocktails', 'mocktails.jpg'),
('Bread', 'bread.jpg');

-- Initial Products
INSERT INTO products (name, description, full_plate_price, half_plate_price, half_plate_available, category_id, available, is_active) VALUES 
('Hot Coffee', '', 39.00, NULL, 0, 1, 1, 1),
('Black Coffee', '', 39.00, NULL, 0, 1, 1, 1),
('Hot Chocolate', '', 59.00, NULL, 0, 1, 1, 1),
('Lemon Tea', '', 29.00, NULL, 0, 1, 1, 1),
('Honey Tea', '', 29.00, NULL, 0, 1, 1, 1),

('Thick Cold Coffee', '', 59.00, NULL, 0, 2, 1, 1),
('Thick Cold Coffee with Icecream', '', 79.00, NULL, 0, 2, 1, 1),
('Lemon Ice Tea', '', 69.00, NULL, 0, 2, 1, 1),
('Peach Ice Tea', '', 69.00, NULL, 0, 2, 1, 1),

('Cheese Garlic Bread', '', 79.00, NULL, 0, 11, 1, 1),

('Cheese Pizza', 'Cheese Extra Cheese Tomato Puree', 119.00, NULL, 0, 4, 1, 1),
('Margherita Pizza', 'Cheese + Tomato + Dry Basil', 99.00, NULL, 0, 4, 1, 1),
('Spicy Delight Pizza', 'Cheese + Onion + Capsicum', 119.00, NULL, 0, 4, 1, 1),
('Tandoori Paneer Pizza', 'Cheese + Onion + Capsicum + Tandoori Paneer', 149.00, NULL, 0, 4, 1, 1),
('Original Veggie Pizza', 'Cheese + Onion + Capsicum + Sweet Corn + Tomato', 149.00, NULL, 0, 4, 1, 1),
('Paneer Tikka Pizza', 'Cheese + Onion + Capsicum + Tomato + Paneer + Tikka Masala + Coriander', 149.00, NULL, 0, 4, 1, 1),
('One Folk Special Pizza (Combo)', 'Mozzarella Cheese + Paneer + Vegetable Toppings + Corn + Extra Cheese + 1 Cold Coffee / Lemon Ice Tea', 199.00, NULL, 0, 4, 1, 1),

('Veg Burger', '', 79.00, NULL, 0, 5, 1, 1),
('Veg Cheese Burger', '', 89.00, NULL, 0, 5, 1, 1),
('Tandoori Burger', '', 89.00, NULL, 0, 5, 1, 1),
('Tandoori Cheese Burger', '', 99.00, NULL, 0, 5, 1, 1),
('Paneer Burger', '', 119.00, NULL, 0, 5, 1, 1),
('Veg Cheese Grill Sandwich', '', 79.00, NULL, 0, 5, 1, 1),
('Chilly Sandwich', '', 99.00, NULL, 0, 5, 1, 1),
('Peri Peri Grill Sandwich', '', 99.00, NULL, 0, 5, 1, 1),

('Red Sauce Pasta', '', 149.00, NULL, 0, 6, 1, 1),
('White Sauce Pasta', '', 149.00, NULL, 0, 6, 1, 1),
('Alfredo Pasta', '', 179.00, NULL, 0, 6, 1, 1),
('Cheese Nachos', '', 99.00, NULL, 0, 6, 1, 1),
('Tandoori Nachos', '', 119.00, NULL, 0, 6, 1, 1),
('Peri Peri Cheese Nachos', '', 119.00, NULL, 0, 6, 1, 1),

('Peri Peri French Fries', '', 109.00, NULL, 0, 7, 1, 1),
('French Fries', '', 89.00, NULL, 0, 7, 1, 1),
('Cheese Fries', '', 89.00, NULL, 0, 7, 1, 1),
('Double Cheese Fries', '', 109.00, NULL, 0, 7, 1, 1),

('Masala Maggi', '', 59.00, NULL, 0, 8, 1, 1),
('Cheese Maggi', '', 69.00, NULL, 0, 8, 1, 1),
('Veggie Maggi', '', 69.00, NULL, 0, 8, 1, 1),
('Schezwan Maggi', '', 79.00, NULL, 0, 8, 1, 1),

('Rose Shake', '', 99.00, NULL, 0, 9, 1, 1),
('Oreo Shake', '', 99.00, NULL, 0, 9, 1, 1),
('Kit Kat Shake', '', 99.00, NULL, 0, 9, 1, 1),
('Strawberry Shake', '', 99.00, NULL, 0, 9, 1, 1),

('Blue Lagoon', '', 69.00, NULL, 0, 10, 1, 1),
('Green Apple', '', 69.00, NULL, 0, 10, 1, 1),
('Watermelon', '', 69.00, NULL, 0, 10, 1, 1),
('Cranberry', '', 69.00, NULL, 0, 10, 1, 1),
('Mint Mojito', '', 79.00, NULL, 0, 10, 1, 1);

-- Initial Cafe Settings
INSERT INTO cafe_settings (id, cafe_name, address, phone, email, open_time, close_time, instagram_link, description)
VALUES (1, 'One Folk Cafe', 'Nashik, Maharashtra', '9322331131', 'hello@onefolkcafe.in', '08:00', '22:00', 'https://instagram.com/onefolkcafe', 'Crafting artisanal coffees, signature pizzas and cherished memories in Nashik.');

-- Initial Cafe Tables (1-13)
INSERT INTO cafe_tables (table_number, capacity) VALUES 
('1', 4),
('2', 4),
('3', 4),
('4', 4),
('5', 4),
('6', 6),
('7', 6),
('8', 2),
('9', 2),
('10', 2),
('11', 8),
('12', 4),
('13', 4);
