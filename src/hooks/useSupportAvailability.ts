import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchAvailability, isSupportAdminOnline } from '@/lib/supportApi';
import type { SupportAvailability } from '@/types/support';

const STALENESS_TICK_MS = 30_000;

export function useSupportAvailability() {
  const [availability, setAvailability] = useState<SupportAvailability | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchAvailability()
      .then((row) => {
        if (!cancelled) setAvailability(row);
      })
      .catch(() => undefined);

    const channel = supabase
      .channel('support-availability')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'support_availability' },
        (payload) => setAvailability(payload.new as SupportAvailability)
      )
      .subscribe();

    const interval = window.setInterval(() => setTick((t) => t + 1), STALENESS_TICK_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return { availability, isOnline: isSupportAdminOnline(availability) };
}
