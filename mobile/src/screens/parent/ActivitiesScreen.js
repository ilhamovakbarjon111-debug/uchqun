import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { parentService } from '../../services/parentService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

export function ActivitiesScreen() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await parentService.getActivities();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (activities.length === 0) {
    return <EmptyState message="No activities found" />;
  }

  const renderActivity = ({ item }) => (
    <Card>
      <View style={styles.activityHeader}>
        <View style={styles.activityIconContainer}>
          <Ionicons name="clipboard" size={24} color={theme.Colors.cards.activities} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.title}>{item.title || item.skill || 'Activity'}</Text>
          {item.date && (
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={14} color={theme.Colors.text.secondary} />
              <Text style={styles.date}>{item.date}</Text>
            </View>
          )}
        </View>
      </View>
      {item.description && <Text style={styles.description}>{item.description}</Text>}
      {item.progress && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Progress:</Text>
          <Text style={styles.progressValue}>{item.progress}%</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
          </View>
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Activities" showBack={false} />
      {activities.length === 0 ? (
        <EmptyState icon="clipboard-outline" message="No activities found" />
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivity}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadActivities}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Colors.background.secondary,
  },
  list: {
    padding: theme.Spacing.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.Spacing.sm,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.Colors.cards.activities + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  title: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs,
  },
  description: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.secondary,
    marginTop: theme.Spacing.sm,
    lineHeight: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.Spacing.xs / 2,
  },
  date: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    marginLeft: theme.Spacing.xs / 2,
  },
  progressContainer: {
    marginTop: theme.Spacing.md,
    paddingTop: theme.Spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.Colors.border.light,
  },
  progressLabel: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    marginBottom: theme.Spacing.xs,
  },
  progressValue: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.cards.activities,
    marginBottom: theme.Spacing.xs,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: theme.Colors.progress.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: theme.Spacing.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.Colors.cards.activities,
    borderRadius: 3,
  },
});
