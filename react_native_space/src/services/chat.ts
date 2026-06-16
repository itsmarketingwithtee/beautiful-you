import api from './api';
import type { ChatMessage, ChatType } from '../types';

export async function sendMessageApi(data: {
  chatType: ChatType;
  content: string;
  deliverAt?: string;
}): Promise<{ message: ChatMessage }> {
  const res = await api.post('/api/chat/messages', data);
  return res?.data;
}

export async function getMessagesApi(
  chatType: ChatType,
  limit = 50,
  offset = 0,
): Promise<{ items: ChatMessage[]; total: number }> {
  const res = await api.get(`/api/chat/messages/${chatType}`, {
    params: { limit, offset },
  });
  return res?.data ?? { items: [], total: 0 };
}

export async function getFutureMessagesApi(): Promise<ChatMessage[]> {
  const res = await api.get('/api/chat/future-messages');
  return res?.data ?? [];
}

export async function deleteMessageApi(id: string): Promise<void> {
  await api.delete(`/api/chat/messages/${id}`);
}
