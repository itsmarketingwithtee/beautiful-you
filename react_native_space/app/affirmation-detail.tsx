import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Share, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAffirmationByIdApi } from '../src/services/affirmations';
import { toggleFavoriteApi } from '../src/services/favorites';
import { colors, spacing, borderRadius, fontFamily } from '../src/theme';
import type { Affirmation } from '../src/types';

export default function AffirmationDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    (async () => {
      try {
        const data = await getAffirmationByIdApi(id);
        setAffirmation(data ?? null);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleFavorite = async () => {
    if (!affirmation?.id) return;
    try {
      const res = await toggleFavoriteApi(affirmation.id);
      setAffirmation((prev) => prev ? { ...prev, isFavorited: res?.isFavorited ?? false } : prev);
    } catch { /* ignore */ }
  };

  const handleShare = async () => {
    if (!affirmation?.text) return;
    setSharing(true);
    try {
      const shareText = `\u201C${affirmation.text}\u201D\n\n\u{1F49C} Beautiful You\nYour Journey to Inner Peace\n\n#BeautifulYou #MentalHealth #Affirmations #SelfLove`;
      await Share.share({
        message: shareText,
        ...(Platform.OS === 'ios' ? { url: '' } : {}),
      });
    } catch { /* ignore */ } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primaryPurple} />
      </View>
    );
  }

  if (!affirmation) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Affirmation not found.</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#5C3D8F', '#7B5EA7', '#C97B9A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn} accessibilityLabel="Close" accessibilityRole="button">
            <Ionicons name="close" size={28} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{affirmation?.category ?? ''}</Text>
          <LinearGradient
            colors={['#5C3D8F', '#7B5EA7', '#A78BCA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shareableCard}
          >
            <View style={styles.shareableInner}>
              <Text style={styles.shareableQuote}>{"\u201C"}</Text>
              <Text style={styles.shareableText}>{affirmation?.text ?? ''}</Text>
              <Text style={styles.shareableQuote}>{"\u201D"}</Text>
            </View>
            <View style={styles.shareableBrand}>
              <Ionicons name="flower-outline" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.shareableBrandText}>Beautiful You</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
            onPress={handleFavorite}
            accessibilityLabel={affirmation?.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityRole="button"
          >
            <Ionicons name={affirmation?.isFavorited ? 'heart' : 'heart-outline'} size={28} color={colors.white} />
            <Text style={styles.actionText}>{affirmation?.isFavorited ? 'Favorited' : 'Favorite'}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
            onPress={handleShare}
            disabled={sharing}
            accessibilityLabel="Share affirmation"
            accessibilityRole="button"
          >
            {sharing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Ionicons name="share-outline" size={28} color={colors.white} />
            )}
            <Text style={styles.actionText}>Share</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.xl },
  errorText: { fontSize: 16, color: colors.textMedium, fontFamily, marginBottom: spacing.md },
  backBtn: { backgroundColor: colors.primaryPurple, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.lg },
  backBtnText: { color: colors.white, fontSize: 16, fontWeight: '600', fontFamily },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  closeBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
  category: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)', fontFamily, textAlign: 'center', marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 2 },
  shareableCard: {
    borderRadius: borderRadius.xl, padding: spacing.xl, marginHorizontal: spacing.sm,
    minHeight: 250, justifyContent: 'center',
  },
  shareableInner: { alignItems: 'center', paddingHorizontal: spacing.md },
  shareableQuote: { fontSize: 48, color: 'rgba(255,255,255,0.3)', fontFamily, lineHeight: 50 },
  shareableText: {
    fontSize: 22, fontWeight: '700', color: colors.white, fontFamily,
    textAlign: 'center', lineHeight: 34, marginVertical: spacing.sm,
  },
  shareableBrand: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, marginTop: spacing.lg,
  },
  shareableBrandText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily, fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xxl, paddingBottom: spacing.xl },
  actionBtn: { alignItems: 'center', gap: spacing.xs, minWidth: 80, minHeight: 56 },
  actionText: { fontSize: 13, color: colors.white, fontFamily, fontWeight: '600' },
});
