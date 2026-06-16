import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontFamily } from '../src/theme';

const LAST_UPDATED = 'June 13, 2026';

export default function TermsScreen() {
  const router = useRouter();

  const handleCall988 = async () => {
    try { await Linking.openURL('tel:988'); } catch { /* ignore */ }
  };

  const handleTextCrisis = async () => {
    const url = Platform.OS === 'web' ? 'sms:741741' : 'sms:741741?body=HELLO';
    try { await Linking.openURL(url); } catch { /* ignore */ }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
          <Ionicons name="chevron-back" size={26} color={colors.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Terms & Disclaimer</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: {LAST_UPDATED}</Text>

        {/* IMPORTANT DISCLAIMER */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <Ionicons name="warning" size={24} color={colors.crisisOrange} />
            <Text style={styles.disclaimerTitle}>Important Mental Health Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerBody}>
            Beautiful You is a wellness and peer support app. It is NOT a substitute for professional mental health treatment, therapy, counseling, or medical advice.
          </Text>
          <Text style={styles.disclaimerBody}>
            If you are experiencing a mental health crisis, suicidal thoughts, or are in immediate danger, please contact emergency services or a crisis hotline immediately:
          </Text>
          <Pressable style={styles.crisisBtn} onPress={handleCall988} accessibilityRole="button">
            <Ionicons name="call" size={18} color={colors.white} />
            <Text style={styles.crisisBtnText}>Call 988 — Suicide & Crisis Lifeline</Text>
          </Pressable>
          <Pressable style={[styles.crisisBtn, { backgroundColor: colors.crisisOrange }]} onPress={handleTextCrisis} accessibilityRole="button">
            <Ionicons name="chatbubble" size={18} color={colors.white} />
            <Text style={styles.crisisBtnText}>Text HELLO to 741741 — Crisis Text Line</Text>
          </Pressable>
          <Pressable style={[styles.crisisBtn, { backgroundColor: '#333' }]} onPress={() => Linking.openURL('tel:911').catch(() => {})} accessibilityRole="button">
            <Ionicons name="medkit" size={18} color={colors.white} />
            <Text style={styles.crisisBtnText}>Call 911 — Emergency Services</Text>
          </Pressable>
        </View>

        <Section title="1. Acceptance of Terms">
          <Text style={styles.body}>
            By downloading, installing, or using Beautiful You, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the app.
          </Text>
        </Section>

        <Section title="2. Nature of the Service">
          <Text style={styles.body}>
            Beautiful You provides:
          </Text>
          <BulletPoint text="Daily affirmations and motivational content" />
          <BulletPoint text="Mood tracking and personal journaling tools" />
          <BulletPoint text="An anonymous peer support community (The Quiet Room)" />
          <BulletPoint text="AI-powered supportive chat (not therapy or counseling)" />
          <BulletPoint text="Curated mental health resource directory" />
          <BulletPoint text="Integration with FutureMe.org for future letter-writing" />
          <Text style={[styles.body, { marginTop: spacing.sm, fontWeight: '700', color: colors.textDark }]}>
            None of these features constitute medical advice, diagnosis, treatment, or professional mental health services.
          </Text>
        </Section>

        <Section title="3. AI Chat Disclaimer">
          <Text style={styles.body}>
            The AI Support chat feature provides general encouragement and wellness-oriented responses. It is NOT a licensed therapist, counselor, or mental health professional. The AI:
          </Text>
          <BulletPoint text="Cannot diagnose mental health conditions" />
          <BulletPoint text="Cannot prescribe medication or treatment plans" />
          <BulletPoint text="May not always provide appropriate responses" />
          <BulletPoint text="Should not be relied upon during a mental health crisis" />
          <Text style={styles.body}>
            Always consult a qualified mental health professional for personalized care.
          </Text>
        </Section>

        <Section title="4. Community Guidelines">
          <Text style={styles.body}>
            The Quiet Room is a peer support community. By participating, you agree to:
          </Text>
          <BulletPoint text="Be kind, respectful, and supportive to all members" />
          <BulletPoint text="Not share personally identifying information about yourself or others" />
          <BulletPoint text="Not provide medical advice or act as a therapist" />
          <BulletPoint text="Not post content that is hateful, violent, sexually explicit, or promotes self-harm" />
          <BulletPoint text="Report inappropriate content using the report feature" />
          <Text style={styles.body}>
            We reserve the right to remove any content and restrict access for users who violate these guidelines. Posts receiving multiple reports may be automatically hidden.
          </Text>
        </Section>

        <Section title="5. User Responsibility">
          <Text style={styles.body}>
            You acknowledge and agree that:
          </Text>
          <BulletPoint text="You are at least 18 years of age" />
          <BulletPoint text="You are responsible for your own mental health decisions" />
          <BulletPoint text="You will seek professional help when needed" />
          <BulletPoint text="You will not rely solely on this app for mental health support" />
          <BulletPoint text="You will use crisis resources (988, 741741, 911) when in immediate danger" />
        </Section>

        <Section title="6. Limitation of Liability">
          <Text style={styles.body}>
            Beautiful You and its creators are not liable for any harm, injury, or damage resulting from the use of this app. This includes but is not limited to decisions made based on AI responses, community posts, affirmation content, or resource referrals. The app is provided "as is" without warranties of any kind.
          </Text>
        </Section>

        <Section title="7. Crisis Resources">
          <Text style={styles.body}>
            We are committed to connecting users with professional help. The following resources are available 24/7:
          </Text>
          <BulletPoint text="988 Suicide & Crisis Lifeline — Call or text 988" />
          <BulletPoint text="Crisis Text Line — Text HELLO to 741741" />
          <BulletPoint text="Emergency Services — Call 911" />
          <BulletPoint text="NAMI Helpline — 1-800-950-6264" />
          <BulletPoint text="SAMHSA Helpline — 1-800-662-4357" />
          <BulletPoint text="The Trevor Project (LGBTQ+ youth) — 1-866-488-7386" />
          <BulletPoint text="Veterans Crisis Line — Dial 988, press 1" />
          <Text style={[styles.body, { marginTop: spacing.sm }]}>
            These resources are also available in the Crisis and Resources tabs within the app.
          </Text>
        </Section>

        <Section title="8. Modifications">
          <Text style={styles.body}>
            We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance. We will notify users of significant changes through the app.
          </Text>
        </Section>

        <View style={styles.footer}>
          <Ionicons name="heart" size={24} color={colors.primaryPurple} />
          <Text style={styles.footerText}>
            You matter. Help is always available. 💜
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
  disclaimerCard: {
    backgroundColor: '#FFF8F0', borderRadius: borderRadius.lg, padding: spacing.lg,
    borderWidth: 1.5, borderColor: colors.crisisOrange, marginBottom: spacing.xl,
  },
  disclaimerHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  disclaimerTitle: { fontSize: 17, fontWeight: '700', color: colors.crisisOrange, fontFamily, flex: 1 },
  disclaimerBody: { fontSize: 14, color: colors.textDark, fontFamily, lineHeight: 22, marginBottom: spacing.sm },
  crisisBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.crisisRed, borderRadius: borderRadius.md,
    paddingVertical: 12, paddingHorizontal: spacing.md, marginTop: spacing.xs,
  },
  crisisBtnText: { fontSize: 14, fontWeight: '600', color: colors.white, fontFamily, flex: 1 },
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
