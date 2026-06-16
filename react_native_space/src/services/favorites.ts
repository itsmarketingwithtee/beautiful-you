import api from './api';
import type { Affirmation } from '../types';

export async function getFavoritesApi(): Promise<{ items: Affirmation[] }> {
  const res = await api.get('/api/favorites');
  return res?.data ?? { items: [] };
}

export async function toggleFavoriteApi(
  affirmationId: string,
): Promise<{ success: boolean; isFavorited: boolean }> {
  const res = await api.post(`/api/favorites/${affirmationId}`);
  return res?.data;
}
