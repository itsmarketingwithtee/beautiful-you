import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://c258b3e7d.na120.preview.abacusai.app';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  transformRequest: [
    (data, headers) => {
      if (data && typeof data === 'object' && !(data instanceof FormData)) {
        return JSON.stringify(data);
      }
      return data;
    },
  ],
});

let tokenGetter: (() => Promise<string | null>) | null = null;
let tokenClearer: (() => Promise<void>) | null = null;

export function setAuthHandlers(
  getter: () => Promise<string | null>,
  clearer: () => Promise<void>,
) {
  tokenGetter = getter;
  tokenClearer = clearer;
}

api.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    const token = await tokenGetter();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error?.response?.status === 401 && tokenClearer) {
      await tokenClearer();
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error?.response?.data as Record<string, unknown> | undefined;
    if (data?.message) {
      if (Array.isArray(data.message)) return (data.message as string[])?.[0] ?? 'An error occurred';
      return String(data.message);
    }
    if (error?.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
    if (!error?.response) return 'Network error. Please check your connection.';
    return 'An error occurred. Please try again.';
  }
  return 'An unexpected error occurred.';
}

export default api;
