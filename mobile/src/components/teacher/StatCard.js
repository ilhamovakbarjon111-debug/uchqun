import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tokens from '../../styles/tokens';

/**
 * StatCard - Dashboard statistics card
 * Displays icon, count value, and label
 */
export function StatCard({ icon, iconColor, iconBg, count, label, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: iconBg }, // Use iconBg as solid background
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.cardInner}>
        {/* Icon Container */}
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>

        {/* Count */}
        <Text style={styles.count}>{count}</Text>

        {/* Label */}
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 140,
    borderRadius: tokens.radius['2xl'],
    // Removed: borderWidth, borderColor, backgroundColor (now set dynamically via iconBg)
    ...tokens.shadow.soft,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardInner: {
    flex: 1,
    padding: tokens.space.lg,
    justifyContent: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.space.md,
  },
  count: {
    fontSize: 32,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs,
  },
  label: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: '500',
    color: tokens.colors.text.secondary,
  },
});
