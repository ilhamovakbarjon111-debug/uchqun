import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert, Modal, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { changeLanguage, getCurrentLanguage, getAvailableLanguages } from '../../i18n/config';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';
import ListRow from '../../components/common/ListRow';
import Pill from '../../components/common/Pill';
import { api } from '../../services/api';

export function SettingsScreen() {
  const { user, logout, refreshUser } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Get parent navigator to access stack screens
  const parentNavigation = navigation?.getParent?.();


  // Profile edit modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    notificationPreferences: {
      email: true,
      push: true,
    },
  });
  const [profileLoading, setProfileLoading] = useState(false);
  

  useEffect(() => {
    setCurrentLanguage(getCurrentLanguage());
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        notificationPreferences: user.notificationPreferences || {
          email: true,
          push: true,
        },
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
      await api.put('/user/profile', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        notificationPreferences: profileData.notificationPreferences,
      });
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


  const handleLanguageChange = async (languageCode) => {
    await changeLanguage(languageCode);
    setCurrentLanguage(languageCode);
    Alert.alert(t('settings.languageChanged'), t('settings.languageChangedDesc'));
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutTitle', { defaultValue: 'Chiqish' }),
      t('profile.confirmLogout', { defaultValue: 'Chiqishni xohlaysizmi?' }),
      [
        { text: t('profile.no', { defaultValue: "Yo'q" }), style: 'cancel' },
        {
          text: t('profile.yes', { defaultValue: 'Ha' }),
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

  // Helper function to navigate to stack screens safely
  const navigateToStackScreen = (screenName) => {
    try {
      if (!screenName) {
        console.error('[SettingsScreen] Invalid screenName');
        return;
      }
      if (parentNavigation) {
        parentNavigation.navigate(screenName);
      } else {
        console.warn(`Cannot navigate to ${screenName}: Parent navigator not found`);
        // Fallback: try direct navigation
        if (navigation?.navigate) {
          navigation.navigate(screenName);
        }
      }
    } catch (error) {
      console.error(`Navigation error to ${screenName}:`, error);
    }
  };

  const settingsItems = [
    {
      icon: 'person-outline',
      title: t('settings.editProfile', { defaultValue: 'Edit Profile' }),
      onPress: () => setShowProfileModal(true),
    },
    {
      icon: 'help-circle-outline',
      title: t('help.title', { defaultValue: 'Help & Support' }),
      onPress: () => navigateToStackScreen('Help'),
    },
    {
      icon: 'star-outline',
      title: t('ratingPage.title', { defaultValue: "O'qituvchini baholash" }),
      onPress: () => navigateToStackScreen('TeacherRating'),
    },
    {
      icon: 'school-outline',
      title: t('schoolRatingPage.title', { defaultValue: 'Maktabni baholash' }),
      onPress: () => navigateToStackScreen('SchoolRating'),
    },
    {
      icon: 'information-circle-outline',
      title: t('settings.about', { defaultValue: 'Haqida' }),
      onPress: () => Alert.alert(t('settings.about', { defaultValue: 'Haqida' }), 'Uchqun Platform v1.0.0'),
    },
    {
      icon: 'log-out-outline',
      title: t('profile.logoutTitle', { defaultValue: 'Chiqish' }),
      onPress: handleLogout,
      destructive: true,
    },
  ];

  const header = (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[tokens.colors.accent.blue, tokens.colors.accent.blueVibrant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.placeholder} />
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="settings" size={24} color="#fff" />
          </View>
          <Text style={styles.topBarTitle} allowFontScaling={true}>{t('settings.title', { defaultValue: 'Sozlamalar' })}</Text>
        </View>
        <View style={styles.placeholder} />
      </LinearGradient>
    </View>
  );

  return (
    <Screen scroll={true} padded={true} header={header}>
        {/* User Info Card - Enhanced */}
        <Card style={styles.card} variant="elevated" shadow="soft">
          <View style={styles.userInfo}>
            <LinearGradient
              colors={[tokens.colors.accent.blue + '30', tokens.colors.accent.blue + '15']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0) || ''}{user?.lastName?.charAt(0) || ''}
              </Text>
            </LinearGradient>
            <View style={styles.userDetails}>
              <Text style={styles.userName} allowFontScaling={true}>
                {user?.firstName ?? '—'} {user?.lastName ?? ''}
              </Text>
              <View style={styles.emailContainer}>
                <Ionicons name="mail-outline" size={14} color={tokens.colors.text.secondary} />
                <Text style={styles.userEmail} allowFontScaling={true}>{user?.email ?? '—'}</Text>
              </View>
              <Pill style={styles.roleBadge}>
                <Ionicons name="people" size={14} color={tokens.colors.accent.blue} />
                <Text style={styles.roleText} allowFontScaling={true}>{t('dashboard.roleParent')}</Text>
              </Pill>
            </View>
          </View>
        </Card>

        {/* Language Selector Card - Enhanced */}
        <Card style={styles.card} variant="elevated" shadow="soft">
          <Text style={styles.sectionTitle} allowFontScaling={true}>{t('settings.language')}</Text>
          {(getAvailableLanguages() || []).map((lang) => (
            <Pressable
              key={lang.code}
              style={({ pressed }) => [
                styles.languageItem,
                currentLanguage === lang.code && styles.languageItemActive,
                pressed && styles.languageItemPressed,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageName} allowFontScaling={true}>{lang.nativeName}</Text>
                <Text style={styles.languageSubtitle} allowFontScaling={true}>{lang.name}</Text>
              </View>
              {currentLanguage === lang.code && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={24} color={tokens.colors.accent.blue} />
                </View>
              )}
            </Pressable>
          ))}
        </Card>

        {/* Notification Preferences Card */}
        <Card style={styles.card} variant="elevated" shadow="soft">
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={24} color={tokens.colors.accent.blue} />
            <Text style={styles.sectionTitle} allowFontScaling={true}>{t('settings.notifications', { defaultValue: 'Notifications' })}</Text>
          </View>
          
          <Pressable
            style={styles.notificationItem}
            onPress={() => setProfileData({
              ...profileData,
              notificationPreferences: {
                ...profileData.notificationPreferences,
                email: !profileData.notificationPreferences.email,
              },
            })}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle} allowFontScaling={true}>
                {t('settings.emailNotifications', { defaultValue: 'Email Notifications' })}
              </Text>
              <Text style={styles.notificationDesc} allowFontScaling={true}>
                {t('settings.emailNotificationsDesc', { defaultValue: 'Receive updates via email' })}
              </Text>
            </View>
            <View style={[
              styles.checkbox,
              profileData.notificationPreferences.email && styles.checkboxActive
            ]}>
              {profileData.notificationPreferences.email && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          </Pressable>

          <Pressable
            style={styles.notificationItem}
            onPress={() => setProfileData({
              ...profileData,
              notificationPreferences: {
                ...profileData.notificationPreferences,
                push: !profileData.notificationPreferences.push,
              },
            })}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle} allowFontScaling={true}>
                {t('settings.pushNotifications', { defaultValue: 'Push Notifications' })}
              </Text>
              <Text style={styles.notificationDesc} allowFontScaling={true}>
                {t('settings.pushNotificationsDesc', { defaultValue: 'Receive push notifications' })}
              </Text>
            </View>
            <View style={[
              styles.checkbox,
              profileData.notificationPreferences.push && styles.checkboxActive
            ]}>
              {profileData.notificationPreferences.push && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          </Pressable>

          <Pressable
            style={styles.savePreferencesButton}
            onPress={handleProfileUpdate}
            disabled={profileLoading}
          >
            {profileLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.savePreferencesText} allowFontScaling={true}>
                  {t('settings.savePreferences', { defaultValue: 'Save Preferences' })}
                </Text>
              </>
            )}
          </Pressable>
        </Card>

        {/* Settings Items Card - Enhanced */}
        <Card style={styles.card} variant="elevated" shadow="soft">
          <Text style={styles.sectionTitle} allowFontScaling={true}>{t('settings.account', { defaultValue: 'Account' })}</Text>
          {settingsItems.map((item, index) => (
            <ListRow
              key={index}
              icon={item.icon}
              iconColor={item.destructive ? tokens.colors.semantic.error : tokens.colors.accent.blue}
              title={item.title}
              onPress={item.onPress}
              style={[
                styles.settingsItem,
                index === settingsItems.length - 1 && styles.lastItem,
              ]}
            />
          ))}
        </Card>


      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProfileModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.editProfile', { defaultValue: 'Edit Profile' })}</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <Ionicons name="close" size={24} color={tokens.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('settings.firstName', { defaultValue: 'First Name' })}</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.firstName}
                onChangeText={(text) => setProfileData({ ...profileData, firstName: text })}
                placeholder={t('settings.firstName', { defaultValue: 'First Name' })}
                placeholderTextColor={tokens.colors.text.tertiary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('settings.lastName', { defaultValue: 'Last Name' })}</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.lastName}
                onChangeText={(text) => setProfileData({ ...profileData, lastName: text })}
                placeholder={t('settings.lastName', { defaultValue: 'Last Name' })}
                placeholderTextColor={tokens.colors.text.tertiary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('settings.phone', { defaultValue: 'Phone' })}</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.phone}
                onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                placeholder="+998 XX XXX XX XX"
                placeholderTextColor={tokens.colors.text.tertiary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('settings.email', { defaultValue: 'Email' })}</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={user?.email || ''}
                editable={false}
              />
              <Text style={styles.helperText}>{t('settings.emailReadOnly', { defaultValue: 'Email cannot be changed' })}</Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, profileLoading && styles.saveButtonDisabled]}
              onPress={handleProfileUpdate}
              disabled={profileLoading}
            >
              {profileLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>{t('settings.saveProfile', { defaultValue: 'Save Profile' })}</Text>
                </>
              )}
            </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    overflow: 'hidden',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.md,
    paddingTop: tokens.space.xl,
    paddingBottom: tokens.space.lg,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space.md,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 44,
  },
  topBarTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: '#fff',
  },
  card: {
    marginBottom: tokens.space.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
    ...tokens.shadow.soft,
  },
  avatarText: {
    fontSize: tokens.type.h1.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.accent.blue,
  },
  userDetails: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
    marginBottom: tokens.space.sm,
  },
  userEmail: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.sub.fontWeight,
    color: tokens.colors.text.secondary,
    flex: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: tokens.space.xs,
    backgroundColor: `${tokens.colors.accent.blue}15`,
  },
  roleText: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.sub.fontWeight,
    color: tokens.colors.accent.blue,
  },
  sectionTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.md,
  },
  settingsItem: {
    marginBottom: 0,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: tokens.space.md,
    paddingHorizontal: tokens.space.md,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.space.sm,
    borderWidth: 2,
    borderColor: tokens.colors.border.light,
  },
  languageItemActive: {
    backgroundColor: tokens.colors.accent[50],
    borderColor: tokens.colors.accent.blue,
  },
  languageItemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  checkmarkContainer: {
    paddingLeft: tokens.space.sm,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs / 2,
  },
  languageSubtitle: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.sub.fontWeight,
    color: tokens.colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: tokens.colors.surface.card,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    padding: tokens.space.xl,
    maxHeight: '80%',
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
    color: tokens.colors.text.primary,
  },
  inputContainer: {
    marginBottom: tokens.space.md,
  },
  inputLabel: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.space.xs,
  },
  textInput: {
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.radius.md,
    padding: tokens.space.md,
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  disabledInput: {
    backgroundColor: tokens.colors.surface.tertiary || '#f0f0f0',
    color: tokens.colors.text.tertiary,
  },
  helperText: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.tertiary,
    marginTop: tokens.space.xs / 2,
  },
  saveButton: {
    backgroundColor: tokens.colors.accent.blue,
    borderRadius: tokens.radius.md,
    padding: tokens.space.md,
    alignItems: 'center',
    marginTop: tokens.space.md,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    marginLeft: tokens.space.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginBottom: tokens.space.md,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: tokens.space.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  notificationContent: {
    flex: 1,
    marginRight: tokens.space.md,
  },
  notificationTitle: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs / 2,
  },
  notificationDesc: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: tokens.colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: tokens.colors.accent.blue,
    borderColor: tokens.colors.accent.blue,
  },
  savePreferencesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.accent.blue,
    borderRadius: tokens.radius.md,
    padding: tokens.space.md,
    marginTop: tokens.space.md,
    gap: tokens.space.sm,
  },
  savePreferencesText: {
    color: '#fff',
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: tokens.space.md,
    padding: tokens.space.xs,
  },
});
