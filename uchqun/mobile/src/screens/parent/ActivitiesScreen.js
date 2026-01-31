import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { parentService } from '../../services/parentService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

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
      <Text style={styles.title}>{item.title || item.skill || 'Activity'}</Text>
      {item.description && <Text style={styles.description}>{item.description}</Text>}
      {item.date && <Text style={styles.date}>{item.date}</Text>}
      {item.progress && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Progress:</Text>
          <Text style={styles.progressValue}>{item.progress}%</Text>
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadActivities}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  list: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
});
