import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Switch, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../src/context/AuthContext';
import { getProfileApi, getSettingsApi, updateSettingsApi } from '../../src/services/profile';
import { colors, spacing, borderRadius, fontFamily, shadows } from '../../src/theme';
import type { Profile, Settings } from '../../src/types';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifLoading, setNotifLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profRes, settRes] = await Promise.allSettled([
        getProfileApi(),
        getSettingsApi(),
      ]);
      if (profRes.status === 'fulfilled') setProfile(profRes.value ?? null);
      if (settRes.status === 'fulfilled') setSettings(settRes.value ?? null);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData]),
  );

  const handleNotifToggle = async (val: boolean) => {
    setNotifLoading(true);
    try {
      const res = await updateSettingsApi({ notificationsEnabled: val });
      setSettings(res ?? null);
    } catch { /* ignore */ } finally {
      setNotifLoading(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      await logout();
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
      ]);
    }
  };

  const initials = (profile?.name ?? user?.name ?? 'G')
    .split(' ')
    .map((w) => w?.[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Profile</Text>

        {/* Avatar and Info */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'G'}</Text>
          </View>
          <Text style={styles.name}>{profile?.name ?? user?.name ?? 'Guest User'}</Text>
          <Text style={styles.email}>{profile?.email ?? user?.email ?? 'Guest Account'}</Text>
          {profile?.isGuest ? (
            <View style={styles.guestBadge}><Text style={styles.guestText}>Guest</Text></View>
          ) : null}
        </View>

        {/* Settings */}
        <View style={[styles.section, shadows.sm]}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={22} color={colors.primaryPurple} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            {notifLoading ? (
              <ActivityIndicator size="small" color={colors.primaryPurple} />
            ) : (
              <Switch
                value={settings?.notificationsEnabled ?? false}
                onValueChange={handleNotifToggle}
                trackColor={{ false: colors.border, true: colors.lightPurple }}
                thumbColor={settings?.notificationsEnabled ? colors.primaryPurple : '#f4f3f4'}
              />
            )}
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="sparkles-outline" size={22} color={colors.primaryPurple} />
              <Text style={styles.settingText}>Subscription</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{(settings?.subscriptionStatus ?? profile?.subscriptionStatus ?? 'free').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Upgrade */}
        <Pressable
          style={({ pressed }) => [styles.upgradeBtn, shadows.md, pressed && { opacity: 0.9 }]}
          onPress={() => router.push('/subscription')}
          accessibilityLabel="Upgrade to Premium"
          accessibilityRole="button"
        >
          <Ionicons name="star" size={22} color={colors.white} />
          <Text style={styles.upgradeText}>Upgrade to Premium</Text>
        </Pressable>

        {/* About */}
        <View style={[styles.section, shadows.sm]}>
          <Text style={styles.sectionTitle}>About</Text>

          <Pressable style={styles.menuItem} onPress={() => router.push('/terms')} accessibilityRole="button">
            <Ionicons name="document-text-outline" size={20} color={colors.textMedium} />
            <Text style={styles.menuText}>Terms & Disclaimer</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => router.push('/privacy-policy')} accessibilityRole="button">
            <Ionicons name="shield-outline" size={20} color={colors.textMedium} />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </Pressable>

          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>App Version</Text>
            <Text style={styles.versionValue}>1.0.0</Text>
          </View>
        </View>

        {/* Sign Out */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.85 }]}
          onPress={handleLogout}
          accessibilityLabel="Sign out"
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={22} color={colors.crisisRed} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  pageTitle: { fontSize: 28, fontWeight: '700', color: colors.textDark, fontFamily, marginBottom: spacing.lg },
  profileHeader: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.lightPurple, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.primaryPurple, fontFamily },
  name: { fontSize: 22, fontWeight: '700', color: colors.textDark, fontFamily },
  email: { fontSize: 14, color: colors.textMedium, fontFamily, marginTop: 2 },
  guestBadge: { marginTop: spacing.sm, backgroundColor: colors.lightBlue, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: borderRadius.full },
  guestText: { fontSize: 12, fontWeight: '600', color: colors.primaryBlue, fontFamily },
  section: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, fontFamily, marginBottom: spacing.md },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, minHeight: 48 },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  settingText: { fontSize: 15, color: colors.textDark, fontFamily },
  statusBadge: { backgroundColor: colors.lightPurple, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: borderRadius.full },
  statusText: { fontSize: 12, fontWeight: '700', color: colors.primaryPurple, fontFamily },
  upgradeBtn: {
    backgroundColor: colors.primaryPurple, borderRadius: borderRadius.lg,
    padding: spacing.lg, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.md, minHeight: 56,
  },
  upgradeText: { color: colors.white, fontSize: 17, fontWeight: '700', fontFamily },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
    minHeight: 48,
  },
  menuText: { flex: 1, fontSize: 15, color: colors.textDark, fontFamily },
  versionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
  versionLabel: { fontSize: 15, color: colors.textMedium, fontFamily },
  versionValue: { fontSize: 15, color: colors.textDark, fontFamily, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.lg, marginTop: spacing.md, minHeight: 52,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: colors.crisisRed, fontFamily },
});
