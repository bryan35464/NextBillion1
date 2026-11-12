import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { AssetIcon, PriceChange } from '@/components/MarketCard';
import { formatCurrency, formatPrice } from '@/lib/format';
import { Search, Star, ArrowUpDown } from 'lucide-react';

type SortField = 'name' | 'price' | 'change_24h' | 'volume_24h' | 'market_cap';

export default function MarketsPage() {
  const { assets } = useSettings();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('volume_24h');
  const [sortAsc, setSortAsc] = useState(false);
  const [filter, setFilter] = useState<'all' | 'featured' | 'gainers' | 'losers'>('all');

  const filteredAssets = useMemo(() => {
    let result = assets;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q)
      );
    }
    if (filter === 'featured') result = result.filter((a) => a.is_featured);
    if (filter === 'gainers') result = result.filter((a) => a.change_24h > 0);
    if (filter === 'losers') result = result.filter((a) => a.change_24h < 0);

    result = [...result].sort((a, b) => {
      let cmp: number;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else cmp = a[sortField] - b[sortField];
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [assets, search, sortField, sortAsc, filter]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'featured', label: 'Featured' },
    { key: 'gainers', label: 'Gainers' },
    { key: 'losers', label: 'Losers' },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Markets</h1>
        <p className="text-dark-400 mt-1">Real-time prices for all listed cryptocurrencies</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.key
                  ? 'bg-brand-500 text-white'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700 border border-dark-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700 text-xs text-dark-400 uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-white">
                    Asset <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium">
                  <button onClick={() => toggleSort('price')} className="flex items-center gap-1 ml-auto hover:text-white">
                    Price <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">
                  <button onClick={() => toggleSort('change_24h')} className="flex items-center gap-1 ml-auto hover:text-white">
                    24h % <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium hidden md:table-cell">24h High</th>
                <th className="text-right px-4 py-3 font-medium hidden md:table-cell">24h Low</th>
                <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">
                  <button onClick={() => toggleSort('volume_24h')} className="flex items-center gap-1 ml-auto hover:text-white">
                    Volume <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">
                  <button onClick={() => toggleSort('market_cap')} className="flex items-center gap-1 ml-auto hover:text-white">
                    Market Cap <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium">Trade</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors group"
                >
                  <td className="px-4 py-4">
                    <Link to={`/trade/${asset.symbol}_USDT`} className="flex items-center gap-3">
                      <AssetIcon symbol={asset.symbol} size="sm" />
                      <div>
                        <p className="text-white font-medium text-sm flex items-center gap-2">
                          {asset.symbol}
                          {asset.is_featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                        </p>
                        <p className="text-dark-400 text-xs">{asset.name}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="text-right px-4 py-4">
                    <span className="text-white font-medium">{formatPrice(asset.price)}</span>
                  </td>
                  <td className="text-right px-4 py-4 hidden sm:table-cell">
                    <PriceChange change={asset.change_24h} showIcon={false} />
                  </td>
                  <td className="text-right px-4 py-4 text-success-400 hidden md:table-cell text-sm">
                    ${asset.high_24h.toLocaleString()}
                  </td>
                  <td className="text-right px-4 py-4 text-danger-400 hidden md:table-cell text-sm">
                    ${asset.low_24h.toLocaleString()}
                  </td>
                  <td className="text-right px-4 py-4 text-dark-200 hidden lg:table-cell text-sm">
                    {formatCurrency(asset.volume_24h)}
                  </td>
                  <td className="text-right px-4 py-4 text-dark-200 hidden lg:table-cell text-sm">
                    {formatCurrency(asset.market_cap)}
                  </td>
                  <td className="text-right px-4 py-4">
                    <Link
                      to={`/trade/${asset.symbol}_USDT`}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white text-sm font-medium transition-all"
                    >
                      Trade
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="py-20 text-center text-dark-400">
            <p>No assets found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
