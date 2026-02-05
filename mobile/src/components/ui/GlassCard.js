import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

// Design System Colors
const COLORS = {
  softNavy: '#2E3A59',
  powderBlue: '#BFD7EA',
  warmSand: '#F4EDE2',
  blushPeach: '#FADADD',
  mintMist: '#E8F8F5',
  honeyGold: '#F4D03F',
};

/**
 * GlassCard - Glassmorphism card component
 *
 * Props:
 * - style: Additional styles to apply
 * - children: Card content
 * - intensity: Blur intensity (default: 20)
 * - tint: Blur tint (default: 'light')
 * - variant: 'default' | 'elevated' | 'compact' (default: 'default')
 *
 * Usage:
 * <GlassCard>
 *   <Text>Card Content</Text>
 * </GlassCard>
 */
export function GlassCard({
  children,
  style,
  intensity = 20,
  tint = 'light',
  variant = 'default',
}) {
  const containerStyle = [
    styles.container,
    variant === 'elevated' && styles.elevated,
    variant === 'compact' && styles.compact,
    style,
  ];

  return (
    <View style={containerStyle}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={intensity} tint={tint} style={styles.blurContainer}>
          <View style={styles.overlay} />
          <View style={styles.content}>{children}</View>
        </BlurView>
      ) : (
        <View style={styles.androidFallback}>
          <View style={styles.content}>{children}</View>
        </View>
      )}
    </View>
  );
}

/**
 * QuickStatCard - Card for displaying quick stats
 *
 * Props:
 * - icon: Icon component
 * - label: Stat label
 * - value: Stat value
 * - color: Accent color (default: softNavy)
 * - style: Additional styles
 */
export function QuickStatCard({ icon, label, value, color = COLORS.softNavy, style }) {
  return (
    <GlassCard variant="compact" style={[styles.statCard, style]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <View style={styles.statValue}>{value}</View>
        <View style={styles.statLabel}>{label}</View>
      </View>
    </GlassCard>
  );
}

/**
 * ActionCard - Card for quick actions
 *
 * Props:
 * - icon: Icon component
 * - title: Action title
 * - onPress: Press handler
 * - color: Accent color
 * - style: Additional styles
 */
export function ActionCard({ icon, title, onPress, color = COLORS.powderBlue, style }) {
  return (
    <GlassCard variant="compact" style={[styles.actionCard, style]}>
      <View style={[styles.actionIconContainer, { backgroundColor: color }]}>
        {icon}
      </View>
      <View style={styles.actionTitle}>{title}</View>
    </GlassCard>
  );
}

/**
 * ActivityCard - Card for displaying activities
 *
 * Props:
 * - title: Activity title
 * - time: Activity time
 * - description: Activity description
 * - icon: Icon component
 * - color: Accent color
 * - style: Additional styles
 */
export function ActivityCard({
  title,
  time,
  description,
  icon,
  color = COLORS.blushPeach,
  style,
}) {
  return (
    <GlassCard style={[styles.activityCard, style]}>
      <View style={styles.activityHeader}>
        <View style={[styles.activityIconContainer, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <View style={styles.activityHeaderText}>
          <View style={styles.activityTitle}>{title}</View>
          <View style={styles.activityTime}>{time}</View>
        </View>
      </View>
      {description && <View style={styles.activityDescription}>{description}</View>}
    </GlassCard>
  );
}

/**
 * ProgressCard - Card for displaying progress metrics
 *
 * Props:
 * - title: Progress title
 * - value: Progress value (0-100)
 * - icon: Icon component
 * - color: Accent color
 * - style: Additional styles
 */
export function ProgressCard({ title, value, icon, color = COLORS.honeyGold, style }) {
  return (
    <GlassCard style={[styles.progressCard, style]}>
      <View style={styles.progressHeader}>
        <View style={[styles.progressIconContainer, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <View style={styles.progressTitle}>{title}</View>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${value}%`, backgroundColor: color },
            ]}
          />
        </View>
        <View style={styles.progressValue}>{value}%</View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  elevated: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  compact: {
    borderRadius: 16,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  content: {
    padding: 16,
  },
  androidFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(12px)',
  },

  // QuickStatCard styles
  statCard: {
    minWidth: 140,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statContent: {
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.softNavy,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.softNavy,
    opacity: 0.7,
  },

  // ActionCard styles
  actionCard: {
    minWidth: 100,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.softNavy,
    textAlign: 'center',
  },

  // ActivityCard styles
  activityCard: {
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityHeaderText: {
    flex: 1,
    gap: 4,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.softNavy,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.softNavy,
    opacity: 0.6,
  },
  activityDescription: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.softNavy,
    opacity: 0.8,
    lineHeight: 20,
  },

  // ProgressCard styles
  progressCard: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.softNavy,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.softNavy,
    minWidth: 45,
    textAlign: 'right',
  },
});
