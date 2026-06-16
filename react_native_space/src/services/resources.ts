import api from './api';
import type { MentalHealthResource, ResourceCategory } from '../types';

export async function getResourcesApi(category?: string) {
  const params: Record<string, string> = {};
  if (category && category !== 'all') params.category = category;
  const { data } = await api.get('/api/resources', { params });
  return data as { items: MentalHealthResource[]; total: number };
}

export async function getCategoriesApi() {
  const { data } = await api.get('/api/resources/categories');
  return data as { categories: ResourceCategory[] };
}
