import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeTokens } from '../../hooks/useThemeTokens';

export function ScreenHeader({ title, showBack = true, rightAction, rightIcon }) {
  const navigation = useNavigation();
  const tokens = useThemeTokens();
  const styles = getStyles(tokens);

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={tokens.colors.text.inverse} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      {rightAction ? (
        <TouchableOpacity onPress={rightAction} style={styles.headerAction}>
          <Ionicons name={rightIcon || 'add'} size={24} color={tokens.colors.text.inverse} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

function getStyles(tokens) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: tokens.colors.accent.blue,
      paddingTop: 50,
      paddingBottom: tokens.space.md,
      paddingHorizontal: tokens.space.md,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    backButton: {
      padding: tokens.space.xs,
    },
    headerTitle: {
      fontSize: tokens.typography.fontSize.xl,
      fontWeight: tokens.typography.fontWeight.bold,
      color: tokens.colors.text.inverse,
      flex: 1,
      textAlign: 'center',
    },
    headerAction: {
      padding: tokens.space.xs,
    },
    placeholder: {
      width: 40,
    },
  });
}
