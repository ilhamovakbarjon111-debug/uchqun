import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from "react-native-svg";

export default function BackgroundScene() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#C7E7FF" />
            <Stop offset="0.45" stopColor="#F4FBFF" />
            <Stop offset="1" stopColor="#FFF7E6" />
          </LinearGradient>
          <LinearGradient id="hill" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#B7F7D1" />
            <Stop offset="1" stopColor="#6EE7B7" />
          </LinearGradient>
        </Defs>

        {/* sky */}
        <Rect x="0" y="0" width="390" height="844" fill="url(#sky)" />

        {/* sparkles */}
        <Circle cx="42" cy="120" r="2.5" fill="#FFFFFF" opacity="0.7" />
        <Circle cx="320" cy="170" r="2" fill="#FFFFFF" opacity="0.6" />
        <Circle cx="90" cy="260" r="1.8" fill="#FFFFFF" opacity="0.55" />
        <Circle cx="280" cy="320" r="2.2" fill="#FFFFFF" opacity="0.65" />
        <Circle cx="150" cy="380" r="1.5" fill="#FFFFFF" opacity="0.5" />

        {/* sun */}
        <Circle cx="330" cy="110" r="26" fill="#FFD36E" opacity="0.95" />
        <Circle cx="322" cy="104" r="4" fill="#2B2B2B" opacity="0.25" />
        <Circle cx="340" cy="104" r="4" fill="#2B2B2B" opacity="0.25" />
        <Path d="M322 122 Q330 128 338 122" stroke="#2B2B2B" strokeWidth="3" fill="none" opacity="0.25" />

        {/* clouds */}
        <Path
          d="M58 140c8-16 30-18 42-6 10-10 28-8 34 6 14-2 26 8 26 22 0 12-10 22-22 22H66c-14 0-26-10-26-24 0-10 7-18 18-20z"
          fill="#FFFFFF" opacity="0.85"
        />
        <Path
          d="M260 220c7-14 26-16 36-5 8-8 24-7 29 5 12-2 22 7 22 19 0 11-9 19-19 19h-72c-12 0-22-9-22-20 0-9 6-16 16-18z"
          fill="#FFFFFF" opacity="0.82"
        />
        <Path
          d="M120 300c6-12 22-14 30-4 7-7 20-6 24 4 10-2 18 6 18 15 0 9-7 15-15 15h-58c-10 0-18-7-18-16 0-7 5-13 13-14z"
          fill="#FFFFFF" opacity="0.78"
        />

        {/* hills */}
        <Path d="M0 640 C80 560 170 690 260 610 C320 560 360 590 390 565 L390 844 L0 844 Z" fill="url(#hill)" opacity="0.75" />
        <Path d="M0 700 C90 630 170 760 265 675 C320 645 350 665 390 642 L390 844 L0 844 Z" fill="#9AE6B4" opacity="0.65" />
      </Svg>
    </View>
  );
}
