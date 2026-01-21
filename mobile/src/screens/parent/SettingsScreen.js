import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
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

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Get parent navigator to access stack screens
  const parentNavigation = navigation.getParent();

  useEffect(() => {
    setCurrentLanguage(getCurrentLanguage());
  }, []);

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
      if (parentNavigation) {
        parentNavigation.navigate(screenName);
      } else {
        console.warn(`Cannot navigate to ${screenName}: Parent navigator not found`);
        // Fallback: try direct navigation
        navigation.navigate(screenName);
      }
    } catch (error) {
      console.error(`Navigation error to ${screenName}:`, error);
    }
  };

  const settingsItems = [
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
});
