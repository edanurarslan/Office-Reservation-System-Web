/**
 * Material Design 3 - 8dp Grid Spacing System
 * All values follow 8dp grid: 4, 8, 16, 24, 32, 48, 64, 80
 */

export const AppSpacing = {
  // Base spacing values (8dp grid)
  xs: 4,      // tight spacing
  sm: 8,      // small
  md: 16,     // medium - DEFAULT
  lg: 24,     // large
  xl: 32,     // extra large
  xxl: 48,    // 2x extra large
  huge: 64,   // section spacing
  massive: 80, // page spacing

  // Padding helpers
  paddingAll: (value: number) => ({ padding: `${value}px` }),
  paddingSymmetric: (horizontal: number, vertical: number) => ({
    paddingLeft: `${horizontal}px`,
    paddingRight: `${horizontal}px`,
    paddingTop: `${vertical}px`,
    paddingBottom: `${vertical}px`,
  }),
  paddingOnly: (
    left?: number,
    right?: number,
    top?: number,
    bottom?: number
  ) => ({
    paddingLeft: left ? `${left}px` : undefined,
    paddingRight: right ? `${right}px` : undefined,
    paddingTop: top ? `${top}px` : undefined,
    paddingBottom: bottom ? `${bottom}px` : undefined,
  }),

  // Margin helpers
  marginAll: (value: number) => ({ margin: `${value}px` }),
  marginSymmetric: (
    horizontal?: number,
    vertical?: number
  ) => ({
    marginLeft: horizontal ? `${horizontal}px` : undefined,
    marginRight: horizontal ? `${horizontal}px` : undefined,
    marginTop: vertical ? `${vertical}px` : undefined,
    marginBottom: vertical ? `${vertical}px` : undefined,
  }),
  marginOnly: (
    left?: number,
    right?: number,
    top?: number,
    bottom?: number
  ) => ({
    marginLeft: left ? `${left}px` : undefined,
    marginRight: right ? `${right}px` : undefined,
    marginTop: top ? `${top}px` : undefined,
    marginBottom: bottom ? `${bottom}px` : undefined,
  }),

  // Gap helpers (for flexbox)
  gapVertical: (value: number): React.CSSProperties => ({ gap: `${value}px 0` }),
  gapHorizontal: (value: number): React.CSSProperties => ({ gap: `0 ${value}px` }),
  gap: (value: number): React.CSSProperties => ({ gap: `${value}px` }),

  // Predefined padding combinations
  p4: { padding: '4px' },
  p8: { padding: '8px' },
  p12: { padding: '12px' },
  p16: { padding: '16px' },
  p24: { padding: '24px' },
  p32: { padding: '32px' },
  px8: { paddingLeft: '8px', paddingRight: '8px' },
  px16: { paddingLeft: '16px', paddingRight: '16px' },
  py8: { paddingTop: '8px', paddingBottom: '8px' },
  py16: { paddingTop: '16px', paddingBottom: '16px' },
  py24: { paddingTop: '24px', paddingBottom: '24px' },

  // Predefined margin combinations
  m4: { margin: '4px' },
  m8: { margin: '8px' },
  m12: { margin: '12px' },
  m16: { margin: '16px' },
  m24: { margin: '24px' },
  m32: { margin: '32px' },
  mx8: { marginLeft: '8px', marginRight: '8px' },
  mx16: { marginLeft: '16px', marginRight: '16px' },
  my8: { marginTop: '8px', marginBottom: '8px' },
  my16: { marginTop: '16px', marginBottom: '16px' },
  my24: { marginTop: '24px', marginBottom: '24px' },

  // Gap utilities
  gap4: { gap: '4px' },
  gap8: { gap: '8px' },
  gap12: { gap: '12px' },
  gap16: { gap: '16px' },
  gap24: { gap: '24px' },
  gap32: { gap: '32px' },
};

// Tailwind-like className helpers
export const spacingClasses = {
  // Padding classes
  'p-xs': 'p-1',      // 4px
  'p-sm': 'p-2',      // 8px
  'p-md': 'p-4',      // 16px
  'p-lg': 'p-6',      // 24px
  'p-xl': 'p-8',      // 32px
  'p-xxl': 'p-12',    // 48px
  'p-huge': 'p-16',   // 64px
  'p-massive': 'p-20', // 80px

  // Margin classes
  'm-xs': 'm-1',
  'm-sm': 'm-2',
  'm-md': 'm-4',
  'm-lg': 'm-6',
  'm-xl': 'm-8',
  'm-xxl': 'm-12',
  'm-huge': 'm-16',

  // Gap classes
  'gap-xs': 'gap-1',
  'gap-sm': 'gap-2',
  'gap-md': 'gap-4',
  'gap-lg': 'gap-6',
  'gap-xl': 'gap-8',
} as const;
