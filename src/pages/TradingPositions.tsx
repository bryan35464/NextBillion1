import { useDashboardData } from '@/context/DashboardDataContext';
import { formatINR, formatPercent } from '@/lib/formatINR';
import { Briefcase } from 'lucide-react';

export default function TradingPositionsPage() {
  const { positions } = useDashboardData();

  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Positions</h1>
        <p className="text-dark-400 text-sm mt-0.5">Your open trading positions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-4 lg:p-5">
          <p className="text-dark-400 text-xs lg:text-sm">Open Positions</p>
          <p className="text-lg lg:text-xl font-bold text-white mt-1">{positions.length}</p>
        </div>
        <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-4 lg:p-5">
          <p className="text-dark-400 text-xs lg:text-sm">Total P&L</p>
          <p className={`text-lg lg:text-xl font-bold mt-1 ${totalPnl >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
            {totalPnl >= 0 ? '+' : ''}{formatINR(totalPnl)}
          </p>
        </div>
        <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-4 lg:p-5">
          <p className="text-dark-400 text-xs lg:text-sm">Buy Positions</p>
          <p className="text-lg lg:text-xl font-bold text-success-400 mt-1">{positions.filter((p) => p.side === 'buy').length}</p>
        </div>
        <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-4 lg:p-5">
          <p className="text-dark-400 text-xs lg:text-sm">Sell Positions</p>
          <p className="text-lg lg:text-xl font-bold text-danger-400 mt-1">{positions.filter((p) => p.side === 'sell').length}</p>
        </div>
      </div>

      <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700/50">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-400" /> All Positions
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-dark-400 text-xs uppercase border-b border-dark-700/40">
                <th className="text-left px-5 py-2.5 font-medium">Instrument</th>
                <th className="text-left px-3 py-2.5 font-medium hidden sm:table-cell">Product</th>
                <th className="text-left px-3 py-2.5 font-medium">Side</th>
                <th className="text-right px-3 py-2.5 font-medium">Qty</th>
                <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell">Avg Price</th>
                <th className="text-right px-3 py-2.5 font-medium">LTP</th>
                <th className="text-right px-3 py-2.5 font-medium">P&L</th>
                <th className="text-right px-5 py-2.5 font-medium hidden sm:table-cell">P&L %</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.id} className="border-b border-dark-700/20 hover:bg-dark-700/30 transition-colors">
                  <td className="px-5 py-3 text-white font-medium text-sm">{p.instrument}</td>
                  <td className="px-3 py-3 text-dark-300 text-sm hidden sm:table-cell">{p.product}</td>
                  <td className="px-3 py-3">
                    <span className={`badge text-xs capitalize ${p.side === 'buy' ? 'bg-success-500/15 text-success-400' : 'bg-danger-500/15 text-danger-400'}`}>
                      {p.side}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-white text-sm">{p.quantity}</td>
                  <td className="px-3 py-3 text-right text-dark-200 text-sm hidden sm:table-cell">₹{p.avg_price.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 text-right text-white text-sm">₹{p.ltp.toLocaleString('en-IN')}</td>
                  <td className={`px-3 py-3 text-right text-sm font-medium ${p.pnl >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                    {p.pnl >= 0 ? '+' : ''}{formatINR(p.pnl)}
                  </td>
                  <td className={`px-5 py-3 text-right text-sm hidden sm:table-cell ${p.pnl_percent >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                    {p.pnl_percent >= 0 ? '+' : ''}{formatPercent(p.pnl_percent)}
                  </td>
                </tr>
              ))}
              {positions.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-dark-400 text-sm">No open positions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
