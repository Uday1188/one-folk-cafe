CREATE TABLE settings_gallery_items (
    settings_id BIGINT NOT NULL,
    src TEXT,
    title VARCHAR(255),
    category VARCHAR(255),
    CONSTRAINT fk_settings_gallery_items_settings FOREIGN KEY (settings_id) REFERENCES cafe_settings(id)
);
