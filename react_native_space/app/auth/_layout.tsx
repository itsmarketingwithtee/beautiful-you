import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import LoadingScreen from '../../src/components/LoadingScreen';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Redirect href="/tabs" />;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
