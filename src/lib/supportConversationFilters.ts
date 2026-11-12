import type { SupportConversation } from '@/types/support';

export type SupportInboxFilter = 'all' | 'unread' | 'active' | 'resolved';

const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

export function matchesInboxFilter(conversation: SupportConversation, filter: SupportInboxFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'unread':
      return conversation.admin_unread_count > 0;
    case 'active':
      return conversation.status === 'open';
    case 'resolved':
      return conversation.status === 'resolved';
  }
}

export function matchesSearch(conversation: SupportConversation, query: string): boolean {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  if (conversation.customer_name.toLowerCase().includes(term)) return true;
  const digits = term.replace(/\D/g, '');
  return digits.length > 0 && conversation.customer_phone.replace(/\D/g, '').includes(digits);
}

export function isNewConversation(conversation: SupportConversation): boolean {
  return Date.now() - Date.parse(conversation.created_at) < NEW_WINDOW_MS;
}
