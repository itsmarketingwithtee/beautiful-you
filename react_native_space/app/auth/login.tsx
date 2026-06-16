import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, borderRadius, fontFamily } from '../../src/theme';
import { getApiErrorMessage } from '../../src/services/api';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email?.trim()) { setError('Please enter your email.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back" accessibilityRole="button">
            <Ionicons name="chevron-back" size={28} color={colors.textDark} />
          </Pressable>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              accessibilityLabel="Email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showPassword}
                accessibilityLabel="Password"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} accessibilityLabel="Toggle password visibility">
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={colors.textMedium} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityLabel="Log in"
            accessibilityRole="button"
          >
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Log In</Text>}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => router.replace('/auth/signup')} accessibilityLabel="Sign up">
              <Text style={styles.link}>Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: spacing.xl, paddingTop: spacing.md },
  back: { width: 44, height: 44, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: colors.textDark, fontFamily, marginTop: spacing.lg, marginBottom: spacing.xs },
  subtitle: { fontSize: 16, color: colors.textMedium, fontFamily, marginBottom: spacing.xl },
  error: { color: colors.crisisRed, fontSize: 14, fontFamily, marginBottom: spacing.md, textAlign: 'center' },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.textDark, fontFamily, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: 14,
    fontSize: 16, color: colors.textDark, fontFamily, minHeight: 52,
  },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', width: 44, alignItems: 'center' },
  btn: {
    backgroundColor: colors.primaryPurple, paddingVertical: 16,
    borderRadius: borderRadius.lg, alignItems: 'center', marginTop: spacing.lg, minHeight: 52,
  },
  btnText: { color: colors.white, fontSize: 18, fontWeight: '600', fontFamily },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontSize: 14, color: colors.textMedium, fontFamily },
  link: { fontSize: 14, color: colors.primaryPurple, fontWeight: '600', fontFamily },
});
