import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fontFamily, borderRadius } from '../src/theme';

export default function NotFound() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔍</Text>
      <Text style={styles.title}>Page Not Found</Text>
      <Pressable style={styles.btn} onPress={() => router.replace('/')} accessibilityRole="button" accessibilityLabel="Go home">
        <Text style={styles.btnText}>Go Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.xl },
  emoji: { fontSize: 48, marginBottom: spacing.md },
  title: { fontSize: 20, fontWeight: '600', color: colors.textDark, fontFamily, marginBottom: spacing.lg },
  btn: { backgroundColor: colors.primaryPurple, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.lg },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600', fontFamily },
});
