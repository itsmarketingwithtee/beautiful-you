export interface User {
  id: string;
  email: string | null;
  name: string;
  isGuest: boolean;
  subscriptionStatus?: string;
  notificationsEnabled?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Affirmation {
  id: string;
  text: string;
  category: string;
  imageUrl: string | null;
  isFavorited: boolean;
}

export interface MoodEntry {
  id: string;
  moodLevel: number;
  notes: string | null;
  date: string;
  createdAt: string;
}

export interface MoodInsights {
  averageMood: number;
  totalEntries: number;
  moodDistribution: Record<number, number>;
  weeklyAverages: Array<{ weekLabel: string; average: number }>;
  trend: string;
}

export interface Settings {
  notificationsEnabled: boolean;
  subscriptionStatus: string;
}

export interface Profile {
  id: string;
  email: string | null;
  name: string;
  isGuest: boolean;
  subscriptionStatus: string;
  notificationsEnabled: boolean;
  createdAt: string;
}

export type ChatType = 'admin' | 'ai' | 'journal' | 'future_me';

export interface ChatMessage {
  id: string;
  chatType: ChatType;
  role: 'user' | 'assistant' | 'admin' | 'system';
  content: string;
  deliverAt: string | null;
  delivered: boolean;
  createdAt: string;
}

// Community
export interface CommunityPost {
  id: string;
  displayName: string;
  content: string;
  category: string;
  heartsCount: number;
  hugsCount: number;
  createdAt: string;
  isOwn: boolean;
  userReacted: {
    heart: boolean;
    hug: boolean;
  };
}

export const COMMUNITY_CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'general', label: 'General', icon: 'chatbubble-ellipses' },
  { id: 'anxiety', label: 'Anxiety', icon: 'leaf' },
  { id: 'depression', label: 'Depression', icon: 'rainy' },
  { id: 'trauma', label: 'Trauma', icon: 'shield' },
  { id: 'recovery', label: 'Recovery', icon: 'trending-up' },
  { id: 'gratitude', label: 'Gratitude', icon: 'sunny' },
] as const;

// Resources
export interface MentalHealthResource {
  id: string;
  title: string;
  description: string;
  category: string;
  contactInfo?: string;
  url?: string;
  phone?: string;
  textLine?: string;
  icon: string;
  tags: string[];
}

export interface ResourceCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
}
