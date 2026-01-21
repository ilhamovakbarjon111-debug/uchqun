import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tokens from '../../styles/tokens';

export function StatTile({ 
  label, 
  value, 
  icon, 
  onPress,
  variant = 'default',
  color = tokens.colors.primary[500]
}) {
  const content = (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable 
        onPress={onPress} 
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.neutral[50],
    borderRadius: tokens.radius.md,
    padding: tokens.spacing[3],
    ...tokens.shadows.xs,
  },
  pressable: {
    borderRadius: tokens.radius.md,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: tokens.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing[2],
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.neutral[900],
    lineHeight: tokens.typography.fontSize.lg * tokens.typography.lineHeight.tight,
  },
  label: {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.neutral[600],
    marginTop: tokens.spacing[1] / 2,
  },
});
