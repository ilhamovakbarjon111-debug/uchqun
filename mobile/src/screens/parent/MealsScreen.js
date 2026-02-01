import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { parentService } from '../../services/parentService';
import { mealService } from '../../services/mealService';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

// Meal type to emoji and color mapping
const MEAL_CONFIG = {
  breakfast: {
    emoji: '🥞',
    label: 'Nonushta',
    color: tokens.colors.joy.sunflower,
    bgColor: tokens.colors.joy.sunflowerSoft,
  },
  lunch: {
    emoji: '🍱',
    label: 'Tushlik',
    color: tokens.colors.joy.peach,
    bgColor: tokens.colors.joy.peachSoft,
  },
  dinner: {
    emoji: '🍝',
    label: 'Kechki ovqat',
    color: tokens.colors.joy.lavender,
    bgColor: tokens.colors.joy.lavenderSoft,
  },
  snack: {
    emoji: '🍎',
    label: 'Gazak',
    color: tokens.colors.joy.coral,
    bgColor: tokens.colors.joy.coralSoft,
  },
  drink: {
    emoji: '🥤',
    label: 'Ichimlik',
    color: tokens.colors.joy.sky,
    bgColor: tokens.colors.joy.skySoft,
  },
  default: {
    emoji: '🍽️',
    label: 'Ovqat',
    color: tokens.colors.joy.mint,
    bgColor: tokens.colors.joy.mintSoft,
  },
};

const getMealConfig = (mealType) => {
  const type = (mealType || '').toLowerCase();
  for (const [key, config] of Object.entries(MEAL_CONFIG)) {
    if (type.includes(key)) {
      return config;
    }
  }
  return MEAL_CONFIG.default;
};

export function MealsScreen() {
  const navigation = useNavigation();
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [meals, setMeals] = useState([]);
  const [filter, setFilter] = useState('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadChildren = async () => {
      try {
        const list = await parentService.getChildren();
        const arr = Array.isArray(list) ? list : [];
        setChildren(arr);
        if (arr.length > 0 && !selectedChildId) {
          setSelectedChildId(arr[0].id);
        }
      } catch (error) {
        setChildren([]);
      }
    };
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      loadMeals();
    } else {
      setMeals([]);
      setLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const loadMeals = async () => {
    if (!selectedChildId) {
      setMeals([]);
      return;
    }
    try {
      setLoading(true);
      const data = await mealService.getMeals({ childId: selectedChildId });
      setMeals(Array.isArray(data) ? data : []);
    } catch (error) {
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeals();
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes(':')) {
      return timeString;
    }
    const date = new Date(timeString);
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

  const filteredMeals =
    filter === 'all'
      ? meals
      : meals.filter((m) => isToday(m.date || m.createdAt));

  // Group meals by date
  const groupedMeals = filteredMeals.reduce((groups, meal) => {
    const dateKey = formatDate(meal.date || meal.createdAt);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(meal);
    return groups;
  }, {});

  const filters = [
    { key: 'all', label: 'Hammasi', emoji: '📋' },
    { key: 'today', label: 'Bugun', emoji: '📆' },
  ];

  const header = (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[tokens.colors.semantic.warning, tokens.colors.joy.peach]}
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
          <View style={styles.headerEmojiContainer}>
            <Text style={styles.headerEmoji}>🍽️</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Ovqatlanish</Text>
            <Text style={styles.headerSubtitle}>
              {filteredMeals.length} ta yozuv
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
              {[1, 2].map((i) => (
                <Skeleton
                  key={i}
                  width={90}
                  height={40}
                  style={{ borderRadius: tokens.radius.pill }}
                />
              ))}
            </View>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                width="100%"
                height={100}
                style={{ borderRadius: tokens.radius.lg, marginBottom: tokens.space.md }}
              />
            ))}
          </>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Child selector (same API as web: filter by childId) */}
            {children.length > 1 && (
              <View style={styles.childRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.childRowContent}>
                  {children.map((c) => (
                    <Pressable
                      key={c.id}
                      style={[
                        styles.childPill,
                        selectedChildId === c.id && styles.childPillActive,
                      ]}
                      onPress={() => setSelectedChildId(c.id)}
                    >
                      <Text
                        style={[
                          styles.childPillText,
                          selectedChildId === c.id && styles.childPillTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {c.firstName} {c.lastName}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
            {children.length === 0 && !loading && (
              <Card style={styles.emptyCard}>
                <EmptyState
                  emoji="👶"
                  title="Farzand tanlang"
                  description="Farzand qo'shilgach ovqat yozuvlari ko'rinadi"
                />
              </Card>
            )}
            {children.length > 0 && (
            <>
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

            {/* Nutrition Summary */}
            {filteredMeals.length > 0 && (
              <Card style={styles.summaryCard} variant="elevated" shadow="soft">
                <LinearGradient
                  colors={[tokens.colors.semantic.warning + '20', tokens.colors.joy.peach + '15']}
                  style={styles.summaryGradient}
                >
                  <Text style={styles.summaryTitle}>Kunlik xulosasi</Text>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <View style={[styles.summaryIcon, { backgroundColor: tokens.colors.accent.blue + '20' }]}>
                        <Text style={styles.summaryEmoji}>🍽️</Text>
                      </View>
                      <Text style={styles.summaryValue}>{filteredMeals.length}</Text>
                      <Text style={styles.summaryLabel}>Jami</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                      <View style={[styles.summaryIcon, { backgroundColor: tokens.colors.semantic.successSoft }]}>
                        <Text style={styles.summaryEmoji}>✅</Text>
                      </View>
                      <Text style={styles.summaryValue}>{filteredMeals.filter((m) => m.eaten).length}</Text>
                      <Text style={styles.summaryLabel}>Yeyilgan</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                      <View style={[styles.summaryIcon, { backgroundColor: tokens.colors.semantic.errorSoft }]}>
                        <Text style={styles.summaryEmoji}>❌</Text>
                      </View>
                      <Text style={styles.summaryValue}>{filteredMeals.filter((m) => !m.eaten).length}</Text>
                      <Text style={styles.summaryLabel}>Tashlab yuborilgan</Text>
                    </View>
                  </View>
                </LinearGradient>
              </Card>
            )}

            {/* Meals List */}
            {filteredMeals.length === 0 ? (
              <Card style={styles.emptyCard}>
                <EmptyState
                  emoji="🍽️"
                  title="Ovqat yozuvlari topilmadi"
                  description={
                    filter !== 'all'
                      ? "Filterni o'zgartirib ko'ring"
                      : "Ovqatlanish yozuvlari tez orada qo'shiladi"
                  }
                />
              </Card>
            ) : (
              <View style={styles.list}>
                {Object.entries(groupedMeals).map(([date, dateMeals]) => (
                  <View key={date} style={styles.dateGroup}>
                    <View style={styles.dateHeader}>
                      <Text style={styles.dateLabel}>{date}</Text>
                      <View style={styles.dateLine} />
                    </View>
                    {dateMeals.map((item, index) => {
                      const config = getMealConfig(item.mealType);
                      return (
                        <Card
                          key={item.id || index}
                          style={styles.mealCard}
                          variant="elevated"
                          shadow="soft"
                        >
                          <View style={styles.mealRow}>
                            <LinearGradient
                              colors={[config.bgColor, config.bgColor + 'CC']}
                              style={styles.mealIconContainer}
                            >
                              <Text style={styles.mealEmoji}>{config.emoji}</Text>
                            </LinearGradient>
                            <View style={styles.mealInfo}>
                              <Text style={styles.mealType}>
                                {item.mealType || config.label}
                              </Text>
                              {item.notes && (
                                <Text style={styles.mealNotes} numberOfLines={2}>
                                  {item.notes}
                                </Text>
                              )}
                              {item.items && Array.isArray(item.items) && (
                                <View style={styles.mealItems}>
                                  {item.items.slice(0, 3).map((food, i) => (
                                    <View key={i} style={styles.foodTag}>
                                      <Text style={styles.foodTagText}>{food}</Text>
                                    </View>
                                  ))}
                                  {item.items.length > 3 && (
                                    <Text style={styles.moreItems}>
                                      +{item.items.length - 3}
                                    </Text>
                                  )}
                                </View>
                              )}
                            </View>
                            <View style={styles.mealMeta}>
                              {item.time && (
                                <View style={styles.timeContainer}>
                                  <Ionicons
                                    name="time-outline"
                                    size={12}
                                    color={tokens.colors.text.muted}
                                  />
                                  <Text style={styles.mealTime}>
                                    {formatTime(item.time)}
                                  </Text>
                                </View>
                              )}
                              {item.eaten !== undefined && (
                                <View
                                  style={[
                                    styles.eatenBadge,
                                    item.eaten
                                      ? styles.eatenYes
                                      : styles.eatenNo,
                                  ]}
                                >
                                  <Text style={styles.eatenText}>
                                    {item.eaten ? '✅' : '❌'}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </Card>
                      );
                    })}
                  </View>
                ))}
              </View>
            )}
            </>
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
  childRow: {
    marginBottom: tokens.space.lg,
  },
  childRowContent: {
    gap: tokens.space.sm,
    paddingVertical: tokens.space.xs,
  },
  childPill: {
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.card.base,
    borderWidth: 2,
    borderColor: tokens.colors.border.light,
  },
  childPillActive: {
    backgroundColor: tokens.colors.semantic.warning,
    borderColor: tokens.colors.semantic.warning,
  },
  childPillText: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.secondary,
  },
  childPillTextActive: {
    color: '#fff',
  },
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.sm,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: tokens.space.md,
    gap: tokens.space.md,
  },
  headerEmojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEmoji: {
    fontSize: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: tokens.type.caption.fontSize,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: tokens.type.sub.fontWeight,
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
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.md,
    backgroundColor: tokens.colors.card.base,
    borderRadius: tokens.radius.pill,
    gap: tokens.space.sm,
    borderWidth: 2,
    borderColor: tokens.colors.border.light,
    ...tokens.shadow.sm,
  },
  filterPillActive: {
    backgroundColor: tokens.colors.semantic.warning,
    borderColor: tokens.colors.semantic.warning,
    ...tokens.shadow.soft,
  },
  filterPillPressed: {
    transform: [{ scale: 0.96 }],
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
    paddingBottom: tokens.space.xl,
  },
  dateGroup: {
    marginBottom: tokens.space.lg,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.space.md,
    gap: tokens.space.sm,
  },
  dateLabel: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dateLine: {
    flex: 1,
    height: 2,
    backgroundColor: tokens.colors.border.light,
    borderRadius: 1,
  },
  mealCard: {
    marginBottom: tokens.space.md,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space.md,
  },
  mealIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.sm,
  },
  mealEmoji: {
    fontSize: 26,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs,
    textTransform: 'capitalize',
  },
  mealNotes: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    lineHeight: 18,
  },
  mealItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space.xs,
    marginTop: tokens.space.sm,
  },
  foodTag: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: tokens.space.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
  },
  foodTagText: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.secondary,
  },
  moreItems: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.muted,
    alignSelf: 'center',
    marginLeft: tokens.space.xs,
  },
  mealMeta: {
    alignItems: 'flex-end',
    gap: tokens.space.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mealTime: {
    fontSize: tokens.type.caption.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.muted,
  },
  eatenBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eatenYes: {
    backgroundColor: tokens.colors.semantic.successSoft,
  },
  eatenNo: {
    backgroundColor: tokens.colors.semantic.errorSoft,
  },
  eatenText: {
    fontSize: 14,
  },
  emptyCard: {
    marginTop: tokens.space.xl,
  },
  summaryCard: {
    marginBottom: tokens.space.lg,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: tokens.space.lg,
    borderRadius: tokens.radius.lg,
  },
  summaryTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.space.xs,
  },
  summaryEmoji: {
    fontSize: 18,
  },
  summaryValue: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.primary,
  },
  summaryLabel: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.secondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 48,
    backgroundColor: tokens.colors.border.light,
  },
});
