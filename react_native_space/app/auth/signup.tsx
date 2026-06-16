import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, borderRadius, fontFamily } from '../../src/theme';
import { getApiErrorMessage } from '../../src/services/api';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ageVerified, setAgeVerified] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (): string | null => {
    if (!name?.trim()) return 'Please enter your name.';
    if (!email?.trim()) return 'Please enter your email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() ?? '')) return 'Please enter a valid email.';
    if (!password || (password?.length ?? 0) < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!ageVerified) return 'Please confirm you are 18 years or older.';
    if (!disclaimerAccepted) return 'Please accept the mental health disclaimer.';
    return null;
  };

  const handleSignup = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password, true);
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

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Begin your journey to inner peace</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.textLight} autoCapitalize="words" accessibilityLabel="Name" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={colors.textLight} keyboardType="email-address" autoCapitalize="none" autoComplete="email" accessibilityLabel="Email" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput style={[styles.input, styles.passwordInput]} value={password} onChangeText={setPassword} placeholder="Min 6 characters" placeholderTextColor={colors.textLight} secureTextEntry={!showPassword} accessibilityLabel="Password" />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} accessibilityLabel="Toggle password visibility">
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={colors.textMedium} />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat password" placeholderTextColor={colors.textLight} secureTextEntry={!showPassword} accessibilityLabel="Confirm password" />
          </View>

          <Pressable style={styles.checkRow} onPress={() => setAgeVerified(!ageVerified)} accessibilityRole="checkbox" accessibilityLabel="Age verification">
            <Ionicons name={ageVerified ? 'checkbox' : 'square-outline'} size={24} color={ageVerified ? colors.primaryPurple : colors.textMedium} />
            <Text style={styles.checkText}>I confirm I am 18 years or older</Text>
          </Pressable>

          <Pressable style={styles.checkRow} onPress={() => setDisclaimerAccepted(!disclaimerAccepted)} accessibilityRole="checkbox" accessibilityLabel="Disclaimer acceptance">
            <Ionicons name={disclaimerAccepted ? 'checkbox' : 'square-outline'} size={24} color={disclaimerAccepted ? colors.primaryPurple : colors.textMedium} />
            <Text style={styles.checkText}>I understand this app does not replace professional mental health care</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
            onPress={handleSignup}
            disabled={loading}
            accessibilityLabel="Sign up"
            accessibilityRole="button"
          >
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Sign Up</Text>}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.replace('/auth/login')} accessibilityLabel="Log in">
              <Text style={styles.link}>Log In</Text>
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
  title: { fontSize: 28, fontWeight: '700', color: colors.textDark, fontFamily, marginTop: spacing.md, marginBottom: spacing.xs },
  subtitle: { fontSize: 16, color: colors.textMedium, fontFamily, marginBottom: spacing.lg },
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
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md, minHeight: 44 },
  checkText: { fontSize: 14, color: colors.textDark, fontFamily, flex: 1, lineHeight: 22, paddingTop: 2 },
  btn: {
    backgroundColor: colors.primaryPurple, paddingVertical: 16,
    borderRadius: borderRadius.lg, alignItems: 'center', marginTop: spacing.md, minHeight: 52,
  },
  btnText: { color: colors.white, fontSize: 18, fontWeight: '600', fontFamily },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
  footerText: { fontSize: 14, color: colors.textMedium, fontFamily },
  link: { fontSize: 14, color: colors.primaryPurple, fontWeight: '600', fontFamily },
});
