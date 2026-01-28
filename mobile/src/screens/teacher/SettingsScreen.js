import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { changeLanguage, getCurrentLanguage, getAvailableLanguages } from '../../i18n/config';
import Card from '../../components/common/Card';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import TeacherBackground from '../../components/layout/TeacherBackground';
import theme from '../../styles/theme';
import { api } from '../../services/api';
import { teacherService } from '../../services/teacherService';

export function SettingsScreen() {
  const { user, logout, refreshUser } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');


  // Profile edit modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

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

  // Helper for safe navigation
  const safeNavigate = (screenName, params = {}) => {
    try {
      navigation.navigate(screenName, params);
    } catch (error) {
      console.error(`[TeacherSettings] Navigation error to ${screenName}:`, error);
    }
  };

  const settingsItems = [
    {
      icon: 'person-outline',
      title: t('settings.editProfile', { defaultValue: 'Edit Profile' }),
      onPress: () => setShowProfileModal(true),
    },
    {
      icon: 'list-outline',
      title: 'Responsibilities',
      onPress: () => safeNavigate('Responsibilities'),
    },
    {
      icon: 'checkmark-circle-outline',
      title: 'Tasks',
      onPress: () => safeNavigate('Tasks'),
    },
    {
      icon: 'time-outline',
      title: 'Work History',
      onPress: () => safeNavigate('WorkHistory'),
    },
    {
      icon: 'mail-outline',
      title: 'Contact Admin',
      onPress: () => setShowMessageModal(true),
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

  return (
    <View style={styles.container}>
      <TeacherBackground />
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.firstName ?? '—'} {user?.lastName ?? ''}
              </Text>
              <Text style={styles.userEmail}>{user?.email ?? '—'}</Text>
              <View style={styles.roleBadge}>
                <Ionicons name="school" size={14} color={theme.Colors.primary.blue} />
                <Text style={styles.roleText}>Teacher</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          {getAvailableLanguages().map((lang) => (
            <Pressable
              key={lang.code}
              style={[
                styles.languageItem,
                currentLanguage === lang.code && styles.languageItemActive,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageName}>{lang.nativeName}</Text>
                <Text style={styles.languageSubtitle}>{lang.name}</Text>
              </View>
              {currentLanguage === lang.code && (
                <Ionicons name="checkmark-circle" size={24} color={theme.Colors.primary.blue} />
              )}
            </Pressable>
          ))}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          {settingsItems.map((item, index) => (
            <Pressable
              key={index}
              style={styles.settingsItem}
              onPress={item.onPress}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.destructive ? theme.Colors.status.error : theme.Colors.text.secondary}
                />
                <Text
                  style={[
                    styles.settingsItemText,
                    item.destructive && styles.settingsItemTextDestructive,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.Colors.text.tertiary}
              />
            </Pressable>
          ))}
        </Card>
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
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.editProfile', { defaultValue: 'Edit Profile' })}</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <Ionicons name="close" size={24} color={theme.Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('settings.firstName', { defaultValue: 'First Name' })}</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.firstName}
                onChangeText={(text) => setProfileData({ ...profileData, firstName: text })}
                placeholder="First Name"
                placeholderTextColor={theme.Colors.text.tertiary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('settings.lastName', { defaultValue: 'Last Name' })}</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.lastName}
                onChangeText={(text) => setProfileData({ ...profileData, lastName: text })}
                placeholder="Last Name"
                placeholderTextColor={theme.Colors.text.tertiary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('settings.phone', { defaultValue: 'Phone' })}</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.phone}
                onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                placeholder="+998 XX XXX XX XX"
                placeholderTextColor={theme.Colors.text.tertiary}
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
        </KeyboardAvoidingView>
      </Modal>

      {/* Contact Admin Modal */}
      <Modal
        visible={showMessageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMessageModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Contact Admin</Text>
                <TouchableOpacity onPress={() => setShowMessageModal(false)}>
                  <Ionicons name="close" size={24} color={theme.Colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.textInput}
                  value={messageSubject}
                  onChangeText={setMessageSubject}
                  placeholder="Subject"
                  placeholderTextColor={theme.Colors.text.tertiary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  style={[styles.textInput, { height: 120, textAlignVertical: 'top' }]}
                  value={messageText}
                  onChangeText={setMessageText}
                  placeholder="Write your message..."
                  placeholderTextColor={theme.Colors.text.tertiary}
                  multiline
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, sendingMessage && styles.saveButtonDisabled]}
                onPress={async () => {
                  if (!messageSubject.trim() || !messageText.trim()) {
                    Alert.alert('Error', 'Subject and message are required.');
                    return;
                  }
                  setSendingMessage(true);
                  try {
                    await teacherService.sendMessage({ subject: messageSubject, message: messageText });
                    Alert.alert('Success', 'Message sent successfully.');
                    setShowMessageModal(false);
                    setMessageSubject('');
                    setMessageText('');
                  } catch (error) {
                    Alert.alert('Error', 'Failed to send message.');
                  } finally {
                    setSendingMessage(false);
                  }
                }}
                disabled={sendingMessage}
              >
                {sendingMessage ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Send</Text>
                )}
              </TouchableOpacity>
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
    backgroundColor: theme.Colors.background.secondary,
  },
  content: {
    padding: theme.Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.Colors.primary.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  avatarText: {
    fontSize: theme.Typography.sizes['2xl'],
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.primary.blue,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs / 2,
  },
  userEmail: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    marginBottom: theme.Spacing.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.Colors.primary.blueBg,
    paddingHorizontal: theme.Spacing.sm,
    paddingVertical: theme.Spacing.xs / 2,
    borderRadius: theme.BorderRadius.sm,
  },
  roleText: {
    fontSize: theme.Typography.sizes.xs,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.primary.blue,
    marginLeft: theme.Spacing.xs / 2,
  },
  sectionTitle: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.md,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.Colors.border.light,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemText: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    marginLeft: theme.Spacing.md,
    fontWeight: theme.Typography.weights.medium,
  },
  settingsItemTextDestructive: {
    color: theme.Colors.status.error,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.Spacing.md,
    paddingHorizontal: theme.Spacing.sm,
    borderRadius: theme.BorderRadius.md,
    marginBottom: theme.Spacing.xs,
  },
  languageItemActive: {
    backgroundColor: theme.Colors.primary.blueBg,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs / 2,
  },
  languageSubtitle: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.normal,
    color: theme.Colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.Colors.background.primary,
    borderTopLeftRadius: theme.BorderRadius.xl,
    borderTopRightRadius: theme.BorderRadius.xl,
    padding: theme.Spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.Spacing.lg,
  },
  modalTitle: {
    fontSize: theme.Typography.sizes.xl,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
  },
  inputContainer: {
    marginBottom: theme.Spacing.md,
  },
  inputLabel: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.medium,
    color: theme.Colors.text.secondary,
    marginBottom: theme.Spacing.xs,
  },
  textInput: {
    backgroundColor: theme.Colors.background.secondary,
    borderRadius: theme.BorderRadius.md,
    padding: theme.Spacing.md,
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    borderWidth: 1,
    borderColor: theme.Colors.border.light,
  },
  disabledInput: {
    backgroundColor: theme.Colors.background.tertiary || '#f0f0f0',
    color: theme.Colors.text.tertiary,
  },
  helperText: {
    fontSize: theme.Typography.sizes.xs,
    color: theme.Colors.text.tertiary,
    marginTop: theme.Spacing.xs / 2,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.Colors.background.secondary,
    borderRadius: theme.BorderRadius.md,
    paddingHorizontal: theme.Spacing.md,
    borderWidth: 1,
    borderColor: theme.Colors.border.light,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: theme.Spacing.md,
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
  },
  saveButton: {
    backgroundColor: theme.Colors.primary.blue,
    borderRadius: theme.BorderRadius.md,
    padding: theme.Spacing.md,
    alignItems: 'center',
    marginTop: theme.Spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.bold,
  },
});
