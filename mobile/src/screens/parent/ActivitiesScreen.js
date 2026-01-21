import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { parentService } from '../../services/parentService';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

// Activity type to emoji mapping
const ACTIVITY_EMOJIS = {
  art: '🎨',
  music: '🎵',
  sports: '⚽',
  reading: '📚',
  writing: '✏️',
  math: '🔢',
  science: '🔬',
  language: '🗣️',
  social: '🤝',
  motor: '🏃',
  cognitive: '🧠',
  therapy: '💆',
  sensory: '👐',
  default: '🎯',
};

// Get emoji based on activity type or title
const getActivityEmoji = (activity) => {
  const type = (activity.type || activity.category || '').toLowerCase();
  const title = (activity.title || activity.skill || '').toLowerCase();

  for (const [key, emoji] of Object.entries(ACTIVITY_EMOJIS)) {
    if (type.includes(key) || title.includes(key)) {
      return emoji;
    }
  }
  return ACTIVITY_EMOJIS.default;
};

// Animated progress bar component
function AnimatedProgress({ progress, delay = 0 }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: Math.min(progress || 0, 100),
      duration: 800,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      >
        <LinearGradient
          colors={['#10B981', '#34D399']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export function ActivitiesScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await parentService.getActivities();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Bugun';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Kecha';
    }
    return date.toLocaleDateString('uz-UZ', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisWeek = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo && date <= today;
  };

  const filteredActivities = activities.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'today') return isToday(a.date || a.createdAt);
    if (filter === 'week') return isThisWeek(a.date || a.createdAt);
    return true;
  });

  const filters = [
    { key: 'all', label: 'Hammasi', emoji: '📋' },
    { key: 'today', label: 'Bugun', emoji: '📆' },
    { key: 'week', label: 'Hafta', emoji: '🗓️' },
  ];

  const header = (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerEmoji}>🎯</Text>
          <View>
            <Text style={styles.headerTitle}>Faoliyatlar</Text>
            <Text style={styles.headerSubtitle}>
              {filteredActivities.length} ta faoliyat
            </Text>
          </View>
        </View>
        <View style={styles.headerRight} />
      </LinearGradient>
    </View>
  );

  return (
    <Screen
      scroll={true}
      padded={true}
      header={header}
      contentStyle={styles.content}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <>
            <View style={styles.filterRow}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  width={80}
                  height={40}
                  style={{ borderRadius: tokens.radius.pill }}
                />
              ))}
            </View>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                width="100%"
                height={120}
                style={{ borderRadius: tokens.radius.lg, marginBottom: tokens.space.md }}
              />
            ))}
          </>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Filter Pills */}
            <View style={styles.filterRow}>
              {filters.map((f) => (
                <Pressable
                  key={f.key}
                  style={({ pressed }) => [
                    styles.filterPill,
                    filter === f.key && styles.filterPillActive,
                    pressed && styles.filterPillPressed,
                  ]}
                  onPress={() => setFilter(f.key)}
                >
                  <Text style={styles.filterEmoji}>{f.emoji}</Text>
                  <Text
                    style={[
                      styles.filterLabel,
                      filter === f.key && styles.filterLabelActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Activities List */}
            {filteredActivities.length === 0 ? (
              <Card style={styles.emptyCard}>
                <EmptyState
                  emoji="📭"
                  title="Faoliyat topilmadi"
                  description={
                    filter !== 'all'
                      ? "Filterni o'zgartirib ko'ring"
                      : "Yangi faoliyatlar tez orada qo'shiladi"
                  }
                />
              </Card>
            ) : (
              <View style={styles.list}>
                {filteredActivities.map((item, index) => {
                  const emoji = getActivityEmoji(item);
                  const hasProgress = item.progress !== undefined;
                  const progress = item.progress || 0;

                  return (
                    <Card key={item.id || index} style={styles.activityCard}>
                      <View style={styles.activityHeader}>
                        <View style={styles.activityIconContainer}>
                          <Text style={styles.activityEmoji}>{emoji}</Text>
                        </View>
                        <View style={styles.activityInfo}>
                          <Text style={styles.activityTitle} numberOfLines={2}>
                            {item.title || item.skill || item.description || "Faoliyat"}
                          </Text>
                          {item.description && item.title && (
                            <Text style={styles.activityDescription} numberOfLines={2}>
                              {item.description}
                            </Text>
                          )}
                        </View>
                        <View style={styles.activityMeta}>
                          <Text style={styles.activityDate}>
                            {formatDate(item.date || item.createdAt)}
                          </Text>
                          {item.createdAt && (
                            <Text style={styles.activityTime}>
                              {formatTime(item.createdAt)}
                            </Text>
                          )}
                        </View>
                      </View>

                      {hasProgress && (
                        <View style={styles.progressSection}>
                          <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Rivojlanish</Text>
                            <View style={styles.progressBadge}>
                              <Text style={styles.progressValue}>{progress}%</Text>
                            </View>
                          </View>
                          <AnimatedProgress progress={progress} delay={index * 100} />
                        </View>
                      )}

                      {item.status && (
                        <View style={styles.statusContainer}>
                          <View
                            style={[
                              styles.statusBadge,
                              item.status === 'completed' && styles.statusCompleted,
                              item.status === 'in_progress' && styles.statusInProgress,
                            ]}
                          >
                            <Text style={styles.statusText}>
                              {item.status === 'completed'
                                ? '✅ Tugallandi'
                                : item.status === 'in_progress'
                                ? "🔄 Davom etmoqda"
                                : item.status}
                            </Text>
                          </View>
                        </View>
                      )}
                    </Card>
                  );
                })}
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: tokens.space.md,
  },
  headerContainer: {
    overflow: 'hidden',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.md,
    paddingTop: tokens.space.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: tokens.space.md,
    gap: tokens.space.sm,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: tokens.type.caption.fontSize,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: tokens.radius.pill,
    gap: tokens.space.xs,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...tokens.shadow.xs,
  },
  filterPillActive: {
    backgroundColor: tokens.colors.accent.blue,
    borderColor: tokens.colors.accent.blue,
  },
  filterPillPressed: {
    transform: [{ scale: 0.97 }],
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterLabel: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.secondary,
  },
  filterLabelActive: {
    color: '#fff',
  },
  list: {
    gap: tokens.space.md,
    paddingBottom: tokens.space.xl,
  },
  activityCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    ...tokens.shadow.soft,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.colors.joy.lavenderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs,
  },
  activityDescription: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    lineHeight: 18,
  },
  activityMeta: {
    alignItems: 'flex-end',
  },
  activityDate: {
    fontSize: tokens.type.caption.fontSize,
    fontWeight: '600',
    color: tokens.colors.accent.blue,
  },
  activityTime: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.muted,
    marginTop: 2,
  },
  progressSection: {
    marginTop: tokens.space.md,
    paddingTop: tokens.space.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.sm,
  },
  progressLabel: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
  },
  progressBadge: {
    backgroundColor: tokens.colors.semantic.successSoft,
    paddingHorizontal: tokens.space.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.pill,
  },
  progressValue: {
    fontSize: tokens.type.caption.fontSize,
    fontWeight: '700',
    color: tokens.colors.semantic.success,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
  },
  statusContainer: {
    marginTop: tokens.space.md,
    paddingTop: tokens.space.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: tokens.space.sm,
    paddingVertical: tokens.space.xs,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.text.muted + '20',
  },
  statusCompleted: {
    backgroundColor: tokens.colors.semantic.successSoft,
  },
  statusInProgress: {
    backgroundColor: tokens.colors.semantic.warningSoft,
  },
  statusText: {
    fontSize: tokens.type.caption.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.secondary,
  },
  emptyCard: {
    marginTop: tokens.space.xl,
  },
});
