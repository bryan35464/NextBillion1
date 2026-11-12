export interface SiteSettings {
  id: string;
  site_name: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  accent_color: string;
  hero_headline: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_secondary_cta: string;
  hero_image_url: string;
  total_users: number;
  trading_volume: number;
  supported_countries: number;
  supported_assets: number;
  platform_fee: number;
  trading_fee_taker: number;
  trading_fee_maker: number;
  min_deposit: number;
  max_deposit: number;
  min_withdrawal: number;
  max_withdrawal: number;
  demo_mode: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  footer_text: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  twitter_url: string;
  telegram_url: string;
  linkedin_url: string;
  facebook_url: string;
  terms_content: string;
  privacy_content: string;
  about_content: string;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  logo_url: string;
  price: number;
  change_24h: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
  market_cap: number;
  status: string;
  trading_enabled: boolean;
  is_featured: boolean;
  display_order: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_active: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: string;
  author: string;
  status: string;
  published_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  country: string;
  role: 'user' | 'admin' | 'super_admin' | 'support';
  verification_status: string;
  trading_enabled: boolean;
  two_factor_enabled: boolean;
  account_limit_deposit: number;
  account_limit_withdrawal: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  asset_symbol: string;
  amount: number;
  status: string;
  tx_hash: string;
  address: string;
  is_demo: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  pair: string;
  side: 'buy' | 'sell';
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit';
  price: number;
  quantity: number;
  filled_qty: number;
  status: 'open' | 'filled' | 'cancelled' | 'partial';
  is_demo: boolean;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  asset_symbol: string;
  balance: number;
  available: number;
  in_order: number;
  is_demo: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_email: string;
  action: string;
  entity: string;
  entity_id: string;
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}
