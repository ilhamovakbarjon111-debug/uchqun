import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotification } from '../../context/NotificationContext';
import tokens from '../../styles/tokens';

/**
 * DashboardHeader - Header component for Parent Dashboard
 * Includes title and notifications
 */
export function DashboardHeader() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { count = 0, refreshNotifications } = useNotification();

  return (
    <View style={[styles.container, { paddingTop: insets.top + tokens.space.md }]}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {t('dashboard.title', { defaultValue: 'Dashboard' })}
          </Text>
        </View>

        <Pressable
          style={styles.notificationButton}
          onPress={() => {
            if (refreshNotifications) refreshNotifications();
            navigation.navigate('Notifications');
          }}
        >
          <Ionicons name="notifications-outline" size={24} color={tokens.colors.text.primary} />
          {count > 0 && (
            <View style={styles.notificationBadge}>
              <View style={styles.badgeDot} />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.background.primary,
    paddingBottom: tokens.space.md,
    paddingHorizontal: tokens.space.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
    ...tokens.shadow.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: tokens.type.h1.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.primary,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.semantic.warning,
  },
  badgeDot: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: tokens.colors.semantic.warning,
  },
});
