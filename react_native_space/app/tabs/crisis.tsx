import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, fontFamily, shadows } from '../../src/theme';

const CRISIS_RESOURCES = [
  {
    id: '1',
    title: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential support 24/7 for people in distress.',
    action: 'Call 988',
    url: 'tel:988',
    icon: 'call' as const,
    color: '#E57373',
  },
  {
    id: '2',
    title: 'Crisis Text Line',
    description: 'Text HOME to 741741 for free crisis counseling.',
    action: 'Text HOME to 741741',
    url: Platform.OS === 'web' ? 'sms:741741' : 'sms:741741?body=HOME',
    icon: 'chatbubble' as const,
    color: '#FF8A65',
  },
  {
    id: '3',
    title: 'Emergency Services',
    description: 'For immediate danger, call 911.',
    action: 'Call 911',
    url: 'tel:911',
    icon: 'medkit' as const,
    color: '#EF5350',
  },
];

const ADDITIONAL_RESOURCES = [
  { title: 'NAMI Helpline', info: '1-800-950-NAMI (6264)', url: 'tel:18009506264' },
  { title: 'SAMHSA Helpline', info: '1-800-662-4357', url: 'tel:18006624357' },
  { title: 'Veterans Crisis Line', info: 'Dial 988, then press 1', url: 'tel:988' },
];

const CACHE_KEY = 'cached_crisis_resources';

export default function CrisisScreen() {
  useEffect(() => {
    // Cache for offline
    try {
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ main: CRISIS_RESOURCES, additional: ADDITIONAL_RESOURCES })).catch(() => {});
    } catch { /* ignore */ }
  }, []);

  const handlePress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch { /* ignore */ }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Ionicons name="heart" size={32} color={colors.crisisRed} />
          <Text style={styles.title}>You Are Not Alone</Text>
          <Text style={styles.subtitle}>
            If you or someone you know is struggling, help is available right now. You matter, and people care about you.
          </Text>
        </View>

        {CRISIS_RESOURCES.map((resource) => (
          <Pressable
            key={resource.id}
            style={({ pressed }) => [styles.resourceCard, shadows.md, { borderLeftColor: resource.color }, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
            onPress={() => handlePress(resource.url)}
            accessibilityLabel={resource.title}
            accessibilityHint={resource.action}
            accessibilityRole="button"
          >
            <View style={[styles.iconCircle, { backgroundColor: resource.color }]}>
              <Ionicons name={resource.icon} size={28} color={colors.white} />
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <Text style={styles.resourceDesc}>{resource.description}</Text>
              <Text style={[styles.resourceAction, { color: resource.color }]}>{resource.action} →</Text>
            </View>
          </Pressable>
        ))}

        <View style={[styles.warningCard, shadows.sm]}>
          <Ionicons name="warning" size={20} color={colors.crisisOrange} />
          <Text style={styles.warningText}>
            If you are in immediate danger, please call 911 or go to your nearest emergency room.
          </Text>
        </View>

        <Text style={styles.additionalTitle}>Additional Resources</Text>
        {ADDITIONAL_RESOURCES.map((r) => (
          <Pressable
            key={r.title}
            style={({ pressed }) => [styles.additionalCard, shadows.sm, pressed && { opacity: 0.85 }]}
            onPress={() => handlePress(r.url)}
            accessibilityLabel={r.title}
            accessibilityRole="button"
          >
            <View>
              <Text style={styles.additionalName}>{r.title}</Text>
              <Text style={styles.additionalInfo}>{r.info}</Text>
            </View>
            <Ionicons name="call-outline" size={20} color={colors.primaryPurple} />
          </Pressable>
        ))}

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Remember: Asking for help is a sign of strength, not weakness. You deserve support. 💜
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerSection: { alignItems: 'center', marginBottom: spacing.xl, paddingHorizontal: spacing.md },
  title: { fontSize: 28, fontWeight: '700', color: colors.textDark, fontFamily, marginTop: spacing.sm },
  subtitle: { fontSize: 16, color: colors.textMedium, fontFamily, textAlign: 'center', lineHeight: 24, marginTop: spacing.sm },
  resourceCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginBottom: spacing.md, borderLeftWidth: 4, minHeight: 88,
  },
  iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  resourceContent: { flex: 1 },
  resourceTitle: { fontSize: 17, fontWeight: '700', color: colors.textDark, fontFamily },
  resourceDesc: { fontSize: 13, color: colors.textMedium, fontFamily, marginTop: 2, lineHeight: 20 },
  resourceAction: { fontSize: 15, fontWeight: '700', fontFamily, marginTop: spacing.xs },
  warningCard: {
    backgroundColor: '#FFF3E0', borderRadius: borderRadius.lg, padding: spacing.md,
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.lg,
  },
  warningText: { flex: 1, fontSize: 14, color: '#E65100', fontFamily, lineHeight: 22 },
  additionalTitle: { fontSize: 18, fontWeight: '700', color: colors.textDark, fontFamily, marginBottom: spacing.md },
  additionalCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.sm, minHeight: 56,
  },
  additionalName: { fontSize: 15, fontWeight: '600', color: colors.textDark, fontFamily },
  additionalInfo: { fontSize: 13, color: colors.textMedium, fontFamily },
  footerNote: { marginTop: spacing.lg, padding: spacing.md, alignItems: 'center' },
  footerText: { fontSize: 14, color: colors.textMedium, fontFamily, textAlign: 'center', lineHeight: 22 },
});
