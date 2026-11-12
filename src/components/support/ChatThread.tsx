import { useEffect, useRef } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import { MessageBubble } from '@/components/support/MessageBubble';
import { ANVI_DISPLAY_NAME, ANVI_WELCOME_MESSAGE } from '@/lib/supportIdentity';
import type { SupportMessage, SupportSenderRole } from '@/types/support';

interface ChatThreadProps {
  messages: SupportMessage[];
  viewerRole: SupportSenderRole;
  loading: boolean;
  loadingOlder: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadOlder: () => void;
}

export function ChatThread({ messages, viewerRole, loading, loadingOlder, hasMore, error, onLoadOlder }: ChatThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const lastId = messages[messages.length - 1]?.id;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [lastId]);

  return (
    <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-4">
      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadOlder}
            disabled={loadingOlder}
            className="rounded-full border border-dark-700 px-3 py-1 text-xs text-dark-300 transition-colors hover:border-brand-500 hover:text-brand-300 disabled:opacity-50"
          >
            {loadingOlder ? 'Loading...' : 'Load earlier messages'}
          </button>
        </div>
      )}

      {loading && messages.length === 0 && (
        <div className="flex justify-center py-8 text-dark-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-danger-500/30 bg-danger-500/10 px-3 py-2 text-center text-xs text-danger-300">
          {error}
        </p>
      )}

      {viewerRole === 'customer' && !loading && messages.length === 0 && !error && (
        <div className="animate-fade-in flex flex-col items-center gap-3 rounded-2xl border border-dark-700 bg-dark-800/60 px-5 py-6 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">A</span>
          <div>
            <p className="text-xs font-medium text-dark-400">{ANVI_DISPLAY_NAME}</p>
            <p className="mt-2 text-sm leading-relaxed text-dark-100">{ANVI_WELCOME_MESSAGE}</p>
          </div>
          <MessageCircle className="h-4 w-4 text-dark-500" aria-hidden />
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} viewerRole={viewerRole} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
