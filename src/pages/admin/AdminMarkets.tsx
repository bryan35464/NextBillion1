import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/context/SettingsContext';
import type { Asset } from '@/types';
import { AssetIcon, PriceChange } from '@/components/MarketCard';
import { formatPrice, formatCurrency } from '@/lib/format';
import { Plus, Save, Trash2, Edit3, X, Loader2, Check, Star, Search } from 'lucide-react';

export default function AdminMarkets() {
  const { user } = useAuth();
  const { assets, refreshAssets } = useSettings();
  const [editing, setEditing] = useState<Asset | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const emptyAsset: Partial<Asset> = {
    name: '',
    symbol: '',
    logo_url: '',
    price: 0,
    change_24h: 0,
    high_24h: 0,
    low_24h: 0,
    volume_24h: 0,
    market_cap: 0,
    status: 'active',
    trading_enabled: true,
    is_featured: false,
    display_order: 0,
  };

  const [formData, setFormData] = useState<Partial<Asset>>(emptyAsset);

  const filteredAssets = assets.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (asset: Asset) => {
    setEditing(asset);
    setFormData(asset);
    setShowAdd(false);
  };

  const startAdd = () => {
    setShowAdd(true);
    setEditing(null);
    setFormData(emptyAsset);
  };

  const logAudit = async (action: string, entity: string, entityId: string, previous: unknown, next: unknown) => {
    if (!user) return;
    await supabase.from('audit_logs').insert({
      admin_email: user.email || 'admin',
      action,
      entity,
      entity_id: entityId,
      previous_value: previous as Record<string, unknown>,
      new_value: next as Record<string, unknown>,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from('assets').update(formData).eq('id', editing.id);
      if (!error) {
        await logAudit('update', 'asset', editing.id, editing, formData);
        await refreshAssets();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setEditing(null);
      }
    } else {
      const { data, error } = await supabase.from('assets').insert(formData).select().maybeSingle();
      if (!error && data) {
        await logAudit('create', 'asset', data.id, null, formData);
        await refreshAssets();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setShowAdd(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const asset = assets.find((a) => a.id === id);
    await supabase.from('assets').delete().eq('id', id);
    if (asset) await logAudit('delete', 'asset', id, asset, null);
    await refreshAssets();
    setConfirmDelete(null);
  };

  const update = (key: keyof Asset, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const fields: { key: keyof Asset; label: string; type: string }[] = [
    { key: 'name', label: 'Asset Name', type: 'text' },
    { key: 'symbol', label: 'Symbol', type: 'text' },
    { key: 'price', label: 'Current Price', type: 'number' },
    { key: 'change_24h', label: '24h Change (%)', type: 'number' },
    { key: 'high_24h', label: '24h High', type: 'number' },
    { key: 'low_24h', label: '24h Low', type: 'number' },
    { key: 'volume_24h', label: '24h Volume', type: 'number' },
    { key: 'market_cap', label: 'Market Cap', type: 'number' },
    { key: 'display_order', label: 'Display Order', type: 'number' },
    { key: 'logo_url', label: 'Logo URL', type: 'text' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Management</h1>
          <p className="text-dark-400 mt-1">Manage cryptocurrency assets and trading pairs</p>
        </div>
        <button onClick={startAdd} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
        <input
          type="text"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-dark-400 text-xs uppercase border-b border-dark-700">
                <th className="text-left px-4 py-3">Asset</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">24h</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">Volume</th>
                <th className="text-center px-4 py-3 hidden lg:table-cell">Featured</th>
                <th className="text-center px-4 py-3">Trading</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-dark-700/30 hover:bg-dark-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AssetIcon symbol={asset.symbol} size="sm" />
                      <div>
                        <p className="text-white font-medium text-sm">{asset.symbol}</p>
                        <p className="text-dark-400 text-xs">{asset.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right px-4 py-3 text-white text-sm">{formatPrice(asset.price)}</td>
                  <td className="text-right px-4 py-3 hidden sm:table-cell">
                    <PriceChange change={asset.change_24h} showIcon={false} />
                  </td>
                  <td className="text-right px-4 py-3 text-dark-200 text-sm hidden md:table-cell">{formatCurrency(asset.volume_24h)}</td>
                  <td className="text-center px-4 py-3 hidden lg:table-cell">
                    {asset.is_featured && <Star className="w-4 h-4 text-amber-400 fill-amber-400 inline" />}
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className={`badge ${asset.trading_enabled ? 'badge-success' : 'badge-danger'}`}>
                      {asset.trading_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="text-right px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => startEdit(asset)} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-300 hover:text-brand-400 transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(asset.id)} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-300 hover:text-danger-400 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {(editing || showAdd) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => { setEditing(null); setShowAdd(false); }}>
          <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editing ? 'Edit Asset' : 'Add New Asset'}</h2>
              <button onClick={() => { setEditing(null); setShowAdd(false); }} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {fields.map((field) => (
                <div key={field.key} className={field.type === 'text' && (field.key === 'logo_url' || field.key === 'name') ? 'col-span-2' : ''}>
                  <label className="text-sm text-dark-200 mb-1.5 block">{field.label}</label>
                  <input
                    type={field.type}
                    value={(formData[field.key] as string | number) || ''}
                    onChange={(e) => update(field.key, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                    disabled={editing && field.key === 'symbol'}
                    className="input-field disabled:opacity-50"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Status</label>
                <select value={formData.status || 'active'} onChange={(e) => update('status', e.target.value)} className="input-field">
                  <option value="active">Active</option>
                  <option value="delisted">Delisted</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-4">
              <label className="flex items-center gap-2 text-sm text-dark-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trading_enabled || false}
                  onChange={(e) => update('trading_enabled', e.target.checked)}
                  className="rounded border-dark-600 bg-dark-800 text-brand-500"
                />
                Trading Enabled
              </label>
              <label className="flex items-center gap-2 text-sm text-dark-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured || false}
                  onChange={(e) => update('is_featured', e.target.checked)}
                  className="rounded border-dark-600 bg-dark-800 text-brand-500"
                />
                Featured Asset
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button onClick={() => { setEditing(null); setShowAdd(false); }} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save Asset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setConfirmDelete(null)}>
          <div className="card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Delete Asset?</h3>
            <p className="text-dark-400 text-sm mb-6">This action cannot be undone. The asset will be permanently removed.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="bg-danger-500 hover:bg-danger-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
