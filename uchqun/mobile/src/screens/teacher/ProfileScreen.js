import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { teacherService } from '../../services/teacherService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>
            {profile.firstName} {profile.lastName}
          </Text>
        </View>
        {profile.email && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{profile.email}</Text>
          </View>
        )}
      </Card>

      {profile.responsibilities && profile.responsibilities.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Responsibilities</Text>
          <Text style={styles.value}>{profile.responsibilities.length} assigned</Text>
        </Card>
      )}

      {profile.tasks && profile.tasks.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Tasks</Text>
          <Text style={styles.value}>{profile.tasks.length} tasks</Text>
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
});
