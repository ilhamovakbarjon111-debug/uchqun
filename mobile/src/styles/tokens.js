/**
 * Design Tokens - Premium Joyful Design System
 * Elegant, child-friendly, with delightful micro-interactions
 * Supports both Light and Dark modes
 */

// Light theme colors
const lightColors = {
  // Core text colors - darker for better readability on light backgrounds
  text: {
    primary: "#0F172A",
    secondary: "#475569",
    muted: "#64748B",
    tertiary: "#94A3B8",
    white: "#FFFFFF",
    inverse: "#F8FAFC",
  },

  // Light backgrounds - soft, not harsh white
  background: {
    primary: "#F8FAFC",      // Soft off-white
    secondary: "#F1F5F9",    // Light slate
    tertiary: "#E2E8F0",     // Slightly darker slate
    soft: "#FFFFFF",         // Pure white for cards
    gradient: ["#F8FAFC", "#F1F5F9", "#E2E8F0"],
    parentGradient: ["#6366F1", "#8B5CF6", "#EC4899"],
    teacherGradient: ["#0EA5E9", "#06B6D4", "#14B8A6"],
  },

  // Navigation colors
  nav: {
    active: "#6366F1",
    inactive: "#64748B",
    background: "#FFFFFF",
  },

  // Glassmorphism cards - light and airy
  card: {
    base: "rgba(255, 255, 255, 0.9)",
    elevated: "rgba(255, 255, 255, 0.95)",
    light: "rgba(248, 250, 252, 0.85)",
    border: "rgba(148, 163, 184, 0.2)",
    borderLight: "rgba(148, 163, 184, 0.1)",
  },

  // Surface colors
  surface: {
    card: "rgba(255, 255, 255, 0.9)",
    secondary: "#F1F5F9",
    tertiary: "#E2E8F0",
    overlay: "rgba(15, 23, 42, 0.75)",
  },

  // Border colors
  border: {
    light: "rgba(148, 163, 184, 0.2)",
    medium: "rgba(148, 163, 184, 0.3)",
    dark: "rgba(148, 163, 184, 0.5)",
  },
};

// Dark theme colors - improved contrast
const darkColors = {
  // Core text colors - much lighter for visibility on dark backgrounds
  text: {
    primary: "#F8FAFC",      // Very light for primary text
    secondary: "#CBD5E1",    // Light slate for secondary
    muted: "#94A3B8",        // Medium slate for muted
    tertiary: "#64748B",     // Darker slate for tertiary
    white: "#FFFFFF",
    inverse: "#0F172A",
  },

  // Dark backgrounds
  background: {
    primary: "#0F172A",      // Deep slate
    secondary: "#1E293B",    // Dark slate
    tertiary: "#334155",     // Medium slate
    soft: "#475569",         // Lighter slate
    gradient: ["#0F172A", "#1E293B", "#334155"],
    parentGradient: ["#6366F1", "#8B5CF6", "#EC4899"],
    teacherGradient: ["#0EA5E9", "#06B6D4", "#14B8A6"],
  },

  // Navigation colors
  nav: {
    active: "#818CF8",       // Lighter indigo for visibility
    inactive: "#94A3B8",     // Light slate
    background: "#1E293B",   // Dark slate
  },

  // Glassmorphism cards - lighter for better visibility
  card: {
    base: "rgba(51, 65, 85, 0.8)",         // Lighter dark glass
    elevated: "rgba(71, 85, 105, 0.85)",   // Even lighter for elevation
    light: "rgba(248, 250, 252, 0.1)",     // Subtle light overlay
    border: "rgba(148, 163, 184, 0.3)",    // More visible borders
    borderLight: "rgba(148, 163, 184, 0.15)",
  },

  // Surface colors
  surface: {
    card: "rgba(51, 65, 85, 0.8)",
    secondary: "#1E293B",
    tertiary: "#334155",
    overlay: "rgba(15, 23, 42, 0.9)",
  },

  // Border colors - more visible in dark mode
  border: {
    light: "rgba(148, 163, 184, 0.25)",
    medium: "rgba(148, 163, 184, 0.35)",
    dark: "rgba(148, 163, 184, 0.5)",
  },
};

// Function to get theme colors
export function getThemeColors(isDark = false) {
  return isDark ? darkColors : lightColors;
}

// Get complete tokens for a theme
export function getTokens(isDark = false) {
  const colors = isDark ? darkColors : lightColors;

  return {
    colors: {
      ...colors,
      // Primary accent - vibrant indigo
    accent: {
      blue: "#6366F1",
      blueSoft: "#A5B4FC",
      blueVibrant: "#4F46E5",
      50: "#EEF2FF",
      100: "#E0E7FF",
      200: "#C7D2FE",
      500: "#6366F1",
      600: "#4F46E5",
      700: "#4338CA",
    },

    // Semantic colors
    semantic: {
      success: "#10B981",
      successSoft: "#D1FAE5",
      warning: "#F59E0B",
      warningSoft: "#FEF3C7",
      error: "#EF4444",
      errorSoft: "#FEE2E2",
      info: "#3B82F6",
      infoSoft: "#DBEAFE",
    },

    // Joyful palette - for icons, badges, illustrations
    joy: {
      coral: "#FF6B6B",
      coralSoft: "#FFE5E5",
      mint: "#20E3B2",
      mintSoft: "#D1FAE5",
      sunflower: "#FFD93D",
      sunflowerSoft: "#FFF9DB",
      lavender: "#A78BFA",
      lavenderSoft: "#EDE9FE",
      sky: "#38BDF8",
      skySoft: "#E0F2FE",
      peach: "#FB923C",
      peachSoft: "#FFEDD5",
      rose: "#F472B6",
      roseSoft: "#FCE7F3",
      emerald: "#34D399",
      emeraldSoft: "#D1FAE5",
    },

    // Gradient presets (for LinearGradient)
    gradients: {
      primary: ["#3B82F6", "#8B5CF6"],
      success: ["#10B981", "#34D399"],
      sunset: ["#F472B6", "#FB923C"],
      ocean: ["#06B6D4", "#3B82F6"],
      aurora: ["#A78BFA", "#38BDF8"],
      golden: ["#F59E0B", "#FBBF24"],
      forest: ["#059669", "#10B981"],
      candy: ["#EC4899", "#F472B6"],
    },

    // Shadow colors
    ui: {
      shadow: "#0F172A",
      shadowBlue: "#3B82F6",
      overlay: "rgba(15, 23, 42, 0.4)",
    },
  },

  // Spacing scale - more compact and elegant
  space: {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    "2xl": 24,
    "3xl": 36,
    "4xl": 48,
  },

  // Alias for spacing
  spacing: {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    "2xl": 24,
    "3xl": 36,
    "4xl": 48,
  },

  // Border radius - more refined
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    "2xl": 24,
    pill: 999,
    full: 999,
  },

  // Typography
  typography: {
    fontSize: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36,
    },
    fontWeight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
  },

  // Type presets - more refined and elegant
  type: {
    hero: { fontSize: 28, fontWeight: "700", letterSpacing: -0.8, lineHeight: 34 },
    h1: { fontSize: 22, fontWeight: "700", letterSpacing: -0.5, lineHeight: 28 },
    h2: { fontSize: 18, fontWeight: "600", letterSpacing: -0.3, lineHeight: 24 },
    h3: { fontSize: 15, fontWeight: "600", letterSpacing: -0.1, lineHeight: 20 },
    body: { fontSize: 14, fontWeight: "400", letterSpacing: 0, lineHeight: 20 },
    bodyLarge: { fontSize: 15, fontWeight: "500", letterSpacing: 0, lineHeight: 22 },
    sub: { fontSize: 12, fontWeight: "500", letterSpacing: 0.1, lineHeight: 16 },
    caption: { fontSize: 10, fontWeight: "600", letterSpacing: 0.4, lineHeight: 13 },
    button: { fontSize: 14, fontWeight: "600", letterSpacing: 0.3, lineHeight: 18 },
  },

  // Shadows with color options
  shadow: {
    none: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    soft: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    card: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 5,
    },
    elevated: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 32,
      elevation: 8,
    },
    glow: {
      shadowColor: "#3B82F6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 6,
    },
    glowSuccess: {
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 6,
    },
  },

  // Animation timing - smoother and more refined
  animation: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 700,
    spring: { damping: 18, stiffness: 180 },
    springGentle: { damping: 25, stiffness: 120 },
    easing: {
      easeInOut: [0.4, 0, 0.2, 1],
      easeOut: [0, 0, 0.2, 1],
      easeIn: [0.4, 0, 1, 1],
      sharp: [0.4, 0, 0.6, 1],
    },
  },

  // Touch targets (accessibility) - more compact
  touchTarget: {
    min: 40,
    comfortable: 44,
  },

  // Icon sizes - more refined
  icon: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    "2xl": 48,
  },
  };
}

// Default tokens (light theme)
export const tokens = getTokens(false);

// Joyful icon mapping - maps generic names to fun alternatives
export const joyfulIcons = {
  // Navigation & Actions
  home: "🏠",
  dashboard: "✨",
  back: "👈",
  forward: "👉",
  menu: "☰",
  close: "✕",
  settings: "⚙️",

  // Content types
  activity: "🎨",
  activities: "🎯",
  meal: "🍽️",
  meals: "🥗",
  media: "📸",
  photos: "🖼️",
  video: "🎬",

  // People
  child: "👶",
  children: "👨‍👩‍👧‍👦",
  parent: "👨‍👩‍👧",
  teacher: "👩‍🏫",
  student: "🎒",

  // Status & Emotions
  success: "🎉",
  warning: "⚠️",
  error: "😕",
  info: "💡",
  love: "💖",
  star: "⭐",
  trophy: "🏆",

  // Actions
  add: "➕",
  edit: "✏️",
  delete: "🗑️",
  save: "💾",
  send: "📤",
  download: "📥",
  upload: "☁️",

  // Communication
  chat: "💬",
  ai: "🤖",
  notification: "🔔",
  message: "✉️",

  // Time & Calendar
  calendar: "📅",
  clock: "⏰",
  today: "📆",

  // School
  school: "🏫",
  book: "📚",
  pencil: "✏️",
  art: "🎨",
  music: "🎵",
  sports: "⚽",
  science: "🔬",
  math: "🔢",

  // Food
  breakfast: "🥞",
  lunch: "🍱",
  snack: "🍎",
  dinner: "🍝",
  drink: "🥤",

  // Weather/Nature (for backgrounds)
  sun: "☀️",
  cloud: "☁️",
  rainbow: "🌈",
  flower: "🌸",
  tree: "🌳",

  // Misc
  sparkle: "✨",
  magic: "🪄",
  gift: "🎁",
  balloon: "🎈",
  confetti: "🎊",
};

export default tokens;
