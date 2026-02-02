import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator, Animated, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { teacherService } from '../../services/teacherService';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import theme from '../../styles/theme';
import tokens from '../../styles/tokens';
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
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadProfile();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
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
      setEditForm({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
        Alert.alert(t('common.error'), t('profile.nameRequired', { defaultValue: 'Name is required' }));
        return;
      }

      const response = await api.put('/user/profile', {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
      });

      if (response.data?.success) {
        await refreshUser();
        setEditing(false);
        Alert.alert(
          t('common.success', { defaultValue: 'Success' }),
          t('profile.updated', { defaultValue: 'Profile updated successfully' })
        );
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('profile.updateFailed', { defaultValue: 'Failed to update profile' })
      );
    }
  };

  const handleAvatarUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          t('profile.photoPermissionRequired', { defaultValue: 'Photo library permission is required' })
        );
        return;
      }

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

      const formData = new FormData();
      formData.append('avatar', {
        uri: uri,
        name: filename,
        type: type,
      });

      await api.put('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (refreshUser) {
        await refreshUser();
      }

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
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1B4332', '#2D6A4F', '#40916C']}
          style={StyleSheet.absoluteFillObject}
        />
        <LoadingSpinner />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1B4332', '#2D6A4F', '#40916C']}
          style={StyleSheet.absoluteFillObject}
        />
        <EmptyState message="Profile not found" />
      </View>
    );
  }

  const u = user || profile.teacher || profile;

  return (
    <View style={styles.container}>
      {/* Nature Background - Dark Green Theme */}
      <LinearGradient
        colors={['#1B4332', '#2D6A4F', '#40916C']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <LinearGradient
        colors={['#1B4332', '#2D6A4F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="person" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>{t('nav.profile', { defaultValue: 'Profile' })}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Profile Information Card */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.profileCardGradient}
            >
              <TouchableOpacity onPress={handleAvatarUpload} disabled={uploadingAvatar}>
                <View style={styles.avatarContainer}>
                  {u.avatar ? (
                    <Image source={{ uri: getAvatarUrl(u.avatar) }} style={styles.avatarImage} resizeMode="cover" />
                  ) : (
                    <LinearGradient
                      colors={['#52B788', '#40916C']}
                      style={styles.avatarGradient}
                    >
                      <Text style={styles.avatarText}>
                        {u.firstName?.charAt(0) || ''}{u.lastName?.charAt(0) || ''}
                      </Text>
                    </LinearGradient>
                  )}
                  {uploadingAvatar && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    </View>
                  )}
                  <View style={styles.cameraButton}>
                    <Ionicons name="camera" size={12} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>

              {!editing ? (
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>
                    {u.firstName ?? '—'} {u.lastName ?? ''}
                  </Text>
                  <View style={styles.emailRow}>
                    <Ionicons name="mail-outline" size={12} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.profileEmail}>{u.email ?? '—'}</Text>
                  </View>
                  <View style={styles.roleBadge}>
                    <LinearGradient
                      colors={['rgba(82, 183, 136, 0.25)', 'rgba(64, 145, 108, 0.25)']}
                      style={styles.roleBadgeGradient}
                    >
                      <Ionicons name="people" size={12} color="#95D5B2" />
                      <Text style={styles.roleText}>{t('dashboard.roleTeacher', { defaultValue: 'Teacher' })}</Text>
                    </LinearGradient>
                  </View>
                  <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
                    <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.editButtonText}>{t('profile.editProfile', { defaultValue: 'Edit Profile' })}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.editForm}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('profile.firstName', { defaultValue: 'First Name' })}</Text>
                    <TextInput
                      style={styles.input}
                      value={editForm.firstName}
                      onChangeText={(text) => setEditForm({ ...editForm, firstName: text })}
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('profile.lastName', { defaultValue: 'Last Name' })}</Text>
                    <TextInput
                      style={styles.input}
                      value={editForm.lastName}
                      onChangeText={(text) => setEditForm({ ...editForm, lastName: text })}
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    />
                  </View>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
                      <Text style={styles.cancelButtonText}>{t('common.cancel', { defaultValue: 'Cancel' })}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                      <LinearGradient colors={['#52B788', '#40916C']} style={styles.saveButtonGradient}>
                        <Text style={styles.saveButtonText}>{t('common.save', { defaultValue: 'Save' })}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Groups Section */}
          {groups.length > 0 && (
            <View style={styles.sectionCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.08)']}
                style={styles.sectionCardGradient}
              >
                <Text style={styles.sectionTitle}>
                  <Ionicons name="people" size={18} color="#95D5B2" /> My Groups
                </Text>
                {groups.map((group, index) => (
                  <View
                    key={group.id}
                    style={[
                      styles.listItem,
                      index === groups.length - 1 && styles.lastListItem,
                    ]}
                  >
                    <View style={[styles.listIconContainer, { backgroundColor: 'rgba(149, 213, 178, 0.2)' }]}>
                      <Ionicons name="people" size={20} color="#95D5B2" />
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
              </LinearGradient>
            </View>
          )}

          {/* Parents Section */}
          {parents.length > 0 && (
            <View style={styles.sectionCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.08)']}
                style={styles.sectionCardGradient}
              >
                <Text style={styles.sectionTitle}>
                  <Ionicons name="person" size={18} color="#95D5B2" /> My Parents ({parents.length})
                </Text>
                {parents.slice(0, 5).map((parent, index) => (
                  <View
                    key={parent.id}
                    style={[
                      styles.listItem,
                      index === Math.min(4, parents.length - 1) && styles.lastListItem,
                    ]}
                  >
                    <View style={[styles.listIconContainer, { backgroundColor: 'rgba(149, 213, 178, 0.2)' }]}>
                      <Ionicons name="person" size={20} color="#95D5B2" />
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
              </LinearGradient>
            </View>
          )}

          {/* Teacher Ratings Section */}
          {ratings.length > 0 && (
            <View style={styles.sectionCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.08)']}
                style={styles.sectionCardGradient}
              >
                <Text style={styles.sectionTitle}>
                  <Ionicons name="star" size={18} color="#FFD700" /> Teacher Ratings
                </Text>
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
                          <Ionicons name="star" size={14} color="#FFD700" />
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
              </LinearGradient>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: tokens.space.lg,
    paddingHorizontal: tokens.space.xl,
    ...tokens.shadow.soft,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space.sm,
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.white,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: tokens.space.lg,
    paddingBottom: tokens.space['3xl'],
  },
  profileCard: {
    borderRadius: tokens.radius.xl,
    marginBottom: tokens.space.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...tokens.shadow.soft,
  },
  profileCardGradient: {
    padding: tokens.space.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: tokens.space.md,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.colors.text.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#52B788',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...tokens.shadow.sm,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.white,
    marginBottom: tokens.space.xs,
    letterSpacing: -0.3,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
    marginBottom: tokens.space.sm,
  },
  profileEmail: {
    fontSize: tokens.type.sub.fontSize,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  roleBadge: {
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
  },
  roleBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
    gap: tokens.space.xs,
  },
  roleText: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: '600',
    color: '#95D5B2',
    letterSpacing: 0.3,
  },
  sectionCard: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    marginBottom: tokens.space.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionCardGradient: {
    padding: tokens.space.lg,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.text.white,
    marginBottom: tokens.space.md,
    letterSpacing: -0.1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: tokens.space.md,
    paddingBottom: tokens.space.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.sm,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.white,
    marginBottom: 2,
  },
  listSubtitle: {
    fontSize: tokens.type.sub.fontSize,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  listMeta: {
    fontSize: tokens.type.sub.fontSize,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  moreText: {
    fontSize: tokens.type.sub.fontSize,
    color: '#95D5B2',
    textAlign: 'center',
    marginTop: tokens.space.sm,
    fontWeight: '600',
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.space.md,
    paddingBottom: tokens.space.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentTeacherItem: {
    backgroundColor: 'rgba(149, 213, 178, 0.2)',
    marginHorizontal: -tokens.space.md,
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
    borderRadius: tokens.radius.md,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: tokens.space.sm,
  },
  rankText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  currentTeacherRank: {
    color: '#95D5B2',
  },
  ratingContent: {
    flex: 1,
  },
  currentTeacherName: {
    color: '#95D5B2',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.white,
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: tokens.type.sub.fontSize,
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    marginTop: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editForm: {
    width: '100%',
    marginTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
