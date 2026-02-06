import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tokens from '../../styles/tokens';

/**
 * GlassCard - Glassmorphism card component
 * Creates elegant frosted glass effect with subtle shadows
 */
export function GlassCard({ children, style, gradient }) {
  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.background.secondary, // Solid white instead of glass
    borderRadius: tokens.radius['2xl'],
    padding: tokens.space.lg,
    // Removed: borderWidth, borderColor
    ...tokens.shadow.card, // Enhanced shadow for better definition
  },
});
