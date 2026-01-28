import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TouchableOpacity, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useNotification } from '../../context/NotificationContext';
import { parentService } from '../../services/parentService';
import { api } from '../../services/api';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import BackgroundScene from '../../components/layout/BackgroundScene';
import Screen from '../../components/layout/Screen';
import tokens from '../../styles/tokens';
import { LinearGradient } from 'expo-linear-gradient';

export function ParentDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { count = 0, refreshNotifications } = useNotification();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);

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

  useEffect(() => {
    loadData();
  }, [selectedChildId]); // Reload when child selection changes

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
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }


  const statCards = [
    {
      title: t('dashboard.individualPlan') || t('dashboard.activities'),
      value: stats?.activities || 0,
      icon: 'checkmark-circle',
      color: tokens.colors.semantic.success,
      onPress: () => navigation.navigate('Activities'),
    },
    {
      title: t('dashboard.meals'),
      value: stats?.meals || 0,
      icon: 'restaurant',
      color: tokens.colors.semantic.warning,
      onPress: () => navigation.navigate('Meals'),
    },
    {
      title: t('dashboard.media'),
      value: stats?.media || 0,
      icon: 'images',
      color: '#8b5cf6',
      onPress: () => navigation.navigate('Media'),
    },
    {
      title: t('therapy.title', { defaultValue: 'Terapiya' }),
      value: stats?.therapies || 0,
      icon: 'musical-notes',
      color: tokens.colors.joy.lavender,
      onPress: () => navigation.navigate('Therapy'),
    },
  ];

  const header = (
    <View style={styles.topBar}>
      <View style={styles.placeholder} />
      <Text style={styles.topBarTitle} allowFontScaling={true}>{t('dashboard.overview')}</Text>
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <Screen scroll={true} padded={false} header={null} background="parent">
      {/* Welcome Header Card - Premium Gradient Design */}
      <View style={styles.headerWrapper}>
        <Card 
          variant="gradient" 
          gradientColors={['#3b82f6', '#2563eb']}
          style={styles.headerCard}
          padding="xl"
        >
          {/* Notifications Icon in Top Right Corner - Like Web */}
          <Pressable
            style={styles.notificationButton}
            onPress={() => {
              if (refreshNotifications) refreshNotifications();
              navigation.navigate('Notifications');
            }}
          >
            <View style={styles.notificationIconContainer}>
              <Ionicons name="notifications" size={20} color="#fff" />
              {count > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {count > 9 ? '9+' : count}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>

          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Text style={styles.roleText}>{t('dashboard.roleParent', { defaultValue: 'Mening rolim: Ota-ona' })}</Text>
            </View>
            <Text style={styles.greetingText}>{t('dashboard.welcome')}</Text>
            <Text style={styles.nameText} allowFontScaling={true}>
              {user?.firstName || ''} {user?.lastName || ''}
            </Text>
          </View>
        </Card>
      </View>

      {/* Overview Cards - Modern Grid Design */}
      <View style={styles.statsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} allowFontScaling={true}>{t('dashboard.overview')}</Text>
        </View>
        <View style={styles.statsContainer}>
          {statCards.map((stat, index) => (
            <Pressable 
              key={index} 
              onPress={stat.onPress}
              style={({ pressed }) => [
                styles.statCard,
                pressed && styles.statCardPressed,
              ]}
            >
              <Card style={styles.statCardInner} variant="elevated" padding="lg" shadow="soft">
                <View style={styles.statCardContent}>
                  {/* Modern Icon Container with Gradient */}
                  <LinearGradient
                    colors={getIconGradientColors(stat.color)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statIconGradient}
                  >
                    <Ionicons name={stat.icon} size={26} color={stat.color} />
                  </LinearGradient>
                  
                  <View style={styles.statTextContainer}>
                    <Text style={styles.statValue} allowFontScaling={true}>{stat.value}</Text>
                    <Text style={styles.statTitle} allowFontScaling={true} numberOfLines={2}>{stat.title}</Text>
                  </View>
                  
                  <View style={styles.statChevronContainer}>
                    <Ionicons 
                      name="chevron-forward" 
                      size={18} 
                      color={tokens.colors.text.tertiary} 
                    />
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Child Selector - Enhanced Design */}
      {children.length > 0 && (
        <View style={styles.childrenSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} allowFontScaling={true}>{t('dashboard.myChildren')}</Text>
            <Text style={styles.sectionSubtitle}>{children.length} {t('dashboard.children') || 'farzand'}</Text>
          </View>
          <View style={styles.childrenList}>
            {children.map((child) => (
              <Pressable
                key={child.id}
                style={({ pressed }) => [
                  styles.childCard,
                  selectedChildId === child.id && styles.childCardActive,
                  pressed && styles.childCardPressed,
                ]}
                onPress={() => {
                  setSelectedChildId(child.id);
                  navigation.navigate('ChildProfile', { childId: child.id });
                }}
              >
                <Card 
                  style={[
                    styles.childCardInner,
                    selectedChildId === child.id && styles.childCardActiveInner
                  ]} 
                  variant="elevated"
                  padding="md"
                  shadow="soft"
                >
                  <View style={styles.childCardContent}>
                    <LinearGradient
                      colors={[tokens.colors.accent.blue + '20', tokens.colors.accent.blue + '10']}
                      style={styles.childAvatar}
                    >
                      <Text style={styles.childAvatarText}>
                        {child.firstName?.charAt(0) || ''}{child.lastName?.charAt(0) || ''}
                      </Text>
                    </LinearGradient>
                    <View style={styles.childInfo}>
                      <Text style={styles.childName} allowFontScaling={true} numberOfLines={1}>
                        {child.firstName} {child.lastName}
                      </Text>
                      {child.dateOfBirth && (
                        <View style={styles.childAgeContainer}>
                          <Ionicons name="calendar-outline" size={12} color={tokens.colors.text.secondary} />
                          <Text style={styles.childAge} allowFontScaling={true}>
                            {new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear()} {t('dashboard.yearsOld')}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.childChevron}>
                      <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color={selectedChildId === child.id ? tokens.colors.accent.blue : tokens.colors.text.tertiary} 
                      />
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
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
  placeholder: {
    width: 44,
  },
  topBarTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.primary,
  },
  // Header Wrapper
  headerWrapper: {
    paddingHorizontal: tokens.space.md,
    paddingTop: tokens.space.md,
    paddingBottom: tokens.space.lg,
  },
  // Header Card - Premium Gradient Design
  headerCard: {
    borderRadius: tokens.radius['2xl'],
    ...tokens.shadow.elevated,
  },
  headerContent: {
    width: '100%',
  },
  headerTop: {
    marginBottom: tokens.space.sm,
  },
  roleText: {
    fontSize: tokens.type.sub.fontSize,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: tokens.type.body.fontWeight,
  },
  notificationButton: {
    position: 'absolute',
    top: tokens.space.lg,
    right: tokens.space.lg,
    zIndex: 10,
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  greetingText: {
    fontSize: tokens.type.body.fontSize,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: tokens.space.xs,
    fontWeight: tokens.type.body.fontWeight,
  },
  nameText: {
    fontSize: tokens.type.h1.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.white,
    letterSpacing: -0.5,
  },
  // Stats Section
  statsSection: {
    paddingHorizontal: tokens.space.md,
    marginBottom: tokens.space.xl,
  },
  sectionHeader: {
    marginBottom: tokens.space.md,
  },
  sectionTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs,
  },
  sectionSubtitle: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: tokens.space.md,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    maxWidth: '48%',
  },
  statCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  statCardInner: {
    width: '100%',
    minHeight: 120,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: tokens.space.md,
  },
  statIconGradient: {
    width: 60,
    height: 60,
    borderRadius: tokens.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.soft,
  },
  statTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs / 2,
    letterSpacing: -0.8,
  },
  statTitle: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.type.h3.fontWeight,
    lineHeight: 18,
  },
  statChevronContainer: {
    paddingLeft: tokens.space.xs,
  },
  // Children Section
  childrenSection: {
    paddingHorizontal: tokens.space.md,
    marginBottom: tokens.space['2xl'],
  },
  childrenList: {
    gap: tokens.space.md,
    marginTop: tokens.space.md,
  },
  childCard: {
    width: '100%',
  },
  childCardActive: {
    // Active state handled by border in childCardInner
  },
  childCardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  childCardInner: {
    width: '100%',
    borderWidth: 2,
    borderColor: tokens.colors.border.light,
  },
  childCardActiveInner: {
    borderColor: tokens.colors.accent.blue,
    backgroundColor: tokens.colors.accent[50] + '40',
  },
  childCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
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
    fontWeight: tokens.type.h3.fontWeight,
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
  childChevron: {
    paddingLeft: tokens.space.sm,
  },
});

// Helper function to get gradient colors for icon containers (like website)
function getIconGradientColors(baseColor) {
  // Map colors to gradient pairs like website (from-blue-50 to-blue-100)
  const gradientMap = {
    [tokens.colors.semantic.success]: ['#D1FAE5', '#A7F3D0'], // Green gradients
    [tokens.colors.semantic.warning]: ['#FEF3C7', '#FDE68A'], // Orange/Amber gradients
    '#8b5cf6': ['#EDE9FE', '#DDD6FE'], // Purple gradients
  };
  
  // Default blue gradient (most common)
  const defaultGradient = ['#DBEAFE', '#BFDBFE']; // from-blue-50 to-blue-200
  
  return gradientMap[baseColor] || defaultGradient;
}
