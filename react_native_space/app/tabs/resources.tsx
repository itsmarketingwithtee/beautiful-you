import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, FlatList, Linking, TextInput,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { colors, spacing, borderRadius, fontFamily, shadows } from '../../src/theme';
import { getResourcesApi, getCategoriesApi } from '../../src/services/resources';
import type { MentalHealthResource, ResourceCategory } from '../../src/types';

const heroResources = require('../../assets/images/hero-resources.png');

/* -------- smart resource helper logic -------- */

interface ChatBubble {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const SENSITIVE_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'self-harm', 'cutting',
  'overdose', 'hurt myself', 'not worth living', 'no reason to live',
];

const TOPIC_MAP: Record<string, string[]> = {
  anxiety: ['anxiety', 'anxious', 'panic', 'worry', 'worried', 'stress', 'stressed', 'overwhelm', 'nervous', 'ptsd', 'trauma'],
  depression: ['depression', 'depressed', 'sad', 'hopeless', 'empty', 'numb', 'bipolar', 'mood'],
  abuse: ['abuse', 'domestic violence', 'assault', 'rape', 'violence', 'victim', 'child abuse', 'safety'],
  suicide_prevention: ['suicide', 'crisis', 'lifeline', '988', 'crisis text', 'emergency', 'suicidal'],
  substance_use: ['substance', 'alcohol', 'drug', 'addiction', 'sober', 'recovery', 'rehab', 'aa', 'na'],
  eating_body: ['eating disorder', 'anorexia', 'bulimia', 'body image', 'binge'],
  isolation: ['lonely', 'loneliness', 'alone', 'isolated', 'no friends'],
  general: ['wellness', 'health', 'kids', 'teen', 'parent', 'youth', 'general'],
};

function findMatchingResources(query: string, resources: MentalHealthResource[]): MentalHealthResource[] {
  const q = (query ?? '').toLowerCase();
  // Score each resource
  const scored = (resources ?? []).map((r) => {
    let score = 0;
    if ((r?.title ?? '').toLowerCase().includes(q)) score += 3;
    if ((r?.description ?? '').toLowerCase().includes(q)) score += 2;
    (r?.tags ?? []).forEach((t) => { if (t?.toLowerCase()?.includes(q)) score += 2; });
    // Check topic map
    for (const [cat, keywords] of Object.entries(TOPIC_MAP)) {
      if (keywords.some((kw) => q.includes(kw)) && r?.category === cat) score += 3;
    }
    return { resource: r, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 3).map((s) => s.resource);
}

function isSensitive(text: string): boolean {
  const lower = (text ?? '').toLowerCase();
  return SENSITIVE_KEYWORDS.some((kw) => lower.includes(kw));
}

function buildAiResponse(query: string, matches: MentalHealthResource[]): string {
  const q = (query ?? '').toLowerCase();

  // Sensitive / crisis
  if (isSensitive(q)) {
    return 'You matter, and what you\'re feeling right now is real. You don\'t have to go through this alone. Please reach out right now:\n\n\u260E\uFE0F Call or text **988** (Suicide & Crisis Lifeline \u2014 24/7)\n\u{1F4AC} Text CONNECT to **741741** (Crisis Text Line \u2014 24/7)\n\nYou can also go to our **Chat** tab and tap **"Talk to Us"** to speak with someone who cares. There are people who want to help. \u{1F49C}';
  }

  if ((matches?.length ?? 0) === 0) {
    return `I couldn\'t find specific resources for "${query}", but here are some things you can try:\n\n\u{1F50D} Use the **search bar** above to browse by keyword\n\u{1F4CB} Filter by **category** (Anxiety, Depression, Abuse, etc.)\n\u{1F4AC} Go to **Chat > Talk to Us** to speak with our team\n\nWe\'re here to help! \u{1F49C}`;
  }

  let msg = `Here\'s what I found for you:\n`;
  matches.forEach((r, i) => {
    msg += `\n**${i + 1}. ${r?.title ?? ''}**\n${r?.description ?? ''}`;
    if (r?.phone) msg += `\n\u260E\uFE0F ${r.phone}`;
    if (r?.textLine) msg += `\n\u{1F4AC} ${r.textLine}`;
    if (r?.url) msg += `\n\u{1F310} ${r.url}`;
    msg += '\n';
  });
  msg += '\nTap any resource in the list above for direct access. Need more help? Go to **Chat > Talk to Us**. \u{1F49C}';
  return msg;
}

/* -------- component -------- */

export default function ResourcesScreen() {
  const router = useRouter();
  const [resources, setResources] = useState<MentalHealthResource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // AI Chatbot state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatBubble[]>([
    { id: 'welcome', role: 'assistant', text: 'Hi! \u{1F49C} I can help you find the right resource. Tell me what you\'re going through or what kind of help you need.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatListRef = useRef<FlatList>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resData, catData] = await Promise.allSettled([
        getResourcesApi(selectedCat),
        getCategoriesApi(),
      ]);
      if (resData.status === 'fulfilled') setResources(resData.value?.items ?? []);
      if (catData.status === 'fulfilled') setCategories(catData.value?.categories ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [selectedCat]);

  useFocusEffect(
    useCallback(() => { loadData(); }, [loadData]),
  );

  const handleCatChange = (catId: string) => setSelectedCat(catId);

  const handleUrl = async (url: string) => {
    try { await Linking.openURL(url); } catch { /* ignore */ }
  };
  const handlePhone = async (phone: string) => {
    try { await Linking.openURL(`tel:${phone?.replace(/[^0-9+]/g, '')}`); } catch { /* ignore */ }
  };
  const handleText = async (textLine: string) => {
    const match = textLine?.match(/(\d{5,})/);
    const body = textLine?.match(/Text\s+(\w+)/i)?.[1] ?? '';
    if (match?.[1]) {
      try {
        const smsUrl = body ? `sms:${match[1]}?body=${body}` : `sms:${match[1]}`;
        await Linking.openURL(smsUrl);
      } catch { /* ignore */ }
    }
  };

  const getCatColor = (catId: string) => categories?.find((c) => c?.id === catId)?.color ?? colors.primaryPurple;

  // Filter resources by search query
  const filteredResources = (resources ?? []).filter((r) => {
    if (!searchQuery?.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r?.title ?? '').toLowerCase().includes(q) ||
      (r?.description ?? '').toLowerCase().includes(q) ||
      (r?.tags ?? []).some((t) => t?.toLowerCase()?.includes(q))
    );
  });

  // Use ALL loaded resources (not filtered) for chatbot search so it can find across categories
  const allResourcesRef = useRef<MentalHealthResource[]>([]);
  // Keep a master list
  const loadAllResources = useCallback(async () => {
    try {
      const res = await getResourcesApi('all');
      allResourcesRef.current = res?.items ?? [];
    } catch { /* ignore */ }
  }, []);
  useFocusEffect(useCallback(() => { loadAllResources(); }, [loadAllResources]));

  // AI Chatbot send — fully client-side resource search
  const handleChatSend = () => {
    const text = chatInput?.trim();
    if (!text) return;
    const userMsg: ChatBubble = { id: `u-${Date.now()}`, role: 'user', text };
    setChatInput('');
    Keyboard.dismiss();

    // Search resources
    const allRes = allResourcesRef.current?.length ? allResourcesRef.current : resources;
    const matches = findMatchingResources(text, allRes);
    const aiText = buildAiResponse(text, matches);
    const aiMsg: ChatBubble = { id: `a-${Date.now()}`, role: 'assistant', text: aiText };

    setChatMessages((prev) => [...(prev ?? []), userMsg, aiMsg]);
    setTimeout(() => chatListRef?.current?.scrollToEnd?.({ animated: true }), 200);
  };

  const renderResource = ({ item }: { item: MentalHealthResource }) => {
    const catColor = getCatColor(item?.category ?? '');
    return (
      <View style={[styles.resourceCard, shadows.sm, { borderLeftColor: catColor }]}>
        <View style={[styles.iconCircle, { backgroundColor: catColor }]}>
          <Ionicons name={(item?.icon ?? 'help-circle') as keyof typeof Ionicons.glyphMap} size={22} color={colors.white} />
        </View>
        <View style={styles.resourceBody}>
          <Text style={styles.resourceTitle}>{item?.title ?? ''}</Text>
          <Text style={styles.resourceDesc}>{item?.description ?? ''}</Text>
          <View style={styles.resourceActions}>
            {item?.phone ? (
              <Pressable style={[styles.actionBtn, { backgroundColor: `${catColor}15` }]} onPress={() => handlePhone(item?.phone ?? '')} accessibilityLabel={`Call ${item?.title}`}>
                <Ionicons name="call" size={14} color={catColor} />
                <Text style={[styles.actionText, { color: catColor }]}>{item?.phone ?? ''}</Text>
              </Pressable>
            ) : null}
            {item?.textLine ? (
              <Pressable style={[styles.actionBtn, { backgroundColor: `${catColor}15` }]} onPress={() => handleText(item?.textLine ?? '')} accessibilityLabel={item?.textLine}>
                <Ionicons name="chatbubble" size={14} color={catColor} />
                <Text style={[styles.actionText, { color: catColor }]}>{item?.textLine ?? ''}</Text>
              </Pressable>
            ) : null}
            {item?.url ? (
              <Pressable style={[styles.actionBtn, { backgroundColor: `${catColor}15` }]} onPress={() => handleUrl(item?.url ?? '')} accessibilityLabel={`Visit ${item?.title} website`}>
                <Ionicons name="globe-outline" size={14} color={catColor} />
                <Text style={[styles.actionText, { color: catColor }]}>Visit Website</Text>
              </Pressable>
            ) : null}
          </View>
          {(item?.tags?.length ?? 0) > 0 ? (
            <View style={styles.tagsRow}>
              {(item?.tags ?? []).map((tag) => (
                <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  // Simple markdown-ish bold rendering
  const renderFormattedText = (text: string) => {
    const parts = (text ?? '').split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part?.startsWith?.('**') && part?.endsWith?.('**')) {
        return <Text key={i} style={{ fontWeight: '700' }}>{part.slice(2, -2)}</Text>;
      }
      return <Text key={i}>{part}</Text>;
    });
  };

  const renderChatBubble = ({ item }: { item: ChatBubble }) => (
    <View style={[styles.chatBubble, item?.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAi]}>
      {item?.role === 'assistant' ? (
        <View style={styles.chatAiAvatar}>
          <Ionicons name="sparkles" size={14} color={colors.white} />
        </View>
      ) : null}
      <View style={[styles.chatBubbleContent, item?.role === 'user' ? styles.chatBubbleContentUser : styles.chatBubbleContentAi]}>
        <Text style={[styles.chatBubbleText, item?.role === 'user' && styles.chatBubbleTextUser]}>
          {item?.role === 'assistant' ? renderFormattedText(item?.text ?? '') : (item?.text ?? '')}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header with hero image */}
      <View style={styles.headerWrap}>
        <Image source={heroResources} style={styles.heroImage} contentFit="cover" />
        <LinearGradient colors={['rgba(123,94,167,0.85)', 'rgba(232,141,174,0.75)']} style={styles.heroOverlay}>
          <Ionicons name="library" size={28} color={colors.white} />
          <View style={{ marginLeft: spacing.sm, flex: 1 }}>
            <Text style={styles.headerTitle}>Resources</Text>
            <Text style={styles.headerSub}>Curated mental health support</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, shadows.sm]}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources, topics, tags..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            accessibilityLabel="Search resources"
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.textLight} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Crisis Banner */}
      <Pressable
        style={styles.crisisBanner}
        onPress={() => handleText('Text CONNECT to 741741')}
        accessibilityLabel="Text CONNECT to 741741 for crisis support"
      >
        <Ionicons name="chatbubble-ellipses" size={18} color={colors.white} />
        <Text style={styles.crisisBannerText}>In crisis? Text CONNECT to 741741 \u2014 free 24/7</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.white} />
      </Pressable>

      {/* Category Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories ?? []}
        keyExtractor={(item) => item?.id ?? ''}
        contentContainerStyle={styles.catList}
        renderItem={({ item: cat }) => (
          <Pressable
            style={[
              styles.catChip,
              selectedCat === cat?.id && { backgroundColor: cat?.color ?? colors.primaryPurple, borderColor: cat?.color ?? colors.primaryPurple },
            ]}
            onPress={() => handleCatChange(cat?.id ?? 'all')}
          >
            <Ionicons name={(cat?.icon ?? 'grid') as keyof typeof Ionicons.glyphMap} size={13} color={selectedCat === cat?.id ? colors.white : colors.textMedium} />
            <Text style={[styles.catChipText, selectedCat === cat?.id && { color: colors.white }]}>{cat?.label ?? ''}</Text>
          </Pressable>
        )}
      />

      {/* Resources List */}
      <FlatList
        data={filteredResources ?? []}
        keyExtractor={(item) => item?.id ?? ''}
        renderItem={renderResource}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}><Text style={styles.emptyText}>Loading resources...</Text></View>
          ) : searchQuery ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No matches</Text>
              <Text style={styles.emptyText}>Try a different search term.</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="library-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No resources found</Text>
              <Text style={styles.emptyText}>Try selecting a different category.</Text>
            </View>
          )
        }
      />

      {/* AI Chatbot FAB */}
      {!chatOpen ? (
        <Pressable
          style={({ pressed }) => [styles.chatFab, shadows.lg, pressed && { transform: [{ scale: 0.95 }] }]}
          onPress={() => setChatOpen(true)}
          accessibilityLabel="Open resource helper chatbot"
        >
          <LinearGradient colors={colors.gradientBrand} style={styles.chatFabGradient}>
            <Ionicons name="sparkles" size={24} color={colors.white} />
          </LinearGradient>
          <View style={styles.chatFabBadge}>
            <Text style={styles.chatFabBadgeText}>Ask AI</Text>
          </View>
        </Pressable>
      ) : null}

      {/* AI Chatbot Overlay */}
      {chatOpen ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={[styles.chatContainer, shadows.lg]}>
            {/* Chat Header */}
            <LinearGradient colors={colors.gradientBrand} style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <Ionicons name="sparkles" size={18} color={colors.white} />
                <Text style={styles.chatHeaderTitle}>Resource Helper</Text>
              </View>
              <Pressable onPress={() => setChatOpen(false)} style={styles.chatCloseBtn}>
                <Ionicons name="close" size={20} color={colors.white} />
              </Pressable>
            </LinearGradient>

            {/* Chat Messages */}
            <FlatList
              ref={chatListRef}
              data={chatMessages ?? []}
              keyExtractor={(item) => item?.id ?? ''}
              renderItem={renderChatBubble}
              contentContainerStyle={styles.chatMessagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => chatListRef?.current?.scrollToEnd?.({ animated: true })}
            />

            {/* Quick suggestions */}
            <View style={styles.quickSuggestions}>
              {['anxiety', 'depression', 'abuse help', 'loneliness'].map((s) => (
                <Pressable
                  key={s}
                  style={styles.quickChip}
                  onPress={() => {
                    setChatInput(s);
                    setTimeout(() => {
                      const userMsg: ChatBubble = { id: `u-${Date.now()}`, role: 'user', text: s };
                      const allRes = allResourcesRef.current?.length ? allResourcesRef.current : resources;
                      const matches = findMatchingResources(s, allRes);
                      const aiText = buildAiResponse(s, matches);
                      const aiMsg: ChatBubble = { id: `a-${Date.now()}`, role: 'assistant', text: aiText };
                      setChatMessages((prev) => [...(prev ?? []), userMsg, aiMsg]);
                      setChatInput('');
                      setTimeout(() => chatListRef?.current?.scrollToEnd?.({ animated: true }), 200);
                    }, 100);
                  }}
                >
                  <Text style={styles.quickChipText}>{s}</Text>
                </Pressable>
              ))}
            </View>

            {/* Chat Input */}
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Ask about resources..."
                placeholderTextColor={colors.textLight}
                value={chatInput}
                onChangeText={setChatInput}
                returnKeyType="send"
                onSubmitEditing={handleChatSend}
                multiline={false}
              />
              <Pressable
                style={[styles.chatSendBtn, !chatInput?.trim() && { opacity: 0.4 }]}
                onPress={handleChatSend}
                disabled={!chatInput?.trim()}
              >
                <LinearGradient colors={colors.gradientBrand} style={styles.chatSendBtnGradient}>
                  <Ionicons name="send" size={16} color={colors.white} />
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerWrap: { height: 120, position: 'relative' },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.white, fontFamily },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontFamily, marginTop: 2 },
  searchWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.white, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textDark, fontFamily, padding: 0 },
  crisisBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.crisisRed, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs,
  },
  crisisBannerText: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.white, fontFamily },
  catList: { paddingHorizontal: spacing.lg, paddingVertical: 4, gap: 6 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  catChipText: { fontSize: 11, fontWeight: '600', color: colors.textMedium, fontFamily },
  listContent: { padding: spacing.lg, paddingBottom: 100 },
  resourceCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md,
    marginBottom: spacing.md, borderLeftWidth: 4, flexDirection: 'row', gap: spacing.sm,
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  resourceBody: { flex: 1 },
  resourceTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, fontFamily },
  resourceDesc: { fontSize: 13, color: colors.textMedium, fontFamily, lineHeight: 20, marginTop: 4 },
  resourceActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full,
  },
  actionText: { fontSize: 12, fontWeight: '600', fontFamily },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: spacing.xs },
  tag: { backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.full, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 10, color: colors.textLight, fontFamily },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.textDark, fontFamily, marginTop: spacing.md },
  emptyText: { fontSize: 14, color: colors.textLight, fontFamily, marginTop: spacing.xs },
  // AI Chat FAB
  chatFab: { position: 'absolute', bottom: 24, right: 20, borderRadius: 28, overflow: 'visible' },
  chatFabGradient: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  chatFabBadge: {
    position: 'absolute', top: -6, right: -4,
    backgroundColor: colors.primaryPink, borderRadius: borderRadius.full,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  chatFabBadgeText: { fontSize: 9, fontWeight: '700', color: colors.white, fontFamily },
  // Chat overlay
  chatOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '58%', maxHeight: 440 },
  chatContainer: {
    flex: 1, margin: spacing.sm, borderRadius: borderRadius.xl,
    backgroundColor: colors.white, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
  },
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  chatHeaderTitle: { fontSize: 15, fontWeight: '700', color: colors.white, fontFamily },
  chatCloseBtn: { padding: spacing.xs },
  chatMessagesList: { padding: spacing.sm, paddingBottom: spacing.xs },
  chatBubble: { flexDirection: 'row', marginBottom: spacing.sm, alignItems: 'flex-start' },
  chatBubbleUser: { justifyContent: 'flex-end' },
  chatBubbleAi: { justifyContent: 'flex-start' },
  chatAiAvatar: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.primaryPurple, justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.xs, marginTop: 2,
  },
  chatBubbleContent: { maxWidth: '78%', borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chatBubbleContentUser: { backgroundColor: colors.primaryPink, borderBottomRightRadius: 4 },
  chatBubbleContentAi: { backgroundColor: colors.surfaceElevated, borderBottomLeftRadius: 4 },
  chatBubbleText: { fontSize: 13, color: colors.textDark, fontFamily, lineHeight: 19 },
  chatBubbleTextUser: { color: colors.white },
  // Quick suggestions
  quickSuggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: spacing.sm, paddingBottom: spacing.xs },
  quickChip: {
    backgroundColor: `${colors.primaryPink}18`, borderRadius: borderRadius.full,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: `${colors.primaryPink}40`,
  },
  quickChipText: { fontSize: 11, color: colors.primaryPink, fontWeight: '600', fontFamily },
  // Chat input
  chatInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  chatTextInput: {
    flex: 1, fontSize: 14, color: colors.textDark, fontFamily,
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: Platform.OS === 'ios' ? 8 : 6,
  },
  chatSendBtn: { borderRadius: 18, overflow: 'hidden' },
  chatSendBtnGradient: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
});