import { useEffect, useMemo, useState } from 'react';
import { Inbox, MessageSquare, CheckCircle2, Users } from 'lucide-react';
import { AdminChatPanel } from '@/components/support/admin/AdminChatPanel';
import { ConversationList } from '@/components/support/admin/ConversationList';
import { useAdminConversations } from '@/hooks/useAdminConversations';
import {
  matchesInboxFilter,
  matchesSearch,
  type SupportInboxFilter,
} from '@/lib/supportConversationFilters';
import { sendAdminHeartbeat } from '@/lib/supportApi';
import type { SupportConversation } from '@/types/support';

const HEARTBEAT_INTERVAL_MS = 30_000;

const FILTER_VALUES: SupportInboxFilter[] = ['all', 'unread', 'active', 'resolved'];

export default function AdminSupport() {
  const { conversations, loading, error } = useAdminConversations();
  const [filter, setFilter] = useState<SupportInboxFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const beat = () => {
      sendAdminHeartbeat().catch(() => undefined);
    };
    beat();
    const interval = window.setInterval(beat, HEARTBEAT_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  const counts = useMemo(() => {
    const result = {} as Record<SupportInboxFilter, number>;
    for (const value of FILTER_VALUES) {
      result[value] = conversations.filter((c) => matchesInboxFilter(c, value)).length;
    }
    return result;
  }, [conversations]);

  const visible = useMemo(
    () => conversations.filter((c) => matchesInboxFilter(c, filter) && matchesSearch(c, search)),
    [conversations, filter, search]
  );

  const selected: SupportConversation | null = conversations.find((c) => c.id === selectedId) ?? null;
  const stats = [
    { label: 'Total', value: counts.all, icon: Users, tone: 'text-brand-300' },
    { label: 'Unread', value: counts.unread, icon: Inbox, tone: 'text-accent-300' },
    { label: 'Active', value: counts.active, icon: MessageSquare, tone: 'text-success-300' },
    { label: 'Resolved', value: counts.resolved, icon: CheckCircle2, tone: 'text-dark-200' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Customer Support</h1>
        <p className="mt-1 text-sm text-dark-400">Replies appear to customers as Anvi | Customer Support.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-dark-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-dark-50">{stat.value}</p>
            </div>
            <stat.icon className={`h-5 w-5 ${stat.tone}`} />
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-300">
          Conversations could not be loaded: {error}
        </p>
      )}

      <div className="card grid h-[calc(100dvh-22rem)] min-h-[480px] grid-cols-1 overflow-hidden p-0 lg:grid-cols-[360px_1fr]">
        <div className={`${selected ? 'hidden lg:block' : 'block'} min-h-0 border-dark-700 lg:border-r`}>
          <ConversationList
            conversations={visible}
            selectedId={selectedId}
            onSelect={setSelectedId}
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            counts={counts}
            loading={loading}
          />
        </div>

        <div className={`${selected ? 'block' : 'hidden lg:flex'} min-h-0 lg:flex-col`}>
          {selected ? (
            <AdminChatPanel key={selected.id} conversation={selected} onBack={() => setSelectedId(null)} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
              <MessageSquare className="h-8 w-8 text-dark-500" />
              <p className="text-sm text-dark-300">Select a conversation to view its messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
