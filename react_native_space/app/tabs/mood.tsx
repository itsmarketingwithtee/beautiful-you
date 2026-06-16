import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { createMoodApi, getTodayMoodApi, getMoodsByMonthApi } from '../../src/services/moods';
import { colors, spacing, borderRadius, fontFamily, shadows, moodColors, moodEmojis, moodLabels } from '../../src/theme';
import { getApiErrorMessage } from '../../src/services/api';
import type { MoodEntry, MoodInsights } from '../../src/types';

type SubTab = 'calendar' | 'insights' | 'history';

function getMonthName(m: number): string {
  return ['January','February','March','April','May','June','July','August','September','October','November','December'][m - 1] ?? '';
}

function getDaysInMonth(m: number, y: number): number {
  return new Date(y, m, 0).getDate();
}

function getFirstDayOfWeek(m: number, y: number): number {
  return new Date(y, m - 1, 1).getDay();
}

function getTrendMessage(trend: string): string {
  switch (trend) {
    case 'improving': return '🌟 Your mood has been improving! Keep up the great work.';
    case 'declining': return '💜 Be gentle with yourself. Consider reaching out to someone you trust.';
    case 'stable': return '✨ Your mood has been steady. Consistency is a strength.';
    default: return '📝 Keep tracking to see your mood trends over time.';
  }
}

export default function MoodScreen() {
  const [selectedMood, setSelectedMood] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [subTab, setSubTab] = useState<SubTab>('calendar');
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [monthEntries, setMonthEntries] = useState<MoodEntry[]>([]);
  const [insights, setInsights] = useState<MoodInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [todayRes, monthRes] = await Promise.allSettled([
        getTodayMoodApi(),
        getMoodsByMonthApi(calMonth, calYear),
      ]);
      if (todayRes.status === 'fulfilled') setTodayMood(todayRes.value?.mood ?? null);
      if (monthRes.status === 'fulfilled') {
        setMonthEntries(monthRes.value?.items ?? []);
        setInsights(monthRes.value?.insights ?? null);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [calMonth, calYear]);

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

  const handleSubmit = async () => {
    if (selectedMood < 1 || selectedMood > 5) return;
    setSubmitting(true);
    setError('');
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await createMoodApi({ moodLevel: selectedMood, notes: notes?.trim() || undefined, date: today });
      setTodayMood(res?.mood ?? null);
      setSelectedMood(0);
      setNotes('');
      await loadData();
    } catch (e) {
      const msg = getApiErrorMessage(e);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const prevMonth = () => {
    if (calMonth === 1) { setCalMonth(12); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 12) { setCalMonth(1); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const moodMap = new Map((monthEntries ?? []).map((e) => [e?.date, e?.moodLevel]));
  const daysInMonth = getDaysInMonth(calMonth, calYear);
  const firstDay = getFirstDayOfWeek(calMonth, calYear);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryPurple} />}
      >
        <Text style={styles.title}>Mood Tracker</Text>

        {/* Check-in */}
        <View style={[styles.card, shadows.sm]}>
          <Text style={styles.cardTitle}>
            {todayMood ? 'You already checked in today ✅' : 'How are you feeling today?'}
          </Text>
          {!todayMood ? (
            <>
              <View style={styles.moodRow}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <Pressable
                    key={level}
                    style={[
                      styles.moodBtn,
                      selectedMood === level && { backgroundColor: moodColors[level], transform: [{ scale: 1.15 }] },
                    ]}
                    onPress={() => setSelectedMood(level)}
                    accessibilityLabel={`Mood: ${moodLabels[level]}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.moodEmoji}>{moodEmojis[level]}</Text>
                    <Text style={[styles.moodLabel, selectedMood === level && { color: colors.white }]}>{moodLabels[level]}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add a note about how you feel... (optional)"
                placeholderTextColor={colors.textLight}
                multiline
                maxLength={200}
                accessibilityLabel="Mood notes"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable
                style={({ pressed }) => [styles.submitBtn, !selectedMood && styles.submitDisabled, pressed && { opacity: 0.85 }]}
                onPress={handleSubmit}
                disabled={!selectedMood || submitting}
                accessibilityLabel="Submit mood"
                accessibilityRole="button"
              >
                {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitText}>Save Mood</Text>}
              </Pressable>
            </>
          ) : (
            <View style={styles.todayMoodDisplay}>
              <Text style={styles.todayEmoji}>{moodEmojis[todayMood?.moodLevel ?? 3]}</Text>
              <Text style={styles.todayLabel}>{moodLabels[todayMood?.moodLevel ?? 3]}</Text>
              {todayMood?.notes ? <Text style={styles.todayNotes}>"{todayMood.notes}"</Text> : null}
            </View>
          )}
        </View>

        {/* Sub-tabs */}
        <View style={styles.subTabRow}>
          {(['calendar', 'insights', 'history'] as SubTab[]).map((t) => (
            <Pressable
              key={t}
              style={[styles.subTab, subTab === t && styles.subTabActive]}
              onPress={() => setSubTab(t)}
              accessibilityRole="tab"
            >
              <Text style={[styles.subTabText, subTab === t && styles.subTabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primaryPurple} style={{ marginTop: spacing.xl }} />
        ) : subTab === 'calendar' ? (
          <View style={[styles.card, shadows.sm]}>
            <View style={styles.calHeader}>
              <Pressable onPress={prevMonth} style={styles.calArrow} accessibilityLabel="Previous month" accessibilityRole="button">
                <Ionicons name="chevron-back" size={24} color={colors.textDark} />
              </Pressable>
              <Text style={styles.calTitle}>{getMonthName(calMonth)} {calYear}</Text>
              <Pressable onPress={nextMonth} style={styles.calArrow} accessibilityLabel="Next month" accessibilityRole="button">
                <Ionicons name="chevron-forward" size={24} color={colors.textDark} />
              </Pressable>
            </View>
            <View style={styles.calWeekRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <Text key={d} style={styles.calWeekDay}>{d}</Text>
              ))}
            </View>
            <View style={styles.calGrid}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.calCell} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const level = moodMap.get(dateStr);
                const bg = level ? (moodColors[level] ?? colors.border) : 'transparent';
                return (
                  <View key={day} style={styles.calCell}>
                    <View style={[styles.calDay, level ? { backgroundColor: bg } : null]}>
                      <Text style={[styles.calDayText, level ? { color: colors.white } : null]}>{day}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={styles.calLegend}>
              {[1, 2, 3, 4, 5].map((l) => (
                <View key={l} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: moodColors[l] }]} />
                  <Text style={styles.legendText}>{moodLabels[l]}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : subTab === 'insights' ? (
          <View style={[styles.card, shadows.sm]}>
            {(insights?.totalEntries ?? 0) === 0 ? (
              <View style={styles.emptyInsights}>
                <Text style={styles.emptyEmoji}>📊</Text>
                <Text style={styles.emptyText}>Start tracking your mood to see insights!</Text>
              </View>
            ) : (
              <>
                <View style={styles.insightRow}>
                  <Text style={styles.insightLabel}>Average Mood</Text>
                  <Text style={styles.insightValue}>{moodEmojis[Math.round(insights?.averageMood ?? 3)]} {insights?.averageMood?.toFixed?.(1) ?? '0'}/5</Text>
                </View>
                <View style={styles.insightRow}>
                  <Text style={styles.insightLabel}>Total Entries</Text>
                  <Text style={styles.insightValue}>{insights?.totalEntries ?? 0}</Text>
                </View>
                <View style={styles.insightRow}>
                  <Text style={styles.insightLabel}>Trend</Text>
                  <Text style={styles.insightValue}>{insights?.trend === 'improving' ? '📈' : insights?.trend === 'declining' ? '📉' : '➡️'} {(insights?.trend ?? 'insufficient_data').replace('_', ' ')}</Text>
                </View>
                {/* Weekly averages */}
                {(insights?.weeklyAverages?.length ?? 0) > 0 ? (
                  <View style={styles.weeklySection}>
                    <Text style={styles.weeklyTitle}>Weekly Averages</Text>
                    {(insights?.weeklyAverages ?? []).map((w) => (
                      <View key={w?.weekLabel} style={styles.weeklyRow}>
                        <Text style={styles.weeklyLabel}>{w?.weekLabel}</Text>
                        <View style={styles.barBg}>
                          <View style={[styles.barFill, { width: `${((w?.average ?? 0) / 5) * 100}%`, backgroundColor: moodColors[Math.round(w?.average ?? 3)] }]} />
                        </View>
                        <Text style={styles.weeklyValue}>{w?.average?.toFixed?.(1) ?? '0'}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                <Text style={styles.encouragement}>{getTrendMessage(insights?.trend ?? '')}</Text>
              </>
            )}
          </View>
        ) : (
          <View style={[styles.card, shadows.sm]}>
            {(monthEntries?.length ?? 0) === 0 ? (
              <View style={styles.emptyInsights}>
                <Text style={styles.emptyEmoji}>🗓️</Text>
                <Text style={styles.emptyText}>No mood entries for this month yet.</Text>
              </View>
            ) : (
              (monthEntries ?? []).slice().reverse().map((entry) => (
                <View key={entry?.id} style={styles.historyItem}>
                  <Text style={styles.historyEmoji}>{moodEmojis[entry?.moodLevel ?? 3]}</Text>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyDate}>{entry?.date ?? ''}</Text>
                    <Text style={styles.historyMood}>{moodLabels[entry?.moodLevel ?? 3]}</Text>
                    {entry?.notes ? <Text style={styles.historyNotes}>{entry.notes}</Text> : null}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: 28, fontWeight: '700', color: colors.textDark, fontFamily, marginBottom: spacing.lg },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.textDark, fontFamily, marginBottom: spacing.md },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  moodBtn: { alignItems: 'center', padding: spacing.sm, borderRadius: borderRadius.md, minWidth: 56, minHeight: 56 },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontSize: 11, color: colors.textMedium, fontFamily, marginTop: 2 },
  notesInput: {
    backgroundColor: colors.background, borderRadius: borderRadius.md, padding: spacing.md,
    fontSize: 14, color: colors.textDark, fontFamily, minHeight: 60, textAlignVertical: 'top', marginBottom: spacing.md,
  },
  error: { color: colors.crisisRed, fontSize: 13, fontFamily, marginBottom: spacing.sm, textAlign: 'center' },
  submitBtn: { backgroundColor: colors.primaryPurple, paddingVertical: 14, borderRadius: borderRadius.lg, alignItems: 'center', minHeight: 48 },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: colors.white, fontSize: 16, fontWeight: '600', fontFamily },
  todayMoodDisplay: { alignItems: 'center', paddingVertical: spacing.md },
  todayEmoji: { fontSize: 48, marginBottom: spacing.sm },
  todayLabel: { fontSize: 18, fontWeight: '600', color: colors.textDark, fontFamily },
  todayNotes: { fontSize: 14, color: colors.textMedium, fontFamily, marginTop: spacing.sm, fontStyle: 'italic' },
  subTabRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  subTab: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.white, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
  subTabActive: { backgroundColor: colors.primaryPurple, borderColor: colors.primaryPurple },
  subTabText: { fontSize: 13, fontWeight: '600', color: colors.textMedium, fontFamily },
  subTabTextActive: { color: colors.white },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  calArrow: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  calTitle: { fontSize: 18, fontWeight: '600', color: colors.textDark, fontFamily },
  calWeekRow: { flexDirection: 'row', marginBottom: spacing.xs },
  calWeekDay: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: colors.textLight, fontFamily },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2, justifyContent: 'center', alignItems: 'center' },
  calDay: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  calDayText: { fontSize: 13, color: colors.textDark, fontFamily },
  calLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: colors.textMedium, fontFamily },
  emptyInsights: { alignItems: 'center', paddingVertical: spacing.lg },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: 15, color: colors.textMedium, fontFamily, textAlign: 'center' },
  insightRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  insightLabel: { fontSize: 15, color: colors.textMedium, fontFamily },
  insightValue: { fontSize: 15, fontWeight: '600', color: colors.textDark, fontFamily },
  weeklySection: { marginTop: spacing.md },
  weeklyTitle: { fontSize: 15, fontWeight: '600', color: colors.textDark, fontFamily, marginBottom: spacing.sm },
  weeklyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs, gap: spacing.sm },
  weeklyLabel: { width: 56, fontSize: 12, color: colors.textMedium, fontFamily },
  barBg: { flex: 1, height: 12, backgroundColor: colors.border, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  weeklyValue: { width: 30, fontSize: 12, fontWeight: '600', color: colors.textDark, fontFamily, textAlign: 'right' },
  encouragement: { fontSize: 14, color: colors.primaryPurple, fontFamily, marginTop: spacing.lg, textAlign: 'center', lineHeight: 22 },
  historyItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  historyEmoji: { fontSize: 28 },
  historyContent: { flex: 1 },
  historyDate: { fontSize: 13, color: colors.textLight, fontFamily },
  historyMood: { fontSize: 15, fontWeight: '600', color: colors.textDark, fontFamily },
  historyNotes: { fontSize: 13, color: colors.textMedium, fontFamily, marginTop: 2 },
});
