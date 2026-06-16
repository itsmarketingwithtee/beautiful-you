import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontFamily, shadows } from '../src/theme';

const FREE_FEATURES = [
  'Daily Affirmations',
  'Crisis Resources',
  'Basic Mood Tracking',
];

const PREMIUM_FEATURES = [
  'Advanced Mood Insights',
  'Unlimited Favorites',
  'Priority Support',
  'Ad-Free Experience',
];

export default function SubscriptionScreen() {
  const router = useRouter();

  const handleUpgrade = () => {
    if (Platform.OS === 'web') {
      alert('Coming Soon! Premium subscriptions will be available soon.');
    } else {
      Alert.alert('Coming Soon', 'Premium subscriptions will be available soon. Stay tuned!');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="star" size={40} color={colors.primaryPurple} />
          <Text style={styles.title}>Beautiful You Premium</Text>
          <Text style={styles.subtitle}>Unlock your full potential for wellness</Text>
        </View>

        {/* Free Tier */}
        <View style={[styles.tierCard, shadows.sm]}>
          <Text style={styles.tierTitle}>Free</Text>
          <Text style={styles.tierPrice}>$0</Text>
          {FREE_FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Premium Tier */}
        <View style={[styles.tierCard, styles.premiumCard, shadows.md]}>
          <View style={styles.premiumBadge}><Text style={styles.premiumBadgeText}>RECOMMENDED</Text></View>
          <Text style={styles.tierTitle}>Premium</Text>
          <Text style={styles.tierPrice}>$9.99<Text style={styles.tierPeriod}>/month</Text></Text>
          {PREMIUM_FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Ionicons name="star" size={20} color={colors.primaryPurple} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
          <Pressable
            style={({ pressed }) => [styles.upgradeBtn, pressed && { opacity: 0.85 }]}
            onPress={handleUpgrade}
            accessibilityLabel="Upgrade to premium"
            accessibilityRole="button"
          >
            <Text style={styles.upgradeText}>Upgrade to Premium</Text>
          </Pressable>
        </View>

        <Pressable style={styles.restoreLink} onPress={handleUpgrade} accessibilityLabel="Restore purchases" accessibilityRole="button">
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.xl, paddingTop: spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: colors.textDark, fontFamily, marginTop: spacing.sm },
  subtitle: { fontSize: 15, color: colors.textMedium, fontFamily, marginTop: spacing.xs },
  tierCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md },
  premiumCard: { borderWidth: 2, borderColor: colors.primaryPurple },
  premiumBadge: { alignSelf: 'flex-start', backgroundColor: colors.primaryPurple, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: borderRadius.full, marginBottom: spacing.sm },
  premiumBadgeText: { fontSize: 11, fontWeight: '700', color: colors.white, fontFamily },
  tierTitle: { fontSize: 20, fontWeight: '700', color: colors.textDark, fontFamily },
  tierPrice: { fontSize: 32, fontWeight: '700', color: colors.primaryPurple, fontFamily, marginVertical: spacing.sm },
  tierPeriod: { fontSize: 16, fontWeight: '400', color: colors.textMedium },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  featureText: { fontSize: 15, color: colors.textDark, fontFamily },
  upgradeBtn: {
    backgroundColor: colors.primaryPurple, paddingVertical: 16,
    borderRadius: borderRadius.lg, alignItems: 'center', marginTop: spacing.lg, minHeight: 52,
  },
  upgradeText: { color: colors.white, fontSize: 17, fontWeight: '700', fontFamily },
  restoreLink: { alignItems: 'center', paddingVertical: spacing.md },
  restoreText: { fontSize: 14, color: colors.primaryPurple, fontFamily, textDecorationLine: 'underline' },
});
