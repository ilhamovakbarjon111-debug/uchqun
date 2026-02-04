import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { teacherService } from '../../services/teacherService';
import { api } from '../../services/api';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import Screen from '../../components/layout/Screen';
import tokens from '../../styles/tokens';

export function TeacherDashboardScreen() {
  const { user, isTeacher, isAdmin, isReception } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [children, setChildren] = useState([]);
  const [parentsData, setParentsData] = useState([]);

  // Animation refs
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(30)).current;
  const statsFadeAnim = useRef(new Animated.Value(0)).current;
  const statsSlideAnim = useRef(new Animated.Value(20)).current;

  // Entrance animations
  useEffect(() => {
    Animated.stagger(150, [
      // Header animation
      Animated.parallel([
        Animated.timing(headerFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(headerSlideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Stats animation
      Animated.parallel([
        Animated.timing(statsFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(statsSlideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Helper for safe navigation
  const safeNavigate = (screenName, params = {}) => {
    try {
      navigation.navigate(screenName, params);
    } catch (error) {
      console.error(`[TeacherDashboard] Navigation error to ${screenName}:`, error);
    }
  };

  const safeNavigateToTab = (tabName) => {
    try {
      navigation.navigate('TeacherTabs', { screen: tabName });
    } catch (error) {
      console.error(`[TeacherDashboard] Navigation error to tab ${tabName}:`, error);
    }
  };

  useEffect(() => {
    // CRITICAL FIX: Only load data if user is actually a teacher
    // Admin/Reception might not have access to teacher services
    if (isTeacher) {
      loadData();
    } else {
      console.warn('[TeacherDashboard] User is not a teacher, skipping data load. Role:', user?.role);
      setLoading(false);
    }
  }, [isTeacher]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load data like website: get parents, then count activities, meals, media for their children
      const parentsRes = await teacherService.getParents().catch(() => []);
      const allParents = Array.isArray(parentsRes) ? parentsRes : [];
      const parents = user?.id ? allParents.filter((p) => p.teacherId === user.id) : allParents;
      const childIds = parents.flatMap((p) => Array.isArray(p.children) ? p.children.map(c => c.id) : []).filter(Boolean);

      // Fetch counts for activities, meals, media (like website)
      const fetchCount = async (path) => {
        try {
          if (childIds.length > 0) {
            const requests = childIds.map((id) =>
              api.get(`${path}?childId=${id}`).catch(() => ({ data: [] }))
            );
            const responses = await Promise.all(requests);
            return responses.reduce((acc, res) => {
              const data = res.data;
              if (Array.isArray(data)) return acc + data.length;
              if (Array.isArray(data?.activities)) return acc + data.activities.length;
              if (Array.isArray(data?.meals)) return acc + data.meals.length;
              if (Array.isArray(data?.media)) return acc + data.media.length;
              return acc;
            }, 0);
          } else {
            const res = await api.get(path).catch(() => ({ data: [] }));
            const data = res.data;
            if (Array.isArray(data)) return data.length;
            if (Array.isArray(data?.activities)) return data.activities.length;
            if (Array.isArray(data?.meals)) return data.meals.length;
            if (Array.isArray(data?.media)) return data.media.length;
            return 0;
          }
        } catch (err) {
          console.warn(`[TeacherDashboard] Error fetching ${path}:`, err);
          return 0;
        }
      };

      const [activitiesCount, mealsCount, mediaCount] = await Promise.all([
        fetchCount('/activities'),
        fetchCount('/meals'),
        fetchCount('/media'),
      ]);

      setStats({
        parents: parents.length,
        activities: activitiesCount,
        meals: mealsCount,
        media: mediaCount,
      });

      setParentsData(allParents);
      setTasks([]); // Remove tasks section
      setChildren([]); // Remove children ranking section
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setStats({
        parents: 0,
        activities: 0,
        meals: 0,
        media: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // CRITICAL FIX: Show fallback UI for admin/reception users
  if (!isTeacher && (isAdmin || isReception)) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Card>
            <View style={{ padding: tokens.space.xl, alignItems: 'center' }}>
              <Ionicons name="information-circle-outline" size={48} color={tokens.colors.accent.blue} />
              <Text style={{ marginTop: tokens.space.md, fontSize: tokens.type.body.fontSize, color: tokens.colors.text.secondary, textAlign: 'center' }}>
                {isAdmin ? t('dashboard.roleAdminLabel') : t('dashboard.roleReceptionLabel')} {t('dashboard.roleDetected')}{'\n'}
                {t('dashboard.mobileForTeachersParents')}{'\n'}
                {t('dashboard.pleaseUseWeb', { role: isAdmin ? t('dashboard.roleAdminLabel') : t('dashboard.roleReceptionLabel') })}
              </Text>
            </View>
          </Card>
        </ScrollView>
      </View>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const role = (user?.role || '').toLowerCase();
  const getRoleText = () => {
    if (role === 'admin') return t('dashboard.roleAdmin') || 'My Role: Admin';
    if (role === 'teacher') return t('dashboard.roleTeacher') || 'My Role: Teacher';
    return t('dashboard.roleTeacher') || 'My Role: Teacher';
  };

  const statCards = [
    {
      title: t('dashboard.activities'),
      value: stats?.activities || 0,
      icon: 'checkmark-circle',
      color: tokens.colors.semantic.success,
      onPress: () => safeNavigate('Activities'),
    },
    {
      title: t('dashboard.meals'),
      value: stats?.meals || 0,
      icon: 'restaurant',
      color: tokens.colors.semantic.warning,
      onPress: () => safeNavigate('Meals'),
    },
    {
      title: t('dashboard.media'),
      value: stats?.media || 0,
      icon: 'images',
      color: '#8b5cf6',
      onPress: () => safeNavigate('Media'),
    },
    {
      title: t('dashboard.monitoring') || 'Monitoring',
      value: null,
      icon: 'heart',
      color: (tokens.colors.joy && tokens.colors.joy.coral) ? tokens.colors.joy.coral : '#FF6B6B',
      onPress: () => safeNavigate('MonitoringJournal'),
    },
  ];

  const header = (
    <View style={styles.topBar}>
      <View style={styles.placeholder} />
      <Text style={styles.topBarTitle} allowFontScaling={true}>{t('nav.dashboard')}</Text>
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0EA5E9', '#06B6D4', '#0284C7']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Screen scroll={true} padded={false} header={header} background="transparent">
        {/* Stats Cards - Semi-transparent cards */}
        <Animated.View
          style={[
            styles.overviewSection,
            {
              opacity: statsFadeAnim,
              transform: [{ translateY: statsSlideAnim }],
            },
          ]}
        >
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
                <View style={styles.statCardInner}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                    style={styles.statCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.statCardContent}>
                      <View style={[styles.statIconContainer, { backgroundColor: stat.color + '15' }]}>
                        <Ionicons name={stat.icon} size={24} color={stat.color} />
                      </View>
                      <View style={styles.statTextContainer}>
                        <Text style={styles.statValue} allowFontScaling={true}>
                          {stat.value != null && stat.value !== '' ? stat.value : '—'}
                        </Text>
                        <Text style={styles.statTitle} allowFontScaling={true}>{stat.title}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
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
    color: tokens.colors.text.white,
  },
  // Header Card - Semi-transparent with gradient
  headerCard: {
    marginHorizontal: tokens.space.md,
    marginTop: tokens.space.md,
    marginBottom: tokens.space.lg,
    borderRadius: tokens.radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerCardGradient: {
    padding: tokens.space.lg,
    borderRadius: tokens.radius.xl,
  },
  headerContent: {
    width: '100%',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: tokens.space.sm,
    paddingVertical: tokens.space.xs,
    borderRadius: tokens.radius.sm,
    gap: tokens.space.xs / 2,
    marginBottom: tokens.space.sm,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.white,
    fontWeight: tokens.type.h3.fontWeight,
  },
  greetingText: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.white,
    opacity: 0.9,
    marginBottom: tokens.space.xs / 2,
  },
  nameText: {
    fontSize: tokens.type.h1.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.white,
  },
  // Overview Section
  overviewSection: {
    paddingHorizontal: tokens.space.md,
    marginBottom: tokens.space.xl,
  },
  sectionTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.white,
    marginBottom: tokens.space.md,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsContainer: {
    flexDirection: 'column',
    gap: tokens.space.md,
  },
  statCard: {
    width: '100%',
  },
  statCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  statCardInner: {
    width: '100%',
    minHeight: 80,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardGradient: {
    padding: tokens.space.md,
    borderRadius: tokens.radius.lg,
    minHeight: 80,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: tokens.type.h1.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs / 2,
  },
  statTitle: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.type.h3.fontWeight,
  },
  // Ranking Section
  rankingSection: {
    marginTop: tokens.space.lg,
    paddingHorizontal: tokens.space.md,
  },
  rankingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.md,
  },
  viewAllText: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.accent.blue,
    fontWeight: tokens.typography.fontWeight.semibold,
  },
  rankingList: {
    gap: tokens.space.sm,
  },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.card.base,
    padding: tokens.space.md,
    borderRadius: tokens.radius.md,
    ...tokens.shadow.sm,
  },
  rankingNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.accent[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
  },
  rankingNumberText: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.accent.blue,
  },
  rankingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
  },
  rankingAvatarText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.accent.blue,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs / 2,
  },
  rankingAge: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
  },
  // Tasks Section
  tasksSection: {
    paddingHorizontal: tokens.space.md,
    paddingTop: tokens.space.lg,
    marginTop: tokens.space.md,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.md,
  },
  tasksProgress: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  tasksList: {
    gap: tokens.space.sm,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.card.base,
    borderRadius: tokens.radius.md,
    padding: tokens.space.md,
    ...tokens.shadow.sm,
  },
  taskIcon: {
    marginRight: tokens.space.md,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs / 2,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: tokens.colors.text.secondary,
  },
  taskTime: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
  },
});
