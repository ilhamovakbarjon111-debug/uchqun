import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { teacherService } from '../../services/teacherService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export function ResponsibilitiesScreen() {
  const [loading, setLoading] = useState(true);
  const [responsibilities, setResponsibilities] = useState([]);

  useEffect(() => {
    loadResponsibilities();
  }, []);

  const loadResponsibilities = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getResponsibilities();
      setResponsibilities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading responsibilities:', error);
      setResponsibilities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (responsibilities.length === 0) {
    return <EmptyState message="No responsibilities assigned" />;
  }

  const renderResponsibility = ({ item }) => (
    <Card>
      <Text style={styles.title}>{item.title || item.name || 'Responsibility'}</Text>
      {item.description && <Text style={styles.description}>{item.description}</Text>}
      {item.deadline && (
        <Text style={styles.deadline}>Deadline: {new Date(item.deadline).toLocaleDateString()}</Text>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={responsibilities}
        renderItem={renderResponsibility}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadResponsibilities}
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
  deadline: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
