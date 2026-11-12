import { useDashboardData } from '@/context/DashboardDataContext';
import { formatINR, formatPercent } from '@/lib/formatINR';
import { FileBarChart, Download, TrendingUp, TrendingDown } from 'lucide-react';

export default function TradingReportsPage() {
  const { config, positions, transactions, holdings } = useDashboardData();

  const reportStats = [
    { label: 'Total P&L', value: formatINR(config?.total_pnl || 0), positive: (config?.total_pnl || 0) >= 0 },
    { label: 'Realized P&L', value: formatINR(config?.realized_pnl || 0), positive: (config?.realized_pnl || 0) >= 0 },
    { label: 'Unrealized P&L', value: formatINR(config?.unrealized_pnl || 0), positive: (config?.unrealized_pnl || 0) >= 0 },
    { label: 'Total Volume', value: formatINR(transactions.reduce((s, t) => s + t.amount, 0)), positive: true },
    { label: 'GST Fee Paid', value: formatINR(config?.gst_fee || 0), positive: false },
    { label: 'GST Fee Remaining', value: formatINR(config?.gst_fee_remaining || 0), positive: false },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Reports</h1>
          <p className="text-dark-400 text-sm mt-0.5">Trading summary and tax reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm font-medium transition-all">
          <Download className="w-4 h-4" /> Download Report
        </button>
      </div>

      {/* Report stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6">
        {reportStats.map((stat, i) => (
          <div key={i} className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-4 lg:p-5">
            <div className="flex items-center gap-2 mb-2">
              {stat.positive ? <TrendingUp className="w-4 h-4 text-success-400" /> : <TrendingDown className="w-4 h-4 text-danger-400" />}
              <p className="text-dark-400 text-xs lg:text-sm">{stat.label}</p>
            </div>
            <p className={`text-lg lg:text-xl font-bold ${stat.positive ? 'text-white' : 'text-white'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Summary table */}
      <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl mb-6">
        <div className="px-5 py-4 border-b border-dark-700/50">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-brand-400" /> Trading Summary
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-dark-400 text-xs uppercase border-b border-dark-700/40">
                <th className="text-left px-5 py-2.5 font-medium">Metric</th>
                <th className="text-right px-5 py-2.5 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark-700/20"><td className="px-5 py-3 text-dark-300 text-sm">Invested Capital</td><td className="px-5 py-3 text-right text-white text-sm">{formatINR(config?.invested_capital || 0)}</td></tr>
              <tr className="border-b border-dark-700/20"><td className="px-5 py-3 text-dark-300 text-sm">Current Value</td><td className="px-5 py-3 text-right text-white text-sm">{formatINR(config?.current_value || 0)}</td></tr>
              <tr className="border-b border-dark-700/20"><td className="px-5 py-3 text-dark-300 text-sm">Return %</td><td className={`px-5 py-3 text-right text-sm ${(config?.return_percent || 0) >= 0 ? 'text-success-400' : 'text-danger-400'}`}>{formatPercent(config?.return_percent || 0)}</td></tr>
              <tr className="border-b border-dark-700/20"><td className="px-5 py-3 text-dark-300 text-sm">Open Positions</td><td className="px-5 py-3 text-right text-white text-sm">{positions.length}</td></tr>
              <tr className="border-b border-dark-700/20"><td className="px-5 py-3 text-dark-300 text-sm">Total Holdings</td><td className="px-5 py-3 text-right text-white text-sm">{holdings.length}</td></tr>
              <tr className="border-b border-dark-700/20"><td className="px-5 py-3 text-dark-300 text-sm">Total Transactions</td><td className="px-5 py-3 text-right text-white text-sm">{transactions.length}</td></tr>
              <tr><td className="px-5 py-3 text-dark-300 text-sm">Platform Fee</td><td className="px-5 py-3 text-right text-white text-sm">{config?.platform_fee_percent}%</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction log */}
      <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl">
        <div className="px-5 py-4 border-b border-dark-700/50">
          <h2 className="text-white font-semibold">Transaction Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-dark-400 text-xs uppercase border-b border-dark-700/40">
                <th className="text-left px-5 py-2.5 font-medium">Type</th>
                <th className="text-left px-3 py-2.5 font-medium">Instrument</th>
                <th className="text-right px-3 py-2.5 font-medium">Amount</th>
                <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell">P&L</th>
                <th className="text-left px-5 py-2.5 font-medium">Status</th>
                <th className="text-left px-5 py-2.5 font-medium hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-dark-700/20 hover:bg-dark-700/30">
                  <td className="px-5 py-3"><span className={`badge text-xs ${tx.type === 'Buy' ? 'bg-success-500/15 text-success-400' : tx.type === 'Sell' ? 'bg-danger-500/15 text-danger-400' : 'bg-brand-500/15 text-brand-400'}`}>{tx.type}</span></td>
                  <td className="px-3 py-3 text-white text-sm">{tx.instrument || '--'}</td>
                  <td className="px-3 py-3 text-right text-white text-sm">{formatINR(tx.amount)}</td>
                  <td className={`px-3 py-3 text-right text-sm hidden sm:table-cell ${tx.pnl > 0 ? 'text-success-400' : tx.pnl < 0 ? 'text-danger-400' : 'text-dark-400'}`}>{tx.pnl !== 0 ? `${tx.pnl > 0 ? '+' : ''}${formatINR(tx.pnl)}` : '--'}</td>
                  <td className="px-5 py-3"><span className="text-success-400 text-xs capitalize">{tx.status}</span></td>
                  <td className="px-5 py-3 text-dark-400 text-xs hidden lg:table-cell">{tx.date} {tx.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
