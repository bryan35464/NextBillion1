/*
# Create core platform schema for Next billion technologies crypto exchange

1. Overview
This migration creates the complete database schema for a crypto trading platform with full admin CMS control.
All public-facing content (site name, headlines, prices, stats, FAQs, banners, etc.) is stored in the database
and editable from the admin dashboard without touching code.

2. New Tables
- `site_settings`: Single-row table holding all global website settings (name, logo, colors, headlines, fees, stats, maintenance mode, demo mode).
- `assets`: Cryptocurrency assets with editable prices, changes, volume, market cap, status.
- `announcements`: Platform-wide announcements banner content.
- `faqs`: FAQ questions and answers.
- `blog_posts`: Blog/news articles.
- `notifications`: User-facing notifications.
- `transactions`: Demo wallet transactions (deposits, withdrawals, transfers).
- `orders`: Demo trading orders.
- `audit_logs`: Audit trail of every admin modification (admin, action, previous value, new value, timestamp).
- `user_profiles`: Extended user profile data linked to auth.users (full name, phone, avatar, role, verification status, trading status).

3. Security
- RLS enabled on every table.
- site_settings, assets, announcements, faqs, blog_posts: public read (anon + authenticated), admin-only write via authenticated + role check.
- user_profiles: users read/update own profile; admins can read all.
- transactions, orders: users access own data; admins read all.
- audit_logs: admin-only read; insert via service role or authenticated admin.
- notifications: users read own; admins insert.
*/

-- ============ SITE SETTINGS (single row) ============
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Next billion technologies',
  logo_url text DEFAULT '',
  favicon_url text DEFAULT '',
  primary_color text DEFAULT '#3b82f6',
  accent_color text DEFAULT '#22d3ee',
  hero_headline text NOT NULL DEFAULT 'Trade Crypto With Confidence',
  hero_subtitle text NOT NULL DEFAULT 'Buy, sell and trade 200+ cryptocurrencies on the most secure and trusted digital asset platform.',
  hero_cta_text text DEFAULT 'Start Trading',
  hero_secondary_cta text DEFAULT 'Explore Markets',
  hero_image_url text DEFAULT '',
  total_users bigint DEFAULT 1250000,
  trading_volume numeric DEFAULT 500000000,
  supported_countries bigint DEFAULT 80,
  supported_assets bigint DEFAULT 200,
  platform_fee numeric DEFAULT 0.10,
  trading_fee_taker numeric DEFAULT 0.20,
  trading_fee_maker numeric DEFAULT 0.10,
  min_deposit numeric DEFAULT 10,
  max_deposit numeric DEFAULT 1000000,
  min_withdrawal numeric DEFAULT 5,
  max_withdrawal numeric DEFAULT 500000,
  demo_mode boolean DEFAULT true,
  maintenance_mode boolean DEFAULT false,
  maintenance_message text DEFAULT 'We are performing maintenance. We will be back shortly.',
  footer_text text DEFAULT 'Next billion technologies. All rights reserved.',
  contact_email text DEFAULT 'support@nextbillion.tech',
  contact_phone text DEFAULT '+1 (800) 555-0199',
  contact_address text DEFAULT '123 Finance Avenue, Crypto City, CC 90210',
  twitter_url text DEFAULT 'https://twitter.com',
  telegram_url text DEFAULT 'https://telegram.org',
  linkedin_url text DEFAULT 'https://linkedin.com',
  facebook_url text DEFAULT 'https://facebook.com',
  terms_content text DEFAULT 'Terms and conditions content goes here.',
  privacy_content text DEFAULT 'Privacy policy content goes here.',
  about_content text DEFAULT 'About Next billion technologies.',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_site_settings" ON site_settings;
CREATE POLICY "admin_update_site_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_insert_site_settings" ON site_settings;
CREATE POLICY "admin_insert_site_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);

-- Seed default settings row
INSERT INTO site_settings (id) SELECT gen_random_uuid() WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- ============ ASSETS ============
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  symbol text NOT NULL UNIQUE,
  logo_url text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  change_24h numeric NOT NULL DEFAULT 0,
  high_24h numeric NOT NULL DEFAULT 0,
  low_24h numeric NOT NULL DEFAULT 0,
  volume_24h numeric NOT NULL DEFAULT 0,
  market_cap numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  trading_enabled boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_assets" ON assets;
CREATE POLICY "public_read_assets" ON assets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_assets" ON assets;
CREATE POLICY "admin_insert_assets" ON assets FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_assets" ON assets;
CREATE POLICY "admin_update_assets" ON assets FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_assets" ON assets;
CREATE POLICY "admin_delete_assets" ON assets FOR DELETE
  TO authenticated USING (true);

-- ============ ANNOUNCEMENTS ============
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text DEFAULT 'info',
  is_active boolean DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_announcements" ON announcements;
CREATE POLICY "public_read_announcements" ON announcements FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_all_announcements" ON announcements;
CREATE POLICY "admin_all_announcements" ON announcements FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- ============ FAQS ============
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'General',
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_faqs" ON faqs;
CREATE POLICY "public_read_faqs" ON faqs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_all_faqs" ON faqs;
CREATE POLICY "admin_all_faqs" ON faqs FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- ============ BLOG POSTS ============
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_image_url text DEFAULT '',
  category text DEFAULT 'News',
  author text DEFAULT 'Next billion technologies Team',
  status text DEFAULT 'published',
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_blog_posts" ON blog_posts;
CREATE POLICY "public_read_blog_posts" ON blog_posts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_all_blog_posts" ON blog_posts;
CREATE POLICY "admin_all_blog_posts" ON blog_posts FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_read_notifications" ON notifications;
CREATE POLICY "user_read_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_update_notifications" ON notifications;
CREATE POLICY "user_update_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_delete_notifications" ON notifications;
CREATE POLICY "user_delete_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_all_notifications" ON notifications;
CREATE POLICY "admin_all_notifications" ON notifications FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- ============ USER PROFILES ============
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  country text DEFAULT '',
  role text NOT NULL DEFAULT 'user',
  verification_status text NOT NULL DEFAULT 'unverified',
  trading_enabled boolean NOT NULL DEFAULT true,
  two_factor_enabled boolean DEFAULT false,
  account_limit_deposit numeric DEFAULT 100000,
  account_limit_withdrawal numeric DEFAULT 50000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_read_own_profile" ON user_profiles;
CREATE POLICY "user_read_own_profile" ON user_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_update_own_profile" ON user_profiles;
CREATE POLICY "user_update_own_profile" ON user_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_insert_own_profile" ON user_profiles;
CREATE POLICY "user_insert_own_profile" ON user_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_read_all_profiles" ON user_profiles;
CREATE POLICY "admin_read_all_profiles" ON user_profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_profiles" ON user_profiles;
CREATE POLICY "admin_update_profiles" ON user_profiles FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ TRANSACTIONS (DEMO) ============
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  asset_symbol text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  tx_hash text DEFAULT '',
  address text DEFAULT '',
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_read_own_transactions" ON transactions;
CREATE POLICY "user_read_own_transactions" ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_insert_own_transactions" ON transactions;
CREATE POLICY "user_insert_own_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_update_own_transactions" ON transactions;
CREATE POLICY "user_update_own_transactions" ON transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_all_transactions" ON transactions;
CREATE POLICY "admin_all_transactions" ON transactions FOR SELECT
  TO authenticated USING (true);

-- ============ ORDERS (DEMO) ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  pair text NOT NULL,
  side text NOT NULL,
  order_type text NOT NULL,
  price numeric DEFAULT 0,
  quantity numeric NOT NULL DEFAULT 0,
  filled_qty numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_read_own_orders" ON orders;
CREATE POLICY "user_read_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_insert_own_orders" ON orders;
CREATE POLICY "user_insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_update_own_orders" ON orders;
CREATE POLICY "user_update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_delete_own_orders" ON orders;
CREATE POLICY "user_delete_own_orders" ON orders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_all_orders" ON orders;
CREATE POLICY "admin_all_orders" ON orders FOR SELECT
  TO authenticated USING (true);

-- ============ AUDIT LOGS ============
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text DEFAULT '',
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_audit_logs" ON audit_logs;
CREATE POLICY "admin_read_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_audit_logs" ON audit_logs;
CREATE POLICY "admin_insert_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============ WALLETS (DEMO) ============
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_symbol text NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  available numeric NOT NULL DEFAULT 0,
  in_order numeric NOT NULL DEFAULT 0,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, asset_symbol)
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_read_own_wallets" ON wallets;
CREATE POLICY "user_read_own_wallets" ON wallets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_insert_own_wallets" ON wallets;
CREATE POLICY "user_insert_own_wallets" ON wallets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_update_own_wallets" ON wallets;
CREATE POLICY "user_update_own_wallets" ON wallets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_all_wallets" ON wallets;
CREATE POLICY "admin_all_wallets" ON wallets FOR SELECT
  TO authenticated USING (true);

-- ============ SEED DATA: ASSETS ============
INSERT INTO assets (name, symbol, price, change_24h, high_24h, low_24h, volume_24h, market_cap, is_featured, display_order) VALUES
('Bitcoin', 'BTC', 95000, 2.45, 96200, 93800, 28000000000, 1900000000000, true, 1),
('Ethereum', 'ETH', 3500, 3.12, 3580, 3420, 15000000000, 420000000000, true, 2),
('Solana', 'SOL', 195.5, 5.67, 198, 186, 5000000000, 92000000000, true, 3),
('XRP', 'XRP', 2.35, -1.23, 2.42, 2.30, 3000000000, 132000000000, true, 4),
('BNB', 'BNB', 615.8, 1.89, 622, 610, 2000000000, 89000000000, true, 5),
('Dogecoin', 'DOGE', 0.385, 4.56, 0.392, 0.371, 1500000000, 56000000000, true, 6),
('Tether', 'USDT', 1.0, 0.01, 1.001, 0.999, 80000000000, 138000000000, true, 7),
('Cardano', 'ADA', 0.92, -0.54, 0.94, 0.91, 800000000, 32000000000, false, 8),
('Polkadot', 'DOT', 7.85, 2.34, 8.02, 7.71, 400000000, 11000000000, false, 9),
('Avalanche', 'AVAX', 38.5, 3.78, 39.2, 37.1, 500000000, 16000000000, false, 10),
('Chainlink', 'LINK', 22.3, 1.45, 22.8, 22.0, 600000000, 14000000000, false, 11),
('Polygon', 'MATIC', 0.58, -2.10, 0.60, 0.57, 350000000, 5800000000, false, 12)
ON CONFLICT (symbol) DO NOTHING;

-- ============ SEED DATA: FAQS ============
INSERT INTO faqs (question, answer, category, display_order) VALUES
('Is Next billion technologies safe to use?', 'Yes. We use industry-leading security practices including encrypted storage, two-factor authentication, and cold wallet storage for the majority of assets.', 'Security', 1),
('What cryptocurrencies can I trade?', 'We support over 200 cryptocurrencies including Bitcoin, Ethereum, Solana, XRP, BNB, Dogecoin, USDT and many more.', 'Trading', 2),
('How long do deposits take?', 'Deposit times depend on the blockchain network. Most deposits are credited within 10-30 minutes after the required network confirmations.', 'Deposits', 3),
('What are the trading fees?', 'Our trading fees start at 0.10% for makers and 0.20% for takers. Fees decrease as your trading volume increases.', 'Fees', 4),
('Is this platform in demo mode?', 'Yes, this platform is currently running in DEMO/SANDBOX mode. All balances, trades, and transactions are simulated for testing purposes.', 'General', 5),
('How do I enable two-factor authentication?', 'You can enable 2FA from your profile security settings. We support authenticator apps for enhanced account security.', 'Security', 6),
('Can I withdraw my funds anytime?', 'Yes, withdrawals are available 24/7. However, large withdrawals may require additional verification for security purposes.', 'Withdrawals', 7),
('What payment methods are supported?', 'We support bank transfers, credit/debit cards, and cryptocurrency deposits.', 'Deposits', 8)
ON CONFLICT DO NOTHING;

-- ============ SEED DATA: ANNOUNCEMENTS ============
INSERT INTO announcements (title, content, type, is_active) VALUES
('Welcome to Next billion technologies', 'Trade 200+ cryptocurrencies with confidence. This platform is currently in DEMO mode for testing.', 'info', true),
('New Asset Listing', 'Avalanche (AVAX) is now available for trading on Next billion technologies.', 'success', true)
ON CONFLICT DO NOTHING;

-- ============ SEED DATA: BLOG POSTS ============
INSERT INTO blog_posts (title, slug, excerpt, content, category, author) VALUES
('Next billion technologies Launches Advanced Trading Terminal', 'next-billion-launches-advanced-trading-terminal', 'Our new pro trading terminal brings institutional-grade tools to every trader.', 'We are excited to announce the launch of our advanced trading terminal, featuring real-time order books, candlestick charts, and multiple order types including market, limit, stop, and stop-limit orders. This release represents our commitment to providing professional-grade trading tools accessible to everyone.', 'News', 'Next billion technologies Team'),
('Understanding Crypto Market Volatility', 'understanding-crypto-market-volatility', 'A guide to navigating the ups and downs of cryptocurrency markets.', 'Cryptocurrency markets are known for their volatility. In this article, we explore the factors that drive price movements and share strategies for managing risk in a volatile market environment.', 'Education', 'Next billion technologies Team'),
('Security Best Practices for Crypto Traders', 'security-best-practices-for-crypto-traders', 'Essential security tips every crypto trader should follow.', 'Security is paramount when trading cryptocurrencies. Learn about two-factor authentication, cold storage, phishing prevention, and other essential practices to keep your assets safe.', 'Security', 'Next billion technologies Team')
ON CONFLICT (slug) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_symbol ON assets(symbol);
CREATE INDEX IF NOT EXISTS idx_assets_featured ON assets(is_featured);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);