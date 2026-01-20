/**
 * Mobile App UI/UX Color Palette & Design System
 * Based on the provided design specification
 */

export const Colors = {
  // Primary Colors
  primary: {
    blue: '#2563eb',        // Primary blue (used for dashboard, primary actions)
    blueLight: '#3b82f6',   // Lighter blue variant
    blueDark: '#1e40af',    // Darker blue variant
    blueBg: '#eff6ff',      // Light blue background
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

  // Navigation
  navigation: {
    active: '#2563eb',      // Active tab color
    inactive: '#6b7280',    // Inactive tab color
    background: '#ffffff',  // Navigation background
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

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Layout,
  CommonStyles,
};
