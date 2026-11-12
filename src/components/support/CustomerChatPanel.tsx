import { Clock } from 'lucide-react';
import { ChatComposer } from '@/components/support/ChatComposer';
import { ChatThread } from '@/components/support/ChatThread';
import { useConversationMessages } from '@/hooks/useConversationMessages';
import { ANVI_DISPLAY_NAME } from '@/lib/supportIdentity';
import type { SupportConversation } from '@/types/support';

interface CustomerChatPanelProps {
  conversation: SupportConversation;
  isOnline: boolean;
}

export function CustomerChatPanel({ conversation, isOnline }: CustomerChatPanelProps) {
  const { messages, loading, loadingOlder, hasMore, error, loadOlder, sendText, sendImage } =
    useConversationMessages({
      conversationId: conversation.id,
      customerId: conversation.customer_id,
      viewerRole: 'customer',
    });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-dark-700 bg-dark-900 px-4 py-3">
        <div className="relative">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">A</span>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-dark-900 ${isOnline ? 'bg-success-400' : 'bg-dark-500'}`}
            aria-hidden
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-dark-50">{ANVI_DISPLAY_NAME}</p>
          <p className="text-xs text-dark-400">{isOnline ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      {!isOnline && (
        <div className="flex items-start gap-2 border-b border-dark-700 bg-dark-800/70 px-4 py-2.5 text-xs leading-relaxed text-dark-300">
          <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-dark-400" />
          Our support team is away right now. Send your message and we will reply as soon as we are back.
        </div>
      )}

      <ChatThread
        messages={messages}
        viewerRole="customer"
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
