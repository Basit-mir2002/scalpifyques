export const colors = {
  bg: '#05090C',
  bgElev: '#0B1117',
  card: '#0E1620',
  cardElev: '#121C26',
  border: '#1A2530',
  borderSoft: '#15202A',

  primary: '#2EE6C8',
  primaryDim: '#1F8A7A',
  primaryGlow: 'rgba(46,230,200,0.18)',

  purple: '#8B5CF6',
  purpleSoft: 'rgba(139,92,246,0.15)',

  orange: '#F97316',
  orangeSoft: 'rgba(249,115,22,0.15)',

  danger: '#EF4444',

  text: '#FFFFFF',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  textFaint: '#475569',
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
  display: { fontSize: 32, fontWeight: '700' as const, color: colors.text },
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  bodyMuted: { fontSize: 15, color: colors.textMuted },
  small: { fontSize: 13, color: colors.textMuted },
  label: { fontSize: 12, color: colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' as const },
};
