import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator, Animated, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { parentService } from '../../services/parentService';
import Card from '../../components/common/Card';
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
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

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
      setChildren(Array.isArray(childrenData) ? childrenData : []);
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

  const header = (
    <View style={styles.topBar}>
      <View style={styles.placeholder} />
      <Text style={styles.topBarTitle}>{t('nav.profile', { defaultValue: 'Profile' })}</Text>
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9333EA', '#7C3AED', '#6D28D9']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.header}>{header}</View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Profile Card */}
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
                      <LinearGradient colors={['#A78BFA', '#8B5CF6']} style={styles.saveButtonGradient}>
                        <Text style={styles.saveButtonText}>{t('common.save', { defaultValue: 'Save' })}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Children Section */}
          <View style={styles.sectionCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.sectionCardGradient}
            >
              <Text style={styles.sectionTitle}>{t('profile.myChildren', { defaultValue: 'My Children' })} ({children.length})</Text>
              {children.length === 0 ? (
                <EmptyState
                  icon="people-outline"
                  message={t('profile.noChildren', { defaultValue: 'No children attached' })}
                />
              ) : (
                children.map((child, index) => (
                  <TouchableOpacity
                    key={child.id}
                    style={[styles.childItem, index === children.length - 1 && styles.lastChildItem]}
                    onPress={() => navigation.navigate('ChildProfile', { childId: child.id })}
                  >
                    <View style={styles.childIconContainer}>
                      <LinearGradient colors={['#C4B5FD', '#A78BFA']} style={styles.childIconGradient}>
                        <Ionicons name="person" size={20} color="#FFFFFF" />
                      </LinearGradient>
                    </View>
                    <View style={styles.childContent}>
                      <Text style={styles.childName}>
                        {child.firstName} {child.lastName}
                      </Text>
                      <View style={styles.childMeta}>
                        {child.dateOfBirth && (
                          <Text style={styles.childAge}>
                            {Math.floor((new Date() - new Date(child.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))} {t('profile.yearsOld', { defaultValue: 'years old' })}
                          </Text>
                        )}
                        {child.gender && (
                          <Text style={styles.childGender}> • {child.gender}</Text>
                        )}
                      </View>
                      {child.disabilityType && (
                        <Text style={styles.childDisability}>{child.disabilityType}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
                  </TouchableOpacity>
                ))
              )}
            </LinearGradient>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.text.white,
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  profileCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: tokens.space.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileCardGradient: {
    padding: tokens.space.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: tokens.space.md,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    backgroundColor: '#8B5CF6',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: tokens.colors.text.white,
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
    color: 'rgba(255, 255, 255, 0.7)',
  },
  roleBadge: {
    marginBottom: 16,
  },
  roleBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C4B5FD',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
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
  sectionCard: {
    borderRadius: 16,
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
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.space.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
  },
  childContent: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text.white,
    marginBottom: 4,
  },
  childMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childAge: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  childGender: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  childDisability: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
    fontStyle: 'italic',
  },
});
