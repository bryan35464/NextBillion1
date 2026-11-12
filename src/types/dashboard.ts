export interface DashboardConfig {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_avatar: string;
  total_pnl: number;
  realized_pnl: number;
  unrealized_pnl: number;
  total_pnl_percent: number;
  today_pnl: number;
  today_pnl_percent: number;
  total_portfolio_value: number;
  invested_capital: number;
  current_value: number;
  return_percent: number;
  total_wallet_balance: number;
  available_balance: number;
  locked_balance: number;
  inr_balance: number;
  gst_fee: number;
  gst_fee_remaining: number;
  platform_fee_percent: number;
  trading_fee_percent: number;
  btc_price: number;
  eth_price: number;
  sol_price: number;
  btc_change: number;
  eth_change: number;
  sol_change: number;
  account_status: string;
  kyc_status: string;
}

export interface Position {
  id: string;
  instrument: string;
  product: string;
  quantity: number;
  avg_price: number;
  ltp: number;
  pnl: number;
  pnl_percent: number;
  side: 'buy' | 'sell';
  status: string;
  display_order: number;
}

export interface Holding {
  id: string;
  asset_name: string;
  asset_symbol: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  value: number;
  pnl: number;
  pnl_percent: number;
  allocation_percent: number;
  display_order: number;
}

export interface DashboardOrder {
  id: string;
  instrument: string;
  product: string;
  order_type: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: string;
  display_order: number;
  created_at: string;
}

export interface DashboardTransaction {
  id: string;
  type: string;
  instrument: string;
  quantity: number;
  price: number;
  amount: number;
  pnl: number;
  pnl_percent: number;
  status: string;
  date: string;
  time: string;
  display_order: number;
}
