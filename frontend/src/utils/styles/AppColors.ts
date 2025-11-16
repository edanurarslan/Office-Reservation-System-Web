/**
 * Material Design 3 - Color System
 * Consistent color palette for the entire application
 */

export const AppColors = {
  // Primary - Indigo
  primary: '#5088D9',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryVariant: '#6366F1',

  // Secondary - Purple
  secondary: '#9C27B0',
  secondaryLight: '#BA68C8',
  secondaryDark: '#7B1FA2',

  // Tertiary - Teal
  tertiary: '#00897B',
  tertiaryLight: '#26A69A',
  tertiaryDark: '#00695C',

  // Success - Green
  success: '#4CAF50',
  successLight: '#81C784',
  successDark: '#388E3C',

  // Error - Red
  error: '#F44336',
  errorLight: '#EF5350',
  errorDark: '#D32F2F',

  // Warning - Orange
  warning: '#FF9800',
  warningLight: '#FFB74D',
  warningDark: '#F57C00',

  // Info - Blue
  info: '#2196F3',
  infoLight: '#64B5F6',
  infoDark: '#1976D2',

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Backgrounds & Surfaces
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F3FF',

  // Text colors
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textHint: '#CBD5E1',
  textDisabled: '#E2E8F0',

  // Dividers & Borders
  divider: '#E2E8F0',
  border: '#E0E7FF',
  borderLight: '#F5F3FF',

  // Overlay & Scrim
  overlay: 'rgba(15, 23, 42, 0.5)',
  scrim: 'rgba(15, 23, 42, 0.32)',

  // Glass effect backgrounds
  glassLight: 'rgba(255, 255, 255, 0.9)',
  glassMedium: 'rgba(255, 255, 255, 0.85)',
  glassDark: 'rgba(255, 255, 255, 0.72)',
};

// Gradients
export const AppGradients = {
  primaryGradient:
    'linear-gradient(90deg, #6366F1 0%, #818CF8 50%, #4F46E5 100%)',
  secondaryGradient:
    'linear-gradient(90deg, #9C27B0 0%, #BA68C8 50%, #7B1FA2 100%)',
  successGradient:
    'linear-gradient(90deg, #4CAF50 0%, #81C784 50%, #388E3C 100%)',
  warningGradient:
    'linear-gradient(90deg, #FF9800 0%, #FFB74D 50%, #F57C00 100%)',
  errorGradient:
    'linear-gradient(90deg, #F44336 0%, #EF5350 50%, #D32F2F 100%)',
};

// Shadow system (Material Design 3)
export const AppShadows = {
  // Level 1: buttons, chips
  level1: '0 2px 4px rgba(99, 102, 241, 0.12)',

  // Level 2: inputs, stat cards
  level2: '0 4px 8px rgba(99, 102, 241, 0.15)',

  // Level 3: cards, panels (DEFAULT)
  level3: '0 8px 16px rgba(99, 102, 241, 0.18)',

  // Level 4: modals, dialogs
  level4: '0 12px 24px rgba(99, 102, 241, 0.22)',

  // Level 5: floating actions, menus
  level5: '0 16px 32px rgba(99, 102, 241, 0.25)',

  // Special shadows
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  inset: 'inset 0 1px 3px rgba(0, 0, 0, 0.12)',
};

// Opacity helpers
export const AppOpacity = {
  disabled: 0.38,
  hover: 0.08,
  focus: 0.12,
  selected: 0.16,
};

// Color utilities
export const ColorUtils = {
  withOpacity: (color: string, opacity: number) => {
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },

  lighten: (color: string, _percent: number) => {
    // Simple lighten implementation
    return `${color}cc`;
  },

  darken: (color: string, _percent: number) => {
    // Simple darken implementation
    return `${color}99`;
  },
};

// Tailwind color mapping
export const tailwindColorMap = {
  primary: 'indigo-600',
  secondary: 'purple-600',
  tertiary: 'teal-600',
  success: 'green-600',
  error: 'red-600',
  warning: 'orange-600',
  info: 'blue-600',
  textPrimary: 'gray-900',
  textSecondary: 'gray-600',
  border: 'gray-300',
  divider: 'gray-200',
  background: 'slate-50',
} as const;
