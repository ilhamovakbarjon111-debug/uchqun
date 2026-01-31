import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { parentService } from '../../services/parentService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export function ChildProfileScreen() {
  const route = useRoute();
  const { childId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);

  useEffect(() => {
    if (childId) {
      loadChild();
    }
  }, [childId]);

  const loadChild = async () => {
    try {
      setLoading(true);
      const children = await parentService.getChildren();
      const found = Array.isArray(children) ? children.find((c) => c.id === childId) : null;
      setChild(found);
    } catch (error) {
      console.error('Error loading child:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!child) {
    return <EmptyState message="Child not found" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>
            {child.firstName} {child.lastName}
          </Text>
        </View>
        {child.dateOfBirth && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>{child.dateOfBirth}</Text>
          </View>
        )}
        {child.gender && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{child.gender}</Text>
          </View>
        )}
      </Card>

      {child.teacher && (
        <Card>
          <Text style={styles.sectionTitle}>Teacher</Text>
          <Text style={styles.value}>
            {child.teacher.firstName} {child.teacher.lastName}
          </Text>
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
    width: 120,
  },
  value: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
});
