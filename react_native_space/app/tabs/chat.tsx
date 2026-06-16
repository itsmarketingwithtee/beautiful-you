import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { sendMessageApi, getMessagesApi } from '../../src/services/chat';
import {
  getJournalEntriesApi, createJournalEntryApi, updateJournalEntryApi,
  deleteJournalEntryApi, type JournalEntry,
} from '../../src/services/journal';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, borderRadius, fontFamily, shadows, moodEmojis, moodLabels } from '../../src/theme';
import type { ChatMessage, ChatType } from '../../src/types';

type ChatMode = {
  key: ChatType | 'journal_notes';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  color: string;
};

const CHAT_MODES: ChatMode[] = [
  { key: 'ai', label: 'Heart to Heart', icon: 'heart-circle', description: 'A safe space to talk when you need someone', color: '#C97B9A' },
  { key: 'admin', label: 'Talk to Us', icon: 'people', description: 'Send a message to the Beautiful You team', color: '#5B8DB8' },
  { key: 'journal_notes', label: 'My Journal', icon: 'book', description: 'Your private diary \u2014 write your heart out', color: '#7B5EA7' },
  { key: 'future_me', label: 'Future Me', icon: 'mail', description: 'Write a letter to your future self via FutureMe.org', color: '#D4A843' },
];

export default function ChatScreen() {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<ChatMode['key'] | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Journal state
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalView, setJournalView] = useState<'list' | 'edit'>('list');
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null);
  const [entryTitle, setEntryTitle] = useState('');
  const [entryBody, setEntryBody] = useState('');
  const [entryMood, setEntryMood] = useState<number | null>(null);
  const [journalSaving, setJournalSaving] = useState(false);

  const loadMessages = useCallback(async (type: ChatType) => {
    setLoading(true);
    try {
      const res = await getMessagesApi(type);
      setMessages(res?.items ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  const loadJournal = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getJournalEntriesApi();
      setJournalEntries(res?.items ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (activeMode === 'journal_notes') loadJournal();
      else if (activeMode && activeMode !== 'future_me') loadMessages(activeMode as ChatType);
    }, [activeMode, loadMessages, loadJournal]),
  );

  const handleSend = async () => {
    const text = input?.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await sendMessageApi({ chatType: activeMode as ChatType, content: text });
      setInput('');
      await loadMessages(activeMode as ChatType);
      setTimeout(() => flatListRef.current?.scrollToEnd?.({ animated: true }), 200);
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    setActiveMode(null);
    setMessages([]);
    setInput('');
    setJournalView('list');
    setEditEntry(null);
  };

  // Journal handlers
  const handleNewEntry = () => {
    setEditEntry(null);
    setEntryTitle('');
    setEntryBody('');
    setEntryMood(null);
    setJournalView('edit');
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditEntry(entry);
    setEntryTitle(entry?.title ?? '');
    setEntryBody(entry?.body ?? '');
    setEntryMood(entry?.mood ?? null);
    setJournalView('edit');
  };

  const handleSaveEntry = async () => {
    if (!entryTitle?.trim() && !entryBody?.trim()) return;
    setJournalSaving(true);
    try {
      const title = entryTitle?.trim() || 'Untitled';
      const body = entryBody?.trim() || '';
      if (editEntry) {
        await updateJournalEntryApi(editEntry.id, { title, body, mood: entryMood ?? undefined });
      } else {
        await createJournalEntryApi({ title, body, mood: entryMood ?? undefined });
      }
      setJournalView('list');
      setEditEntry(null);
      await loadJournal();
    } catch (err) {
      const msg = 'Could not save your journal entry. Please try again.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setJournalSaving(false);
    }
  };

  const handleDeleteEntry = (entry: JournalEntry) => {
    const doDelete = async () => {
      try {
        await deleteJournalEntryApi(entry.id);
        await loadJournal();
      } catch { /* ignore */ }
    };
    if (Platform.OS === 'web') {
      if (confirm('Delete this journal entry?')) doDelete();
    } else {
      Alert.alert('Delete Entry', 'Are you sure you want to delete this journal entry?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  // -------- Mode selection screen --------
  if (!activeMode) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Chat</Text>
          <Text style={styles.pageSubtitle}>Choose how you'd like to connect</Text>
        </View>
        <FlatList
          data={CHAT_MODES}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.modeList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.modeCard, shadows.md, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
              onPress={() => setActiveMode(item.key)}
              accessibilityLabel={item.label}
              accessibilityRole="button"
            >
              <View style={[styles.modeIconCircle, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={28} color={colors.white} />
              </View>
              <View style={styles.modeContent}>
                <Text style={styles.modeLabel}>{item.label}</Text>
                <Text style={styles.modeDesc}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.textLight} />
            </Pressable>
          )}
        />
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textLight} />
          <Text style={styles.disclaimerText}>
            Heart to Heart provides general encouragement and does not replace professional help. If in crisis, use the Crisis tab.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentMode = CHAT_MODES.find((m) => m.key === activeMode) ?? CHAT_MODES[0];

  // -------- Future Me (WebView) --------
  if (activeMode === 'future_me') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.chatHeader}>
          <Pressable onPress={handleBack} style={styles.backBtn}><Ionicons name="chevron-back" size={26} color={colors.textDark} /></Pressable>
          <View style={[styles.chatHeaderIcon, { backgroundColor: currentMode.color }]}><Ionicons name={currentMode.icon} size={18} color={colors.white} /></View>
          <Text style={styles.chatHeaderTitle}>Future Me</Text>
        </View>
        <View style={styles.futureMeBanner}>
          <Ionicons name="mail-outline" size={18} color={colors.primaryPurple} />
          <Text style={styles.futureMeBannerText}>Write a letter to your future self. Powered by FutureMe.org</Text>
        </View>
        {Platform.OS === 'web' ? (
          <View style={styles.webFallback}>
            <View style={[styles.emptyChatIcon, { backgroundColor: currentMode.color + '20' }]}>
              <Ionicons name="mail" size={40} color={currentMode.color} />
            </View>
            <Text style={styles.emptyChatTitle}>Future Me</Text>
            <Text style={styles.emptyChatDesc}>Write a letter to your future self and receive it on the date you choose.</Text>
            <Pressable
              style={styles.futureMeBtn}
              onPress={() => { try { window.open('https://www.futureme.org/letters/new', '_blank'); } catch { /* ignore */ } }}
            >
              <LinearGradient colors={['#D4A843', '#E8C05A'] as const} style={styles.futureMeBtnGradient}>
                <Ionicons name="open-outline" size={18} color={colors.white} />
                <Text style={styles.futureMeBtnText}>Write a Letter on FutureMe.org</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <WebView
            source={{ uri: 'https://www.futureme.org/letters/new' }}
            style={styles.webview}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator size="large" color={colors.primaryPurple} />
                <Text style={styles.webviewLoadingText}>Loading FutureMe.org...</Text>
              </View>
            )}
            javaScriptEnabled domStorageEnabled sharedCookiesEnabled allowsInlineMediaPlayback
          />
        )}
      </SafeAreaView>
    );
  }

  // -------- Journal (Notes/Diary style) --------
  if (activeMode === 'journal_notes') {
    // Edit view
    if (journalView === 'edit') {
      return (
        <SafeAreaView style={styles.safe}>
          <View style={styles.chatHeader}>
            <Pressable onPress={() => { setJournalView('list'); setEditEntry(null); }} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={26} color={colors.textDark} />
            </Pressable>
            <Text style={styles.chatHeaderTitle}>{editEntry ? 'Edit Entry' : 'New Entry'}</Text>
            <View style={{ flex: 1 }} />
            <Pressable
              onPress={handleSaveEntry}
              disabled={journalSaving || (!entryTitle?.trim() && !entryBody?.trim())}
              style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }, (!entryTitle?.trim() && !entryBody?.trim()) && { opacity: 0.4 }]}
            >
              <Text style={styles.saveBtnText}>{journalSaving ? 'Saving...' : 'Save'}</Text>
            </Pressable>
          </View>

          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
            <ScrollView style={styles.journalEditScroll} contentContainerStyle={styles.journalEditContent}>
              {/* Optional mood */}
              <View style={styles.moodRow}>
                <Text style={styles.moodRowLabel}>How are you feeling?</Text>
                <View style={styles.moodPicker}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Pressable
                      key={level}
                      style={[styles.moodBtn, entryMood === level && styles.moodBtnActive]}
                      onPress={() => setEntryMood(entryMood === level ? null : level)}
                    >
                      <Text style={styles.moodEmoji}>{moodEmojis[level]}</Text>
                      <Text style={[styles.moodBtnLabel, entryMood === level && styles.moodBtnLabelActive]}>{moodLabels[level]}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <TextInput
                style={styles.journalTitleInput}
                placeholder="Title"
                placeholderTextColor={colors.textLight}
                value={entryTitle}
                onChangeText={setEntryTitle}
                maxLength={200}
                accessibilityLabel="Journal entry title"
              />

              <TextInput
                style={styles.journalBodyInput}
                placeholder="Pour your heart out here... \u{1F49C}"
                placeholderTextColor={colors.textLight}
                value={entryBody}
                onChangeText={setEntryBody}
                multiline
                textAlignVertical="top"
                maxLength={10000}
                accessibilityLabel="Journal entry body"
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      );
    }

    // List view
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.chatHeader}>
          <Pressable onPress={handleBack} style={styles.backBtn}><Ionicons name="chevron-back" size={26} color={colors.textDark} /></Pressable>
          <View style={[styles.chatHeaderIcon, { backgroundColor: currentMode.color }]}><Ionicons name={currentMode.icon} size={18} color={colors.white} /></View>
          <Text style={styles.chatHeaderTitle}>My Journal</Text>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryPurple} /></View>
        ) : (journalEntries?.length ?? 0) === 0 ? (
          <View style={styles.emptyChat}>
            <View style={[styles.emptyChatIcon, { backgroundColor: currentMode.color + '20' }]}>
              <Ionicons name="book" size={40} color={currentMode.color} />
            </View>
            <Text style={styles.emptyChatTitle}>Your Journal</Text>
            <Text style={styles.emptyChatDesc}>This is your private space. Write down your thoughts, feelings, and reflections.</Text>
            <Text style={styles.emptyChatHint}>{'Everything here is just for you 🔒'}</Text>
          </View>
        ) : (
          <FlatList
            data={journalEntries ?? []}
            keyExtractor={(item) => item?.id ?? ''}
            contentContainerStyle={styles.journalList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const dateStr = item?.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
              const timeStr = item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <Pressable
                  style={({ pressed }) => [styles.journalCard, shadows.sm, pressed && { opacity: 0.95 }]}
                  onPress={() => handleEditEntry(item)}
                >
                  <View style={styles.journalCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.journalCardTitle} numberOfLines={1}>{item?.title ?? 'Untitled'}</Text>
                      <Text style={styles.journalCardDate}>{`${dateStr} \u2022 ${timeStr}`}</Text>
                    </View>
                    {item?.mood ? <Text style={styles.journalCardMood}>{moodEmojis[item.mood] ?? ''}</Text> : null}
                    <Pressable onPress={() => handleDeleteEntry(item)} style={styles.journalDeleteBtn} hitSlop={8}>
                      <Ionicons name="trash-outline" size={16} color={colors.textLight} />
                    </Pressable>
                  </View>
                  <Text style={styles.journalCardBody} numberOfLines={3}>{item?.body ?? ''}</Text>
                </Pressable>
              );
            }}
          />
        )}

        {/* New Entry FAB */}
        <Pressable
          style={({ pressed }) => [styles.fab, shadows.lg, pressed && { transform: [{ scale: 0.95 }] }]}
          onPress={handleNewEntry}
          accessibilityLabel="New journal entry"
        >
          <LinearGradient colors={colors.gradientBrand} style={styles.fabGradient}>
            <Ionicons name="add" size={28} color={colors.white} />
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
    );
  }

  // -------- Chat view (Heart to Heart / Talk to Us) --------
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item?.role === 'user';
    const isSystem = item?.role === 'system';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowRight : styles.msgRowLeft]}>
        <View style={[styles.msgBubble, isUser ? styles.msgUser : isSystem ? styles.msgSystem : styles.msgOther]}>
          <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextOther]}>{item?.content ?? ''}</Text>
          <Text style={[styles.msgTime, isUser ? styles.msgTimeUser : styles.msgTimeOther]}>
            {item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.chatHeader}>
        <Pressable onPress={handleBack} style={styles.backBtn}><Ionicons name="chevron-back" size={26} color={colors.textDark} /></Pressable>
        <View style={[styles.chatHeaderIcon, { backgroundColor: currentMode.color }]}><Ionicons name={currentMode.icon} size={18} color={colors.white} /></View>
        <Text style={styles.chatHeaderTitle}>{currentMode.label}</Text>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryPurple} /></View>
        ) : (messages?.length ?? 0) === 0 ? (
          <View style={styles.emptyChat}>
            <View style={[styles.emptyChatIcon, { backgroundColor: currentMode.color + '20' }]}>
              <Ionicons name={currentMode.icon} size={40} color={currentMode.color} />
            </View>
            <Text style={styles.emptyChatTitle}>{currentMode.label}</Text>
            <Text style={styles.emptyChatDesc}>{currentMode.description}</Text>
            {activeMode === 'admin' ? (
              <Text style={styles.emptyChatHint}>{"Our team reads every message. We\u2019ll respond as soon as we can."}</Text>
            ) : null}
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages ?? []}
            keyExtractor={(item) => item?.id ?? Math.random().toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd?.({ animated: false })}
          />
        )}

        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.chatInput}
              value={input}
              onChangeText={setInput}
              placeholder={activeMode === 'admin' ? 'Type your message to our team...' : 'How are you feeling?'}
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={2000}
              accessibilityLabel="Message input"
            />
            <Pressable
              style={({ pressed }) => [styles.sendBtn, { backgroundColor: currentMode.color }, (!input?.trim() || sending) && { opacity: 0.5 }, pressed && { opacity: 0.8 }]}
              onPress={handleSend}
              disabled={!input?.trim() || sending}
            >
              {sending ? <ActivityIndicator size="small" color={colors.white} /> : <Ionicons name="send" size={20} color={colors.white} />}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  pageTitle: { fontSize: 28, fontWeight: '700', color: colors.textDark, fontFamily },
  pageSubtitle: { fontSize: 15, color: colors.textMedium, fontFamily, marginTop: spacing.xs, marginBottom: spacing.md },
  modeList: { padding: spacing.lg, gap: spacing.md },
  modeCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  modeIconCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  modeContent: { flex: 1 },
  modeLabel: { fontSize: 17, fontWeight: '700', color: colors.textDark, fontFamily },
  modeDesc: { fontSize: 13, color: colors.textMedium, fontFamily, marginTop: 2 },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  disclaimerText: { fontSize: 12, color: colors.textLight, fontFamily, flex: 1, lineHeight: 18 },
  // Chat header
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.white,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  chatHeaderIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  chatHeaderTitle: { fontSize: 18, fontWeight: '700', color: colors.textDark, fontFamily },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyChatIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  emptyChatTitle: { fontSize: 22, fontWeight: '700', color: colors.textDark, fontFamily, marginBottom: spacing.xs },
  emptyChatDesc: { fontSize: 15, color: colors.textMedium, fontFamily, textAlign: 'center' },
  emptyChatHint: { fontSize: 13, color: colors.textLight, fontFamily, textAlign: 'center', marginTop: spacing.md, lineHeight: 20 },
  messagesList: { padding: spacing.md, paddingBottom: spacing.lg },
  msgRow: { marginBottom: spacing.sm },
  msgRowRight: { alignItems: 'flex-end' },
  msgRowLeft: { alignItems: 'flex-start' },
  msgBubble: { maxWidth: '80%', borderRadius: borderRadius.lg, padding: spacing.md },
  msgUser: { backgroundColor: colors.primaryPurple },
  msgOther: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  msgSystem: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  msgText: { fontSize: 15, lineHeight: 22, fontFamily },
  msgTextUser: { color: colors.white },
  msgTextOther: { color: colors.textDark },
  msgTime: { fontSize: 10, fontFamily, marginTop: spacing.xs },
  msgTimeUser: { color: 'rgba(255,255,255,0.7)' },
  msgTimeOther: { color: colors.textLight },
  inputArea: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white, padding: spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  chatInput: {
    flex: 1, backgroundColor: colors.background, borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15,
    color: colors.textDark, fontFamily, maxHeight: 100, minHeight: 42,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  // Journal styles
  journalList: { padding: spacing.lg, paddingBottom: 100 },
  journalCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md,
    marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.primaryPurple,
  },
  journalCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  journalCardTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, fontFamily, flex: 1 },
  journalCardDate: { fontSize: 11, color: colors.textLight, fontFamily },
  journalCardMood: { fontSize: 20 },
  journalDeleteBtn: { padding: 4 },
  journalCardBody: { fontSize: 14, color: colors.textMedium, fontFamily, lineHeight: 20 },
  fab: { position: 'absolute', bottom: 24, right: 24, borderRadius: 30, overflow: 'hidden' },
  fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  // Journal edit
  saveBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, backgroundColor: colors.primaryPurple },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: colors.white, fontFamily },
  journalEditScroll: { flex: 1 },
  journalEditContent: { padding: spacing.lg },
  moodRow: { marginBottom: spacing.lg },
  moodRowLabel: { fontSize: 14, fontWeight: '600', color: colors.textMedium, fontFamily, marginBottom: spacing.sm },
  moodPicker: { flexDirection: 'row', gap: spacing.sm },
  moodBtn: {
    alignItems: 'center', paddingVertical: spacing.xs, paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm, backgroundColor: colors.surfaceElevated,
    borderWidth: 1, borderColor: colors.border,
  },
  moodBtnActive: { backgroundColor: colors.primaryPurple + '20', borderColor: colors.primaryPurple },
  moodEmoji: { fontSize: 22 },
  moodBtnLabel: { fontSize: 10, color: colors.textLight, fontFamily, marginTop: 2 },
  moodBtnLabelActive: { color: colors.primaryPurple, fontWeight: '600' },
  journalTitleInput: {
    fontSize: 22, fontWeight: '700', color: colors.textDark, fontFamily,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    paddingBottom: spacing.sm, marginBottom: spacing.md,
  },
  journalBodyInput: {
    fontSize: 16, color: colors.textDark, fontFamily, lineHeight: 26,
    minHeight: 300, textAlignVertical: 'top',
  },
  // Future Me
  futureMeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  futureMeBannerText: { fontSize: 13, color: colors.textMedium, fontFamily, flex: 1 },
  webview: { flex: 1 },
  webviewLoading: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background,
  },
  webviewLoadingText: { fontSize: 14, color: colors.textMedium, fontFamily, marginTop: spacing.sm },
  webFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  futureMeBtn: { marginTop: spacing.lg, borderRadius: borderRadius.md, overflow: 'hidden' },
  futureMeBtnGradient: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 14, paddingHorizontal: spacing.xl },
  futureMeBtnText: { fontSize: 16, fontWeight: '700', color: colors.white, fontFamily },
});