import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, TextInput, Share, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { getAffirmationsApi } from '../../src/services/affirmations';
import { getFavoritesApi, toggleFavoriteApi } from '../../src/services/favorites';
import { colors, spacing, borderRadius, fontFamily, shadows, categories } from '../../src/theme';
import type { Affirmation } from '../../src/types';

const CACHE_KEY = 'cached_affirmations';

const cardGradients: readonly (readonly [string, string])[] = [
  ['#7B5EA7', '#A78BCA'],
  ['#5B8DB8', '#89B4D4'],
  ['#C97B9A', '#E8A8BE'],
  ['#3A9E5C', '#5BAF72'],
  ['#D4A843', '#E0C06A'],
] as const;

export default function AffirmationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Affirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'all' | 'favorites'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const searchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setSearchDebounced(text), 400);
  };

  const loadData = useCallback(async () => {
    try {
      if (tab === 'favorites') {
        const res = await getFavoritesApi();
        setItems(res?.items ?? []);
      } else {
        const res = await getAffirmationsApi(
          selectedCategory || undefined,
          searchDebounced || undefined,
        );
        setItems(res?.items ?? []);
        // cache for offline
        try { await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(res?.items ?? [])); } catch { /* ignore */ }
      }
    } catch {
      // try cached
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) setItems(JSON.parse(cached) ?? []);
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  }, [tab, selectedCategory, searchDebounced]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await toggleFavoriteApi(id);
      setItems((prev) =>
        (prev ?? []).map((item) =>
          item?.id === id ? { ...(item ?? {}), isFavorited: res?.isFavorited ?? false } : item,
        ).filter((item) => tab !== 'favorites' || item?.isFavorited),
      );
    } catch { /* ignore */ }
  };

  const handleShare = async (text: string) => {
    try {
      await Share.share({ message: `"${text}" \n\n\u{1F49C} Beautiful You` });
    } catch { /* ignore */ }
  };

  const renderItem = ({ item, index }: { item: Affirmation; index: number }) => {
    const grad = cardGradients[index % cardGradients.length];
    return (
      <Pressable
        style={({ pressed }) => [styles.card, shadows.md, pressed && { transform: [{ scale: 0.98 }] }]}
        onPress={() => router.push({ pathname: '/affirmation-detail', params: { id: item?.id ?? '' } })}
        accessibilityLabel={`Affirmation: ${item?.text ?? ''}`}
        accessibilityRole="button"
      >
        <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardGradient}>
          <Text style={styles.cardText}>"{item?.text ?? ''}"</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardCategory}>{item?.category ?? ''}</Text>
            <View style={styles.cardActions}>
              <Pressable
                onPress={() => handleToggleFavorite(item?.id ?? '')}
                style={styles.iconBtn}
                accessibilityLabel={item?.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                accessibilityRole="button"
              >
                <Ionicons name={item?.isFavorited ? 'heart' : 'heart-outline'} size={22} color={colors.white} />
              </Pressable>
              <Pressable
                onPress={() => handleShare(item?.text ?? '')}
                style={styles.iconBtn}
                accessibilityLabel="Share affirmation"
                accessibilityRole="button"
              >
                <Ionicons name="share-outline" size={22} color={colors.white} />
              </Pressable>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Affirmations</Text>

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tab, tab === 'all' && styles.tabActive]}
            onPress={() => setTab('all')}
            accessibilityRole="tab"
          >
            <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>All</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === 'favorites' && styles.tabActive]}
            onPress={() => setTab('favorites')}
            accessibilityRole="tab"
          >
            <Text style={[styles.tabText, tab === 'favorites' && styles.tabTextActive]}>Favorites</Text>
          </Pressable>
        </View>

        {/* Search */}
        {tab === 'all' ? (
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={handleSearch}
              placeholder="Search affirmations..."
              placeholderTextColor={colors.textLight}
              accessibilityLabel="Search affirmations"
            />
          </View>
        ) : null}

        {/* Categories */}
        {tab === 'all' ? (
          <FlatList
            horizontal
            data={['', ...categories]}
            keyExtractor={(item) => item || 'all'}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            renderItem={({ item: cat }) => (
              <Pressable
                style={[styles.chip, selectedCategory === cat && styles.chipActive]}
                onPress={() => setSelectedCategory(cat)}
                accessibilityRole="button"
                accessibilityLabel={cat || 'All categories'}
              >
                <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
                  {cat || 'All'}
                </Text>
              </Pressable>
            )}
          />
        ) : null}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryPurple} /></View>
      ) : (items?.length ?? 0) === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>{tab === 'favorites' ? '❤️' : '🔍'}</Text>
          <Text style={styles.emptyText}>
            {tab === 'favorites' ? 'No favorites yet. Heart an affirmation to save it here!' : 'No affirmations found.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items ?? []}
          keyExtractor={(item) => item?.id ?? Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryPurple} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerContainer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  title: { fontSize: 28, fontWeight: '700', color: colors.textDark, fontFamily, marginBottom: spacing.md },
  tabRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primaryPurple, borderColor: colors.primaryPurple },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textMedium, fontFamily },
  tabTextActive: { color: colors.white },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border, marginBottom: spacing.sm, minHeight: 44 },
  searchIcon: { marginLeft: spacing.md },
  searchInput: { flex: 1, paddingHorizontal: spacing.sm, paddingVertical: 10, fontSize: 15, color: colors.textDark, fontFamily },
  chips: { gap: spacing.sm, paddingBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: borderRadius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.lightPurple, borderColor: colors.primaryPurple },
  chipText: { fontSize: 13, color: colors.textMedium, fontFamily },
  chipTextActive: { color: colors.primaryPurple, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: 16, color: colors.textMedium, fontFamily, textAlign: 'center' },
  list: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.md, paddingBottom: spacing.xxl },
  card: { borderRadius: borderRadius.lg, overflow: 'hidden' },
  cardGradient: { padding: spacing.lg, minHeight: 130, justifyContent: 'space-between' },
  cardText: { fontSize: 16, fontWeight: '600', color: colors.white, fontFamily, lineHeight: 24 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  cardCategory: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily },
  cardActions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
});
