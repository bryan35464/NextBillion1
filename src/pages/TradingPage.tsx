import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import TradingChart from '@/components/TradingChart';
import OrderBook from '@/components/OrderBook';
import RecentTrades from '@/components/RecentTrades';
import { AssetIcon, PriceChange } from '@/components/MarketCard';
import { formatPrice, formatPercent, generateDemoAddress, generateDemoTxHash } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';
import {
  Search,
  Star,
  ChevronDown,
  X,
  ArrowUp,
  ArrowDown,
  Wallet,
  History,
  CandlestickChart,
  ListOrdered,
  BookOpen,
  ScrollText,
} from 'lucide-react';

type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
type TabKey = 'open' | 'history' | 'positions' | 'transactions';

export default function TradingPage() {
  const { pair = 'BTC_USDT' } = useParams();
  const { assets } = useSettings();
  const { user } = useAuth();
  const [baseSymbol, quoteSymbol] = pair.split('_');
  const asset = assets.find((a) => a.symbol === baseSymbol);
  const quoteAsset = assets.find((a) => a.symbol === quoteSymbol);

  const [currentPrice, setCurrentPrice] = useState(asset?.price || 0);
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [total, setTotal] = useState('');
  const [percent, setPercent] = useState(0);
  const [showPairSelector, setShowPairSelector] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('open');
  const [orders, setOrders] = useState<Order[]>([]);
  const [bottomSection, setBottomSection] = useState<'chart' | 'book' | 'trades'>('chart');
  const [mobileRightTab, setMobileRightTab] = useState<'orderbook' | 'trades' | 'order'>('order');

  useEffect(() => {
    if (asset) {
      setCurrentPrice(asset.price);
      setPrice(asset.price.toString());
    }
  }, [asset?.id, asset?.price]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const volatility = (asset?.price || 100) * 0.001;
        const change = (Math.random() - 0.5) * volatility * 2;
        return Math.max(0.01, prev + change);
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [asset?.symbol]);

  useEffect(() => {
    if (user) {
      supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
        .then(({ data }) => {
          if (data) setOrders(data as Order[]);
        });
    }
  }, [user]);

  const filteredAssets = useMemo(() => {
    if (!search) return assets;
    const q = search.toLowerCase();
    return assets.filter(
      (a) => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q)
    );
  }, [assets, search]);

  const handlePercent = (p: number) => {
    setPercent(p);
    const base = parseFloat(price || currentPrice.toString());
    const maxQty = 10;
    const qty = (maxQty * p) / 100;
    setQuantity(qty.toFixed(4));
    setTotal((qty * base).toFixed(2));
  };

  const handleSubmitOrder = async () => {
    if (!user) return;
    const qty = parseFloat(quantity);
    const orderPrice = orderType === 'market' ? currentPrice : parseFloat(price);
    if (!qty || qty <= 0) return;

    const newOrder: Partial<Order> = {
      user_id: user.id,
      pair: pair,
      side,
      order_type: orderType,
      price: orderPrice,
      quantity: qty,
      filled_qty: orderType === 'market' ? qty : 0,
      status: orderType === 'market' ? 'filled' : 'open',
      is_demo: true,
    };

    const { data } = await supabase.from('orders').insert(newOrder).select().maybeSingle();
    if (data) {
      setOrders((prev) => [data as Order, ...prev]);
      setQuantity('');
      setTotal('');
      setPercent(0);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' as const } : o))
    );
  };

  if (!asset) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-dark-400">Trading pair not found.</p>
        <Link to="/markets" className="text-brand-400 hover:text-brand-300 mt-2 inline-block">
          Back to Markets
        </Link>
      </div>
    );
  }

  const orderTypes: { key: OrderType; label: string }[] = [
    { key: 'limit', label: 'Limit' },
    { key: 'market', label: 'Market' },
    { key: 'stop', label: 'Stop' },
    { key: 'stop_limit', label: 'Stop-Limit' },
  ];

  const tabs: { key: TabKey; label: string; icon: typeof History }[] = [
    { key: 'open', label: 'Open Orders', icon: ListOrdered },
    { key: 'history', label: 'Order History', icon: History },
    { key: 'positions', label: 'Positions', icon: CandlestickChart },
    { key: 'transactions', label: 'Transactions', icon: ScrollText },
  ];

  return (
    <div className="bg-dark-950 min-h-screen flex flex-col">
      {/* Pair Header */}
      <div className="border-b border-dark-700 px-3 lg:px-4 py-2.5 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPairSelector(!showPairSelector)}
            className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 transition-all"
          >
            <AssetIcon symbol={asset.symbol} size="sm" />
            <div className="text-left">
              <p className="text-white font-medium text-sm">{asset.symbol}/{quoteSymbol}</p>
              <p className="text-dark-400 text-xs">{asset.name}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-dark-400" />
          </button>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div>
            <p className="text-dark-400 text-xs">Last Price</p>
            <p className="text-white font-bold">{formatPrice(currentPrice)}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-dark-400 text-xs">24h Change</p>
            <PriceChange change={asset.change_24h} showIcon={false} />
          </div>
          <div className="hidden md:block">
            <p className="text-dark-400 text-xs">24h High</p>
            <p className="text-success-400">{formatPrice(asset.high_24h)}</p>
          </div>
          <div className="hidden md:block">
            <p className="text-dark-400 text-xs">24h Low</p>
            <p className="text-danger-400">{formatPrice(asset.low_24h)}</p>
          </div>
          <div className="hidden lg:block">
            <p className="text-dark-400 text-xs">24h Volume</p>
            <p className="text-dark-200">{(asset.volume_24h / 1e6).toFixed(2)}M</p>
          </div>
        </div>

        {showPairSelector && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPairSelector(false)} />
            <div className="absolute top-full left-3 mt-1 w-80 card rounded-xl shadow-2xl z-50 animate-fade-in p-3">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10 text-sm"
                  autoFocus
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-0.5">
                {filteredAssets.map((a) => (
                  <Link
                    key={a.id}
                    to={`/trade/${a.symbol}_USDT`}
                    onClick={() => setShowPairSelector(false)}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-dark-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AssetIcon symbol={a.symbol} size="sm" />
                      <div>
                        <p className="text-white text-xs font-medium">{a.symbol}/USDT</p>
                        <p className="text-dark-400 text-xs">{a.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-xs">{formatPrice(a.price)}</p>
                      <PriceChange change={a.change_24h} showIcon={false} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid flex-1 grid-cols-[260px_1fr_300px] gap-1 p-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="space-y-1 overflow-y-auto">
          <div className="card p-3">
            <h3 className="text-white text-sm font-medium mb-2 px-1">Watchlist</h3>
            <div className="space-y-0.5">
              {assets.slice(0, 8).map((a) => (
                <Link
                  key={a.id}
                  to={`/trade/${a.symbol}_USDT`}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors ${
                    a.symbol === baseSymbol ? 'bg-dark-700' : 'hover:bg-dark-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-dark-200 text-xs">{a.symbol}/USDT</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-xs">{formatPrice(a.price)}</p>
                    <PriceChange change={a.change_24h} showIcon={false} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-3">
            <h3 className="text-white text-sm font-medium mb-2 px-1">All Markets</h3>
            <div className="space-y-0.5 max-h-[300px] overflow-y-auto no-scrollbar">
              {assets.map((a) => (
                <Link
                  key={a.id}
                  to={`/trade/${a.symbol}_USDT`}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors ${
                    a.symbol === baseSymbol ? 'bg-dark-700' : 'hover:bg-dark-800'
                  }`}
                >
                  <span className="text-dark-200 text-xs">{a.symbol}/USDT</span>
                  <div className="text-right">
                    <span className="text-white text-xs">{formatPrice(a.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Chart */}
        <div className="flex flex-col gap-1 overflow-hidden">
          <TradingChart symbol={`${asset.symbol}/${quoteSymbol}`} basePrice={currentPrice} height={420} />

          {/* Bottom Orders Panel */}
          <div className="card flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center border-b border-dark-700">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                      activeTab === tab.key
                        ? 'text-brand-400 border-brand-500'
                        : 'text-dark-400 border-transparent hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="overflow-auto flex-1 max-h-[200px]">
              {activeTab === 'open' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-dark-400 text-xs border-b border-dark-700">
                      <th className="text-left px-4 py-2">Time</th>
                      <th className="text-left px-4 py-2">Pair</th>
                      <th className="text-left px-4 py-2">Type</th>
                      <th className="text-left px-4 py-2">Side</th>
                      <th className="text-right px-4 py-2">Price</th>
                      <th className="text-right px-4 py-2">Quantity</th>
                      <th className="text-right px-4 py-2">Filled</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-right px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter((o) => o.status === 'open' || o.status === 'partial').map((o) => (
                      <tr key={o.id} className="border-b border-dark-700/30 hover:bg-dark-800/50">
                        <td className="px-4 py-2 text-dark-400 text-xs">{new Date(o.created_at).toLocaleTimeString()}</td>
                        <td className="px-4 py-2 text-white">{o.pair}</td>
                        <td className="px-4 py-2 text-dark-200 capitalize">{o.order_type.replace('_', ' ')}</td>
                        <td className={`px-4 py-2 capitalize ${o.side === 'buy' ? 'text-success-400' : 'text-danger-400'}`}>{o.side}</td>
                        <td className="px-4 py-2 text-right text-white">{formatPrice(o.price)}</td>
                        <td className="px-4 py-2 text-right text-dark-200">{o.quantity}</td>
                        <td className="px-4 py-2 text-right text-dark-200">{o.filled_qty}</td>
                        <td className="px-4 py-2">
                          <span className={`badge ${o.status === 'filled' ? 'badge-success' : 'bg-dark-600 text-dark-200'}`}>{o.status}</span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          {o.status === 'open' && (
                            <button
                              onClick={() => handleCancelOrder(o.id)}
                              className="text-danger-400 hover:text-danger-300 text-xs"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {orders.filter((o) => o.status === 'open' || o.status === 'partial').length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-dark-400">No open orders</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'history' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-dark-400 text-xs border-b border-dark-700">
                      <th className="text-left px-4 py-2">Time</th>
                      <th className="text-left px-4 py-2">Pair</th>
                      <th className="text-left px-4 py-2">Type</th>
                      <th className="text-left px-4 py-2">Side</th>
                      <th className="text-right px-4 py-2">Price</th>
                      <th className="text-right px-4 py-2">Quantity</th>
                      <th className="text-left px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-dark-700/30 hover:bg-dark-800/50">
                        <td className="px-4 py-2 text-dark-400 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                        <td className="px-4 py-2 text-white">{o.pair}</td>
                        <td className="px-4 py-2 text-dark-200 capitalize">{o.order_type.replace('_', ' ')}</td>
                        <td className={`px-4 py-2 capitalize ${o.side === 'buy' ? 'text-success-400' : 'text-danger-400'}`}>{o.side}</td>
                        <td className="px-4 py-2 text-right text-white">{formatPrice(o.price)}</td>
                        <td className="px-4 py-2 text-right text-dark-200">{o.quantity}</td>
                        <td className="px-4 py-2">
                          <span className={`badge ${o.status === 'filled' ? 'badge-success' : o.status === 'cancelled' ? 'badge-danger' : 'bg-dark-600 text-dark-200'}`}>{o.status}</span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-dark-400">No order history</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'positions' && (
                <div className="py-12 text-center text-dark-400 text-sm">
                  No active positions. {user ? 'Place an order to open a position.' : 'Sign in to start trading.'}
                </div>
              )}

              {activeTab === 'transactions' && (
                <div className="py-12 text-center text-dark-400 text-sm">
                  No recent transactions.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Order Book + Order Panel */}
        <div className="space-y-1 overflow-y-auto">
          <OrderBook symbol={`${asset.symbol}/${quoteSymbol}`} currentPrice={currentPrice} />
          <RecentTrades symbol={`${asset.symbol}/${quoteSymbol}`} currentPrice={currentPrice} />
        </div>
      </div>

      {/* Order Panel - Desktop (floating right) */}
      <div className="hidden lg:block fixed bottom-1 right-1 w-[300px] z-30">
        <div className="card p-3">
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setSide('buy')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                side === 'buy' ? 'bg-success-500 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setSide('sell')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                side === 'sell' ? 'bg-danger-500 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              Sell
            </button>
          </div>

          <div className="flex gap-1 mb-3">
            {orderTypes.map((t) => (
              <button
                key={t.key}
                onClick={() => setOrderType(t.key)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  orderType === t.key ? 'bg-brand-500/15 text-brand-400' : 'text-dark-400 hover:bg-dark-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {orderType !== 'market' && (
              <div>
                <label className="text-xs text-dark-400">Price (USDT)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="input-field text-sm py-2"
                />
              </div>
            )}

            {(orderType === 'stop' || orderType === 'stop_limit') && (
              <div>
                <label className="text-xs text-dark-400">Stop Price (USDT)</label>
                <input
                  type="number"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  placeholder="0.00"
                  className="input-field text-sm py-2"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-dark-400">Quantity ({asset.symbol})</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  const p = parseFloat(price || currentPrice.toString());
                  const q = parseFloat(e.target.value) || 0;
                  setTotal((q * p).toFixed(2));
                }}
                placeholder="0.00"
                className="input-field text-sm py-2"
              />
            </div>

            <div className="flex gap-1">
              {[25, 50, 75, 100].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePercent(p)}
                  className={`flex-1 py-1 rounded text-xs transition-all ${
                    percent === p ? 'bg-brand-500/20 text-brand-400' : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-dark-400">Total (USDT)</label>
              <input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="0.00"
                className="input-field text-sm py-2"
              />
            </div>

            <button
              onClick={handleSubmitOrder}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                side === 'buy'
                  ? 'bg-success-500 hover:bg-success-600 text-white'
                  : 'bg-danger-500 hover:bg-danger-600 text-white'
              } active:scale-95`}
            >
              {side === 'buy' ? 'Buy' : 'Sell'} {asset.symbol}
            </button>

            {!user && (
              <p className="text-xs text-amber-400 text-center">
                <Link to="/login" className="underline">Sign in</Link> to place orders
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
        {/* Mobile Chart */}
        <div className="p-1">
          <TradingChart symbol={`${asset.symbol}/${quoteSymbol}`} basePrice={currentPrice} height={260} />
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex border-b border-dark-700 px-1">
          {([
            { key: 'order', label: 'Order', icon: Wallet },
            { key: 'orderbook', label: 'Book', icon: BookOpen },
            { key: 'trades', label: 'Trades', icon: ArrowUp },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setMobileRightTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border-b-2 transition-all ${
                  mobileRightTab === tab.key ? 'text-brand-400 border-brand-500' : 'text-dark-400 border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-1">
          {mobileRightTab === 'order' && (
            <div className="card p-3">
              <div className="flex gap-1 mb-3">
                <button
                  onClick={() => setSide('buy')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    side === 'buy' ? 'bg-success-500 text-white' : 'bg-dark-700 text-dark-300'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setSide('sell')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    side === 'sell' ? 'bg-danger-500 text-white' : 'bg-dark-700 text-dark-300'
                  }`}
                >
                  Sell
                </button>
              </div>

              <div className="flex gap-1 mb-3 overflow-x-auto no-scrollbar">
                {orderTypes.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setOrderType(t.key)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      orderType === t.key ? 'bg-brand-500/15 text-brand-400' : 'text-dark-400 bg-dark-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {orderType !== 'market' && (
                  <div>
                    <label className="text-xs text-dark-400">Price (USDT)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="input-field text-sm py-2"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-dark-400">Quantity ({asset.symbol})</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      const p = parseFloat(price || currentPrice.toString());
                      setTotal(((parseFloat(e.target.value) || 0) * p).toFixed(2));
                    }}
                    placeholder="0.00"
                    className="input-field text-sm py-2"
                  />
                </div>
                <div className="flex gap-1">
                  {[25, 50, 75, 100].map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePercent(p)}
                      className={`flex-1 py-1 rounded text-xs ${percent === p ? 'bg-brand-500/20 text-brand-400' : 'bg-dark-700 text-dark-400'}`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-dark-400">Total (USDT)</label>
                  <input
                    type="number"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    placeholder="0.00"
                    className="input-field text-sm py-2"
                  />
                </div>
                <button
                  onClick={handleSubmitOrder}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold ${
                    side === 'buy' ? 'bg-success-500 text-white' : 'bg-danger-500 text-white'
                  }`}
                >
                  {side === 'buy' ? 'Buy' : 'Sell'} {asset.symbol}
                </button>
                {!user && (
                  <p className="text-xs text-amber-400 text-center">
                    <Link to="/login" className="underline">Sign in</Link> to place orders
                  </p>
                )}
              </div>
            </div>
          )}

          {mobileRightTab === 'orderbook' && (
            <OrderBook symbol={`${asset.symbol}/${quoteSymbol}`} currentPrice={currentPrice} />
          )}

          {mobileRightTab === 'trades' && (
            <RecentTrades symbol={`${asset.symbol}/${quoteSymbol}`} currentPrice={currentPrice} />
          )}
        </div>
      </div>
    </div>
  );
}
