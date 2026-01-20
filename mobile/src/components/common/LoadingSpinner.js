import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import theme from '../../styles/theme';

export function LoadingSpinner({ size = 'large', color }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color || theme.Colors.primary.blue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.Colors.background.secondary,
    padding: theme.Spacing.xl,
  },
});
