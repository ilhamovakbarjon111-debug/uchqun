import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { teacherService } from '../../services/teacherService';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

export function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return <EmptyState message="Profile not found" />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
              </Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={theme.Colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>
                {profile.firstName} {profile.lastName}
              </Text>
            </View>
          </View>
          {profile.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color={theme.Colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{profile.email}</Text>
              </View>
            </View>
          )}
        </Card>

        {profile.responsibilities && profile.responsibilities.length > 0 && (
          <Card>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="list" size={24} color={theme.Colors.primary.blue} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{profile.responsibilities.length}</Text>
                <Text style={styles.statLabel}>Responsibilities</Text>
              </View>
            </View>
          </Card>
        )}

        {profile.tasks && profile.tasks.length > 0 && (
          <Card>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: theme.Colors.cards.activities + '20' }]}>
                <Ionicons name="checkmark-circle" size={24} color={theme.Colors.cards.activities} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{profile.tasks.length}</Text>
                <Text style={styles.statLabel}>Tasks</Text>
              </View>
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
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.Colors.primary.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: theme.Typography.sizes['2xl'],
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs / 2,
  },
  statLabel: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
  },
});
