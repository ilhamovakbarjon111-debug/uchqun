import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { changeLanguage, getCurrentLanguage, getAvailableLanguages } from '../../i18n/config';
import tokens from '../../styles/tokens';
import { api } from '../../services/api';
import { API_URL } from '../../config';

function getAvatarUrl(avatar) {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  const base = (API_URL || '').replace(/\/api\/?$/, '');
  return `${base}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
}

export function SettingsScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Profile edit modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    setCurrentLanguage(getCurrentLanguage());

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

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!profileData.firstName || !profileData.lastName) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('settings.nameRequired', { defaultValue: 'First and last name are required' }));
      return;
    }

    setProfileLoading(true);
    try {
      await api.put('/user/profile', profileData);
      if (refreshUser) await refreshUser();
      Alert.alert(t('common.success', { defaultValue: 'Success' }), t('settings.profileUpdated', { defaultValue: 'Profile updated successfully' }));
      setShowProfileModal(false);
    } catch (error) {
      const message = error.response?.data?.message || t('settings.profileUpdateFailed', { defaultValue: 'Failed to update profile' });
      Alert.alert(t('common.error', { defaultValue: 'Error' }), message);
    } finally {
      setProfileLoading(false);
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

      console.log('[Avatar Upload] Uploading avatar:', { filename, type, uri: uri.substring(0, 50) });

      const response = await api.put('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('[Avatar Upload] Success:', response.data);

      if (refreshUser) {
        await refreshUser();
      }

      Alert.alert(
        t('common.success', { defaultValue: 'Muvaffaqiyatli' }),
        t('profile.avatarUpdated', { defaultValue: 'Avatar muvaffaqiyatli yangilandi' })
      );
    } catch (error) {
      console.error('[Avatar Upload] Error:', error);
      console.error('[Avatar Upload] Error response:', error?.response?.data);
      const errorMessage = error?.response?.data?.error || error?.message || t('profile.uploadError', { defaultValue: 'Avatar yuklashda xatolik' });
      Alert.alert(
        t('common.error', { defaultValue: 'Xatolik' }),
        errorMessage
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLanguageChange = async (languageCode) => {
    await changeLanguage(languageCode);
    setCurrentLanguage(languageCode);
    Alert.alert(t('settings.languageChanged'), t('settings.languageChangedDesc'));
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutTitle', { defaultValue: 'Logout' }),
      t('profile.confirmLogout', { defaultValue: 'Are you sure you want to logout?' }),
      [
        { text: t('profile.no', { defaultValue: "No" }), style: 'cancel' },
        {
          text: t('profile.yes', { defaultValue: 'Yes' }),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: t('settings.work', { defaultValue: 'Work' }),
      items: [
        {
          icon: 'clipboard-outline',
          title: t('settings.responsibilities', { defaultValue: 'Responsibilities' }),
          subtitle: t('settings.viewResponsibilities', { defaultValue: 'View assigned duties' }),
          onPress: () => navigation.navigate('Responsibilities'),
          color: tokens.colors.semantic.success,
        },
        {
          icon: 'checkmark-done-outline',
          title: t('settings.tasks', { defaultValue: 'Tasks' }),
          subtitle: t('settings.viewTasks', { defaultValue: 'Manage your tasks' }),
          onPress: () => navigation.navigate('Tasks'),
          color: '#F59E0B',
        },
        {
          icon: 'time-outline',
          title: t('settings.workHistory', { defaultValue: 'Work History' }),
          subtitle: t('settings.viewHistory', { defaultValue: 'Employment records' }),
          onPress: () => navigation.navigate('WorkHistory'),
          color: '#8B5CF6',
        },
      ],
    },
    {
      title: t('settings.general', { defaultValue: 'General' }),
      items: [
        {
          icon: isDark ? 'moon' : 'sunny',
          title: t('settings.darkMode', { defaultValue: 'Dark Mode' }),
          subtitle: t('settings.darkModeDesc', { defaultValue: isDark ? 'Switch to light theme' : 'Switch to dark theme' }),
          onPress: toggleTheme,
          color: isDark ? '#F59E0B' : '#0EA5E9',
          hasToggle: true,
        },
        {
          icon: 'information-circle-outline',
          title: t('settings.about', { defaultValue: 'About' }),
          subtitle: 'Uchqun Platform v1.0.0',
          onPress: () => Alert.alert(t('settings.about', { defaultValue: 'About' }), 'Uchqun Platform v1.0.0\nSpecial Education School Management'),
          color: '#64748B',
        },
        {
          icon: 'log-out-outline',
          title: t('profile.logoutTitle', { defaultValue: 'Logout' }),
          subtitle: t('profile.logoutDesc', { defaultValue: 'Sign out of your account' }),
          onPress: handleLogout,
          color: '#EF4444',
          destructive: true,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Gradient background */}
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <LinearGradient
        colors={['#0EA5E9', '#06B6D4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="settings" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>{t('settings.title', { defaultValue: 'Settings' })}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Language Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="language-outline" size={18} color="#22D3EE" />
              <Text style={styles.sectionTitle}>{t('settings.language', { defaultValue: 'Language' })}</Text>
            </View>
            <View style={styles.sectionCard}>
              <LinearGradient
                colors={['rgba(51, 65, 85, 0.6)', 'rgba(30, 41, 59, 0.5)']}
                style={styles.sectionCardGradient}
              >
                {(getAvailableLanguages() || []).map((lang, index) => (
                  <Pressable
                    key={lang.code}
                    style={({ pressed }) => [
                      styles.languageItem,
                      currentLanguage === lang.code && styles.languageItemActive,
                      index === getAvailableLanguages().length - 1 && styles.lastItem,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => handleLanguageChange(lang.code)}
                  >
                    <View style={styles.languageInfo}>
                      <Text style={styles.languageName}>{lang.nativeName}</Text>
                      <Text style={styles.languageSubtitle}>{lang.name}</Text>
                    </View>
                    {currentLanguage === lang.code ? (
                      <LinearGradient
                        colors={['#0EA5E9', '#06B6D4']}
                        style={styles.checkCircle}
                      >
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </LinearGradient>
                    ) : (
                      <View style={styles.emptyCircle} />
                    )}
                  </Pressable>
                ))}
              </LinearGradient>
            </View>
          </View>

          {/* Settings Sections */}
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.sectionCard}>
                <LinearGradient
                  colors={['rgba(51, 65, 85, 0.6)', 'rgba(30, 41, 59, 0.5)']}
                  style={styles.sectionCardGradient}
                >
                  {section.items.map((item, itemIndex) => (
                    <Pressable
                      key={itemIndex}
                      style={({ pressed }) => [
                        styles.settingsItem,
                        itemIndex === section.items.length - 1 && styles.lastItem,
                        pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
                      ]}
                      onPress={item.onPress}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: `${item.color}20` }]}>
                        <Ionicons name={item.icon} size={18} color={item.color} />
                      </View>
                      <View style={styles.settingsItemContent}>
                        <Text style={[styles.settingsItemTitle, item.destructive && { color: '#FCA5A5' }]}>
                          {item.title}
                        </Text>
                        {item.subtitle && (
                          <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={tokens.colors.text.muted} />
                    </Pressable>
                  ))}
                </LinearGradient>
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProfileModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['rgba(51, 65, 85, 0.95)', 'rgba(30, 41, 59, 0.95)']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('settings.editProfile', { defaultValue: 'Edit Profile' })}</Text>
                  <TouchableOpacity onPress={() => setShowProfileModal(false)} hitSlop={10}>
                    <Ionicons name="close" size={24} color={tokens.colors.text.white} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('settings.firstName', { defaultValue: 'First Name' })}</Text>
                    <View style={styles.inputContainer}>
                      <LinearGradient
                        colors={['rgba(148, 163, 184, 0.1)', 'rgba(100, 116, 139, 0.05)']}
                        style={styles.inputGradient}
                      >
                        <TextInput
                          style={styles.textInput}
                          value={profileData.firstName}
                          onChangeText={(text) => setProfileData({ ...profileData, firstName: text })}
                          placeholder={t('settings.firstName', { defaultValue: 'First Name' })}
                          placeholderTextColor={tokens.colors.text.muted}
                        />
                      </LinearGradient>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('settings.lastName', { defaultValue: 'Last Name' })}</Text>
                    <View style={styles.inputContainer}>
                      <LinearGradient
                        colors={['rgba(148, 163, 184, 0.1)', 'rgba(100, 116, 139, 0.05)']}
                        style={styles.inputGradient}
                      >
                        <TextInput
                          style={styles.textInput}
                          value={profileData.lastName}
                          onChangeText={(text) => setProfileData({ ...profileData, lastName: text })}
                          placeholder={t('settings.lastName', { defaultValue: 'Last Name' })}
                          placeholderTextColor={tokens.colors.text.muted}
                        />
                      </LinearGradient>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('settings.phone', { defaultValue: 'Phone' })}</Text>
                    <View style={styles.inputContainer}>
                      <LinearGradient
                        colors={['rgba(148, 163, 184, 0.1)', 'rgba(100, 116, 139, 0.05)']}
                        style={styles.inputGradient}
                      >
                        <TextInput
                          style={styles.textInput}
                          value={profileData.phone}
                          onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                          placeholder="+998 XX XXX XX XX"
                          placeholderTextColor={tokens.colors.text.muted}
                          keyboardType="phone-pad"
                        />
                      </LinearGradient>
                    </View>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.saveButton,
                      pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                    ]}
                    onPress={handleProfileUpdate}
                    disabled={profileLoading}
                  >
                    <LinearGradient
                      colors={profileLoading ? ['#475569', '#334155'] : ['#0EA5E9', '#06B6D4']}
                      style={styles.saveButtonGradient}
                    >
                      {profileLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                          <Text style={styles.saveButtonText}>{t('settings.saveProfile', { defaultValue: 'Save Changes' })}</Text>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  scrollContent: {
    padding: tokens.space.lg,
    paddingBottom: tokens.space['3xl'],
  },
  profileCard: {
    borderRadius: tokens.radius.xl,
    marginBottom: tokens.space.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
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
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#334155',
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
    color: tokens.colors.text.muted,
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
    color: '#22D3EE',
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: tokens.space.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginBottom: tokens.space.md,
    paddingHorizontal: tokens.space.sm,
  },
  sectionTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.white,
    letterSpacing: -0.1,
  },
  sectionCard: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  sectionCardGradient: {
    padding: tokens.space.xs,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.space.md,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.space.xs,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  languageItemActive: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.white,
    marginBottom: 2,
  },
  languageSubtitle: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.muted,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.sm,
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.space.md,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.space.xs,
    gap: tokens.space.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.white,
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.muted,
  },
  lastItem: {
    marginBottom: 0,
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: tokens.radius['2xl'],
    borderTopRightRadius: tokens.radius['2xl'],
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalGradient: {
    padding: tokens.space.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.xl,
  },
  modalTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.white,
    letterSpacing: -0.3,
  },
  modalBody: {
    gap: tokens.space.lg,
  },
  inputGroup: {
    gap: tokens.space.sm,
  },
  inputLabel: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.white,
    letterSpacing: 0.3,
  },
  inputContainer: {
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  inputGradient: {
    padding: tokens.space.md,
  },
  textInput: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.white,
    padding: 0,
  },
  saveButton: {
    marginTop: tokens.space.md,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    ...tokens.shadow.glow,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.space.lg,
    gap: tokens.space.sm,
  },
  saveButtonText: {
    fontSize: tokens.type.button.fontSize,
    fontWeight: tokens.type.button.fontWeight,
    color: tokens.colors.text.white,
    letterSpacing: tokens.type.button.letterSpacing,
  },
});
