import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, borderRadius, fontFamily } from '../../src/theme';
import { getApiErrorMessage } from '../../src/services/api';

export default function WelcomeScreen() {
  const router = useRouter();
  const { guestLogin } = useAuth();
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuest = async () => {
    setGuestLoading(true);
    setError('');
    try {
      await guestLogin();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <LinearGradient colors={colors.gradientWelcome} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="flower-outline" size={48} color={colors.white} />
            </View>
            <Text style={styles.title}>Beautiful You</Text>
            <Text style={styles.tagline}>Your Journey to Inner Peace</Text>
          </View>

          <View style={styles.descContainer}>
            <Text style={styles.desc}>
              A safe, compassionate space for daily affirmations, mood tracking, and mental wellness support. Take a breath — you belong here.
            </Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}
              onPress={() => router.push('/auth/signup')}
              accessibilityLabel="Sign up"
              accessibilityRole="button"
            >
              <Text style={styles.btnPrimaryText}>Sign Up</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnPressed]}
              onPress={() => router.push('/auth/login')}
              accessibilityLabel="Log in"
              accessibilityRole="button"
            >
              <Text style={styles.btnSecondaryText}>Log In</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.btnGhost, pressed && styles.btnPressed]}
              onPress={handleGuest}
              disabled={guestLoading}
              accessibilityLabel="Continue as guest"
              accessibilityRole="button"
            >
              {guestLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.btnGhostText}>Continue as Guest</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.disclaimerContainer}>
            <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.disclaimer}>
              This app does not replace professional mental health care. If you are in crisis, please call 988.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, minHeight: '100%' },
  logoContainer: { alignItems: 'center', marginBottom: spacing.xl },
  logoCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: 36, fontWeight: '700', color: colors.white, fontFamily, letterSpacing: 0.5 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontFamily, marginTop: spacing.xs },
  descContainer: { marginBottom: spacing.xl, paddingHorizontal: spacing.sm },
  desc: { fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontFamily },
  error: { color: '#FFB4AB', textAlign: 'center', marginBottom: spacing.md, fontFamily, fontSize: 14 },
  buttonContainer: { gap: spacing.md, marginBottom: spacing.xl },
  btnPrimary: {
    backgroundColor: colors.white, paddingVertical: 16,
    borderRadius: borderRadius.lg, alignItems: 'center',
    minHeight: 52,
  },
  btnPrimaryText: { color: colors.deepPurple, fontSize: 18, fontWeight: '700', fontFamily },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 16,
    borderRadius: borderRadius.lg, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    minHeight: 52,
  },
  btnSecondaryText: { color: colors.white, fontSize: 18, fontWeight: '600', fontFamily },
  btnGhost: {
    paddingVertical: 16, borderRadius: borderRadius.lg,
    alignItems: 'center', minHeight: 52,
  },
  btnGhostText: { color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: '500', fontFamily, textDecorationLine: 'underline' },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disclaimerContainer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs,
    paddingHorizontal: spacing.sm, paddingTop: spacing.md,
  },
  disclaimer: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily, lineHeight: 18, flex: 1 },
});
