/**
 * Color palette for the football jersey community app
 * Optimized for dark mode as preferred by football fan culture
 */

export const Colors = {
  // Dark Theme (Primary)
  dark: {
    background: '#0A0E1A',
    surface: '#1A1F2E',
    surfaceSecondary: '#242936',
    surfaceHighlight: '#2E3442',

    text: '#FFFFFF',
    textSecondary: '#B8BFCC',
    textTertiary: '#8A92A3',
    textInverse: '#0A0E1A',

    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryLight: '#60A5FA',

    success: '#10B981',
    successLight: '#34D399',

    warning: '#F59E0B',
    warningLight: '#FBBF24',

    error: '#EF4444',
    errorLight: '#F87171',

    border: '#2E3442',
    borderLight: '#3F4757',

    accent: '#8B5CF6',
    accentLight: '#A78BFA',

    verified: '#10B981',
    negotiable: '#F59E0B',
    sold: '#6B7280',
  },

  // Light Theme (Secondary)
  light: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceSecondary: '#F3F4F6',
    surfaceHighlight: '#E5E7EB',

    text: '#111827',
    textSecondary: '#4B5563',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',

    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryLight: '#93C5FD',

    success: '#10B981',
    successLight: '#6EE7B7',

    warning: '#F59E0B',
    warningLight: '#FCD34D',

    error: '#EF4444',
    errorLight: '#FCA5A5',

    border: '#E5E7EB',
    borderLight: '#D1D5DB',

    accent: '#8B5CF6',
    accentLight: '#C4B5FD',

    verified: '#10B981',
    negotiable: '#F59E0B',
    sold: '#9CA3AF',
  },

  // Common colors
  common: {
    black: '#000000',
    white: '#FFFFFF',
    transparent: 'transparent',
  },
};

export type ThemeColors = typeof Colors.dark;
