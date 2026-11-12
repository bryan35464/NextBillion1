/*
# Create dashboard data tables for centralized editable sandbox data

1. New Tables
- `dashboard_config`: Single-row table holding all editable dashboard values (P&L, balances, fees, profile info).
- `positions`: Editable trading positions shown on the dashboard.
- `holdings`: Editable crypto holdings shown on wallet/portfolio.
- `dashboard_orders`: Editable orders shown on the orders page.
- `dashboard_transactions`: Editable transactions shown on the history/funds page.

2. Security
- RLS enabled on all tables.
- All tables: authenticated users can read their own data; admin can read all and write.
- dashboard_config: public read (so anon can see it too), admin write.
*/

-- ============ DASHBOARD CONFIG (single row) ============
CREATE TABLE IF NOT EXISTS dashboard_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Profile
  user_name text NOT NULL DEFAULT 'Trader',
  user_email text DEFAULT 'trader@cryptotrading.com',
  user_phone text DEFAULT '',
  user_avatar text DEFAULT '',
  -- P&L
  total_pnl numeric DEFAULT 102750,
  realized_pnl numeric DEFAULT 45200,
  unrealized_pnl numeric DEFAULT 57550,
  total_pnl_percent numeric DEFAULT 12.85,
  today_pnl numeric DEFAULT 8450,
  today_pnl_percent numeric DEFAULT 3.42,
  -- Portfolio
  total_portfolio_value numeric DEFAULT 250000,
  invested_capital numeric DEFAULT 900000,
  current_value numeric DEFAULT 1002750,
  return_percent numeric DEFAULT 11.42,
  -- Wallet
  total_wallet_balance numeric DEFAULT 250000,
  available_balance numeric DEFAULT 185000,
  locked_balance numeric DEFAULT 65000,
  inr_balance numeric DEFAULT 250000,
  -- Fees
  gst_fee numeric DEFAULT 1250,
  gst_fee_remaining numeric DEFAULT 3750,
  platform_fee_percent numeric DEFAULT 0.10,
  trading_fee_percent numeric DEFAULT 0.20,
  -- Market prices (editable overrides)
  btc_price numeric DEFAULT 95000,
  eth_price numeric DEFAULT 3500,
  sol_price numeric DEFAULT 195.5,
  btc_change numeric DEFAULT 2.45,
  eth_change numeric DEFAULT 3.12,
  sol_change numeric DEFAULT 5.67,
  -- Status
  account_status text DEFAULT 'Active',
  kyc_status text DEFAULT 'Verified',
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dashboard_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_dashboard_config" ON dashboard_config;
CREATE POLICY "public_read_dashboard_config" ON dashboard_config FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_dashboard_config" ON dashboard_config;
CREATE POLICY "admin_update_dashboard_config" ON dashboard_config FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_insert_dashboard_config" ON dashboard_config;
CREATE POLICY "admin_insert_dashboard_config" ON dashboard_config FOR INSERT
  TO authenticated WITH CHECK (true);

INSERT INTO dashboard_config (id) SELECT gen_random_uuid() WHERE NOT EXISTS (SELECT 1 FROM dashboard_config);

-- ============ POSITIONS ============
CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument text NOT NULL,
  product text NOT NULL DEFAULT 'Spot',
  quantity numeric NOT NULL DEFAULT 0,
  avg_price numeric NOT NULL DEFAULT 0,
  ltp numeric NOT NULL DEFAULT 0,
  pnl numeric DEFAULT 0,
  pnl_percent numeric DEFAULT 0,
  side text NOT NULL DEFAULT 'buy',
  status text DEFAULT 'open',
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_positions" ON positions;
CREATE POLICY "public_read_positions" ON positions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_all_positions" ON positions;
CREATE POLICY "admin_all_positions" ON positions FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- ============ HOLDINGS ============
CREATE TABLE IF NOT EXISTS holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_name text NOT NULL,
  asset_symbol text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  avg_price numeric NOT NULL DEFAULT 0,
  current_price numeric NOT NULL DEFAULT 0,
  value numeric DEFAULT 0,
  pnl numeric DEFAULT 0,
  pnl_percent numeric DEFAULT 0,
  allocation_percent numeric DEFAULT 0,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_holdings" ON holdings;
CREATE POLICY "public_read_holdings" ON holdings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_all_holdings" ON holdings;
CREATE POLICY "admin_all_holdings" ON holdings FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- ============ DASHBOARD ORDERS ============
CREATE TABLE IF NOT EXISTS dashboard_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument text NOT NULL,
  product text NOT NULL DEFAULT 'Spot',
  order_type text NOT NULL DEFAULT 'Market',
  side text NOT NULL DEFAULT 'buy',
  quantity numeric NOT NULL DEFAULT 0,
  price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dashboard_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_dashboard_orders" ON dashboard_orders;
CREATE POLICY "public_read_dashboard_orders" ON dashboard_orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_all_dashboard_orders" ON dashboard_orders;
CREATE POLICY "admin_all_dashboard_orders" ON dashboard_orders FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- ============ DASHBOARD TRANSACTIONS ============
CREATE TABLE IF NOT EXISTS dashboard_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  instrument text DEFAULT '',
  quantity numeric DEFAULT 0,
  price numeric DEFAULT 0,
  amount numeric DEFAULT 0,
  pnl numeric DEFAULT 0,
  pnl_percent numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  date text DEFAULT '',
  time text DEFAULT '',
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dashboard_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_dashboard_transactions" ON dashboard_transactions;
CREATE POLICY "public_read_dashboard_transactions" ON dashboard_transactions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_all_dashboard_transactions" ON dashboard_transactions;
CREATE POLICY "admin_all_dashboard_transactions" ON dashboard_transactions FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- ============ SEED DATA ============
INSERT INTO positions (instrument, product, quantity, avg_price, ltp, pnl, pnl_percent, side, display_order) VALUES
('BTCINR', 'Spot', 0.5, 880000, 95000, 3500, 7.95, 'buy', 1),
('ETHINR', 'Spot', 3.0, 320000, 3500, 900, 9.38, 'buy', 2),
('SOLINR', 'Spot', 25.0, 180, 195.5, 387.5, 8.61, 'buy', 3),
('XRPINR', 'Spot', 1000.0, 2.30, 2.35, 50, 2.17, 'buy', 4),
('BNBINR', 'Spot', 5.0, 580, 615.8, 179, 6.17, 'buy', 5)
ON CONFLICT DO NOTHING;

INSERT INTO holdings (asset_name, asset_symbol, quantity, avg_price, current_price, value, pnl, pnl_percent, allocation_percent, display_order) VALUES
('Bitcoin', 'BTC', 0.5, 88000, 95000, 47500, 3500, 7.95, 47.5, 1),
('Ethereum', 'ETH', 3.0, 3200, 3500, 10500, 900, 9.38, 10.5, 2),
('Solana', 'SOL', 25.0, 180, 195.5, 4887.5, 387.5, 8.61, 4.9, 3),
('Tether', 'USDT', 5000, 1.0, 1.0, 5000, 0, 0, 5.0, 4),
('INR', 'INR', 250000, 1.0, 1.0, 250000, 0, 0, 0, 5),
('XRP', 'XRP', 1000, 2.30, 2.35, 2350, 50, 2.17, 2.4, 6),
('BNB', 'BNB', 5, 580, 615.8, 3079, 179, 6.17, 3.1, 7)
ON CONFLICT DO NOTHING;

INSERT INTO dashboard_orders (instrument, product, order_type, side, quantity, price, status, display_order) VALUES
('BTCINR', 'Spot', 'Market', 'buy', 0.5, 95000, 'completed', 1),
('ETHINR', 'Spot', 'Limit', 'buy', 3.0, 3500, 'completed', 2),
('SOLINR', 'Spot', 'Market', 'buy', 25.0, 195.5, 'completed', 3),
('XRPINR', 'Spot', 'Limit', 'sell', 500, 2.35, 'completed', 4),
('BNBINR', 'Spot', 'Market', 'buy', 5.0, 615.8, 'completed', 5),
('BTCINR', 'Spot', 'Limit', 'sell', 0.1, 96000, 'open', 6)
ON CONFLICT DO NOTHING;

INSERT INTO dashboard_transactions (type, instrument, quantity, price, amount, pnl, pnl_percent, status, date, time, display_order) VALUES
('Buy', 'BTCINR', 0.5, 95000, 47500, 0, 0, 'completed', '2026-09-10', '14:30:25', 1),
('Sell', 'ETHINR', 1.0, 3520, 3520, 320, 10.0, 'completed', '2026-09-10', '12:15:10', 2),
('Buy', 'SOLINR', 25.0, 195.5, 4887.5, 0, 0, 'completed', '2026-09-10', '11:45:33', 3),
('Deposit', 'INR', 0, 1.0, 100000, 0, 0, 'completed', '2026-09-09', '09:20:00', 4),
('Withdraw', 'INR', 0, 1.0, 25000, 0, 0, 'completed', '2026-09-09', '16:30:00', 5),
('Sell', 'XRPINR', 500, 2.35, 1175, 25, 2.17, 'completed', '2026-09-09', '14:10:15', 6),
('Buy', 'BNBINR', 5.0, 615.8, 3079, 0, 0, 'completed', '2026-09-08', '10:05:42', 7)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_positions_display ON positions(display_order);
CREATE INDEX IF NOT EXISTS idx_holdings_display ON holdings(display_order);
CREATE INDEX IF NOT EXISTS idx_dash_orders_display ON dashboard_orders(display_order);
CREATE INDEX IF NOT EXISTS idx_dash_tx_display ON dashboard_transactions(display_order);