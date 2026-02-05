import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { notificationService } from '../../services/notificationService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/teacher/ScreenHeader';
import { GlassCard } from '../../components/teacher/GlassCard';
import tokens from '../../styles/tokens';

export function NotificationsScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Bottom nav height + safe area + padding
  const BOTTOM_NAV_HEIGHT = 75;
  const bottomPadding = BOTTOM_NAV_HEIGHT + insets.bottom + 16;

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getNotifications();
      setNotifications(Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []));
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('notifications.justNow', { defaultValue: 'Just now' });
    if (diffMins < 60) return t('notifications.minutesAgo', { defaultValue: '{{count}}m ago', count: diffMins });
    if (diffHours < 24) return t('notifications.hoursAgo', { defaultValue: '{{count}}h ago', count: diffHours });
    if (diffDays < 7) return t('notifications.daysAgo', { defaultValue: '{{count}}d ago', count: diffDays });
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }) => (
    <Pressable
      onPress={() => markAsRead(item.id)}
    >
      <GlassCard style={[styles.card, !item.isRead && styles.unreadCard]}>
        <View style={styles.cardRow}>
          <View style={[styles.iconContainer, !item.isRead && styles.unreadIconContainer]}>
            <Ionicons
              name={item.isRead ? 'notifications-outline' : 'notifications'}
              size={20}
              color={!item.isRead ? tokens.colors.accent.blue : tokens.colors.text.secondary}
            />
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
                {item.title || t('notifications.notification', { defaultValue: 'Notification' })}
              </Text>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            {item.message ? (
              <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            ) : null}
            <Text style={styles.time}>{formatTimestamp(item.createdAt)}</Text>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title={t('notifications.title', { defaultValue: 'Notifications' })} showBack={false} />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={t('notifications.title', { defaultValue: 'Notifications' })} showBack={false} />
      {notifications.length === 0 ? (
        <EmptyState icon="notifications-outline" message={t('notifications.noNotifications', { defaultValue: 'No notifications' })} />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
          refreshing={loading}
          onRefresh={loadNotifications}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  list: {
    padding: tokens.space.lg,
  },
  card: {
    marginBottom: tokens.space.md,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: tokens.colors.accent.blue,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
  },
  unreadIconContainer: {
    backgroundColor: tokens.colors.accent.blue + '15',
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.primary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: tokens.typography.fontWeight.bold,
  },
  message: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    marginTop: 4,
  },
  time: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.tertiary,
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.accent.blue,
    marginLeft: tokens.space.sm,
  },
});
