import { Platform, StyleSheet } from 'react-native';

export const colors = {
  // Brand palette matching the hand-heart logo (pink-purple)
  primaryPurple: '#7B5EA7',
  lightPurple: '#A78BCA',
  deepPurple: '#5C3D8F',
  primaryPink: '#E88DAE',
  lightPink: '#F4B8CC',
  deepPink: '#D4678E',
  primaryBlue: '#5B8DB8',
  lightBlue: '#89B4D4',
  crisisRed: '#D84040',
  crisisOrange: '#E8714A',
  // Backgrounds
  background: '#FAF5FB',
  surface: '#FFFFFF',
  surfaceElevated: '#F8F3FA',
  // Text - high contrast
  textDark: '#1A1028',
  textMedium: '#4A3F5C',
  textLight: '#7A6E8A',
  // Others
  white: '#FFFFFF',
  black: '#000000',
  success: '#3A9E5C',
  good: '#5BAF72',
  okay: '#D4A843',
  bad: '#D68B50',
  awful: '#C45454',
  border: '#E8DFF0',
  // Gradients (brand: pink ↔ purple)
  gradientPurple: ['#7B5EA7', '#A78BCA'] as const,
  gradientBrand: ['#E88DAE', '#7B5EA7'] as const,
  gradientBlue: ['#5B8DB8', '#89B4D4'] as const,
  gradientPink: ['#E88DAE', '#F4B8CC'] as const,
  gradientWelcome: ['#5C3D8F', '#7B5EA7', '#E88DAE'] as const,
  gradientDeep: ['#3D2560', '#5C3D8F'] as const,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'Arial, sans-serif',
}) ?? 'System';

export const shadows = StyleSheet.create({
  sm: Platform.select({
    ios: { shadowColor: '#1A1028', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
    android: { elevation: 2 },
    default: { shadowColor: '#1A1028', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
  }) as object,
  md: Platform.select({
    ios: { shadowColor: '#1A1028', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14, shadowRadius: 8 },
    android: { elevation: 4 },
    default: { shadowColor: '#1A1028', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14, shadowRadius: 8 },
  }) as object,
  lg: Platform.select({
    ios: { shadowColor: '#1A1028', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18, shadowRadius: 16 },
    android: { elevation: 8 },
    default: { shadowColor: '#1A1028', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18, shadowRadius: 16 },
  }) as object,
});

export const moodColors: Record<number, string> = {
  1: colors.awful,
  2: colors.bad,
  3: colors.okay,
  4: colors.good,
  5: colors.success,
};

export const moodEmojis: Record<number, string> = {
  1: '\u{1F622}',
  2: '\u{1F61F}',
  3: '\u{1F610}',
  4: '\u{1F642}',
  5: '\u{1F60A}',
};

export const moodLabels: Record<number, string> = {
  1: 'Awful',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

export const categories = ['Self-Love', 'Strength', 'Hope', 'Healing', 'Recovery'] as const;
