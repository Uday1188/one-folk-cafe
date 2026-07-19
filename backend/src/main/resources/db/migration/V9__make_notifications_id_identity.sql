CREATE SEQUENCE IF NOT EXISTS notifications_id_seq;
ALTER TABLE notifications ALTER COLUMN id SET DEFAULT nextval('notifications_id_seq');
ALTER SEQUENCE notifications_id_seq OWNED BY notifications.id;
