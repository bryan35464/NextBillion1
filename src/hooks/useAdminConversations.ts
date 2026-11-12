import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { listConversations } from '@/lib/supportApi';
import type { SupportConversation } from '@/types/support';

function sortByLastMessage(list: SupportConversation[]): SupportConversation[] {
  return [...list].sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
}

export function useAdminConversations() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listConversations()
      .then((rows) => {
        if (!cancelled) setConversations(rows);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const channel = supabase
      .channel('support-admin-conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_conversations' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const removedId = (payload.old as { id: string }).id;
            setConversations((prev) => prev.filter((c) => c.id !== removedId));
            return;
          }
          const incoming = payload.new as SupportConversation;
          setConversations((prev) => {
            const exists = prev.some((c) => c.id === incoming.id);
            const next = exists ? prev.map((c) => (c.id === incoming.id ? incoming : c)) : [...prev, incoming];
            return sortByLastMessage(next);
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          listConversations()
            .then((rows) => {
              if (!cancelled) setConversations(rows);
            })
            .catch(() => undefined);
        }
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { conversations, loading, error };
}
