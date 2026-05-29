// Scalpify dark clinical theme.
// Deep, premium, medical-grade dark UI with blue accents and glassmorphic cards.
// `bgBase` is the solid dark color rendered once at the root (App.tsx).
// `bg` is transparent so screens inherit the root's radial-glow background.
export const colors = {
  // Surfaces
  bgBase: '#0A0C12',
  bg: 'transparent',
  bgElev: '#111820',
  card: 'rgba(255,255,255,0.04)',
  cardElev: 'rgba(255,255,255,0.07)',
  cardSubtle: 'rgba(255,255,255,0.03)',
  cardSolid: '#161B22',
  border: 'rgba(255,255,255,0.08)',
  borderSoft: 'rgba(255,255,255,0.05)',

  // Brand
  primary: '#0A84FF',
  primaryDeep: '#0066CC',
  primaryDim: '#4DA3FF',
  primarySoft: 'rgba(10,132,255,0.15)',
  primaryGlow: 'rgba(10,132,255,0.20)',

  // Status / accents
  success: '#30D158',
  successSoft: 'rgba(48,209,88,0.15)',
  successText: '#30D158',

  warning: '#FF9F0A',
  warningSoft: 'rgba(255,159,10,0.15)',

  danger: '#FF453A',
  dangerSoft: 'rgba(255,69,58,0.15)',
  dangerText: '#FF453A',

  // Text
  text: 'rgba(255,255,255,0.87)',
  textStrong: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.50)',
  textDim: 'rgba(255,255,255,0.30)',
  textFaint: 'rgba(255,255,255,0.20)',
  onPrimary: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '800' as const, color: colors.textStrong },
  h1: { fontSize: 28, fontWeight: '800' as const, color: colors.textStrong },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.textStrong },
  h3: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  bodyMuted: { fontSize: 15, color: colors.textMuted },
  small: { fontSize: 13, color: colors.textMuted },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.primary,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
  },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardStrong: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
};
