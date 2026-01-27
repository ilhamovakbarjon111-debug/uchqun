/**
 * Mobile App UI/UX Color Palette & Design System
 * Based on Mobile-icons.md design specification
 */

// Import tokens first (must be at top for proper module initialization)
import tokens from './tokens';

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
const ThemeColors = {
  primary: {
    navy: tokens.colors.nav.active,
    blue: tokens.colors.accent.blue,
    blueLight: tokens.colors.accent.blueSoft,
    blueDark: tokens.colors.accent.blueVibrant,
    blueBg: tokens.colors.accent[50],
  },
  design: {
    softNavy: tokens.colors.nav.active,
    textTertiary: tokens.colors.text.tertiary,
    powderBlue: tokens.colors.joy.skySoft,
    mintMist: tokens.colors.joy.mintSoft,
    blushPeach: tokens.colors.joy.peachSoft,
    glassBackground: tokens.colors.card.base,
    glassBorder: tokens.colors.card.border,
  },
  cards: {
    parents: tokens.colors.accent.blue,
    activities: tokens.colors.semantic.success,
    meals: tokens.colors.semantic.warning,
    media: tokens.colors.joy.lavender,
  },
  status: {
    success: tokens.colors.semantic.success,
    warning: tokens.colors.semantic.warning,
    error: tokens.colors.semantic.error,
    info: tokens.colors.semantic.info,
  },
  background: {
    primary: tokens.colors.surface.card,
    secondary: tokens.colors.surface.secondary,
    tertiary: tokens.colors.surface.tertiary,
    card: tokens.colors.card.base,
  },
  text: {
    primary: tokens.colors.text.primary,
    secondary: tokens.colors.text.secondary,
    tertiary: tokens.colors.text.tertiary,
    inverse: tokens.colors.text.white,
    disabled: tokens.colors.text.muted,
  },
  border: {
    light: tokens.colors.border.light,
    medium: tokens.colors.border.medium,
    dark: tokens.colors.border.dark,
  },
  progress: {
    background: tokens.colors.border.light,
    fill: tokens.colors.accent.blue,
    success: tokens.colors.semantic.success,
  },
  navigation: {
    active: tokens.colors.nav.active,
    inactive: tokens.colors.nav.inactive,
    background: tokens.colors.nav.background,
    activeBackground: tokens.colors.nav.active,
  },
  shadow: {
    sm: tokens.shadow.sm,
    md: tokens.shadow.md,
    lg: tokens.shadow.lg,
  },
};

const ThemeTypography = {
  sizes: {
    xs: tokens.type.caption.fontSize,
    sm: tokens.type.sub.fontSize,
    base: tokens.type.body.fontSize,
    lg: tokens.type.bodyLarge.fontSize,
    xl: tokens.type.h3.fontSize,
    '2xl': tokens.type.h2.fontSize,
    '3xl': tokens.type.h1.fontSize,
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
  xs: tokens.space.xs,
  sm: tokens.space.sm,
  md: tokens.space.md,
  lg: tokens.space.lg,
  xl: tokens.space.xl,
  '2xl': tokens.space['2xl'],
};

const ThemeBorderRadius = {
  sm: tokens.radius.sm,
  md: tokens.radius.md,
  lg: tokens.radius.lg,
  xl: tokens.radius.xl,
  full: tokens.radius.full,
};

const ThemeLayout = {
  headerHeight: 60,
  headerPadding: tokens.space.md,
  cardPadding: tokens.space.md,
  cardMargin: tokens.space.md,
  cardBorderRadius: tokens.radius.md,
  bottomNavHeight: 70,
  screenPadding: tokens.space.md,
  sectionSpacing: tokens.space.lg,
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
