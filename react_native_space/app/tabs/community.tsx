import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, FlatList, TextInput, Alert,
  KeyboardAvoidingView, Platform, Modal, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { colors, spacing, borderRadius, fontFamily, shadows } from '../../src/theme';
import { getPostsApi, createPostApi, reactToPostApi, reportPostApi, deletePostApi } from '../../src/services/community';
import { getApiErrorMessage } from '../../src/services/api';
import type { CommunityPost } from '../../src/types';
import { COMMUNITY_CATEGORIES } from '../../src/types';

const heroCommunity = require('../../assets/images/hero-community.png');

const ANON_NAMES = [
  'Gentle Soul', 'Brave Heart', 'Quiet Warrior', 'Rising Star', 'Hopeful Spirit',
  'Healing Light', 'Kind Mind', 'Peaceful Wave', 'Strong Root', 'Bright Bloom',
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function CommunityScreen() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [posting, setPosting] = useState(false);
  const loadedRef = useRef(false);

  const loadPosts = useCallback(async (cat?: string, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (!loadedRef.current) setLoading(true);
      const res = await getPostsApi(cat ?? category);
      setPosts(res?.items ?? []);
      setTotal(res?.total ?? 0);
      loadedRef.current = true;
    } catch { /* ignore */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useFocusEffect(
    useCallback(() => {
      loadPosts(category);
    }, [loadPosts, category]),
  );

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    loadPosts(cat);
  };

  const handlePost = async () => {
    if (!newContent?.trim()) return;
    setPosting(true);
    try {
      const randomName = ANON_NAMES[Math.floor(Math.random() * ANON_NAMES.length)];
      await createPostApi(newContent.trim(), newCategory, randomName);
      setNewContent('');
      setShowCompose(false);
      await loadPosts(category, true);
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err));
    } finally {
      setPosting(false);
    }
  };

  const handleReact = async (postId: string, type: 'heart' | 'hug') => {
    try {
      const res = await reactToPostApi(postId, type);
      setPosts((prev) =>
        (prev ?? []).map((p) => {
          if (p?.id !== postId) return p;
          const countKey = type === 'heart' ? 'heartsCount' : 'hugsCount';
          return {
            ...p,
            [countKey]: res?.reacted ? (p?.[countKey] ?? 0) + 1 : Math.max(0, (p?.[countKey] ?? 0) - 1),
            userReacted: { ...(p?.userReacted ?? {}), [type]: res?.reacted ?? false },
          };
        }),
      );
    } catch { /* ignore */ }
  };

  const handleReport = (postId: string) => {
    Alert.alert(
      'Report Post',
      'Are you sure you want to report this post as inappropriate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: async () => {
            try {
              await reportPostApi(postId, 'Inappropriate content');
              Alert.alert('Reported', 'Thank you. Our team will review this post.');
            } catch (err) {
              Alert.alert('Error', getApiErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  const handleDelete = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePostApi(postId);
              setPosts((prev) => (prev ?? []).filter((p) => p?.id !== postId));
            } catch (err) {
              Alert.alert('Error', getApiErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <View style={[styles.postCard, shadows.sm]}>
      <View style={styles.postHeader}>
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarSmallText}>{(item?.displayName ?? 'A')?.[0]}</Text>
        </View>
        <View style={styles.postHeaderText}>
          <Text style={styles.postAuthor}>{item?.displayName ?? 'Anonymous'}</Text>
          <Text style={styles.postTime}>{timeAgo(item?.createdAt ?? '')}</Text>
        </View>
        <View style={styles.postCatBadge}>
          <Text style={styles.postCatText}>{item?.category ?? 'general'}</Text>
        </View>
      </View>

      <Text style={styles.postContent}>{item?.content ?? ''}</Text>

      <View style={styles.postActions}>
        <Pressable
          style={styles.reactionBtn}
          onPress={() => handleReact(item?.id ?? '', 'heart')}
          accessibilityLabel="Send heart"
        >
          <Ionicons
            name={item?.userReacted?.heart ? 'heart' : 'heart-outline'}
            size={20}
            color={item?.userReacted?.heart ? colors.crisisRed : colors.textLight}
          />
          <Text style={[styles.reactionCount, item?.userReacted?.heart && { color: colors.crisisRed }]}>
            {item?.heartsCount ?? 0}
          </Text>
        </Pressable>

        <Pressable
          style={styles.reactionBtn}
          onPress={() => handleReact(item?.id ?? '', 'hug')}
          accessibilityLabel="Send hug"
        >
          <Text style={{ fontSize: 18 }}>{item?.userReacted?.hug ? '🤗' : '🫂'}</Text>
          <Text style={[styles.reactionCount, item?.userReacted?.hug && { color: colors.primaryPurple }]}>
            {item?.hugsCount ?? 0}
          </Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        {item?.isOwn ? (
          <Pressable onPress={() => handleDelete(item?.id ?? '')} style={styles.moreBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.textLight} />
          </Pressable>
        ) : (
          <Pressable onPress={() => handleReport(item?.id ?? '')} style={styles.moreBtn}>
            <Ionicons name="flag-outline" size={18} color={colors.textLight} />
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header with hero */}
      <View style={styles.headerWrap}>
        <Image source={heroCommunity} style={styles.heroImage} contentFit="cover" />
        <LinearGradient colors={['rgba(123,94,167,0.85)', 'rgba(92,61,143,0.8)']} style={styles.heroOverlay}>
          <View style={styles.headerContent}>
            <Ionicons name="people" size={28} color={colors.white} />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text style={styles.headerTitle}>The Quiet Room</Text>
              <Text style={styles.headerSub}>A safe space to share and support</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{total}</Text>
              <Text style={styles.countLabel}>posts</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Community Guidelines */}
      <View style={styles.guidelinesBar}>
        <Ionicons name="information-circle" size={16} color={colors.primaryPurple} />
        <Text style={styles.guidelinesText}>
          Be kind. Be anonymous. Be supportive. No judgment here. 💜
        </Text>
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={COMMUNITY_CATEGORIES}
        keyExtractor={(item) => item?.id ?? ''}
        contentContainerStyle={styles.catList}
        renderItem={({ item: cat, index }) => {
          const isActive = category === cat?.id;
          const pillBgs = [
            colors.primaryPink,
            colors.primaryPurple,
            colors.deepPink,
            colors.lightPurple,
            colors.deepPurple,
            colors.primaryPink,
            colors.primaryPurple,
          ];
          const activeBg = pillBgs[index % pillBgs.length] ?? colors.primaryPink;
          return (
            <Pressable
              style={[styles.catPill, isActive && { backgroundColor: activeBg, borderColor: activeBg }]}
              onPress={() => handleCategoryChange(cat?.id ?? 'all')}
            >
              <Ionicons name={cat?.icon as keyof typeof Ionicons.glyphMap} size={12} color={isActive ? colors.white : colors.textMedium} />
              <Text style={[styles.catPillText, isActive && styles.catPillTextActive]}>{cat?.label ?? ''}</Text>
            </Pressable>
          );
        }}
      />

      {/* Posts */}
      <FlatList
        data={posts ?? []}
        keyExtractor={(item) => item?.id ?? ''}
        renderItem={renderPost}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={[styles.pinnedCard, shadows.sm]}>
            <LinearGradient colors={colors.gradientBrand} style={styles.pinnedGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.pinnedBadge}>
                <Ionicons name="pin" size={10} color={colors.white} />
                <Text style={styles.pinnedBadgeText}>Pinned</Text>
              </View>
              <Text style={styles.pinnedTitle}>Welcome to The Quiet Room 💜</Text>
              <Text style={styles.pinnedBody}>
                This is your safe space. Share what's on your heart — no names, no judgment. Whether you're having a tough day or just need to vent, we're here. You're not alone in this. 🤍
              </Text>
            </LinearGradient>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPosts(category, true)}
            tintColor={colors.primaryPurple}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Loading...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>Be the first to share your story.</Text>
            </View>
          )
        }
      />

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, shadows.lg, pressed && { transform: [{ scale: 0.95 }] }]}
        onPress={() => setShowCompose(true)}
        accessibilityLabel="Write a post"
        accessibilityRole="button"
      >
        <LinearGradient colors={colors.gradientPurple} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color={colors.white} />
        </LinearGradient>
      </Pressable>

      {/* Compose Modal */}
      <Modal visible={showCompose} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Your Thoughts</Text>
              <Pressable onPress={() => setShowCompose(false)}>
                <Ionicons name="close" size={24} color={colors.textDark} />
              </Pressable>
            </View>

            <Text style={styles.modalHint}>
              Your identity stays anonymous. Choose a category that fits.
            </Text>

            {/* Category Select */}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={COMMUNITY_CATEGORIES.filter((c) => c.id !== 'all')}
              keyExtractor={(item) => item?.id ?? ''}
              contentContainerStyle={{ paddingVertical: spacing.sm, gap: 6 }}
              renderItem={({ item: cat, index }) => {
                const isActive = newCategory === cat?.id;
                const pillBgs = [colors.primaryPink, colors.primaryPurple, colors.deepPink, colors.lightPurple, colors.deepPurple, colors.primaryPink];
                const activeBg = pillBgs[index % pillBgs.length] ?? colors.primaryPink;
                return (
                  <Pressable
                    style={[styles.catPill, isActive && { backgroundColor: activeBg, borderColor: activeBg }]}
                    onPress={() => setNewCategory(cat?.id ?? 'general')}
                  >
                    <Text style={[styles.catPillText, isActive && styles.catPillTextActive]}>{cat?.label ?? ''}</Text>
                  </Pressable>
                );
              }}
            />

            <TextInput
              style={styles.composeInput}
              placeholder="What's on your mind? This is your safe space..."
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={1000}
              value={newContent}
              onChangeText={setNewContent}
              textAlignVertical="top"
            />

            <Text style={styles.charCount}>{(newContent?.length ?? 0)}/1000</Text>

            <Pressable
              style={({ pressed }) => [
                styles.postBtn,
                (!newContent?.trim() || posting) && styles.postBtnDisabled,
                pressed && { opacity: 0.9 },
              ]}
              onPress={handlePost}
              disabled={!newContent?.trim() || posting}
            >
              <LinearGradient colors={colors.gradientPurple} style={styles.postBtnGradient}>
                <Text style={styles.postBtnText}>
                  {posting ? 'Posting...' : 'Share Anonymously'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerWrap: { height: 110, position: 'relative' },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', paddingHorizontal: spacing.lg },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.white, fontFamily },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily, marginTop: 2 },
  countBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: borderRadius.md, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, alignItems: 'center' },
  countText: { fontSize: 18, fontWeight: '700', color: colors.white, fontFamily },
  countLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontFamily },
  guidelinesBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  guidelinesText: { fontSize: 12, color: colors.textMedium, fontFamily, flex: 1 },
  catList: { paddingHorizontal: spacing.md, paddingVertical: 4, gap: 6 },
  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 6, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  catPillText: { fontSize: 11, fontWeight: '600', color: colors.textMedium, fontFamily },
  catPillTextActive: { color: colors.white, fontWeight: '700' },
  pinnedCard: { marginHorizontal: 0, marginBottom: spacing.md, borderRadius: borderRadius.lg, overflow: 'hidden' },
  pinnedGradient: { padding: spacing.md, borderRadius: borderRadius.lg },
  pinnedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: spacing.xs },
  pinnedBadgeText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.85)', fontFamily, textTransform: 'uppercase', letterSpacing: 0.5 },
  pinnedTitle: { fontSize: 16, fontWeight: '700', color: colors.white, fontFamily, marginBottom: spacing.xs },
  pinnedBody: { fontSize: 13, color: 'rgba(255,255,255,0.92)', fontFamily, lineHeight: 20 },
  listContent: { padding: spacing.lg, paddingBottom: 100 },
  postCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md,
    marginBottom: spacing.md,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatarSmall: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.lightPurple, justifyContent: 'center', alignItems: 'center',
  },
  avatarSmallText: { fontSize: 16, fontWeight: '700', color: colors.white, fontFamily },
  postHeaderText: { flex: 1, marginLeft: spacing.sm },
  postAuthor: { fontSize: 14, fontWeight: '600', color: colors.textDark, fontFamily },
  postTime: { fontSize: 11, color: colors.textLight, fontFamily },
  postCatBadge: {
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  postCatText: { fontSize: 10, fontWeight: '600', color: colors.textMedium, fontFamily, textTransform: 'capitalize' },
  postContent: { fontSize: 15, color: colors.textDark, fontFamily, lineHeight: 22, marginBottom: spacing.sm },
  postActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border },
  reactionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: spacing.xs },
  reactionCount: { fontSize: 13, fontWeight: '600', color: colors.textLight, fontFamily },
  moreBtn: { padding: spacing.xs },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.textDark, fontFamily, marginTop: spacing.md },
  emptyText: { fontSize: 14, color: colors.textLight, fontFamily, marginTop: spacing.xs },
  fab: { position: 'absolute', bottom: 24, right: 24, borderRadius: 30, overflow: 'hidden' },
  fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: {
    backgroundColor: colors.white, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg, maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textDark, fontFamily },
  modalHint: { fontSize: 13, color: colors.textLight, fontFamily, marginBottom: spacing.xs },
  composeInput: {
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.md,
    padding: spacing.md, fontSize: 15, fontFamily, color: colors.textDark,
    minHeight: 120, maxHeight: 200, borderWidth: 1, borderColor: colors.border,
  },
  charCount: { fontSize: 11, color: colors.textLight, fontFamily, textAlign: 'right', marginTop: 4 },
  postBtn: { marginTop: spacing.md, borderRadius: borderRadius.md, overflow: 'hidden' },
  postBtnDisabled: { opacity: 0.5 },
  postBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  postBtnText: { fontSize: 16, fontWeight: '700', color: colors.white, fontFamily },
});
