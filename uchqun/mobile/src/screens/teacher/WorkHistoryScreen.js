import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { teacherService } from '../../services/teacherService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

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

  const renderWorkItem = ({ item }) => (
    <Card>
      <Text style={styles.title}>{item.title || item.description || 'Work Item'}</Text>
      {item.date && <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[styles.status, item.status === 'completed' && styles.statusCompleted]}>
          {item.status || 'pending'}
        </Text>
      </View>
      {item.status !== 'completed' && (
        <Pressable
          style={styles.completeButton}
          onPress={() => updateStatus(item.id, 'completed')}
        >
          <Text style={styles.completeButtonText}>Mark as Completed</Text>
        </Pressable>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={workHistory}
        renderItem={renderWorkItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadWorkHistory}
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
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  statusCompleted: {
    color: '#10b981',
  },
  completeButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
