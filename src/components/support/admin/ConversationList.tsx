import { Search } from 'lucide-react';
import { timeAgo } from '@/lib/format';
import { isNewConversation, type SupportInboxFilter } from '@/lib/supportConversationFilters';
import type { SupportConversation } from '@/types/support';

interface ConversationListProps {
  conversations: SupportConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  filter: SupportInboxFilter;
  onFilterChange: (filter: SupportInboxFilter) => void;
  counts: Record<SupportInboxFilter, number>;
  loading: boolean;
}

const FILTERS: { value: SupportInboxFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'active', label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
];

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  counts,
  loading,
}: ConversationListProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 border-b border-dark-700 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name or phone"
            className="input-field pl-9"
            aria-label="Search conversations"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-dark-800 p-1" role="tablist" aria-label="Filter conversations">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={filter === item.value}
              onClick={() => onFilterChange(item.value)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                filter === item.value ? 'bg-brand-600 text-white' : 'text-dark-300 hover:text-dark-100'
              }`}
            >
              {item.label} <span className="opacity-70">{counts[item.value]}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="no-scrollbar flex-1 divide-y divide-dark-800 overflow-y-auto">
        {loading && conversations.length === 0 && (
          <li className="p-6 text-center text-sm text-dark-400">Loading conversations...</li>
        )}
        {!loading && conversations.length === 0 && (
          <li className="p-6 text-center text-sm text-dark-400">No conversations match this view.</li>
        )}
        {conversations.map((conversation) => {
          const isSelected = conversation.id === selectedId;
          const initial = conversation.customer_name.trim().charAt(0).toUpperCase() || '?';
          return (
            <li key={conversation.id}>
              <button
                type="button"
                onClick={() => onSelect(conversation.id)}
                className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 ${
                  isSelected ? 'bg-brand-600/10' : 'hover:bg-dark-800/70'
                }`}
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-dark-700 text-sm font-semibold text-dark-100">
                  {initial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-dark-50">{conversation.customer_name}</span>
                    <span className="flex-shrink-0 text-[11px] text-dark-400">{timeAgo(conversation.last_message_at)}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-dark-400">{conversation.customer_phone}</span>
                  <span className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-dark-300">{conversation.last_message_preview || 'No messages yet'}</span>
                    <span className="flex flex-shrink-0 items-center gap-1.5">
                      {isNewConversation(conversation) && (
                        <span className="badge badge-sandbox text-[10px]">New</span>
                      )}
                      {conversation.status === 'resolved' && (
                        <span className="badge badge-success text-[10px]">Resolved</span>
                      )}
                      {conversation.admin_unread_count > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white">
                          {conversation.admin_unread_count}
                        </span>
                      )}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
