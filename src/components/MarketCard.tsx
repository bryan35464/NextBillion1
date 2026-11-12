import { useSettings } from '@/context/SettingsContext';
import { formatPercent } from '@/lib/format';
import { getAssetColor, getAssetInitials } from '@/lib/marketData';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Asset } from '@/types';

interface MarketCardProps {
  asset: Asset;
  compact?: boolean;
}

export function AssetIcon({ symbol, size = 'md' }: { symbol: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
      style={{ backgroundColor: `${getAssetColor(symbol)}20`, color: getAssetColor(symbol) }}
    >
      {getAssetInitials(symbol)}
    </div>
  );
}

export function PriceChange({ change, showIcon = true }: { change: number; showIcon?: boolean }) {
  const positive = change >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-medium ${
        positive ? 'text-success-400' : 'text-danger-400'
      }`}
    >
      {showIcon && (positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />)}
      {formatPercent(change)}
    </span>
  );
}

export default function MarketCard({ asset, compact = false }: MarketCardProps) {
  const positive = asset.change_24h >= 0;

  if (compact) {
    return (
      <Link
        to={`/trade/${asset.symbol}_USDT`}
        className="card card-hover p-4 flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <AssetIcon symbol={asset.symbol} size="sm" />
          <div>
            <p className="text-white font-medium text-sm">{asset.symbol}</p>
            <p className="text-dark-400 text-xs">{asset.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-medium text-sm">
            ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <PriceChange change={asset.change_24h} showIcon={false} />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/trade/${asset.symbol}_USDT`}
      className="card card-hover p-5 group block"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AssetIcon symbol={asset.symbol} />
          <div>
            <p className="text-white font-semibold">{asset.name}</p>
            <p className="text-dark-400 text-sm">{asset.symbol}/USDT</p>
          </div>
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            positive ? 'bg-success-500/10' : 'bg-danger-500/10'
          }`}
        >
          {positive ? (
            <TrendingUp className="w-5 h-5 text-success-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-danger-400" />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-dark-400 text-sm">Price</span>
          <span className="text-white font-bold text-lg">
            ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-dark-400 text-sm">24h Change</span>
          <PriceChange change={asset.change_24h} />
        </div>
        {!compact && (
          <div className="flex items-center justify-between">
            <span className="text-dark-400 text-sm">24h Volume</span>
            <span className="text-dark-200 text-sm">
              ${(asset.volume_24h / 1_000_000).toFixed(2)}M
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-dark-700">
        <div className="flex items-center justify-between text-xs text-dark-400">
          <span>24h High</span>
          <span className="text-success-400">${asset.high_24h.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-dark-400 mt-1">
          <span>24h Low</span>
          <span className="text-danger-400">${asset.low_24h.toLocaleString()}</span>
        </div>
      </div>

      <button className="w-full mt-4 btn-primary text-sm py-2 opacity-90 group-hover:opacity-100">
        Trade {asset.symbol}
      </button>
    </Link>
  );
}
