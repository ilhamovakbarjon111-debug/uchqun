import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tokens from '../../styles/tokens';

export default function EmptyState({
  icon,
  emoji,
  title = 'No data available',
  description,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {emoji ? (
          <Text style={styles.emoji}>{emoji}</Text>
        ) : (
          <Ionicons name={icon || 'document-outline'} size={40} color={tokens.colors.text.muted} />
        )}
      </View>
      <Text style={styles.title} allowFontScaling={true}>
        {title}
      </Text>
      {description && (
        <Text style={styles.description} allowFontScaling={true}>
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.space['2xl'],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.space.lg,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.body.fontWeight,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
});
