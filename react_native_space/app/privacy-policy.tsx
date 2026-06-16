import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontFamily } from '../src/theme';

const LAST_UPDATED = 'June 13, 2026';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
          <Ionicons name="chevron-back" size={26} color={colors.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: {LAST_UPDATED}</Text>

        <Text style={styles.intro}>
          Beautiful You ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
        </Text>

        <Section title="1. Information We Collect">
          <BulletPoint text="Account Information: When you create an account, we collect your name and email address. Guest users are not required to provide personal information." />
          <BulletPoint text="Mood Data: Mood entries, notes, and tracking data you voluntarily submit to track your emotional wellbeing." />
          <BulletPoint text="Journal Entries: Private journal messages you write within the Chat feature. These are encrypted and only accessible to you." />
          <BulletPoint text="Community Posts: Content you voluntarily share in The Quiet Room community feature, posted under an anonymous display name." />
          <BulletPoint text="Affirmation Favorites: Which affirmations you save as favorites." />
          <BulletPoint text="Device Information: Push notification tokens (if you opt in), device type, and app version for service functionality." />
        </Section>

        <Section title="2. How We Use Your Information">
          <BulletPoint text="To provide and maintain the Beautiful You app experience" />
          <BulletPoint text="To personalize your daily affirmations and mood insights" />
          <BulletPoint text="To deliver push notifications (only if you opt in)" />
          <BulletPoint text="To maintain community safety in The Quiet Room (content moderation)" />
          <BulletPoint text="To improve our services and user experience" />
          <Text style={styles.body}>
            We do NOT use your data for advertising, sell your data to third parties, or share personally identifiable information with external organizations.
          </Text>
        </Section>

        <Section title="3. Data Storage & Security">
          <Text style={styles.body}>
            Your data is stored on secure, encrypted servers. We implement industry-standard security measures including:
          </Text>
          <BulletPoint text="Encrypted data transmission (HTTPS/TLS)" />
          <BulletPoint text="Hashed passwords (bcrypt) — we never store plain-text passwords" />
          <BulletPoint text="Secure token-based authentication (JWT)" />
          <BulletPoint text="Database access controls and regular security audits" />
        </Section>

        <Section title="4. Community Posts & Anonymity">
          <Text style={styles.body}>
            Posts in The Quiet Room are displayed with randomly generated anonymous display names. While we store the association between your account and your posts (to allow you to delete them), other users cannot see your identity. We reserve the right to remove content that violates community guidelines or is reported by multiple users.
          </Text>
        </Section>

        <Section title="5. Third-Party Services">
          <Text style={styles.body}>
            Beautiful You integrates with the following third-party services:
          </Text>
          <BulletPoint text="FutureMe.org — for the 'Future Me' letter-writing feature. When you use this feature, you interact directly with FutureMe.org's website. Their own privacy policy governs that interaction." />
          <BulletPoint text="Crisis resources (988 Lifeline, Crisis Text Line, etc.) — we provide links and contact information but do not share your data with these organizations." />
          <BulletPoint text="Expo Push Notification service — for delivering opt-in notifications." />
        </Section>

        <Section title="6. Your Rights">
          <Text style={styles.body}>You have the right to:</Text>
          <BulletPoint text="Access your personal data at any time through the app" />
          <BulletPoint text="Delete your account and all associated data" />
          <BulletPoint text="Opt out of push notifications at any time" />
          <BulletPoint text="Delete individual mood entries, journal entries, or community posts" />
          <BulletPoint text="Use the app as a guest without providing personal information" />
        </Section>

        <Section title="7. Children's Privacy">
          <Text style={styles.body}>
            Beautiful You is intended for users aged 18 and older. We do not knowingly collect information from individuals under 18. Users must confirm their age during account creation.
          </Text>
        </Section>

        <Section title="8. Data Retention">
          <Text style={styles.body}>
            We retain your data for as long as your account is active. If you delete your account, all associated data (mood entries, journal entries, favorites, community posts) will be permanently deleted within 30 days.
          </Text>
        </Section>

        <Section title="9. Changes to This Policy">
          <Text style={styles.body}>
            We may update this Privacy Policy from time to time. We will notify you of significant changes through the app. Your continued use of the app after changes constitutes acceptance of the updated policy.
          </Text>
        </Section>

        <Section title="10. Contact Us">
          <Text style={styles.body}>
            If you have questions or concerns about this Privacy Policy or your data, please contact us through the "Talk to Us" feature in the Chat section of the app.
          </Text>
        </Section>

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primaryPurple} />
          <Text style={styles.footerText}>
            Your privacy and mental health are equally important to us. 💜
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BulletPoint({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.white,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textDark, fontFamily },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  lastUpdated: { fontSize: 13, color: colors.textLight, fontFamily, marginBottom: spacing.md },
  intro: { fontSize: 15, color: colors.textDark, fontFamily, lineHeight: 24, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textDark, fontFamily, marginBottom: spacing.sm },
  body: { fontSize: 14, color: colors.textMedium, fontFamily, lineHeight: 22, marginBottom: spacing.sm },
  bulletRow: { flexDirection: 'row', paddingLeft: spacing.sm, marginBottom: spacing.xs },
  bullet: { fontSize: 14, color: colors.primaryPurple, fontFamily, marginRight: spacing.sm, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: 14, color: colors.textMedium, fontFamily, lineHeight: 22 },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md,
  },
  footerText: { fontSize: 14, color: colors.textMedium, fontFamily },
});
