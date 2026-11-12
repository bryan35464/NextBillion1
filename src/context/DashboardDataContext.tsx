import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { DashboardConfig, Position, Holding, DashboardOrder, DashboardTransaction } from '@/types/dashboard';

interface DashboardDataContextValue {
  config: DashboardConfig | null;
  positions: Position[];
  holdings: Holding[];
  orders: DashboardOrder[];
  transactions: DashboardTransaction[];
  loading: boolean;
  refresh: () => Promise<void>;
  updateConfig: (data: Partial<DashboardConfig>) => Promise<void>;
}

const DashboardDataContext = createContext<DashboardDataContextValue | undefined>(undefined);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [cfgRes, posRes, holdRes, ordRes, txRes] = await Promise.all([
      supabase.from('dashboard_config').select('*').maybeSingle(),
      supabase.from('positions').select('*').order('display_order', { ascending: true }),
      supabase.from('holdings').select('*').order('display_order', { ascending: true }),
      supabase.from('dashboard_orders').select('*').order('display_order', { ascending: true }),
      supabase.from('dashboard_transactions').select('*').order('display_order', { ascending: true }),
    ]);
    if (cfgRes.data) setConfig(cfgRes.data as DashboardConfig);
    if (posRes.data) setPositions(posRes.data as Position[]);
    if (holdRes.data) setHoldings(holdRes.data as Holding[]);
    if (ordRes.data) setOrders(ordRes.data as DashboardOrder[]);
    if (txRes.data) setTransactions(txRes.data as DashboardTransaction[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const refresh = async () => {
    await fetchAll();
  };

  const updateConfig = async (data: Partial<DashboardConfig>) => {
    if (!config) return;
    const { error } = await supabase.from('dashboard_config').update({ ...data, updated_at: new Date().toISOString() }).eq('id', config.id);
    if (!error) {
      setConfig({ ...config, ...data });
    }
  };

  return (
    <DashboardDataContext.Provider value={{ config, positions, holdings, orders, transactions, loading, refresh, updateConfig }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error('useDashboardData must be used within DashboardDataProvider');
  return ctx;
}
