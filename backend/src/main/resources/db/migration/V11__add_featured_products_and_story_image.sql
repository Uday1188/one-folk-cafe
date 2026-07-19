ALTER TABLE cafe_settings ADD COLUMN our_story_image TEXT;

CREATE TABLE settings_featured_products (
    settings_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    CONSTRAINT fk_settings_featured_products_settings FOREIGN KEY (settings_id) REFERENCES cafe_settings(id)
);
