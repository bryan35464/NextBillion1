import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  fetchLatestMessages,
  fetchMessagesAfter,
  fetchOlderMessages,
  markConversationRead,
  sendImageMessage,
  sendTextMessage,
} from '@/lib/supportApi';
import type { SupportMessage, SupportSenderRole } from '@/types/support';

interface UseConversationMessagesOptions {
  conversationId: string | null;
  customerId: string | null;
  viewerRole: SupportSenderRole;
}

function upsertMessages(list: SupportMessage[], incoming: SupportMessage[]): SupportMessage[] {
  if (incoming.length === 0) return list;
  const byId = new Map(list.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return Array.from(byId.values()).sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function useConversationMessages({
  conversationId,
  customerId,
  viewerRole,
}: UseConversationMessagesOptions) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<SupportMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setHasMore(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const catchUp = () => {
      const last = messagesRef.current[messagesRef.current.length - 1];
      if (!last) return;
      fetchMessagesAfter(conversationId, last.created_at)
        .then((rows) => {
          if (!cancelled) setMessages((prev) => upsertMessages(prev, rows));
        })
        .catch((err: Error) => {
          if (!cancelled) setError(err.message);
        });
    };

    fetchLatestMessages(conversationId)
      .then(({ rows, hasMore: more }) => {
        if (cancelled) return;
        setMessages((prev) => upsertMessages(prev, rows));
        setHasMore(more);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const channel = supabase
      .channel(`support-messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') return;
          setMessages((prev) => upsertMessages(prev, [payload.new as SupportMessage]));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') catchUp();
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const hasUnread = messages.some((m) => m.sender_role !== viewerRole && m.read_at === null);
    if (!hasUnread) return;

    markConversationRead(conversationId)
      .then(() => {
        const readAt = new Date().toISOString();
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_role !== viewerRole && m.read_at === null ? { ...m, read_at: readAt } : m
          )
        );
      })
      .catch((err: Error) => {
        console.error('Could not mark support messages as read:', err.message);
      });
  }, [conversationId, messages, viewerRole]);

  const loadOlder = useCallback(async () => {
    const oldest = messagesRef.current[0];
    if (!conversationId || !oldest || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const { rows, hasMore: more } = await fetchOlderMessages(conversationId, oldest.created_at);
      setMessages((prev) => upsertMessages(prev, rows));
      setHasMore(more);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load earlier messages.');
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, loadingOlder]);

  const sendText = useCallback(
    async (body: string) => {
      if (!conversationId) throw new Error('No active conversation.');
      const message = await sendTextMessage(conversationId, body);
      setMessages((prev) => upsertMessages(prev, [message]));
    },
    [conversationId]
  );

  const sendImage = useCallback(
    async (file: File) => {
      if (!conversationId || !customerId) throw new Error('No active conversation.');
      const message = await sendImageMessage(conversationId, customerId, file);
      setMessages((prev) => upsertMessages(prev, [message]));
    },
    [conversationId, customerId]
  );

  return { messages, loading, loadingOlder, hasMore, error, loadOlder, sendText, sendImage };
}
