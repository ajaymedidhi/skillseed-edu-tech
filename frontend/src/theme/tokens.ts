// SkillSeed design tokens — light + dark. Consumed via ThemeProvider.
export const palette = {
  light: {
    primary: '#10B981',
    primarySoft: '#D1FAE5',
    secondary: '#6366F1',
    secondarySoft: '#E0E7FF',
    accent: '#38BDF8',
    achievement: '#FBBF24',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceMuted: '#F1F5F9',
    surfaceGlass: 'rgba(255,255,255,0.75)',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    border: '#E2E8F0',
    shadow: 'rgba(15,23,42,0.08)',
    novaGlowA: '#6366F1',
    novaGlowB: '#38BDF8',
    novaGlowC: '#10B981',
  },
  dark: {
    primary: '#10B981',
    primarySoft: '#064E3B',
    secondary: '#8B8CF7',
    secondarySoft: '#312E81',
    accent: '#38BDF8',
    achievement: '#FBBF24',
    background: '#0A0A0B',
    surface: '#141416',
    surfaceMuted: '#1C1C1F',
    surfaceGlass: 'rgba(20,20,22,0.7)',
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',
    border: '#27272A',
    shadow: 'rgba(0,0,0,0.4)',
    novaGlowA: '#8B8CF7',
    novaGlowB: '#38BDF8',
    novaGlowC: '#10B981',
  },
};

export type Colors = typeof palette.light;

export const spacing = { xs: 4, sm: 8, md: 12, base: 16, lg: 24, xl: 32, xxl: 40, xxxl: 64 };
export const radius = { sm: 12, md: 20, lg: 28, xl: 36, full: 9999 };
export const fonts = {
  display: 'System', // fallback to system; large weight
  body: 'System',
};
export const type = {
  h1: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.8, lineHeight: 40 },
  h2: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.4, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2, lineHeight: 26 },
  bodyLg: { fontSize: 17, fontWeight: '500' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.2, lineHeight: 14 },
};
