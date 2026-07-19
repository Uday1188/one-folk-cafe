CREATE TABLE cafe_settings (
    id BIGINT PRIMARY KEY,
    cafe_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    open_time VARCHAR(20) NOT NULL,
    close_time VARCHAR(20) NOT NULL
);

INSERT INTO cafe_settings (id, cafe_name, address, phone, email, open_time, close_time)
VALUES (1, 'One Folk Cafe', 'Nashik, Maharashtra', '9322331131', 'hello@onefolkcafe.in', '08:00', '22:00');
