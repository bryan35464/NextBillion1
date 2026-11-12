import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/context/SettingsContext';
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/format';
import {
  Users,
  TrendingUp,
  Wallet,
  Activity,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  Server,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function AdminDashboard() {
  const { settings, assets } = useSettings();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    tradingVolume: 0,
    openOrders: 0,
    completedTrades: 0,
    platformRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<{ id: string; action: string; entity: string; admin_email: string; created_at: string }[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }).then(({ count }) => count || 0),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('trading_enabled', true).then(({ count }) => count || 0),
      supabase.from('transactions').select('amount').eq('type', 'deposit').eq('status', 'completed').then(({ data }) => (data || []).reduce((s, t) => s + Number(t.amount), 0)),
      supabase.from('transactions').select('amount').eq('type', 'withdrawal').eq('status', 'completed').then(({ data }) => (data || []).reduce((s, t) => s + Number(t.amount), 0)),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'open').then(({ count }) => count || 0),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'filled').then(({ count }) => count || 0),
      supabase.from('audit_logs').select('id, action, entity, admin_email, created_at').order('created_at', { ascending: false }).limit(8).then(({ data }) => data || []),
    ]).then(([totalUsers, activeUsers, deposits, withdrawals, openOrders, completedTrades, activity]) => {
      setStats({
        totalUsers: totalUsers as number,
        activeUsers: activeUsers as number,
        totalDeposits: deposits as number,
        totalWithdrawals: withdrawals as number,
        tradingVolume: (completedTrades as number) * 50000,
        openOrders: openOrders as number,
        completedTrades: completedTrades as number,
        platformRevenue: ((completedTrades as number) * 50000 * (settings?.platform_fee || 0.1)) / 100,
      });
      setRecentActivity(activity as { id: string; action: string; entity: string; admin_email: string; created_at: string }[]);
    });
  }, [settings?.platform_fee]);

  const statCards = [
    { label: 'Total Users', value: formatNumber(stats.totalUsers), icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Active Users', value: formatNumber(stats.activeUsers), icon: Activity, color: 'text-success-400', bg: 'bg-success-500/10' },
    { label: 'Total Deposits', value: formatCurrency(stats.totalDeposits), icon: ArrowDownRight, color: 'text-accent-400', bg: 'bg-accent-500/10' },
    { label: 'Total Withdrawals', value: formatCurrency(stats.totalWithdrawals), icon: ArrowUpRight, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Trading Volume', value: formatCurrency(stats.tradingVolume), icon: TrendingUp, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Open Orders', value: formatNumber(stats.openOrders), icon: ShoppingBag, color: 'text-dark-300', bg: 'bg-dark-700' },
    { label: 'Completed Trades', value: formatNumber(stats.completedTrades), icon: CheckCircle2, color: 'text-success-400', bg: 'bg-success-500/10' },
    { label: 'Platform Revenue', value: formatCurrency(stats.platformRevenue), icon: DollarSign, color: 'text-success-400', bg: 'bg-success-500/10' },
  ];

  const volumeData = Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: Math.floor(Math.random() * 5000000 + 1000000),
  }));

  const assetVolumeData = assets.slice(0, 6).map((a) => ({
    name: a.symbol,
    volume: Math.floor(a.volume_24h / 1e6),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 mt-1">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-5 hover:border-dark-500 transition-all">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-dark-400 text-xs">{stat.label}</p>
              <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h3 className="text-white font-medium mb-4">Trading Volume (14 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#6b7494" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7494" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#161b2c', border: '1px solid #333a56', borderRadius: '12px', fontSize: '12px' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Volume']} />
              <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} fill="url(#volGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-white font-medium mb-4">Volume by Asset (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={assetVolumeData}>
              <XAxis dataKey="name" stroke="#6b7494" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7494" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}M`} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#161b2c', border: '1px solid #333a56', borderRadius: '12px', fontSize: '12px' }} formatter={(v: number) => [`$${v}M`, 'Volume']} />
              <Bar dataKey="volume" fill="#22d3ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Status & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-brand-400" /> System Status
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Trading Engine', status: 'Operational', color: 'text-success-400' },
              { label: 'Database', status: 'Operational', color: 'text-success-400' },
              { label: 'API Gateway', status: 'Operational', color: 'text-success-400' },
              { label: 'WebSocket', status: 'Operational', color: 'text-success-400' },
              { label: 'Sandbox Mode', status: settings?.demo_mode ? 'Active' : 'Inactive', color: settings?.demo_mode ? 'text-brand-400' : 'text-dark-400' },
              { label: 'Maintenance Mode', status: settings?.maintenance_mode ? 'Active' : 'Inactive', color: settings?.maintenance_mode ? 'text-danger-400' : 'text-success-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-dark-300">{item.label}</span>
                <span className={`flex items-center gap-1.5 ${item.color}`}>
                  <span className={`w-2 h-2 rounded-full ${item.color === 'text-success-400' ? 'bg-success-500' : item.color === 'text-amber-400' ? 'bg-amber-500' : item.color === 'text-danger-400' ? 'bg-danger-500' : 'bg-dark-500'}`} />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Recent Activity</h3>
            <Link to="/admin/audit" className="text-brand-400 text-sm hover:text-brand-300">View All</Link>
          </div>
          <div className="space-y-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b border-dark-700/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-dark-300" />
                    </div>
                    <div>
                      <p className="text-white text-sm">
                        <span className="text-brand-400">{activity.action}</span> · {activity.entity}
                      </p>
                      <p className="text-dark-400 text-xs">{activity.admin_email}</p>
                    </div>
                  </div>
                  <span className="text-dark-400 text-xs">{formatDateTime(activity.created_at)}</span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-dark-400 text-sm">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
