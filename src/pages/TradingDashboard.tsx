import { useDashboardData } from '@/context/DashboardDataContext';
import { formatINR, formatPercent } from '@/lib/formatINR';
import {
  TrendingUp,
  TrendingDown,
  ArrowDownToLine,
  BarChart3,
  IndianRupee,
  Download,
  Activity,
} from 'lucide-react';

export default function DashboardPage() {
  const { config, positions, transactions } = useDashboardData();

  const pnlCards = [
    {
      label: 'Total P&L',
      value: formatINR(config?.total_pnl || 0),
      percent: config?.total_pnl_percent || 0,
      icon: Activity,
      positive: (config?.total_pnl || 0) >= 0,
    },
    {
      label: 'Realized P&L',
      value: formatINR(config?.realized_pnl || 0),
      percent: null,
      icon: TrendingUp,
      positive: (config?.realized_pnl || 0) >= 0,
    },
    {
      label: 'Unrealized P&L',
      value: formatINR(config?.unrealized_pnl || 0),
      percent: null,
      icon: TrendingDown,
      positive: (config?.unrealized_pnl || 0) >= 0,
    },
    {
      label: "Today's P&L",
      value: formatINR(config?.today_pnl || 0),
      percent: config?.today_pnl_percent || 0,
      icon: IndianRupee,
      positive: (config?.today_pnl || 0) >= 0,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Positions <span className="text-dark-400">({positions.length})</span></h1>
          <p className="text-dark-400 text-sm mt-1">Review open exposure and today’s activity</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-200 hover:text-white hover:border-brand-500/50 text-sm transition-all"><Download className="w-4 h-4" /> Download</button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-200 hover:text-white hover:border-brand-500/50 text-sm transition-all"><BarChart3 className="w-4 h-4" /> Analytics</button>
        </div>
      </div>

      {/* P&L Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {pnlCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-4 lg:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.positive ? 'bg-success-500/10' : 'bg-danger-500/10'}`}>
                  <Icon className={`w-[18px] h-[18px] ${card.positive ? 'text-success-400' : 'text-danger-400'}`} />
                </div>
                {card.percent !== null && (
                  <span className={`text-xs font-semibold ${card.percent >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                    {card.percent >= 0 ? '+' : ''}{formatPercent(card.percent)}
                  </span>
                )}
              </div>
              <p className="text-dark-400 text-xs lg:text-sm">{card.label}</p>
              <p className={`text-lg lg:text-2xl font-bold mt-1 ${card.positive ? 'text-white' : 'text-white'}`}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* GST Fee + Warning row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 mb-6">
        <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <IndianRupee className="w-[18px] h-[18px] text-amber-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">GST Fee Remaining</p>
              <p className="text-xl font-bold text-white mt-0.5">{formatINR(config?.gst_fee_remaining || 0)}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-dark-700/40">
            <div className="flex justify-between text-xs">
              <span className="text-dark-400">Total GST Fee</span>
              <span className="text-white">{formatINR(config?.gst_fee || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-5">
          <p className="text-dark-400 text-sm mb-2">Portfolio Value</p>
          <p className="text-2xl font-bold text-white">{formatINR(config?.total_portfolio_value || 0)}</p>
          <div className="mt-3 pt-3 border-t border-dark-700/40 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-dark-400">Invested</span>
              <p className="text-white">{formatINR(config?.invested_capital || 0)}</p>
            </div>
            <div>
              <span className="text-dark-400">Current</span>
              <p className="text-white">{formatINR(config?.current_value || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-5">
          <p className="text-dark-400 text-sm mb-1">Account Status</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            <span className="text-white font-medium">{config?.account_status || 'Active'}</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-dark-400">KYC Status</span>
              <span className="text-success-400">{config?.kyc_status || 'Verified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-400">Available Balance</span>
              <span className="text-white">{formatINR(config?.available_balance || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Positions Section */}
      <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700/50">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-400" /> Positions
          </h2>
          <span className="text-xs text-dark-400">{positions.length} open</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-dark-400 text-xs uppercase border-b border-dark-700/40">
                <th className="text-left px-5 py-2.5 font-medium">Instrument</th>
                <th className="text-left px-3 py-2.5 font-medium hidden sm:table-cell">Product</th>
                <th className="text-right px-3 py-2.5 font-medium">Qty</th>
                <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell">Avg Price</th>
                <th className="text-right px-3 py-2.5 font-medium">LTP</th>
                <th className="text-right px-3 py-2.5 font-medium">P&L</th>
                <th className="text-right px-5 py-2.5 font-medium hidden sm:table-cell">P&L %</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <tr key={pos.id} className="border-b border-dark-700/20 hover:bg-dark-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${pos.side === 'buy' ? 'bg-success-500' : 'bg-danger-500'}`} />
                      <span className="text-white font-medium text-sm">{pos.instrument}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-dark-300 text-sm hidden sm:table-cell">{pos.product}</td>
                  <td className="px-3 py-3 text-right text-white text-sm">{pos.quantity}</td>
                  <td className="px-3 py-3 text-right text-dark-200 text-sm hidden sm:table-cell">₹{pos.avg_price.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 text-right text-white text-sm">₹{pos.ltp.toLocaleString('en-IN')}</td>
                  <td className={`px-3 py-3 text-right text-sm font-medium ${pos.pnl >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                    {pos.pnl >= 0 ? '+' : ''}{formatINR(pos.pnl)}
                  </td>
                  <td className={`px-5 py-3 text-right text-sm hidden sm:table-cell ${pos.pnl_percent >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                    {pos.pnl_percent >= 0 ? '+' : ''}{formatPercent(pos.pnl_percent)}
                  </td>
                </tr>
              ))}
              {positions.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-dark-400 text-sm">No open positions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's History */}
      <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700/50 flex-wrap gap-2">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-400" /> Today's History
          </h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-xs font-medium transition-all">
              <BarChart3 className="w-3.5 h-3.5" /> Analytics
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-xs font-medium transition-all">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-dark-400 text-xs uppercase border-b border-dark-700/40">
                <th className="text-left px-5 py-2.5 font-medium">Type</th>
                <th className="text-left px-3 py-2.5 font-medium">Instrument</th>
                <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell">Qty</th>
                <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell">Price</th>
                <th className="text-right px-3 py-2.5 font-medium">Amount</th>
                <th className="text-right px-3 py-2.5 font-medium">P&L</th>
                <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell">P&L %</th>
                <th className="text-left px-5 py-2.5 font-medium hidden lg:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-dark-700/20 hover:bg-dark-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`badge text-xs ${tx.type === 'Buy' ? 'bg-success-500/15 text-success-400' : tx.type === 'Sell' ? 'bg-danger-500/15 text-danger-400' : 'bg-brand-500/15 text-brand-400'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-white text-sm">{tx.instrument || '--'}</td>
                  <td className="px-3 py-3 text-right text-dark-200 text-sm hidden sm:table-cell">{tx.quantity || '--'}</td>
                  <td className="px-3 py-3 text-right text-dark-200 text-sm hidden sm:table-cell">{tx.price > 0 ? `₹${tx.price.toLocaleString('en-IN')}` : '--'}</td>
                  <td className="px-3 py-3 text-right text-white text-sm">{formatINR(tx.amount)}</td>
                  <td className={`px-3 py-3 text-right text-sm ${tx.pnl > 0 ? 'text-success-400' : tx.pnl < 0 ? 'text-danger-400' : 'text-dark-400'}`}>
                    {tx.pnl !== 0 ? `${tx.pnl > 0 ? '+' : ''}${formatINR(tx.pnl)}` : '--'}
                  </td>
                  <td className={`px-3 py-3 text-right text-sm hidden sm:table-cell ${tx.pnl_percent > 0 ? 'text-success-400' : tx.pnl_percent < 0 ? 'text-danger-400' : 'text-dark-400'}`}>
                    {tx.pnl_percent !== 0 ? `${tx.pnl_percent > 0 ? '+' : ''}${formatPercent(tx.pnl_percent)}` : '--'}
                  </td>
                  <td className="px-5 py-3 text-dark-400 text-xs hidden lg:table-cell">{tx.date} {tx.time}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-dark-400 text-sm">No transactions today</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
