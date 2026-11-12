import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { FAQ } from '@/types';
import { Plus, Save, Trash2, Edit3, X, Loader2, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<FAQ>>({});
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    supabase.from('faqs').select('*').order('display_order', { ascending: true }).then(({ data }) => {
      if (data) setFaqs(data as FAQ[]);
    });
  };

  useEffect(() => { fetch(); }, []);

  const startAdd = () => {
    setShowAdd(true);
    setEditing(null);
    setForm({ question: '', answer: '', category: 'General', display_order: faqs.length + 1, is_active: true });
  };

  const startEdit = (faq: FAQ) => {
    setEditing(faq);
    setShowAdd(false);
    setForm(faq);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editing) {
      await supabase.from('faqs').update(form).eq('id', editing.id);
    } else {
      await supabase.from('faqs').insert(form);
    }
    fetch();
    setSaving(false);
    setEditing(null);
    setShowAdd(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('faqs').delete().eq('id', id);
    fetch();
  };

  const moveOrder = async (faq: FAQ, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? faq.display_order - 1 : faq.display_order + 1;
    await supabase.from('faqs').update({ display_order: newOrder }).eq('id', faq.id);
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">FAQ Management</h1>
          <p className="text-dark-400 mt-1">Manage frequently asked questions</p>
        </div>
        <button onClick={startAdd} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={faq.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-brand-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-white font-medium">{faq.question}</h3>
                    <span className="badge bg-dark-600 text-dark-200">{faq.category}</span>
                    {!faq.is_active && <span className="badge bg-dark-600 text-dark-400">Inactive</span>}
                  </div>
                  <p className="text-dark-400 text-sm">{faq.answer}</p>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0 flex-col sm:flex-row">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveOrder(faq, 'up')} disabled={idx === 0} className="p-0.5 rounded hover:bg-dark-700 text-dark-400 disabled:opacity-30">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveOrder(faq, 'down')} disabled={idx === faqs.length - 1} className="p-0.5 rounded hover:bg-dark-700 text-dark-400 disabled:opacity-30">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => startEdit(faq)} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-300 hover:text-brand-400 transition-all">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(faq.id)} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-300 hover:text-danger-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {faqs.length === 0 && <div className="card p-12 text-center text-dark-400">No FAQs yet</div>}
      </div>

      {(editing || showAdd) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => { setEditing(null); setShowAdd(false); }}>
          <div className="card p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editing ? 'Edit FAQ' : 'Add FAQ'}</h2>
              <button onClick={() => { setEditing(null); setShowAdd(false); }} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Question</label>
                <input value={form.question || ''} onChange={(e) => setForm({ ...form, question: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Answer</label>
                <textarea value={form.answer || ''} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4} className="input-field resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-dark-200 mb-1.5 block">Category</label>
                  <input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-dark-200 mb-1.5 block">Display Order</label>
                  <input type="number" value={form.display_order || 0} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className="input-field" />
                </div>
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
