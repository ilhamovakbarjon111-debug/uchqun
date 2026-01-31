import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import tokens from '../styles/tokens';

// Dark theme color overrides
const darkOverrides = {
  text: {
    primary: "#F8FAFC",      // Very light for primary text
    secondary: "#CBD5E1",    // Light slate for secondary
    muted: "#94A3B8",        // Medium slate for muted
    tertiary: "#64748B",     // Darker slate for tertiary
    white: "#FFFFFF",
    inverse: "#0F172A",
  },

  background: {
    primary: "#0F172A",      // Deep slate
    secondary: "#1E293B",    // Dark slate
    tertiary: "#334155",     // Medium slate
    soft: "#475569",         // Lighter slate
    gradient: ["#0F172A", "#1E293B", "#334155"],
    parentGradient: ["#6366F1", "#8B5CF6", "#EC4899"],
    teacherGradient: ["#0EA5E9", "#06B6D4", "#14B8A6"],
  },

  nav: {
    active: "#818CF8",       // Lighter indigo for visibility
    inactive: "#94A3B8",     // Light slate
    background: "#1E293B",   // Dark slate
  },

  card: {
    base: "rgba(51, 65, 85, 0.9)",         // Lighter dark glass
    elevated: "rgba(71, 85, 105, 0.95)",   // Even lighter for elevation
    light: "rgba(248, 250, 252, 0.1)",     // Subtle light overlay
    border: "rgba(148, 163, 184, 0.3)",    // More visible borders
    borderLight: "rgba(148, 163, 184, 0.2)",
  },

  surface: {
    card: "rgba(51, 65, 85, 0.9)",
    secondary: "#1E293B",
    tertiary: "#334155",
    overlay: "rgba(15, 23, 42, 0.92)",
  },

  border: {
    light: "rgba(148, 163, 184, 0.3)",
    medium: "rgba(148, 163, 184, 0.4)",
    dark: "rgba(148, 163, 184, 0.6)",
  },
};

export function useThemeTokens() {
  const { isDark } = useTheme();

  return useMemo(() => {
    if (isDark) {
      return {
        ...tokens,
        colors: {
          ...tokens.colors,
          ...darkOverrides,
        },
      };
    }
    return tokens;
  }, [isDark]);
}
