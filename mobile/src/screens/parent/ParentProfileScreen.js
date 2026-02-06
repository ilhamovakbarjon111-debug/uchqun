import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator, Animated, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { parentService } from '../../services/parentService';
import { activityService } from '../../services/activityService';
import { mealService } from '../../services/mealService';
import { mediaService } from '../../services/mediaService';
import { GlassCard } from '../../components/teacher/GlassCard';
import { ScreenHeader } from '../../components/teacher/ScreenHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import tokens from '../../styles/tokens';
import { API_URL } from '../../config';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

function getAvatarUrl(avatar) {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  const base = (API_URL || '').replace(/\/api\/?$/, '');
  return `${base}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
}

export function ParentProfileScreen() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [child, setChild] = useState(null);
  const [teacherName, setTeacherName] = useState('');
  const [parentGroupName, setParentGroupName] = useState('');
  const [weeklyStats, setWeeklyStats] = useState({
    activities: 0,
    meals: 0,
    media: 0,
  });
  const [monitoringRecords, setMonitoringRecords] = useState([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  // Bottom nav height + safe area + padding
  const BOTTOM_NAV_HEIGHT = 75;
  const bottomPadding = BOTTOM_NAV_HEIGHT + insets.bottom + 16;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadProfile();

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
      const childrenData = await parentService.getChildren();
      const childrenList = Array.isArray(childrenData) ? childrenData : [];
      setChildren(childrenList);
      setEditForm({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
      });

      // Load full child information if there's a child
      if (childrenList.length > 0) {
        const childId = childrenList[0].id;
        await loadChildData(childId);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildData = async (childId) => {
    if (!childId) return;
    
    try {
      const [childResponse, activitiesResponse, mealsResponse, mediaResponse, profileResponse, monitoringResponse] = await Promise.all([
        parentService.getChildById(childId).catch(() => null),
        activityService.getActivities({ childId }).catch(() => []),
        mealService.getMeals({ childId }).catch(() => []),
        mediaService.getMedia({ childId }).catch(() => []),
        parentService.getProfile().catch(() => null),
        api.get(`/parent/emotional-monitoring/child/${childId}`).catch(() => ({ data: { data: [] } })),
      ]);

      if (childResponse) {
        setChild(childResponse);
      }

      // Get teacher name from profile
      const assignedTeacher = profileResponse?.user?.assignedTeacher;
      const parentGroup = profileResponse?.user?.group;
      setParentGroupName(parentGroup?.name || '');
      
      const combinedTeacherName = assignedTeacher
        ? [assignedTeacher.firstName, assignedTeacher.lastName].filter(Boolean).join(' ')
        : (childResponse?.teacher || '');
      setTeacherName(combinedTeacherName);

      // Calculate weekly stats (last 7 days)
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const activities = Array.isArray(activitiesResponse) ? activitiesResponse : [];
      const meals = Array.isArray(mealsResponse) ? mealsResponse : [];
      const media = Array.isArray(mediaResponse) ? mediaResponse : [];

      const activitiesThisWeek = activities.filter(a => {
        const activityDate = new Date(a.date || a.createdAt);
        return activityDate >= weekAgo;
      }).length;

      const mealsThisWeek = meals.filter(m => {
        const mealDate = new Date(m.date || m.createdAt);
        return mealDate >= weekAgo;
      }).length;

      const mediaThisWeek = media.filter(m => {
        const mediaDate = new Date(m.date || m.createdAt);
        return mediaDate >= weekAgo;
      }).length;

      setWeeklyStats({
        activities: activitiesThisWeek,
        meals: mealsThisWeek,
        media: mediaThisWeek,
      });

      // Load monitoring records
      const monitoring = Array.isArray(monitoringResponse.data?.data) ? monitoringResponse.data.data : [];
      setMonitoringRecords(monitoring);
    } catch (error) {
      console.error('Error loading child data:', error);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    const base = (API_URL || '').replace(/\/api\/?$/, '');
    return `${base}${photo.startsWith('/') ? '' : '/'}${photo}`;
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
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('avatar', {
        uri,
        name: filename,
        type,
      });

      const response = await api.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.avatarUrl) {
        await refreshUser();
        Alert.alert(
          t('common.success', { defaultValue: 'Success' }),
          t('profile.photoUploaded', { defaultValue: 'Profile photo updated successfully' })
        );
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('profile.photoUploadFailed', { defaultValue: 'Failed to upload photo' })
      );
    } finally {
      setUploadingAvatar(false);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  const u = user || {};

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
          {/* Profile Card */}
          <GlassCard style={styles.profileCard}>
              <TouchableOpacity onPress={handleAvatarUpload} disabled={uploadingAvatar}>
                <View style={styles.avatarContainer}>
                  {u.avatar ? (
                    <Image source={{ uri: getAvatarUrl(u.avatar) }} style={styles.avatarImage} resizeMode="cover" />
                  ) : (
                    <LinearGradient colors={['#A78BFA', '#8B5CF6']} style={styles.avatarGradient}>
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
                      colors={['rgba(167, 139, 250, 0.25)', 'rgba(139, 92, 246, 0.25)']}
                      style={styles.roleBadgeGradient}
                    >
                      <Ionicons name="person" size={12} color="#C4B5FD" />
                      <Text style={styles.roleText}>{t('dashboard.roleParent', { defaultValue: 'Parent' })}</Text>
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
                      placeholderTextColor={tokens.colors.text.tertiary}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('profile.lastName', { defaultValue: 'Last Name' })}</Text>
                    <TextInput
                      style={styles.input}
                      value={editForm.lastName}
                      onChangeText={(text) => setEditForm({ ...editForm, lastName: text })}
                      placeholderTextColor={tokens.colors.text.tertiary}
                    />
                  </View>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
                      <Text style={styles.cancelButtonText}>{t('common.cancel', { defaultValue: 'Cancel' })}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                      <LinearGradient colors={tokens.colors.gradients.aurora} style={styles.saveButtonGradient}>
                        <Text style={styles.saveButtonText}>{t('common.save', { defaultValue: 'Save' })}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
          </GlassCard>

          {/* Child Information Section - Full Details */}
          {child ? (
            <>
              {/* Child Profile Hero */}
              <GlassCard style={styles.childHeroCard}>
                <View style={styles.childHeroContent}>
                  <View style={styles.childAvatarContainer}>
                    {child.photo ? (
                      <Image 
                        source={{ uri: getPhotoUrl(child.photo) }} 
                        style={styles.childAvatarImage} 
                        resizeMode="cover" 
                      />
                    ) : (
                      <LinearGradient
                        colors={[tokens.colors.accent.blue + '30', tokens.colors.accent.blue + '15']}
                        style={styles.childAvatar}
                      >
                        <Text style={styles.childAvatarText}>
                          {child.firstName?.charAt(0) || ''}{child.lastName?.charAt(0) || ''}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>

                  <View style={styles.childHeroInfo}>
                    <View style={styles.childHeroNameRow}>
                      <Text style={styles.childHeroName}>
                        {child.firstName} {child.lastName}
                      </Text>
                      {child.gender && (
                        <View style={styles.genderBadge}>
                          <Text style={styles.genderBadgeText}>
                            {t(`child.gender.${child.gender?.toLowerCase()}`, { defaultValue: child.gender })}
                          </Text>
                        </View>
                      )}
                    </View>
                    {child.dateOfBirth && (
                      <View style={styles.ageRow}>
                        <Ionicons name="calendar-outline" size={16} color={tokens.colors.accent.blue} />
                        <Text style={styles.ageText}>
                          {t('child.ageYears', { count: calculateAge(child.dateOfBirth) })}
                        </Text>
                      </View>
                    )}
                    <View style={styles.infoBadges}>
                      {child.school && (
                        <View style={styles.infoBadge}>
                          <Ionicons name="school" size={14} color={tokens.colors.accent.blue} />
                          <Text style={styles.infoBadgeText}>{child.school}</Text>
                        </View>
                      )}
                      {parentGroupName && (
                        <View style={styles.infoBadge}>
                          <Ionicons name="people" size={14} color={tokens.colors.accent.blue} />
                          <Text style={styles.infoBadgeText}>{parentGroupName}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </GlassCard>

              {/* Basic Information */}
              <GlassCard style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person" size={24} color={tokens.colors.accent.blue} />
                  <Text style={styles.sectionTitle}>{t('child.basicInfo', { defaultValue: 'Basic Information' })}</Text>
                </View>
                <View style={styles.infoGrid}>
                  <InfoItem 
                    label={t('child.fullName', { defaultValue: 'Full name' })} 
                    value={`${child.firstName} ${child.lastName}`} 
                    icon="person-outline"
                  />
                  {child.dateOfBirth && (
                    <InfoItem 
                      label={t('child.birthDate', { defaultValue: 'Date of birth' })} 
                      value={formatDate(child.dateOfBirth)} 
                      icon="calendar-outline"
                    />
                  )}
                  {child.disabilityType && (
                    <InfoItem 
                      label={t('child.diagnosis', { defaultValue: 'Diagnosis' })} 
                      value={child.disabilityType} 
                      icon="medical-outline"
                      color={tokens.colors.semantic.error}
                    />
                  )}
                  <InfoItem 
                    label={t('child.teacher', { defaultValue: 'Teacher' })} 
                    value={(teacherName && teacherName.trim()) || child.teacher || '—'} 
                    icon="school-outline"
                    color={tokens.colors.accent.blue}
                  />
                </View>
              </GlassCard>

              {/* Special Needs */}
              {child.specialNeeds && (
                <GlassCard style={styles.sectionCard}>
                  <View style={styles.specialNeedsHeader}>
                    <Ionicons name="heart" size={24} color={tokens.colors.semantic.error} />
                    <Text style={styles.specialNeedsTitle}>
                      {t('child.specialNeeds', { defaultValue: 'Special Needs' })}
                    </Text>
                  </View>
                  <View style={styles.specialNeedsContent}>
                    <Text style={styles.specialNeedsText}>
                      {child.specialNeeds}
                    </Text>
                  </View>
                </GlassCard>
              )}

              {/* Weekly Stats */}
              <GlassCard style={styles.statsCard}>
                <Text style={styles.statsTitle}>
                  {t('child.weeklyResults', { defaultValue: 'Weekly Results' })}
                </Text>
                <View style={styles.statsList}>
                  <StatRow
                    label={t('child.activities', { defaultValue: 'Activities' })}
                    value={weeklyStats.activities}
                  />
                  <StatRow
                    label={t('child.meals', { defaultValue: 'Meals' })}
                    value={weeklyStats.meals}
                  />
                  <StatRow
                    label={t('child.media', { defaultValue: 'Media' })}
                    value={weeklyStats.media}
                  />
                </View>
              </GlassCard>

              {/* Emotional Monitoring */}
              {monitoringRecords.length > 0 && (
                <GlassCard style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="heart" size={24} color={tokens.colors.joy.rose} />
                    <Text style={styles.sectionTitle}>
                      {t('profile.monitoringJournal', { defaultValue: 'Monitoring Journal' })}
                    </Text>
                  </View>
                  <View style={styles.monitoringList}>
                    {monitoringRecords.slice(0, 5).map((record) => {
                      const emotionalState = record.emotionalState || {};
                      const checkedCount = Object.values(emotionalState).filter(Boolean).length;
                      const totalCount = Object.keys(emotionalState).length;
                      const percentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
                      
                      return (
                        <View key={record.id} style={styles.monitoringCard}>
                          <View style={styles.monitoringHeader}>
                            <View>
                              <Text style={styles.monitoringDate}>
                                {formatDate(record.date)}
                              </Text>
                              {record.teacher && (
                                <Text style={styles.monitoringTeacher}>
                                  {t('child.teacher', { defaultValue: 'Teacher' })}: {record.teacher.firstName} {record.teacher.lastName}
                                </Text>
                              )}
                            </View>
                            <View style={styles.monitoringPercentage}>
                              <Text style={styles.monitoringPercentageText}>{percentage}%</Text>
                              <Text style={styles.monitoringCount}>
                                {checkedCount} / {totalCount}
                              </Text>
                            </View>
                          </View>
                          {record.notes && (
                            <Text style={styles.monitoringNotes}>
                              {record.notes}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                  {monitoringRecords.length > 5 && (
                    <Text style={styles.moreRecords}>
                      +{monitoringRecords.length - 5} {t('common.more', { defaultValue: 'more' })}
                    </Text>
                  )}
                </GlassCard>
              )}
            </>
          ) : children.length === 0 ? (
            <GlassCard style={styles.sectionCard}>
              <EmptyState
                icon="people-outline"
                message={t('profile.noChildren', { defaultValue: 'No children attached' })}
              />
            </GlassCard>
          ) : null}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
function InfoItem({ label, value, icon, color = tokens.colors.accent.blue }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoItemLabelRow}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={styles.infoItemLabel}>{label}</Text>
      </View>
      <Text style={styles.infoItemValue}>{value}</Text>
    </View>
  );
}

function StatRow({ label, value }) {
  return (
    <View style={styles.statRow}>
      <View style={styles.statRowLeft}>
        <View style={styles.statDot} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: tokens.space.lg,
  },
  profileCard: {
    marginBottom: tokens.space.xl,
    alignItems: 'center',
    padding: tokens.space.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: tokens.space.md,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.accent.blue,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: tokens.colors.text.white,
    textTransform: 'uppercase',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: tokens.colors.accent.blue,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.sm,
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  profileEmail: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
  },
  roleBadge: {
    marginBottom: 16,
    backgroundColor: tokens.colors.semantic.successSoft,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.semantic.success,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.accent.blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.white,
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
    backgroundColor: tokens.colors.background.tertiary,
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
  sectionCard: {
    marginBottom: tokens.space.lg,
    padding: tokens.space.lg,
  },
  sectionTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.md,
    paddingHorizontal: 2,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.space.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  lastChildItem: {
    borderBottomWidth: 0,
  },
  childIconContainer: {
    marginRight: tokens.space.sm,
  },
  childIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.joy.lavenderSoft,
  },
  childContent: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 4,
  },
  childMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childAge: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
  },
  childGender: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
  },
  childDisability: {
    fontSize: 12,
    color: tokens.colors.text.muted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  // Child Hero Section
  childHeroCard: {
    marginBottom: tokens.space.xl,
    padding: tokens.space.lg,
  },
  childHeroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.lg,
  },
  childAvatarContainer: {
    position: 'relative',
  },
  childAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.soft,
  },
  childAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  childAvatarText: {
    fontSize: tokens.type.h1.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.accent.blue,
  },
  childHeroInfo: {
    flex: 1,
  },
  childHeroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.space.sm,
    marginBottom: tokens.space.sm,
  },
  childHeroName: {
    fontSize: tokens.type.h1.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.primary,
  },
  genderBadge: {
    backgroundColor: tokens.colors.accent[50],
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.xs,
    borderRadius: tokens.radius.pill,
  },
  genderBadgeText: {
    fontSize: tokens.type.caption.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.accent.blue,
    textTransform: 'uppercase',
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
    marginBottom: tokens.space.md,
  },
  ageText: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.secondary,
  },
  infoBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space.sm,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
    backgroundColor: tokens.colors.background.secondary,
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
    borderRadius: tokens.radius.lg,
    ...tokens.shadow.sm,
  },
  infoBadgeText: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginBottom: tokens.space.lg,
  },
  // Info Grid
  infoGrid: {
    gap: tokens.space.lg,
  },
  infoItem: {
    gap: tokens.space.xs,
  },
  infoItemLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
    marginBottom: tokens.space.xs / 2,
  },
  infoItemLabel: {
    fontSize: tokens.type.caption.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoItemValue: {
    fontSize: tokens.type.bodyLarge.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  // Special Needs
  specialNeedsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginBottom: tokens.space.md,
  },
  specialNeedsTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.semantic.error,
  },
  specialNeedsContent: {
    backgroundColor: tokens.colors.semantic.errorSoft,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.lg,
  },
  specialNeedsText: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.semantic.error,
    lineHeight: 22,
  },
  // Stats
  statsCard: {
    marginBottom: tokens.space.lg,
    padding: tokens.space.lg,
  },
  statsTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.lg,
  },
  statsList: {
    gap: tokens.space.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.accent.blue,
  },
  statLabel: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
  },
  statValue: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.primary,
  },
  // Monitoring
  monitoringList: {
    gap: tokens.space.md,
  },
  monitoringCard: {
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.md,
  },
  monitoringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.space.sm,
  },
  monitoringDate: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
  },
  monitoringTeacher: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    marginTop: tokens.space.xs / 2,
  },
  monitoringPercentage: {
    alignItems: 'flex-end',
  },
  monitoringPercentageText: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.accent.blue,
  },
  monitoringCount: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.secondary,
    marginTop: tokens.space.xs / 2,
  },
  monitoringNotes: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    marginTop: tokens.space.sm,
    paddingTop: tokens.space.sm,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
  },
  moreRecords: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginTop: tokens.space.sm,
  },
});
