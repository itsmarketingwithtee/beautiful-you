import api from './api';

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  mood: number | null;
  createdAt: string;
  updatedAt: string;
}

export async function getJournalEntriesApi(limit = 50, offset = 0): Promise<{ items: JournalEntry[]; total: number }> {
  const res = await api.get('/api/journal', { params: { limit, offset } });
  return res?.data ?? { items: [], total: 0 };
}

export async function getJournalEntryApi(id: string): Promise<JournalEntry> {
  const res = await api.get(`/api/journal/${id}`);
  return res?.data;
}

export async function createJournalEntryApi(data: { title: string; body: string; mood?: number }): Promise<{ entry: JournalEntry }> {
  const res = await api.post('/api/journal', data);
  return res?.data;
}

export async function updateJournalEntryApi(id: string, data: { title?: string; body?: string; mood?: number }): Promise<{ entry: JournalEntry }> {
  const res = await api.put(`/api/journal/${id}`, data);
  return res?.data;
}

export async function deleteJournalEntryApi(id: string): Promise<void> {
  await api.delete(`/api/journal/${id}`);
}
