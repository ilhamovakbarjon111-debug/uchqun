import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { parentService } from '../../services/parentService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

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
    <View style={styles.container}>
      <ScreenHeader title={`${child.firstName} ${child.lastName}`} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
              </Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={theme.Colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>
                {child.firstName} {child.lastName}
              </Text>
            </View>
          </View>
          {child.dateOfBirth && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={theme.Colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.label}>Date of Birth</Text>
                <Text style={styles.value}>{child.dateOfBirth}</Text>
              </View>
            </View>
          )}
          {child.gender && (
            <View style={styles.infoRow}>
              <Ionicons name="person-circle-outline" size={18} color={theme.Colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.label}>Gender</Text>
                <Text style={styles.value}>{child.gender}</Text>
              </View>
            </View>
          )}
        </Card>

        {child.teacher && (
          <Card>
            <Text style={styles.sectionTitle}>Teacher</Text>
            <View style={styles.teacherContainer}>
              <View style={styles.teacherAvatar}>
                <Text style={styles.teacherAvatarText}>
                  {child.teacher.firstName?.charAt(0)}{child.teacher.lastName?.charAt(0)}
                </Text>
              </View>
              <Text style={styles.teacherName}>
                {child.teacher.firstName} {child.teacher.lastName}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Colors.background.secondary,
  },
  content: {
    padding: theme.Spacing.md,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: theme.Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.Colors.primary.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: theme.Typography.sizes['2xl'],
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.primary.blue,
  },
  sectionTitle: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.Spacing.md,
    paddingBottom: theme.Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.Colors.border.light,
  },
  infoContent: {
    flex: 1,
    marginLeft: theme.Spacing.md,
  },
  label: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    marginBottom: theme.Spacing.xs / 2,
  },
  value: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    fontWeight: theme.Typography.weights.medium,
  },
  teacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.Spacing.sm,
  },
  teacherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.Colors.primary.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  teacherAvatarText: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.primary.blue,
  },
  teacherName: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
  },
});
