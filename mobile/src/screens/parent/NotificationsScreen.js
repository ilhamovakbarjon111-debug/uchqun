import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { notificationService } from '../../services/notificationService';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';
import ListRow from '../../components/common/ListRow';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

// Animated notification card component
function AnimatedNotificationCard({ item, index, markAsRead, onDelete }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80, // Stagger by 80ms
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Card
        style={[
          styles.card,
          !item.isRead && styles.unreadCard
        ]}
      >
        <Pressable onPress={() => markAsRead(item.id)}>
          <ListRow
            icon={item.isRead ? 'notifications-outline' : 'notifications'}
            iconColor={!item.isRead ? tokens.colors.accent.blue : tokens.colors.text.muted}
            title={item.title || 'Notification'}
            subtitle={item.message}
            time={formatTimestamp(item.createdAt)}
            chevron={false}
          />
          {!item.isRead && (
            <View style={styles.unreadBadge}>
              <View style={styles.unreadDot} />
            </View>
          )}
        </Pressable>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color={tokens.colors.text.muted} />
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );
}

export function NotificationsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

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

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotification(id);
              loadNotifications();
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          },
        },
      ]
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  const filters = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'read', label: 'Read', count: readCount },
  ];

  const header = (
    <View style={styles.topBar}>
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={24} color={tokens.colors.text.primary} />
      </Pressable>
      <Text style={styles.topBarTitle} allowFontScaling={true}>Notifications</Text>
      {unreadCount > 0 ? (
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllAsRead}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="checkmark-done-outline" size={22} color={tokens.colors.accent.blue} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );

  return (
    <Screen scroll={true} padded={true} header={header}>
        {/* Filter Tabs */}
        {!loading && notifications.length > 0 && (
          <View style={styles.filterRow}>
            {filters.map((f) => (
              <Pressable
                key={f.key}
                style={[
                  styles.filterPill,
                  filter === f.key && styles.filterPillActive,
                ]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
                  {f.label}
                </Text>
                <View style={[styles.filterCount, filter === f.key && styles.filterCountActive]}>
                  <Text style={[styles.filterCountText, filter === f.key && styles.filterCountTextActive]}>
                    {f.count}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {loading ? (
          <>
            <Card style={styles.card}>
              <Skeleton width="100%" height={80} />
            </Card>
            <Card style={styles.card}>
              <Skeleton width="100%" height={80} />
            </Card>
          </>
        ) : filteredNotifications.length === 0 ? (
          <Card style={styles.emptyCard}>
            <EmptyState
              icon="notifications-outline"
              title={filter !== 'all' ? `No ${filter} notifications` : 'No notifications'}
              description={filter !== 'all' ? 'Try a different filter' : "You're all caught up!"}
            />
          </Card>
        ) : (
          <View style={styles.list}>
            {filteredNotifications.map((item, index) => (
              <AnimatedNotificationCard
                key={item.id?.toString() || Math.random()}
                item={item}
                index={index}
                markAsRead={markAsRead}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}
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
  backButton: {
    padding: tokens.space.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.primary,
  },
  placeholder: {
    width: 44,
  },
  markAllButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: tokens.space.sm,
    marginBottom: tokens.space.lg,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
    backgroundColor: tokens.colors.card.base,
    borderRadius: tokens.radius.pill,
    gap: tokens.space.xs,
    borderWidth: 2,
    borderColor: tokens.colors.border.light,
  },
  filterPillActive: {
    backgroundColor: tokens.colors.accent.blue,
    borderColor: tokens.colors.accent.blue,
  },
  filterLabel: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.secondary,
  },
  filterLabelActive: {
    color: '#fff',
  },
  filterCount: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterCountActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: tokens.colors.text.muted,
  },
  filterCountTextActive: {
    color: '#fff',
  },
  list: {
    gap: tokens.space.md,
  },
  card: {
    marginBottom: tokens.space.sm,
    position: 'relative',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: tokens.colors.accent.blue,
  },
  emptyCard: {
    marginTop: tokens.space.xl,
  },
  unreadBadge: {
    position: 'absolute',
    top: tokens.space.md,
    right: tokens.space.md,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.accent.blue,
  },
  deleteButton: {
    position: 'absolute',
    bottom: tokens.space.md,
    right: tokens.space.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
