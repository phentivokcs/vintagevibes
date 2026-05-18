-- Minimal seed data for trades and equity_history
BEGIN TRANSACTION;

INSERT INTO trades (timestamp, symbol, side, price, quantity, fee, realized_pnl, reason) VALUES
('2026-05-01T10:00:00Z', 'BTCUSDT', 'buy', 50000, 0.01, 0.0, 0.0, 'entry'),
('2026-05-02T12:00:00Z', 'BTCUSDT', 'sell', 50500, 0.01, 0.0, 5.0, 'exit'),
('2026-05-03T09:30:00Z', 'ETHUSDT', 'buy', 3000, 0.1, 0.0, 0.0, 'entry'),
('2026-05-04T15:45:00Z', 'ETHUSDT', 'sell', 2950, 0.1, 0.0, -5.0, 'stop');

INSERT INTO equity_history (timestamp, equity, cash, position_value) VALUES
('2026-05-01T10:00:00Z', 1000.0, 1000.0, 0.0),
('2026-05-02T12:00:00Z', 1005.0, 1005.0, 0.0),
('2026-05-04T15:45:00Z', 1000.0, 1000.0, 0.0);

COMMIT;
