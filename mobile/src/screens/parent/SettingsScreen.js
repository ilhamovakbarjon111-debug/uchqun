import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { changeLanguage, getCurrentLanguage, getAvailableLanguages } from '../../i18n/config';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';
import ListRow from '../../components/common/ListRow';
import Pill from '../../components/common/Pill';
import api from '../../services/api';

export function SettingsScreen() {
  const { user, logout, refreshUser } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Get parent navigator to access stack screens
  const parentNavigation = navigation?.getParent?.();

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile edit modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
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
      });
    }
  }, [user]);

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('settings.fillAllFields', { defaultValue: 'Please fill all fields' }));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('settings.passwordMismatch', { defaultValue: 'Passwords do not match' }));
      return;
    }
    if (passwordData.newPassword.length < 6) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('settings.passwordTooShort', { defaultValue: 'Password must be at least 6 characters' }));
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      Alert.alert(t('common.success', { defaultValue: 'Success' }), t('settings.passwordChanged', { defaultValue: 'Password changed successfully' }));
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const message = error.response?.data?.message || t('settings.passwordChangeFailed', { defaultValue: 'Failed to change password' });
      Alert.alert(t('common.error', { defaultValue: 'Error' }), message);
    } finally {
      setPasswordLoading(false);
    }
  };

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

  const handleLanguageChange = async (languageCode) => {
    await changeLanguage(languageCode);
    setCurrentLanguage(languageCode);
    Alert.alert(t('settings.languageChanged'), t('settings.languageChangedDesc'));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
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
      icon: 'key-outline',
      title: t('settings.changePassword', { defaultValue: 'Change Password' }),
      onPress: () => setShowPasswordModal(true),
    },
    {
      icon: 'chatbubble-ellipses-outline',
      title: 'AI Assistant',
      onPress: () => {
        // AIChat is a tab, so we can navigate directly
        try {
          navigation.navigate('AIChat');
        } catch (error) {
          console.error('Navigation error to AIChat:', error);
        }
      },
    },
    {
      icon: 'star-outline',
      title: 'Rate Teacher',
      onPress: () => navigateToStackScreen('TeacherRating'),
    },
    {
      icon: 'school-outline',
      title: 'Rate School',
      onPress: () => navigateToStackScreen('SchoolRating'),
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      onPress: () => Alert.alert('About', 'Uchqun Platform v1.0.0'),
    },
    {
      icon: 'log-out-outline',
      title: 'Logout',
      onPress: handleLogout,
      destructive: true,
    },
  ];

  const header = (
    <View style={styles.topBar}>
      <View style={styles.placeholder} />
      <Text style={styles.topBarTitle} allowFontScaling={true}>Settings</Text>
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <Screen scroll={true} padded={true} header={header}>
        {/* User Info Card */}
        <Card style={styles.card}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0) || ''}{user?.lastName?.charAt(0) || ''}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName} allowFontScaling={true}>
                {user?.firstName ?? '—'} {user?.lastName ?? ''}
              </Text>
              <Text style={styles.userEmail} allowFontScaling={true}>{user?.email ?? '—'}</Text>
              <Pill style={styles.roleBadge}>
                <Ionicons name="people" size={14} color={tokens.colors.accent.blue} />
                <Text style={styles.roleText} allowFontScaling={true}>Parent</Text>
              </Pill>
            </View>
          </View>
        </Card>

        {/* Language Selector Card */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle} allowFontScaling={true}>{t('settings.language')}</Text>
          {(getAvailableLanguages() || []).map((lang) => (
            <Pressable
              key={lang.code}
              style={[
                styles.languageItem,
                currentLanguage === lang.code && styles.languageItemActive,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageName} allowFontScaling={true}>{lang.nativeName}</Text>
                <Text style={styles.languageSubtitle} allowFontScaling={true}>{lang.name}</Text>
              </View>
              {currentLanguage === lang.code && (
                <Ionicons name="checkmark-circle" size={24} color={tokens.colors.accent.blue} />
              )}
            </Pressable>
          ))}
        </Card>

        {/* Settings Items Card */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle} allowFontScaling={true}>{t('settings.account')}</Text>
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

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.changePassword', { defaultValue: 'Change Password' })}</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color={tokens.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('settings.currentPassword', { defaultValue: 'Current Password' })}</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordData.currentPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                  secureTextEntry={!showCurrentPassword}
                  placeholder="••••••••"
                  placeholderTextColor={tokens.colors.text.tertiary}
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Ionicons name={showCurrentPassword ? 'eye-off' : 'eye'} size={20} color={tokens.colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('settings.newPassword', { defaultValue: 'New Password' })}</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                  secureTextEntry={!showNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor={tokens.colors.text.tertiary}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={20} color={tokens.colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('settings.confirmPassword', { defaultValue: 'Confirm Password' })}</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={tokens.colors.text.tertiary}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={tokens.colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, passwordLoading && styles.saveButtonDisabled]}
              onPress={handlePasswordChange}
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>{t('settings.save', { defaultValue: 'Save' })}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProfileModal(false)}
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
                placeholder="First Name"
                placeholderTextColor={tokens.colors.text.tertiary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('settings.lastName', { defaultValue: 'Last Name' })}</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.lastName}
                onChangeText={(text) => setProfileData({ ...profileData, lastName: text })}
                placeholder="Last Name"
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
                <Text style={styles.saveButtonText}>{t('settings.save', { defaultValue: 'Save' })}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.md,
    paddingBottom: tokens.space.md,
    backgroundColor: 'transparent',
  },
  placeholder: {
    width: 44,
  },
  topBarTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.primary,
  },
  card: {
    marginBottom: tokens.space.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: tokens.radius.pill,
    backgroundColor: `${tokens.colors.accent.blue}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
  },
  avatarText: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.accent.blue,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs / 2,
  },
  userEmail: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.sub.fontWeight,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.space.sm,
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
    paddingHorizontal: tokens.space.sm,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.space.xs,
  },
  languageItemActive: {
    backgroundColor: `${tokens.colors.accent.blue}10`,
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
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.space.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: tokens.space.md,
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
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
  },
});
