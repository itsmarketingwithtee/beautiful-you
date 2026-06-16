import api from './api';
import type { Affirmation } from '../types';

export async function getAffirmationsApi(
  category?: string,
  search?: string,
): Promise<{ items: Affirmation[] }> {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  if (search) params.search = search;
  const res = await api.get('/api/affirmations', { params });
  return res?.data ?? { items: [] };
}

export async function getDailyAffirmationApi(): Promise<{ affirmation: Affirmation }> {
  const res = await api.get('/api/affirmations/daily');
  return res?.data;
}

export async function getAffirmationByIdApi(id: string): Promise<Affirmation> {
  const res = await api.get(`/api/affirmations/${id}`);
  return res?.data;
}
