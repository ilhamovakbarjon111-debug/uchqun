import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { teacherService } from '../../services/teacherService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

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
    <View style={styles.container}>
      <ScreenHeader title={`${parent.firstName} ${parent.lastName}`} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {parent.firstName?.charAt(0)}{parent.lastName?.charAt(0)}
              </Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>Parent Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={theme.Colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>
                {parent.firstName} {parent.lastName}
              </Text>
            </View>
          </View>
          {parent.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color={theme.Colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{parent.email}</Text>
              </View>
            </View>
          )}
        </Card>

        {parent.children && parent.children.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Children</Text>
            {parent.children.map((child) => (
              <View key={child.id} style={styles.childItem}>
                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>
                    {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.childName}>
                  {child.firstName} {child.lastName}
                </Text>
              </View>
            ))}
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
    backgroundColor: theme.Colors.cards.parents + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: theme.Typography.sizes['2xl'],
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.cards.parents,
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
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.Spacing.md,
    paddingBottom: theme.Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.Colors.border.light,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.Colors.primary.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  childAvatarText: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.primary.blue,
  },
  childName: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
  },
});
