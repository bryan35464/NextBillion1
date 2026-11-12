import { useEffect, useState } from 'react';
import { generateRecentTrades } from '@/lib/marketData';
import { formatPrice } from '@/lib/format';

interface RecentTradesProps {
  symbol: string;
  currentPrice: number;
}

export default function RecentTrades({ symbol, currentPrice }: RecentTradesProps) {
  const [trades, setTrades] = useState(() => generateRecentTrades(currentPrice));

  useEffect(() => {
    const interval = setInterval(() => {
      setTrades((prev) => {
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const price = currentPrice * (1 + (Math.random() - 0.5) * 0.002);
        const size = Math.random() * 2 + 0.01;
        return [
          {
            price: Number(price.toFixed(2)),
            size: Number(size.toFixed(4)),
            side,
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          },
          ...prev.slice(0, 29),
        ];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentPrice]);

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-dark-700">
        <h3 className="text-white font-medium text-sm">Recent Trades</h3>
      </div>

      <div className="px-4 py-1.5 grid grid-cols-3 text-xs text-dark-400 border-b border-dark-700/50">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Time</span>
      </div>

      <div className="px-4 py-1 space-y-0.5 max-h-[300px] overflow-y-auto no-scrollbar">
        {trades.map((trade, i) => (
          <div key={i} className="grid grid-cols-3 text-xs py-0.5">
            <span className={trade.side === 'buy' ? 'text-success-400' : 'text-danger-400'}>
              {formatPrice(trade.price)}
            </span>
            <span className="text-right text-dark-200">{trade.size}</span>
            <span className="text-right text-dark-400">{trade.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
