-- Migrate legacy PREPARING and READY orders to PENDING status
UPDATE orders SET status = 'PENDING' WHERE status IN ('PREPARING', 'READY');
