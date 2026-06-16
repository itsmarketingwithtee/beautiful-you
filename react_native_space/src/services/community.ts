import api from './api';
import type { CommunityPost } from '../types';

export async function getPostsApi(category?: string, limit = 20, offset = 0) {
  const params: Record<string, string | number> = { limit, offset };
  if (category && category !== 'all') params.category = category;
  const { data } = await api.get('/api/community/posts', { params });
  return data as { items: CommunityPost[]; total: number };
}

export async function createPostApi(content: string, category?: string, displayName?: string) {
  const { data } = await api.post('/api/community/posts', { content, category, displayName });
  return data as { post: CommunityPost };
}

export async function reactToPostApi(postId: string, type: 'heart' | 'hug') {
  const { data } = await api.post(`/api/community/posts/${postId}/react`, { type });
  return data as { reacted: boolean; type: string };
}

export async function reportPostApi(postId: string, reason: string) {
  const { data } = await api.post(`/api/community/posts/${postId}/report`, { reason });
  return data;
}

export async function deletePostApi(postId: string) {
  const { data } = await api.delete(`/api/community/posts/${postId}`);
  return data;
}
