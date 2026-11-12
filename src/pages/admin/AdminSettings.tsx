import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/types';
import { Save, Loader2, Check, RotateCcw, Settings as SettingsIcon, AlertCircle } from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();
  const { settings, refreshSettings } = useSettings();
  const [form, setForm] = useState<Partial<SiteSettings>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [confirmSave, setConfirmSave] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const update = (key: keyof SiteSettings, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const logAudit = async (previous: Record<string, unknown>, next: Record<string, unknown>) => {
    if (!user) return;
    await supabase.from('audit_logs').insert({
      admin_email: user.email || 'admin',
      action: 'update',
      entity: 'site_settings',
      entity_id: settings?.id || '',
      previous_value: previous,
      new_value: next,
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    const { error: err } = await supabase.from('site_settings').update(form).eq('id', settings.id);
    if (err) {
      setError(err.message);
    } else {
      await logAudit(settings as unknown as Record<string, unknown>, form as unknown as Record<string, unknown>);
      await refreshSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
    setConfirmSave(false);
  };

  const handleReset = () => {
    if (settings) setForm(settings);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Website Settings</h1>
          <p className="text-dark-400 mt-1">Configure all platform-wide settings</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="btn-secondary text-sm flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={() => setConfirmSave(true)} disabled={saving} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-danger-500/10 border border-danger-500/30 rounded-xl px-4 py-3 text-sm text-danger-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Quick Settings Grid */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-brand-400" /> Quick Configuration
          </h2>
          <p className="text-dark-400 text-sm mb-4">These values directly update the website. Every change is logged in the audit trail.</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Site Name</label>
              <input value={form.site_name || ''} onChange={(e) => update('site_name', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.primary_color || '#3b82f6'} onChange={(e) => update('primary_color', e.target.value)} className="w-12 h-10 rounded-lg border border-dark-600 bg-dark-800 cursor-pointer" />
                <input value={form.primary_color || ''} onChange={(e) => update('primary_color', e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Accent Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.accent_color || '#22d3ee'} onChange={(e) => update('accent_color', e.target.value)} className="w-12 h-10 rounded-lg border border-dark-600 bg-dark-800 cursor-pointer" />
                <input value={form.accent_color || ''} onChange={(e) => update('accent_color', e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Logo URL</label>
              <input value={form.logo_url || ''} onChange={(e) => update('logo_url', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Favicon URL</label>
              <input value={form.favicon_url || ''} onChange={(e) => update('favicon_url', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        {/* Homepage Stats */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Homepage Statistics</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Homepage Users</label>
              <input type="number" value={form.total_users || 0} onChange={(e) => update('total_users', parseInt(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Trading Volume ($)</label>
              <input type="number" value={form.trading_volume || 0} onChange={(e) => update('trading_volume', parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Supported Countries</label>
              <input type="number" value={form.supported_countries || 0} onChange={(e) => update('supported_countries', parseInt(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Supported Assets</label>
              <input type="number" value={form.supported_assets || 0} onChange={(e) => update('supported_assets', parseInt(e.target.value) || 0)} className="input-field" />
            </div>
          </div>
        </div>

        {/* Homepage Content */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Homepage Content</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Homepage Headline</label>
              <input value={form.hero_headline || ''} onChange={(e) => update('hero_headline', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Homepage Subtitle</label>
              <textarea value={form.hero_subtitle || ''} onChange={(e) => update('hero_subtitle', e.target.value)} rows={2} className="input-field resize-y" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Primary Button Text</label>
                <input value={form.hero_cta_text || ''} onChange={(e) => update('hero_cta_text', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Secondary Button Text</label>
                <input value={form.hero_secondary_cta || ''} onChange={(e) => update('hero_secondary_cta', e.target.value)} className="input-field" />
              </div>
            </div>
          </div>
        </div>

        {/* Fees */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Trading Fees & Limits</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Platform Fee (%)</label>
              <input type="number" step="0.01" value={form.platform_fee || 0} onChange={(e) => update('platform_fee', parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Taker Fee (%)</label>
              <input type="number" step="0.01" value={form.trading_fee_taker || 0} onChange={(e) => update('trading_fee_taker', parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Maker Fee (%)</label>
              <input type="number" step="0.01" value={form.trading_fee_maker || 0} onChange={(e) => update('trading_fee_maker', parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
            <div></div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Min Deposit ($)</label>
              <input type="number" value={form.min_deposit || 0} onChange={(e) => update('min_deposit', parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Max Deposit ($)</label>
              <input type="number" value={form.max_deposit || 0} onChange={(e) => update('max_deposit', parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Min Withdrawal ($)</label>
              <input type="number" value={form.min_withdrawal || 0} onChange={(e) => update('min_withdrawal', parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Max Withdrawal ($)</label>
              <input type="number" value={form.max_withdrawal || 0} onChange={(e) => update('max_withdrawal', parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
          </div>
        </div>

        {/* Platform Modes */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Platform Modes</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Sandbox Mode</p>
                <p className="text-dark-400 text-xs">Labels all transactions as simulated</p>
              </div>
              <button onClick={() => update('demo_mode', !form.demo_mode)} className={`relative w-14 h-7 rounded-full transition-all ${form.demo_mode ? 'bg-amber-500' : 'bg-dark-600'}`}>
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${form.demo_mode ? 'left-7' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Maintenance Mode</p>
                <p className="text-dark-400 text-xs">Shows maintenance banner on the public site</p>
              </div>
              <button onClick={() => update('maintenance_mode', !form.maintenance_mode)} className={`relative w-14 h-7 rounded-full transition-all ${form.maintenance_mode ? 'bg-danger-500' : 'bg-dark-600'}`}>
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${form.maintenance_mode ? 'left-7' : 'left-0.5'}`} />
              </button>
            </div>
            {form.maintenance_mode && (
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Maintenance Message</label>
                <input value={form.maintenance_message || ''} onChange={(e) => update('maintenance_message', e.target.value)} className="input-field" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Confirmation */}
      {confirmSave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setConfirmSave(false)}>
          <div className="card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Confirm Changes?</h3>
            <p className="text-dark-400 text-sm mb-6">These changes will immediately update the website. All modifications will be logged in the audit trail.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmSave(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} className="btn-primary text-sm">Confirm & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
