/**
 * Mobile App UI/UX Color Palette & Design System
 * Based on Mobile-icons.md design specification
 */

// Import tokens using ES6 import (proper module initialization)
import importedTokens from './tokens';

// Defensive check: ensure tokens is properly initialized
const safeTokens = (importedTokens && importedTokens.colors) ? importedTokens : {
  colors: {
    nav: { active: '#2E3A59', inactive: '#8F9BB3', background: '#ffffff' },
    accent: { blue: '#2563eb', blueSoft: '#3b82f6', blueVibrant: '#1e40af', 50: '#eff6ff' },
    text: { primary: '#111827', secondary: '#6b7280', tertiary: '#9ca3af', white: '#ffffff', muted: '#d1d5db' },
    joy: { skySoft: '#E8F4FD', mintSoft: '#E5F7F0', peachSoft: '#FFF0E5', lavender: '#8b5cf6' },
    semantic: { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6' },
    surface: { card: '#ffffff', secondary: '#f9fafb', tertiary: '#f3f4f6' },
    card: { base: '#ffffff', border: 'rgba(255, 255, 255, 0.5)' },
    border: { light: '#e5e7eb', medium: '#d1d5db', dark: '#9ca3af' },
  },
  type: {
    caption: { fontSize: 12 },
    sub: { fontSize: 14 },
    body: { fontSize: 16 },
    bodyLarge: { fontSize: 18 },
    h3: { fontSize: 20 },
    h2: { fontSize: 24 },
    h1: { fontSize: 30 },
  },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48 },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 },
  shadow: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 },
  },
};

if (!importedTokens || !importedTokens.colors) {
  console.warn('[theme.js] tokens not properly initialized, using fallback values');
}

export const Colors = {
  // Primary Colors (Updated per Mobile-icons.md)
  primary: {
    navy: '#2E3A59',        // Soft Navy - primary icon color
    blue: '#2563eb',        // Primary blue (used for dashboard, primary actions)
    blueLight: '#3b82f6',   // Lighter blue variant
    blueDark: '#1e40af',    // Darker blue variant
    blueBg: '#eff6ff',      // Light blue background
  },

  // Design System Colors (from Mobile-icons.md)
  design: {
    softNavy: '#2E3A59',     // Icon color on light backgrounds
    textTertiary: '#8F9BB3', // Inactive state color
    powderBlue: '#E8F4FD',   // Stat card backgrounds
    mintMist: '#E5F7F0',     // Success/completed state backgrounds
    blushPeach: '#FFF0E5',   // Warm accent backgrounds
    glassBackground: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
  },

  // Card Colors (from screenshot)
  cards: {
    parents: '#2563eb',     // Blue for Parents card
    activities: '#10b981',  // Green for Activities card
    meals: '#f59e0b',       // Orange/Amber for Meals card
    media: '#8b5cf6',       // Purple for Media card
  },

  // Status Colors
  status: {
    success: '#10b981',     // Green (completed tasks, success states)
    warning: '#f59e0b',     // Orange (warnings)
    error: '#ef4444',       // Red (errors)
    info: '#3b82f6',        // Blue (info messages)
  },

  // Background Colors
  background: {
    primary: '#ffffff',     // White background
    secondary: '#f9fafb',   // Light gray background
    tertiary: '#f3f4f6',    // Medium gray background
    card: '#ffffff',        // Card background
  },

  // Text Colors
  text: {
    primary: '#111827',     // Dark gray - primary text
    secondary: '#6b7280',   // Medium gray - secondary text
    tertiary: '#9ca3af',    // Light gray - tertiary text
    inverse: '#ffffff',     // White text on dark backgrounds
    disabled: '#d1d5db',    // Disabled text
  },

  // Border Colors
  border: {
    light: '#e5e7eb',       // Light border
    medium: '#d1d5db',      // Medium border
    dark: '#9ca3af',        // Dark border
  },

  // Progress Colors
  progress: {
    background: '#e5e7eb',  // Progress bar background
    fill: '#2563eb',        // Progress bar fill (blue)
    success: '#10b981',     // Success progress
  },

  // Navigation (Updated per Mobile-icons.md)
  navigation: {
    active: '#2E3A59',      // Soft Navy - active tab color
    inactive: '#8F9BB3',    // Text Tertiary - inactive tab color
    background: '#ffffff',  // Navigation background
    activeBackground: '#2E3A59', // Background for active icon
  },

  // Shadows
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export const Typography = {
  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },

  // Font Weights
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line Heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Layout = {
  // Header
  headerHeight: 60,
  headerPadding: 16,

  // Cards
  cardPadding: 16,
  cardMargin: 16,
  cardBorderRadius: 12,

  // Bottom Navigation
  bottomNavHeight: 70,

  // Common margins
  screenPadding: 16,
  sectionSpacing: 24,
};

// Common Styles
export const CommonStyles = {
  // Containers
  container: {
    flex: 1,
    backgroundColor: Colors.background.tertiary,
  },

  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },

  // Cards
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Layout.cardPadding,
    ...Colors.shadow.sm,
  },

  // Headers
  header: {
    backgroundColor: Colors.primary.blue,
    paddingTop: 40,
    paddingBottom: Layout.headerPadding,
    paddingHorizontal: Layout.screenPadding,
  },

  // Text Styles
  heading1: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },

  heading2: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },

  heading3: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },

  bodyText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.normal,
    color: Colors.text.primary,
  },

  caption: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.normal,
    color: Colors.text.secondary,
  },

  // Buttons
  primaryButton: {
    backgroundColor: Colors.primary.blue,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
};

// Create theme object compatible with old code
// Use safe property access to prevent crashes during module initialization
const safeGet = (obj, path, defaultValue = '#000000') => {
  try {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        console.warn(`[theme.js] Safe access failed at path: ${path}, using default`);
        return defaultValue;
      }
      result = result[key];
    }
    return result != null ? result : defaultValue;
  } catch (error) {
    console.warn(`[theme.js] Error accessing path: ${path}`, error);
    return defaultValue;
  }
};

const ThemeColors = {
  primary: {
    navy: safeGet(safeTokens, 'colors.nav.active', '#2E3A59'),
    blue: safeGet(safeTokens, 'colors.accent.blue', '#2563eb'),
    blueLight: safeGet(safeTokens, 'colors.accent.blueSoft', '#3b82f6'),
    blueDark: safeGet(safeTokens, 'colors.accent.blueVibrant', '#1e40af'),
    blueBg: safeGet(safeTokens, 'colors.accent.50', '#eff6ff'),
  },
  design: {
    softNavy: safeGet(safeTokens, 'colors.nav.active', '#2E3A59'),
    textTertiary: safeGet(safeTokens, 'colors.text.tertiary', '#8F9BB3'),
    powderBlue: safeGet(safeTokens, 'colors.joy.skySoft', '#E8F4FD'),
    mintMist: safeGet(safeTokens, 'colors.joy.mintSoft', '#E5F7F0'),
    blushPeach: safeGet(safeTokens, 'colors.joy.peachSoft', '#FFF0E5'),
    glassBackground: safeGet(safeTokens, 'colors.card.base', 'rgba(255, 255, 255, 0.8)'),
    glassBorder: safeGet(safeTokens, 'colors.card.border', 'rgba(255, 255, 255, 0.5)'),
  },
  cards: {
    parents: safeGet(safeTokens, 'colors.accent.blue', '#2563eb'),
    activities: safeGet(safeTokens, 'colors.semantic.success', '#10b981'),
    meals: safeGet(safeTokens, 'colors.semantic.warning', '#f59e0b'),
    media: safeGet(safeTokens, 'colors.joy.lavender', '#8b5cf6'),
  },
  status: {
    success: safeGet(safeTokens, 'colors.semantic.success', '#10b981'),
    warning: safeGet(safeTokens, 'colors.semantic.warning', '#f59e0b'),
    error: safeGet(safeTokens, 'colors.semantic.error', '#ef4444'),
    info: safeGet(safeTokens, 'colors.semantic.info', '#3b82f6'),
  },
  background: {
    primary: safeGet(safeTokens, 'colors.surface.card', '#ffffff'),
    secondary: safeGet(safeTokens, 'colors.surface.secondary', '#f9fafb'),
    tertiary: safeGet(safeTokens, 'colors.surface.tertiary', '#f3f4f6'),
    card: safeGet(safeTokens, 'colors.card.base', '#ffffff'),
  },
  text: {
    primary: safeGet(safeTokens, 'colors.text.primary', '#111827'),
    secondary: safeGet(safeTokens, 'colors.text.secondary', '#6b7280'),
    tertiary: safeGet(safeTokens, 'colors.text.tertiary', '#9ca3af'),
    inverse: safeGet(safeTokens, 'colors.text.white', '#ffffff'),
    disabled: safeGet(safeTokens, 'colors.text.muted', '#d1d5db'),
  },
  border: {
    light: safeGet(safeTokens, 'colors.border.light', '#e5e7eb'),
    medium: safeGet(safeTokens, 'colors.border.medium', '#d1d5db'),
    dark: safeGet(safeTokens, 'colors.border.dark', '#9ca3af'),
  },
  progress: {
    background: safeGet(safeTokens, 'colors.border.light', '#e5e7eb'),
    fill: safeGet(safeTokens, 'colors.accent.blue', '#2563eb'),
    success: safeGet(safeTokens, 'colors.semantic.success', '#10b981'),
  },
  navigation: {
    active: safeGet(safeTokens, 'colors.nav.active', '#2E3A59'),
    inactive: safeGet(safeTokens, 'colors.nav.inactive', '#8F9BB3'),
    background: safeGet(safeTokens, 'colors.nav.background', '#ffffff'),
    activeBackground: safeGet(safeTokens, 'colors.nav.active', '#2E3A59'),
  },
  shadow: {
    sm: safeGet(safeTokens, 'shadow.sm', { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }),
    md: safeGet(safeTokens, 'shadow.md', { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 }),
    lg: safeGet(safeTokens, 'shadow.lg', { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 }),
  },
};

const ThemeTypography = {
  sizes: {
    xs: safeGet(safeTokens, 'type.caption.fontSize', 12),
    sm: safeGet(safeTokens, 'type.sub.fontSize', 14),
    base: safeGet(safeTokens, 'type.body.fontSize', 16),
    lg: safeGet(safeTokens, 'type.bodyLarge.fontSize', 18),
    xl: safeGet(safeTokens, 'type.h3.fontSize', 20),
    '2xl': safeGet(safeTokens, 'type.h2.fontSize', 24),
    '3xl': safeGet(safeTokens, 'type.h1.fontSize', 30),
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

const ThemeSpacing = {
  xs: safeGet(safeTokens, 'space.xs', 4),
  sm: safeGet(safeTokens, 'space.sm', 8),
  md: safeGet(safeTokens, 'space.md', 16),
  lg: safeGet(safeTokens, 'space.lg', 24),
  xl: safeGet(safeTokens, 'space.xl', 32),
  '2xl': safeGet(safeTokens, 'space.2xl', 48),
};

const ThemeBorderRadius = {
  xs: 4,
  sm: safeGet(safeTokens, 'radius.sm', 8),
  md: safeGet(safeTokens, 'radius.md', 12),
  lg: safeGet(safeTokens, 'radius.lg', 16),
  xl: safeGet(safeTokens, 'radius.xl', 20),
  full: safeGet(safeTokens, 'radius.full', 9999),
};

const ThemeLayout = {
  headerHeight: 60,
  headerPadding: safeGet(safeTokens, 'space.md', 16),
  cardPadding: safeGet(safeTokens, 'space.md', 16),
  cardMargin: safeGet(safeTokens, 'space.md', 16),
  cardBorderRadius: safeGet(safeTokens, 'radius.md', 12),
  bottomNavHeight: 70,
  screenPadding: safeGet(safeTokens, 'space.md', 16),
  sectionSpacing: safeGet(safeTokens, 'space.lg', 24),
};

// Common Styles using theme values
const ThemeCommonStyles = {
  container: {
    flex: 1,
    backgroundColor: ThemeColors.background.tertiary,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: ThemeColors.background.secondary,
  },
  card: {
    backgroundColor: ThemeColors.background.card,
    borderRadius: ThemeBorderRadius.md,
    padding: ThemeLayout.cardPadding,
    ...ThemeColors.shadow.sm,
  },
  header: {
    backgroundColor: ThemeColors.primary.blue,
    paddingTop: 40,
    paddingBottom: ThemeLayout.headerPadding,
    paddingHorizontal: ThemeLayout.screenPadding,
  },
  heading1: {
    fontSize: ThemeTypography.sizes['2xl'],
    fontWeight: ThemeTypography.weights.bold,
    color: ThemeColors.text.primary,
  },
  heading2: {
    fontSize: ThemeTypography.sizes.xl,
    fontWeight: ThemeTypography.weights.semibold,
    color: ThemeColors.text.primary,
  },
  heading3: {
    fontSize: ThemeTypography.sizes.lg,
    fontWeight: ThemeTypography.weights.semibold,
    color: ThemeColors.text.primary,
  },
  bodyText: {
    fontSize: ThemeTypography.sizes.base,
    fontWeight: ThemeTypography.weights.normal,
    color: ThemeColors.text.primary,
  },
  caption: {
    fontSize: ThemeTypography.sizes.sm,
    fontWeight: ThemeTypography.weights.normal,
    color: ThemeColors.text.secondary,
  },
  primaryButton: {
    backgroundColor: ThemeColors.primary.blue,
    borderRadius: ThemeBorderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: ThemeColors.text.inverse,
    fontSize: ThemeTypography.sizes.base,
    fontWeight: ThemeTypography.weights.semibold,
  },
};

// Create theme object compatible with old code
const theme = {
  Colors: ThemeColors,
  Typography: ThemeTypography,
  Spacing: ThemeSpacing,
  BorderRadius: ThemeBorderRadius,
  Layout: ThemeLayout,
  CommonStyles: ThemeCommonStyles,
};

export default theme;
