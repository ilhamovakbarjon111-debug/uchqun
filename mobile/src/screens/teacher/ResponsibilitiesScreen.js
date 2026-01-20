import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { teacherService } from '../../services/teacherService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

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
      <View style={styles.responsibilityHeader}>
        <View style={styles.responsibilityIconContainer}>
          <Ionicons name="list" size={24} color={theme.Colors.primary.blue} />
        </View>
        <View style={styles.responsibilityContent}>
          <Text style={styles.title}>{item.title || item.name || 'Responsibility'}</Text>
          {item.deadline && (
            <View style={styles.deadlineContainer}>
              <Ionicons name="calendar-outline" size={14} color={theme.Colors.text.secondary} />
              <Text style={styles.deadline}>
                Deadline: {new Date(item.deadline).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </View>
      {item.description && <Text style={styles.description}>{item.description}</Text>}
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Responsibilities" />
      {responsibilities.length === 0 ? (
        <EmptyState icon="list-outline" message="No responsibilities assigned" />
      ) : (
        <FlatList
          data={responsibilities}
          renderItem={renderResponsibility}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadResponsibilities}
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
  responsibilityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.Spacing.sm,
  },
  responsibilityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.Colors.primary.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  responsibilityContent: {
    flex: 1,
  },
  title: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.Spacing.xs / 2,
  },
  deadline: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    marginLeft: theme.Spacing.xs / 2,
  },
  description: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.secondary,
    marginTop: theme.Spacing.sm,
    lineHeight: 20,
  },
});
