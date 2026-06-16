import api from './api';
import type { Profile, Settings } from '../types';

export async function getProfileApi(): Promise<Profile> {
  const res = await api.get('/api/profile');
  return res?.data;
}

export async function updateProfileApi(data: { name?: string }): Promise<Profile> {
  const res = await api.put('/api/profile', data);
  return res?.data;
}

export async function getSettingsApi(): Promise<Settings> {
  const res = await api.get('/api/settings');
  return res?.data;
}

export async function updateSettingsApi(data: Partial<Settings>): Promise<Settings> {
  const res = await api.patch('/api/settings', data);
  return res?.data;
}

export async function registerPushTokenApi(token: string, deviceType?: string): Promise<void> {
  await api.post('/api/push-tokens', { token, deviceType });
}

export async function removePushTokenApi(token: string): Promise<void> {
  await api.delete(`/api/push-tokens/${encodeURIComponent(token)}`);
}
