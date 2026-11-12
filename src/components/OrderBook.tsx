import { useEffect, useState } from 'react';
import { generateOrderBook } from '@/lib/marketData';
import { formatPrice } from '@/lib/format';

interface OrderBookProps {
  symbol: string;
  currentPrice: number;
}

export default function OrderBook({ symbol, currentPrice }: OrderBookProps) {
  const [book, setBook] = useState(() => generateOrderBook(currentPrice));

  useEffect(() => {
    const interval = setInterval(() => {
      setBook(generateOrderBook(currentPrice));
    }, 2000);
    return () => clearInterval(interval);
  }, [currentPrice]);

  const maxBidTotal = Math.max(...book.bids.map((b) => b.total));
  const maxAskTotal = Math.max(...book.asks.map((a) => a.total));
  const maxTotal = Math.max(maxBidTotal, maxAskTotal);

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-dark-700 flex items-center justify-between">
        <h3 className="text-white font-medium text-sm">Order Book</h3>
        <span className="text-xs text-dark-400">{symbol}</span>
      </div>

      <div className="px-4 py-1.5 grid grid-cols-3 text-xs text-dark-400 border-b border-dark-700/50">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (reversed) */}
      <div className="px-4 py-1 space-y-0.5 max-h-[180px] overflow-y-auto no-scrollbar flex flex-col-reverse">
        {book.asks.slice(0, 12).map((ask, i) => (
          <div
            key={i}
            className="grid grid-cols-3 text-xs relative py-0.5 rounded"
          >
            <div
              className="absolute right-0 top-0 bottom-0 bg-danger-500/10 rounded"
              style={{ width: `${(ask.total / maxTotal) * 100}%` }}
            />
            <span className="text-danger-400 relative">{formatPrice(ask.price)}</span>
            <span className="text-right text-dark-200 relative">{ask.size}</span>
            <span className="text-right text-dark-400 relative">{ask.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Spread / Last Price */}
      <div className="px-4 py-2 border-y border-dark-700 bg-dark-900/50">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-success-400">
            {formatPrice(currentPrice)}
          </span>
          <span className="text-xs text-dark-400">
            Spread: {formatPrice(book.asks[0]?.price - book.bids[0]?.price || 0)}
          </span>
        </div>
      </div>

      {/* Bids */}
      <div className="px-4 py-1 space-y-0.5 max-h-[180px] overflow-y-auto no-scrollbar">
        {book.bids.slice(0, 12).map((bid, i) => (
          <div
            key={i}
            className="grid grid-cols-3 text-xs relative py-0.5 rounded"
          >
            <div
              className="absolute right-0 top-0 bottom-0 bg-success-500/10 rounded"
              style={{ width: `${(bid.total / maxTotal) * 100}%` }}
            />
            <span className="text-success-400 relative">{formatPrice(bid.price)}</span>
            <span className="text-right text-dark-200 relative">{bid.size}</span>
            <span className="text-right text-dark-400 relative">{bid.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
