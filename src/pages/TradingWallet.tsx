import { useDashboardData } from '@/context/DashboardDataContext';
import { formatINR } from '@/lib/formatINR';
import {
  Wallet as WalletIcon,
  IndianRupee,
  ArrowDownToLine,
  ArrowUpFromLine,
  Lock,
  PieChart as PieIcon,
  Download,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export default function TradingWalletPage() {
  const { config, holdings, transactions } = useDashboardData();

  const balanceCards = [
    { label: 'Total Wallet Balance', value: formatINR(config?.total_wallet_balance || 0), icon: WalletIcon, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Available Balance', value: formatINR(config?.available_balance || 0), icon: IndianRupee, color: 'text-success-400', bg: 'bg-success-500/10' },
    { label: 'Locked / Reserved', value: formatINR(config?.locked_balance || 0), icon: Lock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Portfolio Value', value: formatINR(config?.total_portfolio_value || 0), icon: PieIcon, color: 'text-accent-400', bg: 'bg-accent-500/10' },
  ];

  const pieData = holdings
    .filter((h) => h.value > 0 && h.asset_symbol !== 'INR')
    .map((h) => ({ name: h.asset_symbol, value: h.value, color: getAssetColor(h.asset_symbol) }));

  function getAssetColor(symbol: string): string {
    const colors: Record<string, string> = {
      BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', USDT: '#26a17b',
      XRP: '#23292f', BNB: '#f3ba2f', INR: '#3b82f6',
    };
    return colors[symbol] || '#3b82f6';
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Funds</h1>
        <p className="text-dark-400 text-sm mt-0.5">Manage your wallet, deposits, and withdrawals</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {balanceCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-4 lg:p-5">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-[18px] h-[18px] ${card.color}`} />
              </div>
              <p className="text-dark-400 text-xs lg:text-sm">{card.label}</p>
              <p className="text-lg lg:text-xl font-bold text-white mt-1">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        {/* INR Balance */}
        <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="w-5 h-5 text-brand-400" />
            <h3 className="text-white font-semibold">INR Balance</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-4">{formatINR(config?.inr_balance || 0)}</p>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-success-500/15 text-success-400 hover:bg-success-500/25 text-sm font-medium transition-all">
              <ArrowDownToLine className="w-4 h-4" /> Add Funds
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-danger-500/15 text-danger-400 hover:bg-danger-500/25 text-sm font-medium transition-all">
              <ArrowUpFromLine className="w-4 h-4" /> Withdraw
            </button>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl p-5 lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">Asset Allocation</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#161b2c', border: '1px solid #333a56', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(v: number, _n, props) => [formatINR(v), props.payload.name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-dark-200">{d.name}</span>
                    </div>
                    <span className="text-white font-medium">{formatINR(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-dark-400 text-sm">No holdings to display</div>
          )}
        </div>
      </div>

      {/* Holdings table */}
      <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700/50">
          <h2 className="text-white font-semibold">Holdings</h2>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-xs font-medium transition-all">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-dark-400 text-xs uppercase border-b border-dark-700/40">
                <th className="text-left px-5 py-2.5 font-medium">Asset</th>
                <th className="text-right px-3 py-2.5 font-medium">Quantity</th>
                <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell">Avg Price</th>
                <th className="text-right px-3 py-2.5 font-medium">Current Price</th>
                <th className="text-right px-3 py-2.5 font-medium">Value</th>
                <th className="text-right px-5 py-2.5 font-medium hidden sm:table-cell">P&L</th>
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
                  <td className={`px-5 py-3 text-right text-sm hidden sm:table-cell ${h.pnl >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                    {h.pnl !== 0 ? `${h.pnl > 0 ? '+' : ''}${formatINR(h.pnl)}` : '--'}
                  </td>
                </tr>
              ))}
              {holdings.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-dark-400 text-sm">No holdings</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl">
        <div className="px-5 py-4 border-b border-dark-700/50">
          <h2 className="text-white font-semibold">Transaction History</h2>
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
                  <td className="px-5 py-3"><span className={`badge text-xs ${tx.type === 'Deposit' ? 'bg-success-500/15 text-success-400' : tx.type === 'Withdraw' ? 'bg-danger-500/15 text-danger-400' : 'bg-brand-500/15 text-brand-400'}`}>{tx.type}</span></td>
                  <td className="px-3 py-3 text-white text-sm">{tx.instrument || '--'}</td>
                  <td className="px-3 py-3 text-right text-white text-sm">{formatINR(tx.amount)}</td>
                  <td className="px-3 py-3 text-right text-dark-400 text-sm hidden sm:table-cell">{tx.pnl ? formatINR(tx.pnl) : '--'}</td>
                  <td className="px-5 py-3"><span className="text-success-400 text-xs capitalize">{tx.status}</span></td>
                  <td className="px-5 py-3 text-dark-400 text-xs hidden lg:table-cell">{tx.date} {tx.time}</td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-dark-400 text-sm">No transactions</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
