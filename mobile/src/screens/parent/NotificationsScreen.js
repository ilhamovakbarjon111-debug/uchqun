import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../../services/notificationService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

export function NotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getNotifications();
      // Service now returns { data, unreadCount, total }
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (notifications.length === 0) {
    return <EmptyState message="No notifications" />;
  }

  const renderNotification = ({ item }) => (
    <Pressable onPress={() => markAsRead(item.id)}>
      <Card style={!item.isRead ? styles.unreadCard : null}>
        <View style={styles.notificationHeader}>
          <View style={[styles.notificationIcon, !item.isRead && styles.unreadIcon]}>
            <Ionicons 
              name={item.isRead ? 'notifications-outline' : 'notifications'} 
              size={20} 
              color={!item.isRead ? theme.Colors.primary.blue : theme.Colors.text.secondary} 
            />
          </View>
          <View style={styles.notificationContent}>
            <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
              {item.title || 'Notification'}
            </Text>
            {item.message && <Text style={styles.message}>{item.message}</Text>}
            {item.createdAt && (
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={12} color={theme.Colors.text.tertiary} />
                <Text style={styles.time}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <View style={styles.container}>
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
  },
  unreadCard: {
    backgroundColor: theme.Colors.primary.blueBg,
    borderLeftWidth: 4,
    borderLeftColor: theme.Colors.primary.blue,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  unreadIcon: {
    backgroundColor: theme.Colors.primary.blueBg,
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs,
  },
  unreadTitle: {
    fontWeight: theme.Typography.weights.bold,
  },
  message: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    marginBottom: theme.Spacing.sm,
    lineHeight: 18,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: theme.Typography.sizes.xs,
    color: theme.Colors.text.tertiary,
    marginLeft: theme.Spacing.xs / 2,
  },
});
