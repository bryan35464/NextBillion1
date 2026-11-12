import { supabase } from '@/lib/supabase';
import { compressImageForUpload, detectImageType } from '@/lib/supportImage';
import {
  SUPPORT_ADMIN_ONLINE_WINDOW_MS,
  validateImageFile,
} from '@/lib/supportValidation';
import type {
  SupportAvailability,
  SupportConversation,
  SupportConversationStatus,
  SupportMessage,
} from '@/types/support';

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const SIGNED_URL_SECONDS = 3600;
export const MESSAGE_PAGE_SIZE = 50;

export async function fetchOwnConversation(customerId: string): Promise<SupportConversation | null> {
  const { data, error } = await supabase
    .from('support_conversations')
    .select('*')
    .eq('customer_id', customerId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SupportConversation | null) ?? null;
}

export async function createConversation(
  customerId: string,
  name: string,
  phone: string
): Promise<SupportConversation> {
  const { data, error } = await supabase
    .from('support_conversations')
    .insert({ customer_id: customerId, customer_name: name, customer_phone: phone })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as SupportConversation;
}

export async function listConversations(): Promise<SupportConversation[]> {
  const { data, error } = await supabase
    .from('support_conversations')
    .select('*')
    .order('last_message_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SupportConversation[];
}

export async function setConversationStatus(
  conversationId: string,
  status: SupportConversationStatus
): Promise<void> {
  const { error } = await supabase
    .from('support_conversations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', conversationId);
  if (error) throw new Error(error.message);
}

export async function fetchLatestMessages(conversationId: string): Promise<{ rows: SupportMessage[]; hasMore: boolean }> {
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(MESSAGE_PAGE_SIZE);
  if (error) throw new Error(error.message);
  const rows = ((data ?? []) as SupportMessage[]).reverse();
  return { rows, hasMore: rows.length === MESSAGE_PAGE_SIZE };
}

export async function fetchOlderMessages(conversationId: string, beforeIso: string): Promise<{ rows: SupportMessage[]; hasMore: boolean }> {
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .lt('created_at', beforeIso)
    .order('created_at', { ascending: false })
    .limit(MESSAGE_PAGE_SIZE);
  if (error) throw new Error(error.message);
  const rows = ((data ?? []) as SupportMessage[]).reverse();
  return { rows, hasMore: rows.length === MESSAGE_PAGE_SIZE };
}

export async function fetchMessagesAfter(conversationId: string, afterIso: string): Promise<SupportMessage[]> {
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .gt('created_at', afterIso)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as SupportMessage[];
}

export async function sendTextMessage(conversationId: string, body: string): Promise<SupportMessage> {
  const { data, error } = await supabase
    .from('support_messages')
    .insert({ conversation_id: conversationId, body: body.trim() })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as SupportMessage;
}

export async function sendImageMessage(
  conversationId: string,
  customerId: string,
  file: File
): Promise<SupportMessage> {
  const fileError = validateImageFile(file);
  if (fileError) throw new Error(fileError);
  const detectedType = await detectImageType(file);
  if (!detectedType) throw new Error('This file is not a valid JPG, PNG or WEBP image.');

  const prepared = await compressImageForUpload(file);
  const extension = IMAGE_EXTENSIONS[prepared.type];
  const path = `${customerId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('support-images')
    .upload(path, prepared, { contentType: prepared.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await supabase
    .from('support_messages')
    .insert({
      conversation_id: conversationId,
      body: null,
      image_path: path,
      image_mime: prepared.type,
      image_size: prepared.size,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as SupportMessage;
}

export async function getImageUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('support-images')
    .createSignedUrl(path, SIGNED_URL_SECONDS);
  if (error || !data?.signedUrl) throw new Error('Could not load this image.');
  return data.signedUrl;
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const { error } = await supabase.rpc('support_mark_read', { p_conversation_id: conversationId });
  if (error) throw new Error(error.message);
}

export async function sendAdminHeartbeat(): Promise<void> {
  const { error } = await supabase.rpc('support_admin_heartbeat');
  if (error) throw new Error(error.message);
}

export async function fetchAvailability(): Promise<SupportAvailability | null> {
  const { data, error } = await supabase
    .from('support_availability')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SupportAvailability | null) ?? null;
}

export function isSupportAdminOnline(availability: SupportAvailability | null): boolean {
  if (!availability) return false;
  const lastSeen = Date.parse(availability.admin_last_seen_at);
  if (Number.isNaN(lastSeen)) return false;
  return Date.now() - lastSeen < SUPPORT_ADMIN_ONLINE_WINDOW_MS;
}
