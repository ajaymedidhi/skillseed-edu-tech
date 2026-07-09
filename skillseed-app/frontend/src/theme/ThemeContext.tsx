import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { palette, Colors, spacing, radius, type as typeScale } from './tokens';

type ThemeContextValue = {
  scheme: 'light' | 'dark';
  colors: Colors;
  spacing: typeof spacing;
  radius: typeof radius;
  type: typeof typeScale;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const scheme: 'light' | 'dark' = system === 'dark' ? 'dark' : 'light';
  const value = useMemo<ThemeContextValue>(
    () => ({ scheme, colors: palette[scheme], spacing, radius, type: typeScale }),
    [scheme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
