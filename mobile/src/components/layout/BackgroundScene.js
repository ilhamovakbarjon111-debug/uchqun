import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";

export default function BackgroundScene() {
  const { isDark } = useTheme();

  // Light theme colors - Nature theme with trees and grass
  const lightColors = {
    sky: ["#87CEEB", "#B0E0E6", "#E0F2F1"], // Sky blue to light cyan
    hill1: ["#4CAF50", "#66BB6A"], // Green hills
    hill2: "#81C784", // Lighter green
    grass: "#2E7D32", // Dark green grass
    trees: "#1B5E20", // Dark green trees
    treeTrunk: "#5D4037", // Brown tree trunks
    clouds: "#FFFFFF",
    sparkles: "#FFD700", // Golden sparkles for sun
    moon: "#FFEB3B", // Yellow sun
    sunRays: "#FFF9C4", // Light yellow sun rays
  };

  // Dark theme colors - Deep dark theme
  const darkColors = {
    sky: ["#0F172A", "#1E293B", "#334155"], // Very dark slate
    hill1: ["#1E293B", "#334155"], // Dark hills
    hill2: "#475569", // Slightly lighter
    grass: "#1E293B", // Dark grass
    trees: "#0F172A", // Very dark trees
    treeTrunk: "#1E293B", // Dark tree trunks
    clouds: "#1E293B", // Dark clouds
    sparkles: "#818CF8", // Light indigo sparkles
    moon: "#E0E7FF", // Light moon
    sunRays: "#334155", // Dark rays
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
            <Stop offset="0" stopColor={colors.hill1[0]} stopOpacity={isDark ? "0.4" : "0.7"} />
            <Stop offset="1" stopColor={colors.hill1[1]} stopOpacity={isDark ? "0.3" : "0.6"} />
          </LinearGradient>
          <LinearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.grass} stopOpacity={isDark ? "0.3" : "0.8"} />
            <Stop offset="1" stopColor={colors.grass} stopOpacity={isDark ? "0.2" : "0.9"} />
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
        {!isDark && (
          <>
            {/* Sun rays in light mode */}
            <Path d="M330 60 L330 50" stroke={colors.sunRays} strokeWidth="2" opacity="0.4" />
            <Path d="M360 110 L370 110" stroke={colors.sunRays} strokeWidth="2" opacity="0.4" />
            <Path d="M330 160 L330 170" stroke={colors.sunRays} strokeWidth="2" opacity="0.4" />
            <Path d="M300 110 L290 110" stroke={colors.sunRays} strokeWidth="2" opacity="0.4" />
            <Path d="M345 75 L352 68" stroke={colors.sunRays} strokeWidth="2" opacity="0.4" />
            <Path d="M315 75 L308 68" stroke={colors.sunRays} strokeWidth="2" opacity="0.4" />
            <Path d="M345 145 L352 152" stroke={colors.sunRays} strokeWidth="2" opacity="0.4" />
            <Path d="M315 145 L308 152" stroke={colors.sunRays} strokeWidth="2" opacity="0.4" />
          </>
        )}
        <Circle cx="330" cy="110" r={isDark ? "20" : "24"} fill={colors.moon} opacity={isDark ? "0.15" : "0.9"} />
        {isDark && (
          <>
            {/* Moon craters in dark mode */}
            <Circle cx="325" cy="105" r="3" fill="#1E293B" opacity="0.3" />
            <Circle cx="335" cy="108" r="2" fill="#1E293B" opacity="0.2" />
            <Circle cx="328" cy="115" r="2.5" fill="#1E293B" opacity="0.25" />
          </>
        )}

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
        <Path d="M0 700 C90 630 170 760 265 675 C320 645 350 665 390 642 L390 844 L0 844 Z" fill={colors.hill2} opacity={isDark ? "0.2" : "0.5"} />
        
        {/* Grass layer in light mode */}
        {!isDark && (
          <>
            <Path d="M0 750 L390 750 L390 844 L0 844 Z" fill="url(#grass)" />
            {/* Grass details */}
            <Path d="M20 750 Q25 745 30 750 Q35 755 40 750" stroke={colors.grass} strokeWidth="1.5" fill="none" opacity="0.6" />
            <Path d="M60 750 Q65 745 70 750 Q75 755 80 750" stroke={colors.grass} strokeWidth="1.5" fill="none" opacity="0.6" />
            <Path d="M100 750 Q105 745 110 750 Q115 755 120 750" stroke={colors.grass} strokeWidth="1.5" fill="none" opacity="0.6" />
            <Path d="M140 750 Q145 745 150 750 Q155 755 160 750" stroke={colors.grass} strokeWidth="1.5" fill="none" opacity="0.6" />
            <Path d="M180 750 Q185 745 190 750 Q195 755 200 750" stroke={colors.grass} strokeWidth="1.5" fill="none" opacity="0.6" />
            <Path d="M220 750 Q225 745 230 750 Q235 755 240 750" stroke={colors.grass} strokeWidth="1.5" fill="none" opacity="0.6" />
            <Path d="M260 750 Q265 745 270 750 Q275 755 280 750" stroke={colors.grass} strokeWidth="1.5" fill="none" opacity="0.6" />
            <Path d="M300 750 Q305 745 310 750 Q315 755 320 750" stroke={colors.grass} strokeWidth="1.5" fill="none" opacity="0.6" />
            <Path d="M340 750 Q345 745 350 750 Q355 755 360 750" stroke={colors.grass} strokeWidth="1.5" fill="none" opacity="0.6" />
          </>
        )}
        
        {/* Trees in light mode */}
        {!isDark && (
          <>
            {/* Tree 1 - Left side */}
            <Path d="M50 680 L50 720 L45 720 L45 680 Z" fill={colors.treeTrunk} opacity="0.8" />
            <Path d="M30 680 Q50 650 70 680 Q50 640 30 680" fill={colors.trees} opacity="0.7" />
            <Path d="M35 660 Q50 635 65 660 Q50 625 35 660" fill={colors.trees} opacity="0.8" />
            
            {/* Tree 2 - Right side */}
            <Path d="M320 690 L320 730 L315 730 L315 690 Z" fill={colors.treeTrunk} opacity="0.8" />
            <Path d="M300 690 Q320 660 340 690 Q320 650 300 690" fill={colors.trees} opacity="0.7" />
            <Path d="M305 670 Q320 645 335 670 Q320 635 305 670" fill={colors.trees} opacity="0.8" />
            
            {/* Tree 3 - Center */}
            <Path d="M180 700 L180 740 L175 740 L175 700 Z" fill={colors.treeTrunk} opacity="0.8" />
            <Path d="M160 700 Q180 670 200 700 Q180 660 160 700" fill={colors.trees} opacity="0.7" />
            <Path d="M165 680 Q180 655 195 680 Q180 645 165 680" fill={colors.trees} opacity="0.8" />
          </>
        )}
      </Svg>
    </View>
  );
}
