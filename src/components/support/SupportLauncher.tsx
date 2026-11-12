import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Loader2, LogIn, MessageCircle, X } from 'lucide-react';
import { CustomerChatPanel } from '@/components/support/CustomerChatPanel';
import { CustomerIntroForm } from '@/components/support/CustomerIntroForm';
import { useAuth } from '@/context/AuthContext';
import { useSupportAvailability } from '@/hooks/useSupportAvailability';
import { supabase } from '@/lib/supabase';
import { fetchOwnConversation } from '@/lib/supportApi';
import { ANVI_DISPLAY_NAME } from '@/lib/supportIdentity';
import type { SupportConversation } from '@/types/support';

export default function SupportLauncher() {
  const location = useLocation();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { isOnline } = useSupportAvailability();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const customerId = user?.id ?? null;
  const hidden = location.pathname.startsWith('/admin') || authLoading || isAdmin;

  useEffect(() => {
    if (!customerId) {
      setConversation(null);
      return;
    }

    let cancelled = false;
    setLoadingConversation(true);
    setLoadError(null);

    fetchOwnConversation(customerId)
      .then((row) => {
        if (!cancelled) setConversation(row);
      })
      .catch(() => {
        if (!cancelled) setLoadError('We could not load your chat. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoadingConversation(false);
      });

    const channel = supabase
      .channel(`support-customer-conversation-${customerId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_conversations', filter: `customer_id=eq.${customerId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setConversation(null);
            return;
          }
          setConversation(payload.new as SupportConversation);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [customerId]);

  if (hidden) return null;

  const unreadCount = conversation?.customer_unread_count ?? 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section
          aria-label={`${ANVI_DISPLAY_NAME} chat`}
          className="animate-slide-up flex h-[min(620px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-dark-700 bg-dark-900 shadow-2xl shadow-black/40 sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-dark-700 px-4 py-3">
            <span className="text-sm font-semibold text-dark-50">Live Chat</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-dark-400 transition-colors hover:bg-dark-800 hover:text-dark-100"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!user && (
            <div className="animate-fade-in flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600/20 text-brand-300">
                <LogIn className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-dark-50">Sign in to chat with us</h3>
                <p className="mt-1 text-sm leading-relaxed text-dark-400">
                  Live support is available to signed-in customers only.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <Link to="/login" className="btn-primary text-center">Sign in</Link>
                <Link to="/signup" className="btn-secondary text-center">Create account</Link>
              </div>
            </div>
          )}

          {user && loadingConversation && (
            <div className="flex flex-1 items-center justify-center text-dark-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          {user && !loadingConversation && loadError && (
            <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-danger-300">{loadError}</div>
          )}

          {user && !loadingConversation && !loadError && !conversation && customerId && (
            <CustomerIntroForm customerId={customerId} onCreated={setConversation} />
          )}

          {user && !loadingConversation && !loadError && conversation && (
            <CustomerChatPanel conversation={conversation} isOnline={isOnline} />
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group relative flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 active:scale-95"
        aria-expanded={open}
      >
        <MessageCircle className="h-5 w-5" />
        <span>Live Chat</span>
        {unreadCount > 0 && !open && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 px-1 text-[11px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
