import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path, Pattern, Line, Polygon } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

/**
 * TeacherBackground - Professional educational theme
 * Features: Cyan/Teal theme with subtle geometric patterns
 * Supports both light and dark modes
 */
export default function TeacherBackground() {
  const { isDark } = useTheme();

  // Light theme colors
  const lightColors = {
    main: ["#E0F2FE", "#F0F9FF", "#F8FAFC", "#FFFFFF"],
    accent1: ["#0EA5E9", "#06B6D4"],
    accent2: ["#14B8A6", "#0EA5E9"],
    pattern: "#0EA5E9",
    shapes: "#0EA5E9",
    shapes2: "#14B8A6",
  };

  // Dark theme colors
  const darkColors = {
    main: ["#1E293B", "#334155", "#475569", "#334155"],
    accent1: ["#0EA5E9", "#06B6D4"],
    accent2: ["#14B8A6", "#0EA5E9"],
    pattern: "#0EA5E9",
    shapes: "#0EA5E9",
    shapes2: "#14B8A6",
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none">
        <Defs>
          {/* Main gradient */}
          <LinearGradient id="teacherGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.main[0]} />
            <Stop offset="40%" stopColor={colors.main[1]} />
            <Stop offset="70%" stopColor={colors.main[2]} />
            <Stop offset="100%" stopColor={colors.main[3]} />
          </LinearGradient>
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none">
        <Defs>
          {/* Main gradient - Dark slate with cyan/teal accents */}
          <LinearGradient id="teacherGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#1E293B" />
            <Stop offset="40%" stopColor="#334155" />
            <Stop offset="70%" stopColor="#475569" />
            <Stop offset="100%" stopColor="#334155" />
          </LinearGradient>

          {/* Accent gradient for shapes */}
          <LinearGradient id="accentGradient1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.accent1[0]} stopOpacity={isDark ? "0.2" : "0.3"} />
            <Stop offset="100%" stopColor={colors.accent1[1]} stopOpacity={isDark ? "0.12" : "0.2"} />
          </LinearGradient>

          <LinearGradient id="accentGradient2" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.accent2[0]} stopOpacity={isDark ? "0.18" : "0.25"} />
            <Stop offset="100%" stopColor={colors.accent2[1]} stopOpacity={isDark ? "0.1" : "0.15"} />
          </LinearGradient>

          {/* Circle pattern */}
          <Pattern id="circlePattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <Circle cx="30" cy="30" r="1" fill={colors.pattern} opacity={isDark ? "0.15" : "0.2"} />
          </Pattern>
        </Defs>

        {/* Main background */}
        <Rect x="0" y="0" width="390" height="844" fill="url(#teacherGradient)" />

        {/* Subtle dot pattern */}
        <Rect x="0" y="0" width="390" height="844" fill="url(#circlePattern)" opacity="0.4" />

        {/* Top-left decorative arc */}
        <Path
          d="M0 0 Q200 100 100 300 L0 300 Z"
          fill="url(#accentGradient1)"
        />

        {/* Top-right decorative circle */}
        <Circle cx="340" cy="80" r="100" fill={colors.shapes} opacity={isDark ? "0.08" : "0.12"} />
        <Circle cx="340" cy="80" r="70" fill={colors.shapes} opacity={isDark ? "0.06" : "0.1"} />
        <Circle cx="340" cy="80" r="40" fill={colors.shapes2} opacity={isDark ? "0.05" : "0.08"} />

        {/* Bottom decorative wave */}
        <Path
          d="M0 700 C150 600 300 750 450 650 C600 550 750 700 900 600 C1050 500 1200 650 1350 550 L390 550 L390 844 L0 844 Z"
          fill="url(#accentGradient2)"
        />

        {/* Floating geometric shapes */}
        {/* Hexagon 1 */}
        <Polygon
          points="75,150 90,140 105,150 105,170 90,180 75,170"
          fill="#0EA5E9"
          opacity="0.12"
        />

        {/* Hexagon 2 */}
        <Polygon
          points="300,250 320,238 340,250 340,275 320,288 300,275"
          fill="#14B8A6"
          opacity="0.14"
        />

        {/* Circle decorations */}
        <Circle cx="150" cy="100" r="3" fill="#0EA5E9" opacity="0.25" />
        <Circle cx="250" cy="150" r="4" fill="#06B6D4" opacity="0.2" />
        <Circle cx="200" cy="75" r="2.5" fill="#14B8A6" opacity="0.22" />
        <Circle cx="100" cy="200" r="3.5" fill="#0EA5E9" opacity="0.18" />
        <Circle cx="50" cy="250" r="3" fill="#06B6D4" opacity="0.2" />
        <Circle cx="320" cy="350" r="4" fill="#14B8A6" opacity="0.16" />

        {/* Subtle lines */}
        <Line x1="50" y1="200" x2="125" y2="225" stroke="#0EA5E9" strokeWidth="1" opacity="0.15" />
        <Line x1="320" y1="175" x2="360" y2="200" stroke="#06B6D4" strokeWidth="1" opacity="0.18" />

        {/* Small squares */}
        <Rect x="120" y="90" width="7.5" height="7.5" fill="#0EA5E9" opacity="0.12" transform="rotate(15 123.75 93.75)" />
        <Rect x="280" y="300" width="6" height="6" fill="#14B8A6" opacity="0.14" transform="rotate(-10 283 303)" />
      </Svg>

      {/* Subtle overlay for text readability */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(15, 23, 42, 0.03)',
        }}
      />
    </View>
  );
}
