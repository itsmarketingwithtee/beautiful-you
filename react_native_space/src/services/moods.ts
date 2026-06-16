import api from './api';
import type { MoodEntry, MoodInsights } from '../types';

export async function createMoodApi(data: {
  moodLevel: number;
  notes?: string;
  date?: string;
}): Promise<{ mood: MoodEntry }> {
  const res = await api.post('/api/moods', data);
  return res?.data;
}

export async function getTodayMoodApi(): Promise<{ mood: MoodEntry | null }> {
  const res = await api.get('/api/moods/today');
  return res?.data;
}

export async function getMoodsByMonthApi(
  month: number,
  year: number,
): Promise<{ items: MoodEntry[]; insights: MoodInsights }> {
  const res = await api.get('/api/moods', { params: { month, year } });
  return res?.data ?? { items: [], insights: { averageMood: 0, totalEntries: 0, moodDistribution: {}, weeklyAverages: [], trend: 'insufficient_data' } };
}
