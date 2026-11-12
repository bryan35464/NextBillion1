import { useState } from 'react';
import { CheckCircle2, Loader2, Phone, RotateCcw } from 'lucide-react';
import { ChatComposer } from '@/components/support/ChatComposer';
import { ChatThread } from '@/components/support/ChatThread';
import { useConversationMessages } from '@/hooks/useConversationMessages';
import { setConversationStatus } from '@/lib/supportApi';
import type { SupportConversation, SupportConversationStatus } from '@/types/support';

interface AdminChatPanelProps {
  conversation: SupportConversation;
  onBack?: () => void;
}

export function AdminChatPanel({ conversation, onBack }: AdminChatPanelProps) {
  const { messages, loading, loadingOlder, hasMore, error, loadOlder, sendText, sendImage } =
    useConversationMessages({
      conversationId: conversation.id,
      customerId: conversation.customer_id,
      viewerRole: 'admin',
    });
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const isResolved = conversation.status === 'resolved';
  const nextStatus: SupportConversationStatus = isResolved ? 'open' : 'resolved';

  const toggleStatus = async () => {
    setStatusBusy(true);
    setStatusError(null);
    try {
      await setConversationStatus(conversation.id, nextStatus);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Could not update this conversation.');
    } finally {
      setStatusBusy(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-dark-700 bg-dark-900 px-4 py-3">
        {onBack && (
          <button type="button" onClick={onBack} className="btn-secondary px-3 py-1.5 text-xs lg:hidden">
            Back
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-dark-50">{conversation.customer_name}</p>
          <a href={`tel:${conversation.customer_phone}`} className="inline-flex items-center gap-1 text-xs text-dark-400 transition-colors hover:text-brand-300">
            <Phone className="h-3 w-3" /> {conversation.customer_phone}
          </a>
        </div>
        <span className={`badge ${isResolved ? 'badge-success' : 'badge-sandbox'}`}>
          {isResolved ? 'Resolved' : 'Active'}
        </span>
        <button
          type="button"
          onClick={() => void toggleStatus()}
          disabled={statusBusy}
          className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
        >
          {statusBusy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isResolved ? (
            <RotateCcw className="h-3.5 w-3.5" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          {isResolved ? 'Reopen' : 'Resolve'}
        </button>
      </div>

      {statusError && (
        <p role="alert" className="border-b border-danger-500/30 bg-danger-500/10 px-4 py-2 text-xs text-danger-300">{statusError}</p>
      )}

      <ChatThread
        messages={messages}
        viewerRole="admin"
        loading={loading}
        loadingOlder={loadingOlder}
        hasMore={hasMore}
        error={error}
        onLoadOlder={() => void loadOlder()}
      />
      <ChatComposer onSendText={sendText} onSendImage={sendImage} />
    </div>
  );
}
