import React, { useState, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, RefreshControl,
  Linking, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { getDailyAffirmationApi } from '../../src/services/affirmations';
import { getTodayMoodApi } from '../../src/services/moods';
import { colors, spacing, borderRadius, fontFamily, shadows, moodEmojis, moodLabels } from '../../src/theme';
import type { Affirmation, MoodEntry } from '../../src/types';

const heroWellness = require('../../assets/images/hero-wellness.png');
const heroAffirmation = require('../../assets/images/hero-affirmation.png');
const heroCommunity = require('../../assets/images/hero-community.png');

const tips = [
  'Take 5 deep breaths when feeling overwhelmed. Inhale for 4, hold for 4, exhale for 4.',
  'Remember: It\'s okay to not be okay. Your feelings are valid.',
  'Try to spend at least 10 minutes outside today. Nature heals.',
  'Write down three things you\'re grateful for before bed tonight.',
  'Hydration matters for your mental health. Drink a glass of water now.',
  'Stretch your body for 5 minutes. Physical tension often mirrors emotional tension.',
  'Call or text someone you care about today. Connection is medicine.',
  'Put your phone down for 30 minutes. Your mind deserves a break from the noise.',
  'Say one kind thing to yourself right now. You deserve the same love you give others.',
  'Try the 5-4-3-2-1 grounding technique: 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.',
  'It\'s okay to set boundaries. Saying no is an act of self-care.',
  'Movement is medicine. Even a 10-minute walk can shift your mood.',
  'You don\'t have to have it all figured out. Progress isn\'t always linear.',
  'Listen to a song that makes you feel something. Music is therapy.',
  'Forgive yourself for yesterday. Today is a fresh start.',
  'You are not your thoughts. You are the one observing them.',
  'Rest is productive. You can\'t pour from an empty cup.',
  'Celebrate small wins today. Every step forward counts.',
  'Your presence matters to someone. Never forget that.',
  'Take a moment to unclench your jaw, drop your shoulders, and breathe.',
  'You survived 100% of your worst days. That\'s a pretty good track record.',
  'Try journaling for 5 minutes. Let your thoughts flow without judgment.',
  'Smile at a stranger today. Kindness is contagious.',
  'You are enough, exactly as you are right now.',
  'Do one thing today that your future self will thank you for.',
  'It\'s okay to ask for help. Strength isn\'t carrying everything alone.',
  'Notice the beauty around you. There\'s always something if you look.',
  'Your feelings are visitors. Let them come and go without judgment.',
  'Be patient with yourself. Healing takes time, and that\'s okay.',
  'You are worthy of love, belonging, and joy — no exceptions.',
  'Close your eyes for 60 seconds and just breathe. You earned this pause.',
];

function getTipOfDay(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return tips[dayOfYear % tips.length] ?? tips[0];
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [dailyAffirmation, setDailyAffirmation] = useState<Affirmation | null>(null);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [affRes, moodRes] = await Promise.allSettled([
        getDailyAffirmationApi(),
        getTodayMoodApi(),
      ]);
      if (affRes.status === 'fulfilled') setDailyAffirmation(affRes.value?.affirmation ?? null);
      if (moodRes.status === 'fulfilled') setTodayMood(moodRes.value?.mood ?? null);
    } catch { /* ignore */ }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const greeting = user?.isGuest ? 'Welcome!' : `Hello, ${user?.name ?? 'there'}!`;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryPurple} />}
      >
        {/* Header with logo */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.date}>{dateStr}</Text>
          </View>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logoSmall}
            resizeMode="contain"
          />
        </View>

        {/* Hero Card */}
        <Pressable
          style={({ pressed }) => [pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}
          onPress={() => router.push('/tabs/community')}
        >
          <View style={[styles.heroCard, shadows.md]}>
            <Image source={heroWellness} style={styles.heroImage} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(92,61,143,0.85)'] as const}
              style={styles.heroOverlay}
            >
              <Text style={styles.heroTitle}>You Are Not Alone</Text>
              <Text style={styles.heroSub}>Join our supportive community of people who understand</Text>
            </LinearGradient>
          </View>
        </Pressable>

        {/* Daily Affirmation with image */}
        {dailyAffirmation ? (
          <Pressable
            style={({ pressed }) => [pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}
            onPress={() => router.push({ pathname: '/affirmation-detail', params: { id: dailyAffirmation?.id ?? '' } })}
          >
            <View style={[styles.affirmationCard, shadows.md]}>
              <Image source={heroAffirmation} style={styles.affirmationImage} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(123,94,167,0.9)'] as const}
                style={styles.affirmationOverlay}
              >
                <Text style={styles.affirmationLabel}>{"\u2728 Daily Affirmation"}</Text>
                <Text style={styles.affirmationText}>{`\u201C${dailyAffirmation?.text ?? ''}\u201D`}</Text>
                <Text style={styles.affirmationCat}>{dailyAffirmation?.category ?? ''}</Text>
              </LinearGradient>
            </View>
          </Pressable>
        ) : null}

        {/* Today's Mood */}
        <Pressable
          style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          onPress={() => router.push('/tabs/mood')}
        >
          <View style={[styles.moodCard, shadows.sm]}>
            {todayMood ? (
              <>
                <View>
                  <Text style={styles.moodCardLabel}>Today's Mood</Text>
                  <Text style={styles.moodSub}>Tap to update or view history</Text>
                </View>
                <View style={styles.moodRow}>
                  <Text style={styles.moodEmoji}>{moodEmojis[todayMood?.moodLevel ?? 3]}</Text>
                  <Text style={styles.moodText}>{moodLabels[todayMood?.moodLevel ?? 3]}</Text>
                </View>
              </>
            ) : (
              <>
                <View>
                  <Text style={styles.moodCardLabel}>How are you feeling?</Text>
                  <Text style={styles.moodSub}>Tap to log your mood</Text>
                </View>
                <View style={[styles.moodBtnSmall]}>
                  <Text style={styles.moodBtnText}>Log Mood</Text>
                </View>
              </>
            )}
          </View>
        </Pressable>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Explore</Text>
        <View style={styles.quickGrid}>
          <Pressable style={({ pressed }) => [styles.featureCard, shadows.sm, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]} onPress={() => router.push('/tabs/affirmations')}>
            <LinearGradient colors={colors.gradientBrand} style={styles.featureGradient}>
              <Ionicons name="sparkles" size={26} color={colors.white} />
            </LinearGradient>
            <Text style={styles.featureLabel}>Affirmations</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.featureCard, shadows.sm, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]} onPress={() => router.push('/tabs/community')}>
            <LinearGradient colors={colors.gradientPurple} style={styles.featureGradient}>
              <Ionicons name="people" size={26} color={colors.white} />
            </LinearGradient>
            <Text style={styles.featureLabel}>Community</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.featureCard, shadows.sm, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]} onPress={() => router.push('/tabs/chat')}>
            <LinearGradient colors={colors.gradientPink} style={styles.featureGradient}>
              <Ionicons name="chatbubbles" size={26} color={colors.white} />
            </LinearGradient>
            <Text style={styles.featureLabel}>Chat</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.featureCard, shadows.sm, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]} onPress={() => router.push('/tabs/resources')}>
            <LinearGradient colors={colors.gradientBlue} style={styles.featureGradient}>
              <Ionicons name="library" size={26} color={colors.white} />
            </LinearGradient>
            <Text style={styles.featureLabel}>Resources</Text>
          </Pressable>
        </View>

        {/* Community Preview */}
        <Pressable
          style={({ pressed }) => [pressed && { opacity: 0.95 }]}
          onPress={() => router.push('/tabs/community')}
        >
          <View style={[styles.communityCard, shadows.sm]}>
            <Image source={heroCommunity} style={styles.communityImage} resizeMode="cover" />
            <View style={styles.communityContent}>
              <Text style={styles.communityTitle}>The Quiet Room</Text>
              <Text style={styles.communityDesc}>Share anonymously. Support each other. You belong here.</Text>
              <View style={styles.communityAction}>
                <Text style={styles.communityActionText}>Join the conversation</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primaryPurple} />
              </View>
            </View>
          </View>
        </Pressable>

        {/* Wellness Tip */}
        <View style={[styles.tipCard, shadows.sm]}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={20} color={colors.primaryPink} />
            <Text style={styles.tipLabel}>Wellness Tip</Text>
          </View>
          <Text style={styles.tipText}>{getTipOfDay()}</Text>
        </View>

        {/* Crisis Hotline */}
        <Pressable
          style={[styles.crisisBanner, shadows.sm]}
          onPress={() => { Linking.openURL('tel:988').catch(() => {}); }}
          accessibilityLabel="Call 988 Suicide and Crisis Lifeline"
          accessibilityRole="button"
        >
          <View style={styles.crisisBannerIcon}>
            <Ionicons name="call" size={20} color={colors.white} />
          </View>
          <View style={styles.crisisBannerContent}>
            <Text style={styles.crisisBannerTitle}>Need help now?</Text>
            <Text style={styles.crisisBannerText}>Call or text 988 \u2014 free, confidential, 24/7</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.crisisRed} />
        </Pressable>

        {/* Disclaimer */}
        <Pressable style={styles.disclaimerCard} onPress={() => router.push('/terms')} accessibilityLabel="View terms">
          <Ionicons name="information-circle" size={16} color={colors.textLight} />
          <Text style={styles.disclaimerText}>
            Beautiful You is not a replacement for professional mental health care. If you are in crisis, please use our Crisis resources or call 988.
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  greeting: { fontSize: 26, fontWeight: '700', color: colors.textDark, fontFamily },
  date: { fontSize: 14, color: colors.textMedium, fontFamily, marginTop: 2 },
  logoSmall: { width: 44, height: 44, borderRadius: 22 },
  // Hero
  heroCard: { borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.md, height: 180 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.lg, paddingTop: spacing.xxl,
  },
  heroTitle: { fontSize: 22, fontWeight: '700', color: colors.white, fontFamily },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontFamily, marginTop: 4 },
  // Affirmation
  affirmationCard: { borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.md, height: 160 },
  affirmationImage: { width: '100%', height: '100%' },
  affirmationOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.md, paddingTop: spacing.xl,
  },
  affirmationLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)', fontFamily },
  affirmationText: { fontSize: 16, fontWeight: '600', color: colors.white, fontFamily, lineHeight: 22, marginTop: 4 },
  affirmationCat: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily, marginTop: 4 },
  // Mood
  moodCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md,
    marginBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  moodCardLabel: { fontSize: 15, fontWeight: '600', color: colors.textDark, fontFamily },
  moodSub: { fontSize: 11, color: colors.textLight, fontFamily, marginTop: 2 },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  moodEmoji: { fontSize: 28 },
  moodText: { fontSize: 16, fontWeight: '600', color: colors.textDark, fontFamily },
  moodBtnSmall: {
    backgroundColor: colors.primaryPink, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: 6,
  },
  moodBtnText: { fontSize: 13, fontWeight: '600', color: colors.white, fontFamily },
  // Explore Grid
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textDark, fontFamily, marginBottom: spacing.md },
  quickGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  featureCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.lg,
    alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.xs,
  },
  featureGradient: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  featureLabel: { fontSize: 11, fontWeight: '600', color: colors.textDark, fontFamily, marginTop: spacing.xs, textAlign: 'center' },
  // Community Preview
  communityCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg, overflow: 'hidden',
    marginBottom: spacing.md,
  },
  communityImage: { width: '100%', height: 100 },
  communityContent: { padding: spacing.md },
  communityTitle: { fontSize: 17, fontWeight: '700', color: colors.textDark, fontFamily },
  communityDesc: { fontSize: 13, color: colors.textMedium, fontFamily, marginTop: 4, lineHeight: 20 },
  communityAction: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  communityActionText: { fontSize: 13, fontWeight: '600', color: colors.primaryPurple, fontFamily },
  // Tip
  tipCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  tipLabel: { fontSize: 14, fontWeight: '600', color: colors.primaryPink, fontFamily },
  tipText: { fontSize: 14, color: colors.textMedium, fontFamily, lineHeight: 22 },
  // Crisis
  crisisBanner: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderLeftWidth: 4, borderLeftColor: colors.crisisRed, marginBottom: spacing.md,
  },
  crisisBannerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.crisisRed, justifyContent: 'center', alignItems: 'center' },
  crisisBannerContent: { flex: 1 },
  crisisBannerTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark, fontFamily },
  crisisBannerText: { fontSize: 12, color: colors.textMedium, fontFamily, marginTop: 1 },
  disclaimerCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.md,
  },
  disclaimerText: { flex: 1, fontSize: 11, color: colors.textLight, fontFamily, lineHeight: 17 },
});
