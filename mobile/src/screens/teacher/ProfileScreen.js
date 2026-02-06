import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator, Animated, TextInput, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { teacherService } from '../../services/teacherService';
import { GlassCard } from '../../components/teacher/GlassCard';
import { ScreenHeader } from '../../components/teacher/ScreenHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
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
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  // Bottom nav height + safe area + padding
  const BOTTOM_NAV_HEIGHT = 75;
  const bottomPadding = BOTTOM_NAV_HEIGHT + insets.bottom + 16;
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      setUploadingAvatar(true);

      const asset = result.assets[0];
      const uri = asset.uri;
      
      // Extract filename and type properly
      let filename = `avatar-${Date.now()}.jpg`;
      let mimeType = 'image/jpeg';
      
      // Try to get filename from URI
      const uriParts = uri.split('/');
      const uriFilename = uriParts[uriParts.length - 1];
      if (uriFilename && uriFilename.includes('.')) {
        filename = uriFilename;
        const ext = filename.split('.').pop().toLowerCase();
        if (ext === 'png') {
          mimeType = 'image/png';
        } else if (ext === 'jpg' || ext === 'jpeg') {
          mimeType = 'image/jpeg';
        } else if (ext === 'gif') {
          mimeType = 'image/gif';
        } else if (ext === 'webp') {
          mimeType = 'image/webp';
        }
      }

      // Create FormData - React Native FormData format
      const formData = new FormData();
      formData.append('avatar', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type: mimeType,
      });

      // Don't set Content-Type header - let the API interceptor handle it
      await api.put('/user/avatar', formData, {
        timeout: 60000, // 60 seconds for file upload
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
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          t('profile.uploadError', { defaultValue: 'Failed to upload avatar' });
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        errorMessage
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title={t('nav.profile', { defaultValue: 'Profile' })} showBack={false} />
        <EmptyState message={t('profile.notFound', { defaultValue: 'Profile not found' })} />
      </SafeAreaView>
    );
  }

  const u = user || profile.teacher || profile;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader 
        title={t('nav.profile', { defaultValue: 'Profile' })} 
        showBack={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
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
            <View style={styles.profileCardContent}>
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
                    <Ionicons name="mail-outline" size={12} color={tokens.colors.text.secondary} />
                    <Text style={styles.profileEmail}>{u.email ?? '—'}</Text>
                  </View>
                  <View style={styles.roleBadge}>
                    <View style={styles.roleBadgeContent}>
                      <Ionicons name="people" size={12} color={tokens.colors.semantic.success} />
                      <Text style={styles.roleText}>{t('dashboard.roleTeacher', { defaultValue: 'My Role: Teacher' })}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
                    <Ionicons name="create-outline" size={16} color={tokens.colors.text.primary} />
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
                      placeholderTextColor={tokens.colors.text.muted}
                      cursorColor={tokens.colors.joy.lavender}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('profile.lastName', { defaultValue: 'Last Name' })}</Text>
                    <TextInput
                      style={styles.input}
                      value={editForm.lastName}
                      onChangeText={(text) => setEditForm({ ...editForm, lastName: text })}
                      placeholderTextColor={tokens.colors.text.muted}
                      cursorColor={tokens.colors.joy.lavender}
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
            </View>
          </View>

          {/* Groups Section */}
          {groups.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionCardContent}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="people" size={18} color={tokens.colors.semantic.success} />
                  <Text style={styles.sectionTitle}>{t('profile.myGroups', { defaultValue: 'My Groups' })}</Text>
                </View>
                {groups.map((group, index) => (
                  <View
                    key={group.id}
                    style={[
                      styles.listItem,
                      index === groups.length - 1 && styles.lastListItem,
                    ]}
                  >
                    <View style={[styles.listIconContainer, { backgroundColor: tokens.colors.semantic.successSoft }]}>
                      <Ionicons name="people" size={20} color={tokens.colors.semantic.success} />
                    </View>
                    <View style={styles.listContent}>
                      <Text style={styles.listTitle}>{group.name}</Text>
                      {group.description && (
                        <Text style={styles.listSubtitle}>{group.description}</Text>
                      )}
                      <Text style={styles.listMeta}>
                        {group.parentCount || 0} {t('profile.parents', { defaultValue: 'parents' })} • {t('profile.capacity', { defaultValue: 'Capacity' })}: {group.capacity}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Parents Section */}
          {parents.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionCardContent}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="person" size={18} color={tokens.colors.semantic.success} />
                  <Text style={styles.sectionTitle}>{t('profile.myParents', { defaultValue: 'My Parents' })} ({parents.length})</Text>
                </View>
                {parents.slice(0, 5).map((parent, index) => (
                  <View
                    key={parent.id}
                    style={[
                      styles.listItem,
                      index === Math.min(4, parents.length - 1) && styles.lastListItem,
                    ]}
                  >
                    <View style={[styles.listIconContainer, { backgroundColor: tokens.colors.semantic.successSoft }]}>
                      <Ionicons name="person" size={20} color={tokens.colors.semantic.success} />
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
                          {parent.children.length} {parent.children.length === 1 ? t('profile.child', { defaultValue: 'child' }) : t('profile.children', { defaultValue: 'children' })}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
                {parents.length > 5 && (
                  <Text style={styles.moreText}>
                    +{parents.length - 5} {t('profile.moreParents', { defaultValue: 'more parents' })}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Teacher Ratings Section */}
          {ratings.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionCardContent}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="star" size={18} color="#FFD700" />
                  <Text style={styles.sectionTitle}>{t('profile.teacherRatings', { defaultValue: 'Teacher Ratings' })}</Text>
                </View>
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
                          {isCurrentTeacher && ` (${t('profile.you', { defaultValue: 'You' })})`}
                        </Text>
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text style={styles.ratingText}>
                            {teacher.rating?.toFixed(1) || '0.0'}
                          </Text>
                          <Text style={styles.ratingCount}>
                            ({teacher.totalRatings || 0} {t('profile.ratings', { defaultValue: 'ratings' })})
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
                {ratings.length > 10 && (
                  <Text style={styles.moreText}>
                    +{ratings.length - 10} {t('profile.moreTeachers', { defaultValue: 'more teachers' })}
                  </Text>
                )}
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary, // Warm Sand - beige background
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
    backgroundColor: tokens.colors.background.secondary, // Solid white
    ...tokens.shadow.soft,
  },
  profileCardContent: {
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
    // Removed: borderWidth, borderColor - no borders per design requirements
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
    color: tokens.colors.text.primary,
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
    color: tokens.colors.text.secondary,
  },
  roleBadge: {
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    marginBottom: tokens.space.md,
  },
  roleBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
    gap: tokens.space.xs,
    backgroundColor: tokens.colors.semantic.successSoft,
  },
  roleText: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: '600',
    color: tokens.colors.semantic.success,
    letterSpacing: 0.3,
  },
  sectionCard: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    marginBottom: tokens.space.lg,
    backgroundColor: tokens.colors.background.secondary, // Solid white
    ...tokens.shadow.soft,
  },
  sectionCardContent: {
    padding: tokens.space.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
    marginBottom: tokens.space.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    letterSpacing: -0.1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: tokens.space.md,
    paddingBottom: tokens.space.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
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
    color: tokens.colors.text.primary,
    marginBottom: 2,
  },
  listSubtitle: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    marginBottom: 2,
  },
  listMeta: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.muted,
  },
  moreText: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.semantic.success,
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
    borderBottomColor: tokens.colors.border.light,
  },
  currentTeacherItem: {
    backgroundColor: tokens.colors.semantic.successSoft,
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
    color: tokens.colors.text.muted,
  },
  currentTeacherRank: {
    color: tokens.colors.semantic.success,
  },
  ratingContent: {
    flex: 1,
  },
  currentTeacherName: {
    color: tokens.colors.semantic.success,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.muted,
    marginLeft: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.tertiary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    marginTop: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.primary,
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
    color: tokens.colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: tokens.colors.background.secondary, // Solid white
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: tokens.colors.text.primary, // Dark text on white
    // Removed: borderWidth, borderColor - no borders per design requirements
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: tokens.colors.background.tertiary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.text.primary,
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
