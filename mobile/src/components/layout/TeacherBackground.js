import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path, Pattern, Line, Polygon } from 'react-native-svg';

/**
 * TeacherBackground - Professional educational theme
 * Features: Lavender gradient, subtle geometric patterns, academic feel
 * Matches web's TeacherBackground.jsx
 */
export default function TeacherBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none">
        <Defs>
          {/* Main gradient - Soft lavender to warm peach */}
          <LinearGradient id="teacherGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#E8E0F0" />
            <Stop offset="40%" stopColor="#F0EBF7" />
            <Stop offset="70%" stopColor="#FDF6F0" />
            <Stop offset="100%" stopColor="#FFF8F3" />
          </LinearGradient>

          {/* Accent gradient for shapes */}
          <LinearGradient id="accentGradient1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#9B7ED9" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#7C5DC4" stopOpacity="0.08" />
          </LinearGradient>

          <LinearGradient id="accentGradient2" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#D4A574" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#C4956A" stopOpacity="0.06" />
          </LinearGradient>

          {/* Circle pattern */}
          <Pattern id="circlePattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <Circle cx="30" cy="30" r="1" fill="#9B7ED9" opacity="0.15" />
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
        <Circle cx="340" cy="80" r="100" fill="#9B7ED9" opacity="0.06" />
        <Circle cx="340" cy="80" r="70" fill="#9B7ED9" opacity="0.04" />
        <Circle cx="340" cy="80" r="40" fill="#9B7ED9" opacity="0.03" />

        {/* Bottom decorative wave */}
        <Path
          d="M0 700 C150 600 300 750 450 650 C600 550 750 700 900 600 C1050 500 1200 650 1350 550 L390 550 L390 844 L0 844 Z"
          fill="url(#accentGradient2)"
        />

        {/* Floating geometric shapes */}
        {/* Hexagon 1 */}
        <Polygon
          points="75,150 90,140 105,150 105,170 90,180 75,170"
          fill="#9B7ED9"
          opacity="0.08"
        />

        {/* Hexagon 2 */}
        <Polygon
          points="300,250 320,238 340,250 340,275 320,288 300,275"
          fill="#D4A574"
          opacity="0.1"
        />

        {/* Circle decorations */}
        <Circle cx="150" cy="100" r="3" fill="#9B7ED9" opacity="0.2" />
        <Circle cx="250" cy="150" r="4" fill="#D4A574" opacity="0.15" />
        <Circle cx="200" cy="75" r="2.5" fill="#9B7ED9" opacity="0.18" />
        <Circle cx="100" cy="200" r="3.5" fill="#9B7ED9" opacity="0.12" />
        <Circle cx="50" cy="250" r="3" fill="#D4A574" opacity="0.14" />
        <Circle cx="320" cy="350" r="4" fill="#9B7ED9" opacity="0.1" />

        {/* Subtle lines */}
        <Line x1="50" y1="200" x2="125" y2="225" stroke="#9B7ED9" strokeWidth="1" opacity="0.1" />
        <Line x1="320" y1="175" x2="360" y2="200" stroke="#D4A574" strokeWidth="1" opacity="0.12" />

        {/* Small squares */}
        <Rect x="120" y="90" width="7.5" height="7.5" fill="#9B7ED9" opacity="0.08" transform="rotate(15 123.75 93.75)" />
        <Rect x="280" y="300" width="6" height="6" fill="#D4A574" opacity="0.1" transform="rotate(-10 283 303)" />
      </Svg>

      {/* Subtle overlay for text readability */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
        }}
      />
    </View>
  );
}
