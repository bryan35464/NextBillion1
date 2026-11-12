import { useState, useEffect } from 'react';
import { useDashboardData } from '@/context/DashboardDataContext';
import { supabase } from '@/lib/supabase';
import type { DashboardConfig, Position, Holding, DashboardOrder, DashboardTransaction } from '@/types/dashboard';
import { Save, Loader2, Check, Plus, Trash2, RotateCcw } from 'lucide-react';

export default function ControlPanel() {
  const { config, positions, holdings, orders, transactions, refresh } = useDashboardData();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [form, setForm] = useState<Partial<DashboardConfig>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (config) setForm(config); }, [config]);

  const update = (key: keyof DashboardConfig, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setSaving(true);
    await supabase.from('dashboard_config').update({ ...form, updated_at: new Date().toISOString() }).eq('id', config.id);
    await refresh();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => { if (config) setForm(config); };

  const sections = [
    { key: 'dashboard', label: 'Dashboard Settings' },
    { key: 'profile', label: 'User Profile' },
    { key: 'wallet', label: 'Wallet' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'positions', label: 'Positions' },
    { key: 'orders', label: 'Orders' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'holdings', label: 'Holdings' },
    { key: 'market', label: 'Market Prices' },
    { key: 'fees', label: 'Fees' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Control Panel</h1>
          <p className="text-dark-400 mt-1 text-sm">Manage all dashboard presentation values</p>
        </div>
        {(activeSection === 'dashboard' || activeSection === 'profile' || activeSection === 'wallet' || activeSection === 'portfolio' || activeSection === 'market' || activeSection === 'fees') && (
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="btn-secondary text-sm flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Reset</button>
            <button onClick={handleSaveConfig} disabled={saving} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto no-scrollbar border-b border-dark-700">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeSection === s.key ? 'text-brand-400 border-brand-500' : 'text-dark-400 border-transparent hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Dashboard Settings */}
      {activeSection === 'dashboard' && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">P&L Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'total_pnl', label: 'Total P&L' },
              { key: 'realized_pnl', label: 'Realized P&L' },
              { key: 'unrealized_pnl', label: 'Unrealized P&L' },
              { key: 'total_pnl_percent', label: 'Total P&L %' },
              { key: 'today_pnl', label: "Today's P&L" },
              { key: 'today_pnl_percent', label: "Today's P&L %" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm text-dark-200 mb-1.5 block">{f.label}</label>
                <input type="number" step="0.01" value={(form[f.key as keyof DashboardConfig] as number) || 0} onChange={(e) => update(f.key as keyof DashboardConfig, parseFloat(e.target.value) || 0)} className="input-field" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile */}
      {activeSection === 'profile' && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">User Profile</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'user_name', label: 'User Name' },
              { key: 'user_email', label: 'Email' },
              { key: 'user_phone', label: 'Phone' },
              { key: 'user_avatar', label: 'Avatar URL' },
              { key: 'account_status', label: 'Account Status' },
              { key: 'kyc_status', label: 'KYC Status' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm text-dark-200 mb-1.5 block">{f.label}</label>
                <input value={(form[f.key as keyof DashboardConfig] as string) || ''} onChange={(e) => update(f.key as keyof DashboardConfig, e.target.value)} className="input-field" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallet */}
      {activeSection === 'wallet' && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Wallet Balances</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'total_wallet_balance', label: 'Total Wallet Balance' },
              { key: 'available_balance', label: 'Available Balance' },
              { key: 'locked_balance', label: 'Locked/Reserved Balance' },
              { key: 'inr_balance', label: 'INR Balance' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm text-dark-200 mb-1.5 block">{f.label}</label>
                <input type="number" value={(form[f.key as keyof DashboardConfig] as number) || 0} onChange={(e) => update(f.key as keyof DashboardConfig, parseFloat(e.target.value) || 0)} className="input-field" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio */}
      {activeSection === 'portfolio' && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Portfolio Values</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'total_portfolio_value', label: 'Total Portfolio Value' },
              { key: 'invested_capital', label: 'Invested Capital' },
              { key: 'current_value', label: 'Current Value' },
              { key: 'return_percent', label: 'Return %' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm text-dark-200 mb-1.5 block">{f.label}</label>
                <input type="number" step="0.01" value={(form[f.key as keyof DashboardConfig] as number) || 0} onChange={(e) => update(f.key as keyof DashboardConfig, parseFloat(e.target.value) || 0)} className="input-field" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Prices */}
      {activeSection === 'market' && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Market Prices</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'btc_price', label: 'BTC Price' },
              { key: 'btc_change', label: 'BTC Change %' },
              { key: 'eth_price', label: 'ETH Price' },
              { key: 'eth_change', label: 'ETH Change %' },
              { key: 'sol_price', label: 'SOL Price' },
              { key: 'sol_change', label: 'SOL Change %' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm text-dark-200 mb-1.5 block">{f.label}</label>
                <input type="number" step="0.01" value={(form[f.key as keyof DashboardConfig] as number) || 0} onChange={(e) => update(f.key as keyof DashboardConfig, parseFloat(e.target.value) || 0)} className="input-field" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fees */}
      {activeSection === 'fees' && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Fees</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'gst_fee', label: 'GST Fee' },
              { key: 'gst_fee_remaining', label: 'GST Fee Remaining' },
              { key: 'platform_fee_percent', label: 'Platform Fee %' },
              { key: 'trading_fee_percent', label: 'Trading Fee %' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm text-dark-200 mb-1.5 block">{f.label}</label>
                <input type="number" step="0.01" value={(form[f.key as keyof DashboardConfig] as number) || 0} onChange={(e) => update(f.key as keyof DashboardConfig, parseFloat(e.target.value) || 0)} className="input-field" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positions CRUD */}
      {activeSection === 'positions' && (
        <PositionsEditor positions={positions} onUpdate={refresh} />
      )}

      {/* Holdings CRUD */}
      {activeSection === 'holdings' && (
        <HoldingsEditor holdings={holdings} onUpdate={refresh} />
      )}

      {/* Orders CRUD */}
      {activeSection === 'orders' && (
        <OrdersEditor orders={orders} onUpdate={refresh} />
      )}

      {/* Transactions CRUD */}
      {activeSection === 'transactions' && (
        <TransactionsEditor transactions={transactions} onUpdate={refresh} />
      )}
    </div>
  );
}

function PositionsEditor({ positions, onUpdate }: { positions: Position[]; onUpdate: () => Promise<void> }) {
  const [editing, setEditing] = useState<Position | null>(null);
  const [form, setForm] = useState<Partial<Position>>({});
  const [showAdd, setShowAdd] = useState(false);

  const save = async () => {
    if (editing) {
      await supabase.from('positions').update(form).eq('id', editing.id);
    } else {
      await supabase.from('positions').insert({ ...form, display_order: positions.length + 1 });
    }
    await onUpdate();
    setEditing(null);
    setShowAdd(false);
  };

  const del = async (id: string) => {
    await supabase.from('positions').delete().eq('id', id);
    await onUpdate();
  };

  const fields = [
    { key: 'instrument', label: 'Instrument', type: 'text' },
    { key: 'product', label: 'Product', type: 'text' },
    { key: 'quantity', label: 'Quantity', type: 'number' },
    { key: 'avg_price', label: 'Avg Price', type: 'number' },
    { key: 'ltp', label: 'LTP', type: 'number' },
    { key: 'pnl', label: 'P&L', type: 'number' },
    { key: 'pnl_percent', label: 'P&L %', type: 'number' },
    { key: 'side', label: 'Side (buy/sell)', type: 'text' },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => { setShowAdd(true); setEditing(null); setForm({ instrument: '', product: 'Spot', quantity: 0, avg_price: 0, ltp: 0, pnl: 0, pnl_percent: 0, side: 'buy' }); }} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Position
        </button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="text-dark-400 text-xs uppercase border-b border-dark-700">
            <th className="text-left px-4 py-2.5">Instrument</th>
            <th className="text-right px-3 py-2.5 hidden sm:table-cell">Qty</th>
            <th className="text-right px-3 py-2.5 hidden sm:table-cell">Avg</th>
            <th className="text-right px-3 py-2.5">LTP</th>
            <th className="text-right px-3 py-2.5">P&L</th>
            <th className="text-right px-4 py-2.5">Actions</th>
          </tr></thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.id} className="border-b border-dark-700/20 hover:bg-dark-700/30">
                <td className="px-4 py-3 text-white text-sm">{p.instrument}</td>
                <td className="px-3 py-3 text-right text-dark-200 text-sm hidden sm:table-cell">{p.quantity}</td>
                <td className="px-3 py-3 text-right text-dark-200 text-sm hidden sm:table-cell">₹{p.avg_price.toLocaleString('en-IN')}</td>
                <td className="px-3 py-3 text-right text-white text-sm">₹{p.ltp.toLocaleString('en-IN')}</td>
                <td className={`px-3 py-3 text-right text-sm ${p.pnl >= 0 ? 'text-success-400' : 'text-danger-400'}`}>{p.pnl >= 0 ? '+' : ''}₹{p.pnl.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditing(p); setShowAdd(false); setForm(p); }} className="text-brand-400 text-xs mr-2">Edit</button>
                  <button onClick={() => del(p.id)} className="text-danger-400 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(editing || showAdd) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => { setEditing(null); setShowAdd(false); }}>
          <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">{editing ? 'Edit Position' : 'Add Position'}</h2>
            <div className="space-y-3">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="text-sm text-dark-200 mb-1 block">{f.label}</label>
                  <input type={f.type} value={(form[f.key as keyof Position] as string | number) || ''} onChange={(e) => setForm({ ...form, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })} className="input-field" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => { setEditing(null); setShowAdd(false); }} className="btn-secondary text-sm">Cancel</button>
              <button onClick={save} className="btn-primary text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HoldingsEditor({ holdings, onUpdate }: { holdings: Holding[]; onUpdate: () => Promise<void> }) {
  const [editing, setEditing] = useState<Holding | null>(null);
  const [form, setForm] = useState<Partial<Holding>>({});
  const [showAdd, setShowAdd] = useState(false);

  const save = async () => {
    const value = (form.quantity || 0) * (form.current_price || 0);
    const pnl = value - (form.quantity || 0) * (form.avg_price || 0);
    const pnlPercent = (form.avg_price || 0) > 0 ? (pnl / ((form.quantity || 0) * (form.avg_price || 0))) * 100 : 0;
    const data = { ...form, value, pnl, pnl_percent: pnlPercent };
    if (editing) {
      await supabase.from('holdings').update(data).eq('id', editing.id);
    } else {
      await supabase.from('holdings').insert({ ...data, display_order: holdings.length + 1 });
    }
    await onUpdate();
    setEditing(null);
    setShowAdd(false);
  };

  const del = async (id: string) => {
    await supabase.from('holdings').delete().eq('id', id);
    await onUpdate();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => { setShowAdd(true); setEditing(null); setForm({ asset_name: '', asset_symbol: '', quantity: 0, avg_price: 0, current_price: 0, allocation_percent: 0 }); }} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Holding
        </button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="text-dark-400 text-xs uppercase border-b border-dark-700">
            <th className="text-left px-4 py-2.5">Asset</th>
            <th className="text-right px-3 py-2.5 hidden sm:table-cell">Qty</th>
            <th className="text-right px-3 py-2.5 hidden sm:table-cell">Avg</th>
            <th className="text-right px-3 py-2.5">Price</th>
            <th className="text-right px-3 py-2.5">Value</th>
            <th className="text-right px-4 py-2.5">Actions</th>
          </tr></thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h.id} className="border-b border-dark-700/20 hover:bg-dark-700/30">
                <td className="px-4 py-3 text-white text-sm">{h.asset_name} <span className="text-dark-400 text-xs">({h.asset_symbol})</span></td>
                <td className="px-3 py-3 text-right text-dark-200 text-sm hidden sm:table-cell">{h.quantity}</td>
                <td className="px-3 py-3 text-right text-dark-200 text-sm hidden sm:table-cell">₹{h.avg_price.toLocaleString('en-IN')}</td>
                <td className="px-3 py-3 text-right text-white text-sm">₹{h.current_price.toLocaleString('en-IN')}</td>
                <td className="px-3 py-3 text-right text-white text-sm">₹{h.value.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditing(h); setShowAdd(false); setForm(h); }} className="text-brand-400 text-xs mr-2">Edit</button>
                  <button onClick={() => del(h.id)} className="text-danger-400 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(editing || showAdd) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => { setEditing(null); setShowAdd(false); }}>
          <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">{editing ? 'Edit Holding' : 'Add Holding'}</h2>
            <div className="space-y-3">
              <div><label className="text-sm text-dark-200 mb-1 block">Asset Name</label><input value={form.asset_name || ''} onChange={(e) => setForm({ ...form, asset_name: e.target.value })} className="input-field" /></div>
              <div><label className="text-sm text-dark-200 mb-1 block">Symbol</label><input value={form.asset_symbol || ''} onChange={(e) => setForm({ ...form, asset_symbol: e.target.value })} className="input-field" /></div>
              <div><label className="text-sm text-dark-200 mb-1 block">Quantity</label><input type="number" value={form.quantity || 0} onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
              <div><label className="text-sm text-dark-200 mb-1 block">Avg Price</label><input type="number" value={form.avg_price || 0} onChange={(e) => setForm({ ...form, avg_price: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
              <div><label className="text-sm text-dark-200 mb-1 block">Current Price</label><input type="number" value={form.current_price || 0} onChange={(e) => setForm({ ...form, current_price: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => { setEditing(null); setShowAdd(false); }} className="btn-secondary text-sm">Cancel</button>
              <button onClick={save} className="btn-primary text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersEditor({ orders, onUpdate }: { orders: DashboardOrder[]; onUpdate: () => Promise<void> }) {
  const del = async (id: string) => { await supabase.from('dashboard_orders').delete().eq('id', id); await onUpdate(); };
  const add = async () => {
    await supabase.from('dashboard_orders').insert({ instrument: 'NEWINR', product: 'Spot', order_type: 'Market', side: 'buy', quantity: 1, price: 100, status: 'completed', display_order: orders.length + 1 });
    await onUpdate();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={add} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Order</button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="text-dark-400 text-xs uppercase border-b border-dark-700">
            <th className="text-left px-4 py-2.5">Instrument</th>
            <th className="text-left px-3 py-2.5 hidden sm:table-cell">Type</th>
            <th className="text-left px-3 py-2.5">Side</th>
            <th className="text-right px-3 py-2.5">Qty</th>
            <th className="text-right px-3 py-2.5 hidden sm:table-cell">Price</th>
            <th className="text-right px-4 py-2.5">Actions</th>
          </tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-dark-700/20 hover:bg-dark-700/30">
                <td className="px-4 py-3 text-white text-sm">{o.instrument}</td>
                <td className="px-3 py-3 text-dark-300 text-sm hidden sm:table-cell">{o.order_type}</td>
                <td className="px-3 py-3"><span className={`text-xs capitalize ${o.side === 'buy' ? 'text-success-400' : 'text-danger-400'}`}>{o.side}</span></td>
                <td className="px-3 py-3 text-right text-white text-sm">{o.quantity}</td>
                <td className="px-3 py-3 text-right text-white text-sm hidden sm:table-cell">₹{o.price.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => del(o.id)} className="text-danger-400 text-xs">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransactionsEditor({ transactions, onUpdate }: { transactions: DashboardTransaction[]; onUpdate: () => Promise<void> }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<DashboardTransaction>>({});

  const del = async (id: string) => { await supabase.from('dashboard_transactions').delete().eq('id', id); await onUpdate(); };

  const add = async () => {
    await supabase.from('dashboard_transactions').insert({
      ...form,
      type: form.type || 'Buy',
      instrument: form.instrument || '',
      amount: form.amount || 0,
      status: form.status || 'completed',
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      display_order: transactions.length + 1,
    });
    await onUpdate();
    setShowAdd(false);
    setForm({});
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Transaction</button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="text-dark-400 text-xs uppercase border-b border-dark-700">
            <th className="text-left px-4 py-2.5">Type</th>
            <th className="text-left px-3 py-2.5">Instrument</th>
            <th className="text-right px-3 py-2.5">Amount</th>
            <th className="text-right px-3 py-2.5 hidden sm:table-cell">P&L</th>
            <th className="text-right px-4 py-2.5">Actions</th>
          </tr></thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-dark-700/20 hover:bg-dark-700/30">
                <td className="px-4 py-3"><span className={`badge text-xs ${t.type === 'Buy' ? 'bg-success-500/15 text-success-400' : t.type === 'Sell' ? 'bg-danger-500/15 text-danger-400' : 'bg-brand-500/15 text-brand-400'}`}>{t.type}</span></td>
                <td className="px-3 py-3 text-white text-sm">{t.instrument || '--'}</td>
                <td className="px-3 py-3 text-right text-white text-sm">₹{t.amount.toLocaleString('en-IN')}</td>
                <td className={`px-3 py-3 text-right text-sm hidden sm:table-cell ${t.pnl > 0 ? 'text-success-400' : t.pnl < 0 ? 'text-danger-400' : 'text-dark-400'}`}>{t.pnl !== 0 ? `${t.pnl > 0 ? '+' : ''}₹${t.pnl.toLocaleString('en-IN')}` : '--'}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => del(t.id)} className="text-danger-400 text-xs">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowAdd(false)}>
          <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">Add Transaction</h2>
            <div className="space-y-3">
              <div><label className="text-sm text-dark-200 mb-1 block">Type</label><select value={form.type || 'Buy'} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field"><option>Buy</option><option>Sell</option><option>Deposit</option><option>Withdraw</option><option>Transfer</option></select></div>
              <div><label className="text-sm text-dark-200 mb-1 block">Instrument</label><input value={form.instrument || ''} onChange={(e) => setForm({ ...form, instrument: e.target.value })} className="input-field" /></div>
              <div><label className="text-sm text-dark-200 mb-1 block">Amount</label><input type="number" value={form.amount || 0} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
              <div><label className="text-sm text-dark-200 mb-1 block">P&L</label><input type="number" value={form.pnl || 0} onChange={(e) => setForm({ ...form, pnl: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
              <div><label className="text-sm text-dark-200 mb-1 block">P&L %</label><input type="number" step="0.01" value={form.pnl_percent || 0} onChange={(e) => setForm({ ...form, pnl_percent: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={add} className="btn-primary text-sm">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
