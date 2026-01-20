import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import theme from '../styles/theme';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.Colors.primary.blue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.Colors.background.secondary,
  },
});
