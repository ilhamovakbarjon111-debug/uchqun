import React from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../../styles/theme';

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.Colors.background.card,
    borderRadius: theme.BorderRadius.md,
    padding: theme.Spacing.md,
    marginVertical: theme.Spacing.xs,
    ...theme.Colors.shadow.sm,
  },
});
