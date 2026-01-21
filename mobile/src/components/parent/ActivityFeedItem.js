import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tokens from '../../styles/tokens';

const TYPE_ICONS = {
  activity: 'checkmark-circle',
  meal: 'restaurant',
  media: 'images',
  notification: 'notifications',
};

const TYPE_COLORS = {
  activity: tokens.colors.semantic.success,
  meal: tokens.colors.semantic.warning,
  media: tokens.colors.primary[500],
  notification: tokens.colors.semantic.info,
};

export function ActivityFeedItem({ 
  type = 'activity',
  title, 
  timestamp,
  onPress 
}) {
  const icon = TYPE_ICONS[type] || 'ellipse';
  const color = TYPE_COLORS[type] || tokens.colors.neutral[600];

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return date.toLocaleDateString();
  };

  const content = (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {timestamp && (
          <Text style={styles.timestamp}>{formatTimestamp(timestamp)}</Text>
        )}
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={18} 
        color={tokens.colors.neutral[400]} 
      />
    </View>
  );

  if (onPress) {
    return (
      <Pressable 
        onPress={onPress}
        style={({ pressed }) => [
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
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.neutral[200],
  },
  pressed: {
    backgroundColor: tokens.colors.neutral[100],
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing[3],
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.neutral[900],
    marginBottom: tokens.spacing[1] / 2,
  },
  timestamp: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.neutral[600],
  },
});
