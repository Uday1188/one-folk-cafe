-- Add adminroshan user
INSERT INTO admins (username, password, role)
VALUES ('adminroshan', '$2a$10$YisGVH5dP9A7DYH30/kmuOK5HA3Z0ZUEtpjMZ1LZ300qrDAjQYR5W', 'ADMIN')
ON CONFLICT (username) DO NOTHING;
