import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { notificationService } from '../../services/notificationService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import TeacherBackground from '../../components/layout/TeacherBackground';
import theme from '../../styles/theme';

export function NotificationsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

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

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }) => (
    <Pressable
      style={[styles.card, !item.isRead && styles.unreadCard]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.cardRow}>
        <View style={[styles.iconContainer, !item.isRead && styles.unreadIconContainer]}>
          <Ionicons
            name={item.isRead ? 'notifications-outline' : 'notifications'}
            size={20}
            color={!item.isRead ? theme.Colors.primary : theme.Colors.text.secondary}
          />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
              {item.title || 'Notification'}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          {item.message ? (
            <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          ) : null}
          <Text style={styles.time}>{formatTimestamp(item.createdAt)}</Text>
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <TeacherBackground />
        <ScreenHeader title="Notifications" />
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TeacherBackground />
      <ScreenHeader title="Notifications" />
      {notifications.length === 0 ? (
        <EmptyState icon="notifications-outline" message="No notifications" />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadNotifications}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Colors.background.secondary,
  },
  list: {
    padding: theme.Spacing.md,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: theme.Colors.background.card,
    borderRadius: theme.BorderRadius.md,
    padding: theme.Spacing.md,
    marginBottom: theme.Spacing.sm,
    ...theme.Colors.shadow.sm,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.Colors.primary,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  unreadIconContainer: {
    backgroundColor: theme.Colors.primary + '15',
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
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.medium,
    color: theme.Colors.text.primary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: theme.Typography.weights.bold,
  },
  message: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    marginTop: 4,
  },
  time: {
    fontSize: theme.Typography.sizes.xs,
    color: theme.Colors.text.tertiary,
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.Colors.primary,
    marginLeft: theme.Spacing.sm,
  },
});
