import { useEffect, useState, useRef } from 'react';
import { generateCandles, type Candle } from '@/lib/marketData';
import { BarChart3, Maximize2, Settings2, LineChart, CandlestickChart } from 'lucide-react';

interface TradingChartProps {
  symbol: string;
  basePrice: number;
  height?: number;
}

type ChartType = 'candle' | 'line';
type Timeframe = '5m' | '15m' | '1H' | '4H' | '1D' | '1W';

export default function TradingChart({ symbol, basePrice, height = 400 }: TradingChartProps) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [chartType, setChartType] = useState<ChartType>('candle');
  const [timeframe, setTimeframe] = useState<Timeframe>('1H');
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCandles(generateCandles(basePrice, 80));
  }, [basePrice, timeframe]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCandles((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const volatility = basePrice * 0.003;
        const change = (Math.random() - 0.5) * volatility;
        const newClose = Math.max(0.01, last.close + change);
        const newCandle: Candle = {
          time: Date.now(),
          open: last.close,
          close: Number(newClose.toFixed(2)),
          high: Number(Math.max(last.close, newClose) * 1.002).toFixed(2),
          low: Number(Math.min(last.close, newClose) * 0.998).toFixed(2),
          volume: Number((Math.random() * 1000 + 200).toFixed(2)),
        };
        return [...prev.slice(-79), newCandle];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [basePrice]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = height;
    const padding = { top: 20, right: 70, bottom: 30, left: 10 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    const prices = candles.flatMap((c) => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const paddedMin = minPrice - priceRange * 0.1;
    const paddedMax = maxPrice + priceRange * 0.1;
    const paddedRange = paddedMax - paddedMin;

    const priceToY = (price: number) =>
      padding.top + ((paddedMax - price) / paddedRange) * chartH;
    const indexToX = (index: number) =>
      padding.left + (index / (candles.length - 1)) * chartW;

    // Grid lines
    ctx.strokeStyle = '#1e2438';
    ctx.lineWidth = 1;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = '#6b7494';

    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i / gridLines) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      const price = paddedMax - (i / gridLines) * paddedRange;
      ctx.textAlign = 'left';
      ctx.fillText(`$${price.toFixed(2)}`, padding.left + chartW + 5, y + 4);
    }

    // Vertical grid
    const vGridLines = 6;
    for (let i = 0; i <= vGridLines; i++) {
      const x = padding.left + (i / vGridLines) * chartW;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartH);
      ctx.stroke();
    }

    if (chartType === 'candle') {
      const candleWidth = (chartW / candles.length) * 0.7;
      candles.forEach((candle, i) => {
        const x = indexToX(i);
        const isGreen = candle.close >= candle.open;
        const color = isGreen ? '#22c55e' : '#ef4444';
        const wickColor = isGreen ? '#4ade80' : '#f87171';

        // Wick
        ctx.strokeStyle = wickColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, priceToY(candle.high));
        ctx.lineTo(x, priceToY(candle.low));
        ctx.stroke();

        // Body
        const bodyTop = priceToY(Math.max(candle.open, candle.close));
        const bodyBottom = priceToY(Math.min(candle.open, candle.close));
        const bodyHeight = Math.max(2, bodyBottom - bodyTop);
        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
    } else {
      // Line chart
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      candles.forEach((candle, i) => {
        const x = indexToX(i);
        const y = priceToY(candle.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.lineTo(indexToX(0), padding.top + chartH);
      candles.forEach((candle, i) => {
        ctx.lineTo(indexToX(i), priceToY(candle.close));
      });
      ctx.lineTo(indexToX(candles.length - 1), padding.top + chartH);
      ctx.closePath();
      ctx.fill();
    }

    // Current price line
    const lastCandle = candles[candles.length - 1];
    const lastY = priceToY(lastCandle.close);
    ctx.strokeStyle = lastCandle.close >= lastCandle.open ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, lastY);
    ctx.lineTo(padding.left + chartW, lastY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price label
    ctx.fillStyle = lastCandle.close >= lastCandle.open ? '#22c55e' : '#ef4444';
    ctx.fillRect(padding.left + chartW + 2, lastY - 10, 65, 20);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillText(`$${lastCandle.close.toFixed(2)}`, padding.left + chartW + 6, lastY + 4);
  }, [candles, chartType, height]);

  const timeframes: Timeframe[] = ['5m', '15m', '1H', '4H', '1D', '1W'];

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-dark-700 flex-wrap gap-2">
        <div className="flex items-center gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                timeframe === tf
                  ? 'bg-brand-500/15 text-brand-400'
                  : 'text-dark-400 hover:bg-dark-700 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setChartType('candle')}
            className={`p-1.5 rounded-lg transition-all ${
              chartType === 'candle' ? 'bg-brand-500/15 text-brand-400' : 'text-dark-400 hover:bg-dark-700'
            }`}
            title="Candlestick"
          >
            <CandlestickChart className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-1.5 rounded-lg transition-all ${
              chartType === 'line' ? 'bg-brand-500/15 text-brand-400' : 'text-dark-400 hover:bg-dark-700'
            }`}
            title="Line"
          >
            <LineChart className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-dark-600 mx-1" />
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg text-dark-400 hover:bg-dark-700 transition-all"
            title="Indicators"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg text-dark-400 hover:bg-dark-700 transition-all" title="Fullscreen">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="px-4 py-3 border-b border-dark-700 flex items-center gap-3 flex-wrap animate-fade-in">
          <span className="text-xs text-dark-400 font-medium">Indicators:</span>
          {['MA', 'EMA', 'BOLL', 'MACD', 'RSI', 'KDJ'].map((ind) => (
            <button
              key={ind}
              className="px-2.5 py-1 rounded-lg text-xs bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white transition-all"
            >
              {ind}
            </button>
          ))}
        </div>
      )}

      <div className="relative" ref={containerRef}>
        <canvas ref={canvasRef} className="block" />
        {hoveredCandle && (
          <div className="absolute top-2 left-2 bg-dark-900/90 border border-dark-600 rounded-lg px-3 py-2 text-xs space-y-0.5 pointer-events-none">
            <div className="flex gap-3">
              <span className="text-dark-400">O:</span>
              <span className="text-white">{hoveredCandle.open}</span>
              <span className="text-dark-400">H:</span>
              <span className="text-success-400">{hoveredCandle.high}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-dark-400">L:</span>
              <span className="text-danger-400">{hoveredCandle.low}</span>
              <span className="text-dark-400">C:</span>
              <span className="text-white">{hoveredCandle.close}</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-dark-700 flex items-center justify-between text-xs text-dark-400">
        <span className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5" />
          {symbol} · {timeframe}
        </span>
        <span>Vol: {candles.length > 0 ? candles[candles.length - 1].volume : '--'}</span>
      </div>
    </div>
  );
}
