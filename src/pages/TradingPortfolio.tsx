import { useDashboardData } from '@/context/DashboardDataContext';
import { formatINR, formatPercent } from '@/lib/formatINR';
import { TrendingUp, TrendingDown, IndianRupee, BarChart3 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function TradingPortfolioPage() {
  const { config, holdings } = useDashboardData();

  const cards = [
    { label: 'Total Portfolio Value', value: formatINR(config?.total_portfolio_value || 0), icon: BarChart3, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Invested Capital', value: formatINR(config?.invested_capital || 0), icon: IndianRupee, color: 'text-dark-300', bg: 'bg-dark-700' },
    { label: 'Current Value', value: formatINR(config?.current_value || 0), icon: TrendingUp, color: 'text-success-400', bg: 'bg-success-500/10' },
    { label: 'Total P&L', value: formatINR(config?.total_pnl || 0), percent: config?.total_pnl_percent, icon: config?.total_pnl! >= 0 ? TrendingUp : TrendingDown, color: (config?.total_pnl || 0) >= 0 ? 'text-success-400' : 'text-danger-400', bg: (config?.total_pnl || 0) >= 0 ? 'bg-success-500/10' : 'bg-danger-500/10' },
    { label: "Today's P&L", value: formatINR(config?.today_pnl || 0), percent: config?.today_pnl_percent, icon: IndianRupee, color: (config?.today_pnl || 0) >= 0 ? 'text-success-400' : 'text-danger-400', bg: (config?.today_pnl || 0) >= 0 ? 'bg-success-500/10' : 'bg-danger-500/10' },
    { label: 'Realized P&L', value: formatINR(config?.realized_pnl || 0), icon: TrendingUp, color: (config?.realized_pnl || 0) >= 0 ? 'text-success-400' : 'text-danger-400', bg: (config?.realized_pnl || 0) >= 0 ? 'bg-success-500/10' : 'bg-danger-500/10' },
    { label: 'Unrealized P&L', value: formatINR(config?.unrealized_pnl || 0), icon: TrendingDown, color: (config?.unrealized_pnl || 0) >= 0 ? 'text-success-400' : 'text-danger-400', bg: (config?.unrealized_pnl || 0) >= 0 ? 'bg-success-500/10' : 'bg-danger-500/10' },
    { label: 'Fee Pending', value: formatINR(config?.gst_fee_remaining || 0), icon: IndianRupee, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Return %', value: `${config?.return_percent?.toFixed(2) || '0.00'}%`, icon: TrendingUp, color: (config?.return_percent || 0) >= 0 ? 'text-success-400' : 'text-danger-400', bg: (config?.return_percent || 0) >= 0 ? 'bg-success-500/10' : 'bg-danger-500/10' },
  ];

  const perfData = Array.from({ length: 30 }, (_, i) => {
    const base = config?.invested_capital || 900000;
    const end = config?.current_value || 1002750;
    const trend = base + ((end - base) / 30) * i;
    const noise = (Math.random() - 0.45) * base * 0.015;
    return {
      date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      value: Math.round(trend + noise),
    };
  });

  function getAssetColor(symbol: string): string {
    const colors: Record<string, string> = {
      BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', USDT: '#26a17b',
      XRP: '#23292f', BNB: '#f3ba2f', INR: '#3b82f6',
    };
    return colors[symbol] || '#3b82f6';
  }

  const pieData = holdings
    .filter((h) => h.value > 0 && h.asset_symbol !== 'INR')
    .map((h) => ({ name: h.asset_symbol, value: h.value, color: getAssetColor(h.asset_symbol) }));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Portfolio</h1>
        <p className="text-dark-400 text-sm mt-0.5">Track your investments and performance</p>
      </div>

      {/* P&L cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-4 lg:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-[18px] h-[18px] ${card.color}`} />
                </div>
                {card.percent !== undefined && (
                  <span className={`text-xs font-semibold ${card.percent >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                    {card.percent >= 0 ? '+' : ''}{formatPercent(card.percent)}
                  </span>
                )}
              </div>
              <p className="text-dark-400 text-xs lg:text-sm">{card.label}</p>
              <p className="text-lg lg:text-xl font-bold text-white mt-1">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        {/* Performance chart */}
        <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Performance</h3>
            <span className="text-xs text-dark-400">Last 30 days</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={perfData}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#6b7494" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7494" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#161b2c', border: '1px solid #333a56', borderRadius: '12px', fontSize: '12px' }} formatter={(v: number) => [formatINR(v), 'Value']} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#portfolioGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Allocation */}
        <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Asset Allocation</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#161b2c', border: '1px solid #333a56', borderRadius: '12px', fontSize: '12px' }} formatter={(v: number, _n, props) => [formatINR(v), props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {pieData.slice(0, 6).map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-dark-200">{d.name}</span>
                    </div>
                    <span className="text-white font-medium text-xs">{formatINR(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-dark-400 text-sm">No holdings</div>
          )}
        </div>
      </div>

      {/* Holdings table */}
      <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl">
        <div className="px-5 py-4 border-b border-dark-700/50">
          <h2 className="text-white font-semibold">Holdings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-dark-400 text-xs uppercase border-b border-dark-700/40">
                <th className="text-left px-5 py-2.5 font-medium">Asset</th>
                <th className="text-right px-3 py-2.5 font-medium">Qty</th>
                <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell">Avg Price</th>
                <th className="text-right px-3 py-2.5 font-medium">Current</th>
                <th className="text-right px-3 py-2.5 font-medium">Value</th>
                <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell">P&L</th>
                <th className="text-right px-5 py-2.5 font-medium hidden lg:table-cell">P&L %</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.id} className="border-b border-dark-700/20 hover:bg-dark-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-white font-medium text-sm">{h.asset_name}</p>
                    <p className="text-dark-400 text-xs">{h.asset_symbol}</p>
                  </td>
                  <td className="px-3 py-3 text-right text-white text-sm">{h.quantity.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 text-right text-dark-200 text-sm hidden sm:table-cell">₹{h.avg_price.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 text-right text-white text-sm">₹{h.current_price.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 text-right text-white text-sm font-medium">{formatINR(h.value)}</td>
                  <td className={`px-3 py-3 text-right text-sm hidden sm:table-cell ${h.pnl >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                    {h.pnl !== 0 ? `${h.pnl > 0 ? '+' : ''}${formatINR(h.pnl)}` : '--'}
                  </td>
                  <td className={`px-5 py-3 text-right text-sm hidden lg:table-cell ${h.pnl_percent >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                    {h.pnl_percent !== 0 ? `${h.pnl_percent > 0 ? '+' : ''}${formatPercent(h.pnl_percent)}` : '--'}
                  </td>
                </tr>
              ))}
              {holdings.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-dark-400 text-sm">No holdings</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
