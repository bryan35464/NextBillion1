import { useDashboardData } from '@/context/DashboardDataContext';
import { formatINR, formatPercent } from '@/lib/formatINR';
import { ListOrdered } from 'lucide-react';

export default function TradingOrdersPage() {
  const { orders } = useDashboardData();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Orders</h1>
        <p className="text-dark-400 text-sm mt-0.5">View and track all your orders</p>
      </div>

      <div className="bg-dark-800/80 border border-dark-700/50 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700/50">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-brand-400" /> Order History
          </h2>
          <span className="text-xs text-dark-400">{orders.length} orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-dark-400 text-xs uppercase border-b border-dark-700/40">
                <th className="text-left px-5 py-2.5 font-medium">Instrument</th>
                <th className="text-left px-3 py-2.5 font-medium hidden sm:table-cell">Product</th>
                <th className="text-left px-3 py-2.5 font-medium hidden md:table-cell">Type</th>
                <th className="text-left px-3 py-2.5 font-medium">Side</th>
                <th className="text-right px-3 py-2.5 font-medium">Qty</th>
                <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell">Price</th>
                <th className="text-left px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-dark-700/20 hover:bg-dark-700/30 transition-colors">
                  <td className="px-5 py-3 text-white font-medium text-sm">{o.instrument}</td>
                  <td className="px-3 py-3 text-dark-300 text-sm hidden sm:table-cell">{o.product}</td>
                  <td className="px-3 py-3 text-dark-300 text-sm hidden md:table-cell">{o.order_type}</td>
                  <td className="px-3 py-3">
                    <span className={`badge text-xs ${o.side === 'buy' ? 'bg-success-500/15 text-success-400' : 'bg-danger-500/15 text-danger-400'} capitalize`}>
                      {o.side}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-white text-sm">{o.quantity}</td>
                  <td className="px-3 py-3 text-right text-white text-sm hidden sm:table-cell">₹{o.price.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs ${o.status === 'completed' ? 'text-success-400' : o.status === 'open' ? 'text-amber-400' : 'text-danger-400'} capitalize`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-dark-400 text-sm">No orders</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
