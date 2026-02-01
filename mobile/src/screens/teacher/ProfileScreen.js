import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { teacherService } from '../../services/teacherService';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';
import { API_URL } from '../../config';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

function getAvatarUrl(avatar) {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  const base = (API_URL || '').replace(/\/api\/?$/, '');
  return `${base}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
}

export function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [groups, setGroups] = useState([]);
  const [parents, setParents] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, groupsData, parentsData, ratingsData] = await Promise.all([
        teacherService.getProfile(),
        teacherService.getGroups(),
        teacherService.getParents(),
        teacherService.getTeacherRatings(),
      ]);
      setProfile(profileData);
      setGroups(groupsData);
      setParents(parentsData);
      setRatings(ratingsData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          t('profile.photoPermissionRequired', { defaultValue: 'Photo library permission is required' })
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      setUploadingAvatar(true);

      const asset = result.assets[0];
      const uri = asset.uri;
      const filename = uri.split('/').pop() || `avatar-${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Create FormData
      const formData = new FormData();
      formData.append('avatar', {
        uri: uri,
        name: filename,
        type: type,
      });

      // Upload to backend
      await api.put('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }
      
      // Reload profile
      await loadProfile();

      Alert.alert(
        t('common.success', { defaultValue: 'Success' }),
        t('profile.avatarUpdated', { defaultValue: 'Avatar updated successfully' })
      );
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        error.response?.data?.error || t('profile.uploadError', { defaultValue: 'Failed to upload avatar' })
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return <EmptyState message="Profile not found" />;
  }

  const u = profile.teacher || profile;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleAvatarUpload} disabled={uploadingAvatar} style={styles.avatarTouchable}>
              <View style={styles.avatar}>
                {u.avatar ? (
                  <Image source={{ uri: getAvatarUrl(u.avatar) }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.avatarText}>
                    {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                  </Text>
                )}
                {uploadingAvatar && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
              </View>
              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={theme.Colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>
                {u.firstName} {u.lastName}
              </Text>
            </View>
          </View>
          {u.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color={theme.Colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{u.email}</Text>
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

        {/* Groups Section */}
        {groups.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>My Groups</Text>
            {groups.map((group, index) => (
              <View
                key={group.id}
                style={[
                  styles.listItem,
                  index === groups.length - 1 && styles.lastListItem,
                ]}
              >
                <View style={styles.listIconContainer}>
                  <Ionicons name="people" size={20} color={theme.Colors.primary.blue} />
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>{group.name}</Text>
                  {group.description && (
                    <Text style={styles.listSubtitle}>{group.description}</Text>
                  )}
                  <Text style={styles.listMeta}>
                    {group.parentCount || 0} parents • Capacity: {group.capacity}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Parents Section */}
        {parents.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>My Parents ({parents.length})</Text>
            {parents.slice(0, 5).map((parent, index) => (
              <View
                key={parent.id}
                style={[
                  styles.listItem,
                  index === Math.min(4, parents.length - 1) && styles.lastListItem,
                ]}
              >
                <View style={styles.listIconContainer}>
                  <Ionicons name="person" size={20} color={theme.Colors.primary.blue} />
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>
                    {parent.firstName} {parent.lastName}
                  </Text>
                  {parent.email && (
                    <Text style={styles.listSubtitle}>{parent.email}</Text>
                  )}
                  {parent.children && parent.children.length > 0 && (
                    <Text style={styles.listMeta}>
                      {parent.children.length} {parent.children.length === 1 ? 'child' : 'children'}
                    </Text>
                  )}
                </View>
              </View>
            ))}
            {parents.length > 5 && (
              <Text style={styles.moreText}>
                +{parents.length - 5} more parents
              </Text>
            )}
          </Card>
        )}

        {/* Teacher Ratings Section */}
        {ratings.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Teacher Ratings</Text>
            {ratings.slice(0, 10).map((teacher, index) => {
              const isCurrentTeacher = teacher.id === user?.id;
              return (
                <View
                  key={teacher.id}
                  style={[
                    styles.ratingItem,
                    isCurrentTeacher && styles.currentTeacherItem,
                    index === Math.min(9, ratings.length - 1) && styles.lastListItem,
                  ]}
                >
                  <View style={styles.rankContainer}>
                    <Text style={[styles.rankText, isCurrentTeacher && styles.currentTeacherRank]}>
                      #{teacher.rank}
                    </Text>
                  </View>
                  <View style={styles.ratingContent}>
                    <Text style={[styles.listTitle, isCurrentTeacher && styles.currentTeacherName]}>
                      {teacher.firstName} {teacher.lastName}
                      {isCurrentTeacher && ' (You)'}
                    </Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#FFA500" />
                      <Text style={styles.ratingText}>
                        {teacher.rating?.toFixed(1) || '0.0'}
                      </Text>
                      <Text style={styles.ratingCount}>
                        ({teacher.totalRatings || 0} ratings)
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
            {ratings.length > 10 && (
              <Text style={styles.moreText}>
                +{ratings.length - 10} more teachers
              </Text>
            )}
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
  avatarTouchable: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.Colors.primary.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: theme.Typography.sizes['2xl'],
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.primary.blue,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.Colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.Spacing.md,
    paddingBottom: theme.Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.Colors.border.light,
  },
  lastListItem: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  listIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.Colors.primary.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.sm,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs / 2,
  },
  listSubtitle: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    marginBottom: theme.Spacing.xs / 2,
  },
  listMeta: {
    fontSize: theme.Typography.sizes.xs,
    color: theme.Colors.text.muted,
  },
  moreText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.primary.blue,
    textAlign: 'center',
    marginTop: theme.Spacing.sm,
    fontWeight: theme.Typography.weights.medium,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.Spacing.md,
    paddingBottom: theme.Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.Colors.border.light,
  },
  currentTeacherItem: {
    backgroundColor: theme.Colors.primary.blueBg,
    marginHorizontal: -theme.Spacing.md,
    paddingHorizontal: theme.Spacing.md,
    paddingVertical: theme.Spacing.sm,
    borderRadius: theme.BorderRadius.md,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: theme.Spacing.sm,
  },
  rankText: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.secondary,
  },
  currentTeacherRank: {
    color: theme.Colors.primary.blue,
  },
  ratingContent: {
    flex: 1,
  },
  currentTeacherName: {
    color: theme.Colors.primary.blue,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.Spacing.xs / 2,
  },
  ratingText: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginLeft: theme.Spacing.xs / 2,
  },
  ratingCount: {
    fontSize: theme.Typography.sizes.xs,
    color: theme.Colors.text.muted,
    marginLeft: theme.Spacing.xs,
  },
});
