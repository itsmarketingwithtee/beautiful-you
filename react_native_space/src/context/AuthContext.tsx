import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthHandlers } from '../services/api';
import { loginApi, signupApi, guestLoginApi, getMeApi } from '../services/auth';
import type { User } from '../types';

const TOKEN_KEY = 'auth_token';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, ageVerified: boolean) => Promise<void>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  guestLogin: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function setToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  } catch { /* silent */ }
}

async function removeToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch { /* silent */ }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  const clearAuth = useCallback(async () => {
    await removeToken();
    if (mountedRef.current) setUser(null);
  }, []);

  useEffect(() => {
    setAuthHandlers(getToken, clearAuth);
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        if (mountedRef.current) { setUser(null); setIsLoading(false); }
        return;
      }
      const data = await getMeApi();
      if (mountedRef.current) setUser(data?.user ?? null);
    } catch {
      await clearAuth();
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    mountedRef.current = true;
    refreshUser();
    return () => { mountedRef.current = false; };
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginApi({ email, password });
    await setToken(data?.token);
    if (mountedRef.current) setUser(data?.user ?? null);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, ageVerified: boolean) => {
    const data = await signupApi({ email, password, name, ageVerified });
    await setToken(data?.token);
    if (mountedRef.current) setUser(data?.user ?? null);
  }, []);

  const guestLogin = useCallback(async () => {
    const data = await guestLoginApi();
    await setToken(data?.token);
    if (mountedRef.current) setUser(data?.user ?? null);
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        guestLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
