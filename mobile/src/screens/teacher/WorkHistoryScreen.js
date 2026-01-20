import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { teacherService } from '../../services/teacherService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

export function WorkHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [workHistory, setWorkHistory] = useState([]);

  useEffect(() => {
    loadWorkHistory();
  }, []);

  const loadWorkHistory = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getWorkHistory();
      setWorkHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading work history:', error);
      setWorkHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await teacherService.updateWorkHistoryStatus(id, status);
      loadWorkHistory();
    } catch (error) {
      console.error('Error updating work history status:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (workHistory.length === 0) {
    return <EmptyState message="No work history" />;
  }

  const renderWorkItem = ({ item }) => {
    const isCompleted = item.status === 'completed';
    return (
      <Card>
        <View style={styles.workHeader}>
          <View style={[styles.workIconContainer, isCompleted && styles.workIconCompleted]}>
            <Ionicons 
              name={isCompleted ? 'checkmark-circle' : 'time-outline'} 
              size={24} 
              color={isCompleted ? theme.Colors.status.success : theme.Colors.status.warning} 
            />
          </View>
          <View style={styles.workContent}>
            <Text style={[styles.title, isCompleted && styles.titleCompleted]}>
              {item.title || item.description || 'Work Item'}
            </Text>
            {item.date && (
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={14} color={theme.Colors.text.secondary} />
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, isCompleted && styles.statusBadgeCompleted]}>
            <Text style={[styles.status, isCompleted && styles.statusCompleted]}>
              {isCompleted ? 'Completed' : (item.status || 'Pending')}
            </Text>
          </View>
        </View>
        {!isCompleted && (
          <Pressable
            style={styles.completeButton}
            onPress={() => updateStatus(item.id, 'completed')}
          >
            <Ionicons name="checkmark-circle" size={18} color={theme.Colors.text.inverse} />
            <Text style={styles.completeButtonText}>Mark as Completed</Text>
          </Pressable>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Work History" />
      {workHistory.length === 0 ? (
        <EmptyState icon="time-outline" message="No work history" />
      ) : (
        <FlatList
          data={workHistory}
          renderItem={renderWorkItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadWorkHistory}
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
  workHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.Spacing.sm,
  },
  workIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.Colors.status.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  workIconCompleted: {
    backgroundColor: theme.Colors.status.success + '20',
  },
  workContent: {
    flex: 1,
  },
  title: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.Colors.text.secondary,
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
  statusContainer: {
    marginTop: theme.Spacing.md,
    paddingTop: theme.Spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.Colors.border.light,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.Colors.status.warning + '20',
    paddingHorizontal: theme.Spacing.md,
    paddingVertical: theme.Spacing.xs,
    borderRadius: theme.BorderRadius.sm,
  },
  statusBadgeCompleted: {
    backgroundColor: theme.Colors.status.success + '20',
  },
  status: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.status.warning,
    textTransform: 'capitalize',
  },
  statusCompleted: {
    color: theme.Colors.status.success,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.Colors.primary.blue,
    paddingVertical: theme.Spacing.sm,
    paddingHorizontal: theme.Spacing.md,
    borderRadius: theme.BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: theme.Spacing.md,
    ...theme.Colors.shadow.sm,
  },
  completeButtonText: {
    color: theme.Colors.text.inverse,
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.semibold,
    marginLeft: theme.Spacing.xs,
  },
});
