import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tokens from '../../styles/tokens';

export default function SectionHeader({
  title,
  subtitle,
  emoji,
  action,
  actionLabel,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          {emoji && <Text style={styles.emoji}>{emoji}</Text>}
          <Text style={styles.title} allowFontScaling={true}>
            {title}
          </Text>
        </View>
        {subtitle && (
          <Text style={styles.subtitle} allowFontScaling={true}>
            {subtitle}
          </Text>
        )}
      </View>
      {action && actionLabel && (
        <TouchableOpacity
          onPress={action}
          style={styles.action}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.actionLabel} allowFontScaling={true}>
            {actionLabel}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={tokens.colors.accent.blue}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.md,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
  },
  emoji: {
    fontSize: 20,
  },
  title: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.primary,
  },
  subtitle: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.sub.fontWeight,
    color: tokens.colors.text.secondary,
    marginTop: tokens.space.xs / 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.space.sm,
    paddingHorizontal: tokens.space.sm,
  },
  actionLabel: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: '600',
    color: tokens.colors.accent.blue,
    marginRight: tokens.space.xs,
  },
});
