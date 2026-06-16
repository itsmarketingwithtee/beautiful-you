import React from 'react';
import { Platform } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import LoadingScreen from '../../src/components/LoadingScreen';
import { usePushNotifications } from '../../src/hooks/usePushNotifications';
import { colors, fontFamily } from '../../src/theme';

export default function TabsLayout() {
  usePushNotifications();
  const { isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/auth" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryPurple,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontFamily,
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          tabBarButtonTestID: 'tab-home',
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
          tabBarButtonTestID: 'tab-community',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
          tabBarButtonTestID: 'tab-chat',
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
          tabBarIcon: ({ color, size }) => <Ionicons name="library" size={size} color={color} />,
          tabBarButtonTestID: 'tab-resources',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          tabBarButtonTestID: 'tab-profile',
        }}
      />
      {/* Hidden tabs — still accessible via navigation but not shown in tab bar */}
      <Tabs.Screen
        name="affirmations"
        options={{
          href: null,
          title: 'Affirm',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mood"
        options={{
          href: null,
          title: 'Mood',
          tabBarIcon: ({ color, size }) => <Ionicons name="happy" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="crisis"
        options={{
          href: null,
          title: 'Crisis',
          tabBarIcon: ({ color, size }) => <Ionicons name="call" size={size} color={colors.crisisRed} />,
        }}
      />
    </Tabs>
  );
}
