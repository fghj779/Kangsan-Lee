/**
 * Dark theme color palette for football jersey community
 */
export const COLORS = {
  // Background colors
  background: '#1a1a1a',
  backgroundSecondary: '#2a2a2a',
  card: '#2a2a2a',
  cardHighlight: '#333333',

  // Text colors
  text: '#ffffff',
  textSecondary: '#888888',
  textTertiary: '#666666',
  textMuted: '#555555',

  // Primary brand color
  primary: '#00a8ff',
  primaryDark: '#0088cc',
  primaryLight: '#33b9ff',

  // Status colors
  success: '#00d68f',
  warning: '#ffaa00',
  error: '#ff3b30',
  info: '#00a8ff',

  // Reputation colors
  reputationPositive: '#00d68f',
  reputationNeutral: '#ffaa00',
  reputationNegative: '#ff3b30',

  // UI elements
  border: '#333333',
  borderLight: '#444444',
  divider: '#2a2a2a',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Interactive elements
  buttonBackground: '#00a8ff',
  buttonDisabled: '#444444',
  inputBackground: '#2a2a2a',
  inputBorder: '#444444',
  inputFocus: '#00a8ff',

  // Category colors
  categoryDiscussion: '#00a8ff',
  categoryReview: '#00d68f',
  categoryVerification: '#ffaa00',
  categoryQuestion: '#ff3b30',
  categoryNews: '#8b5cf6',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
