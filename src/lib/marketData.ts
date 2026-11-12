import type { Asset } from '@/types';

export function generateCandles(basePrice: number, count: number = 60): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice * 0.95;
  const now = Date.now();
  const interval = 60 * 60 * 1000;

  for (let i = count; i > 0; i--) {
    const open = price;
    const volatility = basePrice * 0.02;
    const change = (Math.random() - 0.48) * volatility;
    const close = Math.max(0.01, open + change);
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.random() * 1000 + 200;
    candles.push({
      time: now - i * interval,
      open: Number(open.toFixed(2)),
      close: Number(close.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      volume: Number(volume.toFixed(2)),
    });
    price = close;
  }
  candles.push({
    time: now,
    open: Number(price.toFixed(2)),
    close: Number(basePrice.toFixed(2)),
    high: Number(Math.max(price, basePrice) * 1.005).toFixed(2),
    low: Number(Math.min(price, basePrice) * 0.995).toFixed(2),
    volume: Number((Math.random() * 1000 + 200).toFixed(2)),
  });

  return candles;
}

export interface Candle {
  time: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export function generateOrderBook(currentPrice: number) {
  const bids: { price: number; size: number; total: number }[] = [];
  const asks: { price: number; size: number; total: number }[] = [];
  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < 20; i++) {
    const bidPrice = currentPrice * (1 - (i + 1) * 0.0008);
    const askPrice = currentPrice * (1 + (i + 1) * 0.0008);
    const bidSize = Math.random() * 5 + 0.1;
    const askSize = Math.random() * 5 + 0.1;
    bidTotal += bidSize;
    askTotal += askSize;
    bids.push({
      price: Number(bidPrice.toFixed(2)),
      size: Number(bidSize.toFixed(4)),
      total: Number(bidTotal.toFixed(4)),
    });
    asks.push({
      price: Number(askPrice.toFixed(2)),
      size: Number(askSize.toFixed(4)),
      total: Number(askTotal.toFixed(4)),
    });
  }

  return { bids, asks };
}

export function generateRecentTrades(currentPrice: number) {
  const trades: { price: number; size: number; side: 'buy' | 'sell'; time: string }[] = [];
  const now = Date.now();
  for (let i = 0; i < 30; i++) {
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const price = currentPrice * (1 + (Math.random() - 0.5) * 0.002);
    const size = Math.random() * 2 + 0.01;
    trades.push({
      price: Number(price.toFixed(2)),
      size: Number(size.toFixed(4)),
      side,
      time: new Date(now - i * 15000).toLocaleTimeString('en-US', { hour12: false }),
    });
  }
  return trades;
}

export function getAssetColor(symbol: string): string {
  const colors: Record<string, string> = {
    BTC: '#f7931a',
    ETH: '#627eea',
    SOL: '#9945ff',
    XRP: '#23292f',
    BNB: '#f3ba2f',
    DOGE: '#c2a633',
    USDT: '#26a17b',
    ADA: '#0033ad',
    DOT: '#e6007a',
    AVAX: '#e84142',
    LINK: '#2a5ada',
    MATIC: '#8247e5',
  };
  return colors[symbol] || '#3b82f6';
}

export function getAssetInitials(symbol: string): string {
  return symbol.slice(0, 3).toUpperCase();
}

export function tickAssetPrice(asset: Asset): number {
  const volatility = asset.price * 0.001;
  const change = (Math.random() - 0.5) * volatility * 2;
  return Math.max(0.0001, asset.price + change);
}
