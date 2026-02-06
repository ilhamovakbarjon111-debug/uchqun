import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tokens from '../../styles/tokens';

/**
 * QuickActionCard - Quick action button component
 * Used for primary actions like "Update Plan", "Contact Parents"
 */
export function QuickActionCard({ icon, iconColor, iconBg, title, subtitle, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Icon Container */}
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary, // Solid white
    borderRadius: tokens.radius['2xl'],
    padding: tokens.space.lg,
    marginBottom: tokens.space.sm,
    // Removed: borderWidth, borderColor
    ...tokens.shadow.soft,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
  },
});
