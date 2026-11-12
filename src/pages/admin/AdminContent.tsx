import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/types';
import { Save, Eye, RotateCcw, Loader2, Check, AlertCircle } from 'lucide-react';

export default function AdminContent() {
  const { user, profile } = useAuth();
  const { settings, refreshSettings } = useSettings();
  const [form, setForm] = useState<Partial<SiteSettings>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const update = (key: keyof SiteSettings, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const logAudit = async (action: string, previous: Record<string, unknown>, next: Record<string, unknown>) => {
    if (!user) return;
    await supabase.from('audit_logs').insert({
      admin_email: user.email || 'admin',
      action,
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
      await logAudit('update', settings as unknown as Record<string, unknown>, form as unknown as Record<string, unknown>);
      await refreshSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const handleReset = () => {
    if (settings) setForm(settings);
  };

  const sections = [
    {
      title: 'Homepage',
      icon: '🏠',
      fields: [
        { key: 'hero_headline', label: 'Homepage Headline', type: 'text' },
        { key: 'hero_subtitle', label: 'Homepage Subtitle', type: 'textarea' },
        { key: 'hero_cta_text', label: 'Primary Button Text', type: 'text' },
        { key: 'hero_secondary_cta', label: 'Secondary Button Text', type: 'text' },
        { key: 'hero_image_url', label: 'Hero Image URL', type: 'text' },
      ],
    },
    {
      title: 'Branding',
      icon: '🎨',
      fields: [
        { key: 'site_name', label: 'Website Name', type: 'text' },
        { key: 'logo_url', label: 'Logo URL', type: 'text' },
        { key: 'favicon_url', label: 'Favicon URL', type: 'text' },
        { key: 'primary_color', label: 'Primary Color', type: 'text' },
        { key: 'accent_color', label: 'Accent Color', type: 'text' },
      ],
    },
    {
      title: 'Statistics',
      icon: '📊',
      fields: [
        { key: 'total_users', label: 'Homepage Users', type: 'number' },
        { key: 'trading_volume', label: 'Trading Volume', type: 'number' },
        { key: 'supported_countries', label: 'Supported Countries', type: 'number' },
        { key: 'supported_assets', label: 'Supported Assets', type: 'number' },
      ],
    },
    {
      title: 'Fees & Limits',
      icon: '💰',
      fields: [
        { key: 'platform_fee', label: 'Platform Fee (%)', type: 'number' },
        { key: 'trading_fee_taker', label: 'Taker Fee (%)', type: 'number' },
        { key: 'trading_fee_maker', label: 'Maker Fee (%)', type: 'number' },
        { key: 'min_deposit', label: 'Minimum Deposit', type: 'number' },
        { key: 'max_deposit', label: 'Maximum Deposit', type: 'number' },
        { key: 'min_withdrawal', label: 'Minimum Withdrawal', type: 'number' },
        { key: 'max_withdrawal', label: 'Maximum Withdrawal', type: 'number' },
      ],
    },
    {
      title: 'Contact & Social',
      icon: '📧',
      fields: [
        { key: 'contact_email', label: 'Contact Email', type: 'text' },
        { key: 'contact_phone', label: 'Contact Phone', type: 'text' },
        { key: 'contact_address', label: 'Contact Address', type: 'text' },
        { key: 'twitter_url', label: 'Twitter URL', type: 'text' },
        { key: 'telegram_url', label: 'Telegram URL', type: 'text' },
        { key: 'linkedin_url', label: 'LinkedIn URL', type: 'text' },
        { key: 'facebook_url', label: 'Facebook URL', type: 'text' },
      ],
    },
    {
      title: 'Footer & Legal',
      icon: '📄',
      fields: [
        { key: 'footer_text', label: 'Footer Text', type: 'text' },
        { key: 'about_content', label: 'About Us', type: 'textarea' },
        { key: 'terms_content', label: 'Terms & Conditions', type: 'textarea' },
        { key: 'privacy_content', label: 'Privacy Policy', type: 'textarea' },
      ],
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Management</h1>
          <p className="text-dark-400 mt-1">Edit all public-facing content and settings</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreviewMode(!previewMode)} className="btn-secondary text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" /> {previewMode ? 'Exit Preview' : 'Preview'}
          </button>
          <button onClick={handleReset} className="btn-secondary text-sm flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-danger-500/10 border border-danger-500/30 rounded-xl px-4 py-3 text-sm text-danger-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {previewMode ? (
        <div className="card p-8">
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-white mb-4">{form.hero_headline || 'Your headline'}</h2>
            <p className="text-dark-300 text-lg max-w-2xl mx-auto">{form.hero_subtitle || 'Your subtitle'}</p>
            <div className="flex gap-4 justify-center mt-6">
              <button className="btn-primary">{form.hero_cta_text || 'Start Trading'}</button>
              <button className="btn-secondary">{form.hero_secondary_cta || 'Explore Markets'}</button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-white">{form.total_users?.toLocaleString() || '0'}</p>
              <p className="text-xs text-dark-400">Active Users</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-white">${(form.trading_volume || 0) / 1e6}M</p>
              <p className="text-xs text-dark-400">Volume</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-white">{form.supported_countries}+</p>
              <p className="text-xs text-dark-400">Countries</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-white">{form.supported_assets}+</p>
              <p className="text-xs text-dark-400">Assets</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">{section.title}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'col-span-2' : ''}>
                    <label className="text-sm text-dark-200 mb-1.5 block">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={(form[field.key as keyof SiteSettings] as string) || ''}
                        onChange={(e) => update(field.key as keyof SiteSettings, e.target.value)}
                        rows={4}
                        className="input-field resize-y"
                      />
                    ) : field.type === 'number' ? (
                      <input
                        type="number"
                        value={(form[field.key as keyof SiteSettings] as number) || 0}
                        onChange={(e) => update(field.key as keyof SiteSettings, parseFloat(e.target.value) || 0)}
                        className="input-field"
                      />
                    ) : (
                      <input
                        type="text"
                        value={(form[field.key as keyof SiteSettings] as string) || ''}
                        onChange={(e) => update(field.key as keyof SiteSettings, e.target.value)}
                        className="input-field"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Mode toggles */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Platform Modes</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Sandbox Mode</p>
                  <p className="text-dark-400 text-xs">When enabled, all transactions are clearly labeled as simulated</p>
                </div>
                <button
                  onClick={() => update('demo_mode', !form.demo_mode)}
                  className={`relative w-14 h-7 rounded-full transition-all ${form.demo_mode ? 'bg-amber-500' : 'bg-dark-600'}`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${form.demo_mode ? 'left-7' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Maintenance Mode</p>
                  <p className="text-dark-400 text-xs">When enabled, the site shows a maintenance message</p>
                </div>
                <button
                  onClick={() => update('maintenance_mode', !form.maintenance_mode)}
                  className={`relative w-14 h-7 rounded-full transition-all ${form.maintenance_mode ? 'bg-danger-500' : 'bg-dark-600'}`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${form.maintenance_mode ? 'left-7' : 'left-0.5'}`} />
                </button>
              </div>
              {form.maintenance_mode && (
                <div>
                  <label className="text-sm text-dark-200 mb-1.5 block">Maintenance Message</label>
                  <input
                    type="text"
                    value={form.maintenance_message || ''}
                    onChange={(e) => update('maintenance_message', e.target.value)}
                    className="input-field"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button onClick={handleReset} className="btn-secondary text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save All Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
