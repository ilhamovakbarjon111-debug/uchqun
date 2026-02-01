import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useThemeTokens } from '../../hooks/useThemeTokens';

export function LoadingSpinner({ size = 'large', color }) {
  const tokens = useThemeTokens();
  const styles = getStyles(tokens);
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color || tokens.colors.accent.blue} />
    </View>
  );
}

function getStyles(tokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: tokens.colors.background.secondary,
      padding: tokens.space.xl,
    },
  });
}
