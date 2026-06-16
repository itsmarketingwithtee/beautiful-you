import api from './api';
import type { AuthResponse, User } from '../types';

export async function signupApi(data: {
  email: string;
  password: string;
  name: string;
  ageVerified: boolean;
}): Promise<AuthResponse> {
  const res = await api.post('/api/signup', data);
  return res?.data;
}

export async function loginApi(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post('/api/auth/login', data);
  return res?.data;
}

export async function guestLoginApi(): Promise<AuthResponse> {
  const res = await api.post('/api/auth/guest', { ageVerified: true });
  return res?.data;
}

export async function getMeApi(): Promise<{ user: User }> {
  const res = await api.get('/api/auth/me');
  return res?.data;
}
