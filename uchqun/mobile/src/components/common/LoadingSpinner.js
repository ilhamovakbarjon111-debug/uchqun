import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function LoadingSpinner({ size = 'large', color = '#2563eb' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
