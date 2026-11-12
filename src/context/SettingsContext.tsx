import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { SiteSettings, Asset, Announcement } from '@/types';

interface SettingsContextValue {
  settings: SiteSettings | null;
  assets: Asset[];
  announcements: Announcement[];
  loading: boolean;
  refreshSettings: () => Promise<void>;
  refreshAssets: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').maybeSingle();
    if (data) setSettings(data as SiteSettings);
  };

  const fetchAssets = async () => {
    const { data } = await supabase
      .from('assets')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) setAssets(data as Asset[]);
  };

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) setAnnouncements(data as Announcement[]);
  };

  const refreshAll = async () => {
    await Promise.all([fetchSettings(), fetchAssets(), fetchAnnouncements()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();

    const settingsChannel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        () => fetchSettings()
      )
      .subscribe();

    const assetsChannel = supabase
      .channel('assets_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assets' },
        () => fetchAssets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(assetsChannel);
    };
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        assets,
        announcements,
        loading,
        refreshSettings: fetchSettings,
        refreshAssets: fetchAssets,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
