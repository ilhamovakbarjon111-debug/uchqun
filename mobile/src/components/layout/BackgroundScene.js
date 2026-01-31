import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";

export default function BackgroundScene() {
  const { isDark } = useTheme();

  // Light theme colors
  const lightColors = {
    sky: ["#E0E7FF", "#F0F4FF", "#F8FAFC"],
    hill1: ["#C7D2FE", "#E0E7FF"],
    hill2: "#DDD6FE",
    clouds: "#FFFFFF",
    sparkles: "#A5B4FC",
    moon: "#EDE9FE",
  };

  // Dark theme colors
  const darkColors = {
    sky: ["#1E293B", "#334155", "#475569"],
    hill1: ["#4F46E5", "#6366F1"],
    hill2: "#6366F1",
    clouds: "#334155",
    sparkles: "#A5B4FC",
    moon: "#E0E7FF",
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.sky[0]} />
            <Stop offset="0.45" stopColor={colors.sky[1]} />
            <Stop offset="1" stopColor={colors.sky[2]} />
          </LinearGradient>
          <LinearGradient id="hill" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.hill1[0]} stopOpacity={isDark ? "0.3" : "0.5"} />
            <Stop offset="1" stopColor={colors.hill1[1]} stopOpacity={isDark ? "0.2" : "0.4"} />
          </LinearGradient>
        </Defs>

        {/* sky */}
        <Rect x="0" y="0" width="390" height="844" fill="url(#sky)" />

        {/* sparkles */}
        <Circle cx="42" cy="120" r="2.5" fill={colors.sparkles} opacity={isDark ? "0.4" : "0.6"} />
        <Circle cx="320" cy="170" r="2" fill={colors.sparkles} opacity={isDark ? "0.35" : "0.55"} />
        <Circle cx="90" cy="260" r="1.8" fill={colors.sparkles} opacity={isDark ? "0.3" : "0.5"} />
        <Circle cx="280" cy="320" r="2.2" fill={colors.sparkles} opacity={isDark ? "0.38" : "0.58"} />
        <Circle cx="150" cy="380" r="1.5" fill={colors.sparkles} opacity={isDark ? "0.28" : "0.48"} />

        {/* moon/sun */}
        <Circle cx="330" cy="110" r="26" fill={colors.moon} opacity={isDark ? "0.2" : "0.8"} />
        <Circle cx="322" cy="104" r="4" fill={isDark ? "#1E293B" : "#1E40AF"} opacity="0.3" />
        <Circle cx="340" cy="104" r="4" fill={isDark ? "#1E293B" : "#1E40AF"} opacity="0.3" />
        <Path d="M322 122 Q330 128 338 122" stroke={isDark ? "#1E293B" : "#1E40AF"} strokeWidth="3" fill="none" opacity="0.3" />

        {/* clouds */}
        <Path
          d="M58 140c8-16 30-18 42-6 10-10 28-8 34 6 14-2 26 8 26 22 0 12-10 22-22 22H66c-14 0-26-10-26-24 0-10 7-18 18-20z"
          fill={colors.clouds} opacity={isDark ? "0.3" : "0.85"}
        />
        <Path
          d="M260 220c7-14 26-16 36-5 8-8 24-7 29 5 12-2 22 7 22 19 0 11-9 19-19 19h-72c-12 0-22-9-22-20 0-9 6-16 16-18z"
          fill={colors.clouds} opacity={isDark ? "0.25" : "0.82"}
        />
        <Path
          d="M120 300c6-12 22-14 30-4 7-7 20-6 24 4 10-2 18 6 18 15 0 9-7 15-15 15h-58c-10 0-18-7-18-16 0-7 5-13 13-14z"
          fill={colors.clouds} opacity={isDark ? "0.22" : "0.78"}
        />

        {/* hills */}
        <Path d="M0 640 C80 560 170 690 260 610 C320 560 360 590 390 565 L390 844 L0 844 Z" fill="url(#hill)" opacity="1" />
        <Path d="M0 700 C90 630 170 760 265 675 C320 645 350 665 390 642 L390 844 L0 844 Z" fill={colors.hill2} opacity={isDark ? "0.15" : "0.35"} />
      </Svg>
    </View>
  );
}
