/**
 * Design Tokens - Premium Joyful Design System
 * Elegant, child-friendly, with delightful micro-interactions
 */

export const tokens = {
  colors: {
    // Core text colors
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
      muted: "#94A3B8",
      white: "#FFFFFF",
      inverse: "#F8FAFC",
    },

    // Glassmorphism cards
    card: {
      base: "rgba(255, 255, 255, 0.88)",
      elevated: "rgba(255, 255, 255, 0.95)",
      border: "rgba(255, 255, 255, 0.6)",
      borderLight: "rgba(255, 255, 255, 0.3)",
    },

    // Primary accent - vibrant blue
    accent: {
      blue: "#3B82F6",
      blueSoft: "#93C5FD",
      blueVibrant: "#2563EB",
      50: "#EFF6FF",
      100: "#DBEAFE",
      200: "#BFDBFE",
      500: "#3B82F6",
      600: "#2563EB",
      700: "#1D4ED8",
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

  // Spacing scale
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
    "3xl": 48,
    "4xl": 64,
  },

  // Alias for spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
    "3xl": 48,
    "4xl": 64,
  },

  // Border radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
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

  // Type presets
  type: {
    hero: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5, lineHeight: 38 },
    h1: { fontSize: 26, fontWeight: "700", letterSpacing: -0.3, lineHeight: 32 },
    h2: { fontSize: 20, fontWeight: "700", letterSpacing: -0.2, lineHeight: 26 },
    h3: { fontSize: 17, fontWeight: "600", letterSpacing: 0, lineHeight: 22 },
    body: { fontSize: 15, fontWeight: "500", letterSpacing: 0, lineHeight: 22 },
    bodyLarge: { fontSize: 17, fontWeight: "500", letterSpacing: 0, lineHeight: 24 },
    sub: { fontSize: 13, fontWeight: "500", letterSpacing: 0.1, lineHeight: 18 },
    caption: { fontSize: 11, fontWeight: "600", letterSpacing: 0.3, lineHeight: 14 },
    button: { fontSize: 15, fontWeight: "600", letterSpacing: 0.2, lineHeight: 20 },
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

  // Animation timing
  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
    spring: { damping: 15, stiffness: 150 },
  },

  // Touch targets (accessibility)
  touchTarget: {
    min: 44,
    comfortable: 48,
  },

  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    "2xl": 56,
  },
};

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
