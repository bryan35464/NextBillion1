export type SupportConversationStatus = 'open' | 'resolved';
export type SupportSenderRole = 'customer' | 'admin';

export interface SupportConversation {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  status: SupportConversationStatus;
  customer_unread_count: number;
  admin_unread_count: number;
  last_message_preview: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_role: SupportSenderRole;
  body: string | null;
  image_path: string | null;
  image_mime: string | null;
  image_size: number | null;
  read_at: string | null;
  created_at: string;
}

export interface SupportAvailability {
  id: number;
  admin_last_seen_at: string;
}
