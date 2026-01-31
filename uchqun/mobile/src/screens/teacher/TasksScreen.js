import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { teacherService } from '../../services/teacherService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export function TasksScreen() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await teacherService.updateTaskStatus(id, status);
      loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (tasks.length === 0) {
    return <EmptyState message="No tasks assigned" />;
  }

  const renderTask = ({ item }) => (
    <Card>
      <Text style={styles.title}>{item.title || item.name || 'Task'}</Text>
      {item.description && <Text style={styles.description}>{item.description}</Text>}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[styles.status, item.status === 'completed' && styles.statusCompleted]}>
          {item.status || 'pending'}
        </Text>
      </View>
      {item.status !== 'completed' && (
        <Pressable
          style={styles.completeButton}
          onPress={() => updateTaskStatus(item.id, 'completed')}
        >
          <Text style={styles.completeButtonText}>Mark as Completed</Text>
        </Pressable>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadTasks}
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
