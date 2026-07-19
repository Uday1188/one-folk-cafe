CREATE TABLE cafe_tables (
    id BIGSERIAL PRIMARY KEY,
    table_number VARCHAR(50) NOT NULL UNIQUE,
    capacity INT DEFAULT 4,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed 13 initial tables
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
