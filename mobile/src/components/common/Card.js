import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tokens from '../../styles/tokens';

/**
 * Premium Card Component
 * Supports glassmorphism, gradients, and interactive states
 */
export default function Card({
  children,
  style,
  padding = 'lg',
  variant = 'glass', // 'glass' | 'elevated' | 'flat' | 'gradient'
  gradientColors,
  onPress,
  disabled = false,
  shadow = 'card',
}) {
  // CRITICAL FIX: Add defensive checks to prevent crashes if tokens is undefined
  if (!tokens) {
    console.error('[Card] tokens is undefined!');
    // Return a basic card as fallback
    return <View style={[{ padding: 16, borderRadius: 12, backgroundColor: '#fff' }, style]}>{children}</View>;
  }

  const paddingValue = typeof padding === 'number' ? padding : (tokens?.space?.[padding] || tokens?.space?.lg || 16);
  const shadowStyle = tokens?.shadow?.[shadow] || tokens?.shadow?.card || {};

  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: tokens?.colors?.card?.elevated || 'rgba(255, 255, 255, 0.95)',
          // Removed: borderColor - no borders per design requirements
        };
      case 'flat':
        return {
          backgroundColor: '#fff',
          // Removed: borderColor - no borders per design requirements
          ...(tokens?.shadow?.xs || {}),
        };
      case 'gradient':
        return {};
      default: // glass
        return {
          backgroundColor: tokens?.colors?.card?.base || 'rgba(255, 255, 255, 0.88)',
          // Removed: borderColor - no borders per design requirements
        };
    }
  };

  const cardStyle = [
    styles.card,
    shadowStyle,
    getVariantStyle(),
    { padding: paddingValue },
    style,
  ];

  if (variant === 'gradient') {
    const colors = gradientColors || tokens?.colors?.gradients?.primary || ['#3B82F6', '#8B5CF6'];
    const content = (
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.gradientCard, { padding: paddingValue }, style]}
      >
        {children}
      </LinearGradient>
    );

    if (onPress) {
      return (
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={({ pressed }) => [
            styles.pressable,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          {content}
        </Pressable>
      );
    }
    return <View style={shadowStyle}>{content}</View>;
  }

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

// Pre-styled card variants
export function GlassCard(props) {
  return <Card variant="glass" {...props} />;
}

export function ElevatedCard(props) {
  return <Card variant="elevated" shadow="elevated" {...props} />;
}

export function GradientCard(props) {
  return <Card variant="gradient" {...props} />;
}

export function FlatCard(props) {
  return <Card variant="flat" shadow="xs" {...props} />;
}

// Interactive stat card with gradient background
export function HighlightCard({
  children,
  gradientColors = tokens?.colors?.gradients?.primary || ['#3B82F6', '#8B5CF6'],
  ...props
}) {
  return (
    <Card variant="gradient" gradientColors={gradientColors} {...props}>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens?.radius?.xl || 24,
    // Removed: borderWidth - no borders per design requirements
    overflow: 'hidden',
  },
  gradientCard: {
    borderWidth: 0,
  },
  pressable: {
    borderRadius: tokens?.radius?.xl || 24,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
