import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { AssetIcon } from '@/components/MarketCard';
import { formatPrice, formatCurrency, formatPercent } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { Transaction, Order, Wallet as WalletType } from '@/types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  ArrowRight,
  Activity,
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Send,
} from 'lucide-react';

export default function PortfolioPage() {
  const { user } = useAuth();
  const { assets } = useSettings();
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('wallets').select('*').eq('user_id', user.id).then(({ data }) => data || []),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
        .then(({ data }) => data || []),
      supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
        .then(({ data }) => data || []),
    ]).then(([w, t, o]) => {
      setWallets(w as WalletType[]);
      setTransactions(t as Transaction[]);
      setOrders(o as Order[]);
      setLoading(false);
    });
  }, [user]);

  const portfolioData = useMemo(() => {
    const holdings = wallets
      .filter((w) => w.balance > 0)
      .map((w) => {
        const asset = assets.find((a) => a.symbol === w.asset_symbol);
        const price = asset?.price || 0;
        const value = w.balance * price;
        return {
          symbol: w.asset_symbol,
          name: asset?.name || w.asset_symbol,
          balance: w.balance,
          price,
          value,
          change24h: asset?.change_24h || 0,
          color: asset ? `#${Math.floor(Math.random() * 16777215).toString(16)}` : '#3b82f6',
        };
      });

    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const totalChange = holdings.reduce((sum, h) => sum + (h.value * h.change24h) / 100, 0);
    const dailyPnl = totalChange;
    const dailyPnlPercent = totalValue > 0 ? (totalChange / totalValue) * 100 : 0;

    return { holdings, totalValue, dailyPnl, dailyPnlPercent };
  }, [wallets, assets]);

  const performanceData = useMemo(() => {
    const data = [];
    let value = portfolioData.totalValue || 10000;
    for (let i = 30; i >= 0; i--) {
      const change = (Math.random() - 0.45) * value * 0.03;
      value = Math.max(1000, value + change);
      data.push({
        date: new Date(Date.now() - i * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Number(value.toFixed(2)),
      });
    }
    return data;
  }, [portfolioData.totalValue]);

  const stats = [
    {
      label: 'Total Portfolio Value',
      value: formatCurrency(portfolioData.totalValue),
      icon: WalletIcon,
      color: 'text-brand-400',
    },
    {
      label: 'Daily P&L',
      value: `${formatCurrency(Math.abs(portfolioData.dailyPnl))}`,
      subValue: formatPercent(portfolioData.dailyPnlPercent),
      icon: portfolioData.dailyPnl >= 0 ? TrendingUp : TrendingDown,
      color: portfolioData.dailyPnl >= 0 ? 'text-success-400' : 'text-danger-400',
    },
    {
      label: 'Available Balance',
      value: formatCurrency(portfolioData.holdings.find((h) => h.symbol === 'USDT')?.value || 0),
      icon: Activity,
      color: 'text-accent-400',
    },
    {
      label: 'Invested Amount',
      value: formatCurrency(portfolioData.totalValue - (portfolioData.holdings.find((h) => h.symbol === 'USDT')?.value || 0)),
      icon: ArrowUpRight,
      color: 'text-success-400',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
        <p className="text-dark-400 mt-1">Track your investments and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-dark-700/50 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-dark-400 text-sm">{stat.label}</p>
              <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
              {stat.subValue && (
                <p className={`text-sm mt-1 ${stat.color}`}>{stat.subValue}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Portfolio Performance</h2>
              <p className="text-dark-400 text-sm">Last 30 days</p>
            </div>
            <div className="flex gap-2">
              {['7D', '30D', '90D', '1Y'].map((p, i) => (
                <button
                  key={p}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    i === 1 ? 'bg-brand-500/15 text-brand-400' : 'text-dark-400 hover:bg-dark-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#6b7494" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7494" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#161b2c', border: '1px solid #333a56', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: '#9aa3bd' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#portfolioGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Allocation */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Asset Allocation</h2>
          {portfolioData.holdings.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={portfolioData.holdings}
                    dataKey="value"
                    nameKey="symbol"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {portfolioData.holdings.map((h, i) => (
                      <Cell key={i} fill={h.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#161b2c', border: '1px solid #333a56', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: number, _name, props) => [`$${value.toLocaleString()}`, props.payload.symbol]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {portfolioData.holdings.slice(0, 5).map((h) => (
                  <div key={h.symbol} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                      <span className="text-dark-200">{h.symbol}</span>
                    </div>
                    <span className="text-white font-medium">
                      {portfolioData.totalValue > 0 ? ((h.value / portfolioData.totalValue) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-dark-400 text-sm text-center">
              <div>
                <p>No assets in portfolio</p>
                <Link to="/wallet" className="text-brand-400 text-xs mt-2 inline-block">Deposit to get started</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-dark-700">
          <h2 className="text-lg font-semibold text-white">Your Holdings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-dark-400 text-xs uppercase border-b border-dark-700">
                <th className="text-left px-6 py-3">Asset</th>
                <th className="text-right px-6 py-3">Balance</th>
                <th className="text-right px-6 py-3 hidden sm:table-cell">Price</th>
                <th className="text-right px-6 py-3">Value</th>
                <th className="text-right px-6 py-3 hidden md:table-cell">24h</th>
                <th className="text-right px-6 py-3">Trade</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.holdings.length > 0 ? (
                portfolioData.holdings.map((h) => (
                  <tr key={h.symbol} className="border-b border-dark-700/30 hover:bg-dark-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <AssetIcon symbol={h.symbol} size="sm" />
                        <div>
                          <p className="text-white font-medium text-sm">{h.symbol}</p>
                          <p className="text-dark-400 text-xs">{h.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right px-6 py-4 text-white">{h.balance.toFixed(4)}</td>
                    <td className="text-right px-6 py-4 text-dark-200 hidden sm:table-cell">{formatPrice(h.price)}</td>
                    <td className="text-right px-6 py-4 text-white font-medium">{formatCurrency(h.value)}</td>
                    <td className={`text-right px-6 py-4 hidden md:table-cell ${h.change24h >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                      {formatPercent(h.change24h)}
                    </td>
                    <td className="text-right px-6 py-4">
                      <Link
                        to={`/trade/${h.symbol}_USDT`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white text-sm font-medium transition-all"
                      >
                        Trade <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-dark-400">
                    <p>No holdings yet.</p>
                    <Link to="/wallet" className="text-brand-400 text-sm mt-2 inline-block">
                      Deposit funds to start trading
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            <Link to="/wallet" className="text-brand-400 text-sm">View All</Link>
          </div>
          <div className="divide-y divide-dark-700/30">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-3 hover:bg-dark-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-success-500/10' : tx.type === 'withdrawal' ? 'bg-danger-500/10' : 'bg-brand-500/10'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowDownRight className="w-4 h-4 text-success-400" /> :
                       tx.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4 text-danger-400" /> :
                       <Send className="w-4 h-4 text-brand-400" />}
                    </div>
                    <div>
                      <p className="text-white text-sm capitalize">{tx.type}</p>
                      <p className="text-dark-400 text-xs">{tx.asset_symbol} · {new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">{tx.amount} {tx.asset_symbol}</p>
                    <p className={`text-xs capitalize ${tx.status === 'completed' ? 'text-success-400' : 'text-dark-400'}`}>{tx.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-dark-400 text-sm">No transactions yet</div>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <Link to="/trade/BTC_USDT" className="text-brand-400 text-sm">Trade</Link>
          </div>
          <div className="divide-y divide-dark-700/30">
            {orders.length > 0 ? (
              orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between px-6 py-3 hover:bg-dark-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${o.side === 'buy' ? 'bg-success-500/10' : 'bg-danger-500/10'}`}>
                      {o.side === 'buy' ? <Plus className="w-4 h-4 text-success-400" /> : <ArrowUpRight className="w-4 h-4 text-danger-400" />}
                    </div>
                    <div>
                      <p className="text-white text-sm capitalize">{o.side} {o.pair}</p>
                      <p className="text-dark-400 text-xs capitalize">{o.order_type} · {o.quantity} @ {formatPrice(o.price)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${o.status === 'filled' ? 'badge-success' : o.status === 'cancelled' ? 'badge-danger' : 'bg-dark-600 text-dark-200'}`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-dark-400 text-sm">No orders yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
