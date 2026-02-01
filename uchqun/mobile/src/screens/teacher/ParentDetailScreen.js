import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { teacherService } from '../../services/teacherService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export function ParentDetailScreen() {
  const route = useRoute();
  const { parentId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState(null);

  useEffect(() => {
    if (parentId) {
      loadParent();
    }
  }, [parentId]);

  const loadParent = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getParentById(parentId);
      setParent(data);
    } catch (error) {
      console.error('Error loading parent:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!parent) {
    return <EmptyState message="Parent not found" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.sectionTitle}>Parent Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>
            {parent.firstName} {parent.lastName}
          </Text>
        </View>
        {parent.email && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{parent.email}</Text>
          </View>
        )}
      </Card>

      {parent.children && parent.children.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Children</Text>
          {parent.children.map((child) => (
            <View key={child.id} style={styles.childItem}>
              <Text style={styles.childName}>
                {child.firstName} {child.lastName}
              </Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    width: 100,
  },
  value: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  childItem: {
    marginBottom: 8,
  },
  childName: {
    fontSize: 16,
    color: '#111827',
  },
});
