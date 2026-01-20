import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../styles/theme';

export function EmptyState({ icon = 'document-outline', message = 'No data available', description }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={theme.Colors.text.tertiary} />
      <Text style={styles.message}>{message}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.Colors.background.secondary,
    padding: theme.Spacing['2xl'],
  },
  message: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginTop: theme.Spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.secondary,
    marginTop: theme.Spacing.sm,
    textAlign: 'center',
  },
});
