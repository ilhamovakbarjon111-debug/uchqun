import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TouchableOpacity, AppState, Animated, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useNotification } from '../../context/NotificationContext';
import { parentService } from '../../services/parentService';
import { api } from '../../services/api';
import { GlassCard } from '../../components/teacher/GlassCard';
import { StatCard } from '../../components/teacher/StatCard';
import { DashboardHeader } from '../../components/parent/DashboardHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import tokens from '../../styles/tokens';

export function ParentDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { count = 0, refreshNotifications } = useNotification();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activities: 0,
    meals: 0,
    media: 0,
    therapies: 0,
  });
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);

  // Bottom nav height + safe area + padding
  const BOTTOM_NAV_HEIGHT = 75;
  const bottomPadding = BOTTOM_NAV_HEIGHT + insets.bottom + 16;

  // Calculate card width for 2-column grid
  const screenWidth = Dimensions.get('window').width;
  const padding = tokens.space.lg * 2; // Left + right padding
  const gap = tokens.space.md;
  const cardWidth = (screenWidth - padding - gap) / 2;

  useEffect(() => {
    loadData();
  }, []);

  // Real-time data loading - reload when screen is focused or child changes
  useFocusEffect(
    useCallback(() => {
      loadData();

      // Set up auto-refresh every 30 seconds when screen is focused
      const interval = setInterval(() => {
        loadData();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }, [selectedChildId])
  );

  // Auto-refresh when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        loadData(); // Refresh when app becomes active
      }
    });

    return () => subscription?.remove();
  }, [selectedChildId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load data like website: get children first, then load stats for selected child
      const childrenData = await parentService.getChildren().catch(() => []);
      const children = Array.isArray(childrenData) ? childrenData : [];
      setChildren(children);
      
      // Select first child if available
      if (children.length > 0 && !selectedChildId) {
        setSelectedChildId(children[0].id);
      }

      // If we have a selected child, load REAL-TIME stats for that child (no limit for accurate count)
      if (selectedChildId || (children.length > 0 && children[0].id)) {
        const childId = selectedChildId || children[0].id;
        
        // Get full counts (no limit) for real-time statistics like website
        const [activitiesRes, mealsRes, mediaRes, therapiesRes] = await Promise.all([
          parentService.getActivities({ childId }).catch(() => []), // No limit = get all for accurate count
          parentService.getMeals({ childId }).catch(() => []), // No limit = get all for accurate count
          parentService.getMedia({ childId }).catch(() => []), // No limit = get all for accurate count
          api.get('/therapy', { params: { isActive: true } }).catch(() => ({ data: { data: { therapies: [] } } })),
        ]);

        const activities = Array.isArray(activitiesRes) ? activitiesRes : (activitiesRes?.activities || []);
        const meals = Array.isArray(mealsRes) ? mealsRes : (mealsRes?.meals || []);
        const media = Array.isArray(mediaRes) ? mediaRes : (mediaRes?.media || []);
        const therapiesData = therapiesRes?.data?.data?.therapies || therapiesRes?.data?.data || therapiesRes?.data?.therapies || [];
        const therapies = Array.isArray(therapiesData) ? therapiesData : [];

        setStats({
          activities: Array.isArray(activities) ? activities.length : 0,
          meals: Array.isArray(meals) ? meals.length : 0,
          media: Array.isArray(media) ? media.length : 0,
          therapies: Array.isArray(therapies) ? therapies.length : 0,
        });
      } else {
        setStats({
          activities: 0,
          meals: 0,
          media: 0,
          therapies: 0,
        });
      }
      
      // Refresh notifications after loading data
      if (refreshNotifications) {
        refreshNotifications();
      }
    } catch (error) {
      console.error('[ParentDashboard] Fatal error loading dashboard:', error);
      setChildren([]);
      setStats({
        activities: 0,
        meals: 0,
        media: 0,
        therapies: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DashboardHeader />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Grid - 2x2 grid */}
        <View style={styles.statsGrid}>
          <View style={{ width: cardWidth }}>
            <StatCard
              icon="checkmark-circle"
              iconColor={tokens.colors.semantic.success}
              iconBg={tokens.colors.semantic.successSoft}
              count={stats.activities}
              label={t('dashboard.individualPlan', { defaultValue: 'Individual Plan' }) || t('dashboard.activities', { defaultValue: 'Activities' })}
              onPress={() => navigation.navigate('Activities')}
            />
          </View>
          <View style={{ width: cardWidth }}>
            <StatCard
              icon="restaurant"
              iconColor={tokens.colors.semantic.warning}
              iconBg={tokens.colors.semantic.warningSoft}
              count={stats.meals}
              label={t('dashboard.meals', { defaultValue: 'Meals' })}
              onPress={() => navigation.navigate('Meals')}
            />
          </View>
          <View style={{ width: cardWidth }}>
            <StatCard
              icon="images"
              iconColor={tokens.colors.joy.lavender}
              iconBg={tokens.colors.joy.lavenderSoft}
              count={stats.media}
              label={t('dashboard.media', { defaultValue: 'Media' })}
              onPress={() => navigation.navigate('Media')}
            />
          </View>
          <View style={{ width: cardWidth }}>
            <StatCard
              icon="musical-notes"
              iconColor={tokens.colors.joy.coral}
              iconBg={tokens.colors.joy.coralSoft}
              count={stats.therapies}
              label={t('therapy.title', { defaultValue: 'Therapy' })}
              onPress={() => navigation.navigate('Therapy')}
            />
          </View>
        </View>

        {/* Children Section */}
        {children.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('dashboard.myChildren', { defaultValue: 'My Children' })}
            </Text>
            <View style={styles.childrenList}>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  onPress={() => {
                    setSelectedChildId(child.id);
                    navigation.navigate('ChildProfile', { childId: child.id });
                  }}
                >
                  <GlassCard style={styles.childCard}>
                    <View style={styles.childCardContent}>
                      <View style={[styles.childAvatar, { backgroundColor: tokens.colors.accent.blue + '20' }]}>
                        <Text style={styles.childAvatarText}>
                          {child.firstName?.charAt(0) || ''}{child.lastName?.charAt(0) || ''}
                        </Text>
                      </View>
                      <View style={styles.childInfo}>
                        <Text style={styles.childName} numberOfLines={1}>
                          {child.firstName} {child.lastName}
                        </Text>
                        {child.dateOfBirth && (
                          <View style={styles.childAgeContainer}>
                            <Ionicons name="calendar-outline" size={12} color={tokens.colors.text.secondary} />
                            <Text style={styles.childAge}>
                              {new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear()} {t('dashboard.yearsOld', { defaultValue: 'years old' })}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color={tokens.colors.text.tertiary} 
                      />
                    </View>
                  </GlassCard>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.space.lg,
  },
  // Stats Grid - 2x2 grid layout
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space.md,
    marginBottom: tokens.space.xl,
    marginTop: tokens.space.md,
  },
  // Section
  section: {
    marginBottom: tokens.space.xl,
  },
  sectionTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.md,
    paddingHorizontal: 2,
  },
  // Children List
  childrenList: {
    gap: tokens.space.md,
  },
  childCard: {
    marginBottom: tokens.space.sm,
  },
  childCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.md,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.sm,
  },
  childAvatarText: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.accent.blue,
  },
  childInfo: {
    flex: 1,
    minWidth: 0,
  },
  childName: {
    fontSize: tokens.type.bodyLarge.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs / 2,
  },
  childAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs / 2,
  },
  childAge: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
  },
});
