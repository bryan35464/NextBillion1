import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Announcement } from '@/types';
import { Plus, Save, Trash2, Edit3, X, Loader2, Megaphone } from 'lucide-react';

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<Announcement>>({});
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    supabase.from('announcements').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setItems(data as Announcement[]);
    });
  };

  useEffect(() => { fetch(); }, []);

  const startAdd = () => {
    setShowAdd(true);
    setEditing(null);
    setForm({ title: '', content: '', type: 'info', is_active: true });
  };

  const startEdit = (item: Announcement) => {
    setEditing(item);
    setShowAdd(false);
    setForm(item);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editing) {
      await supabase.from('announcements').update(form).eq('id', editing.id);
    } else {
      await supabase.from('announcements').insert(form);
    }
    fetch();
    setSaving(false);
    setEditing(null);
    setShowAdd(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    fetch();
  };

  const toggleActive = async (item: Announcement) => {
    await supabase.from('announcements').update({ is_active: !item.is_active }).eq('id', item.id);
    fetch();
  };

  const typeColors: Record<string, string> = {
    info: 'bg-brand-500/20 text-brand-400',
    success: 'bg-success-500/20 text-success-400',
    warning: 'bg-amber-500/20 text-amber-400',
    error: 'bg-danger-500/20 text-danger-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Announcements</h1>
          <p className="text-dark-400 mt-1">Manage platform-wide announcements</p>
        </div>
        <button onClick={startAdd} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="card p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center flex-shrink-0">
                <Megaphone className="w-5 h-5 text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-white font-medium">{item.title}</h3>
                  <span className={`badge capitalize ${typeColors[item.type] || typeColors.info}`}>{item.type}</span>
                  <span className={`badge ${item.is_active ? 'badge-success' : 'bg-dark-600 text-dark-200'}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-dark-400 text-sm">{item.content}</p>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => toggleActive(item)} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-300 hover:text-success-400 transition-all text-xs">
                {item.is_active ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-300 hover:text-brand-400 transition-all">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-300 hover:text-danger-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="card p-12 text-center text-dark-400">No announcements yet</div>
        )}
      </div>

      {(editing || showAdd) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => { setEditing(null); setShowAdd(false); }}>
          <div className="card p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editing ? 'Edit Announcement' : 'New Announcement'}</h2>
              <button onClick={() => { setEditing(null); setShowAdd(false); }} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Title</label>
                <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Content</label>
                <textarea value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} className="input-field resize-y" />
              </div>
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Type</label>
                <select value={form.type || 'info'} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-dark-200 cursor-pointer">
                <input type="checkbox" checked={form.is_active || false} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-dark-600 bg-dark-800 text-brand-500" />
                Active
              </label>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => { setEditing(null); setShowAdd(false); }} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
