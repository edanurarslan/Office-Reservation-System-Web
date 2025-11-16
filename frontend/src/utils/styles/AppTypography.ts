/**
 * Material Design 3 - Typography System
 * 16 Named text styles with consistent font sizes and line heights
 */

export const AppTypography = {
  // Named styles (Poppins font)
  h1: {
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.5px',
  } as const,

  h2: {
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: 1.4,
    letterSpacing: '0px',
  } as const,

  h3: {
    fontSize: '18px',
    fontWeight: 700,
    lineHeight: 1.4,
    letterSpacing: '0.1px',
  } as const,

  bodyLarge: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.15px',
  } as const,

  bodyMedium: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.25px',
  } as const,

  bodySmall: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: '0.4px',
  } as const,

  buttonText: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '0.46px',
    textTransform: 'uppercase',
  } as const,

  labelLarge: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.1px',
  } as const,

  labelMedium: {
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '0.5px',
  } as const,

  labelSmall: {
    fontSize: '11px',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '0.5px',
  } as const,

  caption: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: '0.4px',
  } as const,

  overline: {
    fontSize: '10px',
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  } as const,

  hint: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1.3,
    letterSpacing: '0.4px',
    opacity: 0.6,
  } as const,

  statNumber: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.5px',
  } as const,

  inputLabel: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0px',
  } as const,
};

// Tailwind className mapping
export const typographyClasses = {
  h1: 'text-4xl font-bold leading-tight',
  h2: 'text-2xl font-bold leading-snug',
  h3: 'text-xl font-bold leading-snug',
  bodyLarge: 'text-base font-normal leading-relaxed',
  bodyMedium: 'text-sm font-normal leading-relaxed',
  bodySmall: 'text-xs font-normal leading-relaxed',
  buttonText: 'text-sm font-semibold leading-tight uppercase',
  labelLarge: 'text-sm font-semibold',
  labelMedium: 'text-xs font-semibold',
  labelSmall: 'text-xs font-semibold',
  caption: 'text-xs font-normal',
  overline: 'text-xs font-bold uppercase tracking-widest',
  hint: 'text-xs font-normal text-opacity-60',
  statNumber: 'text-2xl font-bold leading-tight',
  inputLabel: 'text-sm font-medium',
} as const;

// Helper function to get style object
export const getTypographyStyle = (variant: keyof typeof AppTypography) => {
  return AppTypography[variant];
};

// Helper function to get className
export const getTypographyClass = (variant: keyof typeof typographyClasses) => {
  return typographyClasses[variant];
};
