import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import LoadingScreen from '../src/components/LoadingScreen';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen message="Loading Beautiful You..." />;
  if (isAuthenticated) return <Redirect href="/tabs" />;
  return <Redirect href="/auth" />;
}
